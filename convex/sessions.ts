import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const transcriptEntry = v.object({
  id: v.string(),
  role: v.union(v.literal("assistant"), v.literal("user"), v.literal("system")),
  speaker: v.string(),
  text: v.string(),
  createdAt: v.string(),
});

const sessionAssessment = v.object({
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

function getClerkId(identity: { subject?: string | null; tokenIdentifier: string }) {
  return identity.subject ?? identity.tokenIdentifier;
}

function calculateMetrics(
  sessions: Array<{
    score: number;
    moduleId: string;
    durationMinutes: number;
    completionStatus: "in_progress" | "completed" | "needs_review";
  }>,
) {
  const completedSessions = sessions.filter((session) => session.completionStatus !== "in_progress");

  if (completedSessions.length === 0) {
    return {
      averageScore: 0,
      modulesCompleted: 0,
      practiceHours: 0,
      credentialsEarned: 0,
    };
  }

  const averageScore = Math.round(
    completedSessions.reduce((sum, session) => sum + session.score, 0) / completedSessions.length,
  );
  const practiceHours = Math.round(
    (completedSessions.reduce((sum, session) => sum + session.durationMinutes, 0) / 60) * 10,
  ) / 10;
  const completedModuleIds = new Set(
    completedSessions.filter((session) => session.score >= 75).map((session) => session.moduleId),
  );

  return {
    averageScore,
    modulesCompleted: completedModuleIds.size,
    practiceHours,
    credentialsEarned: completedModuleIds.size,
  };
}

export const listForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    const clerkId = getClerkId(identity);
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .collect();

    return sessions.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },
});

export const listByModuleForCurrentUser = query({
  args: { moduleId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    const clerkId = getClerkId(identity);
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
      .collect();

    return sessions
      .filter((session) => session.clerkId === clerkId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },
});

export const listByScenarioForCurrentUser = query({
  args: { scenarioId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    const clerkId = getClerkId(identity);
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_scenarioId", (q) => q.eq("scenarioId", args.scenarioId))
      .collect();

    return sessions
      .filter((session) => session.clerkId === clerkId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },
});

export const metricsForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return calculateMetrics([]);
    }

    const clerkId = getClerkId(identity);
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .collect();

    return calculateMetrics(sessions);
  },
});

export const startAttempt = mutation({
  args: {
    id: v.string(),
    moduleId: v.string(),
    scenarioId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = getClerkId(identity);
    const now = new Date().toISOString();
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (existing) {
      return { id: existing.id };
    }

    await ctx.db.insert("sessions", {
      id: args.id,
      clerkId,
      moduleId: args.moduleId,
      scenarioId: args.scenarioId,
      startedAt: now,
      endedAt: undefined,
      durationSeconds: 0,
      durationMinutes: 0,
      score: 0,
      completionStatus: "in_progress",
      transcriptSummary: "Practice session in progress.",
      transcriptEntries: [],
      assessment: undefined,
      timestamp: now,
    });

    return { id: args.id };
  },
});

export const completeAttempt = mutation({
  args: {
    id: v.string(),
    endedAt: v.string(),
    durationSeconds: v.number(),
    durationMinutes: v.number(),
    score: v.number(),
    completionStatus: v.union(v.literal("completed"), v.literal("needs_review")),
    transcriptSummary: v.string(),
    transcriptEntries: v.array(transcriptEntry),
    assessment: sessionAssessment,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = getClerkId(identity);
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (!existing) {
      throw new Error("Practice attempt not found");
    }

    if (existing.clerkId !== clerkId) {
      throw new Error("Practice attempt ownership mismatch");
    }

    await ctx.db.patch(existing._id, {
      endedAt: args.endedAt,
      durationSeconds: args.durationSeconds,
      durationMinutes: args.durationMinutes,
      score: args.score,
      completionStatus: args.completionStatus,
      transcriptSummary: args.transcriptSummary,
      transcriptEntries: args.transcriptEntries,
      assessment: args.assessment,
      timestamp: args.endedAt,
    });

    return { ok: true };
  },
});
