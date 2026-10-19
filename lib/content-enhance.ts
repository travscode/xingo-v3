/**
 * "Enhance with AI" for the admin dialogue editor (D-042). The author writes the
 * bare minimum; the model fills the gaps so the dialogue has enough substance to
 * run well. Imported by Convex (prompt, schema, clean-up) and the editor (types),
 * so keep it framework-free.
 */

export type EnhanceParticipant = {
  name: string;
  role: string;
  demeanor: string;
  goal: string;
  openingLine: string;
  endCondition: string;
  instructions: string;
};

/** The editable text of a dialogue. Voices, photos, languages and access are never touched. */
export type EnhanceDraft = {
  title: string;
  description: string;
  interpreterRole: string;
  learnerRole: string;
  taskCard: string;
  briefing: string;
  assessmentFocus: string[];
  expectedSkills: string[];
  professional: EnhanceParticipant;
  client: EnhanceParticipant;
};

export type EnhanceContext = {
  courseTitle: string;
  courseDescription: string;
  practiceType: "interpreting" | "roleplay";
  hasClient: boolean;
  difficultyLevel: string;
};

export type EnhanceResult = { draft: EnhanceDraft; summary: string };

const LIMITS = { short: 120, medium: 600, long: 3000, listItem: 120, listMax: 8, summary: 400 } as const;

const participantFields: Record<keyof EnhanceParticipant, number> = {
  name: LIMITS.short,
  role: LIMITS.short,
  demeanor: LIMITS.short,
  goal: LIMITS.medium,
  openingLine: LIMITS.medium,
  endCondition: LIMITS.medium,
  instructions: LIMITS.long,
};

const participantSchema = {
  type: "object",
  additionalProperties: false,
  properties: Object.fromEntries(Object.keys(participantFields).map((key) => [key, { type: "string" }])),
  required: Object.keys(participantFields),
};

const stringList = { type: "array", items: { type: "string" } };

export const enhanceJsonSchema = {
  name: "dialogue_enhancement",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      interpreterRole: { type: "string" },
      learnerRole: { type: "string" },
      taskCard: { type: "string" },
      briefing: { type: "string" },
      assessmentFocus: stringList,
      expectedSkills: stringList,
      professional: participantSchema,
      client: participantSchema,
      summary: { type: "string" },
    },
    required: [
      "title",
      "description",
      "interpreterRole",
      "learnerRole",
      "taskCard",
      "briefing",
      "assessmentFocus",
      "expectedSkills",
      "professional",
      "client",
      "summary",
    ],
  },
} as const;

