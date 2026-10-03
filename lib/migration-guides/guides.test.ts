import { describe, expect, test } from "vitest";
import {
  getAllMigrationGuides,
  getRelatedGuides,
  guideWordCount,
  MIGRATION_HUB_PATH,
  migrationGuideGroups,
  migrationGuidePagePaths,
  migrationGuidePath,
  migrationGuidesForPage,
} from "./index";
import { sectionId } from "../blog/utils";
import { getAllPosts } from "../blog";
import { cclLanguagePages, topicPages } from "../seo-pages";
import { examPages } from "../exam-pages";
import { practiceGoals } from "../goals";

const guides = getAllMigrationGuides();
const TWO_M = "2M Language Services";

/** Public routes a guide may link to. Keep in sync with app/(marketing). */
const knownPaths = new Set<string>([
  "/",
  "/sign-up",
  "/blog",
  "/naati/ccl",
  "/naati/ccl/vocabulary",
  "/naati/cpi",
  "/interpreting",
  "/exams",
  "/pricing",
  MIGRATION_HUB_PATH,
  ...cclLanguagePages.map((page) => `/naati/ccl/${page.slug}`),
  ...topicPages.map((page) => `/interpreting/${page.slug}`),
  ...examPages.map((page) => `/exams/${page.slug}`),
  ...getAllPosts().map((post) => `/blog/${post.slug}`),
  ...guides.map((guide) => migrationGuidePath(guide.slug)),
]);

/** Text rendered through RichText / FaqSection, where "2M Language Services" is auto-linked to 2m.com.au. */
function linkedText(guide: (typeof guides)[number]) {
  return [
    ...guide.intro,
    ...guide.atAGlance,
    ...guide.sections.flatMap((section) =>
      section.blocks.flatMap((block) => {
        switch (block.type) {
          case "p":
            return [block.text];
          case "callout":
            return [block.text];
          case "ul":
          case "ol":
            return block.items;
          case "table":
            return block.rows.flat();
          case "example":
            return block.lines.map((line) => line.text);
        }
      }),
    ),
    ...guide.xingo.text,
    ...guide.faqs.map((faq) => faq.a),
  ];
}

