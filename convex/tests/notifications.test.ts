import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "../_generated/api";
import { seedUser, setup } from "./setup.helpers";
import { dueOnboardingDay } from "../onboarding";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-03T23:07:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

type Scheduled = { name: string; args: unknown[] };

async function scheduledEmails(t: ReturnType<typeof setup>) {
  const jobs = (await t.run((ctx) => ctx.db.system.query("_scheduled_functions").collect())) as unknown as Scheduled[];
  return jobs
    .filter((job) => job.name.includes("transactional"))
    .map((job) => (job.args[0] as { email: { kind: string } }).email.kind);
}

describe("customer emails", () => {
  test("a new account gets a welcome email", async () => {
    const t = setup();
    const asUser = t.withIdentity({ subject: "new_user", tokenIdentifier: "test|new_user", email: "n@example.com" });
    await asUser.mutation(api.users.syncCurrentUser, { email: "n@example.com", name: "New Person" });
    expect(await scheduledEmails(t)).toEqual(["welcome"]);

    // Signing in again doesn't send another.
    await asUser.mutation(api.users.syncCurrentUser, { email: "n@example.com", name: "New Person" });
    expect(await scheduledEmails(t)).toEqual(["welcome"]);
  });

  test("subscription changes send one email each, and repeats send nothing", async () => {
    const t = setup();
    await seedUser(t, "sub_user");
    const apply = (args: Record<string, unknown>) =>
      t.mutation(internal.users.applySubscription, { clerkId: "sub_user", stripeSubscriptionId: "sub_1", ...args } as never);

    await apply({ subscriptionStatus: "professional", stripeSubscriptionStatus: "active", cancelAt: null });
    await apply({ subscriptionStatus: "professional", stripeSubscriptionStatus: "active", cancelAt: null });
    await apply({ subscriptionStatus: "professional", stripeSubscriptionStatus: "past_due", cancelAt: null });
    await apply({ subscriptionStatus: "professional", stripeSubscriptionStatus: "active", cancelAt: "2026-11-03T00:00:00.000Z" });
    await apply({ subscriptionStatus: "free", stripeSubscriptionStatus: "canceled", cancelAt: null });

    expect(await scheduledEmails(t)).toEqual(["pro_started", "payment_failed", "pro_cancelling", "pro_ended"]);
  });

  test("a pack purchase sends a confirmation once", async () => {
    const t = setup();
    await seedUser(t, "pack_user");
    await t.mutation(internal.billingData.grantPack, { clerkId: "pack_user", packId: "starter", stripeCheckoutSessionId: "cs_9" });
    await t.mutation(internal.billingData.grantPack, { clerkId: "pack_user", packId: "starter", stripeCheckoutSessionId: "cs_9" });
    expect(await scheduledEmails(t)).toEqual(["pack_purchased"]);
  });
});

