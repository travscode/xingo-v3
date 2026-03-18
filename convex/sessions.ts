import { v } from "convex/values";
import { query } from "./_generated/server";

export const listForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    const clerkId = identity.subject ?? identity.tokenIdentifier;
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

    const clerkId = identity.subject ?? identity.tokenIdentifier;
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
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
      return {
        averageScore: 0,
        modulesCompleted: 0,
        practiceHours: 0,
        credentialsEarned: 0,
      };
    }

    const clerkId = identity.subject ?? identity.tokenIdentifier;
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .collect();

    if (sessions.length === 0) {
      return {
        averageScore: 0,
        modulesCompleted: 0,
        practiceHours: 0,
        credentialsEarned: 0,
      };
    }

    const averageScore = Math.round(
      sessions.reduce((sum, session) => sum + session.score, 0) / sessions.length,
    );
    const practiceHours = Math.round(
      (sessions.reduce((sum, session) => sum + session.durationMinutes, 0) / 60) * 10,
    ) / 10;
    const completedModuleIds = new Set(
      sessions.filter((session) => session.score >= 75).map((session) => session.moduleId),
    );

    return {
      averageScore,
      modulesCompleted: completedModuleIds.size,
      practiceHours,
      credentialsEarned: completedModuleIds.size,
    };
  },
});