export function buildEnhancePrompt(draft: EnhanceDraft, context: EnhanceContext) {
  const roleplay = context.practiceType === "roleplay";

  const format = roleplay
    ? [
        "FORMAT: English-only role-play. The learner plays themselves as the `learnerRole` (e.g. a salesperson, nurse or test candidate) and talks directly to ONE AI character.",
        "- `professional` is that AI character (despite the field name it may be a customer, patient, relative or examiner). Write their goal, manner, opening line and role card from their point of view.",
        "- `taskCard` is what the learner reads before starting: who they are, the situation and 3–5 numbered things they must do. Second person (\"You are…\").",
        "- `professional.endCondition` describes when the character is satisfied and the conversation can close, e.g. \"the learner has explained trade-in value and offered a next step\".",
        "- `professional.openingLine`: the learner usually speaks first, so this is the character's first reply in meaning.",
        "- `interpreterRole` is not used: return it unchanged. `client` is not used: return it unchanged.",
      ]
    : [
        `FORMAT: Interpreting practice. The learner is the interpreter (\`interpreterRole\`) between an English-speaking professional${context.hasClient ? " and a client who speaks the learner's other language" : " (one-sided: the learner interprets the professional alone)"}.`,
        "- `professional` leads the conversation and decides when it is finished. `professional.endCondition` lists the information they must collect before wrapping up.",
        context.hasClient
          ? "- `client` is the service user. Write all client text in English; it is delivered in the learner's language at runtime."
          : "- `client` is not used: return it unchanged.",
        "- `openingLine` is each participant's first real line after the interpreter introduces themselves — something the learner will interpret.",
        "- `learnerRole` and `taskCard` are not used: return them unchanged.",
      ];

  const system = [
    "You help an author finish a spoken practice dialogue for XINGO, an app where interpreters and professionals practise realistic conversations with AI voice characters.",
    "The author typed the bare minimum. Work out what they meant and fill in the gaps so the dialogue runs well and has real substance: concrete stakes, specific details the learner must handle (names, numbers, dates, product or medical terms where relevant), and characters with clear motivations.",
    "",
    ...format,
    "",
    "RULES:",
    "- Stay true to the author's intent. Never contradict or replace what they wrote; build on it. If a field is already good, return it unchanged or only lightly polished.",
    "- Fill every empty field that applies to this format. Expand thin ones.",
    "- Keep the title unless it is empty or an obvious placeholder; then write a short, specific one (Title Case, under 8 words).",
    "- `description`: one sentence that sets the scene for learners.",
    "- `briefing`: one or two sentences on what the learner should pay attention to.",
    "- `name`: a realistic first and last name (first name only is fine for a client). `role`: specific (\"Apple Store Specialist\", not \"Staff\").",
    "- `demeanor`: a short phrase, e.g. \"Curious but sceptical, speaks quickly\".",
    "- `goal`: one or two concrete sentences.",
    "- `instructions` (character notes / role card): 4–8 short lines of background facts and behaviour — their situation, specifics they can share when asked, what worries them, one or two things they only reveal if asked, and a realistic objection or complication. Do not include language rules or meta-instructions about AI.",
    "- `assessmentFocus`: 3–6 short items the examiner should weigh (specific to this dialogue). `expectedSkills`: 3–5 short skills. Keep the author's items and add to them.",
    "- Pitch complexity at the " + context.difficultyLevel + " level.",
    "- Australian English, plain language. Spoken lines should sound natural when read aloud.",
    "- Fields that do not apply to this format: return them exactly as given.",
    "- `summary`: one or two sentences telling the author what you added, e.g. \"Added a trade-in complication, named the customer and wrote a four-step task card.\"",
  ].join("\n");

  const user = [
    `Course: ${context.courseTitle || "(untitled)"}${context.courseDescription ? ` — ${context.courseDescription}` : ""}`,
    "",
    "Current draft (JSON):",
    JSON.stringify(draft, null, 2),
  ].join("\n");

  return { system, user };
}

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanList(value: unknown) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const items: string[] = [];

  for (const item of value) {
    const text = clip(item, LIMITS.listItem);
    if (!text || seen.has(text.toLowerCase())) continue;
    seen.add(text.toLowerCase());
    items.push(text);
    if (items.length >= LIMITS.listMax) break;
  }

  return items;
}

function cleanParticipant(value: unknown, fallback: EnhanceParticipant): EnhanceParticipant {
  const source = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return Object.fromEntries(
    (Object.keys(participantFields) as Array<keyof EnhanceParticipant>).map((key) => [
      key,
      clip(source[key], participantFields[key]) || fallback[key],
    ]),
  ) as EnhanceParticipant;
}

/**
 * Normalises the model's answer. Empty answers fall back to what the author had,
 * and fields that don't apply to the format are always returned as given.
 */
export function cleanEnhancement(raw: unknown, original: EnhanceDraft, context: EnhanceContext): EnhanceResult {
  const source = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const roleplay = context.practiceType === "roleplay";
  const text = (key: "title" | "description" | "briefing", max: number) => clip(source[key], max) || original[key];
  const list = (key: "assessmentFocus" | "expectedSkills") => {
    const items = cleanList(source[key]);
    return items.length > 0 ? items : original[key];
  };

  return {
    summary: clip(source.summary, LIMITS.summary),
    draft: {
      title: text("title", LIMITS.short),
      description: text("description", LIMITS.medium),
      briefing: text("briefing", LIMITS.medium),
      interpreterRole: roleplay ? original.interpreterRole : clip(source.interpreterRole, LIMITS.short) || original.interpreterRole,
      learnerRole: roleplay ? clip(source.learnerRole, LIMITS.short) || original.learnerRole : original.learnerRole,
      taskCard: roleplay ? clip(source.taskCard, LIMITS.long) || original.taskCard : original.taskCard,
      assessmentFocus: list("assessmentFocus"),
      expectedSkills: list("expectedSkills"),
      professional: cleanParticipant(source.professional, original.professional),
      client: context.hasClient && !roleplay ? cleanParticipant(source.client, original.client) : original.client,
    },
  };
}
