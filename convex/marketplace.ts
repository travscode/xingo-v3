import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { internalQuery, mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { getClerkIdFromIdentity, getUserByClerkId, requirePlatformAdmin, requireUser } from "./model/auth";
import { getCourse, getListing, isCourseOwner, isHouseOwner, libraryModuleIds } from "./model/courses";
import { normalizeAgent } from "./model/scenario";
import { ensureCreatorProfile } from "./creators";
import {
  communityCourseIdPrefix,
  EARNINGS_HOLD_DAYS,
  isCreatorVoice,
  LISTING_LIMITS,
  listingMatches,
  normalizeKeywords,
  slugify,
  averageRating,
  compareCourses,
  courseBadges,
} from "../lib/marketplace";
import { scenarioTimeLimitMinutes } from "../lib/plans";
import { queueEmail } from "./model/notify";

/**
 * Community marketplace (D-031). Creators publish courses; learners add them to
 * their library. Everything that touches ownership, publishing or money is checked
 * here, never in the client.
 */

type Ctx = QueryCtx | MutationCtx;

const kind = v.union(v.literal("roleplay"), v.literal("interpreting"));
const difficulty = v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"));

/** A participant as creators describe it (a short form, not the full admin editor). */
const character = v.object({
  name: v.optional(v.string()),
  role: v.string(),
  goal: v.string(),
  demeanor: v.optional(v.string()),
  openingLine: v.optional(v.string()),
  endCondition: v.optional(v.string()),
  voice: v.optional(v.string()),
  avatarStorageId: v.optional(v.id("_storage")),
});

const scenarioInput = v.object({
  title: v.string(),
  description: v.string(),
  difficultyLevel: v.optional(difficulty),
  character,
  /** Interpreting only: the person who speaks the learner's other language. */
  client: v.optional(character),
  /** Role-play only. */
  learnerRole: v.optional(v.string()),
  taskCard: v.optional(v.string()),
  learnerOpens: v.optional(v.boolean()),
  timeLimitMinutes: v.optional(v.number()),
});

const certification = v.object({
  name: v.string(),
  issuer: v.optional(v.string()),
  url: v.optional(v.string()),
  logoStorageId: v.optional(v.id("_storage")),
});

const clip = (value: string | undefined, max: number) => (value ?? "").trim().slice(0, max);
const optionalClip = (value: string | undefined, max: number) => clip(value, max) || undefined;

async function optionalUser(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  return identity ? getUserByClerkId(ctx, getClerkIdFromIdentity(identity)) : null;
}

async function storageUrl(ctx: Ctx, id: Id<"_storage"> | undefined) {
  return id ? ctx.storage.getUrl(id) : null;
}

/** Owner (or admin) of a community course, or throws. */
async function requireCourseEditor(ctx: MutationCtx | QueryCtx, moduleId: string) {
  const user = await requireUser(ctx);
  const course = await getCourse(ctx, moduleId);
  const listing = await getListing(ctx, moduleId);

  if (!course || !listing || (!isCourseOwner(user, course) && user.role !== "platform_admin")) {
    throw new Error("Course not found");
  }

  return { user, course, listing };
}

/** Paths under /marketplace that are pages, not courses. */
const RESERVED_SLUGS = new Set(["new", "manage", "earnings", "create", "creators"]);

async function uniqueSlug(ctx: MutationCtx, title: string) {
  const slug = slugify(title);
  const base = slug && !RESERVED_SLUGS.has(slug) ? slug : `${slug || "course"}-course`;

  for (let index = 0; index < 100; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const existing = await ctx.db
      .query("courseListings")
      .withIndex("by_slug", (q) => q.eq("slug", candidate))
      .unique();
    if (!existing) return candidate;
  }

  throw new Error("Could not create a unique course address");
}

async function uniqueModuleId(ctx: MutationCtx, prefix: string, slug: string) {
  for (let index = 0; index < 100; index += 1) {
    const candidate = `${prefix}${slug}${index === 0 ? "" : `-${index + 1}`}`;
    if (!(await getCourse(ctx, candidate))) return candidate;
  }

  throw new Error("Could not create a unique course id");
}

async function uniqueScenarioId(ctx: MutationCtx, moduleId: string, title: string) {
  const base = `${moduleId}-${slugify(title, 40) || "scenario"}`;

  for (let index = 0; index < 100; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const existing = await ctx.db
      .query("scenarios")
      .withIndex("by_public_id", (q) => q.eq("id", candidate))
      .unique();
    if (!existing) return candidate;
  }

  throw new Error("Could not create a unique scenario id");
}

function cleanCharacter(input: typeof character.type, fallbackVoice: string, language: string) {
  return normalizeAgent(
    {
      name: optionalClip(input.name, 60),
      role: clip(input.role, 80),
      goal: clip(input.goal, 600),
      demeanor: optionalClip(input.demeanor, 200),
      openingLine: optionalClip(input.openingLine, 300),
      endCondition: optionalClip(input.endCondition, 400),
      voice: input.voice && isCreatorVoice(input.voice) ? input.voice : fallbackVoice,
      avatarStorageId: input.avatarStorageId,
      language,
    },
    language,
  );
}

/** Builds the full scenario record from a creator's short form. */
export function buildScenario(courseKind: "roleplay" | "interpreting", input: typeof scenarioInput.type) {
  if (!input.title.trim() || !input.character.role.trim() || !input.character.goal.trim()) {
    throw new ConvexError("COURSE_INCOMPLETE");
  }

  const timeLimitMinutes =
    input.timeLimitMinutes && input.timeLimitMinutes > 0 ? Math.min(30, Math.round(input.timeLimitMinutes)) : undefined;
  const base = {
    title: clip(input.title, LISTING_LIMITS.title),
    description: clip(input.description, 600),
    difficultyLevel: input.difficultyLevel ?? ("intermediate" as const),
    expectedSkills: [] as string[],
  };

  if (courseKind === "roleplay") {
    return {
      ...base,
      agentCount: 1 as const,
      aiAgentA: cleanCharacter(input.character, "marin", "English"),
      aiAgentB: undefined,
      practiceRuntime: {
        interpreterRole: clip(input.learnerRole, 80) || "Learner",
        sourceLanguage: "English",
        targetLanguage: "English",
        openingSpeaker: "agent_a" as const,
        briefing: clip(input.description, 600),
        assessmentFocus: [],
        practiceType: "roleplay" as const,
        learnerRole: optionalClip(input.learnerRole, 80),
        taskCard: optionalClip(input.taskCard, 1500),
        learnerOpens: input.learnerOpens ?? true,
        timeLimitMinutes,
      },
    };
  }

  if (!input.client || !input.client.role.trim() || !input.client.goal.trim()) {
    throw new ConvexError("COURSE_INCOMPLETE");
  }

  return {
    ...base,
    agentCount: 2 as const,
    aiAgentA: cleanCharacter(input.character, "cedar", "English"),
    // The client speaks whichever language the learner practises (planAgentLanguages).
    aiAgentB: cleanCharacter(input.client, "sage", "Spanish"),
    practiceRuntime: {
      interpreterRole: "Interpreter",
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      openingSpeaker: "agent_a" as const,
      briefing: clip(input.description, 600),
      assessmentFocus: [],
      practiceType: "interpreting" as const,
      timeLimitMinutes,
    },
  };
}

/** Public card data for a listing. */
async function listingCard(ctx: Ctx, listing: Doc<"courseListings">, scenarioCount: number) {
  return {
    moduleId: listing.moduleId,
    slug: listing.slug,
    kind: listing.kind,
    title: listing.title,
    tagline: listing.tagline,
    creatorName: listing.creatorName,
    keywords: listing.keywords,
    certifications: listing.certifications.map((cert) => ({ name: cert.name, issuer: cert.issuer })),
    bannerUrl: await storageUrl(ctx, listing.bannerStorageId),
    logoUrl: await storageUrl(ctx, listing.logoStorageId),
    scenarioCount,
    addCount: listing.addCount,
    publishedAt: listing.publishedAt ?? null,
    creatorHandle: listing.creatorHandle ?? null,
    isOriginal: isHouseOwner(listing.ownerClerkId),
    rating: averageRating(listing),
    ratingCount: listing.ratingCount ?? 0,
    practiceCount: listing.practiceCount ?? 0,
    passCount: listing.passCount ?? 0,
    badges: courseBadges(listing),
  };
}

async function scenarioCounts(ctx: Ctx) {
  const scenarios = await ctx.db.query("scenarios").collect();
  const counts = new Map<string, number>();
  for (const scenario of scenarios) counts.set(scenario.moduleId, (counts.get(scenario.moduleId) ?? 0) + 1);
  return counts;
}

// ---- Public browsing ---------------------------------------------------------------

/** Published community courses, newest and most added first, optionally searched. */
export const browse = query({
  args: {
    search: v.optional(v.string()),
    kind: v.optional(kind),
    sort: v.optional(v.union(v.literal("popular"), v.literal("top"), v.literal("new"))),
  },
  handler: async (ctx, args) => {
    const [listings, counts, user] = await Promise.all([
      ctx.db
        .query("courseListings")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect(),
      scenarioCounts(ctx),
      optionalUser(ctx),
    ]);
    const added = user ? await libraryModuleIds(ctx, user.clerkId) : new Set<string>();
    const matching = listings
      .filter((listing) => !args.kind || listing.kind === args.kind)
      .filter((listing) => listingMatches(listing, args.search ?? ""))
      .map((listing) => ({ ...listing, scenarioCount: counts.get(listing.moduleId) ?? 0 }))
      .sort(compareCourses(args.sort ?? "popular"));

    return Promise.all(
      matching.slice(0, 150).map(async (listing) => ({
        ...(await listingCard(ctx, listing, counts.get(listing.moduleId) ?? 0)),
        inLibrary: added.has(listing.moduleId),
        isOwner: user?.clerkId === listing.ownerClerkId,
      })),
    );
  },
});

/** Slugs of published courses, for the sitemap. */
export const publishedSlugs = query({
  args: {},
  handler: async (ctx) => {
    const listings = await ctx.db
      .query("courseListings")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    return listings.map((listing) => ({ slug: listing.slug, updatedAt: listing.updatedAt }));
  },
});

/** A course's marketplace page. Drafts and removed courses are visible only to the owner and admins. */
export const listing = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const listing = await ctx.db
      .query("courseListings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!listing) return null;

    const user = await optionalUser(ctx);
    const isOwner = user?.clerkId === listing.ownerClerkId;
    const isAdmin = user?.role === "platform_admin";

    if (listing.status !== "published" && !isOwner && !isAdmin) return null;

    const scenarios = await ctx.db
      .query("scenarios")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", listing.moduleId))
      .collect();
    const added = user ? await libraryModuleIds(ctx, user.clerkId) : new Set<string>();

    return {
      ...(await listingCard(ctx, listing, scenarios.length)),
      status: listing.status,
      removedReason: isOwner || isAdmin ? (listing.removedReason ?? null) : null,
      description: listing.description,
      whatYouGet: listing.whatYouGet,
      audience: listing.audience ?? null,
      certifications: await Promise.all(
        listing.certifications.map(async (cert) => ({
          name: cert.name,
          issuer: cert.issuer ?? null,
          url: cert.url ?? null,
          logoUrl: await storageUrl(ctx, cert.logoStorageId),
        })),
      ),
      scenarios: await Promise.all(
        scenarios.map(async (scenario) => ({
          id: scenario.id,
          title: scenario.title,
          description: scenario.description,
          difficultyLevel: scenario.difficultyLevel,
          timeLimitMinutes: scenarioTimeLimitMinutes(scenario),
          character: {
            name: scenario.aiAgentA.name ?? scenario.aiAgentA.role,
            role: scenario.aiAgentA.role,
            avatarUrl: (await storageUrl(ctx, scenario.aiAgentA.avatarStorageId)) ?? scenario.aiAgentA.avatarImageUrl ?? null,
          },
        })),
      ),
      totalMinutes: scenarios.reduce((sum, scenario) => sum + scenarioTimeLimitMinutes(scenario), 0),
      inLibrary: added.has(listing.moduleId),
      isOwner,
      isAdmin,
      signedIn: Boolean(user),
    };
  },
});

