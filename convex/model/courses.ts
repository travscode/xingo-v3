import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getClerkIdFromIdentity, getUserByClerkId } from "./auth";
import type { Entitlement } from "./entitlements";
import { creatorEarningCents } from "../../lib/marketplace";

type Ctx = QueryCtx | MutationCtx;

export function isCommunityCourse(course: Pick<Doc<"modules">, "source">) {
  return course.source === "community";
}

export async function getCourse(ctx: Ctx, moduleId: string) {
  return ctx.db
    .query("modules")
    .withIndex("by_public_id", (q) => q.eq("id", moduleId))
    .unique();
}

export async function getListing(ctx: Ctx, moduleId: string) {
  return ctx.db
    .query("courseListings")
    .withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId))
    .unique();
}

export function isCourseOwner(
  user: Pick<Doc<"users">, "clerkId"> | null,
  course: Pick<Doc<"modules">, "source" | "ownerClerkId">,
) {
  return Boolean(user && isCommunityCourse(course) && course.ownerClerkId === user.clerkId);
}

/**
 * Who may practise a course. XINGO courses: everyone (plan rules apply separately).
 * Community courses: anyone while published; the owner and platform admins always.
 */
export function canPractiseCourse(
  user: Pick<Doc<"users">, "clerkId" | "role"> | null,
  course: Pick<Doc<"modules">, "source" | "ownerClerkId">,
  listing: Pick<Doc<"courseListings">, "status"> | null,
) {
  if (!isCommunityCourse(course)) return true;
  if (user?.role === "platform_admin" || isCourseOwner(user, course)) return true;
  return listing?.status === "published";
}

/** Course ids the user added from the marketplace. */
export async function libraryModuleIds(ctx: Ctx, clerkId: string) {
  const items = await ctx.db
    .query("libraryItems")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .collect();
  return new Set(items.map((item) => item.moduleId));
}

/**
 * Community courses never appear in someone's library unless they added them
 * (and they're still published) or they own them.
 */
export function inLibrary(
  course: Pick<Doc<"modules">, "id" | "source" | "ownerClerkId">,
  user: Pick<Doc<"users">, "clerkId"> | null,
  added: Set<string>,
  publishedIds: Set<string>,
) {
  if (!isCommunityCourse(course)) return true;
  if (isCourseOwner(user, course)) return true;
  return added.has(course.id) && publishedIds.has(course.id);
}

export async function publishedCommunityIds(ctx: Ctx) {
  const listings = await ctx.db
    .query("courseListings")
    .withIndex("by_status", (q) => q.eq("status", "published"))
    .collect();
  return new Set(listings.map((listing) => listing.moduleId));
}

/**
 * Credits the course creator for a charged attempt (D-031). Creators earn a share
 * of the net value of *paid* minutes; their own practice and admin practice earn nothing.
 */
export async function recordCreatorEarning(
  ctx: MutationCtx,
  attempt: Pick<Doc<"sessions">, "id" | "clerkId" | "moduleId">,
  learner: Doc<"users">,
  entitlement: Entitlement,
  split: { fromAllowance: number; fromPacks: number; charged: number },
  nowIso: string,
) {
  if (split.charged <= 0 || learner.role === "platform_admin") return;

  const course = await getCourse(ctx, attempt.moduleId);
  if (!course || !isCommunityCourse(course) || !course.ownerClerkId || course.ownerClerkId === attempt.clerkId) return;
  // XINGO Originals (house studios) are owned by "house:<handle>" and never earn (D-038).
  if (isHouseOwner(course.ownerClerkId)) return;
  // Organisation courses don't earn creator revenue (D-039).
  if ((await getListing(ctx, course.id))?.orgHandle) return;

  const existing = await ctx.db
    .query("creatorEarnings")
    .withIndex("by_attemptId", (q) => q.eq("attemptId", attempt.id))
    .first();
  if (existing) return;

  const amountCents = creatorEarningCents({ ...split, plan: entitlement.plan });
  const paidMinutes = (amountCents > 0 ? split.fromAllowance : 0) + split.fromPacks;

  await ctx.db.insert("creatorEarnings", {
    ownerClerkId: course.ownerClerkId,
    moduleId: course.id,
    attemptId: attempt.id,
    learnerClerkId: attempt.clerkId,
    minutes: split.charged,
    paidMinutes: entitlement.plan === "free" ? split.fromPacks : paidMinutes,
    amountCents,
    createdAt: nowIso,
  });
}


/**
 * Predicate for the generic list/get queries: hides community courses that aren't
 * published unless the caller owns them or is an admin.
 */
export async function courseVisibility(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  const user = identity ? await getUserByClerkId(ctx, getClerkIdFromIdentity(identity)) : null;
  const [published, communityCourses] = await Promise.all([
    publishedCommunityIds(ctx),
    ctx.db.query("modules").collect(),
  ]);
  const hidden = new Set(
    communityCourses
      .filter((course) => isCommunityCourse(course) && !published.has(course.id))
      .filter((course) => user?.role !== "platform_admin" && course.ownerClerkId !== user?.clerkId)
      .map((course) => course.id),
  );

  return (moduleId: string) => !hidden.has(moduleId);
}

/** Owner id used for XINGO Originals studios (no user account behind it). */
export function houseOwnerId(handle: string) {
  return `house:${handle}`;
}

export function isHouseOwner(ownerClerkId: string | undefined) {
  return Boolean(ownerClerkId?.startsWith("house:"));
}

/** Counts a finished practice session (and a pass) on a community course's listing. */
export async function bumpCourseCounters(ctx: MutationCtx, moduleId: string, field: "practiceCount" | "passCount") {
  const listing = await getListing(ctx, moduleId);
  if (!listing) return;
  await ctx.db.patch(listing._id, { [field]: (listing[field] ?? 0) + 1 });
}

/**
 * Deletes a marketplace course and everything hanging off it: scenarios, library
 * entries, ratings, view counts, its listing and its place in organisation
 * collections. Learners' past results and creators' recorded earnings are kept.
 */
export async function deleteCommunityCourse(ctx: MutationCtx, moduleId: string) {
  const listing = await getListing(ctx, moduleId);
  const course = await getCourse(ctx, moduleId);
  if (!listing || !course || !isCommunityCourse(course)) throw new Error("Course not found");

  for (const scenario of await ctx.db.query("scenarios").withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId)).collect()) {
    await ctx.db.delete(scenario._id);
  }
  for (const item of await ctx.db.query("libraryItems").withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId)).collect()) {
    await ctx.db.delete(item._id);
  }
  for (const rating of await ctx.db.query("courseRatings").withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId)).collect()) {
    await ctx.db.delete(rating._id);
  }
  for (const view of await ctx.db.query("courseViews").withIndex("by_module_day", (q) => q.eq("moduleId", moduleId)).collect()) {
    await ctx.db.delete(view._id);
  }
  if (listing.orgHandle) {
    const collections = await ctx.db.query("orgCollections").withIndex("by_org", (q) => q.eq("orgHandle", listing.orgHandle!)).collect();
    for (const collection of collections.filter((c) => c.moduleIds.includes(moduleId))) {
      await ctx.db.patch(collection._id, { moduleIds: collection.moduleIds.filter((id) => id !== moduleId) });
    }
  }
  await ctx.db.delete(listing._id);
  await ctx.db.delete(course._id);
}
