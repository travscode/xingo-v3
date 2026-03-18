import type { IndustryCategory } from "@/types/module";

export type JobStatus = "open" | "assigned" | "completed" | "cancelled";

export interface JobAssignment {
  id: string;
  title: string;
  description: string;
  industry: IndustryCategory;
  date: string;
  location: string;
  payRate: string;
  organizationId: string;
  assignedInterpreterId?: string;
  status: JobStatus;
}
