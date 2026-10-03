import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { getClerkIdFromIdentity } from "./model/auth";

/**
 * Admin-only experiments (Admin → Lab). Nothing here is used by the learner-facing
 * practice room. See docs/decisions.md D-033.
 */

const MAX_AUDIO_BYTES = 4 * 1024 * 1024;

/**
 * Detects the language of one short utterance with Whisper (verbose_json returns
 * the detected language). Returns the language name in lower case, e.g. "spanish".
 */
export const detectLanguage = action({
  args: { audio: v.bytes(), mimeType: v.string() },
  handler: async (ctx, args): Promise<{ language: string | null; text: string; ms: number }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user: Doc<"users"> | null = await ctx.runQuery(internal.users.getByClerkIdInternal, {
      clerkId: getClerkIdFromIdentity(identity),
    });
    if (user?.role !== "platform_admin") throw new Error("Not authorized");

    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY is not configured in Convex.");
    if (args.audio.byteLength === 0 || args.audio.byteLength > MAX_AUDIO_BYTES) {
      return { language: null, text: "", ms: 0 };
    }

    const started = Date.now();
    const extension = args.mimeType.includes("mp4") ? "mp4" : args.mimeType.includes("ogg") ? "ogg" : "webm";
    const form = new FormData();
    form.append("file", new Blob([args.audio], { type: args.mimeType }), `utterance.${extension}`);
    form.append("model", "whisper-1");
    form.append("response_format", "verbose_json");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });

    if (!response.ok) {
      console.error("[labActions.detectLanguage]", response.status, await response.text());
      return { language: null, text: "", ms: Date.now() - started };
    }

    const result = (await response.json()) as { language?: string; text?: string };
    return {
      language: result.language ? result.language.toLowerCase() : null,
      text: (result.text ?? "").trim(),
      ms: Date.now() - started,
    };
  },
});
