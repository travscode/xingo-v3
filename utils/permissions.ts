import type { PlatformRole } from "@/types/user";

const permissionMap = {
  interpreter: ["view_modules", "practice", "view_progress"],
  student: ["view_modules", "practice", "view_progress"],
  organization_admin: [
    "view_modules",
    "practice",
    "view_progress",
    "manage_students",
    "assign_jobs",
  ],
  platform_admin: [
    "view_modules",
    "practice",
    "view_progress",
    "manage_students",
    "assign_jobs",
    "manage_organizations",
    "manage_modules",
  ],
} as const;

export function hasPermission(role: PlatformRole, permission: string) {
  return permissionMap[role].includes(permission as never);
}
