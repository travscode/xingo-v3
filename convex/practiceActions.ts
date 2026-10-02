import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { action, type ActionCtx } from "./_generated/server";
import { getClerkIdFromIdentity } from "./model/auth";
import { assessmentJsonSchema, buildGradingPrompt } from "./model/grading";
import { MIN_INTERPRETER_TURNS_TO_GRADE } from "../lib/plans";
import { rubricForModule } from "../lib/rubrics";

const OPENAI_API = "https://api.openai.com/v1";

const transcriptEntry = v.object({
  id: v.string(),
  role: v.union(v.literal("assistant"), v.literal("user"), v.literal("system")),
  speaker: v.string(),
  text: v.string(),
  createdAt: v.string(),
});

function openAiKey() {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error("OPENAI_API_KEY is not configured in Convex.");
  }

  return key;
}

async function requireActionClerkId(ctx: ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  return getClerkIdFromIdentity(identity);
}

type ResponsesApiResult = {
  id: string;
  model: string;
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
  usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number };
};

function extractOutputText(result: ResponsesApiResult) {
  return (result.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((part) => part.type === "output_text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("");
}

async function callResponses(body: Record<string, unknown>) {
  const response = await fetch(`${OPENAI_API}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed (${response.status}): ${(await response.text()).slice(0, 300)}`);
  }

  return (await response.json()) as ResponsesApiResult;
}

async function recordUsage(
  ctx: ActionCtx,
  args: {
    result: ResponsesApiResult;
    clerkId: string;
    source: "assessment" | "translation";
    attemptId: string;
    moduleId?: string;
    scenarioId?: string;
  },
) {
  const usage = args.result.usage;

  if (!usage) {
    return;
  }

  const promptTokens = usage.input_tokens ?? 0;
  const completionTokens = usage.output_tokens ?? 0;

  await ctx.runMutation(internal.usage.recordAiUsage, {
    id: args.result.id,
    clerkId: args.clerkId,
    source: args.source,
    model: args.result.model,
    attemptId: args.attemptId,
    moduleId: args.moduleId,
    scenarioId: args.scenarioId,
    promptTokens,
    completionTokens,
    totalTokens: usage.total_tokens ?? promptTokens + completionTokens,
  });
}

/**
 * Mints a short-lived OpenAI Realtime client secret for one participant of a live
 * attempt. Metering and reconnect limits are enforced by `practice.reserveRealtimeKey`.
 */
export const createRealtimeSecret = action({
  args: { attemptId: v.string() },
  handler: async (ctx, args): Promise<{ value: string; model: string }> => {
    const clerkId = await requireActionClerkId(ctx);
    const key = process.env.OPENAI_API_KEY;

    if (!key) {
      console.error("[createRealtimeSecret] OPENAI_API_KEY is not set on this Convex deployment.");
      throw new ConvexError("VOICE_NOT_CONFIGURED");
    }

    await ctx.runMutation(internal.practice.reserveRealtimeKey, {
      attemptId: args.attemptId,
      clerkId,
    });

    const model = process.env.OPENAI_REALTIME_MODEL ?? "gpt-realtime";

    try {
      const response = await fetch(`${OPENAI_API}/realtime/client_secrets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expires_after: { anchor: "created_at", seconds: 600 },
          session: { type: "realtime", model },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI client_secrets ${response.status}: ${(await response.text()).slice(0, 300)}`);
      }

      const data = (await response.json()) as { value?: string };

      if (!data.value) {
        throw new Error("OpenAI client_secrets returned no value");
      }

      return { value: data.value, model };
    } catch (error) {
      // A failed mint must not count towards reconnect limits or billing.
      await ctx.runMutation(internal.practice.releaseRealtimeKey, {
        attemptId: args.attemptId,
        clerkId,
      });
      console.error("[createRealtimeSecret]", error);
      throw new ConvexError("VOICE_UNAVAILABLE");
    }
  },
});

type GradingInput = {
  interpreterTurns: number;
  transcriptEntries: Array<{ role: "assistant" | "user" | "system"; speaker: string; text: string }>;
  scenario: {
    id: string;
    title: string;
    description: string;
    moduleId: string;
    aiAgentA: { name?: string; role: string; goal: string };
    aiAgentB?: { name?: string; role: string; goal: string };
    practiceRuntime?: {
      interpreterRole: string;
      sourceLanguage: string;
      targetLanguage: string;
      briefing: string;
      assessmentFocus: string[];
      practiceType?: "interpreting" | "roleplay";
      learnerRole?: string;
      taskCard?: string;
    };
    expectedSkills: string[];
  } | null;
  sourceLanguage?: string;
  targetLanguage?: string;
  moduleId: string;
  mode: "assessed" | "practice";
};

type GradeOutcome =
  | { status: "graded"; score: number; completionDecision: "completed" | "needs_review" }
  | { status: "practice_mode" }
  | { status: "too_short" }
  | { status: "grading_failed" };

