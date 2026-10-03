import { describe, expect, test } from "vitest";
import { buildOnboardingEmail } from "./onboarding-content";
import { ONBOARDING_DAYS, type OnboardingContext, type OnboardingTrack } from "./onboarding-types";
import { getAllPosts } from "../blog";
import { examPages } from "../exam-pages";
import { practiceGoals } from "../goals";
import { getAllMigrationGuides, MIGRATION_HUB_PATH, migrationGuidePath } from "../migration-guides";
import { cclLanguagePages, topicPages } from "../seo-pages";

const SITE = "https://www.xingo.ai";
const NAME = "Alexandria"; // 10 characters

const TRACKS: OnboardingTrack[] = ["ielts", "oet", "clinical", "ccl", "interpreter", "us_interpreter", "general"];

/** Routes an onboarding email may link to. Keep in sync with app/. */
const knownPaths = new Set<string>([
  "/",
  "/blog",
  "/exams",
  "/pricing",
  "/how-it-works",
  "/for-interpreters",
  "/interpreting",
  "/naati/ccl",
  "/naati/ccl/vocabulary",
  "/naati/cpi",
  // Signed-in app
  "/dashboard",
  "/courses",
  "/progress",
  "/billing",
  "/marketplace",
  "/help",
  "/account",
  MIGRATION_HUB_PATH,
  ...getAllMigrationGuides().map((guide) => migrationGuidePath(guide.slug)),
  ...cclLanguagePages.map((page) => `/naati/ccl/${page.slug}`),
  ...topicPages.map((page) => `/interpreting/${page.slug}`),
  ...examPages.map((page) => `/exams/${page.slug}`),
  ...getAllPosts().map((post) => `/blog/${post.slug}`),
  ...practiceGoals.flatMap((goal) => goal.moduleOrder.map((id) => `/courses/${id}`)),
]);

const goalsByTrack: Record<OnboardingTrack, Array<string | null>> = {
  ielts: ["ielts"],
  oet: ["oet"],
  clinical: ["amc", "nmba_osce"],
  ccl: ["naati_ccl"],
  interpreter: ["naati_cpi", "medical", "ndis", "legal"],
  us_interpreter: ["us_medical_oral"],
  general: ["general", null],
};

function ctxVariants(goalId: string | null): Array<[string, OnboardingContext]> {
  const base: OnboardingContext = {
    siteUrl: SITE,
    goalLabel: practiceGoals.find((goal) => goal.id === goalId)?.label ?? null,
    goalId,
    language: null,
    sessions: 0,
    bestScore: null,
    minutesLeft: 10,
    freeMonthlyMinutes: 10,
    isPro: false,
  };
  return [
    ["new free user", base],
    ["three sessions, best score, Spanish, Pro", { ...base, sessions: 3, bestScore: "68/90", language: "Spanish", minutesLeft: 120, isPro: true }],
    ["one session, no score yet, Mandarin", { ...base, sessions: 1, language: "Mandarin", minutesLeft: 1 }],
    ["no minutes left, unknown language", { ...base, sessions: 3, bestScore: "Band 6.5", language: "Klingon", minutesLeft: 0 }],
    ["trailing slash site", { ...base, siteUrl: `${SITE}/` }],
  ];
}

function plainWords(markdown: string) {
  const text = markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*#]/g, " ")
    .replace(/^- /gm, " ");
  return text.split(/\s+/).filter(Boolean).length;
}

function linksIn(text: string) {
  return [...text.matchAll(/\]\(([^)\s]+)\)/g)].map((match) => match[1]);
}

const cases = TRACKS.flatMap((track) =>
  goalsByTrack[track].flatMap((goalId) =>
    ctxVariants(goalId).map(([label, ctx]) => ({ track, goalId, label, ctx })),
  ),
);

