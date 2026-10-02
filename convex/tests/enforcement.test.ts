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
