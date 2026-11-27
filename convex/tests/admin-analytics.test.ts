import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api } from "../_generated/api";
import { analyticsWindow, bucketKey } from "../../lib/admin-analytics";
import { seedCatalog, seedUser, setup } from "./setup.helpers";

const NOW = "2026-11-27T02:00:00.000Z"; // 12pm AEST, Friday 27 Nov

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("analytics buckets", () => {
  test("days follow Australian Eastern time and weeks start on Monday", () => {
    expect(bucketKey("2026-11-26T13:59:00.000Z", "day")).toBe("2026-11-26");
    expect(bucketKey("2026-11-26T14:00:00.000Z", "day")).toBe("2026-11-27");
    expect(bucketKey(NOW, "week")).toBe("2026-11-23");
    expect(bucketKey("2026-11-30T15:00:00.000Z", "month")).toBe("2026-12");
  });

  test("ranges cover the right number of buckets, ending today", () => {
    const now = Date.parse(NOW);
    const days = analyticsWindow("30d", now);
    expect(days.keys).toHaveLength(30);
    expect(days.keys.at(-1)).toBe("2026-11-27");
    expect(days.keys[0]).toBe("2026-10-29");
    expect(analyticsWindow("90d", now).keys).toHaveLength(13);
    const months = analyticsWindow("12m", now);
    expect(months.keys).toEqual([
      "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05",
      "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11",
    ]);
    const all = analyticsWindow("all", now, "2026-09-03T00:00:00.000Z");
    expect(all.keys).toEqual(["2026-09", "2026-10", "2026-11"]);
    expect(all.previousStart).toBeNull();
  });
});

describe("admin analytics", () => {
  test("admins only", async () => {
    const t = setup();
    const asLearner = await seedUser(t, "learner");
    await expect(asLearner.query(api.adminAnalytics.dashboard, { range: "30d" })).rejects.toThrow();
  });

  test("sign-ups, sessions, minutes, cost and the funnel, without admin accounts", async () => {
    const t = setup();
    await seedCatalog(t);
    const asAdmin = await seedUser(t, "boss", { role: "platform_admin", createdAt: "2026-11-20T00:00:00.000Z" });
    await seedUser(t, "old", { createdAt: "2026-08-01T00:00:00.000Z" });
    await seedUser(t, "keen", { createdAt: "2026-11-20T00:00:00.000Z", onboardedAt: "2026-11-20T00:05:00.000Z" });
    await seedUser(t, "lurker", { createdAt: "2026-11-25T00:00:00.000Z" });

    await t.run(async (ctx) => {
      const session = (id: string, clerkId: string, at: string, graded: boolean) =>
        ctx.db.insert("sessions", {
          id,
          clerkId,
          moduleId: "free-mod",
          scenarioId: "free-scn",
          startedAt: at,
          timestamp: at,
          durationMinutes: 4,
          chargedMinutes: 4,
          score: graded ? 80 : 0,
          completionStatus: graded ? "completed" : "abandoned",
          transcriptSummary: "",
          sourceLanguage: "English",
          targetLanguage: "Arabic",
        });
      await session("a1", "keen", "2026-11-21T01:00:00.000Z", true);
      await session("a2", "keen", "2026-11-26T01:00:00.000Z", false);
      await session("a3", "boss", "2026-11-26T01:00:00.000Z", true);
      await ctx.db.insert("usageCharges", {
        clerkId: "keen",
        attemptId: "a1",
        minutes: 4,
        fromAllowance: 4,
        fromPacks: 0,
        billingMonth: "2026-11",
        createdAt: "2026-11-21T01:05:00.000Z",
      });
      await ctx.db.insert("aiUsageEvents", {
        id: "e1",
        clerkId: "keen",
        source: "realtime",
        model: "gpt-realtime",
        promptTokens: 100_000,
        completionTokens: 20_000,
        totalTokens: 120_000,
        billingMonth: "2026-11",
        createdAt: "2026-11-21T01:04:00.000Z",
      });
    });

    const result = await asAdmin.query(api.adminAnalytics.dashboard, { range: "30d" });
    expect(result.keys).toHaveLength(30);
    expect(result.totals).toMatchObject({ users: 3, onboarded: 1, excludedAdmins: 1 });
    expect(result.current).toMatchObject({ signups: 2, activeLearners: 1, sessions: 2, gradedRate: 50, averageScore: 80, minutes: 4 });
    expect(result.current.costUsd).toBeCloseTo(3, 5); // 0.1M × $20 + 0.02M × $50
    expect(result.current.costPerMinuteUsd).toBeCloseTo(0.75, 5);

    const day = (key: string) => result.keys.indexOf(key);
    expect(result.series.signups[day("2026-11-20")]).toBe(1);
    expect(result.series.sessions[day("2026-11-21")]).toBe(1);
    expect(result.series.minutes[day("2026-11-21")]).toBe(4);
    expect(result.series.totalUsers.at(-1)).toBe(3);
    expect(result.series.averageScore[day("2026-11-21")]).toBe(80);

    expect(result.funnel.map((step) => step.count)).toEqual([2, 1, 1, 1, 1, 0]);
    expect(result.frequency.find((band) => band.label === "2–3 days")?.count).toBe(1);
    expect(result.courses[0]).toMatchObject({ title: "free-mod", sessions: 2, minutes: 8, learners: 1 });

    const withAdmins = await asAdmin.query(api.adminAnalytics.dashboard, { range: "30d", includeAdmins: true });
    expect(withAdmins.current).toMatchObject({ signups: 3, sessions: 3, activeLearners: 2 });
  });
});
