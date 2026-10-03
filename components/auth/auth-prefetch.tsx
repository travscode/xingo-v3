"use client";

import { useEffect } from "react";

/**
 * Public pages don't load Clerk (D-032). When someone shows intent to sign up or
 * log in (hover, focus or touch on a /sign-up or /sign-in link), start downloading
 * Clerk's scripts in the background so the form appears faster on the next page.
 */
const CLERK_HOST = "https://clerk.xingo.ai";
const CLERK_SCRIPTS = [`${CLERK_HOST}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`, `${CLERK_HOST}/npm/@clerk/ui@1/dist/ui.browser.js`];

let prefetched = false;

function prefetchClerk() {
  if (prefetched) return;
  prefetched = true;
  for (const href of CLERK_SCRIPTS) {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "script";
    link.href = href;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }
}

export function AuthPrefetch() {
  useEffect(() => {
    const onIntent = (event: Event) => {
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      const href = target?.getAttribute("href") ?? "";
      if (href.startsWith("/sign-up") || href.startsWith("/sign-in")) prefetchClerk();
    };
    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("focusin", onIntent);
    document.addEventListener("touchstart", onIntent, { passive: true });
    return () => {
      document.removeEventListener("pointerover", onIntent);
      document.removeEventListener("focusin", onIntent);
      document.removeEventListener("touchstart", onIntent);
    };
  }, []);

  return null;
}
