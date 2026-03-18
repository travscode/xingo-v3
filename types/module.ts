export type IndustryCategory =
  | "medical"
  | "legal"
  | "immigration"
  | "community"
  | "business";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  industryCategory: IndustryCategory;
  durationMinutes: number;
  difficultyLevel: DifficultyLevel;
  scenarios: string[];
  learningObjectives: string[];
  isFree: boolean;
  isAccredited: boolean;
  accreditationProvider?: string;
  badgeIcon: string;
  createdAt: string;
}
