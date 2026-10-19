/**
 * What public pages can promote today (D-043). Public pages don't load Convex
 * (D-032), so this reads the launch line-up in lib/course-status.ts via
 * isGoalComingSoonOnSite. Framework-free.
 */

import { examPages } from "./exam-pages";
import { getGoal, isGoalComingSoonOnSite } from "./goals";
import { topicPages } from "./seo-pages";

export const OPEN_COURSE_HREF = "/naati/ccl";
export const MEDICAL_PRACTICE_HREF = "/interpreting/medical-interpreting-practice";

/** The goal a public practice page signs people up for, if it has one. */
function goalForPath(path: string): string | null {
  const clean = path.split(/[?#]/)[0];
  if (clean === "/naati/cpi") return "naati_cpi";
  const exam = clean.match(/^\/exams\/([^/]+)$/);
  if (exam) return examPages.find((page) => page.slug === exam[1])?.goal ?? null;
  const topic = clean.match(/^\/interpreting\/([^/]+)$/);
  if (topic) return topicPages.find((page) => page.slug === topic[1])?.goal ?? null;
  return null;
}

/** True when a link points at a practice page whose course is coming soon. */
export function isPathComingSoonOnSite(path: string) {
  const goal = goalForPath(path);
  return goal !== null && isGoalComingSoonOnSite(goal);
}

/**
 * Where to send someone whose goal is coming soon: the open course that fits best.
 * US medical interpreters get the free medical course; everyone else gets NAATI CCL.
 */
export function openAlternativeFor(goal: string | undefined): { href: string; label: string; goal: string; name: string } {
  if (goal === "us_medical_oral") {
    return { href: MEDICAL_PRACTICE_HREF, label: "Practise medical interpreting free", goal: "medical", name: "Medical interpreting" };
  }
  return { href: OPEN_COURSE_HREF, label: "Practise NAATI CCL", goal: "naati_ccl", name: "NAATI CCL" };
}

/** Short name for a goal in "… practice is coming soon" copy. */
export function goalDisplayName(goal: string) {
  return getGoal(goal)?.label.replace(/\s*\(.*\)$/, "") ?? "This";
}
