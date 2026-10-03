import { describe, expect, test } from "vitest";
import { getAllPosts, getRelatedPosts } from "./index";
import { postWordCount, sectionId } from "./utils";
import { cclVocabularyDomains } from "../ccl-vocabulary";
import { examPages } from "../exam-pages";
import { practiceGoals } from "../goals";
import { cclLanguagePages, topicPages } from "../seo-pages";

const posts = getAllPosts();

/** Public routes an article may link to. Keep in sync with app/(marketing). */
const knownPaths = new Set<string>([
  "/",
  "/blog",
  "/naati/ccl",
  "/naati/ccl/vocabulary",
  "/naati/cpi",
  "/interpreting",
  "/exams",
  "/pricing",
  "/how-it-works",
  "/for-interpreters",
  "/for-organizations",
  "/staff-training",
  ...cclLanguagePages.map((page) => `/naati/ccl/${page.slug}`),
  ...topicPages.map((page) => `/interpreting/${page.slug}`),
  ...examPages.map((page) => `/exams/${page.slug}`),
  ...posts.map((post) => `/blog/${post.slug}`),
]);

function allText(post: (typeof posts)[number]) {
  return JSON.stringify(post);
}

describe("blog content", () => {
  test("has 10–14 posts with unique slugs", () => {
    expect(posts.length).toBeGreaterThanOrEqual(10);
    expect(posts.length).toBeLessThanOrEqual(14);
    expect(new Set(posts.map((post) => post.slug)).size).toBe(posts.length);
  });

  test.each(posts.map((post) => [post.slug, post] as const))("%s is well-formed", (_slug, post) => {
    expect(post.slug).toMatch(/^[a-z0-9-]+$/);
    expect(post.description.length).toBeGreaterThanOrEqual(110);
    expect(post.description.length).toBeLessThanOrEqual(160);
    expect(post.metaTitle.length).toBeLessThanOrEqual(55);
    expect(post.published <= post.updated).toBe(true);
    expect(post.sources.length).toBeGreaterThan(0);
    expect(practiceGoals.some((goal) => goal.id === post.cta.goal)).toBe(true);
    expect(knownPaths.has(post.cta.pagePath)).toBe(true);

    const words = postWordCount(post);
    expect(words).toBeGreaterThanOrEqual(800);
    expect(words).toBeLessThanOrEqual(1500);

    // Naming rule: "course", never "module", in user-visible copy.
    expect(allText(post)).not.toMatch(/\bmodules?\b/i);

    for (const slug of post.related ?? []) {
      expect(posts.some((other) => other.slug === slug), `${post.slug} → related ${slug}`).toBe(true);
    }

    const ids = post.sections.map((section) => section.id ?? sectionId(section.heading));
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("internal links point at real pages", () => {
    for (const post of posts) {
      for (const match of allText(post).matchAll(/\]\((\/[^)#]*)/g)) {
        expect(knownPaths.has(match[1]), `${post.slug} links to ${match[1]}`).toBe(true);
      }
    }
  });

  test("related posts never include the post itself", () => {
    for (const post of posts) {
      const related = getRelatedPosts(post);
      expect(related.length).toBe(3);
      expect(related.some((other) => other.slug === post.slug)).toBe(false);
    }
  });
});

describe("CCL vocabulary", () => {
  test("covers NAATI's 12 CCL domains once each", () => {
    expect(cclVocabularyDomains.length).toBe(12);
    expect(new Set(cclVocabularyDomains.map((domain) => domain.slug)).size).toBe(12);
  });
});
