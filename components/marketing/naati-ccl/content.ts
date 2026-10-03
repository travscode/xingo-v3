import { CCL_MAX_SCORE, CCL_MODULE_ID, CCL_PASS_SCORE } from "@/lib/scoring";

export const cclModuleId = CCL_MODULE_ID;
/** In-app course page for CCL practice (the library lives under /courses). */
export const cclModuleHref = `/courses/${cclModuleId}`;
export const cclSignUpHref = `/sign-up?redirect=${encodeURIComponent(cclModuleHref)}`;

/** On-page sections, used by the hero's jump links. */
export const pageSections = [
  { id: "format", label: "Test format" },
  { id: "languages", label: "Languages" },
  { id: "practice", label: "What you practise" },
  { id: "prepare", label: "How to prepare" },
  { id: "pricing", label: "Pricing" },
] as const;

export const heroPoints = [
  "Dialogues modelled on the CCL format",
  "Spoken practice with two AI voices",
  `Scored out of ${CCL_MAX_SCORE}, pass mark ${CCL_PASS_SCORE}`,
] as const;

export const formatFacts = [
  {
    title: "Two dialogues",
    description:
      "Each test has two recorded dialogues between an English speaker and a speaker of your other language, in a community setting.",
  },
  {
    title: "Short segments",
    description:
      "Dialogues are split into short segments. After each segment, you interpret it into the other language.",
  },
  {
    title: `Marked out of ${CCL_MAX_SCORE}`,
    description:
      `Each dialogue is marked out of ${CCL_MAX_SCORE / 2}. You need ${CCL_PASS_SCORE} out of ${CCL_MAX_SCORE} overall to pass, with a minimum score on each dialogue.`,
  },
] as const;

export const practiceColumns = [
  {
    heading: "Settings",
    items: ["Health", "Education", "Housing", "Legal and police", "Government services"],
  },
  {
    heading: "Skills",
    items: ["Short-turn recall", "Numbers, names and dates", "Instructions", "Chronology", "Natural delivery"],
  },
] as const;

/** Mirrors the CCL scenarios seeded in convex/seedData.ts. */
export const scenarioCards = [
  {
    title: "Medical scan booking",
    description: "Timing, fasting instructions, referrals and follow-up questions.",
  },
  {
    title: "School absence follow-up",
    description: "Attendance, certificates and how to report future absences.",
  },
  {
    title: "Tenancy maintenance call",
    description: "Repair windows, access arrangements and practical instructions.",
  },
  {
    title: "Centrelink appointment change",
    description: "Deadlines, identity documents and next steps.",
  },
  {
    title: "Police witness statement",
    description: "Chronology, locations and neutral, factual transfer.",
  },
] as const;

export const prepTips = [
  {
    title: "Practise out loud, every day",
    description: "Reading transcripts is not the same as speaking under time pressure. Short daily sessions beat one long weekend cram.",
  },
  {
    title: "Get every number and name",
    description: "Dates, times, amounts and names are where marks go first. Note what you dropped and repeat that scenario.",
  },
  {
    title: "Keep it complete, not perfect",
    description: "Missing information costs more than a slightly awkward phrase. Aim to carry every detail across.",
  },
  {
    title: "Watch your score trend",
    description: `Each attempt is scored out of ${CCL_MAX_SCORE}. Keep practising until you're clearing ${CCL_PASS_SCORE} consistently, not just once.`,
  },
] as const;
