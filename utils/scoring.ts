export const scoringWeights = {
  accuracy: 0.5,
  latency: 0.2,
  terminology: 0.3,
} as const;

export interface ScoringInput {
  accuracy: number;
  latency: number;
  terminology: number;
}

export function calculateSessionScore(input: ScoringInput) {
  const weightedTotal =
    input.accuracy * scoringWeights.accuracy +
    input.latency * scoringWeights.latency +
    input.terminology * scoringWeights.terminology;

  return Math.round(weightedTotal);
}

export function hasPassedModule(score: number) {
  return score >= 75;
}
