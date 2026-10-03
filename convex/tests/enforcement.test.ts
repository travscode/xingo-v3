import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "../_generated/api";
import { seedCatalog, seedUser, setup } from "./setup.helpers";
import * as billingData from "../billingData";
import * as practice from "../practice";
import * as seed from "../seed";
import * as sessions from "../sessions";
import * as usage from "../usage";
import * as users from "../users";

const pair = { sourceLanguage: "English", targetLanguage: "Arabic" };

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-02T10:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("account security", () => {
  test("syncCurrentUser never accepts a role from the client", async () => {
    const t = setup();
    const asUser = t.withIdentity({ subject: "user_1", tokenIdentifier: "test|user_1" });

    await expect(
      asUser.mutation(api.users.syncCurrentUser, {
        email: "a@example.com",
        name: "A",
        // @ts-expect-error role is no longer an accepted argument
        role: "platform_admin",
      }),
    ).rejects.toThrow();

    await asUser.mutation(api.users.syncCurrentUser, { email: "a@example.com", name: "A" });
    const user = await asUser.query(api.users.current, {});
    expect(user?.role).toBe("interpreter");
    expect(user?.subscriptionStatus).toBe("free");
  });

  test("new users get no demo sessions", async () => {
    const t = setup();
    const asUser = t.withIdentity({ subject: "user_1", tokenIdentifier: "test|user_1" });
    await asUser.mutation(api.users.syncCurrentUser, { email: "a@example.com", name: "A" });

    const sessions = await asUser.query(api.sessions.listForCurrentUser, {});
    expect(sessions).toHaveLength(0);
  });

  test("subscription, role, usage and seed writers are internal-only", () => {
    const internalOnly = [
      users.applySubscription,
      users.setRole,
      users.setStripeCustomerId,
      usage.recordAiUsage,
      seed.seedBaseData,
      seed.syncScenarioRuntime,
      practice.reserveRealtimeKey,
      practice.closeForGrading,
      practice.saveAssessment,
      billingData.grantPack,
      billingData.grantMinutes,
    ];

    for (const fn of internalOnly) {
      expect((fn as unknown as { isInternal: boolean }).isInternal).toBe(true);
    }

    expect("completeAttempt" in sessions).toBe(false);
    expect("applyStripeSubscription" in users).toBe(false);
  });
});

describe("paywall", () => {
  test("free users can start free modules and free previews, not premium", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "user_free");

    await expect(
      asUser.mutation(api.practice.startAttempt, { scenarioId: "free-scn", ...pair }),
    ).resolves.toMatchObject({ remainingMinutes: 10 });
    await expect(
      asUser.mutation(api.practice.startAttempt, { scenarioId: "preview-scn", ...pair }),
    ).resolves.toBeTruthy();
    await expect(
      asUser.mutation(api.practice.startAttempt, { scenarioId: "paid-scn", ...pair }),
    ).rejects.toThrow("PREMIUM_REQUIRED");
  });

  test("pro subscribers and pack buyers can start premium scenarios", async () => {
    const t = setup();
    await seedCatalog(t);
    const asPro = await seedUser(t, "user_pro", { subscriptionStatus: "professional" });
    await expect(
      asPro.mutation(api.practice.startAttempt, { scenarioId: "paid-scn", ...pair }),
    ).resolves.toMatchObject({ remainingMinutes: 150 });

    const asBuyer = await seedUser(t, "user_pack");
    await t.mutation(internal.billingData.grantPack, {
      clerkId: "user_pack",
      packId: "starter",
      stripeCheckoutSessionId: "cs_1",
    });
    await expect(
      asBuyer.mutation(api.practice.startAttempt, { scenarioId: "paid-scn", ...pair }),
    ).resolves.toMatchObject({ remainingMinutes: 40 });
  });
});

