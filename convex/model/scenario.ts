import type { Id } from "../_generated/dataModel";

const supportedVoices = new Set([
  "alloy",
  "ash",
  "ballad",
  "cedar",
  "coral",
  "echo",
  "marin",
  "sage",
  "shimmer",
  "verse",
]);

function normalizeVoice(role: string, voice: string) {
  const candidate = voice.toLowerCase().trim();

  if (supportedVoices.has(candidate)) {
    return candidate;
  }

  const listenerRole = role.toLowerCase();
  return listenerRole.includes("patient") ||
    listenerRole.includes("parent") ||
    listenerRole.includes("resident") ||
    listenerRole.includes("applicant") ||
    listenerRole.includes("defendant")
    ? "sage"
    : "cedar";
}

export function normalizeAgent(
  agent: {
    name?: string;
    role: string;
    voice: string;
    avatarImageUrl?: string;
    avatarStorageId?: Id<"_storage">;
    goal: string;
    language?: string;
    demeanor?: string;
    instructions?: string;
    openingLine?: string;
  },
  fallbackLanguage: string,
) {
  return {
    ...agent,
    name: agent.name ?? agent.role,
    voice: normalizeVoice(agent.role, agent.voice),
    language: agent.language ?? fallbackLanguage,
    demeanor: agent.demeanor ?? "Focused and natural",
    instructions:
      agent.instructions ??
      `You are the ${agent.role} in an interpreter training scenario. Stay in role, speak in short turns, and never act as the interpreter.`,
  };
}

export function normalizeScenario<
  T extends {
    agentCount?: 1 | 2;
    aiAgentA: {
      name?: string;
      role: string;
      voice: string;
      avatarImageUrl?: string;
      avatarStorageId?: Id<"_storage">;
      goal: string;
      language?: string;
      demeanor?: string;
      instructions?: string;
      openingLine?: string;
    };
    aiAgentB?: {
      name?: string;
      role: string;
      voice: string;
      avatarImageUrl?: string;
      avatarStorageId?: Id<"_storage">;
      goal: string;
      language?: string;
      demeanor?: string;
      instructions?: string;
      openingLine?: string;
    };
    practiceRuntime?: {
      interpreterRole: string;
      sourceLanguage: string;
      targetLanguage: string;
      openingSpeaker: "agent_a" | "agent_b";
      briefing: string;
      assessmentFocus: string[];
    };
    expectedSkills: string[];
  },
>(scenario: T) {
  const normalizedAgentCount =
    scenario.agentCount ?? (scenario.aiAgentB ? 2 : 1);
  const fallbackAgentB =
    normalizedAgentCount === 2
      ? normalizeAgent(
          scenario.aiAgentB ?? {
            role: "Client",
            voice: "sage",
            goal: "Respond naturally to the interpreter.",
            language: scenario.practiceRuntime?.targetLanguage ?? "Spanish",
          },
          scenario.practiceRuntime?.targetLanguage ?? "Spanish",
        )
      : undefined;

  return {
    ...scenario,
    agentCount: normalizedAgentCount,
    aiAgentA: normalizeAgent(scenario.aiAgentA, "English"),
    aiAgentB: fallbackAgentB,
    practiceRuntime: scenario.practiceRuntime ?? {
      interpreterRole: "Consecutive interpreter",
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      openingSpeaker: "agent_a" as const,
      briefing:
        "Interpret between both participants accurately, preserve tone, and keep each turn concise.",
      assessmentFocus: [...scenario.expectedSkills],
    },
  };
}