/** Counts a page view (not the owner's own). One call per page load. */
export const recordView = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const listing = await ctx.db
      .query("courseListings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!listing || listing.status !== "published") return;

    const user = await optionalUser(ctx);
    if (user?.clerkId === listing.ownerClerkId) return;

    const day = new Date().toISOString().slice(0, 10);
    const row = await ctx.db
      .query("courseViews")
      .withIndex("by_module_day", (q) => q.eq("moduleId", listing.moduleId).eq("day", day))
      .unique();

    if (row) await ctx.db.patch(row._id, { views: row.views + 1 });
    else await ctx.db.insert("courseViews", { moduleId: listing.moduleId, day, views: 1 });

    await ctx.db.patch(listing._id, { viewCount: listing.viewCount + 1 });
  },
});

// ---- Library -------------------------------------------------------------------------

export const addToLibrary = mutation({
  args: { moduleId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const listing = await getListing(ctx, args.moduleId);

    if (!listing || listing.status !== "published") throw new ConvexError("COURSE_UNAVAILABLE");

    const existing = await ctx.db
      .query("libraryItems")
      .withIndex("by_clerk_module", (q) => q.eq("clerkId", user.clerkId).eq("moduleId", args.moduleId))
      .unique();

    if (!existing) {
      await ctx.db.insert("libraryItems", { clerkId: user.clerkId, moduleId: args.moduleId, addedAt: new Date().toISOString() });
      await ctx.db.patch(listing._id, { addCount: listing.addCount + 1 });
    }

    return { ok: true };
  },
});

