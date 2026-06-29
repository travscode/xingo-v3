import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const difficultyLevel = v.union(
  v.literal("beginner"),
  v.literal("intermediate"),
  v.literal("advanced"),
);

const voiceAgent = v.object({
  name: v.optional(v.string()),
  role: v.string(),
  voice: v.string(),
  avatarImageUrl: v.optional(v.string()),
  avatarStorageId: v.optional(v.id("_storage")),
  goal: v.string(),
  language: v.optional(v.string()),
  demeanor: v.optional(v.string()),
  instructions: v.optional(v.string()),
  openingLine: v.optional(v.string()),
});

const practiceRuntime = v.object({
  interpreterRole: v.string(),
  sourceLanguage: v.string(),
  targetLanguage: v.string(),
  openingSpeaker: v.union(v.literal("agent_a"), v.literal("agent_b")),
  briefing: v.string(),
  assessmentFocus: v.array(v.string()),
});

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

const scenarioFields = {
  moduleId: v.string(),
  title: v.string(),
  description: v.string(),
  agentCount: v.union(v.literal(1), v.literal(2)),
  aiAgentA: voiceAgent,
  aiAgentB: v.optional(voiceAgent),
  practiceRuntime,
  expectedSkills: v.array(v.string()),
  difficultyLevel,
} as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

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

function normalizeAgent(
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

function normalizeScenario<
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

/**
 * Ensures the current user has platform admin access.
 */
async function requirePlatformAdmin(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  const clerkId = identity.subject ?? identity.tokenIdentifier;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .unique();

  if (!user || user.role !== "platform_admin") {
    throw new Error("Not authorized");
  }

  return user;
}

/**
 * Resolves the current CDN URL for a stored avatar, falling back to raw URL values.
 */
async function resolveAgentAvatarUrl(
  ctx: MutationCtx | QueryCtx,
  agent: { avatarStorageId?: Id<"_storage">; avatarImageUrl?: string },
) {
  if (!agent.avatarStorageId) {
    return agent.avatarImageUrl;
  }

  const storageUrl = await ctx.storage.getUrl(agent.avatarStorageId);
  return storageUrl ?? agent.avatarImageUrl;
}

/**
 * Enriches a scenario with resolved avatar URLs before returning to clients.
 */
async function enrichScenarioAvatars<
  T extends {
    aiAgentA: { avatarStorageId?: Id<"_storage">; avatarImageUrl?: string };
    aiAgentB?: { avatarStorageId?: Id<"_storage">; avatarImageUrl?: string };
  },
>(ctx: MutationCtx | QueryCtx, scenario: T) {
  const [agentAAvatarImageUrl, agentBAvatarImageUrl] = await Promise.all([
    resolveAgentAvatarUrl(ctx, scenario.aiAgentA),
    scenario.aiAgentB ? resolveAgentAvatarUrl(ctx, scenario.aiAgentB) : undefined,
  ]);

  return {
    ...scenario,
    aiAgentA: {
      ...scenario.aiAgentA,
      avatarImageUrl: agentAAvatarImageUrl,
    },
    aiAgentB: scenario.aiAgentB
      ? {
          ...scenario.aiAgentB,
          avatarImageUrl: agentBAvatarImageUrl,
        }
      : undefined,
  };
}

async function ensureUniqueId(
  ctx: MutationCtx,
  moduleId: string,
  title: string,
  currentId?: string,
) {
  const initial = `${slugify(moduleId)}-${slugify(title) || "scenario"}`;

  for (let index = 0; index < 100; index += 1) {
    const candidate = index === 0 ? initial : `${initial}-${index + 1}`;
    const existing = await ctx.db
      .query("scenarios")
      .withIndex("by_public_id", (q) => q.eq("id", candidate))
      .unique();

    if (!existing || existing.id === currentId) {
      return candidate;
    }
  }

  throw new Error("Could not generate a unique scenario id");
}

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const scenario = await ctx.db
      .query("scenarios")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (!scenario) {
      return null;
    }

    const enriched = await enrichScenarioAvatars(ctx, scenario);
    return normalizeScenario(enriched);
  },
});

export const listByModule = query({
  args: { moduleId: v.string() },
  handler: async (ctx, args) => {
    const scenarios = await ctx.db
      .query("scenarios")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
      .collect();

    const enriched = await Promise.all(
      scenarios.map((scenario) => enrichScenarioAvatars(ctx, scenario)),
    );
    return enriched.map(normalizeScenario);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const scenarios = await ctx.db.query("scenarios").collect();
    const enriched = await Promise.all(
      scenarios.map((scenario) => enrichScenarioAvatars(ctx, scenario)),
    );
    return enriched.map(normalizeScenario);
  },
});

export const generateAvatarUploadUrlAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

export const resolveAvatarStorageUrlAdmin = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const url = await ctx.storage.getUrl(args.storageId);

    if (!url) {
      throw new Error("Could not resolve avatar URL from storage.");
    }

    return url;
  },
});

export const createAdmin = mutation({
  args: scenarioFields,
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);

    const learningModule = await ctx.db
      .query("modules")
      .withIndex("by_public_id", (q) => q.eq("id", args.moduleId))
      .unique();

    if (!learningModule) {
      throw new Error("Module not found");
    }

    const id = await ensureUniqueId(ctx, args.moduleId, args.title);
    const insertedId = await ctx.db.insert("scenarios", {
      id,
      ...args,
      agentCount: args.agentCount,
      aiAgentA: normalizeAgent(
        args.aiAgentA,
        args.practiceRuntime.sourceLanguage,
      ),
      aiAgentB:
        args.agentCount === 2 && args.aiAgentB
          ? normalizeAgent(args.aiAgentB, args.practiceRuntime.targetLanguage)
          : undefined,
      expectedSkills: args.expectedSkills.filter(Boolean),
      practiceRuntime: {
        ...args.practiceRuntime,
        assessmentFocus: args.practiceRuntime.assessmentFocus.filter(Boolean),
      },
    });

    return { _id: insertedId, id };
  },
});

export const updateAdmin = mutation({
  args: {
    id: v.string(),
    ...scenarioFields,
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);

    const existing = await ctx.db
      .query("scenarios")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (!existing) {
      throw new Error("Scenario not found");
    }

    await ctx.db.patch(existing._id, {
      moduleId: args.moduleId,
      title: args.title,
      description: args.description,
      agentCount: args.agentCount,
      aiAgentA: normalizeAgent(
        args.aiAgentA,
        args.practiceRuntime.sourceLanguage,
      ),
      aiAgentB:
        args.agentCount === 2 && args.aiAgentB
          ? normalizeAgent(args.aiAgentB, args.practiceRuntime.targetLanguage)
          : undefined,
      expectedSkills: args.expectedSkills.filter(Boolean),
      practiceRuntime: {
        ...args.practiceRuntime,
        assessmentFocus: args.practiceRuntime.assessmentFocus.filter(Boolean),
      },
      difficultyLevel: args.difficultyLevel,
    });

    return { ok: true };
  },
});
