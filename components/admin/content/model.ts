import type { Id } from "@/convex/_generated/dataModel";
import type { DifficultyLevel, IndustryCategory } from "@/types/module";
import type { Scenario } from "@/types/scenario";

export const industryOptions: Array<{ value: IndustryCategory; label: string }> = [
  { value: "medical", label: "Medical & health" },
  { value: "legal", label: "Legal & courts" },
  { value: "immigration", label: "Immigration" },
  { value: "community", label: "Community services" },
  { value: "business", label: "Business & finance" },
];

export const difficultyOptions: Array<{ value: DifficultyLevel; label: string }> = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

// ---- Module -------------------------------------------------------------------

export type ModuleForm = {
  title: string;
  description: string;
  industryCategory: IndustryCategory;
  durationMinutes: number;
  difficultyLevel: DifficultyLevel;
  learningObjectives: string[];
  isFree: boolean;
  isAccredited: boolean;
  accreditationProvider: string;
  badgeIcon: string;
};

export const emptyModuleForm: ModuleForm = {
  title: "",
  description: "",
  industryCategory: "community",
  durationMinutes: 25,
  difficultyLevel: "intermediate",
  learningObjectives: [],
  isFree: false,
  isAccredited: false,
  accreditationProvider: "",
  badgeIcon: "",
};

export function moduleFormFromRecord(
  record: Omit<ModuleForm, "accreditationProvider"> & { accreditationProvider?: string },
): ModuleForm {
  return {
    title: record.title,
    description: record.description,
    industryCategory: record.industryCategory,
    durationMinutes: record.durationMinutes,
    difficultyLevel: record.difficultyLevel,
    learningObjectives: [...record.learningObjectives],
    isFree: record.isFree,
    isAccredited: record.isAccredited,
    accreditationProvider: record.accreditationProvider ?? "",
    badgeIcon: record.badgeIcon,
  };
}

export function modulePayload(form: ModuleForm) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    industryCategory: form.industryCategory,
    durationMinutes: Math.max(1, Math.round(form.durationMinutes) || 1),
    difficultyLevel: form.difficultyLevel,
    learningObjectives: form.learningObjectives,
    isFree: form.isFree,
    isAccredited: form.isAccredited,
    accreditationProvider: form.isAccredited ? form.accreditationProvider.trim() || undefined : undefined,
    badgeIcon: form.badgeIcon.trim() || form.title.trim(),
  };
}

// ---- Dialogue (scenario) --------------------------------------------------------

export type ParticipantForm = {
  name: string;
  role: string;
  voice: string;
  demeanor: string;
  goal: string;
  openingLine: string;
  endCondition: string;
  instructions: string;
  avatarImageUrl: string;
  avatarStorageId: string;
  /** Authored language, kept as-is; the runtime language comes from the learner (D-010). */
  language: string;
};

export type DialogueForm = {
  title: string;
  description: string;
  difficultyLevel: DifficultyLevel;
  isFreePreview: boolean;
  hasClient: boolean;
  professional: ParticipantForm;
  client: ParticipantForm;
  interpreterRole: string;
  briefing: string;
  assessmentFocus: string[];
  expectedSkills: string[];
  /** Preserved from the record; not edited (languages are runtime, the interpreter opens). */
  sourceLanguage: string;
  targetLanguage: string;
  openingSpeaker: "agent_a" | "agent_b";
};

const emptyParticipant = (role: string, voice: string, language: string): ParticipantForm => ({
  name: "",
  role,
  voice,
  demeanor: "",
  goal: "",
  openingLine: "",
  endCondition: "",
  instructions: "",
  avatarImageUrl: "",
  avatarStorageId: "",
  language,
});

export const emptyDialogueForm: DialogueForm = {
  title: "",
  description: "",
  difficultyLevel: "intermediate",
  isFreePreview: false,
  hasClient: true,
  professional: emptyParticipant("", "marin", "English"),
  client: emptyParticipant("", "sage", "Spanish"),
  interpreterRole: "Community interpreter",
  briefing: "",
  assessmentFocus: [],
  expectedSkills: [],
  sourceLanguage: "English",
  targetLanguage: "Spanish",
  openingSpeaker: "agent_a",
};

