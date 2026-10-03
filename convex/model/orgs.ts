import { ConvexError } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getBillingMonthKey } from "../../lib/plans";
import { canManageOrg, type OrgRole } from "../../lib/orgs";
import { requireUser } from "./auth";

/**
 * Organisations (D-039): an org is a creator profile with `kind: "organization"`,
 * a team (`orgMembers`), collections of courses (`orgCollections`) and invites
 * (`orgInvites`). Org courses can be restricted to the team and invited learners,
 * and members' practice of them can be paid from the org's minute pool.
 */

type Ctx = QueryCtx | MutationCtx;

export async function getProfile(ctx: Ctx, handle: string) {
  return ctx.db
    .query("creatorProfiles")
    .withIndex("by_handle", (q) => q.eq("handle", handle))
    .unique();
}

export async function getOrg(ctx: Ctx, handle: string) {
  const profile = await getProfile(ctx, handle);
  return profile?.kind === "organization" ? profile : null;
}

export async function getMembership(ctx: Ctx, orgHandle: string, clerkId: string) {
  return ctx.db
    .query("orgMembers")
    .withIndex("by_org_clerk", (q) => q.eq("orgHandle", orgHandle).eq("clerkId", clerkId))
    .unique();
}

/** The signed-in user's role in an org (platform admins act as owners), or throws. */
export async function requireOrgRole(ctx: Ctx, orgHandle: string, need: "member" | "manager" = "member") {
  const user = await requireUser(ctx);
  const org = await getOrg(ctx, orgHandle);
  if (!org) throw new ConvexError("ORG_NOT_FOUND");
  const membership = await getMembership(ctx, orgHandle, user.clerkId);
  const role: OrgRole | null = user.role === "platform_admin" ? "owner" : (membership?.role ?? null);
  if (!role || (need === "manager" && !canManageOrg(role))) throw new ConvexError("ORG_FORBIDDEN");
  return { user, org, role };
}

/** Collections in an org that contain a course. */
async function collectionsWithCourse(ctx: Ctx, orgHandle: string, moduleId: string) {
  const collections = await ctx.db
    .query("orgCollections")
    .withIndex("by_org", (q) => q.eq("orgHandle", orgHandle))
    .collect();
  return collections.filter((collection) => collection.moduleIds.includes(moduleId));
}

/** Active collection access rows for a user in an org. */
async function activeAccess(ctx: Ctx, orgHandle: string, clerkId: string) {
  const rows = await ctx.db
    .query("orgInvites")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .collect();
  return rows.filter((row) => row.orgHandle === orgHandle && row.collectionId && row.status === "active");
}

/**
 * Whether a user may open and practise a course. Unrestricted courses: anyone.
 * Restricted org courses: platform admins, the org team, the course's creator and
 * learners with active access to a collection that holds it.
 */
export async function hasCourseAccess(
  ctx: Ctx,
  user: Pick<Doc<"users">, "clerkId" | "role"> | null,
  listing: Pick<Doc<"courseListings">, "moduleId" | "ownerClerkId" | "orgHandle" | "restricted"> | null,
) {
  if (!listing?.restricted) return true;
  if (!user) return false;
  if (user.role === "platform_admin" || listing.ownerClerkId === user.clerkId) return true;
  if (!listing.orgHandle) return false;
  if (await getMembership(ctx, listing.orgHandle, user.clerkId)) return true;
  return hasCollectionAccessToCourse(ctx, listing.orgHandle, user.clerkId, listing.moduleId);
}

/** Does the user have active access to a collection containing this course? */
export async function hasCollectionAccessToCourse(ctx: Ctx, orgHandle: string, clerkId: string, moduleId: string) {
  const access = await activeAccess(ctx, orgHandle, clerkId);
  if (access.length === 0) return false;
  const holding = new Set((await collectionsWithCourse(ctx, orgHandle, moduleId)).map((collection) => collection._id));
  return access.some((row) => row.collectionId && holding.has(row.collectionId));
}

/**
 * Restricted unless the course sits in at least one public collection. Org courses
 * start restricted, so nothing a company makes is public until they put it in a
 * public collection.
 */
