import type { PlatformRole } from "@/types/user";

export const protectedRoutes = [
  "/dashboard",
  "/modules",
  "/practice",
  "/progress",
  "/credentials",
  "/jobs",
  "/billing",
  "/account",
  "/help",
] as const;

export function isAdminRole(role: PlatformRole) {
  return role === "organization_admin" || role === "platform_admin";
}

export function canManageOrganizations(role: PlatformRole) {
  return role === "platform_admin";
}

export const protectedRoutePatterns = [
  "/dashboard(.*)",
  "/modules(.*)",
  "/practice(.*)",
  "/progress(.*)",
  "/credentials(.*)",
  "/jobs(.*)",
  "/billing(.*)",
  "/account(.*)",
  "/help(.*)",
] as const;
