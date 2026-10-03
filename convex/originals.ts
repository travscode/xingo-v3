import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { buildScenario } from "./marketplace";
import { houseOwnerId } from "./model/courses";
import { originals } from "./content/originals/data";
import { droppedSlugs, ugcCreators } from "./content/originals/ugc";
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

/** Everything the image script needs: brand briefs, course banner briefs and characters. */
export const imageBriefs = internalQuery({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const creator = originals.find((item) => item.handle === args.handle);
    if (!creator) return null;
    const characters: Array<{ scenarioId: string; agent: "aiAgentA" | "aiAgentB"; name: string; role: string; voice: string; demeanor: string; setting: string }> = [];
    for (const course of creator.courses) {
      const moduleId = `${communityCourseIdPrefix(course.kind)}${course.slug}`.slice(0, 64);
      course.scenarios.forEach((scenario, index) => {
        const scenarioId = `${moduleId}-s${index + 1}`;
        characters.push({ scenarioId, agent: "aiAgentA", name: scenario.character.name, role: scenario.character.role, voice: scenario.character.voice, demeanor: scenario.character.demeanor, setting: scenario.title });
        if (course.kind === "interpreting" && scenario.client) {
          characters.push({ scenarioId, agent: "aiAgentB", name: scenario.client.name, role: scenario.client.role, voice: scenario.client.voice, demeanor: scenario.client.demeanor, setting: scenario.title });
        }
      });
    }
    // Skip anything that already has an image (re-runs only fill gaps).
    const profile = await ctx.db.query("creatorProfiles").withIndex("by_handle", (q) => q.eq("handle", creator.handle)).unique();
    const listings = await ctx.db.query("courseListings").withIndex("by_creatorHandle", (q) => q.eq("creatorHandle", creator.handle)).collect();
    const bannered = new Set(listings.filter((l) => l.bannerStorageId).map((l) => l.slug));
    const pending = [];
    for (const character of characters) {
      const scenario = await ctx.db.query("scenarios").withIndex("by_public_id", (q) => q.eq("id", character.scenarioId)).unique();
      if (scenario && !scenario[character.agent]?.avatarStorageId) pending.push(character);
    }
    return {
      handle: creator.handle,
      displayName: creator.displayName,
      visualStyle: creator.visualStyle,
      logoBrief: creator.logoBrief,
      avatarBrief: creator.avatarBrief,
      needs: { logo: !profile?.logoStorageId, avatar: !profile?.avatarStorageId, banner: !profile?.bannerStorageId },
      courses: creator.courses.filter((c) => !bannered.has(c.slug)).map((c) => ({ slug: c.slug, title: c.title, bannerBrief: c.bannerBrief })),
      characters: pending,
    };
  },
});

// ---- Reshape into natural, account-style creators (convex/content/originals/ugc.ts) ----

export const ugcHandles = internalQuery({
  args: {},
  handler: async () => ugcCreators.map((creator) => creator.handle),
});

/** Creates/updates one account-style creator and moves its courses onto it (trimming scenarios). */
export const applyUgcCreator = internalMutation({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const creator = ugcCreators.find((item) => item.handle === args.handle);
    if (!creator) throw new Error(`Unknown creator ${args.handle}`);
    const owner = houseOwnerId(creator.handle);
    const now = new Date().toISOString();

    const existing = await ctx.db.query("creatorProfiles").withIndex("by_handle", (q) => q.eq("handle", creator.handle)).unique();
    const fields = {
      displayName: creator.displayName,
      tagline: creator.tagline,
      bio: creator.bio,
      location: creator.location,
      accent: creator.accent,
    };
    if (existing) await ctx.db.patch(existing._id, fields);
    else await ctx.db.insert("creatorProfiles", { handle: creator.handle, ...fields, isHouse: true, ownerClerkId: owner, createdAt: now });

    let moved = 0;
    let trimmed = 0;
    for (const item of creator.courses) {
      const listing = await ctx.db.query("courseListings").withIndex("by_slug", (q) => q.eq("slug", item.slug)).unique();
      if (!listing) continue;
      await ctx.db.patch(listing._id, {
        creatorHandle: creator.handle,
        creatorName: creator.displayName,
        ownerClerkId: owner,
        ...(item.title ? { title: item.title } : {}),
        ...(item.tagline ? { tagline: item.tagline } : {}),
        // Illustrated studio images are replaced by photo-style ones.
        bannerStorageId: undefined,
        logoStorageId: undefined,
        updatedAt: now,
      });
      const course = await ctx.db.query("modules").withIndex("by_public_id", (q) => q.eq("id", listing.moduleId)).unique();
      if (course) await ctx.db.patch(course._id, { ownerClerkId: owner, ...(item.title ? { title: item.title } : {}) });
      const scenarios = await ctx.db.query("scenarios").withIndex("by_moduleId", (q) => q.eq("moduleId", listing.moduleId)).collect();
      for (const scenario of scenarios.sort((a, b) => a.id.localeCompare(b.id)).slice(item.keepScenarios)) {
        await ctx.db.delete(scenario._id);
        trimmed += 1;
      }
      moved += 1;
    }
    return { handle: creator.handle, moved, trimmed };
  },
});