export const removeFromLibrary = mutation({
  args: { moduleId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const existing = await ctx.db
      .query("libraryItems")
      .withIndex("by_clerk_module", (q) => q.eq("clerkId", user.clerkId).eq("moduleId", args.moduleId))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      const listing = await getListing(ctx, args.moduleId);
      if (listing) await ctx.db.patch(listing._id, { addCount: Math.max(0, listing.addCount - 1) });
    }

    return { ok: true };
  },
});

/** Courses the learner added from the marketplace (the "Added" tab). */
export const myAdded = query({
  args: {},
  handler: async (ctx) => {
    const user = await optionalUser(ctx);
    if (!user) return [];

    const [items, counts] = await Promise.all([
      ctx.db
        .query("libraryItems")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", user.clerkId))
        .collect(),
      scenarioCounts(ctx),
    ]);
    const cards = await Promise.all(
      items.map(async (item) => {
        const listing = await getListing(ctx, item.moduleId);
        return listing && listing.status === "published"
          ? { ...(await listingCard(ctx, listing, counts.get(listing.moduleId) ?? 0)), inLibrary: true, isOwner: false }
          : null;
      }),
    );
    return cards.filter((card) => card !== null);
  },
});

// ---- Creating and editing ------------------------------------------------------------

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

/** Step-by-step wizard result: a draft course with its first scenario. */
export const createCourse = mutation({
  args: {
    kind,
    title: v.string(),
    tagline: v.string(),
    creatorName: v.optional(v.string()),
    scenario: scenarioInput,
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const title = clip(args.title, LISTING_LIMITS.title);

    if (!title) throw new ConvexError("COURSE_INCOMPLETE");

    const slug = await uniqueSlug(ctx, title);
    const moduleId = await uniqueModuleId(ctx, communityCourseIdPrefix(args.kind), slug);
    const scenario = buildScenario(args.kind, args.scenario);
    const now = new Date().toISOString();
    const tagline = clip(args.tagline, LISTING_LIMITS.tagline);

    await ctx.db.insert("modules", {
      id: moduleId,
      title,
      description: tagline,
      industryCategory: "business",
      durationMinutes: scenarioTimeLimitMinutes(scenario),
      difficultyLevel: scenario.difficultyLevel,
      learningObjectives: [],
      // Community courses aren't plan-gated; minutes are the only limit.
      isFree: true,
      isAccredited: false,
      badgeIcon: "",
      createdAt: now,
      source: "community",
      ownerClerkId: user.clerkId,
    });
    const creatorName = clip(args.creatorName, 80) || user.name;
    const creatorHandle = await ensureCreatorProfile(ctx, user, creatorName);
    await ctx.db.insert("courseListings", {
      moduleId,
      ownerClerkId: user.clerkId,
      status: "draft",
      slug,
      kind: args.kind,
      title,
      tagline,
      description: "",
      keywords: [],
      whatYouGet: [],
      creatorName,
      creatorHandle,
      certifications: [],
      createdAt: now,
      updatedAt: now,
      viewCount: 0,
      addCount: 0,
    });
    await ctx.db.insert("scenarios", { id: await uniqueScenarioId(ctx, moduleId, scenario.title), moduleId, ...scenario });

    return { moduleId, slug };
  },
});

