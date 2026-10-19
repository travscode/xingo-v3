/**
 * Static marketing copy describing what XINGO offers today.
 * Keep this in step with the seeded courses in convex/seedData.ts.
 */

import { CCL_MAX_SCORE } from "@/lib/scoring";

export const practiceModules = [
  {
    moduleId: "medical-er-intake",
    title: "Medical ER intake",
    description: "Triage conversations: urgent symptoms, medication checks and family history.",
    access: "free",
  },
  {
    moduleId: "community-services",
    title: "Community services",
    description: "Housing, benefits and social support appointments.",
    access: "free",
  },
  {
    moduleId: "courtroom-hearings",
    title: "Courtroom hearings",
    description: "Bail hearings, judicial instructions and procedural terms.",
    access: "premium",
  },
  {
    moduleId: "immigration-interviews",
    title: "Immigration interviews",
    description: "Timelines, documents and trauma-aware questioning.",
    access: "premium",
  },
  {
    moduleId: "naati-certification-practice-ccl",
    title: "NAATI CCL practice",
    description: `Short two-way community dialogues, scored out of ${CCL_MAX_SCORE}.`,
    access: "premium",
  },
  {
    moduleId: "naati-certification-practice-cpi",
    title: "NAATI CPI practice",
    description: "Everyday community settings for early-career interpreters.",
    access: "premium",
  },
] as const;

export const howItWorksSteps = [
  {
    title: "Two speakers who can't understand each other",
    description:
      "Pick a scenario. Two AI voices play the parts: an English-speaking professional and a client who speaks your other language.",
  },
  {
    title: "You interpret, out loud",
    description:
      "Hold Space (or the mic button) while you talk. You relay each turn into the other language, as you would in a real session.",
  },
  {
    title: "Score and feedback in minutes",
    description:
      "When you finish, XINGO scores accuracy, terminology, fluency, turn management and professionalism, with notes on what to fix.",
  },
] as const;

export const SALES_EMAIL = "hello@xingo.ai";
export const SUPPORT_EMAIL = "support@xingo.ai";
