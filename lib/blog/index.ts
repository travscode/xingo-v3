/**
 * Blog registry. Add a post: create lib/blog/posts/<slug>.ts exporting `post`,
 * then import it here. Routes, sitemap and related links pick it up automatically.
 */

import type { BlogCategory, BlogPost } from "./types";
import { post as amcClinical } from "./posts/amc-clinical-exam-communication-stations";
import { post as ieltsPart2 } from "./posts/ielts-speaking-part-2-strategy";
import { post as cmiChi } from "./posts/medical-interpreter-oral-exam-cmi-chi";
import { post as cclPoints } from "./posts/naati-ccl-5-points-australian-pr";
import { post as cclMistakes } from "./posts/naati-ccl-common-mistakes";
import { post as cclResources } from "./posts/naati-ccl-free-practice-resources";
import { post as cclNotes } from "./posts/naati-ccl-note-taking";
import { post as cclRepeats } from "./posts/naati-ccl-repeats-and-self-correction";
import { post as cclFormat } from "./posts/naati-ccl-test-format-and-marking";
import { post as cclTopics } from "./posts/naati-ccl-topics-domains";
import { post as cpiPrep } from "./posts/naati-cpi-test-preparation";
import { post as nmbaOsce } from "./posts/nmba-osce-communication-isbar";
import { post as oetSpeaking } from "./posts/oet-speaking-role-play-structure";
import { post as phoneTips } from "./posts/telephone-interpreting-tips";

export type { BlogBlock, BlogCategory, BlogPost, BlogSection } from "./types";

/** Display order on the index (most important first; dates break ties for "latest"). */
const posts: BlogPost[] = [
  cclFormat,
  cclPoints,
  cclResources,
  cclRepeats,
  cclNotes,
  cclTopics,
  cclMistakes,
  cpiPrep,
  phoneTips,
  oetSpeaking,
  ieltsPart2,
  amcClinical,
  nmbaOsce,
  cmiChi,
];

export const BLOG_PATH = "/blog";

export function blogPostPath(slug: string) {
  return `${BLOG_PATH}/${slug}`;
}

export function getAllPosts() {
  return posts;
}

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug) ?? null;
}

export function getCategories(): BlogCategory[] {
  return [...new Set(posts.map((post) => post.category))];
}

/** Hand-picked related posts first, then same-category posts, then the rest. */
export function getRelatedPosts(post: BlogPost, count = 3) {
  const picked = (post.related ?? [])
    .map((slug) => getPost(slug))
    .filter((candidate): candidate is BlogPost => candidate !== null && candidate.slug !== post.slug);
  const sameCategory = posts.filter((candidate) => candidate.category === post.category);
  const rest = posts;

  const seen = new Set<string>([post.slug]);
  const result: BlogPost[] = [];
  for (const candidate of [...picked, ...sameCategory, ...rest]) {
    if (result.length >= count) break;
    if (seen.has(candidate.slug)) continue;
    seen.add(candidate.slug);
    result.push(candidate);
  }
  return result;
}

/** Posts that link to or support a given landing page (for "Guides" sections). */
export function getPostsForPage(pagePath: string, count = 3) {
  return posts.filter((post) => post.cta.pagePath === pagePath).slice(0, count);
}
