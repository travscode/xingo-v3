import { mutation } from "./_generated/server";
import { seedJobs, seedModules, seedOrganizations, seedScenarios } from "./seedData";

export const seedBaseData = mutation({
  args: {},
  handler: async (ctx) => {
    let insertedOrganizations = 0;
    let insertedModules = 0;
    let insertedScenarios = 0;
    let insertedJobs = 0;

    for (const organization of seedOrganizations) {
      const existingOrganization = await ctx.db
        .query("organizations")
        .withIndex("by_public_id", (q) => q.eq("id", organization.id))
        .unique();

      if (existingOrganization) {
        continue;
      }

      await ctx.db.insert("organizations", organization);
      insertedOrganizations += 1;
    }

    for (const seededModule of seedModules) {
      const existingModule = await ctx.db
        .query("modules")
        .withIndex("by_public_id", (q) => q.eq("id", seededModule.id))
        .unique();

      if (existingModule) {
        continue;
      }

      await ctx.db.insert("modules", {
        ...seededModule,
        learningObjectives: [...seededModule.learningObjectives],
      });
      insertedModules += 1;
    }

    for (const scenario of seedScenarios) {
      const existingScenario = await ctx.db
        .query("scenarios")
        .withIndex("by_public_id", (q) => q.eq("id", scenario.id))
        .unique();

      if (existingScenario) {
        continue;
      }

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
      insertedScenarios += 1;
    }

    for (const job of seedJobs) {
      const existingJob = await ctx.db
        .query("jobs")
        .withIndex("by_public_id", (q) => q.eq("id", job.id))
        .unique();

      if (existingJob) {
        continue;
      }

      await ctx.db.insert("jobs", job);
      insertedJobs += 1;
    }

    const totalInserted =
      insertedOrganizations + insertedModules + insertedScenarios + insertedJobs;

    return {
      seeded: totalInserted > 0,
      inserted: {
        organizations: insertedOrganizations,
        modules: insertedModules,
        scenarios: insertedScenarios,
        jobs: insertedJobs,
      },
    };
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
