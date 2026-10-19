import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "../_generated/api";
import { seedCatalog, seedUser, setup } from "./setup.helpers";
import { LAUNCH_AVAILABLE_COURSE_IDS, LAUNCH_CCL_FREE_PREVIEW_IDS } from "../../lib/course-status";
import { MARKETPLACE_OPEN } from "../../lib/marketplace";
import { isGoalComingSoonOnSite } from "../../lib/goals";
import { trackForGoal } from "../../lib/email/onboarding-types";

const pair = { sourceLanguage: "English", targetLanguage: "Arabic" };

type T = ReturnType<typeof setup>;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-15T10:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

async function markComingSoon(t: T, moduleId: string) {
  await t.run(async (ctx) => {
    const course = await ctx.db
      .query("modules")
      .withIndex("by_public_id", (q) => q.eq("id", moduleId))
      .unique();
    await ctx.db.patch(course!._id, { status: "coming_soon" });
  });
}

/** A published community course, inserted directly (creating one through the API needs the marketplace open). */
async function seedCommunityCourse(t: T, learnerClerkId: string) {
  await t.run(async (ctx) => {
    await ctx.db.insert("modules", {
      id: "rp-retail",
      title: "Retail interviews",
      description: "",
      industryCategory: "business",
      durationMinutes: 10,
      difficultyLevel: "beginner",
      learningObjectives: [],
      isFree: true,
      isAccredited: false,
      badgeIcon: "",
      createdAt: "2026-10-01T00:00:00.000Z",
      source: "community",
      ownerClerkId: "creator",
    });
    await ctx.db.insert("scenarios", {
      id: "rp-retail-1",
      moduleId: "rp-retail",
      title: "First round",
      description: "",
      aiAgentA: { role: "Hiring manager", voice: "cedar", goal: "Interview" },
      expectedSkills: [],
      difficultyLevel: "beginner",
    });
    await ctx.db.insert("courseListings", {
      moduleId: "rp-retail",
      slug: "retail-interviews",
      kind: "roleplay",
      title: "Retail interviews",
      tagline: "Practise the questions",
      description: "",
      whatYouGet: [],
      keywords: [],
      certifications: [],
      creatorName: "Creator",
      ownerClerkId: "creator",
      status: "published",
      addCount: 1,
      viewCount: 0,
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
    });
    await ctx.db.insert("libraryItems", { clerkId: learnerClerkId, moduleId: "rp-retail", addedAt: "2026-10-02T00:00:00.000Z" });
  });
}

