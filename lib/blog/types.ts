/**
 * Blog content model. Articles are typed data (no MDX), rendered by
 * app/(marketing)/blog/[slug]/page.tsx.
 *
 * Inline text supports two tiny bits of markup, parsed by the renderer:
 *   **bold**            → <strong>
 *   [label](/path|url)  → internal <Link> or external <a rel="noopener">
 *
 * Writing rules (docs/seo.md): Australian English, plain, no invented
 * statistics or testimonials, hedge exam rules and link the official source,
 * never use the word "module" in copy (say "course").
 */

export type BlogCategory =
  | "NAATI CCL"
  | "NAATI CPI"
  | "OET"
  | "IELTS"
  | "AMC"
  | "Nursing OSCE"
  | "Medical interpreting"
  | "Interpreting skills";

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; title?: string; text: string }
  | { type: "table"; head: string[]; rows: string[][]; caption?: string }
  | { type: "example"; label?: string; lines: Array<{ speaker: string; text: string }> };

export type BlogSection = {
  heading: string;
  /** Optional id for the anchor; derived from the heading when omitted. */
  id?: string;
  blocks: BlogBlock[];
};

export type BlogCta = {
  title: string;
  body: string;
  /** Welcome-flow goal (lib/goals.ts) — the CTA signs people up with this goal preselected. */
  goal: string;
  /** Landing page for the relevant course, linked as the secondary action. */
  pagePath: string;
  pageLabel: string;
  buttonLabel?: string;
};

export type BlogPost = {
  slug: string;
  /** On-page h1. */
  title: string;
  /** <title> (the layout appends " | XINGO"); keep ≤ 60 characters including the suffix where possible. */
  metaTitle: string;
  /** Meta description, 140–160 characters. */
  description: string;
  /** One or two sentences for the index card. */
  excerpt: string;
  category: BlogCategory;
  keywords: string[];
  /** ISO dates (YYYY-MM-DD). */
  published: string;
  updated: string;
  intro: string[];
  sections: BlogSection[];
  faqs?: Array<{ q: string; a: string }>;
  sources: Array<{ label: string; url: string }>;
  cta: BlogCta;
  /** Hand-picked related slugs; the index fills up with same-category posts. */
  related?: string[];
};
