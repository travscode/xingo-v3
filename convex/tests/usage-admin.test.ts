import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "../_generated/api";
import { seedCatalog, seedUser, setup } from "./setup.helpers";

const pair = { sourceLanguage: "English", targetLanguage: "Arabic" };
const query = { period: "this_month", plan: "all", status: "all", sort: "cost", page: 1, pageSize: 25 } as const;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-02T10:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("admin usage", () => {
  test("sessions, charged minutes and AI cost roll up per user and month", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "heavy");
    await seedUser(t, "idle");
    const asAdmin = await seedUser(t, "boss", { role: "platform_admin" });

    const { attemptId } = await asUser.mutation(api.practice.startAttempt, { scenarioId: "free-scn", ...pair });
    await t.mutation(internal.practice.reserveRealtimeKey, { attemptId, clerkId: "heavy" });
    await asUser.mutation(api.usage.reportRealtimeUsage, {
      eventId: "evt_1",
      attemptId,
      model: "gpt-realtime",
      promptTokens: 100_000,
      completionTokens: 20_000,
      totalTokens: 120_000,
    });
    // The same event reported twice only counts once.
    await asUser.mutation(api.usage.reportRealtimeUsage, {
      eventId: "evt_1",
      attemptId,
      model: "gpt-realtime",
      promptTokens: 100_000,
      completionTokens: 20_000,
      totalTokens: 120_000,
    });
    vi.advanceTimersByTime(4 * 60_000 + 5_000);
    await t.mutation(internal.practice.closeForGrading, { attemptId, clerkId: "heavy", transcriptEntries: [] });

    const result = await asAdmin.query(api.adminUsage.users, query);
    expect(result.total).toBe(3);
    expect(result.rows[0]).toMatchObject({ clerkId: "heavy", attempts: 1, minutes: 5 });
    expect(result.rows[0].costUsd).toBeCloseTo(3, 5); // 0.1M × $20 + 0.02M × $50
    expect(result.summary).toMatchObject({ activeUsers: 1, attempts: 1, minutes: 5 });

    const active = await asAdmin.query(api.adminUsage.users, { ...query, status: "active" });
    expect(active.rows.map((row) => row.clerkId)).toEqual(["heavy"]);
    const search = await asAdmin.query(api.adminUsage.users, { ...query, search: "IDLE@" });
    expect(search.rows.map((row) => row.clerkId)).toEqual(["idle"]);
    const lastMonth = await asAdmin.query(api.adminUsage.users, { ...query, period: "last_month", status: "active" });
    expect(lastMonth.total).toBe(0);

    const paged = await asAdmin.query(api.adminUsage.users, { ...query, pageSize: 5, page: 9 });
    expect(paged.page).toBe(1);
  });

  test("a paused account cannot start practice until resumed", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "paused_user");
    const asAdmin = await seedUser(t, "boss", { role: "platform_admin" });

    await asAdmin.mutation(api.adminUsage.setPracticePaused, { clerkId: "paused_user", paused: true, reason: "Unusual usage" });
    await expect(asUser.mutation(api.practice.startAttempt, { scenarioId: "free-scn", ...pair })).rejects.toThrow("ACCOUNT_PAUSED");
    const paused = await asAdmin.query(api.adminUsage.users, { ...query, status: "paused" });
    expect(paused.rows.map((row) => row.clerkId)).toEqual(["paused_user"]);

    await asAdmin.mutation(api.adminUsage.setPracticePaused, { clerkId: "paused_user", paused: false });
    await expect(asUser.mutation(api.practice.startAttempt, { scenarioId: "free-scn", ...pair })).resolves.toMatchObject({});
  });

  test("pausing mid-session stops voice reconnects", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "mid");
    const asAdmin = await seedUser(t, "boss", { role: "platform_admin" });
    const { attemptId } = await asUser.mutation(api.practice.startAttempt, { scenarioId: "free-scn", ...pair });

    await asAdmin.mutation(api.adminUsage.setPracticePaused, { clerkId: "mid", paused: true });
    await expect(t.mutation(internal.practice.reserveRealtimeKey, { attemptId, clerkId: "mid" })).rejects.toThrow("ACCOUNT_PAUSED");
  });

  test("usage views and pausing are admin-only, and admins can't pause themselves", async () => {
    const t = setup();
    const asUser = await seedUser(t, "plain");
    const asAdmin = await seedUser(t, "boss", { role: "platform_admin" });

    await expect(asUser.query(api.adminUsage.users, query)).rejects.toThrow("Not authorized");
    await expect(asUser.query(api.adminUsage.user, { clerkId: "plain" })).rejects.toThrow("Not authorized");
    await expect(asUser.mutation(api.adminUsage.setPracticePaused, { clerkId: "boss", paused: true })).rejects.toThrow("Not authorized");
    await expect(asAdmin.mutation(api.adminUsage.setPracticePaused, { clerkId: "boss", paused: true })).rejects.toThrow();
  });

  test("backfill rebuilds rollups from history created before the cutoff", async () => {
    const t = setup();
    await seedUser(t, "old");
    await t.run(async (ctx) => {
      await ctx.db.insert("usageCharges", {
        clerkId: "old",
        attemptId: "a1",
        minutes: 7,
        fromAllowance: 7,
        fromPacks: 0,
        billingMonth: "2026-09",
        createdAt: "2026-09-15T00:00:00.000Z",
      });
      await ctx.db.insert("usageCharges", {
        clerkId: "old",
        attemptId: "a2",
        minutes: 3,
        fromAllowance: 3,
        fromPacks: 0,
        billingMonth: "2026-10",
        createdAt: "2026-10-02T12:00:00.000Z",
      });
    });

    const result = await t.mutation(internal.adminUsage.backfillRollups, {
      source: "charges",
      before: "2026-10-02T11:00:00.000Z",
      paginationOpts: { numItems: 100, cursor: null },
    });
    expect(result).toMatchObject({ counted: 1, isDone: true });
    const rollups = await t.run((ctx) => ctx.db.query("usageRollups").collect());
    expect(rollups).toEqual([expect.objectContaining({ clerkId: "old", month: "2026-09", minutes: 7 })]);
  });
});
