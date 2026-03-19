import type { Scenario, VoiceAgent } from "@/types/scenario";
import type { TranscriptEntry } from "@/types/session";

export interface ConversationTurn {
  speaker: string;
  message: string;
}

export function buildScenarioPrompt(scenario: Scenario) {
  return [
    `Scenario: ${scenario.title}`,
    `Description: ${scenario.description}`,
    `Interpreter role: ${scenario.practiceRuntime.interpreterRole}`,
    `Languages: ${scenario.practiceRuntime.sourceLanguage} <-> ${scenario.practiceRuntime.targetLanguage}`,
    `Agent A: ${scenario.aiAgentA.name} (${scenario.aiAgentA.role})`,
    `Agent A goal: ${scenario.aiAgentA.goal}`,
    `Agent B: ${scenario.aiAgentB.name} (${scenario.aiAgentB.role})`,
    `Agent B goal: ${scenario.aiAgentB.goal}`,
    `Briefing: ${scenario.practiceRuntime.briefing}`,
    `Assessment focus: ${scenario.practiceRuntime.assessmentFocus.join(", ")}`,
    `Skills: ${scenario.expectedSkills.join(", ")}`,
  ].join("\n");
}

export function buildRealtimeAgentInstructions(
  scenario: Scenario,
  currentAgent: VoiceAgent,
  counterpartAgent: VoiceAgent,
) {
  return [
    currentAgent.instructions,
    "",
    `Scenario title: ${scenario.title}.`,
    `Scenario context: ${scenario.description}.`,
    `Your role: ${currentAgent.role}.`,
    `Your name: ${currentAgent.name}.`,
    `Your language: ${currentAgent.language}. Speak only in ${currentAgent.language}.`,
    `Your demeanor: ${currentAgent.demeanor}.`,
    `Your goal: ${currentAgent.goal}.`,
    `The other participant is ${counterpartAgent.name}, the ${counterpartAgent.role}.`,
    `A human ${scenario.practiceRuntime.interpreterRole.toLowerCase()} is relaying between both sides.`,
    "Never act as the interpreter.",
    "Never translate or summarise what the other participant said.",
    "Speak in short, natural turns and wait for the interpreter before responding.",
    "If the interpreter pauses, stay silent.",
    currentAgent.openingLine
      ? `When asked to begin, open with this idea: ${currentAgent.openingLine}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildTranscriptForAssessment(transcriptEntries: TranscriptEntry[]) {
  return transcriptEntries
    .map((entry) => `[${entry.createdAt}] ${entry.speaker}: ${entry.text}`)
    .join("\n");
}

export const practiceAssessmentSchema = {
  name: "practice_assessment",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      overallScore: { type: "number" },
      summary: { type: "string" },
      strengths: {
        type: "array",
        items: { type: "string" },
      },
      improvementAreas: {
        type: "array",
        items: { type: "string" },
      },
      recommendedNextStep: { type: "string" },
      completionDecision: {
        type: "string",
        enum: ["completed", "needs_review"],
      },
      breakdown: {
        type: "object",
        additionalProperties: false,
        properties: {
          accuracy: { type: "number" },
          terminology: { type: "number" },
          fluency: { type: "number" },
          turnManagement: { type: "number" },
          professionalism: { type: "number" },
        },
        required: ["accuracy", "terminology", "fluency", "turnManagement", "professionalism"],
      },
    },
    required: [
      "overallScore",
      "summary",
      "strengths",
      "improvementAreas",
      "recommendedNextStep",
      "completionDecision",
      "breakdown",
    ],
  },
} as const;

export function buildAssessmentInstructions(scenario: Scenario, transcriptEntries: TranscriptEntry[]) {
  return [
    "You are assessing an interpreter training role-play.",
    "Score the interpreter on fidelity, terminology, fluency, turn management, and professionalism.",
    "The final overall score must be 0 to 100.",
    "Mark completionDecision as completed only when the overall score is 75 or above; otherwise use needs_review.",
    "Base the assessment on the transcript only and do not invent missing context.",
    "",
    buildScenarioPrompt(scenario),
    "",
    "Transcript:",
    buildTranscriptForAssessment(transcriptEntries),
  ].join("\n");
}