/** Everything the course editor needs. */
export const editorData = query({
  args: { moduleId: v.string() },
  handler: async (ctx, args) => {
    const { listing } = await requireCourseEditor(ctx, args.moduleId);
    const scenarios = await ctx.db
      .query("scenarios")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
      .collect();

    return {
      listing: {
        ...listing,
        bannerUrl: await storageUrl(ctx, listing.bannerStorageId),
        logoUrl: await storageUrl(ctx, listing.logoStorageId),
        certifications: await Promise.all(
          listing.certifications.map(async (cert) => ({ ...cert, logoUrl: await storageUrl(ctx, cert.logoStorageId) })),
        ),
      },
      scenarios: await Promise.all(
        scenarios.map(async (scenario) => ({
          id: scenario.id,
          title: scenario.title,
          description: scenario.description,
          difficultyLevel: scenario.difficultyLevel,
          timeLimitMinutes: scenario.practiceRuntime?.timeLimitMinutes ?? null,
          learnerRole: scenario.practiceRuntime?.learnerRole ?? "",
          taskCard: scenario.practiceRuntime?.taskCard ?? "",
          learnerOpens: scenario.practiceRuntime?.learnerOpens ?? true,
          character: {
            ...scenario.aiAgentA,
            avatarUrl: (await storageUrl(ctx, scenario.aiAgentA.avatarStorageId)) ?? scenario.aiAgentA.avatarImageUrl ?? null,
          },
          client: scenario.aiAgentB
            ? {
                ...scenario.aiAgentB,
                avatarUrl: (await storageUrl(ctx, scenario.aiAgentB.avatarStorageId)) ?? scenario.aiAgentB.avatarImageUrl ?? null,
              }
            : null,
        })),
      ),
    };
  },
});

