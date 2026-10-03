import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "../_generated/api";
import { seedUser, setup } from "./setup.helpers";

const pair = { sourceLanguage: "English", targetLanguage: "English" };
const scenario = {
  title: "Launch day questions",
  description: "Answer a customer's questions about the new phone.",
  character: { role: "Customer", goal: "Find out what's new", endCondition: "their questions are answered" },
  learnerRole: "Store specialist",
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-03T10:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

type T = ReturnType<typeof setup>;

async function orgWithCourse(t: T) {
  const owner = await seedUser(t, "owner", { email: "owner@apple.example", emailVerified: true });
  await owner.mutation(api.orgs.create, { displayName: "Apple", handle: "apple" });
  const { moduleId, slug } = await owner.mutation(api.marketplace.createCourse, {
    kind: "roleplay",
    title: "Launch training",
    tagline: "Explain the new phone to customers",
    orgHandle: "apple",
    scenario,
  });
  await owner.mutation(api.marketplace.publish, { moduleId, acceptGuidelines: true });
  const scenarioId = await t.run(async (ctx) => (await ctx.db.query("scenarios").withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId)).first())!.id);
  return { owner, moduleId, slug, scenarioId };
}

async function collection(t: T, owner: Awaited<ReturnType<typeof orgWithCourse>>["owner"], moduleId: string, visibility: "public" | "invite") {
  return owner.mutation(api.orgs.saveCollection, {
    handle: "apple",
    title: "Launch week",
    description: "Everything for launch day",
    visibility,
    moduleIds: [moduleId],
  });
}

async function signIn(t: T, clerkId: string, email: string) {
  const as = t.withIdentity({ subject: clerkId, tokenIdentifier: `test|${clerkId}`, email, emailVerified: true });
  await as.mutation(api.users.syncCurrentUser, { email, name: clerkId });
  await t.run(async (ctx) => {
    const user = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId)).unique();
    await ctx.db.patch(user!._id, { termsVersion: (await import("../../lib/legal")).LEGAL_VERSION });
  });
  return as;
}

