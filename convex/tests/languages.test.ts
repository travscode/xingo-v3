import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { seedCatalog, seedUser, setup } from "./setup.helpers";
import { buildGradingPrompt } from "../model/grading";

const spanish = { sourceLanguage: "English", targetLanguage: "Spanish" };
const arabic = { sourceLanguage: "English", targetLanguage: "Arabic" };

async function scored(t: ReturnType<typeof setup>, clerkId: string, id: string, score: number, pair?: { sourceLanguage: string; targetLanguage: string }) {
  await t.run(async (ctx) => {
    await ctx.db.insert("sessions", {
      id,
      clerkId,
      moduleId: "free-mod",
      scenarioId: "free-scn",
      durationMinutes: 6,
      durationSeconds: 360,
      score,
      completionStatus: "completed",
      transcriptSummary: "",
      timestamp: `2026-10-0${id.slice(-1)}T10:00:00.000Z`,
      ...pair,
    });
  });
}

describe("progress per language pair", () => {
  test("scores, history and passes only count the selected pair", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "polyglot", { languagePreferences: [spanish] });
    await scored(t, "polyglot", "a1", 85, spanish);
    await scored(t, "polyglot", "a2", 40, arabic);
    // Recorded before pairs were saved: counts towards the learner's main pair (Spanish).
    await scored(t, "polyglot", "a3", 75);

    const spanishMetrics = await asUser.query(api.sessions.metricsForCurrentUser, { pair: spanish });
    expect(spanishMetrics.averageScore).toBe(80);
    const arabicMetrics = await asUser.query(api.sessions.metricsForCurrentUser, { pair: arabic });
    expect(arabicMetrics.averageScore).toBe(40);
    const french = await asUser.query(api.sessions.metricsForCurrentUser, { pair: { sourceLanguage: "English", targetLanguage: "French" } });
    expect(french.averageScore).toBe(0);
    expect(await asUser.query(api.sessions.listForCurrentUser, { pair: { sourceLanguage: "english", targetLanguage: "FRENCH" } })).toEqual([]);

    const catalog = await asUser.query(api.catalog.forCurrentUser, { pair: arabic });
    const scenario = catalog.modules.flatMap((m) => m.scenarios).find((s) => s.id === "free-scn");
    expect(scenario?.stats).toMatchObject({ attempts: 1, bestScore: 40 });

    const summary = await asUser.query(api.sessions.languageSummaryForCurrentUser, {});
    expect(summary.map((row) => [row.targetLanguage, row.sessions, row.averageScore])).toEqual([
      ["Spanish", 2, 80],
      ["Arabic", 1, 40],
    ]);
  });

  test("one-on-one sessions record the language spoken, and grading uses it", async () => {
    const t = setup();
    await seedCatalog(t);
    const asUser = await seedUser(t, "solo");
    const { attemptId } = await asUser.mutation(api.practice.startAttempt, { scenarioId: "free-scn", ...spanish, spokenLanguage: "Spanish" });
    const session = await t.run((ctx) => ctx.db.query("sessions").withIndex("by_public_id", (q) => q.eq("id", attemptId)).unique());
    expect(session).toMatchObject({ sourceLanguage: "English", targetLanguage: "Spanish", spokenLanguage: "Spanish" });

    const prompt = buildGradingPrompt(
      {
        title: "Coffee order",
        description: "",
        moduleId: "rp-coffee",
        aiAgentA: { role: "Barista", goal: "Take the order" },
        practiceRuntime: {
          interpreterRole: "",
          briefing: "",
          assessmentFocus: [],
          practiceType: "roleplay",
          learnerRole: "Customer",
        },
        expectedSkills: [],
      },
      { ...spanish, spokenLanguage: "Spanish" },
      [],
    );
    expect(prompt).toContain("speaks Spanish throughout");
    expect(prompt).toContain("judge their Spanish");
  });
});