describe("onboarding series", () => {
  test("the right day is due, with one day of slack and no backlog", () => {
    expect(dueOnboardingDay(0)).toBeNull();
    expect(dueOnboardingDay(1)).toBe(1);
    expect(dueOnboardingDay(2)).toBe(1);
    expect(dueOnboardingDay(3)).toBe(3);
    expect(dueOnboardingDay(13)).toBe(13);
    expect(dueOnboardingDay(14)).toBe(13);
    expect(dueOnboardingDay(15)).toBeNull();
  });

  test("dispatch queues each learner's day once, skipping opted-out, admins and older accounts", async () => {
    const t = setup();
    const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000 - 60_000).toISOString();
    await seedUser(t, "day3", { createdAt: daysAgo(3), practiceGoal: "naati_ccl" });
    await seedUser(t, "optout", { createdAt: daysAgo(3), emailOptOut: true });
    await seedUser(t, "admin", { createdAt: daysAgo(3), role: "platform_admin" });
    await seedUser(t, "old", { createdAt: daysAgo(40) });

    await t.mutation(internal.onboarding.dispatch, {});
    await t.mutation(internal.onboarding.dispatch, {});

    const rows = await t.run((ctx) => ctx.db.query("onboardingEmails").collect());
    expect(rows.map((row) => [row.clerkId, row.day, row.track])).toEqual([["day3", 3, "ccl"]]);

    const user = await t.run((ctx) => ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", "day3")).unique());
    expect(user?.emailToken).toBeTruthy();
  });

  test("the unsubscribe link in onboarding emails opts the learner out", async () => {
    const t = setup();
    await seedUser(t, "unsub", { emailToken: "tok_123" });
    await t.mutation(internal.emails.unsubscribe, { token: "tok_123" });
    const user = await t.run((ctx) => ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", "unsub")).unique());
    expect(user?.emailOptOut).toBe(true);
  });

  async function queuedRow(t: ReturnType<typeof setup>) {
    await seedUser(t, "learner", { createdAt: new Date(Date.now() - 3 * 86_400_000 - 60_000).toISOString(), practiceGoal: "naati_ccl" });
    await t.mutation(internal.onboarding.dispatch, {});
    const [row] = await t.run((ctx) => ctx.db.query("onboardingEmails").collect());
    return row;
  }

  function stubResend() {
    const sent: Array<{ subject: string; html: string }> = [];
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("EMAIL_FROM_ADDRESS", "hello@example.com");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        sent.push(JSON.parse(String(init.body)) as { subject: string; html: string });
        return new Response("{}", { status: 200 });
      }),
    );
    return sent;
  }

  test("sent emails are tracked: opens, and clicks only to the email's own links", async () => {
    const t = setup();
    const sent = stubResend();
    const row = await queuedRow(t);
    expect(row.token).toBeTruthy();

    await t.action(internal.onboarding.send, { rowId: row._id });
    expect(sent[0].html).toContain(`/e/o/${row.token}.gif`);
    expect(sent[0].html).toContain(`/e/c/${row.token}/0`);

    const afterSend = await t.run((ctx) => ctx.db.get(row._id));
    expect(afterSend?.links?.length).toBeGreaterThan(0);

    await t.mutation(internal.emails.recordOpen, { token: row.token! });
    expect((await t.run((ctx) => ctx.db.get(row._id)))?.firstOpenedAt).toBeTruthy();

    const destination = await t.mutation(internal.emails.recordClick, { token: row.token!, linkIndex: 0 });
    expect(destination).toBe(afterSend!.links![0]);
    expect((await t.run((ctx) => ctx.db.get(row._id)))?.firstClickedAt).toBeTruthy();

    const unknown = await t.mutation(internal.emails.recordClick, { token: row.token!, linkIndex: 999 });
    expect(unknown).toMatch(/^https:\/\/www\.xingo\.ai\/?$/); // unknown link index goes home

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("an admin's edit replaces that pathway's email; only admins can edit, and links must be safe", async () => {
    const t = setup();
    const admin = await seedUser(t, "admin", { role: "platform_admin" });
    const plain = await seedUser(t, "plain");
    const edit = {
      track: "ccl",
      day: 3,
      subject: "Hi {{firstName}}, a quick CCL tip",
      preheader: "One thing to try",
      body: "Hi {{firstName}},\n\nTry a [dialogue](/courses) today.",
      ctaLabel: "Practise now",
      ctaUrl: "/courses",
    };

    await expect(plain.mutation(api.emails.saveOnboardingOverride, edit)).rejects.toThrow("Not authorized");
    await expect(admin.mutation(api.emails.saveOnboardingOverride, { ...edit, ctaUrl: "javascript:alert(1)" })).rejects.toThrow("EMAIL_LINK_INVALID");
    await expect(admin.mutation(api.emails.saveOnboardingOverride, { ...edit, subject: " " })).rejects.toThrow("EMAIL_SUBJECT_REQUIRED");
    await admin.mutation(api.emails.saveOnboardingOverride, edit);

    const sent = stubResend();
    const row = await queuedRow(t);
    await t.action(internal.onboarding.send, { rowId: row._id });
    expect(sent[0].subject).toMatch(/a quick CCL tip$/);
    expect((await t.run((ctx) => ctx.db.get(row._id)))?.edited).toBe(true);

    await admin.mutation(api.emails.resetOnboardingOverride, { track: "ccl", day: 3 });
    expect((await admin.query(api.emails.onboardingReport, {})).overrides).toEqual([]);

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
});
