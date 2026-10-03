import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "../_generated/api";
import { seedUser, setup } from "./setup.helpers";

const pair = { sourceLanguage: "English", targetLanguage: "English" };

const scenario = {
  title: "First-round interview",
  description: "Answer five questions.",
  character: { role: "Hiring manager", goal: "Find out if the candidate fits the role", endCondition: "five questions are answered" },
  learnerRole: "Job applicant",
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-03T10:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

async function createPublished(t: ReturnType<typeof setup>) {
  const creator = await seedUser(t, "creator");
  const { moduleId, slug } = await creator.mutation(api.marketplace.createCourse, {
    kind: "roleplay",
    title: "Retail interviews",
    tagline: "Practise the questions retail managers ask",
    scenario,
  });
  await creator.mutation(api.marketplace.publish, { moduleId, acceptGuidelines: true });
  return { creator, moduleId, slug };
}

async function scenarioIdFor(t: ReturnType<typeof setup>, moduleId: string) {
  return t.run(async (ctx) => {
    const found = await ctx.db
      .query("scenarios")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId))
      .first();
    return found!.id;
  });
}

describe("marketplace", () => {
  test("community courses only reach a learner's library once they add them", async () => {
    const t = setup();
    const { moduleId } = await createPublished(t);
    const learner = await seedUser(t, "learner");

    const before = await learner.query(api.catalog.forCurrentUser, {});
    expect(before.modules.some((m) => m.id === moduleId)).toBe(false);

    await learner.mutation(api.marketplace.addToLibrary, { moduleId });
    const after = await learner.query(api.catalog.forCurrentUser, {});
    expect(after.modules.find((m) => m.id === moduleId)?.source).toBe("community");
  });

  test("drafts are private to their creator", async () => {
    const t = setup();
    const creator = await seedUser(t, "creator");
    const { slug, moduleId } = await creator.mutation(api.marketplace.createCourse, {
      kind: "roleplay",
      title: "Draft course",
      tagline: "Not ready yet",
      scenario,
    });
    const other = await seedUser(t, "other");

    expect(await other.query(api.marketplace.listing, { slug })).toBeNull();
    expect(await creator.query(api.marketplace.listing, { slug })).not.toBeNull();
    expect((await other.query(api.modules.list, {})).some((m) => m.id === moduleId)).toBe(false);
    await expect(other.mutation(api.marketplace.addToLibrary, { moduleId })).rejects.toThrow();
  });

  test("only the owner can edit a course, and publishing needs the guidelines", async () => {
    const t = setup();
    const creator = await seedUser(t, "creator");
    const { moduleId } = await creator.mutation(api.marketplace.createCourse, {
      kind: "roleplay",
      title: "Owned",
      tagline: "Mine",
      scenario,
    });
    const other = await seedUser(t, "other");

    await expect(other.mutation(api.marketplace.unpublish, { moduleId })).rejects.toThrow();
    await expect(creator.mutation(api.marketplace.publish, { moduleId, acceptGuidelines: false })).rejects.toThrow(
      "GUIDELINES_REQUIRED",
    );
  });

  test("creators earn from paid minutes, not from free minutes or their own practice", async () => {
    const t = setup();
    const { creator, moduleId } = await createPublished(t);
    const scenarioId = await scenarioIdFor(t, moduleId);
    const learner = await seedUser(t, "payer");
    await learner.mutation(api.marketplace.addToLibrary, { moduleId });
    await t.mutation(internal.billingData.grantPack, { clerkId: "payer", packId: "starter", stripeCheckoutSessionId: "cs_1" });

    // 14 minutes: 10 from the free allowance (no earnings), 4 from the pack.
    const { attemptId } = await learner.mutation(api.practice.startAttempt, { scenarioId, ...pair });
    await t.mutation(internal.practice.reserveRealtimeKey, { attemptId, clerkId: "payer" });
    vi.advanceTimersByTime(14 * 60_000);
    await t.mutation(internal.practice.closeForGrading, { attemptId, clerkId: "payer", transcriptEntries: [] });

    // The creator's own practice earns nothing.
    const own = await creator.mutation(api.practice.startAttempt, { scenarioId, ...pair });
    await t.mutation(internal.practice.reserveRealtimeKey, { attemptId: own.attemptId, clerkId: "creator" });
    vi.advanceTimersByTime(3 * 60_000);
    await t.mutation(internal.practice.closeForGrading, { attemptId: own.attemptId, clerkId: "creator", transcriptEntries: [] });

    const earnings = await t.run((ctx) => ctx.db.query("creatorEarnings").collect());
    expect(earnings).toHaveLength(1);
    expect(earnings[0]).toMatchObject({ ownerClerkId: "creator", minutes: 14, paidMinutes: 4 });
    expect(earnings[0].amountCents).toBeGreaterThan(0);

    const summary = await creator.query(api.marketplace.creatorSummary, {});
    expect(summary?.pendingCents).toBe(earnings[0].amountCents);
    expect(summary?.availableCents).toBe(0);
  });

  test("a reported course can be taken down, which blocks practice", async () => {
    const t = setup();
    const { moduleId } = await createPublished(t);
    const scenarioId = await scenarioIdFor(t, moduleId);
    const learner = await seedUser(t, "reporter");
    const admin = await seedUser(t, "admin", { role: "platform_admin" });

    await learner.mutation(api.marketplace.report, { moduleId, reason: "misleading", details: "Fake certificate" });
    await expect(learner.mutation(api.marketplace.report, { moduleId, reason: "spam", details: "" })).rejects.toThrow("ALREADY_REPORTED");

    const [report] = await admin.query(api.marketplace.adminReports, {});
    await admin.mutation(api.marketplace.resolveReport, { reportId: report.id, action: "remove_course", note: "Misleading" });

    await expect(learner.mutation(api.practice.startAttempt, { scenarioId, ...pair })).rejects.toThrow("COURSE_UNAVAILABLE");
    expect(await admin.query(api.marketplace.adminReports, {})).toHaveLength(0);
    await expect(learner.query(api.marketplace.adminReports, {})).rejects.toThrow();
  });
});

