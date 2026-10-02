import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { getUserByClerkId, requirePlatformAdmin } from "./model/auth";
import { getEntitlement } from "./model/entitlements";
import { estimateCostUsd } from "../lib/costs";
import { getBillingMonthKey, packs, isPackId } from "../lib/plans";

const platformRole = v.union(
  v.literal("interpreter"),
  v.literal("student"),
  v.literal("organization_admin"),
  v.literal("platform_admin"),
);

const DAY_MS = 24 * 60 * 60 * 1000;

function previousMonthKey(now: Date) {
  return getBillingMonthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)));
}

/** Business overview from Convex data: users, engagement, minutes, packs, AI cost. */
export const overview = query({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);

    const now = new Date();
    const thisMonth = getBillingMonthKey(now);
    const lastMonth = previousMonthKey(now);
    const [users, sessions, charges, grants, usageEvents] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("sessions").collect(),
      ctx.db.query("usageCharges").collect(),
      ctx.db.query("minuteGrants").collect(),
      ctx.db.query("aiUsageEvents").collect(),
    ]);

    const since = (days: number) => new Date(now.getTime() - days * DAY_MS).toISOString();
    const realSessions = sessions.filter((s) => !s.id.startsWith("sess_"));
    const recent30 = realSessions.filter((s) => s.timestamp >= since(30));
    const graded = realSessions.filter((s) => s.completionStatus === "completed" || s.completionStatus === "needs_review");

    const packSales = grants.filter((grant) => grant.source === "pack");
    const packBreakdown = Object.values(packs).map((pack) => {
      const sold = packSales.filter((grant) => grant.packId === pack.id);
      return { id: pack.id, label: pack.label, priceLabel: pack.priceLabel, count: sold.length, minutes: sold.length * pack.minutes };
    });

    const costByMonth = (month: string) => {
      const events = usageEvents.filter((event) => event.billingMonth === month);
      const bySource: Record<string, { tokens: number; costUsd: number }> = {};

      for (const event of events) {
        const bucket = (bySource[event.source] ??= { tokens: 0, costUsd: 0 });
        bucket.tokens += event.totalTokens;
        bucket.costUsd += estimateCostUsd(event.source, event.promptTokens, event.completionTokens);
      }

      return {
        bySource,
        totalUsd: Object.values(bySource).reduce((sum, bucket) => sum + bucket.costUsd, 0),
      };
    };

    const minutesIn = (month: string) =>
      charges.filter((charge) => charge.billingMonth === month).reduce((sum, charge) => sum + charge.minutes, 0);

    const subscribers = users
      .filter((user) => user.subscriptionStatus !== "free")
      .map((user) => ({
        name: user.name,
        email: user.email,
        plan: user.subscriptionStatus,
        stripeStatus: user.stripeSubscriptionStatus ?? (user.stripeSubscriptionId ? "unknown" : "no subscription"),
        hasStripeCustomer: Boolean(user.stripeCustomerId),
        since: user.updatedAt,
      }));

    return {
      users: {
        total: users.length,
        last7Days: users.filter((user) => user.createdAt >= since(7)).length,
        last30Days: users.filter((user) => user.createdAt >= since(30)).length,
        onboarded: users.filter((user) => user.onboardedAt).length,
        activeLast30Days: new Set(recent30.map((s) => s.clerkId)).size,
        byPlan: {
          free: users.filter((user) => user.subscriptionStatus === "free").length,
          professional: users.filter((user) => user.subscriptionStatus === "professional").length,
          organization: users.filter((user) => user.subscriptionStatus === "organization").length,
        },
        byGoal: users.reduce<Record<string, number>>((acc, user) => {
          const key = user.practiceGoal ?? "not set";
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        }, {}),
      },
      practice: {
        attemptsLast30Days: recent30.length,
        gradedLast30Days: recent30.filter((s) => s.completionStatus === "completed" || s.completionStatus === "needs_review").length,
        abandonedLast30Days: recent30.filter((s) => s.completionStatus === "abandoned" || s.completionStatus === "in_progress").length,
        averageScore: graded.length ? Math.round(graded.reduce((sum, s) => sum + s.score, 0) / graded.length) : 0,
        minutesThisMonth: minutesIn(thisMonth),
        minutesLastMonth: minutesIn(lastMonth),
      },
      subscribers,
      packs: {
        totalSold: packSales.length,
        breakdown: packBreakdown,
        recent: packSales
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, 10)
          .map((grant) => ({
            email: users.find((user) => user.clerkId === grant.clerkId)?.email ?? grant.clerkId,
            pack: grant.packId && isPackId(grant.packId) ? packs[grant.packId].label : grant.packId,
            minutes: grant.minutes,
            createdAt: grant.createdAt,
          })),
      },
      aiCost: {
        thisMonth: costByMonth(thisMonth),
        lastMonth: costByMonth(lastMonth),
      },
    };
  },
});

