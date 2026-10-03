import { ConvexError, v } from "convex/values";
import { getBillingMonthKey } from "../lib/plans";
import { ORG_MAX_MONTHLY_MINUTES } from "../lib/orgs";
import { mutation, query } from "./_generated/server";
import { requirePlatformAdmin } from "./model/auth";
import { getListing, houseOwnerId } from "./model/courses";

/**
 * Admin overrides for the whole marketplace (D-038): edit any creator profile,
 * move courses between creators, delete courses, remove reviews. Editing a
 * course's page and scenarios uses the normal editor, which admins can open
 * for any course (/marketplace/manage/<moduleId>).
 */

export const creators = query({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);
    const [profiles, listings] = await Promise.all([ctx.db.query("creatorProfiles").collect(), ctx.db.query("courseListings").collect()]);
    const counts = new Map<string, number>();
    for (const listing of listings) if (listing.creatorHandle) counts.set(listing.creatorHandle, (counts.get(listing.creatorHandle) ?? 0) + 1);
    return Promise.all(
      profiles
        .sort((a, b) => a.displayName.localeCompare(b.displayName))
        .map(async (p) => ({
          handle: p.handle,
          displayName: p.displayName,
          tagline: p.tagline,
          bio: p.bio,
          location: p.location ?? "",
          accent: p.accent,
          isHouse: p.isHouse,
          isOrganization: p.kind === "organization",
          verified: Boolean(p.verifiedAt),
          orgMonthlyMinutes: p.orgMonthlyMinutes ?? 0,
          orgMinutesUsed:
            p.kind === "organization"
              ? (
                  await ctx.db
                    .query("orgUsageCharges")
                    .withIndex("by_org_month", (q) => q.eq("orgHandle", p.handle).eq("billingMonth", getBillingMonthKey(new Date())))
                    .collect()
                ).reduce((sum, charge) => sum + charge.minutes, 0)
              : 0,
          avatarStorageId: p.avatarStorageId,
          bannerStorageId: p.bannerStorageId,
          avatarUrl: p.avatarStorageId ? await ctx.storage.getUrl(p.avatarStorageId) : null,
          bannerUrl: p.bannerStorageId ? await ctx.storage.getUrl(p.bannerStorageId) : null,
          courses: counts.get(p.handle) ?? 0,
        })),
    );
  },
});

export const updateCreator = mutation({
  args: {
    handle: v.string(),
    displayName: v.string(),
    tagline: v.string(),
    bio: v.string(),
    location: v.optional(v.string()),
    accent: v.string(),
    avatarStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    bannerStorageId: v.optional(v.union(v.id("_storage"), v.null())),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const profile = await ctx.db.query("creatorProfiles").withIndex("by_handle", (q) => q.eq("handle", args.handle)).unique();
    if (!profile) throw new Error("Creator not found");
    const displayName = args.displayName.trim().slice(0, 80) || profile.displayName;
    await ctx.db.patch(profile._id, {
      displayName,
      tagline: args.tagline.trim().slice(0, 140),
      bio: args.bio.trim().slice(0, 1200),
      location: args.location?.trim().slice(0, 60) || undefined,
      accent: /^#[0-9a-f]{6}$/i.test(args.accent) ? args.accent : profile.accent,
      ...(args.avatarStorageId !== undefined ? { avatarStorageId: args.avatarStorageId ?? undefined } : {}),
      ...(args.bannerStorageId !== undefined ? { bannerStorageId: args.bannerStorageId ?? undefined } : {}),
    });
    // Keep the name shown on this creator's course cards in step.
    if (displayName !== profile.displayName) {
      const listings = await ctx.db.query("courseListings").withIndex("by_creatorHandle", (q) => q.eq("creatorHandle", profile.handle)).collect();
      for (const listing of listings) await ctx.db.patch(listing._id, { creatorName: displayName });
    }
    return { ok: true };
  },
});

export const moveCourse = mutation({
  args: { moduleId: v.string(), toHandle: v.string() },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const listing = await getListing(ctx, args.moduleId);
    const target = await ctx.db.query("creatorProfiles").withIndex("by_handle", (q) => q.eq("handle", args.toHandle)).unique();
    if (!listing || !target) throw new Error("Course or creator not found");
    const owner = target.ownerClerkId ?? houseOwnerId(target.handle);
    await ctx.db.patch(listing._id, { creatorHandle: target.handle, creatorName: target.displayName, ownerClerkId: owner, updatedAt: new Date().toISOString() });
    const course = await ctx.db.query("modules").withIndex("by_public_id", (q) => q.eq("id", args.moduleId)).unique();
    if (course) await ctx.db.patch(course._id, { ownerClerkId: owner });
    return { ok: true };
  },
});

/** Permanently deletes a marketplace course (page, scenarios, library entries, ratings). Learners' past results are kept. */
export const deleteCourse = mutation({
  args: { moduleId: v.string() },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const listing = await getListing(ctx, args.moduleId);
    if (!listing) throw new Error("Course not found");
    const course = await ctx.db.query("modules").withIndex("by_public_id", (q) => q.eq("id", args.moduleId)).unique();
    if (course?.source !== "community") throw new Error("Only marketplace courses can be deleted here");

    for (const scenario of await ctx.db.query("scenarios").withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId)).collect()) {
      await ctx.db.delete(scenario._id);
    }
    for (const item of await ctx.db.query("libraryItems").withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId)).collect()) {
      await ctx.db.delete(item._id);
    }
    for (const rating of await ctx.db.query("courseRatings").withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId)).collect()) {
      await ctx.db.delete(rating._id);
    }
    await ctx.db.delete(listing._id);
    if (course) await ctx.db.delete(course._id);
    return { ok: true };
  },
});

export const deleteRating = mutation({
  args: { ratingId: v.id("courseRatings") },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const rating = await ctx.db.get(args.ratingId);
    if (!rating) return { ok: true };
    const listing = await getListing(ctx, rating.moduleId);
    if (listing) {
      await ctx.db.patch(listing._id, {
        ratingSum: Math.max(0, (listing.ratingSum ?? 0) - rating.stars),
        ratingCount: Math.max(0, (listing.ratingCount ?? 0) - 1),
      });
    }
    await ctx.db.delete(rating._id);
    return { ok: true };
  },
});

export const uploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

/** Shows or removes the verified tick on any creator or organisation (D-039). */
export const setVerified = mutation({
  args: { handle: v.string(), verified: v.boolean() },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const profile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .unique();
    if (!profile) throw new ConvexError("ORG_NOT_FOUND");
    await ctx.db.patch(profile._id, { verifiedAt: args.verified ? new Date().toISOString() : undefined });
  },
});

/** Sets an organisation's monthly minute pool (invoiced outside XINGO for now, D-039). */
export const setOrgMinutes = mutation({
  args: { handle: v.string(), monthlyMinutes: v.number() },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const profile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .unique();
    if (profile?.kind !== "organization") throw new ConvexError("ORG_NOT_FOUND");
    if (!Number.isFinite(args.monthlyMinutes) || args.monthlyMinutes < 0 || args.monthlyMinutes > ORG_MAX_MONTHLY_MINUTES) {
      throw new ConvexError("ORG_MINUTES_INVALID");
    }
    await ctx.db.patch(profile._id, { orgMonthlyMinutes: Math.round(args.monthlyMinutes) });
  },
});