export const updateListing = mutation({
  args: {
    moduleId: v.string(),
    title: v.string(),
    tagline: v.string(),
    description: v.string(),
    keywords: v.array(v.string()),
    whatYouGet: v.array(v.string()),
    audience: v.optional(v.string()),
    creatorName: v.string(),
    bannerStorageId: v.optional(v.id("_storage")),
    logoStorageId: v.optional(v.id("_storage")),
    certifications: v.array(certification),
  },
  handler: async (ctx, args) => {
    const { course, listing } = await requireCourseEditor(ctx, args.moduleId);
    const title = clip(args.title, LISTING_LIMITS.title) || listing.title;
    const tagline = clip(args.tagline, LISTING_LIMITS.tagline);

    await ctx.db.patch(listing._id, {
      title,
      tagline,
      description: clip(args.description, LISTING_LIMITS.description),
      keywords: normalizeKeywords(args.keywords),
      whatYouGet: args.whatYouGet
        .map((item) => clip(item, LISTING_LIMITS.whatYouGetItem))
        .filter(Boolean)
        .slice(0, LISTING_LIMITS.whatYouGet),
      audience: optionalClip(args.audience, 200),
      creatorName: clip(args.creatorName, 80) || listing.creatorName,
      bannerStorageId: args.bannerStorageId,
      logoStorageId: args.logoStorageId,
      certifications: args.certifications
        .filter((cert) => cert.name.trim())
        .slice(0, LISTING_LIMITS.certifications)
        .map((cert) => ({
          name: clip(cert.name, 100),
          issuer: optionalClip(cert.issuer, 100),
          url: cert.url && /^https?:\/\//i.test(cert.url.trim()) ? clip(cert.url, 300) : undefined,
          logoStorageId: cert.logoStorageId,
        })),
      updatedAt: new Date().toISOString(),
    });
    await ctx.db.patch(course._id, { title, description: tagline });

    return { ok: true };
  },
});

export const saveScenario = mutation({
  args: { moduleId: v.string(), scenarioId: v.optional(v.string()), scenario: scenarioInput },
  handler: async (ctx, args) => {
    const { listing } = await requireCourseEditor(ctx, args.moduleId);
    const built = buildScenario(listing.kind, args.scenario);

    if (args.scenarioId) {
      const existing = await ctx.db
        .query("scenarios")
        .withIndex("by_public_id", (q) => q.eq("id", args.scenarioId!))
        .unique();
      if (!existing || existing.moduleId !== args.moduleId) throw new Error("Scenario not found");
      await ctx.db.patch(existing._id, built);
      await ctx.db.patch(listing._id, { updatedAt: new Date().toISOString() });
      return { scenarioId: existing.id };
    }

    const count = (
      await ctx.db
        .query("scenarios")
        .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
        .collect()
    ).length;
    if (count >= LISTING_LIMITS.scenarios) throw new Error("A course can have up to 30 scenarios.");

    const id = await uniqueScenarioId(ctx, args.moduleId, built.title);
    await ctx.db.insert("scenarios", { id, moduleId: args.moduleId, ...built });
    await ctx.db.patch(listing._id, { updatedAt: new Date().toISOString() });
    return { scenarioId: id };
  },
});

export const deleteScenario = mutation({
  args: { moduleId: v.string(), scenarioId: v.string() },
  handler: async (ctx, args) => {
    const { listing } = await requireCourseEditor(ctx, args.moduleId);
    const scenarios = await ctx.db
      .query("scenarios")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
      .collect();
    const target = scenarios.find((scenario) => scenario.id === args.scenarioId);

    if (!target) throw new Error("Scenario not found");
    if (listing.status === "published" && scenarios.length <= 1) throw new ConvexError("COURSE_INCOMPLETE");

    await ctx.db.delete(target._id);
    return { ok: true };
  },
});

