import type { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { blogPostPath, BLOG_PATH, getAllPosts } from "@/lib/blog";
import { examPages } from "@/lib/exam-pages";
import { cclLanguagePages, SITE_URL, topicPages } from "@/lib/seo-pages";

/** Re-generate hourly so newly published marketplace courses appear. */
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

async function marketplaceCourses(): Promise<Array<{ slug: string; updatedAt: string }>> {
  try {
    return await fetchQuery(api.marketplace.publishedSlugs, {});
  } catch {
    // The deployment may not have this function yet (or no Convex URL at build time).
    return [];
  }
}

function toDate(value: string, fallback: Date) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const page = (path: string, priority: number, lastModified: Date = now): Entry => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority,
  });

  const posts = getAllPosts();
  const latestPost = posts.reduce((latest, post) => (post.updated > latest ? post.updated : latest), "1970-01-01");
  const courses = await marketplaceCourses();

  return [
    page("/", 1),
    page("/naati/ccl", 0.9),
    page("/naati/ccl/vocabulary", 0.7),
    page("/naati/cpi", 0.8),
    page("/interpreting", 0.7),
    page("/exams", 0.8),
    ...examPages.map((exam) => page(`/exams/${exam.slug}`, 0.8)),
    page("/pricing", 0.7),
    page("/how-it-works", 0.6),
    page("/for-interpreters", 0.5),
    page("/staff-training", 0.7),
    page("/for-organizations", 0.5),
    ...cclLanguagePages.map((language) => page(`/naati/ccl/${language.slug}`, 0.8)),
    ...topicPages.map((topic) => page(`/interpreting/${topic.slug}`, 0.7)),
    page(BLOG_PATH, 0.6, new Date(`${latestPost}T00:00:00Z`)),
    ...posts.map((post) => page(blogPostPath(post.slug), 0.6, new Date(`${post.updated}T00:00:00Z`))),
    page("/marketplace", 0.7),
    page("/marketplace/create", 0.5),
    ...courses.map((course) => page(`/marketplace/${course.slug}`, 0.6, toDate(course.updatedAt, now))),
  ];
}
