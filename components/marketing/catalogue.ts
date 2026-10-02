/**
 * Static marketing copy describing what XINGO offers today.
 * Keep this in step with the seeded modules in convex/seedData.ts.
 */

export const practiceModules = [
  {
    title: "Medical ER intake",
    description: "Triage conversations: urgent symptoms, medication checks and family history.",
    access: "free",
  },
  {
    title: "Community services",
    description: "Housing, benefits and social support appointments.",
    access: "free",
  },
  {
    title: "Courtroom hearings",
    description: "Bail hearings, judicial instructions and procedural terms.",
    access: "premium",
  },
  {
    title: "Immigration interviews",
    description: "Timelines, documents and trauma-aware questioning.",
    access: "premium",
  },
  {
    title: "NAATI CCL practice",
    description: "Short two-way community dialogues, scored out of 90.",
    access: "premium",
  },
  {
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
