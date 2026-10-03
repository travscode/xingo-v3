import { v } from "convex/values";
import type { QueryCtx } from "../_generated/server";
import { getUserByClerkId } from "./auth";
import { DEFAULT_LANGUAGE_PAIR, sessionsForPair, type PairInput } from "../../lib/languages";

/** Optional `pair` argument for progress queries: scores and history follow the selected language pair. */
export const pairArg = v.optional(v.object({ sourceLanguage: v.string(), targetLanguage: v.string() }));

/** The pair older, unlabelled sessions count towards: the learner's first saved pair. */
export async function fallbackPair(ctx: QueryCtx, clerkId: string): Promise<PairInput> {
  const user = await getUserByClerkId(ctx, clerkId);
  return user?.languagePreferences?.[0] ?? DEFAULT_LANGUAGE_PAIR;
}

export async function filterSessionsForPair<T extends { sourceLanguage?: string; targetLanguage?: string }>(
  ctx: QueryCtx,
  clerkId: string,
  sessions: T[],
  pair: PairInput | undefined,
) {
  if (!pair) return sessions;
  return sessionsForPair(sessions, pair, await fallbackPair(ctx, clerkId));
}
