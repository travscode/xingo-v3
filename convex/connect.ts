"use node";

import Stripe from "stripe";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { action, internalAction, type ActionCtx } from "./_generated/server";
import { getClerkIdFromIdentity } from "./model/auth";

/**
 * Stripe Connect (Express) payouts to course creators. Off until
 * STRIPE_CONNECT_ENABLED=true. Also needs STRIPE_SECRET_KEY,
 * STRIPE_CONNECT_WEBHOOK_SECRET and SITE_URL. See docs/runbooks/stripe-connect-setup.md.
 */

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || process.env.STRIPE_CONNECT_ENABLED !== "true") {
    throw new ConvexError("PAYOUTS_NOT_CONFIGURED");
  }
  return new Stripe(key);
}

function siteUrl() {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

async function requireUser(ctx: ActionCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.runQuery(internal.users.getByClerkIdInternal, { clerkId: getClerkIdFromIdentity(identity) });
  if (!user) throw new Error("User profile not found");
  return user;
}

function bankPayoutFields(stripeAccountId: string, payout: Stripe.Payout) {
  return {
    stripeAccountId,
    stripePayoutId: payout.id,
    amountCents: payout.amount,
    currency: payout.currency,
    status: payout.status,
    arrivalDate: payout.arrival_date ? new Date(payout.arrival_date * 1000).toISOString() : undefined,
    failureMessage: payout.failure_message ?? undefined,
    createdAt: new Date(payout.created * 1000).toISOString(),
  };
}

function accountFlags(account: Stripe.Account) {
  return {
    stripeAccountId: account.id,
    detailsSubmitted: Boolean(account.details_submitted),
    payoutsEnabled: Boolean(account.payouts_enabled),
    country: account.country ?? undefined,
  };
}

/** Starts (or resumes) Stripe-hosted onboarding and returns the URL to send the creator to. */
export const startPayoutSetup = action({
  args: {},
  handler: async (ctx): Promise<{ url: string }> => {
    const stripe = getStripe();
    const user = await requireUser(ctx);
    const existing = await ctx.runQuery(internal.connectData.getAccount, { clerkId: user.clerkId });
    let accountId = existing?.stripeAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "AU",
        email: user.email,
        capabilities: { transfers: { requested: true } },
        metadata: { clerkId: user.clerkId },
      });
      accountId = account.id;
      await ctx.runMutation(internal.connectData.saveAccount, { clerkId: user.clerkId, ...accountFlags(account) });
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      refresh_url: `${siteUrl()}/marketplace/earnings?setup=retry`,
      return_url: `${siteUrl()}/marketplace/earnings?setup=done`,
    });

    return { url: link.url };
  },
});

/** Re-reads the creator's Stripe account after they return from onboarding. */
export const refreshPayoutAccount = action({
  args: {},
  handler: async (ctx): Promise<{ payoutsEnabled: boolean }> => {
    const stripe = getStripe();
    const user = await requireUser(ctx);
    const existing = await ctx.runQuery(internal.connectData.getAccount, { clerkId: user.clerkId });
    if (!existing?.stripeAccountId) return { payoutsEnabled: false };

    const account = await stripe.accounts.retrieve(existing.stripeAccountId);
    await ctx.runMutation(internal.connectData.saveAccount, { clerkId: user.clerkId, ...accountFlags(account) });
    return { payoutsEnabled: Boolean(account.payouts_enabled) };
  },
});

/** One-time login link to the creator's Stripe Express dashboard (bank details, payout history). */
export const openPayoutDashboard = action({
  args: {},
  handler: async (ctx): Promise<{ url: string }> => {
    const stripe = getStripe();
    const user = await requireUser(ctx);
    const existing = await ctx.runQuery(internal.connectData.getAccount, { clerkId: user.clerkId });
    if (!existing?.stripeAccountId) throw new ConvexError("PAYOUTS_NOT_CONFIGURED");
    const link = await stripe.accounts.createLoginLink(existing.stripeAccountId);
    return { url: link.url };
  },
});

/**
 * Pulls the creator's recent bank payouts and current Stripe balance. Called when
 * they open Payouts, so history is complete even if a webhook was missed.
 */
