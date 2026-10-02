import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { packModules, packScenarios } from "./content/australiaPack";

/**
 * Inserts the Australia content pack. Insert-only: existing modules and
 * scenarios (including admin edits) are left untouched.
 * `npx convex run content:seedAustraliaPack '{"dryRun":true}'`
 */
export const seedAustraliaPack = internalMutation({
  args: { dryRun: v.boolean() },
  handler: async (ctx, args) => {
    const inserted = { modules: [] as string[], scenarios: [] as string[] };

    for (const learningModule of packModules) {
      const existing = await ctx.db
        .query("modules")
        .withIndex("by_public_id", (q) => q.eq("id", learningModule.id))
        .unique();

      if (!existing) {
        inserted.modules.push(learningModule.id);
        if (!args.dryRun) {
          await ctx.db.insert("modules", {
            ...learningModule,
            learningObjectives: [...learningModule.learningObjectives],
          });
        }
      }
    }

    for (const scenario of packScenarios) {
      const existing = await ctx.db
        .query("scenarios")
        .withIndex("by_public_id", (q) => q.eq("id", scenario.id))
        .unique();

      if (!existing) {
        inserted.scenarios.push(scenario.id);
        if (!args.dryRun) {
          await ctx.db.insert("scenarios", scenario);
        }
      }
    }

    return { dryRun: args.dryRun, inserted };
  },
});