describe("metering", () => {
  test("finishing charges server-measured minutes against the allowance", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "user_m");
    const { attemptId } = await asUser.mutation(api.practice.startAttempt, {
      scenarioId: "free-scn",
      ...pair,
    });
    await t.mutation(internal.practice.reserveRealtimeKey, { attemptId, clerkId: "user_m" });

    vi.advanceTimersByTime(4 * 60_000 + 5_000);
    await t.mutation(internal.practice.closeForGrading, {
      attemptId,
      clerkId: "user_m",
      transcriptEntries: [],
    });

    const me = await asUser.query(api.users.me, {});
    expect(me?.entitlement.allowanceUsed).toBe(5);
    expect(me?.entitlement.remainingMinutes).toBe(5);

    // Closing twice must not double-charge.
    await expect(
      t.mutation(internal.practice.closeForGrading, {
        attemptId,
        clerkId: "user_m",
        transcriptEntries: [],
      }),
    ).rejects.toThrow();
    const after = await asUser.query(api.users.me, {});
    expect(after?.entitlement.allowanceUsed).toBe(5);
  });

  test("users with no minutes left cannot start", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "user_out");
    await t.run(async (ctx) => {
      await ctx.db.insert("usageCharges", {
        clerkId: "user_out",
        attemptId: "old",
        minutes: 10,
        fromAllowance: 10,
        fromPacks: 0,
        billingMonth: "2026-10",
        createdAt: "2026-10-01T00:00:00.000Z",
      });
    });

    await expect(
      asUser.mutation(api.practice.startAttempt, { scenarioId: "free-scn", ...pair }),
    ).rejects.toThrow("OUT_OF_MINUTES");
  });

  test("allowance is spent before packs and never overdrawn", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "user_split");
    await t.mutation(internal.billingData.grantPack, {
      clerkId: "user_split",
      packId: "starter",
      stripeCheckoutSessionId: "cs_split",
    });
    const { attemptId } = await asUser.mutation(api.practice.startAttempt, {
      scenarioId: "free-scn",
      ...pair,
    });
    await t.mutation(internal.practice.reserveRealtimeKey, { attemptId, clerkId: "user_split" });

    vi.advanceTimersByTime(14 * 60_000);
    await t.mutation(internal.practice.closeForGrading, {
      attemptId,
      clerkId: "user_split",
      transcriptEntries: [],
    });

    const me = await asUser.query(api.users.me, {});
    expect(me?.entitlement.allowanceUsed).toBe(10);
    expect(me?.entitlement.packMinutesUsed).toBe(4);
    expect(me?.entitlement.packMinutesRemaining).toBe(26);
  });

  test("heartbeat tells the client to stop when time runs out", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "user_hb");
    const { attemptId } = await asUser.mutation(api.practice.startAttempt, {
      scenarioId: "free-scn",
      ...pair,
    });

    vi.advanceTimersByTime(60_000);
    expect(await asUser.mutation(api.practice.heartbeat, { attemptId })).toMatchObject({
      shouldEnd: false,
    });
    vi.advanceTimersByTime(10 * 60_000);
    expect(await asUser.mutation(api.practice.heartbeat, { attemptId })).toMatchObject({
      shouldEnd: true,
    });
  });

  test("every session has a time limit, even with plenty of minutes", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "user_limit", { role: "platform_admin" });
    const { attemptId } = await asUser.mutation(api.practice.startAttempt, {
      scenarioId: "free-scn",
      ...pair,
    });

    // free-scn is a single-speaker interpreting scenario: 10 minute default limit.
    vi.advanceTimersByTime(10 * 60_000);
    expect(await asUser.mutation(api.practice.heartbeat, { attemptId })).toMatchObject({
      shouldEnd: false,
      timeLimitMs: 10 * 60_000,
    });
    vi.advanceTimersByTime(30_000);
    expect(await asUser.mutation(api.practice.heartbeat, { attemptId })).toMatchObject({
      shouldEnd: true,
      endReason: "time_up",
    });
  });

  test("the server only accepts end reasons the clock supports", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "user_reason", { role: "platform_admin" });
    const { attemptId } = await asUser.mutation(api.practice.startAttempt, {
      scenarioId: "free-scn",
      ...pair,
    });

    vi.advanceTimersByTime(2 * 60_000);
    const closed = await t.mutation(internal.practice.closeForGrading, {
      attemptId,
      clerkId: "user_reason",
      transcriptEntries: [],
      endReason: "time_up",
    });
    expect(closed.endReason).toBe("learner_finished");
  });

  test("a session that stalls before it starts scores 0 instead of going ungraded", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "user_stall", { role: "platform_admin" });
    const { attemptId } = await asUser.mutation(api.practice.startAttempt, {
      scenarioId: "free-scn",
      ...pair,
    });

    vi.advanceTimersByTime(2 * 60_000);
    const outcome = await asUser.action(api.practiceActions.finishAttempt, {
      attemptId,
      transcriptEntries: [],
      endReason: "stalled",
    });
    expect(outcome).toMatchObject({ status: "graded", score: 0, completionDecision: "needs_review" });

    const sessions = await asUser.query(api.sessions.listForCurrentUser, {});
    expect(sessions[0]?.endReason).toBe("stalled");
    expect(sessions[0]?.assessment?.completion?.reachedEnd).toBe(false);
  });

  test("a learner who quits early with too few turns is still ungraded", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "user_quit", { role: "platform_admin" });
    const { attemptId } = await asUser.mutation(api.practice.startAttempt, {
      scenarioId: "free-scn",
      ...pair,
    });

    const outcome = await asUser.action(api.practiceActions.finishAttempt, {
      attemptId,
      transcriptEntries: [],
      endReason: "learner_finished",
    });
    expect(outcome).toEqual({ status: "too_short" });
  });

  test("abandoned attempts are closed by the sweeper and charged to last heartbeat", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "user_ab");
    const { attemptId } = await asUser.mutation(api.practice.startAttempt, {
      scenarioId: "free-scn",
      ...pair,
    });
    await t.mutation(internal.practice.reserveRealtimeKey, { attemptId, clerkId: "user_ab" });

    vi.advanceTimersByTime(3 * 60_000);
    await asUser.mutation(api.practice.heartbeat, { attemptId });
    vi.advanceTimersByTime(10 * 60_000);
    await t.mutation(internal.practice.sweepStaleAttempts, {});

    const sessions = await asUser.query(api.sessions.listForCurrentUser, {});
    expect(sessions[0]?.completionStatus).toBe("abandoned");
    expect(sessions[0]?.chargedMinutes).toBe(3);
  });

  test("realtime keys are capped per attempt and refused for other users", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "user_rt");
    await seedUser(t, "user_other");
    const { attemptId } = await asUser.mutation(api.practice.startAttempt, {
      scenarioId: "free-scn",
      ...pair,
    });

    await expect(
      t.mutation(internal.practice.reserveRealtimeKey, { attemptId, clerkId: "user_other" }),
    ).rejects.toThrow("not found");

    for (let i = 0; i < 6; i += 1) {
      await t.mutation(internal.practice.reserveRealtimeKey, { attemptId, clerkId: "user_rt" });
    }

    await expect(
      t.mutation(internal.practice.reserveRealtimeKey, { attemptId, clerkId: "user_rt" }),
    ).rejects.toThrow("Too many reconnects");
  });
});

