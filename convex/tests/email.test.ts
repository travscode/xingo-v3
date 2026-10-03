import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "../_generated/api";
import { seedUser, setup } from "./setup.helpers";

// Fake timers keep each test's scheduled send jobs from firing into other tests.
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

async function adminWithDraft(t: ReturnType<typeof setup>) {
  const admin = await seedUser(t, "admin", { role: "platform_admin" });
  const id = await admin.mutation(api.emails.createDraft, {});
  const draft = await admin.query(api.emails.getCampaign, { id });
  await admin.mutation(api.emails.updateDraft, {
    id,
    name: "Launch",
    subject: "New exams on XINGO",
    preheader: "OET, IELTS and more",
    fromName: "XINGO",
    templateId: "announcement",
    content: { ...draft!.campaign.content, headline: "Hi", body: "Hello {{firstName}}. [Read more](https://www.xingo.ai/exams)" },
    audience: { mode: "all", clerkIds: [] },
    batchSize: 2,
    batchIntervalMinutes: 0,
  });
  return { admin, id };
}

describe("email campaigns", () => {
  test("only admins can manage campaigns", async () => {
    const t = setup();
    const user = await seedUser(t, "plain");
    await expect(user.mutation(api.emails.createDraft, {})).rejects.toThrow("Not authorized");
    await expect(user.query(api.emails.listCampaigns, {})).rejects.toThrow("Not authorized");
  });

  test("queueing skips unsubscribed users and duplicate emails, and freezes links", async () => {
    const t = setup();
    const { admin, id } = await adminWithDraft(t);
    await seedUser(t, "u1");
    await seedUser(t, "u2", { emailOptOut: true });
    await seedUser(t, "u3", { email: "u1@example.com" });

    const result = await admin.mutation(api.emails.queueSend, { id });
    expect(result.queued).toBe(2); // admin + u1 (u2 opted out, u3 duplicate email)

    const { campaign } = (await admin.query(api.emails.getCampaign, { id }))!;
    expect(campaign.status).toBe("sending");
    expect(campaign.links).toContain("https://www.xingo.ai/exams");
    await expect(admin.mutation(api.emails.updateDraft, { ...campaign, id } as never)).rejects.toThrow();
  });

  test("clicks redirect only to links in the email; unknown tokens go home", async () => {
    const t = setup();
    const { admin, id } = await adminWithDraft(t);
    await admin.mutation(api.emails.queueSend, { id });
    const recipient = await t.run(async (ctx) => (await ctx.db.query("emailRecipients").collect())[0]);
    const { campaign } = (await admin.query(api.emails.getCampaign, { id }))!;
    const index = campaign.links!.indexOf("https://www.xingo.ai/exams");

    expect(await t.mutation(internal.emails.recordClick, { token: recipient.token, linkIndex: index })).toBe("https://www.xingo.ai/exams");
    expect(await t.mutation(internal.emails.recordClick, { token: recipient.token, linkIndex: 999 })).toBe("https://www.xingo.ai");
    expect(await t.mutation(internal.emails.recordClick, { token: "nope", linkIndex: 0 })).toBe("https://www.xingo.ai");

    await t.mutation(internal.emails.recordOpen, { token: recipient.token });
    const { stats, linkStats } = (await admin.query(api.emails.getCampaign, { id }))!;
    expect(stats.opened).toBe(1);
    expect(stats.clicked).toBe(1);
    expect(linkStats[index].clicks).toBe(1);
  });

  test("unsubscribing opts the user out of future campaigns", async () => {
    const t = setup();
    const { admin, id } = await adminWithDraft(t);
    await seedUser(t, "u1");
    await admin.mutation(api.emails.queueSend, { id });
    const recipient = await t.run(async (ctx) =>
      (await ctx.db.query("emailRecipients").collect()).find((r) => r.clerkId === "u1")!,
    );

    await t.mutation(internal.emails.unsubscribe, { token: recipient.token });
    const audience = await admin.query(api.emails.audience, {});
    expect(audience.find((u) => u.clerkId === "u1")?.optedOut).toBe(true);
  });

  test("the batch sender sends, records provider ids and finishes", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("EMAIL_FROM_ADDRESS", "hello@xingo.ai");
    const sent: unknown[][] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: { body: string }) => {
        const messages = JSON.parse(init.body) as unknown[];
        sent.push(messages);
        return new Response(JSON.stringify({ data: messages.map((_, i) => ({ id: `msg_${sent.length}_${i}` })) }), { status: 200 });
      }),
    );

    const t = setup();
    const { admin, id } = await adminWithDraft(t);
    await seedUser(t, "u1");
    await seedUser(t, "u2");
    await admin.mutation(api.emails.queueSend, { id });
    await t.finishAllScheduledFunctions(vi.runAllTimers);

    const { campaign, stats } = (await admin.query(api.emails.getCampaign, { id }))!;
    expect(stats.sent).toBe(3);
    expect(campaign.status).toBe("sent");
    const allRecipients = sent.flatMap((m) => (m as Array<{ to: string[] }>).map((x) => x.to[0]));
    expect(new Set(allRecipients).size).toBe(allRecipients.length); // nobody emailed twice
    expect(sent.length).toBe(2); // batches of 2
    const first = sent[0][0] as { html: string; headers: Record<string, string> };
    expect(first.html).toContain("/e/o/");
    expect(first.html).toContain("/e/c/");
    expect(first.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
  });
});
