import type { NextConfig } from "next";

/** Convex HTTP actions domain, e.g. https://<deployment>.convex.site */
const convexSiteUrl =
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
  (process.env.NEXT_PUBLIC_CONVEX_URL ?? "").replace(".convex.cloud", ".convex.site");

const nextConfig: NextConfig = {
  // Email open/click/unsubscribe links use www.xingo.ai/e/* and are served by Convex.
  async rewrites() {
    return convexSiteUrl ? [{ source: "/e/:path*", destination: `${convexSiteUrl}/e/:path*` }] : [];
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
