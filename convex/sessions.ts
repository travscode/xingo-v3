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
  completionDecision: v.union(
    v.literal("completed"),
    v.literal("needs_review"),
  ),
  breakdown: v.object({
    accuracy: v.number(),
    terminology: v.number(),
    fluency: v.number(),
    turnManagement: v.number(),
    professionalism: v.number(),
  }),
});

const progressMetric = v.union(
  v.literal("averageScore"),
  v.literal("bestScore"),
  v.literal("accuracy"),
  v.literal("terminology"),
  v.literal("fluency"),
  v.literal("turnManagement"),
  v.literal("professionalism"),
  v.literal("practiceMinutes"),
  v.literal("attempts"),
  v.literal("modulesPracticed"),
  v.literal("scenariosPracticed"),
);

type ProgressMetric =
  | "averageScore"
  | "bestScore"
  | "accuracy"
  | "terminology"
  | "fluency"
  | "turnManagement"
  | "professionalism"
  | "practiceMinutes"
  | "attempts"
  | "modulesPracticed"
  | "scenariosPracticed";

type SessionStatusRecord = {
  completionStatus: "in_progress" | "completed" | "needs_review";
};

type CompletedSessionRecord = SessionStatusRecord & {
  moduleId: string;
  scenarioId: string;
  score: number;
  durationMinutes: number;
  timestamp: string;
  assessment?: {
    breakdown: {
      accuracy: number;
      terminology: number;
      fluency: number;
      turnManagement: number;
      professionalism: number;
    };
  };
};

function getClerkId(identity: {
  subject?: string | null;
  tokenIdentifier: string;
}) {
  return identity.subject ?? identity.tokenIdentifier;
}

/**
 * Returns only finished practice attempts that should contribute to progress history.
 */
function getCompletedSessions<T extends SessionStatusRecord>(sessions: T[]) {
  return sessions.filter(
    (session) => session.completionStatus !== "in_progress",
  );
}

/**
 * Parses a date-only filter value into a UTC boundary date.
 */
