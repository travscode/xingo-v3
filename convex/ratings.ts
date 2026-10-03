import { ConvexError, v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { getClerkIdFromIdentity, getUserByClerkId, requireUser } from "./model/auth";
import { getListing } from "./model/courses";
import { averageRating } from "../lib/marketplace";

/**
 * Course ratings (D-038). Only learners who have finished at least one session
 * in a course can rate it; one rating each, editable. Totals are denormalised
 * on the listing (ratingSum / ratingCount) for fast sorting.
 */

async function hasPractised(ctx: QueryCtx, clerkId: string, moduleId: string) {
  const sessions = await ctx.db
    .query("sessions")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .collect();
  return sessions.some(
    (session) => session.moduleId === moduleId && session.completionStatus !== "in_progress" && session.completionStatus !== "abandoned",
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0] || "Learner";
}

export const rateCourse = mutation({
  args: { moduleId: v.string(), stars: v.number(), comment: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const listing = await getListing(ctx, args.moduleId);
    if (!listing || listing.status !== "published") throw new ConvexError("COURSE_UNAVAILABLE");
    if (listing.ownerClerkId === user.clerkId) throw new ConvexError("RATING_NOT_ALLOWED");
    if (!(await hasPractised(ctx, user.clerkId, args.moduleId))) throw new ConvexError("RATING_NEEDS_PRACTICE");

    const stars = Math.round(args.stars);
    if (stars < 1 || stars > 5) throw new Error("Choose 1 to 5 stars.");
    const comment = args.comment?.trim().slice(0, 600) || undefined;
    const now = new Date().toISOString();

    const existing = await ctx.db
      .query("courseRatings")
      .withIndex("by_clerk_module", (q) => q.eq("clerkId", user.clerkId).eq("moduleId", args.moduleId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { stars, comment, updatedAt: now });
      await ctx.db.patch(listing._id, { ratingSum: (listing.ratingSum ?? 0) - existing.stars + stars });
    } else {
      await ctx.db.insert("courseRatings", { moduleId: args.moduleId, clerkId: user.clerkId, stars, comment, createdAt: now, updatedAt: now });
      await ctx.db.patch(listing._id, { ratingSum: (listing.ratingSum ?? 0) + stars, ratingCount: (listing.ratingCount ?? 0) + 1 });
    }
    return { ok: true };
  },
});

/** Rating summary, recent reviews and what the viewer can do. */
export const forCourse = query({
  args: { moduleId: v.string() },
  handler: async (ctx, args) => {
    const listing = await getListing(ctx, args.moduleId);
    if (!listing) return null;

    const identity = await ctx.auth.getUserIdentity();
    const viewer = identity ? await getUserByClerkId(ctx, getClerkIdFromIdentity(identity)) : null;
    const ratings = await ctx.db
      .query("courseRatings")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
      .collect();
    const distribution = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: ratings.filter((r) => r.stars === stars).length }));
    const withComments = ratings.filter((r) => r.comment).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 12);
    const authors = await Promise.all(withComments.map((r) => getUserByClerkId(ctx, r.clerkId)));
    const mine: Doc<"courseRatings"> | undefined = viewer ? ratings.find((r) => r.clerkId === viewer.clerkId) : undefined;

    // The viewer's own progress in this course (passed scenarios).
    let progress: { passed: number; total: number } | null = null;
    if (viewer) {
      const [sessions, scenarios] = await Promise.all([
        ctx.db.query("sessions").withIndex("by_clerkId", (q) => q.eq("clerkId", viewer.clerkId)).collect(),
        ctx.db.query("scenarios").withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId)).collect(),
      ]);
      const passed = new Set(
        sessions.filter((s) => s.moduleId === args.moduleId && s.completionStatus === "completed").map((s) => s.scenarioId),
      );
      progress = { passed: scenarios.filter((s) => passed.has(s.id)).length, total: scenarios.length };
    }

    return {
      average: averageRating(listing),
      count: listing.ratingCount ?? 0,
      distribution,
      reviews: withComments.map((r, index) => ({
        id: r._id,
        stars: r.stars,
        comment: r.comment ?? "",
        author: initials(authors[index]?.name ?? "Learner"),
        date: r.updatedAt,
      })),
      mine: mine ? { stars: mine.stars, comment: mine.comment ?? "" } : null,
      canRate: Boolean(viewer && listing.ownerClerkId !== viewer.clerkId && (await hasPractised(ctx, viewer.clerkId, args.moduleId))),
      signedIn: Boolean(viewer),
      isAdmin: viewer?.role === "platform_admin",
      progress,
      practiceCount: listing.practiceCount ?? 0,
      passCount: listing.passCount ?? 0,
    };
  },
});
