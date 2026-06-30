export type OpenAiUsageCounts = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

/**
 * Extracts prompt, completion, and total token counts from OpenAI usage payloads.
 */
export function normalizeOpenAiUsage(value: unknown): OpenAiUsageCounts | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const usage = value as Record<string, unknown>;
  const promptTokens =
    typeof usage.input_tokens === "number"
      ? usage.input_tokens
      : typeof usage.prompt_tokens === "number"
        ? usage.prompt_tokens
        : 0;
  const completionTokens =
    typeof usage.output_tokens === "number"
      ? usage.output_tokens
      : typeof usage.completion_tokens === "number"
        ? usage.completion_tokens
        : 0;
  const totalTokens =
    typeof usage.total_tokens === "number"
      ? usage.total_tokens
      : promptTokens + completionTokens;

  if (promptTokens <= 0 && completionTokens <= 0 && totalTokens <= 0) {
    return null;
  }

  return {
    promptTokens,
    completionTokens,
    totalTokens,
  };
}