export const syncMyPayouts = action({
  args: {},
  handler: async (ctx): Promise<{ availableCents: number; pendingCents: number } | null> => {
    const stripe = getStripe();
    const user = await requireUser(ctx);
    const existing = await ctx.runQuery(internal.connectData.getAccount, { clerkId: user.clerkId });
    const accountId = existing?.stripeAccountId;
    if (!accountId) return null;

    const [payouts, balance] = await Promise.all([
      stripe.payouts.list({ limit: 50 }, { stripeAccount: accountId }),
      stripe.balance.retrieve({}, { stripeAccount: accountId }),
    ]);
    for (const payout of payouts.data) {
      await ctx.runMutation(internal.connectData.recordBankPayout, bankPayoutFields(accountId, payout));
    }
    const sum = (rows: Stripe.Balance.Available[] | Stripe.Balance.Pending[]) =>
      rows.filter((row) => row.currency === "aud").reduce((total, row) => total + row.amount, 0);
    return { availableCents: sum(balance.available), pendingCents: sum(balance.pending) };
  },
});

type PayoutRun = { paid: number; failed: number; totalCents: number };

/** Transfers each creator's available balance (past the hold, at least the threshold) to their Stripe account. */
async function payCreators(ctx: ActionCtx): Promise<PayoutRun> {
  const stripe = getStripe();
  const creators = await ctx.runQuery(internal.connectData.payableCreators, {});
  let paid = 0;
  let failed = 0;
  let totalCents = 0;

  for (const creator of creators) {
    const reserved = await ctx.runMutation(internal.connectData.reservePayout, { clerkId: creator.clerkId });
    if (!reserved) continue;

    try {
      const transfer = await stripe.transfers.create(
        {
          amount: reserved.amountCents,
          currency: "aud",
          destination: creator.stripeAccountId,
          description: "XINGO course earnings",
          metadata: { clerkId: creator.clerkId, payoutId: reserved.payoutId },
        },
        { idempotencyKey: `payout-${reserved.payoutId}` },
      );
      await ctx.runMutation(internal.connectData.completePayout, { payoutId: reserved.payoutId, stripeTransferId: transfer.id });
      paid += 1;
      totalCents += reserved.amountCents;
    } catch (error) {
      // Failed transfers release the earnings, so the next run retries them.
      await ctx.runMutation(internal.connectData.completePayout, {
        payoutId: reserved.payoutId,
        error: error instanceof Error ? error.message : String(error),
      });
      failed += 1;
    }
  }

  return { paid, failed, totalCents };
}

/** Pays creators now. Admin → Marketplace → Pay creators (the monthly cron does the same). */
export const runPayouts = action({
  args: {},
  handler: async (ctx): Promise<PayoutRun> => {
    const admin = await requireUser(ctx);
    if (admin.role !== "platform_admin") throw new Error("Not authorized");
    return payCreators(ctx);
  },
});

/** Monthly cron (convex/crons.ts): pays creators automatically. Does nothing until Connect is switched on. */
export const monthlyPayouts = internalAction({
  args: {},
  handler: async (ctx): Promise<PayoutRun | { skipped: string }> => {
    if (process.env.STRIPE_CONNECT_ENABLED !== "true" || !process.env.STRIPE_SECRET_KEY) {
      return { skipped: "Stripe Connect not enabled" };
    }
    const result = await payCreators(ctx);
    console.log(`[payouts] monthly run: paid ${result.paid} creators, ${result.totalCents} cents; ${result.failed} failed`);
    return result;
  },
});

/**
 * Connect webhook: keeps creator accounts in sync (account.updated) and records
 * Stripe's bank payouts from their Express balance (payout.created/updated/paid/failed/canceled).
 */
export const handleConnectWebhook = internalAction({
  args: { payload: v.string(), signature: v.string() },
  handler: async (ctx, args): Promise<{ status: number; message: string }> => {
    const key = process.env.STRIPE_SECRET_KEY;
    const secret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
    if (!key || !secret) return { status: 500, message: "Connect webhook not configured" };

    let event: Stripe.Event;
    try {
      event = await new Stripe(key).webhooks.constructEventAsync(args.payload, args.signature, secret);
    } catch {
      return { status: 400, message: "Invalid signature" };
    }

    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      await ctx.runMutation(internal.connectData.saveAccount, accountFlags(account));
    }

    if (event.type.startsWith("payout.") && event.account) {
      const payout = event.data.object as Stripe.Payout;
      await ctx.runMutation(internal.connectData.recordBankPayout, bankPayoutFields(event.account, payout));
    }

    return { status: 200, message: "ok" };
  },
});
