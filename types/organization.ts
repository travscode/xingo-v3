import type { PlatformRole } from "@/types/user";

export interface OrganizationSummary {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: Extract<PlatformRole, "student" | "organization_admin">;
}
