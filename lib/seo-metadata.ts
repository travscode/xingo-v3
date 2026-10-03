import type { Metadata } from "next";

/**
 * Default share image (app/opengraph-image.tsx). Next only injects file-based
 * images when a page doesn't set its own `openGraph`, so pages built with
 * pageMetadata() reference it explicitly.
 */
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "XINGO — practise interpreting tests and speaking exams out loud",
};

/**
 * Page metadata for public pages: title, description, canonical, Open Graph and
 * Twitter in one place (docs/seo-audit-2026-10.md).
 *
 * Next replaces (rather than merges) a parent's `openGraph` when a page sets its
 * own, so every page gets the full block here, including the default image.
 *
 * `title` goes through the root template ("%s | XINGO"); pass `absoluteTitle`
 * to opt out (home page).
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  type?: "website" | "article";
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | XINGO`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: "XINGO",
      locale: "en_AU",
      type,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [DEFAULT_OG_IMAGE.url] },
  };
}
