import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { LAUNCH_AVAILABLE_COURSE_IDS, LAUNCH_CCL_FREE_PREVIEW_IDS } from "../lib/course-status";
import { genderForVoice, languagesNameSuits, suggestLocalizedNames, type Gender } from "../lib/agent-names";

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

/**
 * Refunds minutes charged for attempts where nothing was said (e.g. the voice
 * service failed to connect). Matches abandoned attempts with an empty transcript.
 */
export const refundSilentAttempts = internalMutation({
  args: { dryRun: v.boolean() },
  handler: async (ctx, args) => {
    const charges = await ctx.db.query("usageCharges").collect();
    const refunded: Array<{ attemptId: string; minutes: number }> = [];

    for (const charge of charges) {
      const attempt = await ctx.db
        .query("sessions")
        .withIndex("by_public_id", (q) => q.eq("id", charge.attemptId))
        .unique();

      if (!attempt || attempt.completionStatus !== "abandoned" || (attempt.transcriptEntries ?? []).length > 0) {
        continue;
      }

      refunded.push({ attemptId: charge.attemptId, minutes: charge.minutes });

      if (!args.dryRun) {
        await ctx.db.delete(charge._id);
        await ctx.db.patch(attempt._id, { chargedMinutes: 0 });
      }
    }

    return { dryRun: args.dryRun, refunded };
  },
});

/**
 * CCL-first launch (D-043): every XINGO course except NAATI CCL and the free course
 * becomes "coming soon", and two CCL dialogues become free previews. Community
 * (marketplace) courses are left alone; they're hidden with the marketplace instead.
 */
export const applyCclLaunchStatuses = internalMutation({
  args: { dryRun: v.boolean() },
  handler: async (ctx, args) => {
    const open = new Set<string>(LAUNCH_AVAILABLE_COURSE_IDS);
    const courses = (await ctx.db.query("modules").collect()).filter((course) => course.source !== "community");
    const available: string[] = [];
    const comingSoon: string[] = [];

    for (const course of courses) {
      const status = open.has(course.id) ? "available" : "coming_soon";
      (status === "available" ? available : comingSoon).push(course.id);
      if (!args.dryRun && course.status !== status) {
        await ctx.db.patch(course._id, { status });
      }
    }

    const previews: string[] = [];
    for (const scenarioId of LAUNCH_CCL_FREE_PREVIEW_IDS) {
      const scenario = await ctx.db
        .query("scenarios")
        .withIndex("by_public_id", (q) => q.eq("id", scenarioId))
        .unique();
      if (!scenario) continue;
      previews.push(scenarioId);
      if (!args.dryRun && !scenario.isFreePreview) {
        await ctx.db.patch(scenario._id, { isFreePreview: true });
      }
    }

    return { dryRun: args.dryRun, available, comingSoon, freePreviews: previews };
  },
});

/**
 * Per-language names (D-045) for every character in XINGO courses who speaks the
 * learner's language (interpreting clients). Names come from the bank in
 * lib/agent-names.ts by voice gender; characters are numbered within each gender, course
 * by course, so a course doesn't repeat a name. An authored name is kept for languages it
 * already suits (e.g. "Ana Torres" in Spanish). Characters that already have names are
 * left alone unless `overwrite` is true. English-speaking professionals and English
 * test role-plays are untouched.
 */
export const applyLocalizedNames = internalMutation({
  args: { dryRun: v.boolean(), overwrite: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const xingoCourseIds = new Set(
      (await ctx.db.query("modules").collect()).filter((course) => course.source !== "community").map((course) => course.id),
    );
    const scenarios = (await ctx.db.query("scenarios").collect())
      .filter((scenario) => xingoCourseIds.has(scenario.moduleId) && scenario.practiceRuntime?.practiceType !== "roleplay")
      .sort((a, b) => a.moduleId.localeCompare(b.moduleId) || a.id.localeCompare(b.id));

    const nextSlot: Record<Gender, number> = { female: 0, male: 0 };
    const updated: Array<{ scenarioId: string; agent: "aiAgentA" | "aiAgentB"; name: string; examples: Record<string, string> }> = [];
    const skipped: Array<{ scenarioId: string; name: string; reason: string }> = [];

    for (const scenario of scenarios) {
      const patch: Partial<Pick<typeof scenario, "aiAgentA" | "aiAgentB">> = {};
      for (const key of ["aiAgentA", "aiAgentB"] as const) {
        const agent = scenario[key];
        if (!agent || !agent.language || agent.language.trim().toLowerCase() === "english") continue;
        const name = agent.name?.trim() || agent.role;
        const gender = genderForVoice(agent.voice);
        if (!gender) {
          skipped.push({ scenarioId: scenario.id, name, reason: `no gender for voice "${agent.voice}"` });
          continue;
        }
        const slot = nextSlot[gender]++;
        if (agent.localizedNames?.length && !args.overwrite) {
          skipped.push({ scenarioId: scenario.id, name, reason: "already has names" });
          continue;
        }
        const localizedNames = suggestLocalizedNames(gender, slot, { name, languages: languagesNameSuits(name) });
        patch[key] = { ...agent, localizedNames };
        const pick = (language: string) => localizedNames.find((entry) => entry.language === language)?.name ?? name;
        updated.push({
          scenarioId: scenario.id,
          agent: key,
          name,
          examples: { Spanish: pick("Spanish"), German: pick("German"), Mandarin: pick("Mandarin"), Arabic: pick("Arabic") },
        });
      }
      if (!args.dryRun && Object.keys(patch).length > 0) {
        await ctx.db.patch(scenario._id, patch);
      }
    }

    return { dryRun: args.dryRun, updatedCount: updated.length, updated, skipped };
  },
});
