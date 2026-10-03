import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { EARNINGS_HOLD_DAYS, PAYOUT_THRESHOLD_CENTS } from "../lib/marketplace";
import { queueEmail } from "./model/notify";

/** Data side of Stripe Connect payouts (convex/connect.ts is the Stripe side). */

export const getAccount = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("creatorAccounts")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique(),
});

export const saveAccount = internalMutation({
  args: {
    clerkId: v.optional(v.string()),
    stripeAccountId: v.string(),
    detailsSubmitted: v.boolean(),
    payoutsEnabled: v.boolean(),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = args.clerkId
      ? await ctx.db
          .query("creatorAccounts")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId!))
          .unique()
      : await ctx.db
          .query("creatorAccounts")
          .withIndex("by_stripeAccountId", (q) => q.eq("stripeAccountId", args.stripeAccountId))
          .unique();
    const fields = {
      stripeAccountId: args.stripeAccountId,
      detailsSubmitted: args.detailsSubmitted,
      payoutsEnabled: args.payoutsEnabled,
      country: args.country,
      updatedAt: new Date().toISOString(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, fields);
    } else if (args.clerkId) {
      await ctx.db.insert("creatorAccounts", { clerkId: args.clerkId, ...fields });
    }

    const ownerClerkId = existing?.clerkId ?? args.clerkId;
    if (ownerClerkId && args.payoutsEnabled && !existing?.payoutsEnabled) {
      await queueEmail(ctx, {
        clerkId: ownerClerkId,
        email: { kind: "payout_account_ready" },
        dedupeKey: `payout_account_ready-${args.stripeAccountId}`,
      });
    }
  },
});

/** Creators with an available (past the hold period) balance at or above the payout threshold. */
export const payableCreators = internalQuery({
  args: {},
  handler: async (ctx) => {
    const cutoff = new Date(Date.now() - EARNINGS_HOLD_DAYS * 86_400_000).toISOString();
    const accounts = (await ctx.db.query("creatorAccounts").collect()).filter(
      (account) => account.payoutsEnabled && account.stripeAccountId,
    );
    const result: Array<{ clerkId: string; stripeAccountId: string; amountCents: number }> = [];

    for (const account of accounts) {
      const earnings = await ctx.db
        .query("creatorEarnings")
        .withIndex("by_owner", (q) => q.eq("ownerClerkId", account.clerkId))
        .collect();
      const amount = earnings
        .filter((earning) => !earning.payoutId && earning.createdAt <= cutoff)
        .reduce((sum, earning) => sum + earning.amountCents, 0);
      if (amount >= PAYOUT_THRESHOLD_CENTS) {
        result.push({ clerkId: account.clerkId, stripeAccountId: account.stripeAccountId!, amountCents: Math.floor(amount) });
      }
    }

    return result;
  },
});

/** Creates a pending payout and assigns the eligible earnings to it, atomically. */
export const reservePayout = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const cutoff = new Date(Date.now() - EARNINGS_HOLD_DAYS * 86_400_000).toISOString();
    const earnings = (
      await ctx.db
        .query("creatorEarnings")
        .withIndex("by_owner", (q) => q.eq("ownerClerkId", args.clerkId))
        .collect()
    ).filter((earning) => !earning.payoutId && earning.createdAt <= cutoff);
    const amountCents = Math.floor(earnings.reduce((sum, earning) => sum + earning.amountCents, 0));

    if (amountCents < PAYOUT_THRESHOLD_CENTS) return null;

    const payoutId = await ctx.db.insert("creatorPayouts", {
      ownerClerkId: args.clerkId,
      amountCents,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    for (const earning of earnings) await ctx.db.patch(earning._id, { payoutId });

    return { payoutId, amountCents };
  },
});

export const completePayout = internalMutation({
  args: {
    payoutId: v.id("creatorPayouts"),
    stripeTransferId: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.stripeTransferId) {
      await ctx.db.patch(args.payoutId, { status: "paid", stripeTransferId: args.stripeTransferId, paidAt: new Date().toISOString() });
      const paid = await ctx.db.get(args.payoutId);
      if (paid) {
        await queueEmail(ctx, {
          clerkId: paid.ownerClerkId,
          email: { kind: "payout_sent", amountCents: paid.amountCents },
          dedupeKey: `payout_sent-${args.payoutId}`,
        });
      }
      return;
    }

    // Failed: release the earnings so the next run retries them.
    await ctx.db.patch(args.payoutId, { status: "failed", error: args.error?.slice(0, 500) });
    const payout = await ctx.db.get(args.payoutId);
    if (!payout) return;
    const earnings = await ctx.db
      .query("creatorEarnings")
      .withIndex("by_owner", (q) => q.eq("ownerClerkId", payout.ownerClerkId))
      .collect();
    for (const earning of earnings.filter((e) => e.payoutId === args.payoutId)) {
      await ctx.db.patch(earning._id, { payoutId: undefined });
    }
  },
});
