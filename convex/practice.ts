import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  mutation,
  type MutationCtx,
} from "./_generated/server";
import { getUserByClerkId, requireClerkId, requireUser } from "./model/auth";
import {
  getEntitlement,
  getScenarioAccess,
  splitCharge,
} from "./model/entitlements";
import {
  billableMinutesFromMs,
  getBillingMonthKey,
  HEARTBEAT_TIMEOUT_MS,
  MAX_ATTEMPT_MINUTES,
  MAX_REALTIME_KEYS_PER_ATTEMPT,
  MIN_MINUTES_TO_START,
} from "../lib/plans";

const transcriptEntry = v.object({
  id: v.string(),
  role: v.union(v.literal("assistant"), v.literal("user"), v.literal("system")),
  speaker: v.string(),
  text: v.string(),
  createdAt: v.string(),
});

const assessment = v.object({
  overallScore: v.number(),
  summary: v.string(),
  strengths: v.array(v.string()),
  improvementAreas: v.array(v.string()),
  recommendedNextStep: v.string(),
  completionDecision: v.union(v.literal("completed"), v.literal("needs_review")),
  breakdown: v.object({
    accuracy: v.number(),
    terminology: v.number(),
    fluency: v.number(),
    turnManagement: v.number(),
    professionalism: v.number(),
  }),
});

const MAX_TRANSCRIPT_ENTRIES = 400;
const MAX_ENTRY_CHARS = 2000;

type Attempt = Doc<"sessions">;

async function getAttemptById(ctx: MutationCtx, attemptId: string) {
  return ctx.db
    .query("sessions")
    .withIndex("by_public_id", (q) => q.eq("id", attemptId))
    .unique();
}

async function requireOwnedAttempt(
  ctx: MutationCtx,
  attemptId: string,
  clerkId: string,
) {
  const attempt = await getAttemptById(ctx, attemptId);

  if (!attempt || attempt.clerkId !== clerkId) {
    throw new Error("Practice attempt not found");
  }

  return attempt;
}

/**
 * How long this attempt may run, given the balance the user had when it started
 * plus anything bought since (balance is re-read on every heartbeat).
 */
function allowedDurationMs(remainingMinutes: number) {
  return Math.min(remainingMinutes, MAX_ATTEMPT_MINUTES) * 60_000;
}

/**
 * Ends an in-progress attempt and charges the minutes it used.
 * Idempotent: an attempt is charged at most once.
 */
async function closeAndCharge(
  ctx: MutationCtx,
  attempt: Attempt,
  endMs: number,
  patch: Partial<Doc<"sessions">>,
) {
  const startedAtMs = attempt.startedAtMs ?? Date.parse(attempt.timestamp);
  const durationMs = Math.max(0, endMs - startedAtMs);
  const user = await getUserByClerkId(ctx, attempt.clerkId);
  let chargedMinutes = attempt.chargedMinutes ?? 0;

  const existingCharge = await ctx.db
    .query("usageCharges")
    .withIndex("by_attemptId", (q) => q.eq("attemptId", attempt.id))
    .first();

  if (user && !existingCharge && attempt.startedAtMs !== undefined) {
    const entitlement = await getEntitlement(ctx, user, new Date(endMs));
    const split = splitCharge(entitlement, billableMinutesFromMs(durationMs));

    if (split.charged > 0) {
      await ctx.db.insert("usageCharges", {
        clerkId: attempt.clerkId,
        attemptId: attempt.id,
        minutes: split.charged,
        fromAllowance: split.fromAllowance,
        fromPacks: split.fromPacks,
        billingMonth: getBillingMonthKey(new Date(endMs)),
        createdAt: new Date(endMs).toISOString(),
      });
    }

    chargedMinutes = split.charged;
  }

  const durationSeconds = Math.round(durationMs / 1000);
  const endedAt = new Date(endMs).toISOString();

  await ctx.db.patch(attempt._id, {
    endedAt,
    timestamp: endedAt,
    durationSeconds,
    durationMinutes: Math.round((durationSeconds / 60) * 10) / 10,
    chargedMinutes,
    ...patch,
  });

  return { chargedMinutes, durationSeconds };
}

/**
 * Starts a metered practice attempt. Enforces module access and remaining minutes,
 * and closes any other live attempt the user left open (one live attempt at a time).
 */
