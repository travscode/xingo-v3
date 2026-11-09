import { describe, expect, test, vi } from "vitest";
import { api, internal } from "../_generated/api";
import { getEntitlement } from "../model/entitlements";
import { BETA_COHORT, BETA_COURSE_ID, parseEmailList, pickSurveyTrigger, toCsv } from "../../lib/beta";
import { BETA_MINUTES } from "../../lib/plans";
import { seedUser, setup } from "./setup.helpers";

type T = ReturnType<typeof setup>;

const answers = { overall: 5, helpful: 4, worked: 3, fair: 4, difficulty: 2, suggestions: "More medical terms" };

async function invite(t: T, email: string, status: "invited" | "accepted" = "invited", clerkId?: string) {
  return t.run(async (ctx) => {
    const token = `token-${email}`;
    await ctx.db.insert("betaInvites", {
      email,
      cohort: BETA_COHORT,
      token,
      status,
      clerkId,
      hadAccount: false,
      invitedByClerkId: "admin",
      createdAt: "2026-11-09T00:00:00.000Z",
    });
    return token;
  });
}

async function scenario(t: T, id: string) {
  await t.run(async (ctx) => {
    const agent = { role: "Doctor", voice: "cedar", goal: "Ask" };
    await ctx.db.insert("scenarios", {
      id,
      moduleId: BETA_COURSE_ID,
      title: id,
      description: "",
      aiAgentA: agent,
      expectedSkills: [],
      difficultyLevel: "beginner",
    } as never);
  });
}

async function scored(t: T, clerkId: string, id: string, scenarioId: string) {
  await t.run(async (ctx) => {
    await ctx.db.insert("sessions", {
      id,
      clerkId,
      moduleId: BETA_COURSE_ID,
      scenarioId,
      durationMinutes: 5,
      score: 60,
      completionStatus: "completed",
      transcriptSummary: "",
      timestamp: "2026-11-09T01:00:00.000Z",
      assessment: { overallScore: 60, summary: "", strengths: [], improvementAreas: [], recommendedNextStep: "", completionDecision: "completed", breakdown: { accuracy: 60, terminology: 60, fluency: 60, turnManagement: 60, professionalism: 60 } },
    } as never);
  });
}

async function joinedTester(t: T, clerkId: string) {
  const asUser = await seedUser(t, clerkId);
  await asUser.mutation(api.beta.claim, { token: await invite(t, `${clerkId}@example.com`) });
  return asUser;
}

describe("reading a pasted list", () => {
  test("handles lines, separators, names, case and duplicates", () => {
    const result = parseEmailList("A@Example.com\nb@example.com, c@example.com; a@example.com\nJo Smith <jo@example.com>\nSmith, Al <al@example.com>\nnot-an-email");
    expect(result.emails).toEqual(["a@example.com", "b@example.com", "c@example.com", "jo@example.com", "al@example.com"]);
    expect(result.invalid).toEqual(["not-an-email"]);
    expect(result.duplicates).toBe(1);
  });
});

