import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { demoSessionsForClerk } from "./seedData";

function normalizeRole(role?: string) {
  if (
    role === "interpreter" ||
    role === "student" ||
    role === "organization_admin" ||
    role === "platform_admin"
  ) {
    return role;
  }

  return "interpreter" as const;
}

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const clerkId = identity.subject ?? identity.tokenIdentifier;
    return ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
  },
});

export const syncCurrentUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = identity.subject ?? identity.tokenIdentifier;

    if (clerkId !== args.clerkId) {
      throw new Error("Clerk identity mismatch");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    const now = new Date().toISOString();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email || existing.email,
        name: args.name || existing.name,
        imageUrl: args.imageUrl ?? existing.imageUrl,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("users", {
        clerkId,
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        role: normalizeRole(args.role),
        subscriptionStatus: "free",
        createdAt: now,
        updatedAt: now,
      });
    }

    const existingSessions = await ctx.db
      .query("sessions")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .collect();

    if (existingSessions.length === 0) {
      for (const session of demoSessionsForClerk(clerkId)) {
        await ctx.db.insert("sessions", session);
      }
    }

    const assignedJob = await ctx.db
      .query("jobs")
      .withIndex("by_public_id", (q) => q.eq("id", "job_1"))
      .unique();

    if (assignedJob && !assignedJob.assignedInterpreterClerkId) {
      await ctx.db.patch(assignedJob._id, {
        assignedInterpreterClerkId: clerkId,
      });
    }

    return { ok: true };
  },
});

export const applyStripeSubscription = mutation({
  args: {
    clerkId: v.optional(v.string()),
    email: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    subscriptionStatus: v.union(
      v.literal("free"),
      v.literal("professional"),
      v.literal("organization"),
    ),
  },
  handler: async (ctx, args) => {
    let user = args.clerkId
      ? await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId!))
          .unique()
      : null;

    if (!user && args.email) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email!))
        .unique();
    }

    if (!user && args.stripeCustomerId) {
      user = await ctx.db
        .query("users")
        .withIndex("by_stripeCustomerId", (q) => q.eq("stripeCustomerId", args.stripeCustomerId!))
        .unique();
    }

    if (!user) {
      return { updated: false };
    }

    await ctx.db.patch(user._id, {
      subscriptionStatus: args.subscriptionStatus,
      stripeCustomerId: args.stripeCustomerId ?? user.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId ?? user.stripeSubscriptionId,
      updatedAt: new Date().toISOString(),
    });

    return { updated: true };
  },
});