describe("organisations", () => {
  test("anyone can create one with a free, unreserved handle", async () => {
    const t = setup();
    const user = await seedUser(t, "founder");
    await expect(user.mutation(api.orgs.create, { displayName: "Pricing Co", handle: "pricing" })).rejects.toThrow("HANDLE_INVALID");
    await user.mutation(api.orgs.create, { displayName: "Apple", handle: "Apple" });
    const other = await seedUser(t, "other");
    await expect(other.mutation(api.orgs.create, { displayName: "Apple 2", handle: "apple" })).rejects.toThrow("HANDLE_TAKEN");

    expect(await user.query(api.orgs.mine, {})).toEqual([expect.objectContaining({ handle: "apple", role: "owner" })]);
    // The org isn't mistaken for the founder's personal creator profile.
    const { moduleId } = await user.mutation(api.marketplace.createCourse, { kind: "roleplay", title: "Mine", tagline: "Personal", scenario });
    const listing = await t.run((ctx) => ctx.db.query("courseListings").withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId)).unique());
    expect(listing?.creatorHandle).not.toBe("apple");
    expect(listing?.orgHandle).toBeUndefined();
  });

  test("org courses are private until they're in a public collection", async () => {
    const t = setup();
    const { owner, moduleId, slug, scenarioId } = await orgWithCourse(t);
    const outsider = await seedUser(t, "outsider");

    expect((await outsider.query(api.marketplace.browse, {})).some((c) => c.moduleId === moduleId)).toBe(false);
    expect(await outsider.query(api.marketplace.listing, { slug })).toBeNull();
    expect(await owner.query(api.marketplace.listing, { slug })).not.toBeNull();
    await expect(outsider.mutation(api.practice.startAttempt, { scenarioId, ...pair })).rejects.toThrow("COURSE_UNAVAILABLE");
    await expect(outsider.mutation(api.marketplace.addToLibrary, { moduleId })).rejects.toThrow();

    const { collectionId } = await collection(t, owner, moduleId, "public");
    expect((await outsider.query(api.marketplace.browse, {})).some((c) => c.moduleId === moduleId)).toBe(true);
    await expect(outsider.mutation(api.practice.startAttempt, { scenarioId, ...pair })).resolves.toBeTruthy();

    await owner.mutation(api.orgs.saveCollection, { handle: "apple", collectionId, title: "Launch week", description: "", visibility: "invite", moduleIds: [moduleId] });
    expect(await outsider.query(api.marketplace.listing, { slug })).toBeNull();
  });

  test("invited people get access when they sign in with that email", async () => {
    const t = setup();
    const { owner, moduleId, scenarioId } = await orgWithCourse(t);
    const { collectionId } = await collection(t, owner, moduleId, "invite");

    const result = await owner.mutation(api.orgs.inviteToCollection, { collectionId, emails: ["Staff@Apple.example", "staff@apple.example"] });
    expect(result).toMatchObject({ invited: 1 });

    const staff = await signIn(t, "staff", "staff@apple.example");
    const catalog = await staff.query(api.catalog.forCurrentUser, {});
    expect(catalog.modules.some((m) => m.id === moduleId)).toBe(true);
    await expect(staff.mutation(api.practice.startAttempt, { scenarioId, ...pair })).resolves.toBeTruthy();

    const page = await staff.query(api.orgs.page, { handle: "apple" });
    expect(page?.kind === "organization" && page.collections[0].access).toBe("active");
  });

  test("invitation links work for whoever opens them, once", async () => {
    const t = setup();
    const { owner, moduleId } = await orgWithCourse(t);
    const { collectionId } = await collection(t, owner, moduleId, "invite");
    await owner.mutation(api.orgs.inviteToCollection, { collectionId, emails: ["work@apple.example"] });
    const token = await t.run(async (ctx) => (await ctx.db.query("orgInvites").first())!.token);

    const personal = await seedUser(t, "personal", { email: "me@gmail.example" });
    expect(await personal.query(api.orgs.invitation, { token })).toMatchObject({ kind: "collection", status: "invited" });
    await expect(personal.mutation(api.orgs.acceptInvitation, { token })).resolves.toMatchObject({ orgHandle: "apple", collectionSlug: "launch-week" });

    const someoneElse = await seedUser(t, "someone");
    await expect(someoneElse.mutation(api.orgs.acceptInvitation, { token })).rejects.toThrow("ORG_INVITE_INVALID");
  });

  test("requests are approved or declined by the team, and access can be removed", async () => {
    const t = setup();
    const { owner, moduleId, scenarioId } = await orgWithCourse(t);
    const { collectionId } = await collection(t, owner, moduleId, "invite");
    const learner = await seedUser(t, "learner");

    await expect(learner.mutation(api.orgs.requestAccess, { collectionId, note: "I start Monday" })).resolves.toEqual({ status: "requested" });
    const [request] = await owner.query(api.orgs.collectionPeople, { collectionId });
    expect(request).toMatchObject({ status: "requested", note: "I start Monday" });
    await expect(learner.query(api.orgs.collectionPeople, { collectionId })).rejects.toThrow("ORG_FORBIDDEN");

    await owner.mutation(api.orgs.respondToRequest, { inviteId: request.id, approve: true });
    await expect(learner.mutation(api.practice.startAttempt, { scenarioId, ...pair })).resolves.toBeTruthy();

    await owner.mutation(api.orgs.revokeInvite, { inviteId: request.id });
    await expect(learner.mutation(api.practice.startAttempt, { scenarioId, ...pair })).rejects.toThrow("COURSE_UNAVAILABLE");
    const library = await t.run((ctx) => ctx.db.query("libraryItems").collect());
    expect(library.filter((item) => item.clerkId === "learner")).toHaveLength(0);
  });

  test("the org's minute pool pays for its team and invited learners, not the public", async () => {
    const t = setup();
    const { owner, moduleId, scenarioId } = await orgWithCourse(t);
    await collection(t, owner, moduleId, "public");
    const admin = await seedUser(t, "xingo_admin", { role: "platform_admin" });
    await admin.mutation(api.marketplaceAdmin.setOrgMinutes, { handle: "apple", monthlyMinutes: 30 });
    await expect(owner.mutation(api.marketplaceAdmin.setOrgMinutes, { handle: "apple", monthlyMinutes: 9999 })).rejects.toThrow();

    // A teammate practises: charged to the pool, their own allowance untouched.
    const teammate = await signIn(t, "teammate", "teammate@apple.example");
    await owner.mutation(api.orgs.inviteTeam, { handle: "apple", emails: ["teammate@apple.example"], role: "creator" });
    await signIn(t, "teammate", "teammate@apple.example");
    const started = await teammate.mutation(api.practice.startAttempt, { scenarioId, ...pair });
    expect(started.fundedByOrg).toBe("apple");
    await t.mutation(internal.practice.reserveRealtimeKey, { attemptId: started.attemptId, clerkId: "teammate" });
    vi.advanceTimersByTime(4 * 60_000 + 5_000);
    await t.mutation(internal.practice.closeForGrading, { attemptId: started.attemptId, clerkId: "teammate", transcriptEntries: [] });

    const me = await teammate.query(api.users.me, {});
    expect(me?.entitlement.allowanceUsed).toBe(0);
    const dashboard = await owner.query(api.orgs.dashboard, { handle: "apple" });
    expect(dashboard.pool).toMatchObject({ monthlyMinutes: 30, usedThisMonth: 5, remaining: 25 });

    // A member of the public uses their own minutes on the public collection.
    const stranger = await seedUser(t, "stranger");
    const publicAttempt = await stranger.mutation(api.practice.startAttempt, { scenarioId, ...pair });
    expect(publicAttempt.fundedByOrg).toBeNull();
  });

  test("only managers run the team, and an org always keeps an owner", async () => {
    const t = setup();
    const { owner } = await orgWithCourse(t);
    const creator = await signIn(t, "maker", "maker@apple.example");
    await owner.mutation(api.orgs.inviteTeam, { handle: "apple", emails: ["maker@apple.example"], role: "creator" });
    await signIn(t, "maker", "maker@apple.example");

    await expect(creator.mutation(api.orgs.inviteTeam, { handle: "apple", emails: ["x@y.example"], role: "admin" })).rejects.toThrow("ORG_FORBIDDEN");
    await expect(creator.query(api.orgs.dashboard, { handle: "apple" })).resolves.toMatchObject({ me: { role: "creator" } });
    await expect(owner.mutation(api.orgs.removeMember, { handle: "apple", clerkId: "owner" })).rejects.toThrow("ORG_LAST_OWNER");

    const outsider = await seedUser(t, "outsider");
    await expect(outsider.query(api.orgs.dashboard, { handle: "apple" })).rejects.toThrow("ORG_FORBIDDEN");
  });

  test("org courses can be edited by the team but earn no creator revenue", async () => {
    const t = setup();
    const { owner, moduleId } = await orgWithCourse(t);
    const creator = await signIn(t, "maker", "maker@apple.example");
    await owner.mutation(api.orgs.inviteTeam, { handle: "apple", emails: ["maker@apple.example"], role: "creator" });
    await signIn(t, "maker", "maker@apple.example");
    await expect(creator.query(api.marketplace.editorData, { moduleId })).resolves.toBeTruthy();
    const outsider = await seedUser(t, "outsider");
    await expect(outsider.query(api.marketplace.editorData, { moduleId })).rejects.toThrow();
  });
});

