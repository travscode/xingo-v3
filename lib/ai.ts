import type { Scenario } from "@/types/scenario";

export interface ConversationTurn {
  speaker: string;
  message: string;
}

export function buildScenarioPrompt(scenario: Scenario) {
  return [
    `Scenario: ${scenario.title}`,
    `Agent A: ${scenario.aiAgentA.role} - ${scenario.aiAgentA.goal}`,
    `Agent B: ${scenario.aiAgentB.role} - ${scenario.aiAgentB.goal}`,
    `Skills: ${scenario.expectedSkills.join(", ")}`,
  ].join("\n");
}