describe("migration guides", () => {
  test("has 10–14 guides with unique slugs and titles, all grouped once", () => {
    expect(guides.length).toBeGreaterThanOrEqual(10);
    expect(guides.length).toBeLessThanOrEqual(14);
    expect(new Set(guides.map((guide) => guide.slug)).size).toBe(guides.length);
    expect(new Set(guides.map((guide) => guide.title)).size).toBe(guides.length);
    expect(new Set(guides.map((guide) => guide.metaTitle)).size).toBe(guides.length);
    expect(new Set(guides.map((guide) => guide.description)).size).toBe(guides.length);
    expect(migrationGuideGroups.every((entry) => entry.guides.length > 0)).toBe(true);
  });

  test("guide slugs don't duplicate blog slugs (avoids cannibalising the same query)", () => {
    const blogSlugs = new Set(getAllPosts().map((post) => post.slug));
    for (const guide of guides) expect(blogSlugs.has(guide.slug)).toBe(false);
  });

  test.each(guides.map((guide) => [guide.slug, guide] as const))("%s is well-formed", (_slug, guide) => {
    expect(guide.slug).toMatch(/^[a-z0-9-]+$/);
    expect(`${guide.metaTitle} | XINGO`.length).toBeLessThanOrEqual(60);
    expect(guide.description.length).toBeGreaterThanOrEqual(110);
    expect(guide.description.length).toBeLessThanOrEqual(160);
    expect(guide.published <= guide.updated).toBe(true);
    expect(guide.atAGlance.length).toBeGreaterThanOrEqual(3);
    expect(guide.atAGlance.length).toBeLessThanOrEqual(5);
    expect(guide.faqs.length).toBeGreaterThanOrEqual(4);
    expect(guide.faqs.length).toBeLessThanOrEqual(6);
    expect(guide.xingo.links.length).toBeGreaterThan(0);
    expect(practiceGoals.some((goal) => goal.id === guide.cta.goal)).toBe(true);

    // Sources: official, https, unique.
    expect(guide.sources.length).toBeGreaterThanOrEqual(3);
    for (const source of guide.sources) expect(source.url).toMatch(/^https:\/\//);
    expect(new Set(guide.sources.map((source) => source.url)).size).toBe(guide.sources.length);

    const words = guideWordCount(guide);
    expect(words, `${guide.slug} has ${words} words`).toBeGreaterThanOrEqual(700);
    expect(words, `${guide.slug} has ${words} words`).toBeLessThanOrEqual(1600);

    // Naming rule: "course", never "module", in user-visible copy.
    expect(JSON.stringify(guide)).not.toMatch(/\bmodules?\b/i);

    // Related guides: 3–5 real siblings, never itself.
    expect(guide.related.length).toBeGreaterThanOrEqual(3);
    expect(guide.related.length).toBeLessThanOrEqual(5);
    expect(guide.related).not.toContain(guide.slug);
    expect(getRelatedGuides(guide).length).toBe(guide.related.length);

    const ids = guide.sections.map((section) => section.id ?? sectionId(section.heading));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain("how-xingo-helps");
  });

  test("internal links point at real pages", () => {
    for (const guide of guides) {
      const text = JSON.stringify(guide);
      for (const match of text.matchAll(/\]\((\/[^)#]*)/g)) {
        expect(knownPaths.has(match[1]), `${guide.slug} links to ${match[1]}`).toBe(true);
      }
      for (const link of guide.xingo.links) {
        expect(knownPaths.has(link.href), `${guide.slug} → ${link.href}`).toBe(true);
      }
    }
  });

  test("every guide is linked from at least one sibling (no orphans in the cluster)", () => {
    for (const guide of guides) {
      const linkedFromSibling = guides.some(
        (other) =>
          other.slug !== guide.slug &&
          (other.related.includes(guide.slug) || JSON.stringify(other).includes(migrationGuidePath(guide.slug))),
      );
      expect(linkedFromSibling, `${guide.slug} is orphaned`).toBe(true);
    }
  });

  test('"2M Language Services" only appears where the renderer links it', () => {
    for (const guide of guides) {
      const unlinked = [
        guide.title,
        guide.metaTitle,
        guide.description,
        guide.excerpt,
        ...guide.keywords,
        ...guide.sections.flatMap((section) => [
          section.heading,
          ...section.blocks.flatMap((block) => (block.type === "callout" && block.title ? [block.title] : [])),
          ...section.blocks.flatMap((block) => (block.type === "table" ? block.head : [])),
        ]),
        ...guide.faqs.map((faq) => faq.q),
        ...guide.xingo.links.flatMap((link) => [link.label, link.description]),
        ...guide.sources.map((source) => source.label),
        guide.cta.title,
        guide.cta.body,
        guide.image?.alt ?? "",
      ];
      for (const text of unlinked) expect(text, `${guide.slug}: "${text}"`).not.toContain(TWO_M);

      // Where 2M is mentioned, the partnership framing is kept: 2M decides who it engages.
      const mentions = linkedText(guide).filter((text) => text.includes(TWO_M));
      if (mentions.length) {
        expect(JSON.stringify(guide), `${guide.slug} must say 2M decides`).toMatch(/2M makes its own decisions/);
      }
      // Never markdown-link 2M manually (the renderer does it; a manual link would bypass rel/target rules).
      expect(JSON.stringify(guide)).not.toMatch(/\[2M Language Services\]\(/);
    }
  });

  test("no invented numbers: no salaries, pass rates or processing times", () => {
    for (const guide of guides) {
      const text = JSON.stringify(guide);
      expect(text).not.toMatch(/\bper (hour|annum|year)\b|\bsalar(y|ies)\b.*\$\d/i);
      expect(text).not.toMatch(/\bpass rate\b.*\d+%/i);
      expect(text).not.toMatch(/\bprocessing times?\b.*\d+ (days|weeks|months)/i);
    }
  });

  test("callout mappings for existing pages resolve to real guides", () => {
    for (const path of migrationGuidePagePaths) {
      const linked = migrationGuidesForPage(path);
      expect(linked.length, path).toBeGreaterThanOrEqual(1);
      expect(linked.length, path).toBeLessThanOrEqual(2);
    }
  });
});