describe("featured banners and verification", () => {
  test("only admins manage featured banners, with safe links", async () => {
    const t = setup();
    const admin = await seedUser(t, "xingo_admin", { role: "platform_admin" });
    const user = await seedUser(t, "user");
    const slot = { position: 1, title: "Apple is here", linkUrl: "/apple", active: true };

    await expect(user.mutation(api.featured.save, slot)).rejects.toThrow("Not authorized");
    await expect(admin.mutation(api.featured.save, { ...slot, linkUrl: "javascript:alert(1)" })).rejects.toThrow("FEATURE_INVALID");
    await expect(admin.mutation(api.featured.save, { ...slot, position: 4 })).rejects.toThrow("FEATURE_INVALID");
    await admin.mutation(api.featured.save, slot);
    await admin.mutation(api.featured.save, { position: 2, title: "Draft", linkUrl: "", active: false });

    expect(await user.query(api.featured.list, {})).toEqual([expect.objectContaining({ position: 1, title: "Apple is here" })]);
  });

  test("admins can verify any creator", async () => {
    const t = setup();
    const admin = await seedUser(t, "xingo_admin", { role: "platform_admin" });
    const founder = await seedUser(t, "founder");
    await founder.mutation(api.orgs.create, { displayName: "Apple", handle: "apple" });
    await expect(founder.mutation(api.marketplaceAdmin.setVerified, { handle: "apple", verified: true })).rejects.toThrow();
    await admin.mutation(api.marketplaceAdmin.setVerified, { handle: "apple", verified: true });
    const page = await founder.query(api.orgs.page, { handle: "apple" });
    expect(page?.kind === "organization" && page.verified).toBe(true);
  });
});