describe("failed voice connections", () => {
  test("an attempt that never opened a voice session costs nothing", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "user_novoice");
    const { attemptId } = await asUser.mutation(api.practice.startAttempt, { scenarioId: "free-scn", ...pair });

    // Reservation made, then OpenAI failed and the action released it.
    await t.mutation(internal.practice.reserveRealtimeKey, { attemptId, clerkId: "user_novoice" });
    await t.mutation(internal.practice.releaseRealtimeKey, { attemptId, clerkId: "user_novoice" });

    vi.advanceTimersByTime(3 * 60_000);
    await asUser.mutation(api.practice.cancelAttempt, { attemptId });

    const me = await asUser.query(api.users.me, {});
    expect(me?.entitlement.allowanceUsed).toBe(0);
  });
});

describe("billing idempotency", () => {
  test("a checkout session grants its pack once", async () => {
    const t = setup();
    await seedUser(t, "user_idem");

    const first = await t.mutation(internal.billingData.grantPack, {
      clerkId: "user_idem",
      packId: "plus",
      stripeCheckoutSessionId: "cs_same",
    });
    const second = await t.mutation(internal.billingData.grantPack, {
      clerkId: "user_idem",
      packId: "plus",
      stripeCheckoutSessionId: "cs_same",
    });

    expect(first.granted).toBe(true);
    expect(second.granted).toBe(false);
  });

  test("webhook events are claimed once", async () => {
    const t = setup();
    expect(await t.mutation(internal.billingData.claimStripeEvent, { eventId: "evt_1", type: "x" })).toBe(true);
    expect(await t.mutation(internal.billingData.claimStripeEvent, { eventId: "evt_1", type: "x" })).toBe(false);
  });
});

