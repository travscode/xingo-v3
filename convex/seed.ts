import { mutation } from "./_generated/server";
import { seedJobs, seedModules, seedOrganizations, seedScenarios } from "./seedData";

export const seedBaseData = mutation({
  args: {},
  handler: async (ctx) => {
    const existingModule = await ctx.db.query("modules").first();

    if (existingModule) {
      return { seeded: false };
    }

    for (const organization of seedOrganizations) {
      await ctx.db.insert("organizations", organization);
    }

    for (const seededModule of seedModules) {
      await ctx.db.insert("modules", {
        ...seededModule,
        learningObjectives: [...seededModule.learningObjectives],
      });
    }

    for (const scenario of seedScenarios) {
      await ctx.db.insert("scenarios", {
        ...scenario,
        aiAgentA: { ...scenario.aiAgentA },
        aiAgentB: { ...scenario.aiAgentB },
        practiceRuntime: {
          ...scenario.practiceRuntime,
          assessmentFocus: [...scenario.practiceRuntime.assessmentFocus],
        },
        expectedSkills: [...scenario.expectedSkills],
      });
    }

    for (const job of seedJobs) {
      await ctx.db.insert("jobs", job);
    }

    return { seeded: true };
  },
});

export const syncScenarioRuntime = mutation({
  args: {},
  handler: async (ctx) => {
    let updated = 0;

    for (const seededScenario of seedScenarios) {
      const existingScenario = await ctx.db
        .query("scenarios")
        .withIndex("by_public_id", (q) => q.eq("id", seededScenario.id))
        .unique();

      if (!existingScenario) {
        continue;
      }

      await ctx.db.patch(existingScenario._id, {
        title: seededScenario.title,
        description: seededScenario.description,
        aiAgentA: { ...seededScenario.aiAgentA },
        aiAgentB: { ...seededScenario.aiAgentB },
        practiceRuntime: {
          ...seededScenario.practiceRuntime,
          assessmentFocus: [...seededScenario.practiceRuntime.assessmentFocus],
        },
        expectedSkills: [...seededScenario.expectedSkills],
        difficultyLevel: seededScenario.difficultyLevel,
      });
      updated += 1;
    }

    return { updated };
  },
});
