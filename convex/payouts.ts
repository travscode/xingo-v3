import { query } from "./_generated/server";
import { getClerkIdFromIdentity, getUserByClerkId } from "./model/auth";
import { EARNINGS_HOLD_DAYS } from "../lib/marketplace";

/**
 * The creator's Payouts page (/marketplace/earnings): balances, a 12-month
 * earnings series, XINGO's transfers to their Stripe account and Stripe's
 * payouts from there to their bank (D-031, D-041).
 */

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

function lastMonths(count: number, now = new Date()) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (count - 1 - index), 1));
    return date.toISOString().slice(0, 7);
  });
}

export const overview = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const user = identity ? await getUserByClerkId(ctx, getClerkIdFromIdentity(identity)) : null;
    if (!user) return null;

    const [earnings, account, transfers, bankPayouts] = await Promise.all([
      ctx.db
        .query("creatorEarnings")
        .withIndex("by_owner", (q) => q.eq("ownerClerkId", user.clerkId))
        .collect(),
      ctx.db
        .query("creatorAccounts")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", user.clerkId))
        .unique(),
      ctx.db
        .query("creatorPayouts")
        .withIndex("by_owner", (q) => q.eq("ownerClerkId", user.clerkId))
        .collect(),
      ctx.db
        .query("creatorBankPayouts")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", user.clerkId))
        .collect(),
    ]);

    const holdCutoff = new Date(Date.now() - EARNINGS_HOLD_DAYS * 86_400_000).toISOString();
    const unpaid = earnings.filter((earning) => !earning.payoutId);
    const months = lastMonths(12);
    const series = months.map((month) => {
      const inMonth = earnings.filter((earning) => monthKey(earning.createdAt) === month);
      return {
        month,
        earnedCents: inMonth.reduce((sum, earning) => sum + earning.amountCents, 0),
        paidMinutes: inMonth.reduce((sum, earning) => sum + earning.paidMinutes, 0),
        sessions: inMonth.length,
      };
    });

    return {
      account: {
        connected: Boolean(account?.stripeAccountId),
        detailsSubmitted: account?.detailsSubmitted ?? false,
        payoutsEnabled: account?.payoutsEnabled ?? false,
      },
      totals: {
        earnedCents: earnings.reduce((sum, earning) => sum + earning.amountCents, 0),
        availableCents: unpaid.filter((e) => e.createdAt <= holdCutoff).reduce((sum, e) => sum + e.amountCents, 0),
        pendingCents: unpaid.filter((e) => e.createdAt > holdCutoff).reduce((sum, e) => sum + e.amountCents, 0),
        transferredCents: transfers.filter((t) => t.status === "paid").reduce((sum, t) => sum + t.amountCents, 0),
        toBankCents: bankPayouts.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amountCents, 0),
        paidSessions: earnings.filter((earning) => earning.amountCents > 0).length,
        paidMinutes: earnings.reduce((sum, earning) => sum + earning.paidMinutes, 0),
        learners: new Set(earnings.map((earning) => earning.learnerClerkId)).size,
      },
      series,
      transfers: transfers
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((transfer) => ({
          id: transfer._id,
          amountCents: transfer.amountCents,
          status: transfer.status,
          reference: transfer.stripeTransferId ?? null,
          createdAt: transfer.createdAt,
          paidAt: transfer.paidAt ?? null,
        })),
      bankPayouts: bankPayouts
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((payout) => ({
          id: payout._id,
          amountCents: payout.amountCents,
          currency: payout.currency,
          status: payout.status,
          arrivalDate: payout.arrivalDate ?? null,
          failureMessage: payout.failureMessage ?? null,
          createdAt: payout.createdAt,
        })),
    };
  },
});
