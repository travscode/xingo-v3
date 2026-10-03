import { rubricForModule } from "./rubrics";

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
    : score >= rubricForModule(moduleId).passScore;
}

export function displayPassMark(moduleId: string) {
  return isCclModule(moduleId) ? CCL_PASS_SCORE : PASS_SCORE;
}

/** Why a live session ended. Recorded on the attempt (see D-028). */
export const endReasons = ["objective_met", "learner_finished", "time_up", "stalled", "out_of_minutes"] as const;
export type EndReason = (typeof endReasons)[number];

export const endReasonLabels: Record<EndReason, string> = {
  objective_met: "Conversation completed",
  learner_finished: "You ended the session",
  time_up: "Time ran out",
  stalled: "Session stalled",
  out_of_minutes: "Out of minutes",
};

/**
 * Scores reflect whether the learner got through the task, like a real exam where
 * unrendered segments earn nothing. A finished session keeps its score; an
 * unfinished one is scaled by how much of the task was covered and can't pass.
 */
export function applyCompletion(rawScore: number, completion: { reachedEnd: boolean; coveragePercent: number }) {
  const raw = Math.max(0, Math.min(100, Math.round(rawScore)));

  if (completion.reachedEnd) {
    return raw;
  }

  const coverage = Math.max(0, Math.min(100, completion.coveragePercent)) / 100;
  return Math.round(raw * coverage);
}

/**
 * The client says why it ended; the server only accepts claims it can check.
 * "time_up" and "out_of_minutes" must match the clock, otherwise the learner
 * ended it. Objective/stall claims are context for the grader, which judges
 * completion from the transcript itself.
 */
export function resolveEndReason(
  claimed: EndReason | undefined,
  clock: { elapsedMs: number; timeLimitMs: number; allowedMs: number },
): EndReason {
  const slackMs = 5_000;

  if (clock.elapsedMs >= clock.allowedMs - slackMs && clock.allowedMs < clock.timeLimitMs) {
    return "out_of_minutes";
  }

  if (clock.elapsedMs >= clock.timeLimitMs - slackMs) {
    return claimed === "objective_met" ? "objective_met" : "time_up";
  }

  if (claimed === "objective_met" || claimed === "stalled") {
    return claimed;
  }

  return "learner_finished";
}