/** Deletes dropped courses and the old studio profiles that no longer own anything. */
export const applyUgcDrops = internalMutation({
  args: {},
  handler: async (ctx) => {
    let deleted = 0;
    for (const slug of droppedSlugs) {
      const listing = await ctx.db.query("courseListings").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
      if (!listing) continue;
      for (const s of await ctx.db.query("scenarios").withIndex("by_moduleId", (q) => q.eq("moduleId", listing.moduleId)).collect()) await ctx.db.delete(s._id);
      for (const i of await ctx.db.query("libraryItems").withIndex("by_moduleId", (q) => q.eq("moduleId", listing.moduleId)).collect()) await ctx.db.delete(i._id);
      for (const r of await ctx.db.query("courseRatings").withIndex("by_moduleId", (q) => q.eq("moduleId", listing.moduleId)).collect()) await ctx.db.delete(r._id);
      const course = await ctx.db.query("modules").withIndex("by_public_id", (q) => q.eq("id", listing.moduleId)).unique();
      if (course) await ctx.db.delete(course._id);
      await ctx.db.delete(listing._id);
      deleted += 1;
    }
    const keep = new Set(ugcCreators.map((creator) => creator.handle));
    let profilesRemoved = 0;
    for (const profile of await ctx.db.query("creatorProfiles").collect()) {
      if (!profile.isHouse || keep.has(profile.handle)) continue;
      const owns = await ctx.db.query("courseListings").withIndex("by_creatorHandle", (q) => q.eq("creatorHandle", profile.handle)).first();
      if (!owns) {
        await ctx.db.delete(profile._id);
        profilesRemoved += 1;
      }
    }
    return { deleted, profilesRemoved };
  },
});

/** Briefs for the photo-style images still missing for an account-style creator. */
export const ugcImageBriefs = internalQuery({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const creator = ugcCreators.find((item) => item.handle === args.handle);
    if (!creator) return null;
    const profile = await ctx.db.query("creatorProfiles").withIndex("by_handle", (q) => q.eq("handle", creator.handle)).unique();
    const courses = [];
    const characters = [];
    for (const item of creator.courses) {
      const listing = await ctx.db.query("courseListings").withIndex("by_slug", (q) => q.eq("slug", item.slug)).unique();
      if (!listing) continue;
      if (!listing.bannerStorageId) courses.push({ slug: item.slug, bannerBrief: item.bannerBrief });
      const scenarios = await ctx.db.query("scenarios").withIndex("by_moduleId", (q) => q.eq("moduleId", listing.moduleId)).collect();
      for (const scenario of scenarios) {
        for (const agent of ["aiAgentA", "aiAgentB"] as const) {
          const person = scenario[agent];
          if (person && !person.avatarStorageId) {
            characters.push({ scenarioId: scenario.id, agent, name: person.name ?? person.role, role: person.role, voice: person.voice, demeanor: person.demeanor ?? "", setting: scenario.title });
          }
        }
      }
    }
    return {
      handle: creator.handle,
      avatarBrief: profile?.avatarStorageId ? null : creator.avatarBrief,
      bannerBrief: profile?.bannerStorageId || !creator.bannerBrief ? null : creator.bannerBrief,
      courses,
      characters,
    };
  },
});