describe("admin invites", () => {
  test("an admin invite applies only when the email is verified by Clerk", async () => {
    const t = setup();
    await t.run(async (ctx) => {
      await ctx.db.insert("invites", {
        email: "thomas@example.com",
        role: "platform_admin",
        status: "pending",
        invitedByClerkId: "admin_1",
        createdAt: "2026-10-01T00:00:00.000Z",
      });
    });

    // Spoofed: email only in client args, not in the identity token.
    const spoofer = t.withIdentity({ subject: "spoof", tokenIdentifier: "test|spoof" });
    await spoofer.mutation(api.users.syncCurrentUser, { email: "thomas@example.com", name: "Not Thomas" });
    expect((await spoofer.query(api.users.current, {}))?.role).toBe("interpreter");

    const thomas = t.withIdentity({
      subject: "thomas",
      tokenIdentifier: "test|thomas",
      email: "Thomas@Example.com",
      emailVerified: true,
    });
    await thomas.mutation(api.users.syncCurrentUser, { email: "ignored@example.com", name: "Thomas" });
    const user = await thomas.query(api.users.current, {});
    expect(user?.role).toBe("platform_admin");
    expect(user?.email).toBe("thomas@example.com");
  });

  test("admin queries reject non-admins", async () => {
    const t = setup();
    const asUser = await seedUser(t, "plain_user");
    await expect(asUser.query(api.admin.overview, {})).rejects.toThrow("Not authorized");
    await expect(asUser.query(api.admin.listUsers, {})).rejects.toThrow("Not authorized");

    const asAdmin = await seedUser(t, "admin_user", { role: "platform_admin" });
    await expect(asAdmin.query(api.admin.overview, {})).resolves.toMatchObject({ users: { total: 2 } });
    await expect(
      asAdmin.mutation(api.admin.setUserRole, { clerkId: "admin_user", role: "interpreter" }),
    ).rejects.toThrow();
  });
});

describe("practice mode", () => {
  test("practice attempts are recorded as practice and flagged for no grading", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "user_pm");
    const { attemptId } = await asUser.mutation(api.practice.startAttempt, {
      scenarioId: "free-scn",
      ...pair,
      mode: "practice",
    });

    const owner = await t.query(internal.practice.getAttemptOwnerInternal, { attemptId });
    expect(owner?.mode).toBe("practice");

    const closed = await t.mutation(internal.practice.closeForGrading, {
      attemptId,
      clerkId: "user_pm",
      transcriptEntries: [],
    });
    expect(closed.mode).toBe("practice");
  });
});

describe("content pack", () => {
  test("seeds new modules and scenarios once, all valid against the schema", async () => {
    const t = setup();
    const first = await t.mutation(internal.content.seedAustraliaPack, { dryRun: false });
    expect(first.inserted.modules).toHaveLength(2);
    expect(first.inserted.scenarios.length).toBeGreaterThanOrEqual(16);

    const second = await t.mutation(internal.content.seedAustraliaPack, { dryRun: false });
    expect(second.inserted.scenarios).toHaveLength(0);

    const scenarios = await t.run((ctx) => ctx.db.query("scenarios").collect());
    for (const scenario of scenarios) {
      expect(scenario.aiAgentA.language).toBe("English");
      expect(JSON.stringify(scenario)).not.toMatch(/practitioner/i);
      expect(scenario.aiAgentA.endCondition).toBeTruthy();
    }
  });
});

