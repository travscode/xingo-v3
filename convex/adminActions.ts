"use node";

import Stripe from "stripe";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { action, type ActionCtx } from "./_generated/server";
import { getClerkIdFromIdentity } from "./model/auth";

const platformRole = v.union(
  v.literal("interpreter"),
  v.literal("student"),
  v.literal("organization_admin"),
  v.literal("platform_admin"),
);

async function requireAdmin(ctx: ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("Not authenticated");
  }

  const clerkId = getClerkIdFromIdentity(identity);
  const isAdmin = await ctx.runQuery(internal.admin.requireAdminInternal, { clerkId });

  if (!isAdmin) {
    throw new ConvexError("Not authorized");
  }

  return clerkId;
}

/**
 * Sends a Clerk invitation email and records the role to apply on sign-up.
 * Requires CLERK_SECRET_KEY and SITE_URL in the Convex environment.
 */
export const inviteUser = action({
  args: { email: v.string(), role: platformRole },
  handler: async (ctx, args): Promise<{ emailed: boolean; existingUser: boolean }> => {
    const clerkId = await requireAdmin(ctx);
    const email = args.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ConvexError("Enter a valid email address.");
    }

    const secret = process.env.CLERK_SECRET_KEY;
    const siteUrl = (process.env.SITE_URL ?? "").replace(/\/$/, "");
    let clerkInvitationId: string | undefined;
    let emailed = false;

    if (secret) {
      const response = await fetch("https://api.clerk.com/v1/invitations", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          email_address: email,
          redirect_url: siteUrl ? `${siteUrl}/sign-up` : undefined,
          notify: true,
          ignore_existing: true,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as { id?: string };
        clerkInvitationId = data.id;
        emailed = true;
      } else if (response.status !== 422) {
        // 422 = already a user / already invited; the role still applies below.
        throw new ConvexError(`Clerk rejected the invitation (${response.status}).`);
      }
    }

    const result = await ctx.runMutation(internal.admin.recordInvite, {
      email,
      role: args.role,
      invitedByClerkId: clerkId,
      clerkInvitationId,
    });

    if (result.existingUser) {
      await ctx.runMutation(internal.users.applyInviteForEmail, { email });
    }

    return { emailed, existingUser: result.existingUser };
  },
});

type FinanceSnapshot =
  | { configured: false }
  | {
      configured: true;
      livemode: boolean;
      currency: string;
      mrrCents: number;
      activeSubscriptions: number;
      pastDueSubscriptions: number;
      last30DaysGrossCents: number;
      last30DaysRefundedCents: number;
      availableBalanceCents: number;
      pendingBalanceCents: number;
      recentPayments: Array<{
        id: string;
        amountCents: number;
        currency: string;
        email: string | null;
        description: string | null;
        status: string;
        createdAt: string;
      }>;
    };

/** Live revenue numbers straight from Stripe. */
export const financeSnapshot = action({
  args: {},
  handler: async (ctx): Promise<FinanceSnapshot> => {
    await requireAdmin(ctx);
    const key = process.env.STRIPE_SECRET_KEY;

    if (!key) {
      return { configured: false };
    }

    const stripe = new Stripe(key);
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
    const [subscriptions, charges, balance] = await Promise.all([
      stripe.subscriptions.list({ status: "all", limit: 100, expand: ["data.items.data.price"] }),
      stripe.charges.list({ created: { gte: thirtyDaysAgo }, limit: 100 }),
      stripe.balance.retrieve(),
    ]);

    let mrrCents = 0;
    let currency = "aud";

    for (const subscription of subscriptions.data) {
      if (!["active", "trialing", "past_due"].includes(subscription.status)) continue;

      for (const item of subscription.items.data) {
        const price = item.price;
        const amount = (price.unit_amount ?? 0) * (item.quantity ?? 1);
        const interval = price.recurring?.interval ?? "month";
        const count = price.recurring?.interval_count ?? 1;
        const perMonth =
          interval === "year" ? amount / (12 * count) : interval === "week" ? (amount * 52) / (12 * count) : amount / count;
        mrrCents += perMonth;
        currency = price.currency;
      }
    }

    const succeeded = charges.data.filter((charge) => charge.status === "succeeded");

    return {
      configured: true,
      livemode: !key.startsWith("sk_test"),
      currency,
      mrrCents: Math.round(mrrCents),
      activeSubscriptions: subscriptions.data.filter((s) => s.status === "active" || s.status === "trialing").length,
      pastDueSubscriptions: subscriptions.data.filter((s) => s.status === "past_due").length,
      last30DaysGrossCents: succeeded.reduce((sum, charge) => sum + charge.amount, 0),
      last30DaysRefundedCents: succeeded.reduce((sum, charge) => sum + charge.amount_refunded, 0),
      availableBalanceCents: balance.available.reduce((sum, entry) => sum + entry.amount, 0),
      pendingBalanceCents: balance.pending.reduce((sum, entry) => sum + entry.amount, 0),
      recentPayments: charges.data.slice(0, 15).map((charge) => ({
        id: charge.id,
        amountCents: charge.amount,
        currency: charge.currency,
        email: charge.billing_details?.email ?? charge.receipt_email ?? null,
        description: charge.description,
        status: charge.refunded ? "refunded" : charge.status,
        createdAt: new Date(charge.created * 1000).toISOString(),
      })),
    };
  },
});