export async function syncCourseVisibility(ctx: MutationCtx, orgHandle: string, moduleId: string) {
  const listing = await ctx.db
    .query("courseListings")
    .withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId))
    .unique();
  if (!listing || listing.orgHandle !== orgHandle) return;
  const isPublic = (await collectionsWithCourse(ctx, orgHandle, moduleId)).some((collection) => collection.visibility === "public");
  if (Boolean(listing.restricted) === !isPublic) return;
  await ctx.db.patch(listing._id, { restricted: !isPublic });
}

export async function orgMinutesUsed(ctx: Ctx, orgHandle: string, now = new Date()) {
  const charges = await ctx.db
    .query("orgUsageCharges")
    .withIndex("by_org_month", (q) => q.eq("orgHandle", orgHandle).eq("billingMonth", getBillingMonthKey(now)))
    .collect();
  return charges.reduce((sum, charge) => sum + charge.minutes, 0);
}

export async function orgMinutesRemaining(ctx: Ctx, orgHandle: string, now = new Date()) {
  const org = await getOrg(ctx, orgHandle);
  const monthly = org?.orgMonthlyMinutes ?? 0;
  if (monthly <= 0) return 0;
  return Math.max(0, monthly - (await orgMinutesUsed(ctx, orgHandle, now)));
}

/**
 * Which org pays for this user's practice of this course, if any: the course's org,
 * when it has pool minutes left and the user is on its team or was given access to
 * a collection holding the course. Public learners always use their own minutes.
 */
export async function fundingOrgFor(
  ctx: Ctx,
  user: Pick<Doc<"users">, "clerkId">,
  listing: Pick<Doc<"courseListings">, "moduleId" | "orgHandle"> | null,
  now = new Date(),
) {
  const orgHandle = listing?.orgHandle;
  if (!orgHandle || !listing) return null;
  if ((await orgMinutesRemaining(ctx, orgHandle, now)) <= 0) return null;
  const eligible =
    Boolean(await getMembership(ctx, orgHandle, user.clerkId)) ||
    (await hasCollectionAccessToCourse(ctx, orgHandle, user.clerkId, listing.moduleId));
  return eligible ? orgHandle : null;
}

/** Adds every course in a collection to a learner's library (on access granted). */
export async function addCollectionToLibrary(ctx: MutationCtx, collection: Doc<"orgCollections">, clerkId: string) {
  const now = new Date().toISOString();
  for (const moduleId of collection.moduleIds) {
    const existing = await ctx.db
      .query("libraryItems")
      .withIndex("by_clerk_module", (q) => q.eq("clerkId", clerkId).eq("moduleId", moduleId))
      .unique();
    if (existing) continue;
    await ctx.db.insert("libraryItems", { clerkId, moduleId, addedAt: now });
    const listing = await ctx.db
      .query("courseListings")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId))
      .unique();
    if (listing) await ctx.db.patch(listing._id, { addCount: listing.addCount + 1 });
  }
}

export function newToken() {
  return `${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
}

/**
 * Turns pending invites for a verified email into access (collections) or team
 * membership. Called when someone signs in with that email.
 */
export async function activateInvitesForUser(ctx: MutationCtx, clerkId: string, verifiedEmail: string) {
  const pending = (
    await ctx.db
      .query("orgInvites")
      .withIndex("by_email", (q) => q.eq("email", verifiedEmail.trim().toLowerCase()))
      .collect()
  ).filter((row) => row.status === "invited");
  for (const invite of pending) await activateInvite(ctx, invite, clerkId);
  return pending.length;
}

export async function activateInvite(ctx: MutationCtx, invite: Doc<"orgInvites">, clerkId: string) {
  const now = new Date().toISOString();
  await ctx.db.patch(invite._id, { status: "active", clerkId, updatedAt: now });
  if (invite.collectionId) {
    const collection = await ctx.db.get(invite.collectionId);
    if (collection) await addCollectionToLibrary(ctx, collection, clerkId);
  } else if (invite.memberRole && !(await getMembership(ctx, invite.orgHandle, clerkId))) {
    await ctx.db.insert("orgMembers", { orgHandle: invite.orgHandle, clerkId, role: invite.memberRole, createdAt: now });
  }
}