export const startAttempt = mutation({
  args: {
    scenarioId: v.string(),
    sourceLanguage: v.string(),
    targetLanguage: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const scenario = await ctx.db
      .query("scenarios")
      .withIndex("by_public_id", (q) => q.eq("id", args.scenarioId))
      .unique();

    if (!scenario) {
      throw new Error("Scenario not found");
    }

    const learningModule = await ctx.db
      .query("modules")
      .withIndex("by_public_id", (q) => q.eq("id", scenario.moduleId))
      .unique();

    if (!learningModule) {
      throw new Error("Module not found");
    }

    const now = Date.now();
    const openAttempts = await ctx.db
      .query("sessions")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", user.clerkId))
      .filter((q) => q.eq(q.field("completionStatus"), "in_progress"))
      .collect();

    for (const open of openAttempts) {
      await closeAndCharge(ctx, open, open.lastActiveAtMs ?? now, {
        completionStatus: "abandoned",
        transcriptSummary: "Attempt was replaced by a newer attempt.",
      });
    }

    const entitlement = await getEntitlement(ctx, user, new Date(now));
    const access = getScenarioAccess(entitlement, learningModule, scenario);

    if (!access.allowed) {
      throw new Error("PREMIUM_REQUIRED");
    }

    if (entitlement.remainingMinutes < MIN_MINUTES_TO_START) {
      throw new Error("OUT_OF_MINUTES");
    }

    const attemptId = crypto.randomUUID();
    const startedAt = new Date(now).toISOString();

    await ctx.db.insert("sessions", {
      id: attemptId,
      clerkId: user.clerkId,
      moduleId: scenario.moduleId,
      scenarioId: scenario.id,
      startedAt,
      startedAtMs: now,
      lastActiveAtMs: now,
      realtimeKeysIssued: 0,
      durationSeconds: 0,
      durationMinutes: 0,
      score: 0,
      completionStatus: "in_progress",
      transcriptSummary: "Practice session in progress.",
      transcriptEntries: [],
      sourceLanguage: args.sourceLanguage.trim().slice(0, 40),
      targetLanguage: args.targetLanguage.trim().slice(0, 40),
      timestamp: startedAt,
    });

    return {
      attemptId,
      allowedMs: allowedDurationMs(entitlement.remainingMinutes),
      remainingMinutes: entitlement.remainingMinutes,
    };
  },
});

/**
 * Keeps an attempt alive and tells the client whether it must stop.
 * The server clock is the source of truth for metering.
 */
export const heartbeat = mutation({
  args: { attemptId: v.string() },
  handler: async (ctx, args) => {
    const clerkId = await requireClerkId(ctx);
    const attempt = await requireOwnedAttempt(ctx, args.attemptId, clerkId);

    if (attempt.completionStatus !== "in_progress") {
      return { shouldEnd: true, elapsedMs: 0, allowedMs: 0 };
    }

    const user = await getUserByClerkId(ctx, clerkId);
    const now = Date.now();
    const startedAtMs = attempt.startedAtMs ?? now;
    const entitlement = user ? await getEntitlement(ctx, user, new Date(now)) : null;
    const allowedMs = allowedDurationMs(entitlement?.remainingMinutes ?? 0);
    const elapsedMs = now - startedAtMs;

    await ctx.db.patch(attempt._id, { lastActiveAtMs: now });

    return { shouldEnd: elapsedMs >= allowedMs, elapsedMs, allowedMs };
  },
});

/** Ends an attempt without grading (user left the room). */
export const cancelAttempt = mutation({
  args: { attemptId: v.string() },
  handler: async (ctx, args) => {
    const clerkId = await requireClerkId(ctx);
    const attempt = await requireOwnedAttempt(ctx, args.attemptId, clerkId);

    if (attempt.completionStatus !== "in_progress") {
      return { ok: true };
    }

    await closeAndCharge(ctx, attempt, Date.now(), {
      completionStatus: "abandoned",
      transcriptSummary: "Practice ended before grading.",
    });

    return { ok: true };
  },
});

/**
 * Reserves one realtime client secret for an attempt. Called by the
 * `practiceActions.createRealtimeSecret` action before it contacts OpenAI.
 */
export const reserveRealtimeKey = internalMutation({
  args: { attemptId: v.string(), clerkId: v.string() },
  handler: async (ctx, args) => {
    const attempt = await requireOwnedAttempt(ctx, args.attemptId, args.clerkId);

    if (attempt.completionStatus !== "in_progress") {
      throw new Error("This practice attempt has ended.");
    }

    const issued = attempt.realtimeKeysIssued ?? 0;

    if (issued >= MAX_REALTIME_KEYS_PER_ATTEMPT) {
      throw new Error("Too many reconnects for this attempt. Start a new attempt.");
    }

    const user = await getUserByClerkId(ctx, args.clerkId);
    const now = Date.now();
    const entitlement = user ? await getEntitlement(ctx, user, new Date(now)) : null;
    const elapsedMs = now - (attempt.startedAtMs ?? now);

    if (elapsedMs >= allowedDurationMs(entitlement?.remainingMinutes ?? 0)) {
      throw new Error("OUT_OF_MINUTES");
    }

    await ctx.db.patch(attempt._id, {
      realtimeKeysIssued: issued + 1,
      lastActiveAtMs: now,
    });

    return { ok: true };
  },
});

/**
 * Closes the attempt for grading: stores the transcript, charges minutes and
 * returns what the grader needs. The scenario is read here, never from the client.
 */
