import type { NextConfig } from "next";
import { MARKETPLACE_OPEN } from "./lib/marketplace";

/** Convex HTTP actions domain, e.g. https://<deployment>.convex.site */
const convexSiteUrl =
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
  (process.env.NEXT_PUBLIC_CONVEX_URL ?? "").replace(".convex.cloud", ".convex.site");

const nextConfig: NextConfig = {
  // Email open/click/unsubscribe links use www.xingo.ai/e/* and are served by Convex.
  async rewrites() {
    return convexSiteUrl ? [{ source: "/e/:path*", destination: `${convexSiteUrl}/e/:path*` }] : [];
  },
  // "Module" was renamed "course" (D-030); keep old links working.
  async redirects() {
    return [
      { source: "/modules", destination: "/courses", permanent: true },
      { source: "/modules/:id", destination: "/courses/:id", permanent: true },
      // The marketplace is closed for the CCL-first launch (D-043); temporary so it can reopen.
      ...(MARKETPLACE_OPEN ? [] : [{ source: "/sell-practice-courses", destination: "/", permanent: false }]),
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.convex.cloud" },
      { protocol: "https", hostname: "*.convex.site" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
};

export default nextConfig;
