import { cache } from "react";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

/** Handles are short and URL-safe; anything else (e.g. "/apple-touch-icon.png") is a 404 without a query. */
const LOOKS_LIKE_HANDLE = /^[a-z0-9][a-z0-9._-]{0,63}$/i;

/**
 * What lives at xingo.ai/<handle>, fetched signed out (for metadata and the 404 check).
 * The page itself re-reads it on the client so team members and invitees see their view.
 */
export const loadHandlePage = cache(async (raw: string) => {
  const handle = decodeURIComponent(raw);
  if (!LOOKS_LIKE_HANDLE.test(handle)) return null;
  try {
    return await fetchQuery(api.orgs.page, { handle });
  } catch {
    return null;
  }
});

export const loadCreator = cache(async (handle: string) => {
  try {
    return await fetchQuery(api.creators.profile, { handle });
  } catch {
    return null;
  }
});
