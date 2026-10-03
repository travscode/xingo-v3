import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo-pages";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in app pages, auth screens (endless ?redirect= variants) and email
      // tracking links (/e/*, served by Convex) aren't useful in search results.
      disallow: [
        "/dashboard",
        "/courses",
        "/practice",
        "/results",
        "/progress",
        "/billing",
        "/account",
        "/help",
        "/admin",
        "/welcome",
        "/jobs",
        "/credentials",
        "/sign-in",
        "/sign-up",
        "/e/",
        // Marketplace listings stay crawlable; the creator tools don't. "$" anchors the
        // match so course slugs that merely start with "new"/"earnings" aren't blocked.
        "/marketplace/new$",
        "/marketplace/manage/",
        "/marketplace/manage$",
        "/marketplace/earnings$",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