describe("ratings and originals", () => {
  test("only learners who practised can rate, once each; editing adjusts the average", async () => {
    const t = setup();
    const { moduleId } = await createPublished(t);
    const scenarioId = await scenarioIdFor(t, moduleId);
    const learner = await seedUser(t, "rater");

    await expect(learner.mutation(api.ratings.rateCourse, { moduleId, stars: 5 })).rejects.toThrow("RATING_NEEDS_PRACTICE");

    const { attemptId } = await learner.mutation(api.practice.startAttempt, { scenarioId, ...pair });
    await t.mutation(internal.practice.closeForGrading, { attemptId, clerkId: "rater", transcriptEntries: [] });

    await learner.mutation(api.ratings.rateCourse, { moduleId, stars: 5, comment: "Great practice" });
    await learner.mutation(api.ratings.rateCourse, { moduleId, stars: 3 });

    const summary = await learner.query(api.ratings.forCourse, { moduleId });
    expect(summary).toMatchObject({ average: 3, count: 1 });
  });

  test("XINGO Originals courses never record creator earnings", async () => {
    const t = setup();
    const moduleId = "rp-house-course";
    await t.run(async (ctx) => {
      await ctx.db.insert("modules", {
        id: moduleId, title: "House", description: "", industryCategory: "community", durationMinutes: 10,
        difficultyLevel: "beginner", learningObjectives: [], isFree: true, isAccredited: false, badgeIcon: "",
        createdAt: "2026-10-01T00:00:00.000Z", source: "community", ownerClerkId: "house:studio",
      });
      await ctx.db.insert("courseListings", {
        moduleId, ownerClerkId: "house:studio", status: "published", slug: "house-course", kind: "roleplay",
        title: "House", tagline: "t", description: "", keywords: [], whatYouGet: [], creatorName: "Studio",
        certifications: [], createdAt: "2026-10-01T00:00:00.000Z", updatedAt: "2026-10-01T00:00:00.000Z", viewCount: 0, addCount: 0,
      });
      await ctx.db.insert("scenarios", {
        id: "house-s1", moduleId, title: "S", description: "", agentCount: 1,
        aiAgentA: { name: "A", role: "Barista", voice: "marin", goal: "g", language: "English" },
        practiceRuntime: { interpreterRole: "Learner", sourceLanguage: "English", targetLanguage: "English", openingSpeaker: "agent_a", briefing: "", assessmentFocus: [], practiceType: "roleplay" },
        expectedSkills: [], difficultyLevel: "beginner",
      });
    });
    const learner = await seedUser(t, "paying_learner");
    await t.mutation(internal.billingData.grantPack, { clerkId: "paying_learner", packId: "starter", stripeCheckoutSessionId: "cs_house" });
    const { attemptId } = await learner.mutation(api.practice.startAttempt, { scenarioId: "house-s1", ...pair });
    await t.mutation(internal.practice.reserveRealtimeKey, { attemptId, clerkId: "paying_learner" });
    vi.advanceTimersByTime(14 * 60_000);
    await t.mutation(internal.practice.closeForGrading, { attemptId, clerkId: "paying_learner", transcriptEntries: [] });

    expect(await t.run((ctx) => ctx.db.query("creatorEarnings").collect())).toHaveLength(0);
  });
});

describe("deleting a course", () => {
  test("its creator can delete it; it leaves the marketplace and learners' libraries", async () => {
    const t = setup();
    const { creator, moduleId, slug } = await createPublished(t);
    const learner = await seedUser(t, "learner");
    await learner.mutation(api.marketplace.addToLibrary, { moduleId });

    const other = await seedUser(t, "other");
    await expect(other.mutation(api.marketplace.deleteCourse, { moduleId })).rejects.toThrow();

    await expect(creator.mutation(api.marketplace.deleteCourse, { moduleId })).resolves.toEqual({ orgHandle: null });
    expect(await learner.query(api.marketplace.listing, { slug })).toBeNull();
    expect(await creator.query(api.marketplace.editorData, { moduleId })).toBeNull();
    const leftovers = await t.run(async (ctx) => ({
      scenarios: await ctx.db.query("scenarios").withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId)).collect(),
      library: await ctx.db.query("libraryItems").withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId)).collect(),
    }));
    expect(leftovers).toEqual({ scenarios: [], library: [] });
  });
});
