import type { PlatformRole } from "@/types/user";

export const protectedRoutes = [
  "/dashboard",
  "/admin",
  "/courses",
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
  "/admin(.*)",
  "/courses(.*)",
  "/practice(.*)",
  "/progress(.*)",
  "/credentials(.*)",
  "/jobs(.*)",
  "/billing(.*)",
  "/account(.*)",
  "/help(.*)",
  // The marketplace is public; creating and managing courses needs an account.
  "/marketplace/new(.*)",
  "/marketplace/manage(.*)",
  "/marketplace/earnings(.*)",
] as const;