describe("avatars", () => {
  test("lists participants without avatars and never overwrites an existing one", async () => {
    const t = setup();
    await seedCatalog(t);
    const missing = await t.query(internal.avatars.listMissing, {});
    expect(missing.length).toBe(3);

    const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["x"], { type: "image/png" })));
    const first = await t.mutation(internal.avatars.attachAvatar, { scenarioId: "free-scn", agent: "aiAgentA", storageId });
    const second = await t.mutation(internal.avatars.attachAvatar, { scenarioId: "free-scn", agent: "aiAgentA", storageId });
    expect(first.attached).toBe(true);
    expect(second.attached).toBe(false);
    expect((await t.query(internal.avatars.listMissing, {})).length).toBe(2);
  });

  test("dry run reports without generating", async () => {
    const t = setup();
    await seedCatalog(t);
    await expect(t.action(internal.avatars.generateMissing, { dryRun: true })).resolves.toMatchObject({ missing: 3 });
  });
});

describe("exam pack", () => {
  test("seeds exam modules; role-plays are single-agent English with a task card and time limit", async () => {
    const t = setup();
    const result = await t.mutation(internal.content.seedExamPack, { dryRun: false });
    expect(result.inserted.modules).toHaveLength(6);
    expect(result.inserted.scenarios.length).toBeGreaterThanOrEqual(34);

    const scenarios = await t.run((ctx) => ctx.db.query("scenarios").collect());
    const roleplays = scenarios.filter((s) => s.practiceRuntime?.practiceType === "roleplay");
    expect(roleplays.length).toBeGreaterThanOrEqual(28);

    for (const scenario of roleplays) {
      expect(scenario.agentCount).toBe(1);
      expect(scenario.aiAgentA.language).toBe("English");
      expect(scenario.practiceRuntime?.taskCard).toBeTruthy();
      expect(scenario.practiceRuntime?.timeLimitMinutes).toBeGreaterThan(0);
    }

    // Every module has a free preview so the paywall comes after a taste.
    const modules = await t.run((ctx) => ctx.db.query("modules").collect());
    for (const learningModule of modules) {
      expect(scenarios.some((s) => s.moduleId === learningModule.id && s.isFreePreview)).toBe(true);
    }
  });
});

describe("admin access", () => {
  test("platform admins can start premium scenarios on the free plan without running out of minutes", async () => {
    const t = setup();
    await seedCatalog(t);
    const asAdmin = await seedUser(t, "admin_free", { role: "platform_admin", subscriptionStatus: "free" });
    await t.run(async (ctx) => {
      await ctx.db.insert("usageCharges", {
        clerkId: "admin_free",
        attemptId: "old",
        minutes: 500,
        fromAllowance: 500,
        fromPacks: 0,
        billingMonth: "2026-10",
        createdAt: "2026-10-01T00:00:00.000Z",
      });
    });

    await expect(
      asAdmin.mutation(api.practice.startAttempt, { scenarioId: "paid-scn", ...pair }),
    ).resolves.toBeTruthy();
    const me = await asAdmin.query(api.users.me, {});
    expect(me?.entitlement.premiumAccess).toBe(true);
    expect(me?.entitlement.planLabel).toBe("Admin");
  });
});

describe("transcript reveal", () => {
  test("revealing the transcript makes an assessed attempt practice, so it isn't scored", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "user_reveal", { role: "platform_admin" });
    const { attemptId } = await asUser.mutation(api.practice.startAttempt, { scenarioId: "free-scn", ...pair });

    await asUser.mutation(api.practice.switchToPractice, { attemptId });
    const outcome = await asUser.action(api.practiceActions.finishAttempt, { attemptId, transcriptEntries: [] });
    expect(outcome).toEqual({ status: "practice_mode" });
  });

  test("live coaching is refused in assessed mode", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "user_coach", { role: "platform_admin" });
    const { attemptId } = await asUser.mutation(api.practice.startAttempt, { scenarioId: "free-scn", ...pair });

    await expect(
      asUser.action(api.practiceActions.coachTurn, { attemptId, kind: "intro", rendition: "Hi, I'm the interpreter" }),
    ).rejects.toThrow("only available in practice mode");
  });
});
