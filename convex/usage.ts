import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getBillingMonthKey, getBillingMonthRange, getUsagePlanConfig, tokensToCredits } from "../lib/usage-billing";

const usageSource = v.union(
  v.literal("realtime"),
  v.literal("assessment"),
  v.literal("translation"),
  v.literal("other"),
);

const stripeChargeStatus = v.union(
  v.literal("not_applicable"),
  v.literal("pending"),
  v.literal("invoiced"),
  v.literal("failed"),
);

type UsageEventRecord = {
  source: "realtime" | "assessment" | "translation" | "other";
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  usageCredits: number;
  overageCredits: number;
  overageChargeCents: number;
  createdAt: string;
};

/**
 * Resolves the active Clerk identifier from the Convex auth identity.
 */
function getClerkId(identity: { subject?: string | null; tokenIdentifier: string }) {
  return identity.subject ?? identity.tokenIdentifier;
}

/**
 * Calculates usage totals for a set of usage events.
 */
function summarizeUsage(events: UsageEventRecord[]) {
  const bySource = {
    realtime: { totalTokens: 0, credits: 0, requestCount: 0 },
    assessment: { totalTokens: 0, credits: 0, requestCount: 0 },
    translation: { totalTokens: 0, credits: 0, requestCount: 0 },
    other: { totalTokens: 0, credits: 0, requestCount: 0 },
  };

  for (const event of events) {
    bySource[event.source].totalTokens += event.totalTokens;
    bySource[event.source].credits += event.usageCredits;
    bySource[event.source].requestCount += 1;
  }

  return {
    totalTokens: events.reduce((sum, event) => sum + event.totalTokens, 0),
    totalCredits: events.reduce((sum, event) => sum + event.usageCredits, 0),
    overageCredits: events.reduce((sum, event) => sum + event.overageCredits, 0),
    overageChargeCents: events.reduce(
      (sum, event) => sum + event.overageChargeCents,
      0,
    ),
    requestCount: events.length,
    bySource,
  };
}

/**
 * Returns the current billing-month summary for the signed-in user.
 */
export const currentBillingSummaryForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const clerkId = getClerkId(identity);
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) {
      return null;
    }

    const now = new Date();
    const billingMonth = getBillingMonthKey(now);
    const events = await ctx.db
      .query("aiUsageEvents")
      .withIndex("by_clerkId_billingMonth", (q) =>
        q.eq("clerkId", clerkId).eq("billingMonth", billingMonth),
      )
      .collect();
    const totals = summarizeUsage(events);
    const plan = getUsagePlanConfig(user.subscriptionStatus);
    const usageRatio =
      plan.includedCreditsMonthly > 0
        ? Math.min(1, totals.totalCredits / plan.includedCreditsMonthly)
        : 0;
    const overageRatio =
      plan.includedCreditsMonthly > 0
        ? Math.max(0, totals.totalCredits - plan.includedCreditsMonthly) /
          plan.includedCreditsMonthly
        : 0;
    const monthRange = getBillingMonthRange(billingMonth);

    return {
      billingMonth,
      periodStart: monthRange.start.toISOString(),
      periodEnd: monthRange.end.toISOString(),
      subscriptionStatus: user.subscriptionStatus,
      planLabel: plan.label,
      stripeCustomerId: user.stripeCustomerId,
      includedCreditsMonthly: plan.includedCreditsMonthly,
      overageCentsPerCredit: plan.overageCentsPerCredit,
      usedCredits: totals.totalCredits,
      usedTokens: totals.totalTokens,
      requestCount: totals.requestCount,
      remainingCredits: Math.max(0, plan.includedCreditsMonthly - totals.totalCredits),
      overageCredits: Math.max(0, totals.totalCredits - plan.includedCreditsMonthly),
      overageChargeCents: totals.overageChargeCents,
      usageRatio,
      overageRatio,
      isOverQuota: totals.totalCredits > plan.includedCreditsMonthly,
      bySource: totals.bySource,
    };
  },
});

/**
 * Records one OpenAI usage event and computes any newly billable overage for the billing month.
 */
export const recordEventAdmin = mutation({
  args: {
    id: v.string(),
    clerkId: v.string(),
    source: usageSource,
    model: v.string(),
    moduleId: v.optional(v.string()),
    scenarioId: v.optional(v.string()),
    attemptId: v.optional(v.string()),
    requestPath: v.optional(v.string()),
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
      return {
        existed: true,
        eventId: existing.id,
        shouldCreateInvoiceItem: false,
        stripeCustomerId: undefined,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("Usage event user not found");
    }

    const createdAt = new Date().toISOString();
    const billingMonth = getBillingMonthKey(new Date(createdAt));
    const monthEvents = await ctx.db
      .query("aiUsageEvents")
      .withIndex("by_clerkId_billingMonth", (q) =>
        q.eq("clerkId", args.clerkId).eq("billingMonth", billingMonth),
      )
      .collect();
    const priorUsageCredits = monthEvents.reduce(
      (sum, event) => sum + event.usageCredits,
      0,
    );
    const usageCredits = tokensToCredits(args.totalTokens);
    const plan = getUsagePlanConfig(user.subscriptionStatus);
    const priorOverageCredits = Math.max(
      0,
      priorUsageCredits - plan.includedCreditsMonthly,
    );
    const nextUsageCredits = priorUsageCredits + usageCredits;
    const nextOverageCredits = Math.max(
      0,
      nextUsageCredits - plan.includedCreditsMonthly,
    );
    const incrementalOverageCredits = Math.max(
      0,
      nextOverageCredits - priorOverageCredits,
    );
    const overageChargeCents =
      incrementalOverageCredits * plan.overageCentsPerCredit;
    const shouldCreateInvoiceItem =
      incrementalOverageCredits > 0 &&
      Boolean(user.stripeCustomerId) &&
      user.subscriptionStatus !== "free";

    await ctx.db.insert("aiUsageEvents", {
      id: args.id,
      clerkId: args.clerkId,
      source: args.source,
      model: args.model,
      moduleId: args.moduleId,
      scenarioId: args.scenarioId,
      attemptId: args.attemptId,
      requestPath: args.requestPath,
      promptTokens: args.promptTokens,
      completionTokens: args.completionTokens,
      totalTokens: args.totalTokens,
      usageCredits,
      overageCredits: incrementalOverageCredits,
      overageChargeCents,
      stripeChargeStatus: shouldCreateInvoiceItem ? "pending" : "not_applicable",
      stripeInvoiceItemId: undefined,
      stripeChargeError: undefined,
      billingMonth,
      createdAt,
    });

    return {
      existed: false,
      eventId: args.id,
      shouldCreateInvoiceItem,
      stripeCustomerId: user.stripeCustomerId,
      subscriptionStatus: user.subscriptionStatus,
      usageCredits,
      incrementalOverageCredits,
      overageChargeCents,
      billingMonth,
    };
  },
});

/**
 * Marks whether a recorded usage event was successfully attached to Stripe billing.
 */
export const markInvoiceStatusAdmin = mutation({
  args: {
    id: v.string(),
    stripeChargeStatus,
    stripeInvoiceItemId: v.optional(v.string()),
    stripeChargeError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("aiUsageEvents")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (!event) {
      throw new Error("Usage event not found");
    }

    await ctx.db.patch(event._id, {
      stripeChargeStatus: args.stripeChargeStatus,
      stripeInvoiceItemId: args.stripeInvoiceItemId,
      stripeChargeError: args.stripeChargeError,
    });

    return { ok: true };
  },
});
