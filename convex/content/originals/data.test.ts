import { describe, expect, test } from "vitest";
import { creatorVoices, slugify } from "../../../lib/marketplace";
import { buildScenario } from "../../marketplace";
import { originals } from "./data";
import type { OriginalScenario } from "./types";

const courses = originals.flatMap((creator) => creator.courses.map((course) => ({ creator, course })));
const scenarios = courses.flatMap(({ creator, course }) =>
  course.scenarios.map((scenario) => ({ creator, course, scenario, where: `${course.slug} / ${scenario.title}` })),
);

const genderOf = (voice: string) => creatorVoices.find((v) => v.value === voice)?.gender;
const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
const isKebab = (value: string) => value === slugify(value);

// Interpreting clients speak whatever language the learner practises.
const NAMES_A_LANGUAGE =
  /\b(english|spanish|mandarin|cantonese|chinese|arabic|vietnamese|hindi|punjabi|urdu|greek|italian|korean|japanese|persian|farsi|dari|pashto|tagalog|filipino|nepali|tamil|bengali|turkish|french|german|portuguese|russian|thai|indonesian|swahili|somali|amharic|dinka|karen|burmese|khmer|sinhala|serbian|croatian|macedonian|polish|ukrainian|language|country|homeland|back home in)\b/i;
