/**
 * Marketplace rules shared by Convex and the UI (keep framework-free).
 * See docs/marketplace.md and D-031.
 *
 * Words: a *course* is a set of practice *scenarios*. Never say "module" to users (D-030).
 */

import { packs, plans, type PlanId } from "./plans";

// ---- Creator earnings ----------------------------------------------------------

/** Share of XINGO's net revenue from minutes practised in a creator's course. */
export const CREATOR_REVENUE_SHARE = 0.25;

/** Net of GST (1/11 of the price) and card fees (~3%). */
export const NET_REVENUE_FACTOR = (10 / 11) * 0.97;

/** Creators are paid monthly once their available balance reaches this (AUD cents). */
export const PAYOUT_THRESHOLD_CENTS = 5_000;

/** Earnings wait this long before payout, to cover refunds and chargebacks. */
export const EARNINGS_HOLD_DAYS = 30;

/**
 * What one practice minute is worth to XINGO, net, in AUD cents.
 * - Pro allowance minutes: the subscription price spread over its minutes.
 * - Pack minutes: the cheapest per-minute pack, so creators are never paid more than a minute earned.
 * - Free-plan minutes earn nothing (nobody paid for them).
 */
export function netMinuteValueCents(source: "allowance" | "pack", plan: PlanId) {
  if (source === "allowance") {
    const config = plans[plan];
    return config.priceCents > 0 && config.monthlyMinutes > 0
      ? (config.priceCents / config.monthlyMinutes) * NET_REVENUE_FACTOR
      : 0;
  }

  const cheapest = Math.min(...Object.values(packs).map((pack) => pack.priceCents / pack.minutes));
  return cheapest * NET_REVENUE_FACTOR;
}

/** A creator's earnings for one charged attempt, in AUD cents (two decimals). */
export function creatorEarningCents(charge: { fromAllowance: number; fromPacks: number; plan: PlanId }) {
  const gross =
    charge.fromAllowance * netMinuteValueCents("allowance", charge.plan) +
    charge.fromPacks * netMinuteValueCents("pack", charge.plan);
  return Math.round(gross * CREATOR_REVENUE_SHARE * 100) / 100;
}

export function formatAud(cents: number) {
  return (cents / 100).toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

// ---- Courses -------------------------------------------------------------------

export type CourseKind = "roleplay" | "interpreting";

export const courseKinds: Array<{ id: CourseKind; label: string; description: string; example: string }> = [
  {
    id: "roleplay",
    label: "One-on-one",
    description: "The learner talks directly with one AI person, as themselves, in English.",
    example: "Job interviews, sales calls, patient consultations, customer complaints",
  },
  {
    id: "interpreting",
    label: "Interpreter in the middle",
    description: "The learner interprets between two AI people: one speaks English, the other speaks the learner's other language.",
    example: "Medical appointments, legal advice, community services",
  },
];

/** Community course ids carry their kind, so scoring can pick the right rubric from the id alone. */
export function communityCourseIdPrefix(kind: CourseKind) {
  return kind === "roleplay" ? "rp-" : "int-";
}

export function isCommunityRoleplayId(moduleId: string) {
  return moduleId.startsWith("rp-");
}

export function slugify(value: string, max = 48) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max);
}

export const LISTING_LIMITS = {
  title: 80,
  tagline: 140,
  description: 2_000,
  keywords: 10,
  keyword: 30,
  whatYouGet: 8,
  whatYouGetItem: 140,
  certifications: 4,
  scenarios: 30,
} as const;

/** Lowercase, trimmed, de-duplicated keywords within the limits. */
export function normalizeKeywords(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const value of values) {
    const keyword = value.trim().toLowerCase().slice(0, LISTING_LIMITS.keyword);
    if (keyword && !seen.has(keyword)) {
      seen.add(keyword);
      out.push(keyword);
    }
  }

  return out.slice(0, LISTING_LIMITS.keywords);
}

/** Search text for a listing (title, tagline, keywords, creator, certifications). */
export function listingMatches(
  listing: { title: string; tagline: string; keywords: string[]; creatorName: string; certifications: Array<{ name: string; issuer?: string }> },
  query: string,
) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = [
    listing.title,
    listing.tagline,
    listing.creatorName,
    ...listing.keywords,
    ...listing.certifications.flatMap((cert) => [cert.name, cert.issuer ?? ""]),
  ]
    .join(" ")
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