function participantFromRecord(agent: Scenario["aiAgentA"] | undefined, fallbackLanguage: string): ParticipantForm {
  return {
    name: agent?.name ?? "",
    role: agent?.role ?? "",
    voice: agent?.voice ?? "sage",
    demeanor: agent?.demeanor ?? "",
    goal: agent?.goal ?? "",
    openingLine: agent?.openingLine ?? "",
    endCondition: agent?.endCondition ?? "",
    instructions: agent?.instructions ?? "",
    avatarImageUrl: agent?.avatarImageUrl ?? "",
    avatarStorageId: agent?.avatarStorageId ?? "",
    language: agent?.language ?? fallbackLanguage,
  };
}

/** Participant A is the English-speaking professional in all current content. */
export function dialogueFormFromRecord(scenario: Scenario): DialogueForm {
  return {
    title: scenario.title,
    description: scenario.description,
    difficultyLevel: scenario.difficultyLevel,
    isFreePreview: Boolean(scenario.isFreePreview),
    hasClient: (scenario.agentCount ?? (scenario.aiAgentB ? 2 : 1)) === 2,
    professional: participantFromRecord(scenario.aiAgentA, "English"),
    client: participantFromRecord(scenario.aiAgentB, scenario.practiceRuntime.targetLanguage),
    interpreterRole: scenario.practiceRuntime.interpreterRole,
    briefing: scenario.practiceRuntime.briefing,
    assessmentFocus: [...scenario.practiceRuntime.assessmentFocus],
    expectedSkills: [...scenario.expectedSkills],
    sourceLanguage: scenario.practiceRuntime.sourceLanguage,
    targetLanguage: scenario.practiceRuntime.targetLanguage,
    openingSpeaker: scenario.practiceRuntime.openingSpeaker,
  };
}

function participantPayload(participant: ParticipantForm) {
  return {
    name: participant.name.trim() || undefined,
    role: participant.role.trim(),
    voice: participant.voice,
    goal: participant.goal.trim(),
    language: participant.language,
    demeanor: participant.demeanor.trim() || undefined,
    openingLine: participant.openingLine.trim() || undefined,
    endCondition: participant.endCondition.trim() || undefined,
    instructions: participant.instructions.trim() || undefined,
    avatarImageUrl: participant.avatarImageUrl.trim() || undefined,
    avatarStorageId: participant.avatarStorageId ? (participant.avatarStorageId as Id<"_storage">) : undefined,
  };
}

export function dialoguePayload(moduleId: string, form: DialogueForm) {
  return {
    moduleId,
    title: form.title.trim(),
    description: form.description.trim(),
    difficultyLevel: form.difficultyLevel,
    isFreePreview: form.isFreePreview,
    agentCount: (form.hasClient ? 2 : 1) as 1 | 2,
    aiAgentA: participantPayload({ ...form.professional, language: "English" }),
    aiAgentB: form.hasClient ? participantPayload(form.client) : undefined,
    expectedSkills: form.expectedSkills,
    practiceRuntime: {
      interpreterRole: form.interpreterRole.trim() || "Community interpreter",
      sourceLanguage: form.sourceLanguage,
      targetLanguage: form.targetLanguage,
      openingSpeaker: form.openingSpeaker,
      briefing: form.briefing.trim(),
      assessmentFocus: form.assessmentFocus,
    },
  };
}

export type DialogueSectionId = "overview" | "professional" | "client" | "assessment";

/** Missing required fields, grouped by editor section. */
export function dialogueIssues(form: DialogueForm): Record<DialogueSectionId, string[]> {
  const issues: Record<DialogueSectionId, string[]> = { overview: [], professional: [], client: [], assessment: [] };

  if (!form.title.trim()) issues.overview.push("Title");
  if (!form.description.trim()) issues.overview.push("Description");
  if (!form.professional.role.trim()) issues.professional.push("Role or title");
  if (!form.professional.goal.trim()) issues.professional.push("Goal");
  if (form.hasClient) {
    if (!form.client.role.trim()) issues.client.push("Role");
    if (!form.client.goal.trim()) issues.client.push("Goal");
  }
  if (!form.briefing.trim()) issues.assessment.push("Learner briefing");

  return issues;
}

/** Content quality warnings shown in lists (not blocking). */
export function scenarioWarnings(scenario: Scenario) {
  const warnings: string[] = [];
  const participants = [scenario.aiAgentA, scenario.aiAgentB].filter(Boolean);

  if (participants.some((agent) => !agent?.avatarImageUrl)) warnings.push("Missing photo");
  if (!scenario.aiAgentA.endCondition) warnings.push("No end condition");
  if (!scenario.aiAgentA.openingLine) warnings.push("No opening line");

  return warnings;
}