export const closeForGrading = internalMutation({
  args: {
    attemptId: v.string(),
    clerkId: v.string(),
    transcriptEntries: v.array(transcriptEntry),
  },
  handler: async (ctx, args) => {
    const attempt = await requireOwnedAttempt(ctx, args.attemptId, args.clerkId);

    if (attempt.completionStatus !== "in_progress") {
      throw new Error("This practice attempt has already ended.");
    }

    const transcriptEntries = args.transcriptEntries
      .slice(0, MAX_TRANSCRIPT_ENTRIES)
      .map((entry) => ({
        ...entry,
        speaker: entry.speaker.slice(0, 80),
        text: entry.text.slice(0, MAX_ENTRY_CHARS),
      }))
      .filter((entry) => entry.text.trim().length > 0);
    const interpreterTurns = transcriptEntries.filter((e) => e.role === "user").length;

    await closeAndCharge(ctx, attempt, Date.now(), {
      completionStatus: "ungraded",
      ungradedReason: "grading",
      transcriptEntries,
      transcriptSummary: summarizeTranscript(transcriptEntries),
    });

    const scenario = await ctx.db
      .query("scenarios")
      .withIndex("by_public_id", (q) => q.eq("id", attempt.scenarioId))
      .unique();

    return {
      interpreterTurns,
      transcriptEntries,
      scenario,
      sourceLanguage: attempt.sourceLanguage,
      targetLanguage: attempt.targetLanguage,
      moduleId: attempt.moduleId,
    };
  },
});

/** Re-opens a failed grading run without re-charging. */
export const prepareRegrade = internalMutation({
  args: { attemptId: v.string(), clerkId: v.string() },
  handler: async (ctx, args) => {
    const attempt = await requireOwnedAttempt(ctx, args.attemptId, args.clerkId);

    if (
      attempt.completionStatus !== "ungraded" ||
      attempt.ungradedReason !== "grading_failed"
    ) {
      throw new Error("This attempt cannot be re-graded.");
    }

    await ctx.db.patch(attempt._id, { ungradedReason: "grading" });

    const scenario = await ctx.db
      .query("scenarios")
      .withIndex("by_public_id", (q) => q.eq("id", attempt.scenarioId))
      .unique();
    const transcriptEntries = attempt.transcriptEntries ?? [];

    return {
      interpreterTurns: transcriptEntries.filter((e) => e.role === "user").length,
      transcriptEntries,
      scenario,
      sourceLanguage: attempt.sourceLanguage,
      targetLanguage: attempt.targetLanguage,
      moduleId: attempt.moduleId,
    };
  },
});

export const markUngraded = internalMutation({
  args: {
    attemptId: v.string(),
    reason: v.union(v.literal("too_short"), v.literal("grading_failed")),
  },
  handler: async (ctx, args) => {
    const attempt = await getAttemptById(ctx, args.attemptId);

    if (attempt) {
      await ctx.db.patch(attempt._id, {
        completionStatus: "ungraded",
        ungradedReason: args.reason,
      });
    }
  },
});

export const saveAssessment = internalMutation({
  args: {
    attemptId: v.string(),
    assessment,
  },
  handler: async (ctx, args) => {
    const attempt = await getAttemptById(ctx, args.attemptId);

    if (!attempt) {
      throw new Error("Practice attempt not found");
    }

    const score = Math.max(0, Math.min(100, Math.round(args.assessment.overallScore)));

    await ctx.db.patch(attempt._id, {
      score,
      completionStatus: args.assessment.completionDecision,
      ungradedReason: undefined,
      assessment: { ...args.assessment, overallScore: score },
    });
  },
});

export const getAttemptOwnerInternal = internalQuery({
  args: { attemptId: v.string() },
  handler: async (ctx, args) => {
    const attempt = await ctx.db
      .query("sessions")
      .withIndex("by_public_id", (q) => q.eq("id", args.attemptId))
      .unique();

    return attempt
      ? { clerkId: attempt.clerkId, moduleId: attempt.moduleId, scenarioId: attempt.scenarioId }
      : null;
  },
});

/**
 * Cron: closes attempts whose heartbeat stopped (tab closed, network lost) and
 * charges them up to their last heartbeat.
 */
export const sweepStaleAttempts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const open = await ctx.db
      .query("sessions")
      .withIndex("by_status", (q) => q.eq("completionStatus", "in_progress"))
      .take(200);
    let closed = 0;

    for (const attempt of open) {
      const lastActive =
        attempt.lastActiveAtMs ?? attempt.startedAtMs ?? Date.parse(attempt.timestamp);

      if (now - lastActive < HEARTBEAT_TIMEOUT_MS) {
        continue;
      }

      await closeAndCharge(ctx, attempt, lastActive, {
        completionStatus: "abandoned",
        transcriptSummary: "Practice ended without finishing.",
      });
      closed += 1;
    }

    return { closed };
  },
});

function summarizeTranscript(
  entries: Array<{ speaker: string; text: string }>,
) {
  const lines = entries.slice(-4).map((entry) => `${entry.speaker}: ${entry.text}`);
  return lines.join(" ").slice(0, 400) || "No transcript captured.";
}