export const publish = mutation({
  args: { moduleId: v.string(), acceptGuidelines: v.boolean() },
  handler: async (ctx, args) => {
    const { listing } = await requireCourseEditor(ctx, args.moduleId);

    if (listing.status === "removed") throw new ConvexError("COURSE_UNAVAILABLE");
    if (!args.acceptGuidelines) throw new ConvexError("GUIDELINES_REQUIRED");

    const scenarioCount = (
      await ctx.db
        .query("scenarios")
        .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
        .collect()
    ).length;
    if (!listing.title.trim() || !listing.tagline.trim() || scenarioCount === 0) throw new ConvexError("COURSE_INCOMPLETE");

    const now = new Date().toISOString();
    await ctx.db.patch(listing._id, {
      status: "published",
      publishedAt: listing.publishedAt ?? now,
      guidelinesAcceptedAt: now,
      updatedAt: now,
    });
    if (!listing.publishedAt) {
      await queueEmail(ctx, {
        clerkId: listing.ownerClerkId,
        email: { kind: "course_published", courseTitle: listing.title, slug: listing.slug },
        dedupeKey: `course_published-${listing.moduleId}`,
      });
    }
    return { slug: listing.slug };
  },
});

export const unpublish = mutation({
  args: { moduleId: v.string() },
  handler: async (ctx, args) => {
    const { listing } = await requireCourseEditor(ctx, args.moduleId);
    if (listing.status === "published") {
      await ctx.db.patch(listing._id, { status: "draft", updatedAt: new Date().toISOString() });
    }
    return { ok: true };
  },
});

// ---- Creator analytics ---------------------------------------------------------------

async function courseStats(ctx: QueryCtx, moduleId: string) {
  const [sessions, earnings, listing] = await Promise.all([
    ctx.db
      .query("sessions")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId))
      .collect(),
    ctx.db
      .query("creatorEarnings")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId))
      .collect(),
    getListing(ctx, moduleId),
  ]);
  const owner = listing?.ownerClerkId;
  const learnerSessions = sessions.filter((session) => session.clerkId !== owner && session.completionStatus !== "in_progress");

  return {
    views: listing?.viewCount ?? 0,
    adds: listing?.addCount ?? 0,
    learners: new Set(learnerSessions.map((session) => session.clerkId)).size,
    sessions: learnerSessions.length,
    minutes: learnerSessions.reduce((sum, session) => sum + (session.chargedMinutes ?? 0), 0),
    earnedCents: earnings.reduce((sum, earning) => sum + earning.amountCents, 0),
  };
}

/** The "By you" tab: the creator's courses with headline numbers. */
export const myCourses = query({
  args: {},
  handler: async (ctx) => {
    const user = await optionalUser(ctx);
    if (!user) return [];

    const [listings, counts] = await Promise.all([
      ctx.db
        .query("courseListings")
        .withIndex("by_owner", (q) => q.eq("ownerClerkId", user.clerkId))
        .collect(),
      scenarioCounts(ctx),
    ]);

    return Promise.all(
      listings
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map(async (listing) => ({
          ...(await listingCard(ctx, listing, counts.get(listing.moduleId) ?? 0)),
          status: listing.status,
          removedReason: listing.removedReason ?? null,
          stats: await courseStats(ctx, listing.moduleId),
        })),
    );
  },
});

/** Detailed analytics for one course: totals plus a 30-day series. */
export const courseAnalytics = query({
  args: { moduleId: v.string() },
  handler: async (ctx, args) => {
    const { listing } = await requireCourseEditor(ctx, args.moduleId);
    const since = new Date(Date.now() - 29 * 86_400_000).toISOString().slice(0, 10);
    const [views, sessions, adds] = await Promise.all([
      ctx.db
        .query("courseViews")
        .withIndex("by_module_day", (q) => q.eq("moduleId", args.moduleId).gte("day", since))
        .collect(),
      ctx.db
        .query("sessions")
        .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
        .collect(),
      ctx.db
        .query("libraryItems")
        .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
        .collect(),
    ]);
    const days = Array.from({ length: 30 }, (_, index) =>
      new Date(Date.now() - (29 - index) * 86_400_000).toISOString().slice(0, 10),
    );
    const byDay = (dates: string[]) => {
      const counts = new Map<string, number>();
      for (const date of dates) counts.set(date, (counts.get(date) ?? 0) + 1);
      return counts;
    };
    const viewByDay = new Map(views.map((row) => [row.day, row.views]));
    const learnerSessions = sessions.filter((session) => session.clerkId !== listing.ownerClerkId);
    const sessionByDay = byDay(learnerSessions.map((session) => (session.startedAt ?? session.timestamp).slice(0, 10)));
    const addByDay = byDay(adds.map((item) => item.addedAt.slice(0, 10)));

    return {
      totals: await courseStats(ctx, args.moduleId),
      series: days.map((day) => ({
        day,
        views: viewByDay.get(day) ?? 0,
        adds: addByDay.get(day) ?? 0,
        sessions: sessionByDay.get(day) ?? 0,
      })),
    };
  },
});

