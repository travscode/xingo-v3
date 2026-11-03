import { describe, expect, test } from "vitest";
import { internal } from "../_generated/api";
import { setup } from "./setup.helpers";

describe("applyLocalizedNames (D-045)", () => {
  test("names every client in XINGO courses, leaving professionals, role-plays and community courses alone", async () => {
    const t = setup();
    await t.run(async (ctx) => {
      for (const [id, source] of [["ccl", undefined], ["rp-community", "community"]] as const) {
        await ctx.db.insert("modules", {
          id,
          title: id,
          description: "",
          industryCategory: "community",
          durationMinutes: 10,
          difficultyLevel: "beginner",
          learningObjectives: [],
          isFree: false,
          isAccredited: false,
          badgeIcon: "",
          createdAt: "2026-01-01T00:00:00.000Z",
          ...(source ? { source } : {}),
        });
      }
      const base = { description: "", expectedSkills: [], difficultyLevel: "beginner" as const };
      const pro = { name: "Karen Lee", role: "Agent", voice: "coral", goal: "Ask", language: "English" };
      await ctx.db.insert("scenarios", {
        ...base, id: "ccl-1", moduleId: "ccl", title: "One",
        aiAgentA: pro, aiAgentB: { name: "Ana Torres", role: "Client", voice: "shimmer", goal: "Visa", language: "Spanish" },
      });
      await ctx.db.insert("scenarios", {
        ...base, id: "ccl-2", moduleId: "ccl", title: "Two",
        aiAgentA: pro, aiAgentB: { name: "Wei Zhang", role: "Client", voice: "verse", goal: "Loan", language: "Spanish" },
      });
      await ctx.db.insert("scenarios", {
        ...base, id: "ccl-3", moduleId: "ccl", title: "Three",
        aiAgentA: pro, aiAgentB: { name: "Rosa Diaz", role: "Client", voice: "sage", goal: "Refund", language: "Spanish" },
      });
      await ctx.db.insert("scenarios", {
        ...base, id: "rp-community-1", moduleId: "rp-community", title: "Community",
        aiAgentA: { name: "Jo", role: "Customer", voice: "coral", goal: "Ask", language: "Spanish" },
      });
    });

    const dry = await t.mutation(internal.migrations.applyLocalizedNames, { dryRun: true });
    expect(dry.updatedCount).toBe(3);
    expect(await t.run(async (ctx) => (await ctx.db.query("scenarios").collect()).some((s) => s.aiAgentB?.localizedNames))).toBe(false);

    await t.mutation(internal.migrations.applyLocalizedNames, { dryRun: false });
    const rows = await t.run((ctx) => ctx.db.query("scenarios").collect());
    const byId = Object.fromEntries(rows.map((row) => [row.id, row]));
    const name = (id: string, language: string) => byId[id].aiAgentB?.localizedNames?.find((entry) => entry.language === language)?.name;

    expect(name("ccl-1", "Spanish")).toBe("Ana Torres");
    expect(name("ccl-2", "Mandarin")).toBe("Wei Zhang");
    expect(name("ccl-2", "Spanish")).not.toBe("Wei Zhang");
    // Two women in one course get different names.
    expect(name("ccl-1", "German")).not.toBe(name("ccl-3", "German"));
    expect(byId["ccl-1"].aiAgentA.localizedNames).toBeUndefined();
    expect(byId["rp-community-1"].aiAgentA.localizedNames).toBeUndefined();

    // Running again keeps what's there.
    const again = await t.mutation(internal.migrations.applyLocalizedNames, { dryRun: false });
    expect(again.updatedCount).toBe(0);
  });
});
