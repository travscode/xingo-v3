/**
 * GA4 helpers. The measurement id can be overridden per environment.
 *
 * Funnel events (see docs/analytics.md):
 *   sign_up -> onboarding_complete -> practice_start -> practice_finish -> results_view
 *   checkout_start (plan | pack)
 */
export const GA4_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "G-J7M1JVS5HM";

type GtagWindow = Window & { dataLayer?: unknown[] };

export type AnalyticsEvent =
  | "sign_up"
  | "onboarding_complete"
  | "practice_start"
  | "practice_finish"
  | "results_view"
  | "checkout_start"
  | "paywall_view";

/** Pushes one gtag command. gtag reads the `arguments` object, not an array. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function gtag(..._args: unknown[]) {
  if (typeof window === "undefined") {
    return;
  }

  const w = window as GtagWindow;
  w.dataLayer = w.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  w.dataLayer.push(arguments);
}

export function track(event: AnalyticsEvent, params: Record<string, string | number | boolean> = {}) {
  if (!GA4_MEASUREMENT_ID) {
    return;
  }

  gtag("event", event, { ...params, send_to: GA4_MEASUREMENT_ID });
}

/** Keeps campaign parameters, drops everything else (attempt ids, statuses). */
export function analyticsPath(pathname: string, search: URLSearchParams | null) {
  const kept = new URLSearchParams();

  search?.forEach((value, key) => {
    if (key.startsWith("utm_") || key === "gclid" || key === "fbclid") {
      kept.set(key, value);
    }
  });

  const query = kept.toString();
  return query ? `${pathname}?${query}` : pathname;
}
