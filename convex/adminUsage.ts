import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { getUserByClerkId, requirePlatformAdmin } from "./model/auth";
import { getEntitlement } from "./model/entitlements";
import { bumpUsage } from "./model/usageRollups";
import { getBillingMonthKey } from "../lib/plans";

/**
 * Admin Usage tab: who is practising, how much, and what it costs.
 * Reads the per-user monthly rollups (`usageRollups`), never raw sessions or token events.
 */

const period = v.union(v.literal("this_month"), v.literal("last_month"), v.literal("all"));
const planFilter = v.union(
  v.literal("all"),
  v.literal("free"),
  v.literal("professional"),
  v.literal("organization"),
  v.literal("admin"),
);
const statusFilter = v.union(v.literal("all"), v.literal("active"), v.literal("inactive"), v.literal("paused"), v.literal("packs"));
const sortBy = v.union(v.literal("cost"), v.literal("minutes"), v.literal("attempts"), v.literal("lastActive"), v.literal("joined"));

function previousMonthKey(now: Date) {
  return getBillingMonthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)));
}

type Totals = { attempts: number; minutes: number; costUsd: number; realtimeTokens: number; lastActiveAt: string | null };

export const users = query({
  args: {
    period,
    search: v.optional(v.string()),
    plan: planFilter,
    status: statusFilter,
    sort: sortBy,
    page: v.number(),
    pageSize: v.number(),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const now = new Date();
    const month = args.period === "this_month" ? getBillingMonthKey(now) : args.period === "last_month" ? previousMonthKey(now) : null;

    const [users, rollups, grants] = await Promise.all([
      ctx.db.query("users").collect(),
      month
        ? ctx.db.query("usageRollups").withIndex("by_month", (q) => q.eq("month", month)).collect()
        : ctx.db.query("usageRollups").collect(),
      ctx.db.query("minuteGrants").collect(),
    ]);

    const totalsByUser = new Map<string, Totals>();
    for (const rollup of rollups) {
      const totals = totalsByUser.get(rollup.clerkId) ?? { attempts: 0, minutes: 0, costUsd: 0, realtimeTokens: 0, lastActiveAt: null };
      totals.attempts += rollup.attempts;
      totals.minutes += rollup.minutes;
      totals.costUsd += rollup.costUsd;
      totals.realtimeTokens += rollup.realtimeTokens;
      totals.lastActiveAt = !totals.lastActiveAt || rollup.lastActiveAt > totals.lastActiveAt ? rollup.lastActiveAt : totals.lastActiveAt;
      totalsByUser.set(rollup.clerkId, totals);
    }
    const packBuyers = new Set(grants.filter((grant) => grant.source === "pack").map((grant) => grant.clerkId));

    const term = args.search?.trim().toLowerCase() ?? "";
    const empty: Totals = { attempts: 0, minutes: 0, costUsd: 0, realtimeTokens: 0, lastActiveAt: null };
    const rows = users
      .map((user) => ({ user, totals: totalsByUser.get(user.clerkId) ?? empty }))
      .filter(({ user, totals }) => {
        if (term && !user.email.toLowerCase().includes(term) && !user.name.toLowerCase().includes(term)) return false;
        if (args.plan === "admin" && user.role !== "platform_admin") return false;
        if (args.plan !== "all" && args.plan !== "admin" && user.subscriptionStatus !== args.plan) return false;
        const active = totals.attempts > 0 || totals.minutes > 0 || totals.costUsd > 0;
        if (args.status === "active" && !active) return false;
        if (args.status === "inactive" && active) return false;
        if (args.status === "paused" && !user.practicePausedAt) return false;
        if (args.status === "packs" && !packBuyers.has(user.clerkId)) return false;
        return true;
      });

    const key = (row: (typeof rows)[number]) => {
      switch (args.sort) {
        case "minutes":
          return row.totals.minutes;
        case "attempts":
          return row.totals.attempts;
        case "lastActive":
          return row.totals.lastActiveAt ? Date.parse(row.totals.lastActiveAt) : 0;
        case "joined":
          return Date.parse(row.user.createdAt);
        default:
          return row.totals.costUsd;
      }
    };
    rows.sort((a, b) => key(b) - key(a) || b.totals.minutes - a.totals.minutes || b.user.createdAt.localeCompare(a.user.createdAt));

    const pageSize = Math.min(100, Math.max(5, Math.round(args.pageSize)));
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
    const page = Math.min(pageCount, Math.max(1, Math.round(args.page)));
    const pageRows = await Promise.all(
      rows.slice((page - 1) * pageSize, page * pageSize).map(async ({ user, totals }) => {
        const entitlement = await getEntitlement(ctx, user, now);
        return {
          clerkId: user.clerkId,
          name: user.name,
          email: user.email,
          role: user.role,
          plan: user.subscriptionStatus,
          planLabel: entitlement.planLabel,
          boughtPacks: packBuyers.has(user.clerkId),
          paused: Boolean(user.practicePausedAt),
          createdAt: user.createdAt,
          attempts: totals.attempts,
          minutes: totals.minutes,
          costUsd: totals.costUsd,
          lastActiveAt: totals.lastActiveAt,
          remainingMinutes: entitlement.remainingMinutes,
          monthlyMinutes: entitlement.monthlyMinutes,
          allowanceUsed: entitlement.allowanceUsed,
        };
      }),
    );

    const sum = (pick: (totals: Totals) => number) => rows.reduce((total, row) => total + pick(row.totals), 0);
    return {
      rows: pageRows,
      page,
      pageCount,
      total: rows.length,
      summary: {
        users: rows.length,
        activeUsers: rows.filter((row) => row.totals.attempts > 0 || row.totals.minutes > 0).length,
        attempts: sum((t) => t.attempts),
        minutes: sum((t) => t.minutes),
        costUsd: sum((t) => t.costUsd),
      },
    };
  },
});

