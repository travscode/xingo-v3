export type CompletionStatus = "in_progress" | "completed" | "needs_review" | "ungraded" | "abandoned";

export interface TranscriptEntry {
  id: string;
  role: "assistant" | "user" | "system";
  speaker: string;
  text: string;
  createdAt: string;
}

export interface SessionAssessmentBreakdown {
  accuracy: number;
  terminology: number;
  fluency: number;
  turnManagement: number;
  professionalism: number;
}

export interface SessionAssessment {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvementAreas: string[];
  recommendedNextStep: string;
  completionDecision: "completed" | "needs_review";
  breakdown: SessionAssessmentBreakdown;
}

export interface PracticeSession {
  id: string;
  userId: string;
  moduleId: string;
  scenarioId: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  durationMinutes: number;
  score: number;
  completionStatus: CompletionStatus;
  transcriptSummary: string;
  transcriptEntries: TranscriptEntry[];
  assessment?: SessionAssessment;
  timestamp: string;
}
