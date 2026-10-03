/**
 * Migration guide registry: the topic cluster around /migrate-to-australia
 * (docs/seo.md). Add a guide: create lib/migration-guides/guides/<slug>.ts
 * exporting `guide`, import it here and add it to a group. The route, sitemap,
 * hub section and related links pick it up automatically.
 */

import { plainText } from "../blog/utils";
import type { BlogBlock } from "../blog/types";
import type { MigrationGuide, MigrationGuideGroup } from "./types";
import { guide as becomeInterpreter } from "./guides/become-an-interpreter-in-australia";
import { guide as communityLanguagePoints } from "./guides/community-language-points";
import { guide as doctors } from "./guides/doctors-moving-to-australia";
import { guide as englishTest } from "./guides/english-test-for-australian-pr";
import { guide as registeredAgent } from "./guides/find-a-registered-migration-agent";
import { guide as firstWeeks } from "./guides/first-weeks-in-australia";
import { guide as freeEnglish } from "./guides/free-english-classes-amep";
import { guide as freeInterpreter } from "./guides/free-interpreter-services";
import { guide as whichTest } from "./guides/ielts-vs-pte-vs-oet";
import { guide as bilingualJobs } from "./guides/jobs-for-bilingual-migrants";
import { guide as nurses } from "./guides/nurses-moving-to-australia";
import { guide as pointsTest } from "./guides/skilled-migration-points-test";
import { guide as translating } from "./guides/translating-documents-for-a-visa";

export type { MigrationGuide, MigrationGuideGroup } from "./types";

export const MIGRATION_HUB_PATH = "/migrate-to-australia";
export const MIGRATION_HUB_TITLE = "Migrating to Australia";
/** Id of the "Migration guides" section on the hub (footer links here). */
export const MIGRATION_GUIDES_ANCHOR = "guides";

/** Hub order: groups, then guides within each group. */
export const migrationGuideGroups: Array<{ group: MigrationGuideGroup; description: string; guides: MigrationGuide[] }> = [
  {
    group: "Language & tests",
    description: "Proving your English, choosing a test and free classes.",
    guides: [englishTest, whichTest, freeEnglish],
  },
  {
    group: "Points & visas",
    description: "How the points test works, community language points and getting help.",
    guides: [pointsTest, communityLanguagePoints, registeredAgent, translating],
  },
  {
    group: "Professions",
    description: "Registration pathways for nurses and doctors.",
    guides: [nurses, doctors],
  },
  {
    group: "Settling in",
    description: "Your first weeks, and free interpreting when you need it.",
    guides: [firstWeeks, freeInterpreter],
  },
  {
    group: "Work",
    description: "Putting your languages to work.",
    guides: [becomeInterpreter, bilingualJobs],
  },
];

const guides: MigrationGuide[] = migrationGuideGroups.flatMap((entry) => entry.guides);

export function migrationGuidePath(slug: string) {
  return `${MIGRATION_HUB_PATH}/${slug}`;
}

export function getAllMigrationGuides() {
  return guides;
}

export function getMigrationGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug) ?? null;
}

/** The guide's hand-picked siblings, in order. */
export function getRelatedGuides(guide: MigrationGuide) {
  return guide.related
    .map((slug) => getMigrationGuide(slug))
    .filter((candidate): candidate is MigrationGuide => candidate !== null && candidate.slug !== guide.slug);
}

function blockText(block: BlogBlock): string {
  switch (block.type) {
    case "p":
      return block.text;
    case "callout":
      return `${block.title ?? ""} ${block.text}`;
    case "ul":
    case "ol":
      return block.items.join(" ");
    case "table":
      return [...block.head, ...block.rows.flat()].join(" ");
    case "example":
      return block.lines.map((line) => line.text).join(" ");
  }
}

/** Words a reader sees in the body: intro, at-a-glance, sections, "How XINGO helps" and FAQs. */
export function guideWordCount(guide: MigrationGuide) {
  const text = [
    ...guide.intro,
    ...guide.atAGlance,
    ...guide.sections.flatMap((section) => [section.heading, ...section.blocks.map(blockText)]),
    ...guide.xingo.text,
    ...guide.faqs.flatMap((faq) => [faq.q, faq.a]),
  ]
    .map(plainText)
    .join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

export function guideReadingMinutes(guide: MigrationGuide) {
  return Math.max(1, Math.round(guideWordCount(guide) / 220));
}

/**
 * Migration guides linked from existing practice pages ("Moving to Australia?"
 * callouts). One or two per page, chosen for relevance — don't stuff more in.
 */
const pageGuideLinks: Record<string, string[]> = {
  "/naati/ccl": ["community-language-points", "skilled-migration-points-test"],
  "/naati/ccl/[language]": ["community-language-points", "become-an-interpreter-in-australia"],
  "/naati/cpi": ["become-an-interpreter-in-australia", "jobs-for-bilingual-migrants"],
  "/exams/ielts-speaking": ["english-test-for-australian-pr", "ielts-vs-pte-vs-oet"],
  "/exams/oet-speaking": ["ielts-vs-pte-vs-oet", "nurses-moving-to-australia"],
  "/exams/amc-clinical-exam": ["doctors-moving-to-australia"],
  "/exams/nmba-osce": ["nurses-moving-to-australia"],
  "/interpreting": ["become-an-interpreter-in-australia"],
};

export function migrationGuidesForPage(pagePath: string) {
  return (pageGuideLinks[pagePath] ?? [])
    .map((slug) => getMigrationGuide(slug))
    .filter((guide): guide is MigrationGuide => guide !== null);
}

export const migrationGuidePagePaths = Object.keys(pageGuideLinks);
