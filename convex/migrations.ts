import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * One-off data fixes. Run each with `npx convex run migrations:<name>`,
 * dry run first (`'{"dryRun":true}'`). See docs/runbooks/release-v4.md.
 */

/**
 * Deletes the fake practice sessions every account received at signup
 * (ids `sess_<clerkId>_<n>`) and unassigns the demo job.
 */
export const removeDemoData = internalMutation({
  args: { dryRun: v.boolean() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db.query("sessions").collect();
    const demo = sessions.filter(
      (session) =>
        session.id === `sess_${session.clerkId}_1` ||
        session.id === `sess_${session.clerkId}_2` ||
        session.id === `sess_${session.clerkId}_3`,
    );

    if (!args.dryRun) {
      for (const session of demo) {
        await ctx.db.delete(session._id);
      }
    }

    const demoJob = await ctx.db
      .query("jobs")
      .withIndex("by_public_id", (q) => q.eq("id", "job_1"))
      .unique();

    if (!args.dryRun && demoJob?.assignedInterpreterClerkId) {
      await ctx.db.patch(demoJob._id, {
        assignedInterpreterClerkId: undefined,
        status: "open",
      });
    }

    return {
      dryRun: args.dryRun,
      demoSessions: demo.length,
      affectedUsers: new Set(demo.map((session) => session.clerkId)).size,
      demoJobUnassigned: Boolean(demoJob?.assignedInterpreterClerkId),
    };
  },
});

/**
 * Pre-v4 attempts left "in_progress" were never metered; mark them abandoned
 * so they stop showing as live. No minutes are charged.
 */
export const closeLegacyOpenAttempts = internalMutation({
  args: { dryRun: v.boolean() },
  handler: async (ctx, args) => {
    const open = await ctx.db
      .query("sessions")
      .withIndex("by_status", (q) => q.eq("completionStatus", "in_progress"))
      .collect();
    const legacy = open.filter((session) => session.startedAtMs === undefined);

    if (!args.dryRun) {
      for (const session of legacy) {
        await ctx.db.patch(session._id, {
          completionStatus: "abandoned",
          transcriptSummary: "Practice ended without finishing.",
        });
      }
    }

    return { dryRun: args.dryRun, closed: legacy.length };
  },
});

/**
 * Marks one scenario per premium module as a free preview so free users can try
 * the CCL / CPI format before buying.
 */
export const setFreePreviews = internalMutation({
  args: { scenarioIds: v.array(v.string()), dryRun: v.boolean() },
  handler: async (ctx, args) => {
    const updated: string[] = [];

    for (const scenarioId of args.scenarioIds) {
      const scenario = await ctx.db
        .query("scenarios")
        .withIndex("by_public_id", (q) => q.eq("id", scenarioId))
        .unique();

      if (scenario) {
        updated.push(scenarioId);

        if (!args.dryRun) {
          await ctx.db.patch(scenario._id, { isFreePreview: true });
        }
      }
    }

    return { dryRun: args.dryRun, updated };
  },
});

function renamePractitioner(text: string | undefined) {
  return text
    ?.replace(/\bPractitioner\b/g, "Clinician")
    .replace(/\bpractitioner\b/g, "clinician");
}

/**
 * "Practitioner" also describes interpreters, so participant roles use
 * "Clinician" (or a specific title set in the admin studio). Feedback: Thomas, Jul 2026.
 */
export const renamePractitionerRole = internalMutation({
  args: { dryRun: v.boolean() },
  handler: async (ctx, args) => {
    const scenarios = await ctx.db.query("scenarios").collect();
    const changed: string[] = [];

    for (const scenario of scenarios) {
      const agents = [scenario.aiAgentA, scenario.aiAgentB];
      const mentions = agents.some(
        (agent) =>
          agent &&
          /practitioner/i.test(
            [agent.role, agent.name, agent.instructions, agent.openingLine, agent.goal].join(" "),
          ),
      );

      if (!mentions) {
        continue;
      }

      changed.push(scenario.id);

      if (args.dryRun) {
        continue;
      }

      const rename = <T extends typeof scenario.aiAgentA>(agent: T): T => ({
        ...agent,
        role: renamePractitioner(agent.role) ?? agent.role,
        goal: renamePractitioner(agent.goal) ?? agent.goal,
        instructions: renamePractitioner(agent.instructions),
        openingLine: renamePractitioner(agent.openingLine),
      });

      await ctx.db.patch(scenario._id, {
        aiAgentA: rename(scenario.aiAgentA),
        aiAgentB: scenario.aiAgentB ? rename(scenario.aiAgentB) : undefined,
        description: renamePractitioner(scenario.description) ?? scenario.description,
      });
    }

    return { dryRun: args.dryRun, changed };
  },
});