const BRANDS =
  /\b(starbucks|coles|woolworths|mcdonald'?s|uber|bunnings|kmart|aldi|telstra|optus|big w|jb hi-?fi|myer|david jones|airbnb|deliveroo|doordash|menulog|tinder|bumble|instagram|tiktok|facebook|linkedin|qantas|chemist warehouse|priceline|westpac|commbank|ikea|officeworks)\b/i;
const BANNED = /\bmodules?\b|pick[- ]?up (line|artist)|\bpua\b|\bnegg?ing\b/i;

describe("XINGO Originals data", () => {
  test("10 studios × 10 courses × 3 scenarios", () => {
    expect(originals).toHaveLength(10);
    for (const creator of originals) expect(creator.courses, creator.handle).toHaveLength(10);
    expect(scenarios).toHaveLength(300);
  });

  test("handles, slugs and accents are unique and well formed", () => {
    const handles = originals.map((c) => c.handle);
    const slugs = courses.map(({ course }) => course.slug);
    expect(new Set(handles).size).toBe(handles.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(originals.map((c) => c.accent.toLowerCase())).size).toBe(10);
    for (const handle of handles) expect(isKebab(handle), handle).toBe(true);
    for (const slug of slugs) expect(isKebab(slug) && slug.length <= 48, slug).toBe(true);
    for (const c of originals) expect(c.accent, c.handle).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  test("interpreting mix: Both Sides 9, School Gate 1, everyone else role-play", () => {
    const interpreting = (handle: string) =>
      originals.find((c) => c.handle === handle)!.courses.filter((course) => course.kind === "interpreting").length;
    expect(interpreting("both-sides")).toBe(9);
    expect(interpreting("school-gate-studio")).toBe(1);
    expect(courses.filter(({ course }) => course.kind === "interpreting")).toHaveLength(10);
  });

  test("creator and course listing copy fits the marketplace limits", () => {
    for (const creator of originals) {
      expect(creator.bio, creator.handle).toContain("XINGO Original");
      expect(creator.tagline.length, creator.handle).toBeLessThanOrEqual(140);
      for (const key of ["displayName", "visualStyle", "logoBrief", "avatarBrief"] as const) {
        expect(creator[key].trim(), `${creator.handle}.${key}`).not.toBe("");
      }
    }
    for (const { course } of courses) {
      const w = course.slug;
      expect(course.title.length, w).toBeLessThanOrEqual(60);
      expect(course.tagline.length, w).toBeLessThanOrEqual(140);
      expect(course.description.length, w).toBeLessThanOrEqual(2000);
      expect(words(course.description), w).toBeGreaterThanOrEqual(100);
      expect(course.keywords.length, w).toBeGreaterThanOrEqual(4);
      expect(course.keywords.length, w).toBeLessThanOrEqual(8);
      for (const k of course.keywords) expect(k, w).toBe(k.trim().toLowerCase());
      expect(course.whatYouGet.length, w).toBeGreaterThanOrEqual(3);
      expect(course.whatYouGet.length, w).toBeLessThanOrEqual(5);
      for (const item of course.whatYouGet) expect(item.length, w).toBeLessThanOrEqual(140);
      expect(course.scenarios.map((s) => s.difficultyLevel), w).toEqual(["beginner", "intermediate", "advanced"]);
    }
  });

  test("every scenario survives buildScenario unclipped", () => {
    for (const { course, scenario, where } of scenarios) {
      const built = buildScenario(course.kind, scenario);
      expect(built.title, where).toBe(scenario.title);
      expect(built.description, where).toBe(scenario.description);
      expect(built.difficultyLevel, where).toBe(scenario.difficultyLevel);
      expectAgent(built.aiAgentA, scenario.character, where);
      if (course.kind === "interpreting") {
        expect(built.agentCount, where).toBe(2);
        expectAgent(built.aiAgentB!, scenario.client!, `${where} (client)`);
      } else {
        expect(built.practiceRuntime.learnerRole, where).toBe(scenario.learnerRole);
        expect(built.practiceRuntime.taskCard, where).toBe(scenario.taskCard);
        expect(built.practiceRuntime.timeLimitMinutes, where).toBe(scenario.timeLimitMinutes);
      }
    }
  });

  test("characters follow the prompt conventions", () => {
    for (const { course, scenario, where } of scenarios) {
      const people = [scenario.character, ...(scenario.client ? [scenario.client] : [])];
      for (const person of people) {
        expect(person.role, where).not.toMatch(/^(a|an|the)\s/i);
        expect(words(person.goal), where).toBeGreaterThanOrEqual(40);
        expect(genderOf(person.voice), `${where}: ${person.name} ${person.voice}`).toMatch(/^(female|male)$/);
      }
      expect(scenario.character.endCondition.trim(), where).not.toBe("");
      expect(scenario.timeLimitMinutes, where).toBeGreaterThanOrEqual(4);
      expect(scenario.timeLimitMinutes, where).toBeLessThanOrEqual(10);

      if (course.kind === "interpreting") {
        expect(scenario.client, where).toBeDefined();
        expect(scenario.character.openingLine, where).toBeTruthy();
        expect(scenario.taskCard ?? scenario.learnerRole, where).toBeUndefined();
        const { name, role, goal, demeanor } = scenario.client!;
        expect([name, role, goal, demeanor].join(" "), where).not.toMatch(NAMES_A_LANGUAGE);
      } else {
        expect(scenario.client, where).toBeUndefined();
        expect(scenario.learnerRole, where).toBeTruthy();
        expect(typeof scenario.learnerOpens, where).toBe("boolean");
        const bullets = scenario.taskCard!.split("\n").filter((line) => line.startsWith("- "));
        expect(bullets.length, where).toBeGreaterThanOrEqual(3);
        expect(bullets.length, where).toBeLessThanOrEqual(5);
      }
    }
  });

  test("no real brands, no 'module', nothing sleazy", () => {
    const all = JSON.stringify(originals);
    expect(all.match(BRANDS)?.[0]).toBeUndefined();
    expect(all.match(BANNED)?.[0]).toBeUndefined();
  });
});

function expectAgent(
  built: { name: string; role: string; goal: string; demeanor: string; voice: string; openingLine?: string; endCondition?: string },
  input: NonNullable<OriginalScenario["client"]> & { openingLine?: string; endCondition?: string },
  where: string,
) {
  expect(built.name, where).toBe(input.name);
  expect(built.role, where).toBe(input.role);
  expect(built.goal, where).toBe(input.goal);
  expect(built.demeanor, where).toBe(input.demeanor);
  expect(built.voice, where).toBe(input.voice);
  expect(built.openingLine, where).toBe(input.openingLine);
  expect(built.endCondition, where).toBe(input.endCondition);
}
