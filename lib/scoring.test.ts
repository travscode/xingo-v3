import { describe, expect, test } from "vitest";
import { applyCompletion, resolveEndReason } from "./scoring";
import { scenarioTimeLimitMinutes } from "./plans";

describe("completion-aware scoring", () => {
  test("a finished session keeps its score", () => {
    expect(applyCompletion(82, { reachedEnd: true, coveragePercent: 100 })).toBe(82);
  });

  test("an unfinished session is scaled by how much was covered", () => {
    expect(applyCompletion(80, { reachedEnd: false, coveragePercent: 50 })).toBe(40);
    expect(applyCompletion(80, { reachedEnd: false, coveragePercent: 0 })).toBe(0);
    expect(applyCompletion(80, { reachedEnd: false, coveragePercent: 140 })).toBe(80);
  });
});

describe("end reasons", () => {
  const clock = { timeLimitMs: 600_000, allowedMs: 1_800_000 };

  test("time_up only when the clock agrees", () => {
    expect(resolveEndReason("time_up", { ...clock, elapsedMs: 120_000 })).toBe("learner_finished");
    expect(resolveEndReason("time_up", { ...clock, elapsedMs: 598_000 })).toBe("time_up");
    expect(resolveEndReason("learner_finished", { ...clock, elapsedMs: 600_000 })).toBe("time_up");
  });

  test("objective and stall claims pass through for the grader to check", () => {
    expect(resolveEndReason("objective_met", { ...clock, elapsedMs: 300_000 })).toBe("objective_met");
    expect(resolveEndReason("stalled", { ...clock, elapsedMs: 300_000 })).toBe("stalled");
    expect(resolveEndReason(undefined, { ...clock, elapsedMs: 300_000 })).toBe("learner_finished");
  });

  test("running out of minutes before the limit is its own reason", () => {
    expect(resolveEndReason("time_up", { timeLimitMs: 600_000, allowedMs: 300_000, elapsedMs: 300_000 })).toBe(
      "out_of_minutes",
    );
  });
});

describe("time limits", () => {
  test("scenarios without a limit get a default by type", () => {
    expect(scenarioTimeLimitMinutes({ agentCount: 2, aiAgentB: {}, practiceRuntime: {} })).toBe(12);
    expect(scenarioTimeLimitMinutes({ agentCount: 1 })).toBe(10);
    expect(scenarioTimeLimitMinutes({ practiceRuntime: { practiceType: "roleplay" } })).toBe(10);
  });

  test("authored limits win but never exceed the per-attempt cap", () => {
    expect(scenarioTimeLimitMinutes({ practiceRuntime: { practiceType: "roleplay", timeLimitMinutes: 5 } })).toBe(5);
    expect(scenarioTimeLimitMinutes({ practiceRuntime: { timeLimitMinutes: 90 } })).toBe(30);
  });
});
