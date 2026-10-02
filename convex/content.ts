import { v } from "convex/values";
import { internalMutation, type MutationCtx } from "./_generated/server";
import { packModules, packScenarios } from "./content/australiaPack";
import { examModules, examScenarios } from "./content/examsPack";

/**
 * Inserts the Australia content pack. Insert-only: existing modules and
 * scenarios (including admin edits) are left untouched.
 * `npx convex run content:seedAustraliaPack '{"dryRun":true}'`
 */
type PackModule = (typeof packModules)[number] | (typeof examModules)[number];
type PackScenario = (typeof packScenarios)[number] | (typeof examScenarios)[number];

async function seedPack(
  ctx: MutationCtx,
  modules: readonly PackModule[],
  scenarios: readonly PackScenario[],
  dryRun: boolean,
) {
    const inserted = { modules: [] as string[], scenarios: [] as string[] };
    const args = { dryRun };

    for (const learningModule of modules) {
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

    for (const scenario of scenarios) {
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
}

export const seedAustraliaPack = internalMutation({
  args: { dryRun: v.boolean() },
  handler: async (ctx, args) => seedPack(ctx, packModules, packScenarios, args.dryRun),
});

/**
 * Exam practice modules (OET, IELTS, AMC, NMBA OSCE, US medical interpreter oral).
 * `npx convex run content:seedExamPack '{"dryRun":true}'`
 */
export const seedExamPack = internalMutation({
  args: { dryRun: v.boolean() },
  handler: async (ctx, args) => seedPack(ctx, examModules, examScenarios, args.dryRun),
});
