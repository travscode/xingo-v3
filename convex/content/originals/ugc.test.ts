import { describe, expect, test } from "vitest";
import { originals } from "./data";
import { droppedSlugs, ugcCreators } from "./ugc";

const originalCourses = new Map(originals.flatMap((c) => c.courses).map((course) => [course.slug, course]));
const kept = ugcCreators.flatMap((creator) => creator.courses.map((course) => ({ creator, course })));
const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
const EMOJI = /\p{Extended_Pictographic}/u;
const BRANDS =
  /\b(starbucks|coles|woolworths|mcdonald'?s|uber|bunnings|kmart|aldi|telstra|optus|big w|myer|airbnb|deliveroo|menulog|tinder|bumble|instagram|tiktok|facebook|linkedin|qantas|ikea|officeworks|myki|opal)\b/i;

describe("UGC-style marketplace seed", () => {
  test("creator and course counts", () => {
    expect(ugcCreators.length).toBeGreaterThanOrEqual(20);
    expect(ugcCreators.length).toBeLessThanOrEqual(26);
    expect(kept.length).toBeGreaterThanOrEqual(60);
    expect(kept.length).toBeLessThanOrEqual(75);

    const counts = ugcCreators.map((c) => c.courses.length);
    expect(counts.every((n) => n >= 1 && n <= 9)).toBe(true);
    expect(counts.filter((n) => n === 1).length).toBeGreaterThanOrEqual(3);
    expect(counts.filter((n) => n >= 2 && n <= 3).length).toBeGreaterThanOrEqual(3);
    expect(counts.filter((n) => n >= 4 && n <= 6).length).toBeGreaterThanOrEqual(2);
    const big = counts.filter((n) => n >= 7).length;
    expect(big).toBeGreaterThanOrEqual(1);
    expect(big).toBeLessThanOrEqual(2);
  });

  test("keepScenarios mix is roughly 25/45/30 and never exceeds the course", () => {
    for (const { course } of kept) {
      const original = originalCourses.get(course.slug);
      expect(course.keepScenarios, course.slug).toBeLessThanOrEqual(original?.scenarios.length ?? 0);
    }
    const share = (n: number) => kept.filter(({ course }) => course.keepScenarios === n).length / kept.length;
    expect(share(1)).toBeGreaterThanOrEqual(0.15);
    expect(share(1)).toBeLessThanOrEqual(0.35);
    expect(share(2)).toBeGreaterThanOrEqual(0.35);
    expect(share(2)).toBeLessThanOrEqual(0.55);
    expect(share(3)).toBeGreaterThanOrEqual(0.2);
    expect(share(3)).toBeLessThanOrEqual(0.4);
  });

  test("handles are unique and URL-safe; accents are distinct hex", () => {
    const handles = ugcCreators.map((c) => c.handle);
    expect(new Set(handles).size).toBe(handles.length);
    for (const handle of handles) expect(handle).toMatch(/^[a-z0-9][a-z0-9._-]{2,23}$/);

    const accents = ugcCreators.map((c) => c.accent.toLowerCase());
    expect(new Set(accents).size).toBe(accents.length);
    for (const accent of accents) expect(accent).toMatch(/^#[0-9a-f]{6}$/);
  });

  test("every existing slug is used exactly once across creators and droppedSlugs", () => {
    const used = [...kept.map(({ course }) => course.slug), ...droppedSlugs];
    expect(new Set(used).size).toBe(used.length);
    expect([...used].sort()).toEqual([...originalCourses.keys()].sort());
  });

  test("creator copy fits and stays anonymous", () => {
    for (const creator of ugcCreators) {
      expect(creator.displayName.trim().length, creator.handle).toBeGreaterThan(0);
      expect(creator.tagline.length, creator.handle).toBeLessThanOrEqual(140);
      const bioWords = words(creator.bio);
      expect(bioWords, creator.handle).toBeGreaterThanOrEqual(15);
      expect(bioWords, creator.handle).toBeLessThanOrEqual(90);
      expect(creator.avatarBrief.length, creator.handle).toBeGreaterThan(20);
      for (const text of [creator.displayName, creator.tagline, creator.bio]) {
        expect(text, creator.handle).not.toMatch(/xingo/i);
      }
    }
    const withEmoji = ugcCreators.filter((c) => EMOJI.test(`${c.displayName} ${c.tagline} ${c.bio}`));
    expect(withEmoji.length).toBeLessThanOrEqual(4);

    const withBanner = ugcCreators.filter((c) => c.bannerBrief).length / ugcCreators.length;
    expect(withBanner).toBeGreaterThanOrEqual(0.4);
    expect(withBanner).toBeLessThanOrEqual(0.8);
  });

  test("course rewrites fit the limits", () => {
    for (const { course } of kept) {
      if (course.title !== undefined) {
        expect(course.title.trim().length, course.slug).toBeGreaterThan(0);
        expect(course.title.length, course.slug).toBeLessThanOrEqual(60);
      }
      if (course.tagline !== undefined) expect(course.tagline.length, course.slug).toBeLessThanOrEqual(140);
      expect(course.bannerBrief.length, course.slug).toBeGreaterThan(20);
    }
  });

  test("no 'module', no real brands anywhere", () => {
    const text = JSON.stringify({ ugcCreators, droppedSlugs });
    expect(text).not.toMatch(/\bmodules?\b/i);
    expect(text).not.toMatch(BRANDS);
  });
});
