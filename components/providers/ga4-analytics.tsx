"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analyticsPath, GA4_MEASUREMENT_ID, gtag } from "@/lib/analytics";

/**
 * Sends one GA4 page_view per App Router navigation (including the first load;
 * the gtag config in app/layout.tsx disables GA's own automatic page_view).
 * Only campaign query parameters are sent.
 */
export function GA4Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastReportedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!GA4_MEASUREMENT_ID) return;

    const path = analyticsPath(pathname, searchParams);
    if (lastReportedRef.current === path) return;
    lastReportedRef.current = path;

    gtag("event", "page_view", {
      page_location: `${window.location.origin}${path}`,
      page_path: path,
      page_title: document.title,
      send_to: GA4_MEASUREMENT_ID,
    });
  }, [pathname, searchParams]);

  return null;
}