describe("sending invites", () => {
  test("only admins can send", async () => {
    const t = setup();
    const asUser = await seedUser(t, "learner");
    await expect(asUser.mutation(api.beta.sendInvites, { emails: ["a@example.com"] })).rejects.toThrow();
  });

  test("skips invalid, repeated and unsubscribed addresses", async () => {
    vi.useFakeTimers();
    const t = setup();
    const admin = await seedUser(t, "admin", { role: "platform_admin" });
    await seedUser(t, "optout", { emailOptOut: true });
    const first = await admin.mutation(api.beta.sendInvites, { emails: ["New@example.com", "new@example.com", "bad", "optout@example.com"] });
    expect(first).toEqual({ queued: 1, skipped: 2 });
    const second = await admin.mutation(api.beta.sendInvites, { emails: ["new@example.com"] });
    expect(second).toEqual({ queued: 0, skipped: 1 });
    vi.useRealTimers();
  });

  test("an existing verified account joins straight away", async () => {
    vi.useFakeTimers();
    const t = setup();
    const admin = await seedUser(t, "admin", { role: "platform_admin" });
    await seedUser(t, "member", { emailVerified: true });
    await admin.mutation(api.beta.sendInvites, { emails: ["member@example.com"] });
    const user = await t.run((ctx) => ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", "member")).unique());
    expect(user?.betaCohort).toBe(BETA_COHORT);
    vi.useRealTimers();
  });
});

describe("joining the beta", () => {
  test("unlocks premium courses and grants minutes once", async () => {
    const t = setup();
    const asUser = await seedUser(t, "tester");
    const token = await invite(t, "tester@example.com");
    await asUser.mutation(api.beta.claim, { token });
    await asUser.mutation(api.beta.claim, { token });

    await t.run(async (ctx) => {
      const user = (await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", "tester")).unique())!;
      const grants = await ctx.db.query("minuteGrants").withIndex("by_clerkId", (q) => q.eq("clerkId", "tester")).collect();
      const entitlement = await getEntitlement(ctx, user);
      expect(user.betaCohort).toBe(BETA_COHORT);
      expect(grants.map((grant) => grant.minutes)).toEqual([BETA_MINUTES]);
      expect(entitlement.premiumAccess).toBe(true);
    });
  });

  test("a link can't be used by a second account or guessed", async () => {
    const t = setup();
    const first = await seedUser(t, "first");
    const second = await seedUser(t, "second");
    const token = await invite(t, "first@example.com");
    await first.mutation(api.beta.claim, { token });
    await expect(second.mutation(api.beta.claim, { token })).rejects.toThrow("BETA_INVITE_USED");
    await expect(second.mutation(api.beta.claim, { token: "nope" })).rejects.toThrow("BETA_INVITE_INVALID");
  });

  test("ending the beta removes access but keeps the record", async () => {
    const t = setup();
    const admin = await seedUser(t, "admin", { role: "platform_admin" });
    const asUser = await joinedTester(t, "tester");
    await admin.mutation(api.beta.endBeta, {});
    await expect(asUser.mutation(api.beta.submitFeedback, { comment: "Hi", page: "/", source: "typed" })).rejects.toThrow("BETA_ONLY");
    await t.run(async (ctx) => {
      const user = (await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", "tester")).unique())!;
      expect((await getEntitlement(ctx, user)).premiumAccess).toBe(false);
      expect(user.betaCohort).toBe(BETA_COHORT);
    });
  });

  test("unsubscribing from an invite stops it being delivered", async () => {
    const t = setup();
    const token = await invite(t, "person@example.com");
    expect(await t.mutation(internal.emails.unsubscribe, { token })).toEqual({ ok: true });
    const row = await t.run((ctx) => ctx.db.query("betaInvites").withIndex("by_token", (q) => q.eq("token", token)).unique());
    expect(row?.status).toBe("unsubscribed");
  });
});

describe("feedback button", () => {
  test("stores who, where and what for beta testers only", async () => {
    const t = setup();
    const outsider = await seedUser(t, "outsider");
    const tester = await joinedTester(t, "tester");
    await expect(outsider.mutation(api.beta.submitFeedback, { comment: "Hi", page: "/", source: "typed" })).rejects.toThrow("BETA_ONLY");
    await expect(tester.mutation(api.beta.submitFeedback, { comment: "   ", page: "/", source: "typed" })).rejects.toThrow("FEEDBACK_EMPTY");
    await tester.mutation(api.beta.submitFeedback, { comment: " Great ", page: "/results/1", source: "voice" });
    const [row] = await t.run((ctx) => ctx.db.query("betaFeedback").collect());
    expect(row).toMatchObject({ clerkId: "tester", email: "tester@example.com", page: "/results/1", comment: "Great", source: "voice" });
  });
});

describe("survey", () => {
  test("picks the right moment and gives up after two dismissals", () => {
    const dismissedOnce = [{ trigger: "first_dialogue" as const, dismissCount: 1, lastDismissedAttemptId: "a" }];
    const dismissedTwice = [{ trigger: "first_dialogue" as const, dismissCount: 2, lastDismissedAttemptId: "b" }];
    expect(pickSurveyTrigger([], "a", false)).toBe("first_dialogue");
    expect(pickSurveyTrigger([], "a", true)).toBe("course_finished");
    expect(pickSurveyTrigger(dismissedOnce, "a", false)).toBeNull();
    expect(pickSurveyTrigger(dismissedOnce, "b", false)).toBe("first_dialogue");
    expect(pickSurveyTrigger(dismissedTwice, "c", false)).toBeNull();
  });

  test("is offered to testers on their own scored CCL dialogues, once answered it stops", async () => {
    const t = setup();
    await scenario(t, "one");
    await scenario(t, "two");
    const tester = await joinedTester(t, "tester");
    const outsider = await seedUser(t, "outsider");
    await scored(t, "tester", "a1", "one");
    await scored(t, "outsider", "o1", "one");

    expect(await outsider.query(api.beta.surveyPrompt, { attemptId: "o1" })).toBeNull();
    expect(await outsider.query(api.beta.surveyPrompt, { attemptId: "a1" })).toBeNull();
    expect(await tester.query(api.beta.surveyPrompt, { attemptId: "a1" })).toEqual({ trigger: "first_dialogue" });

    await tester.mutation(api.beta.submitSurvey, { attemptId: "a1", ...answers });
    expect(await tester.query(api.beta.surveyPrompt, { attemptId: "a1" })).toBeNull();

    await scored(t, "tester", "a2", "two");
    expect(await tester.query(api.beta.surveyPrompt, { attemptId: "a2" })).toEqual({ trigger: "course_finished" });
  });

  test("rejects ratings outside 1 to 5", async () => {
    const t = setup();
    await scenario(t, "one");
    const tester = await joinedTester(t, "tester");
    await scored(t, "tester", "a1", "one");
    await expect(tester.mutation(api.beta.submitSurvey, { attemptId: "a1", ...answers, overall: 6 })).rejects.toThrow("SURVEY_INVALID");
  });
});

describe("CSV export", () => {
  test("escapes quotes and stops text running as a formula", () => {
    expect(toCsv([['He said "hi"', "=HYPERLINK(1)", 5, null]])).toBe('"He said ""hi""","\'=HYPERLINK(1)","5",""');
  });
});
