import type { MetadataRoute } from "next";
import { cclLanguagePages, SITE_URL, topicPages } from "@/lib/seo-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  });

  return [
    page("/", 1),
    page("/naati/ccl", 0.9),
    page("/naati/cpi", 0.8),
    page("/interpreting", 0.7),
    page("/pricing", 0.7),
    page("/how-it-works", 0.6),
    page("/for-interpreters", 0.5),
    page("/for-organizations", 0.5),
    ...cclLanguagePages.map((language) => page(`/naati/ccl/${language.slug}`, 0.8)),
    ...topicPages.map((topic) => page(`/interpreting/${topic.slug}`, 0.7)),
  ];
}
