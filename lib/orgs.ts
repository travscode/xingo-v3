/**
 * Organisations on the marketplace (D-039). Framework-free: used by Convex and the UI.
 */

export type OrgRole = "owner" | "admin" | "creator";
export type CollectionVisibility = "public" | "invite";

export const ORG_ROLE_LABELS: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  creator: "Creator",
};

/** Owners and admins manage the team, profile and settings; creators make courses and invite learners. */
export function canManageOrg(role: OrgRole | null | undefined) {
  return role === "owner" || role === "admin";
}

export const HANDLE_PATTERN = /^[a-z0-9][a-z0-9._-]{2,29}$/;

/**
 * Handles become xingo.ai/<handle>, so they can't take a path the site uses.
 * `lib/orgs.test.ts` checks every top-level app route is listed here.
 */
export const RESERVED_HANDLES = new Set([
  // Site pages
  "about", "account", "admin", "api", "billing", "blog", "contact", "courses", "creator-terms", "credentials",
  "dashboard", "exams", "for-interpreters", "for-organizations", "help", "how-it-works", "interpreting", "invite",
  "jobs", "join", "login", "logout", "marketplace", "migrate-to-australia", "naati", "org", "orgs", "organisation",
  "organisations", "organization", "organizations", "practice", "pricing", "privacy", "progress", "results",
  "sell-practice-courses", "settings", "sign-in", "sign-up", "signin", "signup", "sitemap.xml", "robots.txt",
  "staff-training", "support", "terms", "welcome", "opengraph-image", "favicon.ico",
  // Names people could mistake for XINGO itself
  "xingo", "xingo-team", "team", "staff", "official", "security", "legal", "status", "www", "mail", "app",
]);

export function normaliseHandle(input: string) {
  return input.trim().toLowerCase().replace(/^@/, "").replace(/\s+/g, "-");
}

/** null when fine, otherwise a sentence for the form. */
/** Endings the site's proxy treats as static files, so a handle can't end with them. */
const FILE_ENDING = /\.(html?|css|js|json|png|jpe?g|gif|svg|ico|ttf|woff2?|webp|txt|xml)$/;

export function handleProblem(handle: string) {
  if (!HANDLE_PATTERN.test(handle) || FILE_ENDING.test(handle)) {
    return "Use 3–30 lowercase letters, numbers, dots, dashes or underscores, starting with a letter or number.";
  }
  if (RESERVED_HANDLES.has(handle)) return "That name is reserved. Try another.";
  return null;
}

export function normaliseEmail(input: string) {
  return input.trim().toLowerCase();
}

const EMAIL_PATTERN = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;

/** Splits pasted text (commas, semicolons, new lines, "Name <a@b.c>") into unique, valid emails. */
export function parseEmailList(text: string) {
  const found = new Set<string>();
  const invalid: string[] = [];
  for (const raw of text.split(/[\n,;]+/)) {
    const piece = raw.trim();
    if (!piece) continue;
    const bracketed = piece.match(/<([^>]+)>/);
    const email = normaliseEmail(bracketed ? bracketed[1] : piece);
    if (EMAIL_PATTERN.test(email)) found.add(email);
    else invalid.push(piece);
  }
  return { emails: [...found], invalid };
}

export const MAX_INVITES_PER_BATCH = 200;
export const ORG_MAX_MONTHLY_MINUTES = 100_000;

/** Featured banner links: a site path or an https URL. */
export function isSafeFeatureLink(link: string) {
  return /^\/(?!\/)[^\s]*$/.test(link) || /^https:\/\/[^\s]+$/.test(link);
}
