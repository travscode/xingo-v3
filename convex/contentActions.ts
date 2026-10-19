import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { getClerkIdFromIdentity } from "./model/auth";
import { buildEnhancePrompt, cleanEnhancement, enhanceJsonSchema, type EnhanceResult } from "../lib/content-enhance";

const participant = v.object({
  name: v.string(),
  role: v.string(),
  demeanor: v.string(),
  goal: v.string(),
  openingLine: v.string(),
  endCondition: v.string(),
  instructions: v.string(),
});

type ResponsesApiResult = {
  id: string;
  model: string;
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
  usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number };
};

/**
 * Admin content editor: fills in a thin dialogue draft with AI (D-042). Returns a
 * suggestion only; nothing is saved until the admin reviews and saves the form.
 */
export const enhanceDialogueAdmin = action({
  args: {
    moduleId: v.string(),
    scenarioId: v.optional(v.string()),
    context: v.object({
      courseTitle: v.string(),
      courseDescription: v.string(),
      practiceType: v.union(v.literal("interpreting"), v.literal("roleplay")),
      hasClient: v.boolean(),
      difficultyLevel: v.string(),
    }),
    draft: v.object({
      title: v.string(),
      description: v.string(),
      interpreterRole: v.string(),
      learnerRole: v.string(),
      taskCard: v.string(),
      briefing: v.string(),
      assessmentFocus: v.array(v.string()),
      expectedSkills: v.array(v.string()),
      professional: participant,
      client: participant,
    }),
  },
  handler: async (ctx, args): Promise<EnhanceResult> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const clerkId = getClerkIdFromIdentity(identity);
    const isAdmin: boolean = await ctx.runQuery(internal.admin.requireAdminInternal, { clerkId });
    if (!isAdmin) throw new Error("Not authorized");

    if (JSON.stringify(args.draft).length > 20_000) throw new Error("Draft is too long to enhance.");

    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY is not configured in Convex.");

    const { system, user } = buildEnhancePrompt(args.draft, args.context);
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_CONTENT_MODEL ?? "gpt-4.1",
        input: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        text: { format: { type: "json_schema", ...enhanceJsonSchema } },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed (${response.status}): ${(await response.text()).slice(0, 300)}`);
    }

    const result = (await response.json()) as ResponsesApiResult;
    const text = (result.output ?? [])
      .flatMap((item) => item.content ?? [])
      .filter((part) => part.type === "output_text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("");

    if (result.usage) {
      const promptTokens = result.usage.input_tokens ?? 0;
      const completionTokens = result.usage.output_tokens ?? 0;
      await ctx.runMutation(internal.usage.recordAiUsage, {
        id: result.id,
        clerkId,
        source: "other",
        model: result.model,
        moduleId: args.moduleId,
        scenarioId: args.scenarioId,
        promptTokens,
        completionTokens,
        totalTokens: result.usage.total_tokens ?? promptTokens + completionTokens,
      });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("The AI returned an unreadable answer. Try again.");
    }

    return cleanEnhancement(parsed, args.draft, args.context);
  },
});
