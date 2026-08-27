"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Reads the configured GA4 measurement ID from the inline window script.
 */
function getMeasurementId(): string | null {
  const envId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  if (envId) return envId;
  // Fallback literal mirroring the root layout default.
  return "G-J7M1JVS5HM";
}

/**
 * Declares the gtag function on window so TypeScript accepts our calls.
 */
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Client component that emits a GA4 page_view event whenever the current
 * Next.js App Router path (including search params) changes via client-side
 * navigation. The root layout's <Script id="ga4-init"> handles the very first
 * page_view on the initial server-rendered load; this component covers every
 * subsequent client-side transition that Google's auto tracker may miss in the
 * App Router model. Safe to mount in a layout that renders across marketing
 * and dashboard route groups.
 */
export function GA4Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastReportedRef = useRef<string | null>(null);

  useEffect(() => {
    const measurementId = getMeasurementId();
    if (!measurementId) return;

    const query = searchParams?.toString() ?? "";
    const url = query ? `${pathname}?${query}` : pathname;

    // Deduplicate against the previous report so re-renders with the same URL
    // (e.g. unrelated state changes) never emit a duplicate page_view.
    if (lastReportedRef.current === url) return;
    lastReportedRef.current = url;

    // If gtag hasn't loaded yet, the event will be queued on dataLayer and
    // processed once the script initialises. This matches GA4's own pattern.
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }

    gtag("event", "page_view", {
      page_location: window.location.href,
      page_path: url,
      page_title: document.title,
      send_to: measurementId,
    });
  }, [pathname, searchParams]);

  // Render nothing: this component only runs the route-change side effect.
  return null;
}
