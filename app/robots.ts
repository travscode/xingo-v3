import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo-pages";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in app pages aren't useful in search results.
      disallow: ["/dashboard", "/modules", "/practice", "/results", "/progress", "/billing", "/account", "/help", "/admin", "/welcome", "/jobs", "/credentials"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
