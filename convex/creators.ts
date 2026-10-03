import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { getClerkIdFromIdentity, getUserByClerkId, requireUser } from "./model/auth";
import { averageRating, courseBadges, slugify } from "../lib/marketplace";

/**
 * Creator profiles (/marketplace/creators/<handle>). Real creators get one the
 * first time they create a course; XINGO Originals studios are seeded (D-038).
 */

type Ctx = QueryCtx | MutationCtx;

async function url(ctx: Ctx, id: Doc<"creatorProfiles">["avatarStorageId"]) {
  return id ? ctx.storage.getUrl(id) : null;
}

export async function profileCard(ctx: Ctx, profile: Doc<"creatorProfiles">) {
  return {
    handle: profile.handle,
    displayName: profile.displayName,
    tagline: profile.tagline,
    accent: profile.accent,
    isOriginal: profile.isHouse,
    avatarUrl: await url(ctx, profile.avatarStorageId),
    logoUrl: await url(ctx, profile.logoStorageId),
  };
}

/** Finds or creates the profile for a real creator; returns its handle. */
export async function ensureCreatorProfile(ctx: MutationCtx, user: Doc<"users">, displayName: string) {
  const existing = await ctx.db
    .query("creatorProfiles")
    .withIndex("by_owner", (q) => q.eq("ownerClerkId", user.clerkId))
    .first();
  if (existing) return existing.handle;

  const base = slugify(displayName || user.name, 32) || "creator";
  let handle = base;
  for (let index = 2; await ctx.db.query("creatorProfiles").withIndex("by_handle", (q) => q.eq("handle", handle)).first(); index += 1) {
    handle = `${base}-${index}`;
  }

  await ctx.db.insert("creatorProfiles", {
    handle,
    displayName: displayName || user.name,
    tagline: "",
    bio: "",
    accent: "#111111",
    isHouse: false,
    ownerClerkId: user.clerkId,
    createdAt: new Date().toISOString(),
  });
  return handle;
}

/** A creator's public page: profile, their published courses and real totals. */
export const profile = query({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .unique();
    if (!profile) return null;

    const identity = await ctx.auth.getUserIdentity();
    const viewer = identity ? await getUserByClerkId(ctx, getClerkIdFromIdentity(identity)) : null;
    const listings = (
      await ctx.db
        .query("courseListings")
        .withIndex("by_creatorHandle", (q) => q.eq("creatorHandle", profile.handle))
        .collect()
    ).filter((listing) => listing.status === "published");
    const added = viewer
      ? new Set(
          (await ctx.db.query("libraryItems").withIndex("by_clerkId", (q) => q.eq("clerkId", viewer.clerkId)).collect()).map(
            (item) => item.moduleId,
          ),
        )
      : new Set<string>();

    const courses = await Promise.all(
      listings
        .sort((a, b) => (b.addCount * 2 + (b.practiceCount ?? 0)) - (a.addCount * 2 + (a.practiceCount ?? 0)))
        .map(async (listing) => {
          const scenarios = await ctx.db
            .query("scenarios")
            .withIndex("by_moduleId", (q) => q.eq("moduleId", listing.moduleId))
            .collect();
          return {
            moduleId: listing.moduleId,
            slug: listing.slug,
            kind: listing.kind,
            title: listing.title,
            tagline: listing.tagline,
            creatorName: listing.creatorName,
            creatorHandle: listing.creatorHandle ?? null,
            isOriginal: profile.isHouse,
            certifications: listing.certifications.map((cert) => ({ name: cert.name, issuer: cert.issuer })),
            bannerUrl: listing.bannerStorageId ? await ctx.storage.getUrl(listing.bannerStorageId) : null,
            logoUrl: listing.logoStorageId ? await ctx.storage.getUrl(listing.logoStorageId) : null,
            scenarioCount: scenarios.length,
            addCount: listing.addCount,
            rating: averageRating(listing),
            ratingCount: listing.ratingCount ?? 0,
            practiceCount: listing.practiceCount ?? 0,
            passCount: listing.passCount ?? 0,
            badges: courseBadges(listing),
            inLibrary: added.has(listing.moduleId),
            isOwner: viewer?.clerkId === listing.ownerClerkId,
          };
        }),
    );

    const ratingSum = listings.reduce((sum, l) => sum + (l.ratingSum ?? 0), 0);
    const ratingCount = listings.reduce((sum, l) => sum + (l.ratingCount ?? 0), 0);

    return {
      ...(await profileCard(ctx, profile)),
      bio: profile.bio,
      location: profile.location ?? null,
      bannerUrl: await url(ctx, profile.bannerStorageId),
      isMine: Boolean(viewer && profile.ownerClerkId === viewer.clerkId),
      totals: {
        courses: courses.length,
        learners: listings.reduce((sum, l) => sum + l.addCount, 0),
        sessions: listings.reduce((sum, l) => sum + (l.practiceCount ?? 0), 0),
        rating: ratingCount ? Math.round((ratingSum / ratingCount) * 10) / 10 : null,
        ratingCount,
      },
      courses,
    };
  },
});

/** Creators with at least one published course, for the marketplace's creator row. */
export const featured = query({
  args: {},
  handler: async (ctx) => {
    const published = await ctx.db
      .query("courseListings")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    const counts = new Map<string, number>();
    for (const listing of published) {
      if (listing.creatorHandle) counts.set(listing.creatorHandle, (counts.get(listing.creatorHandle) ?? 0) + 1);
    }
    const profiles = await Promise.all(
      [...counts.keys()].map((handle) =>
        ctx.db
          .query("creatorProfiles")
          .withIndex("by_handle", (q) => q.eq("handle", handle))
          .unique(),
      ),
    );
    const cards = await Promise.all(
      profiles.filter((p): p is Doc<"creatorProfiles"> => p !== null).map(async (p) => ({ ...(await profileCard(ctx, p)), courses: counts.get(p.handle) ?? 0 })),
    );
    return cards.sort((a, b) => b.courses - a.courses).slice(0, 24);
  },
});

/** Lets a real creator edit their public profile. */
export const updateMine = mutation({
  args: { displayName: v.string(), tagline: v.string(), bio: v.string(), location: v.optional(v.string()), accent: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const profile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_owner", (q) => q.eq("ownerClerkId", user.clerkId))
      .first();
    if (!profile) throw new Error("Create a course first to get a creator page.");
    await ctx.db.patch(profile._id, {
      displayName: args.displayName.trim().slice(0, 80) || profile.displayName,
      tagline: args.tagline.trim().slice(0, 140),
      bio: args.bio.trim().slice(0, 1200),
      location: args.location?.trim().slice(0, 60) || undefined,
      accent: args.accent && /^#[0-9a-f]{6}$/i.test(args.accent) ? args.accent : profile.accent,
    });
    return { handle: profile.handle };
  },
});

/** The signed-in creator's own profile (for the editor), or null. */
export const mine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const profile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_owner", (q) => q.eq("ownerClerkId", getClerkIdFromIdentity(identity)))
      .first();
    return profile ? { handle: profile.handle, displayName: profile.displayName, tagline: profile.tagline, bio: profile.bio, location: profile.location ?? "", accent: profile.accent } : null;
  },
});