async function grade(
  ctx: ActionCtx,
  clerkId: string,
  attemptId: string,
  input: GradingInput,
): Promise<GradeOutcome> {
  if (input.mode === "practice") {
    await ctx.runMutation(internal.practice.markUngraded, { attemptId, reason: "practice_mode" });
    return { status: "practice_mode" };
  }

  if (!input.scenario || input.interpreterTurns < MIN_INTERPRETER_TURNS_TO_GRADE) {
    await ctx.runMutation(internal.practice.markUngraded, { attemptId, reason: "too_short" });
    return { status: "too_short" };
  }

  const scenario = input.scenario;

  try {
    const result = await callResponses({
      model: process.env.OPENAI_ASSESSMENT_MODEL ?? "gpt-4.1-mini",
      input: buildGradingPrompt(
        scenario,
        {
          sourceLanguage:
            input.sourceLanguage ?? scenario.practiceRuntime?.sourceLanguage ?? "English",
          targetLanguage:
            input.targetLanguage ?? scenario.practiceRuntime?.targetLanguage ?? "the other language",
        },
        input.transcriptEntries,
      ),
      text: { format: { type: "json_schema", ...assessmentJsonSchema } },
    });

    await recordUsage(ctx, {
      result,
      clerkId,
      source: "assessment",
      attemptId,
      moduleId: input.moduleId,
      scenarioId: scenario.id,
    });

    const parsed = JSON.parse(extractOutputText(result));
    const clamp = (value: unknown) =>
      Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
    const overallScore = clamp(parsed.overallScore);
    // The pass decision is derived from the score here, not trusted from the model.
    const completionDecision =
      overallScore >= rubricForModule(input.moduleId).passScore ? "completed" : "needs_review";
    const list = (value: unknown) =>
      Array.isArray(value) ? value.map(String).slice(0, 6) : [];

    await ctx.runMutation(internal.practice.saveAssessment, {
      attemptId,
      assessment: {
        overallScore,
        summary: String(parsed.summary ?? ""),
        strengths: list(parsed.strengths),
        improvementAreas: list(parsed.improvementAreas),
        recommendedNextStep: String(parsed.recommendedNextStep ?? ""),
        completionDecision,
        breakdown: {
          accuracy: clamp(parsed.breakdown?.accuracy),
          terminology: clamp(parsed.breakdown?.terminology),
          fluency: clamp(parsed.breakdown?.fluency),
          turnManagement: clamp(parsed.breakdown?.turnManagement),
          professionalism: clamp(parsed.breakdown?.professionalism),
        },
      },
    });

    return { status: "graded", score: overallScore, completionDecision };
  } catch (error) {
    console.error("[practiceActions.grade]", error);
    await ctx.runMutation(internal.practice.markUngraded, {
      attemptId,
      reason: "grading_failed",
    });
    return { status: "grading_failed" };
  }
}

/** Ends a live attempt, charges its minutes and grades the transcript server-side. */
export const finishAttempt = action({
  args: {
    attemptId: v.string(),
    transcriptEntries: v.array(transcriptEntry),
  },
  handler: async (ctx, args): Promise<GradeOutcome> => {
    const clerkId = await requireActionClerkId(ctx);
    const input = await ctx.runMutation(internal.practice.closeForGrading, {
      attemptId: args.attemptId,
      clerkId,
      transcriptEntries: args.transcriptEntries,
    });

    return grade(ctx, clerkId, args.attemptId, input);
  },
});

/** Retries grading after an OpenAI failure. Does not charge minutes again. */
export const retryGrading = action({
  args: { attemptId: v.string() },
  handler: async (ctx, args): Promise<GradeOutcome> => {
    const clerkId = await requireActionClerkId(ctx);
    const input = await ctx.runMutation(internal.practice.prepareRegrade, {
      attemptId: args.attemptId,
      clerkId,
    });

    return grade(ctx, clerkId, args.attemptId, input);
  },
});

/** Translates one transcript line into English for review. */
export const translateLine = action({
  args: { attemptId: v.string(), text: v.string() },
  handler: async (ctx, args): Promise<{ translation: string }> => {
    const clerkId = await requireActionClerkId(ctx);
    const owner = await ctx.runQuery(internal.practice.getAttemptOwnerInternal, {
      attemptId: args.attemptId,
    });

    if (!owner || owner.clerkId !== clerkId) {
      throw new Error("Practice attempt not found");
    }

    if (owner.mode !== "practice") {
      throw new Error("Translation is only available in practice mode.");
    }

    const text = args.text.trim().slice(0, 1500);

    if (!text) {
      return { translation: "" };
    }

    const result = await callResponses({
      model: process.env.OPENAI_TRANSLATION_MODEL ?? "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Translate the user's text into natural English. Preserve meaning, tone and medical or legal terminology. If it is already English, return it unchanged. Return only the translation.",
        },
        { role: "user", content: text },
      ],
    });

    await recordUsage(ctx, {
      result,
      clerkId,
      source: "translation",
      attemptId: args.attemptId,
      moduleId: owner.moduleId,
      scenarioId: owner.scenarioId,
    });

    return { translation: extractOutputText(result).trim() || text };
  },
});