function parseDateBoundary(value: string, boundary: "start" | "end") {
  const suffix = boundary === "start" ? "T00:00:00.000Z" : "T23:59:59.999Z";
  const parsed = new Date(`${value}${suffix}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Returns the UTC Monday for the provided date.
 */
function startOfUtcWeek(input: Date) {
  const date = new Date(
    Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()),
  );
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}

/**
 * Chooses a readable bucket size based on the filtered date span.
 */
function getBucketSize(startAt: Date | null, endAt: Date | null) {
  if (!startAt || !endAt) {
    return "day" as const;
  }

  const spanDays = Math.max(
    1,
    Math.ceil((endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60 * 24)),
  );

  if (spanDays > 180) {
    return "month" as const;
  }

  if (spanDays > 45) {
    return "week" as const;
  }

  return "day" as const;
}

/**
 * Aligns a date to the start of its selected UTC aggregation bucket.
 */
function getBucketStart(input: Date, bucket: "day" | "week" | "month") {
  if (bucket === "month") {
    return new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), 1));
  }

  if (bucket === "week") {
    return startOfUtcWeek(input);
  }

  return new Date(
    Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()),
  );
}

/**
 * Formats a bucket boundary into a short chart label.
 */
function formatBucketLabel(input: Date, bucket: "day" | "week" | "month") {
  if (bucket === "month") {
    return input.toLocaleDateString("en-AU", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  if (bucket === "week") {
    const end = new Date(input);
    end.setUTCDate(end.getUTCDate() + 6);
    return `${input.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    })} - ${end.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    })}`;
  }

  return input.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/**
 * Computes a single metric value for one aggregated time bucket.
 */
function getBucketMetricValue(
  metric: ProgressMetric,
  sessions: CompletedSessionRecord[],
) {
  if (sessions.length === 0) {
    return 0;
  }

  switch (metric) {
    case "averageScore":
      return Math.round(
        sessions.reduce((sum, session) => sum + session.score, 0) /
          sessions.length,
      );
    case "bestScore":
      return Math.max(...sessions.map((session) => session.score));
    case "practiceMinutes":
      return Math.round(
        sessions.reduce((sum, session) => sum + session.durationMinutes, 0),
      );
    case "attempts":
      return sessions.length;
    case "modulesPracticed":
      return new Set(sessions.map((session) => session.moduleId)).size;
    case "scenariosPracticed":
      return new Set(sessions.map((session) => session.scenarioId)).size;
    case "accuracy":
    case "terminology":
    case "fluency":
    case "turnManagement":
    case "professionalism": {
      const assessed = sessions.filter((session) => session.assessment);
      if (assessed.length === 0) {
        return 0;
      }
      return Math.round(
        assessed.reduce(
          (sum, session) => sum + (session.assessment?.breakdown[metric] ?? 0),
          0,
        ) / assessed.length,
      );
    }
    default:
      return 0;
  }
}

function calculateMetrics(
  sessions: Array<{
    score: number;
    moduleId: string;
    durationMinutes: number;
    completionStatus: "in_progress" | "completed" | "needs_review";
  }>,
) {
  const completedSessions = getCompletedSessions(sessions);

  if (completedSessions.length === 0) {
    return {
      averageScore: 0,
      modulesCompleted: 0,
      practiceHours: 0,
      credentialsEarned: 0,
    };
  }

  const averageScore = Math.round(
    completedSessions.reduce((sum, session) => sum + session.score, 0) /
      completedSessions.length,
  );
  const practiceHours =
    Math.round(
      (completedSessions.reduce(
        (sum, session) => sum + session.durationMinutes,
        0,
      ) /
        60) *
        10,
    ) / 10;
  const completedModuleIds = new Set(
    completedSessions
      .filter((session) => session.score >= 75)
      .map((session) => session.moduleId),
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

export const progressHistoryForCurrentUser = query({
  args: {
    metric: progressMetric,
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    moduleId: v.optional(v.string()),
    scenarioId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return {
        bucket: "day" as const,
        points: [],
        summary: {
          averageScore: 0,
          bestScore: 0,
          attemptCount: 0,
          practiceMinutes: 0,
          uniqueModules: 0,
          uniqueScenarios: 0,
        },
      };
    }

    const clerkId = getClerkId(identity);
    const allSessions = await ctx.db
      .query("sessions")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .collect();
    const completedSessions = getCompletedSessions(allSessions);
    const startBoundary = args.startDate
      ? parseDateBoundary(args.startDate, "start")
      : null;
    const endBoundary = args.endDate
      ? parseDateBoundary(args.endDate, "end")
      : null;
    const filteredSessions = completedSessions.filter((session) => {
      if (args.moduleId && session.moduleId !== args.moduleId) {
        return false;
      }

      if (args.scenarioId && session.scenarioId !== args.scenarioId) {
        return false;
      }

      const sessionTime = new Date(session.timestamp);
      if (Number.isNaN(sessionTime.getTime())) {
        return false;
      }

      if (startBoundary && sessionTime < startBoundary) {
        return false;
      }

      if (endBoundary && sessionTime > endBoundary) {
        return false;
      }

      return true;
    });
    const sortedSessions = [...filteredSessions].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp),
    );
    const effectiveStart =
      startBoundary ??
      (sortedSessions[0] ? new Date(sortedSessions[0].timestamp) : null);
    const effectiveEnd =
      endBoundary ??
      (sortedSessions[sortedSessions.length - 1]
        ? new Date(sortedSessions[sortedSessions.length - 1].timestamp)
        : null);
    const bucket = getBucketSize(effectiveStart, effectiveEnd);
    const buckets = new Map<string, CompletedSessionRecord[]>();

    for (const session of sortedSessions) {
      const timestamp = new Date(session.timestamp);
      const bucketStart = getBucketStart(timestamp, bucket);
      const key = bucketStart.toISOString();
      const existing = buckets.get(key) ?? [];
      existing.push(session);
      buckets.set(key, existing);
    }

    return {
      bucket,
      points: [...buckets.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([bucketStart, bucketSessions]) => {
          const bucketDate = new Date(bucketStart);
          return {
            bucketStart,
            bucketLabel: formatBucketLabel(bucketDate, bucket),
            value: getBucketMetricValue(args.metric, bucketSessions),
            attemptCount: bucketSessions.length,
          };
        }),
      summary: {
        averageScore:
          sortedSessions.length > 0
            ? Math.round(
                sortedSessions.reduce(
                  (sum, session) => sum + session.score,
                  0,
                ) / sortedSessions.length,
              )
            : 0,
        bestScore:
          sortedSessions.length > 0
            ? Math.max(...sortedSessions.map((session) => session.score))
            : 0,
        attemptCount: sortedSessions.length,
        practiceMinutes: Math.round(
          sortedSessions.reduce(
            (sum, session) => sum + session.durationMinutes,
            0,
          ),
        ),
        uniqueModules: new Set(
          sortedSessions.map((session) => session.moduleId),
        ).size,
        uniqueScenarios: new Set(
          sortedSessions.map((session) => session.scenarioId),
        ).size,
      },
    };
  },
});

export const getByAttemptIdForCurrentUser = query({
  args: { attemptId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const clerkId = getClerkId(identity);
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_public_id", (q) => q.eq("id", args.attemptId))
      .unique();

    if (!session || session.clerkId !== clerkId) {
      return null;
    }

    return session;
  },
});

export const getLatestCompletedByScenarioForCurrentUser = query({
  args: { scenarioId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const clerkId = getClerkId(identity);
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_scenarioId", (q) => q.eq("scenarioId", args.scenarioId))
      .collect();

    return (
      sessions
        .filter(
          (session) =>
            session.clerkId === clerkId &&
            session.completionStatus !== "in_progress",
        )
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0] ?? null
    );
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
    completionStatus: v.union(
      v.literal("completed"),
      v.literal("needs_review"),
    ),
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