/** One user's usage history, recent sessions and minute grants. */
export const user = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const user = await getUserByClerkId(ctx, args.clerkId);
    if (!user) return null;

    const [entitlement, rollups, sessions, grants] = await Promise.all([
      getEntitlement(ctx, user),
      ctx.db.query("usageRollups").withIndex("by_clerkId_month", (q) => q.eq("clerkId", user.clerkId)).collect(),
      ctx.db.query("sessions").withIndex("by_clerkId", (q) => q.eq("clerkId", user.clerkId)).order("desc").take(15),
      ctx.db.query("minuteGrants").withIndex("by_clerkId", (q) => q.eq("clerkId", user.clerkId)).order("desc").take(20),
    ]);

    const recent = await Promise.all(
      sessions.map(async (session) => {
        const scenario = await ctx.db.query("scenarios").withIndex("by_public_id", (q) => q.eq("id", session.scenarioId)).unique();
        return {
          id: session.id,
          title: scenario?.title ?? session.scenarioId,
          startedAt: session.startedAt ?? session.timestamp,
          durationSeconds: session.durationSeconds ?? 0,
          chargedMinutes: session.chargedMinutes ?? 0,
          status: session.completionStatus,
          mode: session.mode ?? "assessed",
          endReason: session.endReason ?? null,
          score: session.score,
          voiceReconnects: Math.max(0, (session.realtimeKeysIssued ?? 0) - 1),
        };
      }),
    );

    return {
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      practiceGoal: user.practiceGoal ?? null,
      stripeCustomerId: user.stripeCustomerId ?? null,
      stripeSubscriptionStatus: user.stripeSubscriptionStatus ?? null,
      pausedAt: user.practicePausedAt ?? null,
      pausedReason: user.practicePausedReason ?? null,
      entitlement,
      months: rollups
        .sort((a, b) => b.month.localeCompare(a.month))
        .map((rollup) => ({ month: rollup.month, attempts: rollup.attempts, minutes: rollup.minutes, costUsd: rollup.costUsd })),
      recent,
      grants: grants.map((grant) => ({
        minutes: grant.minutes,
        source: grant.source,
        packId: grant.packId ?? null,
        note: grant.note ?? null,
        createdAt: grant.createdAt,
      })),
    };
  },
});

/** Stops (or restarts) new practice on an account. Sessions already running finish on their own limit. */
export const setPracticePaused = mutation({
  args: { clerkId: v.string(), paused: v.boolean(), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const admin = await requirePlatformAdmin(ctx);
    if (args.paused && admin.clerkId === args.clerkId) {
      throw new ConvexError("You can't pause your own account.");
    }
    const user = await getUserByClerkId(ctx, args.clerkId);
    if (!user) throw new ConvexError("User not found.");

    const now = new Date().toISOString();
    await ctx.db.patch(user._id, {
      practicePausedAt: args.paused ? now : undefined,
      practicePausedReason: args.paused ? args.reason?.trim().slice(0, 200) || undefined : undefined,
      updatedAt: now,
    });
  },
});

/**
 * One-off: builds `usageRollups` from history. Run once per source, following
 * `continueCursor` until `isDone`. Only counts records created before `before`
 * (the deploy time), because newer ones are already rolled up live.
 */
export const backfillRollups = internalMutation({
  args: {
    source: v.union(v.literal("sessions"), v.literal("charges"), v.literal("events")),
    before: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let counted = 0;
    if (args.source === "sessions") {
      const result = await ctx.db.query("sessions").paginate(args.paginationOpts);
      for (const session of result.page as Doc<"sessions">[]) {
        const at = session.startedAt ?? session.timestamp;
        if (session.id.startsWith("sess_") || at >= args.before) continue;
        await bumpUsage(ctx, session.clerkId, at, { attempts: 1 });
        counted++;
      }
      return { counted, isDone: result.isDone, continueCursor: result.continueCursor };
    }
    if (args.source === "charges") {
      const result = await ctx.db.query("usageCharges").paginate(args.paginationOpts);
      for (const charge of result.page) {
        if (charge.createdAt >= args.before) continue;
        await bumpUsage(ctx, charge.clerkId, charge.createdAt, { minutes: charge.minutes });
        counted++;
      }
      return { counted, isDone: result.isDone, continueCursor: result.continueCursor };
    }
    const result = await ctx.db.query("aiUsageEvents").paginate(args.paginationOpts);
    for (const event of result.page) {
      if (event.createdAt >= args.before) continue;
      await bumpUsage(ctx, event.clerkId, event.createdAt, {
        tokens: { source: event.source, input: event.promptTokens, output: event.completionTokens },
      });
      counted++;
    }
    return { counted, isDone: result.isDone, continueCursor: result.continueCursor };
  },
});

/** Clears `usageRollups` so `backfillRollups` can rebuild them (one batch per call). */
export const clearRollups = internalMutation({
  args: {},
  handler: async (ctx) => {
    const batch = await ctx.db.query("usageRollups").take(500);
    for (const row of batch) await ctx.db.delete(row._id);
    return { deleted: batch.length };
  },
});