/** Earnings across all of a creator's courses, split by payout state. */
export const creatorSummary = query({
  args: {},
  handler: async (ctx) => {
    const user = await optionalUser(ctx);
    if (!user) return null;

    const [earnings, account, payouts] = await Promise.all([
      ctx.db
        .query("creatorEarnings")
        .withIndex("by_owner", (q) => q.eq("ownerClerkId", user.clerkId))
        .collect(),
      ctx.db
        .query("creatorAccounts")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", user.clerkId))
        .unique(),
      ctx.db
        .query("creatorPayouts")
        .withIndex("by_owner", (q) => q.eq("ownerClerkId", user.clerkId))
        .collect(),
    ]);
    const holdCutoff = new Date(Date.now() - EARNINGS_HOLD_DAYS * 86_400_000).toISOString();
    const unpaid = earnings.filter((earning) => !earning.payoutId);

    return {
      totalCents: earnings.reduce((sum, earning) => sum + earning.amountCents, 0),
      availableCents: unpaid.filter((e) => e.createdAt <= holdCutoff).reduce((sum, e) => sum + e.amountCents, 0),
      pendingCents: unpaid.filter((e) => e.createdAt > holdCutoff).reduce((sum, e) => sum + e.amountCents, 0),
      paidCents: payouts.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amountCents, 0),
      payoutAccount: account
        ? { connected: Boolean(account.stripeAccountId), payoutsEnabled: account.payoutsEnabled, detailsSubmitted: account.detailsSubmitted }
        : { connected: false, payoutsEnabled: false, detailsSubmitted: false },
      payouts: payouts
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 12)
        .map((p) => ({ id: p._id, amountCents: p.amountCents, status: p.status, createdAt: p.createdAt })),
    };
  },
});

// ---- Reports ----------------------------------------------------------------------------

export const report = mutation({
  args: {
    moduleId: v.string(),
    reason: v.union(
      v.literal("inappropriate"),
      v.literal("misleading"),
      v.literal("copyright"),
      v.literal("unsafe"),
      v.literal("spam"),
      v.literal("other"),
    ),
    details: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const listing = await getListing(ctx, args.moduleId);
    if (!listing) throw new Error("Course not found");

    const previous = await ctx.db
      .query("contentReports")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
      .collect();
    if (previous.some((item) => item.reporterClerkId === user.clerkId && item.status === "open")) {
      throw new ConvexError("ALREADY_REPORTED");
    }

    const reportId = await ctx.db.insert("contentReports", {
      moduleId: args.moduleId,
      reporterClerkId: user.clerkId,
      reason: args.reason,
      details: clip(args.details, 2000),
      status: "open",
      createdAt: new Date().toISOString(),
    });
    await ctx.scheduler.runAfter(0, internal.marketplaceActions.notifyAdminsOfReport, { reportId });
    return { ok: true };
  },
});

export const reportForEmail = internalQuery({
  args: { reportId: v.id("contentReports") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.reportId);
    if (!item) return null;
    const listing = await getListing(ctx, item.moduleId);
    const admins = (await ctx.db.query("users").collect()).filter((user) => user.role === "platform_admin");
    return {
      reason: item.reason,
      details: item.details,
      courseTitle: listing?.title ?? item.moduleId,
      slug: listing?.slug ?? null,
      adminEmails: admins.map((admin) => admin.email).filter(Boolean),
    };
  },
});

// ---- Admin moderation ---------------------------------------------------------------

export const adminReports = query({
  args: { status: v.optional(v.union(v.literal("open"), v.literal("dismissed"), v.literal("actioned"))) },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const reports = await ctx.db
      .query("contentReports")
      .withIndex("by_status", (q) => q.eq("status", args.status ?? "open"))
      .collect();

    return Promise.all(
      reports
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(async (item) => {
          const listing = await getListing(ctx, item.moduleId);
          const reporter = await getUserByClerkId(ctx, item.reporterClerkId);
          const owner = listing ? await getUserByClerkId(ctx, listing.ownerClerkId) : null;
          return {
            id: item._id,
            reason: item.reason,
            details: item.details,
            status: item.status,
            createdAt: item.createdAt,
            resolution: item.resolution ?? null,
            course: listing
              ? { moduleId: listing.moduleId, slug: listing.slug, title: listing.title, status: listing.status, creatorName: listing.creatorName }
              : null,
            reporter: reporter ? { name: reporter.name, email: reporter.email } : null,
            owner: owner ? { name: owner.name, email: owner.email } : null,
          };
        }),
    );
  },
});

