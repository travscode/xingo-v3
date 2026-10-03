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
  // Exact paths plus sub-paths, so course slugs like /marketplace/new-starter-training stay public.
  "/marketplace/new",
  "/marketplace/new/(.*)",
  "/marketplace/manage",
  "/marketplace/manage/(.*)",
  "/marketplace/earnings",
  "/marketplace/earnings/(.*)",
  // Organisation dashboards (D-039). /join/<token> stays public so invitees can read it first.
  // Trailing slash so course slugs like /marketplace/organising-events stay public.
  "/marketplace/org/(.*)",
] as const;
