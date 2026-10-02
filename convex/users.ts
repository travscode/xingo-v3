import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import {
  getClerkIdFromIdentity,
  getUserByClerkId,
  requireUser,
} from "./model/auth";
import { getEntitlement } from "./model/entitlements";

const languagePreference = v.object({
  sourceLanguage: v.string(),
  targetLanguage: v.string(),
});

const platformRole = v.union(
  v.literal("interpreter"),
  v.literal("student"),
  v.literal("organization_admin"),
  v.literal("platform_admin"),
);

const subscriptionStatus = v.union(
  v.literal("free"),
  v.literal("professional"),
  v.literal("organization"),
);

/**
 * Applies a pending admin invite (role) to a user. `verifiedEmail` must come from
 * the Clerk identity token, never from client arguments.
 */
async function applyPendingInvite(ctx: MutationCtx, clerkId: string, verifiedEmail: string) {
  const invites = await ctx.db
    .query("invites")
    .withIndex("by_email", (q) => q.eq("email", verifiedEmail))
    .collect();
  const invite = invites
    .filter((candidate) => candidate.status === "pending")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  if (!invite) {
    return;
  }

  const user = await getUserByClerkId(ctx, clerkId);

  if (!user) {
    return;
  }

  const now = new Date().toISOString();
  await ctx.db.patch(user._id, { role: invite.role, updatedAt: now });
  await ctx.db.patch(invite._id, { status: "accepted", acceptedAt: now });
}

function cleanLanguagePairs(
  pairs: Array<{ sourceLanguage: string; targetLanguage: string }>,
) {
  return pairs
    .map((pair) => ({
      sourceLanguage: pair.sourceLanguage.trim(),
      targetLanguage: pair.targetLanguage.trim(),
    }))
    .filter((pair) => pair.sourceLanguage && pair.targetLanguage)
    .slice(0, 10);
}

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    return getUserByClerkId(ctx, getClerkIdFromIdentity(identity));
  },
});

/**
 * Everything the app shell needs about the signed-in user in one subscription:
 * profile, plan and remaining practice minutes.
 */
export const me = query({
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

    return {
      user,
      entitlement: await getEntitlement(ctx, user),
    };
  },
});

/**
 * Creates or refreshes the signed-in user's profile from their Clerk identity.
 *
 * Roles are never accepted from the client; they are changed only through
 * `users:setRole` (internal, run from the Convex dashboard or CLI).
 */
export const syncCurrentUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = getClerkIdFromIdentity(identity);
    const existing = await getUserByClerkId(ctx, clerkId);
    const now = new Date().toISOString();
    const verifiedEmail =
      identity.email && identity.emailVerified !== false ? identity.email.trim().toLowerCase() : null;
    const email = (verifiedEmail ?? args.email).trim().toLowerCase();
    const name = args.name.trim().slice(0, 120) || "Interpreter";

    if (existing) {
      if (
        existing.email !== email ||
        existing.name !== name ||
        existing.imageUrl !== args.imageUrl ||
        existing.emailVerified !== Boolean(verifiedEmail)
      ) {
        await ctx.db.patch(existing._id, {
          email: email || existing.email,
          emailVerified: Boolean(verifiedEmail),
          name,
          imageUrl: args.imageUrl ?? existing.imageUrl,
          updatedAt: now,
        });
      }

      if (verifiedEmail) {
        await applyPendingInvite(ctx, clerkId, verifiedEmail);
      }

      return { created: false };
    }

    await ctx.db.insert("users", {
      clerkId,
      email,
      emailVerified: Boolean(verifiedEmail),
      name,
      imageUrl: args.imageUrl,
      role: "interpreter",
      subscriptionStatus: "free",
      languagePreferences: [],
      createdAt: now,
      updatedAt: now,
    });

    if (verifiedEmail) {
      await applyPendingInvite(ctx, clerkId, verifiedEmail);
    }

    return { created: true };
  },
});

export const updateLanguagePreferences = mutation({
  args: {
    languagePreferences: v.array(languagePreference),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    await ctx.db.patch(user._id, {
      languagePreferences: cleanLanguagePairs(args.languagePreferences),
      updatedAt: new Date().toISOString(),
    });

    return { ok: true };
  },
});

/** Saves the answers from the first-run welcome flow. */
export const completeOnboarding = mutation({
  args: {
    practiceGoal: v.string(),
    languagePair: languagePreference,
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const [pair] = cleanLanguagePairs([args.languagePair]);

    if (!pair) {
      throw new Error("Choose a language pair to continue.");
    }

    const otherPairs = (user.languagePreferences ?? []).filter(
      (existing) =>
        existing.sourceLanguage.toLowerCase() !== pair.sourceLanguage.toLowerCase() ||
        existing.targetLanguage.toLowerCase() !== pair.targetLanguage.toLowerCase(),
    );
    const now = new Date().toISOString();

    await ctx.db.patch(user._id, {
      practiceGoal: args.practiceGoal.trim().slice(0, 60),
      languagePreferences: [pair, ...otherPairs].slice(0, 10),
      onboardedAt: user.onboardedAt ?? now,
      updatedAt: now,
    });

    return { ok: true };
  },
});

/** Applies a pending invite to an existing account (invited after signing up). */
export const applyInviteForEmail = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (user?.emailVerified) {
      await applyPendingInvite(ctx, user.clerkId, email);
    }
  },
});

export const getByClerkIdInternal = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => getUserByClerkId(ctx, args.clerkId),
});

export const getByStripeCustomerIdInternal = internalQuery({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("users")
      .withIndex("by_stripeCustomerId", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId),
      )
      .unique(),
});

/**
 * Promotes or demotes a user. Run from the Convex dashboard or CLI, e.g.
 * `npx convex run users:setRole '{"email":"you@example.com","role":"platform_admin"}'`
 */
export const setRole = internalMutation({
  args: { email: v.string(), role: platformRole },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.trim().toLowerCase()))
      .unique();

    if (!user) {
      throw new Error(`No user with email ${args.email}`);
    }

    await ctx.db.patch(user._id, {
      role: args.role,
      updatedAt: new Date().toISOString(),
    });

    return { ok: true, clerkId: user.clerkId };
  },
});

export const setStripeCustomerId = internalMutation({
  args: { clerkId: v.string(), stripeCustomerId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.clerkId);

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      stripeCustomerId: args.stripeCustomerId,
      updatedAt: new Date().toISOString(),
    });
  },
});

/** Applies a Stripe subscription state change. Called only from the webhook. */
export const applySubscription = internalMutation({
  args: {
    clerkId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripeSubscriptionStatus: v.optional(v.string()),
    subscriptionStatus,
  },
  handler: async (ctx, args) => {
    let user = args.clerkId ? await getUserByClerkId(ctx, args.clerkId) : null;

    if (!user && args.stripeCustomerId) {
      user = await ctx.db
        .query("users")
        .withIndex("by_stripeCustomerId", (q) =>
          q.eq("stripeCustomerId", args.stripeCustomerId!),
        )
        .unique();
    }

    if (!user) {
      return { updated: false };
    }

    await ctx.db.patch(user._id, {
      subscriptionStatus: args.subscriptionStatus,
      stripeCustomerId: args.stripeCustomerId ?? user.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId ?? user.stripeSubscriptionId,
      stripeSubscriptionStatus:
        args.stripeSubscriptionStatus ?? user.stripeSubscriptionStatus,
      updatedAt: new Date().toISOString(),
    });

    return { updated: true };
  },
});
