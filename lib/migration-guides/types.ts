/**
 * Migration guide content model: the topic cluster under /migrate-to-australia
 * (docs/seo.md). Typed data, rendered by
 * app/(marketing)/migrate-to-australia/[guide]/page.tsx.
 *
 * Inline text uses the blog markup (**bold**, [label](/path|url)); see
 * lib/blog/types.ts. "2M Language Services" in rendered body text, FAQ answers
 * and the "How XINGO helps" copy is linked to 2m.com.au automatically, so never
 * put it in titles, headings or meta fields (guides.test.ts checks this).
 *
 * Writing rules: general information only, never migration advice; Australian
 * English; no invented numbers (processing times, pass rates, salaries);
 * hedge anything that changes ("at the time of writing", "check the current …");
 * every fact backed by an official source in `sources`; "course", never "module".
 */

import type { BlogSection } from "../blog/types";

export type MigrationGuideGroup = "Language & tests" | "Points & visas" | "Professions" | "Settling in" | "Work";

export type MigrationGuide = {
  slug: string;
  /** On-page h1. */
  title: string;
  /** <title> before the " | XINGO" suffix; the full title must stay ≤ 60 characters. */
  metaTitle: string;
  /** Meta description, 110–160 characters. */
  description: string;
  /** One sentence for cards on the hub and in "Related guides". */
  excerpt: string;
  group: MigrationGuideGroup;
  /** Search intents this page is written for (also emitted as Article keywords). */
  keywords: string[];
  /** ISO dates (YYYY-MM-DD). */
  published: string;
  updated: string;
  /** Optional scene image from public/images/scenes. */
  image?: { src: string; alt: string };
  /** 3–5 short points shown in the "At a glance" box. */
  atAGlance: string[];
  intro: string[];
  sections: BlogSection[];
  /** "How XINGO helps": honest copy plus links to the matching practice pages. */
  xingo: {
    text: string[];
    links: Array<{ href: string; label: string; description: string }>;
  };
  faqs: Array<{ q: string; a: string }>;
  sources: Array<{ label: string; url: string }>;
  /** Sibling guide slugs (3–5). */
  related: string[];
  cta: {
    title: string;
    body: string;
    /** Welcome-flow goal (lib/goals.ts). */
    goal: string;
    buttonLabel?: string;
  };
};
