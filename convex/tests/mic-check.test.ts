import { describe, expect, test } from "vitest";
import { buildRealtimeAgentInstructions, buildRoleplayInstructions } from "../../lib/ai";
import { judgeHeldTurn, MIN_HOLD_MS, MIN_VOICED_MS } from "../../lib/mic-check";
import type { Scenario, VoiceAgent } from "../../types/scenario";

describe("judgeHeldTurn (D-050)", () => {
  test("a click on the talk button is not a turn, even with sound", () => {
    expect(judgeHeldTurn({ heldMs: MIN_HOLD_MS - 1, voicedMs: MIN_HOLD_MS })).toBe("too_short");
  });

  test("a held turn with no sound is silent", () => {
    expect(judgeHeldTurn({ heldMs: 5_000, voicedMs: 0 })).toBe("silent");
    expect(judgeHeldTurn({ heldMs: 5_000, voicedMs: MIN_VOICED_MS - 1 })).toBe("silent");
  });

  test("a short spoken answer is sent", () => {
    expect(judgeHeldTurn({ heldMs: MIN_HOLD_MS, voicedMs: MIN_VOICED_MS })).toBe("send");
  });

  test("a turn is still sent when the mic can't be measured", () => {
    expect(judgeHeldTurn({ heldMs: 5_000, voicedMs: null })).toBe("send");
  });
});

describe("agent prompts when the learner isn't heard (D-050)", () => {
  const customer = { name: "Rosalie", role: "customer", language: "Filipino", goal: "Get a refund", demeanor: "Polite" } as VoiceAgent;
  const manager = { name: "Olivia", role: "Store Manager", language: "English", goal: "Check the receipt", demeanor: "Firm" } as VoiceAgent;
  const scenario = { title: "Refund", description: "A refund", practiceRuntime: {} } as Scenario;

  test("interpreting agents ask for a repeat and keep to their own side", () => {
    const prompt = buildRealtimeAgentInstructions({
      scenario,
      agent: customer,
      authoredLanguage: "Spanish",
      counterpart: manager,
      isProfessional: false,
    });
    expect(prompt).toContain("never answer your own question");
    expect(prompt).toContain("Never ask Olivia's questions");
  });

  test("role-play agents ask for a repeat too", () => {
    expect(buildRoleplayInstructions({ scenario, agent: manager })).toContain("never answer your own question");
  });
});
