import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type AuthCtx = QueryCtx | MutationCtx;

export function getClerkIdFromIdentity(identity: {
  subject?: string | null;
  tokenIdentifier: string;
}) {
  return identity.subject ?? identity.tokenIdentifier;
}

/** Returns the signed-in Clerk id, or null for anonymous callers. */
export async function getOptionalClerkId(ctx: { auth: AuthCtx["auth"] }) {
  const identity = await ctx.auth.getUserIdentity();
  return identity ? getClerkIdFromIdentity(identity) : null;
}

export async function requireClerkId(ctx: { auth: AuthCtx["auth"] }) {
  const clerkId = await getOptionalClerkId(ctx);

  if (!clerkId) {
    throw new Error("Not authenticated");
  }

  return clerkId;
}

export async function getUserByClerkId(ctx: AuthCtx, clerkId: string) {
  return ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .unique();
}

type RoleHolder = { role?: Doc<"users">["role"]; previewAs?: Doc<"users">["previewAs"] };

/**
 * Whether learner-facing rules should treat this person as a platform admin: true for
 * admins unless they're previewing the app as a member (D-044). Admin tools, earnings
 * and emails use the real role instead.
 */
export function actsAsAdmin(user: RoleHolder | null | undefined) {
  return user?.role === "platform_admin" && !user.previewAs;
}

/** The member type a platform admin is previewing as, or null (non-admins never preview). */
export function previewOf(user: RoleHolder | null | undefined) {
  return user?.role === "platform_admin" ? (user.previewAs ?? null) : null;
}

/** Returns the signed-in user's profile, throwing if it has not been synced yet. */
export async function requireUser(ctx: AuthCtx) {
  const clerkId = await requireClerkId(ctx);
  const user = await getUserByClerkId(ctx, clerkId);

  if (!user) {
    throw new Error("User profile not found");
  }

  return user;
}

export async function requirePlatformAdmin(ctx: AuthCtx) {
  const user = await requireUser(ctx);

  if (user.role !== "platform_admin") {
    throw new Error("Not authorized");
  }

  return user;
}
