import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { getUserByClerkId } from "./model/auth";
import { isPackId, packs } from "../lib/plans";

/**
 * Records a Stripe event id. Returns false when the event was already handled,
 * so webhook retries are harmless.
 */
export const claimStripeEvent = internalMutation({
  args: { eventId: v.string(), type: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("stripeEvents")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .unique();

    if (existing) {
      return false;
    }

    await ctx.db.insert("stripeEvents", {
      eventId: args.eventId,
      type: args.type,
      processedAt: new Date().toISOString(),
    });

    return true;
  },
});

/** Releases a claimed event when processing failed, so Stripe's retry can run it. */
export const releaseStripeEvent = internalMutation({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("stripeEvents")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

/** Grants a purchased minute pack. Minutes come from server config, keyed by pack id. */
export const grantPack = internalMutation({
  args: {
    clerkId: v.string(),
    packId: v.string(),
    stripeCheckoutSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isPackId(args.packId)) {
      throw new Error(`Unknown pack ${args.packId}`);
    }

    const existing = await ctx.db
      .query("minuteGrants")
      .withIndex("by_stripeCheckoutSessionId", (q) =>
        q.eq("stripeCheckoutSessionId", args.stripeCheckoutSessionId),
      )
      .unique();

    if (existing) {
      return { granted: false };
    }

    const user = await getUserByClerkId(ctx, args.clerkId);

    if (!user) {
      throw new Error("User not found for pack purchase");
    }

    await ctx.db.insert("minuteGrants", {
      clerkId: args.clerkId,
      minutes: packs[args.packId].minutes,
      source: "pack",
      packId: args.packId,
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      createdAt: new Date().toISOString(),
    });

    return { granted: true };
  },
});

/**
 * Manual minute grant for support or promos.
 * `npx convex run billingData:grantMinutes '{"email":"x@y.com","minutes":30,"note":"refund"}'`
 */
export const grantMinutes = internalMutation({
  args: {
    email: v.string(),
    minutes: v.number(),
    note: v.optional(v.string()),
    source: v.optional(v.union(v.literal("admin"), v.literal("promo"))),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.trim().toLowerCase()))
      .unique();

    if (!user) {
      throw new Error(`No user with email ${args.email}`);
    }

    await ctx.db.insert("minuteGrants", {
      clerkId: user.clerkId,
      minutes: Math.round(args.minutes),
      source: args.source ?? "admin",
      note: args.note,
      createdAt: new Date().toISOString(),
    });

    return { ok: true };
  },
});