/** All community courses, for Admin → Marketplace. */
export const adminListings = query({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);
    const [listings, reports] = await Promise.all([
      ctx.db.query("courseListings").collect(),
      ctx.db
        .query("contentReports")
        .withIndex("by_status", (q) => q.eq("status", "open"))
        .collect(),
    ]);
    const openByModule = new Map<string, number>();
    for (const item of reports) openByModule.set(item.moduleId, (openByModule.get(item.moduleId) ?? 0) + 1);

    return listings
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((listing) => ({
        moduleId: listing.moduleId,
        slug: listing.slug,
        title: listing.title,
        creatorName: listing.creatorName,
        creatorHandle: listing.creatorHandle ?? null,
        status: listing.status,
        removedReason: listing.removedReason ?? null,
        addCount: listing.addCount,
        viewCount: listing.viewCount,
        openReports: openByModule.get(listing.moduleId) ?? 0,
        updatedAt: listing.updatedAt,
      }));
  },
});

export const adminSetListingStatus = mutation({
  args: { moduleId: v.string(), action: v.union(v.literal("remove"), v.literal("restore")), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const listing = await getListing(ctx, args.moduleId);
    if (!listing) throw new Error("Course not found");
    const now = new Date().toISOString();

    if (args.action === "remove") {
      const reason = clip(args.reason, 500) || "Removed by XINGO for breaking the creator guidelines.";
      await ctx.db.patch(listing._id, {
        status: "removed",
        removedAt: now,
        removedReason: reason,
        updatedAt: now,
      });
      if (listing.status !== "removed") {
        await queueEmail(ctx, {
          clerkId: listing.ownerClerkId,
          email: { kind: "course_removed", courseTitle: listing.title, reason },
          dedupeKey: `course_removed-${listing.moduleId}-${now}`,
        });
      }
    } else {
      // Restored courses come back as drafts; the creator republishes.
      await ctx.db.patch(listing._id, { status: "draft", removedAt: undefined, removedReason: undefined, updatedAt: now });
    }

    return { ok: true };
  },
});

export const resolveReport = mutation({
  args: {
    reportId: v.id("contentReports"),
    action: v.union(v.literal("dismiss"), v.literal("remove_course")),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requirePlatformAdmin(ctx);
    const item = await ctx.db.get(args.reportId);
    if (!item) throw new Error("Report not found");
    const now = new Date().toISOString();

    if (args.action === "remove_course") {
      const listing = await getListing(ctx, item.moduleId);
      if (listing) {
        const reason = clip(args.note, 500) || "Removed by XINGO after a report.";
        await ctx.db.patch(listing._id, {
          status: "removed",
          removedAt: now,
          removedReason: reason,
          updatedAt: now,
        });
        if (listing.status !== "removed") {
          await queueEmail(ctx, {
            clerkId: listing.ownerClerkId,
            email: { kind: "course_removed", courseTitle: listing.title, reason },
            dedupeKey: `course_removed-${listing.moduleId}-${now}`,
          });
        }
      }
      // Close every open report on the same course.
      const open = await ctx.db
        .query("contentReports")
        .withIndex("by_moduleId", (q) => q.eq("moduleId", item.moduleId))
        .collect();
      for (const other of open.filter((r) => r.status === "open")) {
        await ctx.db.patch(other._id, { status: "actioned", resolvedAt: now, resolvedBy: admin.clerkId, resolution: clip(args.note, 500) || "Course removed" });
      }
    } else {
      await ctx.db.patch(item._id, { status: "dismissed", resolvedAt: now, resolvedBy: admin.clerkId, resolution: clip(args.note, 500) || undefined });
    }

    return { ok: true };
  },
});

/** Open report count for the admin tab badge. */
export const adminOpenReportCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await optionalUser(ctx);
    if (user?.role !== "platform_admin") return 0;
    return (
      await ctx.db
        .query("contentReports")
        .withIndex("by_status", (q) => q.eq("status", "open"))
        .collect()
    ).length;
  },
});

/** Creator money owed and paid, for Admin → Marketplace. */
export const adminPayoutOverview = query({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);
    const [earnings, payouts] = await Promise.all([ctx.db.query("creatorEarnings").collect(), ctx.db.query("creatorPayouts").collect()]);
    const holdCutoff = new Date(Date.now() - EARNINGS_HOLD_DAYS * 86_400_000).toISOString();
    const unpaid = earnings.filter((earning) => !earning.payoutId);
    return {
      owedCents: unpaid.reduce((sum, e) => sum + e.amountCents, 0),
      payableNowCents: unpaid.filter((e) => e.createdAt <= holdCutoff).reduce((sum, e) => sum + e.amountCents, 0),
      paidCents: payouts.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amountCents, 0),
      failedPayouts: payouts.filter((p) => p.status === "failed").length,
      connectEnabled: process.env.STRIPE_CONNECT_ENABLED === "true",
    };
  },
});