/** Every user with their plan, role and recent activity. */
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);

    const [users, sessions] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("sessions").collect(),
    ]);
    const statsByUser = new Map<string, { attempts: number; lastActive: string | null }>();

    for (const session of sessions) {
      if (session.id.startsWith("sess_")) continue;
      const stats = statsByUser.get(session.clerkId) ?? { attempts: 0, lastActive: null };
      stats.attempts += 1;
      stats.lastActive = !stats.lastActive || session.timestamp > stats.lastActive ? session.timestamp : stats.lastActive;
      statsByUser.set(session.clerkId, stats);
    }

    const rows = await Promise.all(
      users.map(async (user) => {
        const entitlement = await getEntitlement(ctx, user);
        const stats = statsByUser.get(user.clerkId);

        return {
          clerkId: user.clerkId,
          name: user.name,
          email: user.email,
          role: user.role,
          plan: user.subscriptionStatus,
          practiceGoal: user.practiceGoal ?? null,
          languages: (user.languagePreferences ?? []).map((pair) => pair.targetLanguage),
          createdAt: user.createdAt,
          onboarded: Boolean(user.onboardedAt),
          attempts: stats?.attempts ?? 0,
          lastActive: stats?.lastActive ?? null,
          remainingMinutes: entitlement.remainingMinutes,
          packMinutesRemaining: entitlement.packMinutesRemaining,
        };
      }),
    );

    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
});

export const setUserRole = mutation({
  args: { clerkId: v.string(), role: platformRole },
  handler: async (ctx, args) => {
    const admin = await requirePlatformAdmin(ctx);

    if (admin.clerkId === args.clerkId && args.role !== "platform_admin") {
      throw new ConvexError("You can't remove your own admin access.");
    }

    const user = await getUserByClerkId(ctx, args.clerkId);

    if (!user) {
      throw new ConvexError("User not found.");
    }

    await ctx.db.patch(user._id, { role: args.role, updatedAt: new Date().toISOString() });
  },
});

export const grantMinutes = mutation({
  args: { clerkId: v.string(), minutes: v.number(), note: v.string() },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);

    if (!Number.isFinite(args.minutes) || args.minutes <= 0 || args.minutes > 1000) {
      throw new ConvexError("Grant between 1 and 1000 minutes.");
    }

    await ctx.db.insert("minuteGrants", {
      clerkId: args.clerkId,
      minutes: Math.round(args.minutes),
      source: "admin",
      note: args.note.slice(0, 200),
      createdAt: new Date().toISOString(),
    });
  },
});

export const listInvites = query({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);
    const invites = await ctx.db.query("invites").collect();
    return invites.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
});

export const revokeInvite = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const invites = await ctx.db
      .query("invites")
      .withIndex("by_email", (q) => q.eq("email", args.email.trim().toLowerCase()))
      .collect();

    for (const invite of invites) {
      if (invite.status === "pending") {
        await ctx.db.patch(invite._id, { status: "revoked" });
      }
    }
  },
});

/** Used by actions to authorise the caller. */
export const requireAdminInternal = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.clerkId);
    return user?.role === "platform_admin";
  },
});

export const recordInvite = internalMutation({
  args: {
    email: v.string(),
    role: platformRole,
    invitedByClerkId: v.string(),
    clerkInvitationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const pending = await ctx.db
      .query("invites")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();

    for (const invite of pending) {
      if (invite.status === "pending") {
        await ctx.db.patch(invite._id, { status: "revoked" });
      }
    }

    await ctx.db.insert("invites", {
      email,
      role: args.role,
      status: "pending",
      invitedByClerkId: args.invitedByClerkId,
      clerkInvitationId: args.clerkInvitationId,
      createdAt: new Date().toISOString(),
    });

    // If they already have an account, apply the role straight away.
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    return { existingUser: Boolean(existing) };
  },
});