// ---- Reports -------------------------------------------------------------------

export const reportReasons = [
  { id: "inappropriate", label: "Offensive or inappropriate" },
  { id: "misleading", label: "Misleading, e.g. a fake certification" },
  { id: "copyright", label: "Uses someone else's content" },
  { id: "unsafe", label: "Unsafe or harmful advice" },
  { id: "spam", label: "Spam or advertising" },
  { id: "other", label: "Something else" },
] as const;

export type ReportReason = (typeof reportReasons)[number]["id"];

export const CREATOR_GUIDELINES = [
  "You own or have permission to use everything you upload, including logos and certification names.",
  "Only name a certification if your course genuinely relates to it. Don't claim endorsement you don't have.",
  "No offensive, discriminatory, sexual or violent content, and nothing that targets real people.",
  "Practice is for learning: don't give medical, legal or financial advice as fact.",
  "XINGO may remove a course that breaks these rules, and withhold earnings from it.",
] as const;

// ---- Voices ----------------------------------------------------------------------

export const creatorVoices = [
  { value: "marin", label: "Marin", gender: "female" },
  { value: "coral", label: "Coral", gender: "female" },
  { value: "sage", label: "Sage", gender: "female" },
  { value: "shimmer", label: "Shimmer", gender: "female" },
  { value: "cedar", label: "Cedar", gender: "male" },
  { value: "ash", label: "Ash", gender: "male" },
  { value: "ballad", label: "Ballad", gender: "male" },
  { value: "verse", label: "Verse", gender: "male" },
  { value: "alloy", label: "Alloy", gender: "neutral" },
] as const;

export function isCreatorVoice(value: string) {
  return creatorVoices.some((voice) => voice.value === value);
}

// ---- Ratings, popularity and badges (D-038) -------------------------------------
// All computed from real activity: nothing here is seeded or invented.

export type CourseActivity = {
  publishedAt?: string | null;
  addCount: number;
  practiceCount?: number;
  passCount?: number;
  ratingSum?: number;
  ratingCount?: number;
};

export const NEW_COURSE_DAYS = 21;
export const TOP_RATED_MIN_RATINGS = 5;
export const TOP_RATED_MIN_AVERAGE = 4.5;
export const POPULAR_MIN_SCORE = 10;

export function averageRating(course: CourseActivity) {
  return course.ratingCount ? Math.round(((course.ratingSum ?? 0) / course.ratingCount) * 10) / 10 : null;
}

/** Adds weigh more than sessions: adding is a deliberate choice. */
export function popularityScore(course: CourseActivity) {
  return course.addCount * 2 + (course.practiceCount ?? 0);
}

export type CourseBadge = "new" | "popular" | "top_rated";

export function courseBadges(course: CourseActivity, now = Date.now()): CourseBadge[] {
  const badges: CourseBadge[] = [];
  const average = averageRating(course);
  if ((course.ratingCount ?? 0) >= TOP_RATED_MIN_RATINGS && average !== null && average >= TOP_RATED_MIN_AVERAGE) badges.push("top_rated");
  if (popularityScore(course) >= POPULAR_MIN_SCORE) badges.push("popular");
  if (course.publishedAt && now - Date.parse(course.publishedAt) < NEW_COURSE_DAYS * 86_400_000) badges.push("new");
  return badges;
}

export type MarketplaceSort = "popular" | "top" | "new";

export function compareCourses(sort: MarketplaceSort) {
  return (a: CourseActivity, b: CourseActivity) => {
    const newer = (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
    if (sort === "new") return newer;
    if (sort === "top") {
      const rated = (c: CourseActivity) => ((c.ratingCount ?? 0) >= 3 ? averageRating(c) ?? 0 : 0);
      return rated(b) - rated(a) || (b.ratingCount ?? 0) - (a.ratingCount ?? 0) || popularityScore(b) - popularityScore(a) || newer;
    }
    return popularityScore(b) - popularityScore(a) || newer;
  };
}