describe("onboarding emails", () => {
  test.each(cases)("$track ($goalId) · $label", ({ track, ctx }) => {
    const subjects = new Set<string>();

    for (const day of ONBOARDING_DAYS) {
      const email = buildOnboardingEmail(day, track, ctx);
      const where = `${track} day ${day}`;
      const subject = email.subject.replace(/\{\{firstName\}\}/g, NAME);

      expect(subject.trim().length, where).toBeGreaterThan(0);
      expect(subject.length, `${where}: "${subject}"`).toBeLessThanOrEqual(60);
      expect(email.preheader.length, `${where}: "${email.preheader}"`).toBeLessThanOrEqual(110);
      expect(email.preheader.trim().length, where).toBeGreaterThan(0);
      expect(email.templateId).toBe("letter");

      const words = plainWords(email.content.body);
      expect(words, `${where} has ${words} words`).toBeGreaterThanOrEqual(100);
      expect(words, `${where} has ${words} words`).toBeLessThanOrEqual(320);

      expect(email.content.ctaLabel, where).toBeTruthy();
      expect(email.content.ctaUrl, where).toBeTruthy();
      expect(email.content.ctaUrl!.startsWith(SITE) || email.content.ctaUrl!.startsWith("https://"), where).toBe(true);
      expect(email.content.signature).toBeTruthy();

      const all = JSON.stringify(email);
      expect(all, where).not.toMatch(/module/i);
      expect(all, where).not.toMatch(/\bundefined\b|\bnull\b|\bNaN\b/);
      expect(all, where).not.toMatch(/xingo\.ai\/\//); // no double slashes

      for (const url of [...linksIn(email.content.body), email.content.ctaUrl!]) {
        expect(url, `${where} → ${url}`).toMatch(/^https:\/\//);
        if (url.startsWith(SITE)) {
          const path = url.slice(SITE.length).split(/[?#]/)[0] || "/";
          expect(knownPaths.has(path), `${where} links to unknown route ${path}`).toBe(true);
        }
      }

      subjects.add(subject);
    }

    expect(subjects.size).toBe(ONBOARDING_DAYS.length);
  });

  test("all 49 subjects are unique across tracks", () => {
    for (const [, ctx] of ctxVariants(null)) {
      const subjects = TRACKS.flatMap((track) =>
        ONBOARDING_DAYS.map((day) => buildOnboardingEmail(day, track, { ...ctx, goalId: goalsByTrack[track][0] }).subject),
      );
      expect(subjects).toHaveLength(49);
      expect(new Set(subjects).size).toBe(49);
    }
  });

  test("subjects use at most one emoji across the series", () => {
    const subjects = TRACKS.flatMap((track) => ONBOARDING_DAYS.map((day) => buildOnboardingEmail(day, track, ctxVariants(null)[0][1]).subject));
    const emoji = subjects.join("").match(/\p{Extended_Pictographic}/gu) ?? [];
    expect(emoji.length).toBeLessThanOrEqual(1);
  });

  test("day 7 reports real progress and never invents a score", () => {
    const ctx = ctxVariants("naati_ccl")[0][1];
    const none = buildOnboardingEmail(7, "ccl", ctx).content.body;
    expect(none).toMatch(/not too late/);
    expect(none).not.toMatch(/best score/i);

    const some = buildOnboardingEmail(7, "ccl", { ...ctx, sessions: 3, bestScore: "68/90", minutesLeft: 4 }).content.body;
    expect(some).toContain("3 scored dialogues");
    expect(some).toContain("68/90");
    expect(some).toContain("4 practice minutes");
  });

  test("clinical track follows the goal", () => {
    const ctx = ctxVariants("amc")[0][1];
    expect(buildOnboardingEmail(3, "clinical", ctx).subject).toMatch(/AMC/);
    expect(buildOnboardingEmail(3, "clinical", { ...ctx, goalId: "nmba_osce" }).subject).toMatch(/OSCE/);
  });

  test("CCL emails use the learner's language", () => {
    const ctx = { ...ctxVariants("naati_ccl")[0][1], language: "Spanish" };
    expect(buildOnboardingEmail(1, "ccl", ctx).subject).toContain("Spanish");
    expect(buildOnboardingEmail(9, "ccl", ctx).content.body).toContain(`${SITE}/naati/ccl/spanish`);
  });

  test("every track mentions independence from exam bodies at least once", () => {
    for (const track of TRACKS) {
      const text = ONBOARDING_DAYS.map((day) => buildOnboardingEmail(day, track, ctxVariants(goalsByTrack[track][0])[0][1]).content.body).join("\n");
      expect(text, track).toMatch(/XINGO isn't affiliated/);
    }
  });

  test("2M Language Services is named exactly and linked", () => {
    const body = buildOnboardingEmail(9, "interpreter", ctxVariants("naati_cpi")[0][1]).content.body;
    expect(body).toContain("[2M Language Services](https://www.2m.com.au/)");
  });
});
