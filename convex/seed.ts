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
        expectedSkills: [...scenario.expectedSkills],
      });
    }

    for (const job of seedJobs) {
      await ctx.db.insert("jobs", job);
    }

    return { seeded: true };
  },
});
