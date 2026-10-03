import type { MutationCtx } from "../_generated/server";
import { estimateCostUsd } from "../../lib/costs";
import { getBillingMonthKey } from "../../lib/plans";

/**
 * Adds to a user's monthly usage totals (admin Usage tab). Kept as a rollup so
 * the admin view never has to scan every session or token event.
 */
export async function bumpUsage(
  ctx: MutationCtx,
  clerkId: string,
  at: string,
  delta: { attempts?: number; minutes?: number; tokens?: { source: string; input: number; output: number } },
) {
  const month = getBillingMonthKey(new Date(at));
  const tokens = delta.tokens;
  const add = {
    attempts: delta.attempts ?? 0,
    minutes: delta.minutes ?? 0,
    realtimeTokens: tokens?.source === "realtime" ? tokens.input + tokens.output : 0,
    otherTokens: tokens && tokens.source !== "realtime" ? tokens.input + tokens.output : 0,
    costUsd: tokens ? estimateCostUsd(tokens.source, tokens.input, tokens.output) : 0,
  };
  const existing = await ctx.db
    .query("usageRollups")
    .withIndex("by_clerkId_month", (q) => q.eq("clerkId", clerkId).eq("month", month))
    .unique();

  if (!existing) {
    await ctx.db.insert("usageRollups", { clerkId, month, ...add, lastActiveAt: at });
    return;
  }

  await ctx.db.patch(existing._id, {
    attempts: existing.attempts + add.attempts,
    minutes: existing.minutes + add.minutes,
    realtimeTokens: existing.realtimeTokens + add.realtimeTokens,
    otherTokens: existing.otherTokens + add.otherTokens,
    costUsd: existing.costUsd + add.costUsd,
    lastActiveAt: at > existing.lastActiveAt ? at : existing.lastActiveAt,
  });
}
