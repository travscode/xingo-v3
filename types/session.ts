export type CompletionStatus = "in_progress" | "completed" | "needs_review";

export interface PracticeSession {
  id: string;
  userId: string;
  moduleId: string;
  scenarioId: string;
  durationMinutes: number;
  score: number;
  completionStatus: CompletionStatus;
  transcriptSummary: string;
  timestamp: string;
}
