import type { DifficultyLevel } from "@/types/module";

export interface VoiceAgent {
  role: string;
  voice: string;
  goal: string;
}

export interface Scenario {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  aiAgentA: VoiceAgent;
  aiAgentB: VoiceAgent;
  expectedSkills: string[];
  difficultyLevel: DifficultyLevel;
}