describe("coming-soon courses (D-043)", () => {
  test("stay in the library, locked and last, and are skipped for the next step", async () => {
    const t = setup();
    await seedCatalog(t);
    await markComingSoon(t, "free-mod");
    const learner = await seedUser(t, "learner");

    const catalog = await learner.query(api.catalog.forCurrentUser, {});
    expect(catalog.modules.map((m) => [m.id, m.comingSoon])).toEqual([
      ["paid-mod", false],
      ["free-mod", true],
    ]);
    expect(catalog.modules[1].scenarios.every((s) => s.locked)).toBe(true);
    expect(catalog.nextUp?.moduleId).toBe("paid-mod");
  });

  test("can't be practised by learners, even on Pro, and don't reveal the scenario", async () => {
    const t = setup();
    await seedCatalog(t);
    await markComingSoon(t, "paid-mod");
    const pro = await seedUser(t, "pro", { subscriptionStatus: "professional" });

    await expect(pro.mutation(api.practice.startAttempt, { scenarioId: "paid-scn", ...pair })).rejects.toThrow(
      "COURSE_COMING_SOON",
    );
    await expect(pro.mutation(api.practice.startAttempt, { scenarioId: "preview-scn", ...pair })).rejects.toThrow(
      "COURSE_COMING_SOON",
    );
    const room = await pro.query(api.catalog.scenarioForPractice, { scenarioId: "paid-scn" });
    expect(room).toEqual({ comingSoon: true, module: { id: "paid-mod", title: "paid-mod" } });
  });

  test("platform admins can still open and practise them", async () => {
    const t = setup();
    await seedCatalog(t);
    await markComingSoon(t, "paid-mod");
    const admin = await seedUser(t, "admin", { role: "platform_admin" });

    const catalog = await admin.query(api.catalog.forCurrentUser, {});
    expect(catalog.modules.find((m) => m.id === "paid-mod")?.comingSoon).toBe(false);
    const room = await admin.query(api.catalog.scenarioForPractice, { scenarioId: "paid-scn" });
    expect(room?.comingSoon).toBe(false);
    await expect(admin.mutation(api.practice.startAttempt, { scenarioId: "paid-scn", ...pair })).resolves.toBeDefined();
  });

  test("only platform admins change a course's status", async () => {
    const t = setup();
    await seedCatalog(t);
    const learner = await seedUser(t, "learner");
    const admin = await seedUser(t, "admin", { role: "platform_admin" });
    const course = (await admin.query(api.modules.getById, { id: "free-mod" }))!;
    const fields = {
      id: course.id,
      title: course.title,
      description: course.description,
      industryCategory: course.industryCategory,
      durationMinutes: course.durationMinutes,
      difficultyLevel: course.difficultyLevel,
      learningObjectives: course.learningObjectives,
      isFree: course.isFree,
      isAccredited: course.isAccredited,
      badgeIcon: course.badgeIcon,
      status: "coming_soon" as const,
    };

    await expect(learner.mutation(api.modules.updateAdmin, fields)).rejects.toThrow();
    await admin.mutation(api.modules.updateAdmin, fields);
    expect((await admin.query(api.modules.getById, { id: "free-mod" }))?.status).toBe("coming_soon");
  });

  test("the launch migration opens CCL and the free course, and adds CCL free previews", async () => {
    const t = setup();
    const agent = { role: "Officer", voice: "cedar", goal: "Help" };
    await t.run(async (ctx) => {
      for (const id of [...LAUNCH_AVAILABLE_COURSE_IDS, "ielts-speaking"]) {
        await ctx.db.insert("modules", {
          id,
          title: id,
          description: "",
          industryCategory: "community",
          durationMinutes: 10,
          difficultyLevel: "beginner",
          learningObjectives: [],
          isFree: false,
          isAccredited: false,
          badgeIcon: "",
          createdAt: "2026-01-01T00:00:00.000Z",
        });
      }
      for (const id of LAUNCH_CCL_FREE_PREVIEW_IDS) {
        await ctx.db.insert("scenarios", {
          id,
          moduleId: "naati-certification-practice-ccl",
          title: id,
          description: "",
          aiAgentA: agent,
          expectedSkills: [],
          difficultyLevel: "beginner",
        });
      }
    });
    await seedCommunityCourse(t, "learner");

    const dry = await t.mutation(internal.migrations.applyCclLaunchStatuses, { dryRun: true });
    expect(dry.comingSoon).toEqual(["ielts-speaking"]);
    expect(dry.freePreviews).toEqual([...LAUNCH_CCL_FREE_PREVIEW_IDS]);
    const untouched = await t.run((ctx) => ctx.db.query("modules").collect());
    expect(untouched.every((course) => course.status === undefined)).toBe(true);

    await t.mutation(internal.migrations.applyCclLaunchStatuses, { dryRun: false });
    const after = await t.run(async (ctx) => ({
      modules: await ctx.db.query("modules").collect(),
      scenarios: await ctx.db.query("scenarios").collect(),
    }));
    expect(Object.fromEntries(after.modules.map((course) => [course.id, course.status]))).toEqual({
      "naati-certification-practice-ccl": "available",
      "medical-er-intake": "available",
      "ielts-speaking": "coming_soon",
      "rp-retail": undefined,
    });
    expect(after.scenarios.filter((s) => s.isFreePreview).map((s) => s.id).sort()).toEqual(
      [...LAUNCH_CCL_FREE_PREVIEW_IDS].sort(),
    );
  });

  test("public pages and onboarding emails follow the launch line-up", () => {
    expect(isGoalComingSoonOnSite("naati_ccl")).toBe(false);
    expect(isGoalComingSoonOnSite("medical")).toBe(false);
    expect(isGoalComingSoonOnSite("general")).toBe(false);
    expect(isGoalComingSoonOnSite("ielts")).toBe(true);
    expect(isGoalComingSoonOnSite("naati_cpi")).toBe(true);

    expect(trackForGoal("naati_ccl")).toBe("ccl");
    expect(trackForGoal("medical")).toBe("interpreter");
    expect(trackForGoal("ielts")).toBe("general");
    expect(trackForGoal("naati_cpi")).toBe("general");
  });
});

