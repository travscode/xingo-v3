/**
 * GA4 helpers. The measurement id can be overridden per environment.
 *
 * The full event catalogue, and how to read it in GA, is in docs/analytics.md.
 * Core funnel:
 *   cta_click -> sign_up -> onboarding_complete -> practice_start -> practice_finish -> results_view
 *   paywall_view -> checkout_start -> purchase
 */
export const GA4_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "G-J7M1JVS5HM";

type GtagWindow = Window & { dataLayer?: unknown[] };

export type AnalyticsEvent =
  // Acquisition (marketing pages)
  | "cta_click"
  | "generate_lead"
  // Account
  | "sign_up"
  | "login"
  | "terms_accept"
  | "onboarding_step"
  | "onboarding_complete"
  | "language_pair_change"
  // Learning
  | "course_view"
  | "practice_start"
  | "practice_error"
  | "practice_abandon"
  | "practice_finish"
  | "results_view"
  // Money
  | "paywall_view"
  | "checkout_start"
  | "checkout_cancel"
  | "purchase"
  | "billing_portal_open"
  // Marketplace
  | "search"
  | "marketplace_course_view"
  | "course_add"
  | "course_remove"
  | "course_rate"
  | "course_report"
  // Creators and organisations
  | "course_create"
  | "course_publish"
  | "course_unpublish"
  | "course_delete"
  | "payout_setup_start"
  | "org_create"
  | "org_invite_send"
  | "org_access_request"
  | "collection_save"
  | "invite_accept";

/** One line of a GA4 ecommerce event (`purchase`, `checkout_start`). */
export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_category: string;
  price: number;
  quantity: number;
};

export type AnalyticsParams = Record<string, string | number | boolean | undefined | AnalyticsItem[]>;

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

export function track(event: AnalyticsEvent, params: AnalyticsParams = {}) {
  if (!GA4_MEASUREMENT_ID) {
    return;
  }

  gtag("event", event, { ...params, send_to: GA4_MEASUREMENT_ID });
}

/**
 * Ties later events to a signed-in user so journeys join up across visits and
 * devices. `userId` is the opaque Clerk id (never an email or name); `null`
 * forgets it after sign-out. Admins are marked as internal traffic. User properties must be registered in GA as
 * user-scoped custom dimensions.
 */
export function identify(userId: string | null, properties: Record<string, string> = {}, internal = false) {
  if (!GA4_MEASUREMENT_ID) {
    return;
  }

  // Staff traffic is tagged so GA's "Internal traffic" data filter can exclude it.
  gtag("set", { traffic_type: internal ? "internal" : null });
  gtag("config", GA4_MEASUREMENT_ID, { user_id: userId, send_page_view: false });
  gtag("set", "user_properties", userId ? properties : { plan: null, practice_goal: null });
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

// ---- Checkout hand-off --------------------------------------------------------
// Stripe Checkout is a different site, so what the learner chose is remembered
// in this tab and reported as a `purchase` when Stripe sends them back.

const PENDING_CHECKOUT_KEY = "xingo_pending_checkout";

export function rememberCheckout(item: AnalyticsItem) {
  try {
    sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(item));
  } catch {
    // Storage blocked: the purchase simply isn't reported.
  }
}

export function takePendingCheckout(): AnalyticsItem | null {
  try {
    const raw = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
    return raw ? (JSON.parse(raw) as AnalyticsItem) : null;
  } catch {
    return null;
  }
}

// ---- Automatic link tracking ----------------------------------------------------

/** Where on the page a click happened, for `cta_location`. */
function locationOf(element: Element) {
  const marked = element.closest("[data-analytics-location]");
  if (marked) return marked.getAttribute("data-analytics-location") ?? "unknown";
  if (element.closest("header")) return "header";
  if (element.closest("footer")) return "footer";
  if (element.closest("nav, aside")) return "nav";
  const section = element.closest("section[id]");
  if (section) return section.id;
  return "body";
}

/** Invite links carry a secret token; report only that it was an invite. */
export function safeRedirect(redirect: string | null) {
  if (!redirect) return undefined;
  return redirect.startsWith("/join/") ? "/join" : redirect.split("?")[0].slice(0, 100);
}

/**
 * Reports clicks on sign-up / log-in links anywhere on the site (`cta_click`)
 * and on email links (`generate_lead`), so landing pages need no per-button code.
 * A link can override its name with `data-analytics-cta="..."`.
 */
export function trackLinkClick(event: MouseEvent) {
  const link = (event.target as Element | null)?.closest?.("a[href]");
  if (!link) return;

  const href = link.getAttribute("href") ?? "";
  const text = (link.getAttribute("data-analytics-cta") ?? link.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 100);

  if (href.startsWith("mailto:")) {
    track("generate_lead", { method: "email", cta_location: locationOf(link), page_path: window.location.pathname });
    return;
  }

  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return;
  }
  if (url.origin !== window.location.origin) return;

  const destination = url.pathname.startsWith("/sign-up") ? "sign_up" : url.pathname.startsWith("/sign-in") ? "sign_in" : null;
  if (!destination) return;

  track("cta_click", {
    cta_text: text,
    cta_location: locationOf(link),
    destination,
    // The redirect says what they were trying to reach (e.g. a marketplace course).
    redirect: safeRedirect(url.searchParams.get("redirect")),
    goal: url.searchParams.get("goal") ?? undefined,
    page_path: window.location.pathname,
  });
}
