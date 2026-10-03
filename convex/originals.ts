import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { buildScenario } from "./marketplace";
import { houseOwnerId } from "./model/courses";
import { originals } from "./content/originals/data";
import { communityCourseIdPrefix } from "../lib/marketplace";
import { scenarioTimeLimitMinutes } from "../lib/plans";

/**
 * XINGO Originals (D-038): in-house marketplace studios. Seeded one creator per
 * call (insert-only, safe to re-run):
 *   npx convex run originals:seedCreator '{"handle":"…"}'
 * Images are attached separately (attachImages / attachScenarioAvatar).
 * Usage counts and ratings are never seeded — they come from real learners.
 */

export const handles = internalQuery({
  args: {},
  handler: async () => originals.map((creator) => creator.handle),
});

export const seedCreator = internalMutation({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const creator = originals.find((item) => item.handle === args.handle);
    if (!creator) throw new Error(`Unknown original ${args.handle}`);
    const now = new Date().toISOString();
    const owner = houseOwnerId(creator.handle);

    const profile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_handle", (q) => q.eq("handle", creator.handle))
      .unique();
    if (!profile) {
      await ctx.db.insert("creatorProfiles", {
        handle: creator.handle,
        displayName: creator.displayName,
        tagline: creator.tagline,
        bio: creator.bio,
        location: creator.location,
        accent: creator.accent,
        isHouse: true,
        ownerClerkId: owner,
        createdAt: now,
      });
    }

    let created = 0;
    for (const course of creator.courses) {
      const existing = await ctx.db
        .query("courseListings")
        .withIndex("by_slug", (q) => q.eq("slug", course.slug))
        .unique();
      if (existing) continue;

      const moduleId = `${communityCourseIdPrefix(course.kind)}${course.slug}`.slice(0, 64);
      const scenarios = course.scenarios.map((scenario) => buildScenario(course.kind, scenario));

      await ctx.db.insert("modules", {
        id: moduleId,
        title: course.title,
        description: course.tagline,
        industryCategory: "community",
        durationMinutes: scenarios.reduce((sum, scenario) => sum + scenarioTimeLimitMinutes(scenario), 0),
        difficultyLevel: "beginner",
        learningObjectives: course.whatYouGet,
        isFree: true,
        isAccredited: false,
        badgeIcon: "",
        createdAt: now,
        source: "community",
        ownerClerkId: owner,
      });
      await ctx.db.insert("courseListings", {
        moduleId,
        ownerClerkId: owner,
        status: "published",
        slug: course.slug,
        kind: course.kind,
        title: course.title,
        tagline: course.tagline,
        description: course.description,
        keywords: course.keywords,
        whatYouGet: course.whatYouGet,
        audience: course.audience,
        creatorName: creator.displayName,
        creatorHandle: creator.handle,
        certifications: [],
        guidelinesAcceptedAt: now,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
        viewCount: 0,
        addCount: 0,
      });
      for (const [index, scenario] of scenarios.entries()) {
        await ctx.db.insert("scenarios", { id: `${moduleId}-s${index + 1}`, moduleId, ...scenario });
      }
      created += 1;
    }

    return { handle: creator.handle, created };
  },
});

/** Attaches generated brand images (logo, avatar, profile banner, course banners). */
export const attachImages = internalMutation({
  args: {
    handle: v.string(),
    avatarStorageId: v.optional(v.id("_storage")),
    logoStorageId: v.optional(v.id("_storage")),
    bannerStorageId: v.optional(v.id("_storage")),
    courseBanners: v.optional(v.array(v.object({ slug: v.string(), storageId: v.id("_storage") }))),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .unique();
    if (!profile || !profile.isHouse) throw new Error("Only XINGO Originals can be updated here");

    await ctx.db.patch(profile._id, {
      ...(args.avatarStorageId ? { avatarStorageId: args.avatarStorageId } : {}),
      ...(args.logoStorageId ? { logoStorageId: args.logoStorageId } : {}),
      ...(args.bannerStorageId ? { bannerStorageId: args.bannerStorageId } : {}),
    });

    for (const banner of args.courseBanners ?? []) {
      const listing = await ctx.db
        .query("courseListings")
        .withIndex("by_slug", (q) => q.eq("slug", banner.slug))
        .unique();
      if (listing && listing.creatorHandle === args.handle) {
        await ctx.db.patch(listing._id, {
          bannerStorageId: banner.storageId,
          ...(args.logoStorageId ? { logoStorageId: args.logoStorageId } : {}),
        });
      }
    }
    return { ok: true };
  },
});

/** Sets the portrait for one AI character in an Originals scenario. */
export const attachScenarioAvatar = internalMutation({
  args: {
    scenarioId: v.string(),
    agent: v.union(v.literal("aiAgentA"), v.literal("aiAgentB")),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const scenario = await ctx.db
      .query("scenarios")
      .withIndex("by_public_id", (q) => q.eq("id", args.scenarioId))
      .unique();
    const participant = scenario?.[args.agent];
    if (!scenario || !participant) return { ok: false };
    await ctx.db.patch(scenario._id, { [args.agent]: { ...participant, avatarStorageId: args.storageId } });
    return { ok: true };
  },
});

/** Upload URL for the image script (run as an internal function, no user needed). */
export const uploadUrl = internalMutation({
  args: {},
  handler: async (ctx) => ctx.storage.generateUploadUrl(),
});
