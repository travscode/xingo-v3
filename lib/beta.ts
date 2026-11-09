/**
 * Private beta rules (D-049). Framework-free: imported by Convex and the UI.
 * Beta minutes live in lib/plans.ts with the other limits.
 */

import { CCL_MODULE_ID } from "./scoring";

/** Who this round of invites belongs to. Change it to run another group. */
export const BETA_COHORT = "2m-nov-2026";
/** The course beta testers are sent to and surveyed on. */
export const BETA_COURSE_ID = CCL_MODULE_ID;
/** Most invites that can go out in one send. */
export const BETA_MAX_BATCH = 200;
/** Scored dialogues we ask testers to complete. The real CCL test has two. */
export const BETA_TARGET_DIALOGUES = 2;
export const FEEDBACK_MAX_CHARS = 4000;
export const SURVEY_TEXT_MAX_CHARS = 2000;
export const DICTATION_MAX_SECONDS = 120;
/** Token of the link in "Send me a test": opens the invite page but grants nothing. */
export const BETA_PREVIEW_TOKEN = "preview";

type BetaHolder = { betaCohort?: string; betaEndedAt?: string };

export function isBetaActive(user: BetaHolder | null | undefined) {
  return Boolean(user?.betaCohort && !user.betaEndedAt);
}

const EMAIL_PATTERN = /^[^\s@<>(),;:"]+@[^\s@<>(),;:"]+\.[^\s@<>(),;:".]+$/;

export function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(email);
}

/**
 * Reads a pasted list: one address per line, or separated by commas or semicolons.
 * Understands "Name <person@example.com>", as copied from an email client.
 */
export function parseEmailList(text: string) {
  const pieces = text
    .split(/[\n\r;]+/)
    .flatMap((line) => {
      const bracketed = line.match(/<([^<>]+@[^<>]+)>/);
      return bracketed ? [bracketed[1]] : line.split(/[,\s]+/);
    })
    .map((piece) => piece.trim().replace(/^mailto:/i, "").replace(/^["']|["']$/g, ""))
    .filter(Boolean);

  const emails: string[] = [];
  const invalid: string[] = [];
  let duplicates = 0;

  for (const piece of pieces) {
    const email = piece.toLowerCase();
    if (!isValidEmail(email)) invalid.push(piece);
    else if (emails.includes(email)) duplicates += 1;
    else emails.push(email);
  }

  return { emails, invalid, duplicates };
}

export const SURVEY_QUESTIONS = [
  { key: "overall", label: "How did that go overall?", kind: "stars" },
  { key: "helpful", label: "How helpful was it for preparing for your CCL?", kind: "stars" },
  { key: "worked", label: "Did everything work smoothly (mic, audio, voices)?", kind: "stars" },
  { key: "fair", label: "Did your score and feedback feel fair?", kind: "stars" },
  { key: "difficulty", label: "How difficult was it?", kind: "scale", low: "Very easy", high: "Very hard" },
] as const;

export type SurveyTrigger = "first_dialogue" | "course_finished";
export type SurveyAnswers = Record<(typeof SURVEY_QUESTIONS)[number]["key"], number>;

export function isValidRating(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

type SurveyRow = {
  trigger: SurveyTrigger;
  answeredAt?: string;
  dismissCount: number;
  lastDismissedAttemptId?: string;
};

/** Dismissing brings the survey back once, on a later dialogue, then never again. */
function surveyDue(row: SurveyRow | undefined, attemptId: string) {
  if (!row) return true;
  if (row.answeredAt || row.dismissCount >= 2) return false;
  return row.lastDismissedAttemptId !== attemptId;
}

/**
 * Which survey this results page should offer, if any. Finishing the course replaces
 * the first-dialogue survey, so nobody is asked twice about the same moment.
 */
export function pickSurveyTrigger(rows: SurveyRow[], attemptId: string, finishedCourse: boolean): SurveyTrigger | null {
  const trigger: SurveyTrigger = finishedCourse ? "course_finished" : "first_dialogue";
  return surveyDue(rows.find((row) => row.trigger === trigger), attemptId) ? trigger : null;
}

/** CSV for spreadsheets. Text starting with = + - @ is quoted so it can't run as a formula. */
export function toCsv(rows: Array<Array<string | number | null | undefined>>) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const text = String(cell ?? "");
          const safe = typeof cell === "string" && /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
          return `"${safe.replace(/"/g, '""')}"`;
        })
        .join(","),
    )
    .join("\r\n");
}
