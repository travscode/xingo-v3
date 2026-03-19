import type { DifficultyLevel } from "@/types/module";

export interface VoiceAgent {
  name: string;
  role: string;
  voice: string;
  goal: string;
  language: string;
  demeanor: string;
  instructions: string;
  openingLine?: string;
}

export interface PracticeRuntime {
  interpreterRole: string;
  sourceLanguage: string;
  targetLanguage: string;
  openingSpeaker: "agent_a" | "agent_b";
  briefing: string;
  assessmentFocus: string[];
}

export interface Scenario {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  aiAgentA: VoiceAgent;
  aiAgentB: VoiceAgent;
  practiceRuntime: PracticeRuntime;
  expectedSkills: string[];
  difficultyLevel: DifficultyLevel;
}
