import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";

/**
 * Generates portrait avatars for scenario participants that don't have one,
 * using the OpenAI Images API, and stores them in Convex file storage.
 *
 * Runs one portrait per action and schedules the next, so it never hits the
 * action time limit:
 *   npx convex run avatars:generateMissing '{"dryRun": true}'
 *   npx convex run avatars:generateMissing '{"dryRun": false, "style": "monochrome"}'
 *
 * Costs OpenAI credits (one image per participant). Admin uploads are never replaced.
 */

const style = v.union(v.literal("monochrome"), v.literal("colour"));

export const listMissing = internalQuery({
  args: {},
  handler: async (ctx) => {
    const scenarios = await ctx.db.query("scenarios").collect();
    const missing: Array<{ scenarioId: string; agent: "aiAgentA" | "aiAgentB"; role: string; demeanor: string; setting: string }> = [];

    for (const scenario of scenarios) {
      for (const agent of ["aiAgentA", "aiAgentB"] as const) {
        const participant = scenario[agent];

        if (participant && !participant.avatarStorageId && !participant.avatarImageUrl) {
          missing.push({
            scenarioId: scenario.id,
            agent,
            role: participant.role,
            demeanor: participant.demeanor ?? "",
            setting: scenario.title,
          });
        }
      }
    }

    return missing;
  },
});

export const attachAvatar = internalMutation({
  args: {
    scenarioId: v.string(),
    agent: v.union(v.literal("aiAgentA"), v.literal("aiAgentB")),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const scenario = await ctx.db
      .query("scenarios")
      .withIndex("by_public_id", (q) => q.eq("id", args.scenarioId))
      .unique();
    const participant = scenario?.[args.agent];

    if (!scenario || !participant || participant.avatarStorageId || participant.avatarImageUrl) {
      return { attached: false };
    }

    await ctx.db.patch(scenario._id, { [args.agent]: { ...participant, avatarStorageId: args.storageId } });
    return { attached: true };
  },
});

function portraitPrompt(target: { role: string; demeanor: string; setting: string }, look: "monochrome" | "colour") {
  return [
    `Professional editorial headshot of a person in Australia who is: ${target.role}.`,
    `Context: ${target.setting}. Expression: ${target.demeanor || "neutral and approachable"}.`,
    "Head and shoulders, facing the camera, plain light-grey studio background, soft natural light, realistic photograph, everyday clothing appropriate to the role.",
    look === "monochrome" ? "Black and white photograph, high-key, crisp." : "Natural, muted colours.",
    "No text, no logos, no uniforms with insignia, no hands in frame.",
  ].join(" ");
}

export const generateMissing = internalAction({
  args: { dryRun: v.boolean(), style: v.optional(style), remaining: v.optional(v.number()) },
  handler: async (ctx, args): Promise<{ dryRun: boolean; missing: number; generated?: string }> => {
    const missing = await ctx.runQuery(internal.avatars.listMissing, {});
    const look = args.style ?? "monochrome";

    if (args.dryRun || missing.length === 0) {
      return { dryRun: args.dryRun, missing: missing.length };
    }

    // Safety cap per run so a bug can't loop forever.
    const remaining = args.remaining ?? 120;
    if (remaining <= 0) {
      return { dryRun: false, missing: missing.length };
    }

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("OPENAI_API_KEY is not set on this deployment.");
    }

    const target = missing[0];
    const model = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";
    // gpt-image-1 needs a verified OpenAI organisation; set OPENAI_IMAGE_MODEL=dall-e-3 if it's refused.
    const body = model.startsWith("dall-e")
      ? { model, prompt: portraitPrompt(target, look), size: "1024x1024", quality: "standard", response_format: "b64_json", n: 1 }
      : { model, prompt: portraitPrompt(target, look), size: "1024x1024", quality: "medium", n: 1 };
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Image generation failed (${response.status}): ${(await response.text()).slice(0, 300)}`);
    }

    const data = (await response.json()) as { data?: Array<{ b64_json?: string }> };
    const b64 = data.data?.[0]?.b64_json;

    if (!b64) {
      throw new Error("Image generation returned no image.");
    }

    const bytes = Uint8Array.from(atob(b64), (char) => char.charCodeAt(0));
    const storageId = await ctx.storage.store(new Blob([bytes], { type: "image/png" }));
    await ctx.runMutation(internal.avatars.attachAvatar, {
      scenarioId: target.scenarioId,
      agent: target.agent,
      storageId,
    });

    if (missing.length > 1) {
      await ctx.scheduler.runAfter(0, internal.avatars.generateMissing, {
        dryRun: false,
        style: look,
        remaining: remaining - 1,
      });
    }

    return { dryRun: false, missing: missing.length - 1, generated: `${target.scenarioId}/${target.agent}` };
  },
});
