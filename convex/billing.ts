"use node";

import Stripe from "stripe";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalAction, type ActionCtx } from "./_generated/server";
import { getClerkIdFromIdentity } from "./model/auth";
import { isPackId, type PackId } from "../lib/plans";

/**
 * Stripe configuration lives in Convex environment variables:
 *   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRO_PRICE_ID,
 *   STRIPE_PACK_STARTER_PRICE_ID, STRIPE_PACK_PLUS_PRICE_ID,
 *   STRIPE_PACK_SPRINT_PRICE_ID, SITE_URL
 * See docs/runbooks/stripe-setup.md.
 */

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("BILLING_NOT_CONFIGURED");
  }

  return new Stripe(key);
}

function siteUrl() {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

const packPriceEnv: Record<PackId, string> = {
  starter: "STRIPE_PACK_STARTER_PRICE_ID",
  plus: "STRIPE_PACK_PLUS_PRICE_ID",
  sprint: "STRIPE_PACK_SPRINT_PRICE_ID",
};

function requirePriceId(envName: string) {
  const value = process.env[envName]?.trim();

  if (!value || !value.startsWith("price_")) {
    throw new Error("BILLING_NOT_CONFIGURED");
  }

  return value;
}

async function requireUser(ctx: ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.runQuery(internal.users.getByClerkIdInternal, {
    clerkId: getClerkIdFromIdentity(identity),
  });

  if (!user) {
    throw new Error("User profile not found");
  }

  return user;
}

async function ensureCustomer(
  ctx: ActionCtx,
  stripe: Stripe,
  user: { clerkId: string; email: string; name: string; stripeCustomerId?: string },
) {
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { clerkId: user.clerkId },
  });

  await ctx.runMutation(internal.users.setStripeCustomerId, {
    clerkId: user.clerkId,
    stripeCustomerId: customer.id,
  });

  return customer.id;
}

/** Starts Stripe Checkout for the Pro subscription or a one-off minute pack. */
export const createCheckout = action({
  args: {
    kind: v.union(v.literal("subscription"), v.literal("pack")),
    packId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    const user = await requireUser(ctx);
    const stripe = getStripe();
    const customer = await ensureCustomer(ctx, stripe, user);
    const base = siteUrl();

    if (args.kind === "subscription") {
      if (user.subscriptionStatus !== "free") {
        throw new Error("ALREADY_SUBSCRIBED");
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer,
        client_reference_id: user.clerkId,
        line_items: [{ price: requirePriceId("STRIPE_PRO_PRICE_ID"), quantity: 1 }],
        allow_promotion_codes: true,
        metadata: { clerkId: user.clerkId, kind: "subscription" },
        subscription_data: { metadata: { clerkId: user.clerkId } },
        success_url: `${base}/billing?status=success`,
        cancel_url: `${base}/billing?status=cancelled`,
      });

      return { url: session.url! };
    }

    if (!args.packId || !isPackId(args.packId)) {
      throw new Error("Unknown pack");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer,
      client_reference_id: user.clerkId,
      line_items: [{ price: requirePriceId(packPriceEnv[args.packId]), quantity: 1 }],
      allow_promotion_codes: true,
      metadata: { clerkId: user.clerkId, kind: "pack", packId: args.packId },
      payment_intent_data: { metadata: { clerkId: user.clerkId, packId: args.packId } },
      success_url: `${base}/billing?status=success`,
      cancel_url: `${base}/billing?status=cancelled`,
    });

    return { url: session.url! };
  },
});

/** Opens the Stripe customer portal (invoices, card, cancel subscription). */
export const createPortal = action({
  args: {},
  handler: async (ctx): Promise<{ url: string }> => {
    const user = await requireUser(ctx);

    if (!user.stripeCustomerId) {
      throw new Error("NO_BILLING_ACCOUNT");
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${siteUrl()}/billing`,
    });

    return { url: session.url };
  },
});

function subscriptionPlan(subscription: Stripe.Subscription) {
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID?.trim();
  const hasPro = subscription.items.data.some((item) => item.price.id === proPriceId);
  // past_due keeps access during Stripe's retry window; anything else ends it.
  const isLive = ["active", "trialing", "past_due"].includes(subscription.status);

  return hasPro && isLive ? ("professional" as const) : ("free" as const);
}

/** Verifies and applies one Stripe webhook. Invoked by the HTTP route in http.ts. */
export const handleWebhook = internalAction({
  args: { payload: v.string(), signature: v.string() },
  handler: async (ctx, args): Promise<{ status: number; message: string }> => {
    const stripe = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret) {
      return { status: 500, message: "Webhook secret not configured" };
    }

    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(args.payload, args.signature, secret);
    } catch {
      return { status: 400, message: "Invalid signature" };
    }

    const claimed = await ctx.runMutation(internal.billingData.claimStripeEvent, {
      eventId: event.id,
      type: event.type,
    });

    if (!claimed) {
      return { status: 200, message: "Already processed" };
    }

    try {
      switch (event.type) {
        case "checkout.session.completed":
        case "checkout.session.async_payment_succeeded": {
          const session = event.data.object as Stripe.Checkout.Session;
          const clerkId = session.metadata?.clerkId ?? session.client_reference_id ?? undefined;
          const customer = typeof session.customer === "string" ? session.customer : undefined;

          if (session.metadata?.kind === "pack") {
            if (session.payment_status === "paid" && clerkId && session.metadata.packId) {
              await ctx.runMutation(internal.billingData.grantPack, {
                clerkId,
                packId: session.metadata.packId,
                stripeCheckoutSessionId: session.id,
              });
            }
          } else if (session.mode === "subscription") {
            await ctx.runMutation(internal.users.applySubscription, {
              clerkId,
              stripeCustomerId: customer,
              stripeSubscriptionId:
                typeof session.subscription === "string" ? session.subscription : undefined,
              stripeSubscriptionStatus: "active",
              subscriptionStatus: "professional",
            });
          }
          break;
        }

        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;

          await ctx.runMutation(internal.users.applySubscription, {
            clerkId: subscription.metadata?.clerkId,
            stripeCustomerId:
              typeof subscription.customer === "string" ? subscription.customer : undefined,
            stripeSubscriptionId: subscription.id,
            stripeSubscriptionStatus: subscription.status,
            subscriptionStatus:
              event.type === "customer.subscription.deleted"
                ? "free"
                : subscriptionPlan(subscription),
          });
          break;
        }

        default:
          break;
      }
    } catch (error) {
      await ctx.runMutation(internal.billingData.releaseStripeEvent, { eventId: event.id });
      console.error("[billing.handleWebhook]", event.type, error);
      return { status: 500, message: "Webhook handling failed" };
    }

    return { status: 200, message: "ok" };
  },
});
