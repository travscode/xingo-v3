/**
 * Scoring constants shared by Convex grading and the UI.
 */

/** Generic modules: an attempt "passes" at this overall score (0-100). */
export const PASS_SCORE = 75;

/** NAATI CCL modules display scores out of 90 with a pass mark of 63. */
export const CCL_MODULE_ID = "naati-certification-practice-ccl";
export const CCL_MAX_SCORE = 90;
export const CCL_PASS_SCORE = 63;

export const assessmentDimensions = [
  { key: "accuracy", label: "Accuracy" },
  { key: "terminology", label: "Terminology" },
  { key: "fluency", label: "Fluency" },
  { key: "turnManagement", label: "Turn management" },
  { key: "professionalism", label: "Professionalism" },
] as const;

export type AssessmentDimension = (typeof assessmentDimensions)[number]["key"];

export function isCclModule(moduleId: string) {
  return moduleId === CCL_MODULE_ID;
}

/** Converts a 0-100 score into the scale a module displays. */
export function toDisplayScore(moduleId: string, score: number) {
  return isCclModule(moduleId) ? Math.round((score / 100) * CCL_MAX_SCORE) : Math.round(score);
}

export function displayMaxScore(moduleId: string) {
  return isCclModule(moduleId) ? CCL_MAX_SCORE : 100;
}

export function isPassingScore(moduleId: string, score: number) {
  return isCclModule(moduleId)
    ? toDisplayScore(moduleId, score) >= CCL_PASS_SCORE
    : score >= PASS_SCORE;
}

export function displayPassMark(moduleId: string) {
  return isCclModule(moduleId) ? CCL_PASS_SCORE : PASS_SCORE;
}
