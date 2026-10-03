import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { getClerkIdFromIdentity, getUserByClerkId, requireClerkId } from "./model/auth";
import { getEntitlement } from "./model/entitlements";
import { bumpUsage } from "./model/usageRollups";
import { getBillingMonthKey, getBillingMonthRange } from "../lib/plans";

/** Upper bound for one client-reported realtime response; anything larger is dropped. */
const MAX_REALTIME_TOKENS_PER_EVENT = 200_000;

/** Practice-minute summary for the signed-in user (billing page, sidebar meter). */
export const summaryForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const user = await getUserByClerkId(ctx, getClerkIdFromIdentity(identity));

    if (!user) {
      return null;
    }

    const entitlement = await getEntitlement(ctx, user);
    const range = getBillingMonthRange(entitlement.billingMonth);
    const charges = await ctx.db
      .query("usageCharges")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", user.clerkId))
      .order("desc")
      .take(20);
    const grants = await ctx.db
      .query("minuteGrants")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", user.clerkId))
      .order("desc")
      .take(20);

    return {
      ...entitlement,
      periodStart: range.start.toISOString(),
      periodEnd: range.end.toISOString(),
      hasStripeCustomer: Boolean(user.stripeCustomerId),
      stripeSubscriptionStatus: user.stripeSubscriptionStatus,
      recentCharges: charges.map((c) => ({
        attemptId: c.attemptId,
        minutes: c.minutes,
        createdAt: c.createdAt,
      })),
      recentGrants: grants.map((g) => ({
        minutes: g.minutes,
        source: g.source,
        packId: g.packId,
        createdAt: g.createdAt,
      })),
    };
  },
});

/** Records server-observed OpenAI token usage (grading, translation). Cost analytics only. */
export const recordAiUsage = internalMutation({
  args: {
    id: v.string(),
    clerkId: v.string(),
    source: v.union(
      v.literal("realtime"),
      v.literal("assessment"),
      v.literal("translation"),
      v.literal("other"),
    ),
    model: v.string(),
    moduleId: v.optional(v.string()),
    scenarioId: v.optional(v.string()),
    attemptId: v.optional(v.string()),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("aiUsageEvents")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (existing) {
      return;
    }

    const createdAt = new Date().toISOString();

    await ctx.db.insert("aiUsageEvents", {
      ...args,
      billingMonth: getBillingMonthKey(new Date(createdAt)),
      createdAt,
    });
    await bumpUsage(ctx, args.clerkId, createdAt, {
      tokens: { source: args.source, input: args.promptTokens, output: args.completionTokens },
    });
  },
});

/**
 * Client-reported realtime token usage (from `response.done` events).
 * The browser is the only place these numbers exist, so they are analytics only
 * and never affect what the user is charged; billing uses server-metered minutes.
 */
export const reportRealtimeUsage = mutation({
  args: {
    eventId: v.string(),
    attemptId: v.string(),
    model: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
  },
  handler: async (ctx, args) => {
    const clerkId = await requireClerkId(ctx);
    const attempt = await ctx.db
      .query("sessions")
      .withIndex("by_public_id", (q) => q.eq("id", args.attemptId))
      .unique();

    if (!attempt || attempt.clerkId !== clerkId) {
      return;
    }

    if (
      args.totalTokens <= 0 ||
      args.totalTokens > MAX_REALTIME_TOKENS_PER_EVENT ||
      args.promptTokens < 0 ||
      args.completionTokens < 0
    ) {
      return;
    }

    const id = `rt_${args.eventId.slice(0, 80)}`;
    const existing = await ctx.db
      .query("aiUsageEvents")
      .withIndex("by_public_id", (q) => q.eq("id", id))
      .unique();

    if (existing) {
      return;
    }

    const createdAt = new Date().toISOString();

    await ctx.db.insert("aiUsageEvents", {
      id,
      clerkId,
      source: "realtime",
      model: args.model.slice(0, 60) || "realtime",
      moduleId: attempt.moduleId,
      scenarioId: attempt.scenarioId,
      attemptId: attempt.id,
      promptTokens: args.promptTokens,
      completionTokens: args.completionTokens,
      totalTokens: args.totalTokens,
      billingMonth: getBillingMonthKey(new Date(createdAt)),
      createdAt,
    });
    await bumpUsage(ctx, clerkId, createdAt, {
      tokens: { source: "realtime", input: args.promptTokens, output: args.completionTokens },
    });
  },
});

/**
 * Operator report: minutes metered vs tokens consumed for a month.
 * `npx convex run usage:monthlyReport '{"month":"2026-10"}'`
 */
export const monthlyReport = internalQuery({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    const events = await ctx.db.query("aiUsageEvents").collect();
    const monthEvents = events.filter((event) => event.billingMonth === args.month);
    const charges = (await ctx.db.query("usageCharges").collect()).filter(
      (charge) => charge.billingMonth === args.month,
    );
    const tokensBySource: Record<string, { input: number; output: number; events: number }> = {};

    for (const event of monthEvents) {
      const bucket = (tokensBySource[`${event.source}:${event.model}`] ??= {
        input: 0,
        output: 0,
        events: 0,
      });
      bucket.input += event.promptTokens;
      bucket.output += event.completionTokens;
      bucket.events += 1;
    }

    return {
      month: args.month,
      meteredMinutes: charges.reduce((sum, charge) => sum + charge.minutes, 0),
      chargedAttempts: charges.length,
      activeUsers: new Set(charges.map((charge) => charge.clerkId)).size,
      tokensBySource,
    };
  },
});