describe("closed marketplace (D-043)", () => {
  test("is closed at launch", () => {
    expect(MARKETPLACE_OPEN).toBe(false);
  });

  test("learners can't browse, open, add, create or practise community courses", async () => {
    const t = setup();
    await seedCommunityCourse(t, "learner");
    const learner = await seedUser(t, "learner");

    expect((await learner.query(api.users.me, {}))?.marketplaceOpen).toBe(false);
    expect(await learner.query(api.marketplace.browse, {})).toEqual([]);
    expect(await learner.query(api.marketplace.publishedSlugs, {})).toEqual([]);
    expect(await learner.query(api.marketplace.listing, { slug: "retail-interviews" })).toBeNull();
    expect(await learner.query(api.creators.featured, {})).toEqual([]);
    expect(await learner.query(api.featured.list, {})).toEqual([]);
    await expect(learner.mutation(api.marketplace.addToLibrary, { moduleId: "rp-retail" })).rejects.toThrow(
      "MARKETPLACE_CLOSED",
    );
    await expect(
      learner.mutation(api.marketplace.createCourse, {
        kind: "roleplay",
        title: "My course",
        tagline: "A tagline",
        scenario: {
          title: "One",
          description: "",
          character: { role: "Customer", goal: "Ask", endCondition: "done" },
          learnerRole: "Staff",
        },
      }),
    ).rejects.toThrow("MARKETPLACE_CLOSED");
    await expect(learner.mutation(api.orgs.create, { displayName: "Acme", handle: "acme" })).rejects.toThrow(
      "MARKETPLACE_CLOSED",
    );

    // A course they added before the marketplace closed is hidden and can't be practised.
    const catalog = await learner.query(api.catalog.forCurrentUser, {});
    expect(catalog.modules.some((m) => m.id === "rp-retail")).toBe(false);
    expect(await learner.query(api.catalog.scenarioForPractice, { scenarioId: "rp-retail-1" })).toBeNull();
    await expect(
      learner.mutation(api.practice.startAttempt, { scenarioId: "rp-retail-1", sourceLanguage: "English", targetLanguage: "English" }),
    ).rejects.toThrow("COURSE_UNAVAILABLE");
  });

  test("signed-out visitors see nothing", async () => {
    const t = setup();
    await seedCommunityCourse(t, "learner");

    expect(await t.query(api.marketplace.browse, {})).toEqual([]);
    expect(await t.query(api.marketplace.listing, { slug: "retail-interviews" })).toBeNull();
    expect(await t.query(api.orgs.publicPages, {})).toEqual([]);
  });

  test("platform admins still have the whole marketplace", async () => {
    const t = setup();
    await seedCommunityCourse(t, "learner");
    const admin = await seedUser(t, "admin", { role: "platform_admin" });

    expect((await admin.query(api.users.me, {}))?.marketplaceOpen).toBe(true);
    expect((await admin.query(api.marketplace.browse, {})).map((course) => course.slug)).toEqual(["retail-interviews"]);
    expect(await admin.query(api.marketplace.listing, { slug: "retail-interviews" })).not.toBeNull();
    await admin.mutation(api.marketplace.addToLibrary, { moduleId: "rp-retail" });
    expect((await admin.query(api.catalog.forCurrentUser, {})).modules.some((m) => m.id === "rp-retail")).toBe(true);
  });
});
