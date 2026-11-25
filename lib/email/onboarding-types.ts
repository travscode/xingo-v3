/**
 * Types for the 14-day onboarding email series (D-037). Content lives in
 * lib/email/onboarding-content.ts; sending in convex/onboarding.ts.
 */
import type { BuiltEmail } from "./transactional";
import { isGoalComingSoonOnSite } from "../goals";

/** Every other day for the first two weeks (day 0 is the transactional welcome). */
export const ONBOARDING_DAYS = [1, 3, 5, 7, 9, 11, 13] as const;
export type OnboardingDay = (typeof ONBOARDING_DAYS)[number];

/** Content pathway, chosen from what the learner said they're preparing for. */
export type OnboardingTrack = "ielts" | "oet" | "clinical" | "ccl" | "interpreter" | "us_interpreter" | "general";

export function trackForGoal(goal: string | undefined | null): OnboardingTrack {
  // Goals whose course is coming soon (D-043) get the general series, so nobody is
  // emailed about practice they can't open yet.
  if (goal && isGoalComingSoonOnSite(goal)) return "general";

  switch (goal) {
    case "ielts":
      return "ielts";
    case "oet":
      return "oet";
    case "amc":
    case "nmba_osce":
      return "clinical";
    case "naati_ccl":
      return "ccl";
    case "naati_cpi":
    case "medical":
    case "ndis":
    case "legal":
      return "interpreter";
    case "us_medical_oral":
      return "us_interpreter";
    default:
      return "general";
  }
}

/** What we know about the learner when the email is sent (computed server-side). */
export type OnboardingContext = {
  siteUrl: string;
  /** e.g. "IELTS Speaking", "NAATI CCL"; null when no goal chosen. */
  goalLabel: string | null;
  /** Raw goal id from lib/goals.ts (e.g. "amc" vs "nmba_osce" within the clinical track). */
  goalId: string | null;
  /** Their other language, e.g. "Spanish"; null for English only / not set. */
  language: string | null;
  /** Graded sessions completed so far. */
  sessions: number;
  /** Best score shown on the course's own scale, e.g. "68/90", "Band 6.5", "74/100"; null if none yet. */
  bestScore: string | null;
  /** Practice minutes left right now. */
  minutesLeft: number;
  /** Free-plan monthly minutes (for copy). */
  freeMonthlyMinutes: number;
  isPro: boolean;
};

export type OnboardingEmailBuilder = (ctx: OnboardingContext) => BuiltEmail;

/** Pathways in the order the admin screen lists them. */
export const ONBOARDING_TRACKS: Array<{ id: OnboardingTrack; label: string }> = [
  { id: "ccl", label: "NAATI CCL" },
  { id: "interpreter", label: "Interpreting (NAATI CPI, medical, NDIS, legal)" },
  { id: "ielts", label: "IELTS Speaking" },
  { id: "oet", label: "OET Speaking" },
  { id: "clinical", label: "Clinical exams (AMC, NMBA OSCE)" },
  { id: "us_interpreter", label: "US medical interpreting" },
  { id: "general", label: "General (no goal, or a course that's coming soon)" },
];

export function isOnboardingTrack(value: string): value is OnboardingTrack {
  return ONBOARDING_TRACKS.some((track) => track.id === value);
}

export function isOnboardingDay(value: number): value is OnboardingDay {
  return (ONBOARDING_DAYS as readonly number[]).includes(value);
}

/** An admin's replacement for one email. Links may be site paths ("/courses") or https URLs. */
export type OnboardingOverride = {
  subject: string;
  preheader: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
};

/** Returns an error code, or null when the edit can be saved. */
export function onboardingOverrideProblem(edit: OnboardingOverride): "EMAIL_SUBJECT_REQUIRED" | "EMAIL_BODY_REQUIRED" | "EMAIL_LINK_INVALID" | "EMAIL_TOO_LONG" | null {
  if (!edit.subject.trim()) return "EMAIL_SUBJECT_REQUIRED";
  if (!edit.body.trim()) return "EMAIL_BODY_REQUIRED";
  if (edit.subject.length > 200 || edit.preheader.length > 300 || edit.body.length > 20_000 || edit.ctaLabel.length > 80) return "EMAIL_TOO_LONG";
  const url = edit.ctaUrl.trim();
  if (edit.ctaLabel.trim() && !url) return "EMAIL_LINK_INVALID";
  if (url && !/^(\/(?!\/)|https:\/\/)/.test(url)) return "EMAIL_LINK_INVALID";
  return null;
}
