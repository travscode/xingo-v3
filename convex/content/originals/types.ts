/**
 * XINGO Originals: in-house marketplace studios (D-038). Each has its own brand;
 * their courses are free to practise (normal minutes) and never earn.
 */

export type OriginalScenario = {
  title: string;
  /** Briefing the learner reads first (1–2 sentences). */
  description: string;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  character: {
    name: string;
    role: string;
    /** What they want, what to ask, push back on or reveal when asked. */
    goal: string;
    demeanor: string;
    openingLine?: string;
    /** "It's finished when…" — the AI wraps up when this happens. */
    endCondition: string;
    /** marin | coral | sage | shimmer (female) · cedar | ash | ballad | verse (male) — must match the character. */
    voice: string;
  };
  /** Interpreting courses only: the person who needs an interpreter. */
  client?: { name: string; role: string; goal: string; demeanor: string; voice: string };
  /** Role-play courses: who the learner plays and their task card. */
  learnerRole?: string;
  taskCard?: string;
  learnerOpens?: boolean;
  timeLimitMinutes?: number;
};

export type OriginalCourse = {
  slug: string;
  kind: "roleplay" | "interpreting";
  title: string;
  tagline: string;
  description: string;
  keywords: string[];
  whatYouGet: string[];
  audience: string;
  /** A short visual brief for this course's banner, in the creator's style. */
  bannerBrief: string;
  scenarios: OriginalScenario[];
};

export type OriginalCreator = {
  handle: string;
  displayName: string;
  tagline: string;
  bio: string;
  location?: string;
  accent: string;
  /** Art direction shared by this creator's logo, avatar and every banner. */
  visualStyle: string;
  logoBrief: string;
  avatarBrief: string;
  courses: OriginalCourse[];
};
