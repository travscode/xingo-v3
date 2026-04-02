import { v } from "convex/values";
import { query } from "./_generated/server";

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

function normalizeAgent(agent: {
  name?: string;
  role: string;
  voice: string;
  goal: string;
  language?: string;
  demeanor?: string;
  instructions?: string;
  openingLine?: string;
}, fallbackLanguage: string) {
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

function normalizeScenario<T extends {
  aiAgentA: {
    name?: string;
    role: string;
    voice: string;
    goal: string;
    language?: string;
    demeanor?: string;
    instructions?: string;
    openingLine?: string;
  };
  aiAgentB: {
    name?: string;
    role: string;
    voice: string;
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
}>(scenario: T) {
  return {
    ...scenario,
    aiAgentA: normalizeAgent(scenario.aiAgentA, "English"),
    aiAgentB: normalizeAgent(scenario.aiAgentB, "Spanish"),
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

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const scenario = await ctx.db
      .query("scenarios")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    return scenario ? normalizeScenario(scenario) : null;
  },
});

export const listByModule = query({
  args: { moduleId: v.string() },
  handler: async (ctx, args) => {
    const scenarios = await ctx.db
      .query("scenarios")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
      .collect();

    return scenarios.map(normalizeScenario);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const scenarios = await ctx.db.query("scenarios").collect();
    return scenarios.map(normalizeScenario);
  },
});
