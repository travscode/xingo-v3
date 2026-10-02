/**
 * Approximate OpenAI list prices in USD per 1M tokens, used only for the admin
 * cost estimate. VERIFY against https://openai.com/api/pricing before relying on them.
 *
 * Realtime events don't separate audio from text tokens, so a blended rate is used.
 */
export const tokenRatesUsdPerMillion: Record<string, { input: number; output: number }> = {
  realtime: { input: 20, output: 50 },
  assessment: { input: 0.4, output: 1.6 },
  translation: { input: 0.4, output: 1.6 },
  other: { input: 1, output: 4 },
};

export function estimateCostUsd(source: string, inputTokens: number, outputTokens: number) {
  const rate = tokenRatesUsdPerMillion[source] ?? tokenRatesUsdPerMillion.other;
  return (inputTokens * rate.input + outputTokens * rate.output) / 1_000_000;
}
