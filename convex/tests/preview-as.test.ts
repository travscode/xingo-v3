import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api } from "../_generated/api";
import { seedCatalog, seedUser, setup } from "./setup.helpers";
import { packs, plans } from "../../lib/plans";

const pair = { sourceLanguage: "English", targetLanguage: "Arabic" };

type T = ReturnType<typeof setup>;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-21T10:00:00.000Z"));
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

describe("preview as a member (D-044)", () => {
  test("only platform admins can turn it on", async () => {
    const t = setup();
    const learner = await seedUser(t, "learner");
    await expect(learner.mutation(api.admin.setPreview, { as: "free" })).rejects.toThrow();
  });

  test("a Free preview gets a new Free member's gating and balance", async () => {
    const t = setup();
    await seedCatalog(t);
    await markComingSoon(t, "free-mod");
    const admin = await seedUser(t, "admin", { role: "platform_admin" });

    await admin.mutation(api.admin.setPreview, { as: "free" });
    const me = await admin.query(api.users.me, {});
    expect(me?.entitlement).toMatchObject({
      plan: "free",
      planLabel: "Free",
      remainingMinutes: plans.free.monthlyMinutes,
      premiumAccess: false,
    });
    expect(me?.marketplaceOpen).toBe(false);

    const catalog = await admin.query(api.catalog.forCurrentUser, {});
    const paid = catalog.modules.find((m) => m.id === "paid-mod")!;
    expect(catalog.modules.find((m) => m.id === "free-mod")?.comingSoon).toBe(true);
    expect(paid.scenarios.find((s) => s.id === "paid-scn")?.locked).toBe(true);
    expect(paid.scenarios.find((s) => s.id === "preview-scn")?.locked).toBe(false);

    await expect(admin.mutation(api.practice.startAttempt, { scenarioId: "paid-scn", ...pair })).rejects.toThrow("PREMIUM_REQUIRED");
    await expect(admin.mutation(api.practice.startAttempt, { scenarioId: "free-scn", ...pair })).rejects.toThrow("COURSE_COMING_SOON");
    await expect(admin.mutation(api.practice.startAttempt, { scenarioId: "preview-scn", ...pair })).resolves.toBeDefined();
  });

  test("pack and Pro previews unlock premium courses", async () => {
    const t = setup();
    await seedCatalog(t);
    const admin = await seedUser(t, "admin", { role: "platform_admin" });

    await admin.mutation(api.admin.setPreview, { as: "pack" });
    expect((await admin.query(api.users.me, {}))?.entitlement).toMatchObject({
      plan: "free",
      packMinutesRemaining: packs.starter.minutes,
      premiumAccess: true,
    });

    await admin.mutation(api.admin.setPreview, { as: "professional" });
    expect((await admin.query(api.users.me, {}))?.entitlement).toMatchObject({
      plan: "professional",
      remainingMinutes: plans.professional.monthlyMinutes,
      premiumAccess: true,
    });
    await expect(admin.mutation(api.practice.startAttempt, { scenarioId: "paid-scn", ...pair })).resolves.toBeDefined();
  });

  test("admin tools keep working while previewing, and exiting restores admin access", async () => {
    const t = setup();
    await seedCatalog(t);
    await markComingSoon(t, "paid-mod");
    const admin = await seedUser(t, "admin", { role: "platform_admin" });

    await admin.mutation(api.admin.setPreview, { as: "free" });
    await expect(admin.query(api.admin.listUsers, {})).resolves.toBeDefined();

    await admin.mutation(api.admin.setPreview, { as: null });
    const me = await admin.query(api.users.me, {});
    expect(me?.user.previewAs).toBeUndefined();
    expect(me?.entitlement.planLabel).toBe("Admin");
    expect(me?.marketplaceOpen).toBe(true);
    const catalog = await admin.query(api.catalog.forCurrentUser, {});
    expect(catalog.modules.find((m) => m.id === "paid-mod")?.comingSoon).toBe(false);
  });

  test("a stray preview setting on a non-admin changes nothing", async () => {
    const t = setup();
    await seedCatalog(t);
    const learner = await seedUser(t, "learner", { previewAs: "professional" });
    expect((await learner.query(api.users.me, {}))?.entitlement.plan).toBe("free");
  });
});
