import { describe, expect, test } from "vitest";
import type { TranscriptEntry } from "@/types/session";
import { deriveInterpretingSteps, taskItems, type CoachResult, type Party } from "./session-guide";

const professional: Party = { key: "agent_a", name: "Olivia", language: "English", role: "Store Manager" };
const client: Party = { key: "agent_b", name: "Elena", language: "Spanish", role: "Customer" };

let n = 0;
const say = (who: "Olivia" | "Elena", text: string): TranscriptEntry => ({
  id: `a${++n}`,
  role: "assistant",
  speaker: who,
  text,
  createdAt: new Date(2026, 0, 1, 0, 0, n).toISOString(),
});
const relay = (to: "Olivia" | "Elena", text: string): TranscriptEntry => ({
  id: `u${++n}`,
  role: "user",
  speaker: `You → ${to}`,
  text,
  createdAt: new Date(2026, 0, 1, 0, 0, n).toISOString(),
});

function steps(entries: TranscriptEntry[], results: Record<string, CoachResult> = {}) {
  return deriveInterpretingSteps({
    entries,
    completed: new Set(entries.map((e) => e.id)),
    client,
    professional,
    partyOf: (entry) => {
      const name = entry.role === "user" ? entry.speaker.replace("You → ", "") : entry.speaker;
      return name === "Olivia" ? "agent_a" : name === "Elena" ? "agent_b" : null;
    },
    results,
    ended: false,
  });
}

describe("session guide", () => {
  test("introductions, then one step per speaker turn", () => {
    const entries = [
      relay("Elena", "Hola, soy el intérprete"),
      say("Elena", "Hola"),
      relay("Olivia", "Hi, I'm the interpreter"),
      say("Olivia", "When did you buy it?"),
      relay("Elena", "¿Cuándo lo compró?"),
      say("Elena", "En mayo."),
    ];
    const result = steps(entries);
    expect(result.map((s) => s.kind)).toEqual(["intro", "intro", "segment", "segment"]);
    expect(result[0].attemptIds).toHaveLength(1);
    expect(result[2]).toMatchObject({ title: "Interpret Olivia's turn for Elena", closed: true, attemptIds: [entries[4].id] });
    expect(result[3]).toMatchObject({ closed: false, sourceText: "En mayo." });
  });

  test("a missed turn can be retried after asking the speaker to repeat", () => {
    const first = [relay("Elena", "Hola"), relay("Olivia", "Hi"), say("Olivia", "The receipt shows $799 on 3 May.")];
    const miss = relay("Elena", "El recibo dice mayo");
    const askRepeat = relay("Olivia", "Sorry, could you repeat that?");
    const repeat = say("Olivia", "The receipt shows $799 on the third of May.");
    const retry = relay("Elena", "El recibo muestra 799 dólares el 3 de mayo");
    const result = steps([...first, miss, askRepeat, repeat, retry], { [miss.id]: { verdict: "missed", tip: "Include the amount" } });
    const segments = result.filter((s) => s.kind === "segment");
    expect(segments).toHaveLength(1);
    expect(segments[0].attemptIds).toEqual([miss.id, retry.id]);
    expect(segments[0].sourceText).toContain("third of May");
  });

  test("works when both people speak the same language (English only)", () => {
    const sameClient: Party = { ...client, language: "English" };
    const entries = [relay("Elena", "Hi, I'm the interpreter"), relay("Olivia", "Hi"), say("Olivia", "Receipt?"), relay("Elena", "Do you have the receipt?")];
    const result = deriveInterpretingSteps({
      entries,
      completed: new Set(entries.map((e) => e.id)),
      client: sameClient,
      professional,
      partyOf: (entry) => ((entry.role === "user" ? entry.speaker.replace("You → ", "") : entry.speaker) === "Olivia" ? "agent_a" : "agent_b"),
      results: {},
      ended: false,
    });
    expect(result[2].attemptIds).toEqual([entries[3].id]);
  });

  test("task cards split into items", () => {
    expect(taskItems("- Find out why\n- Explain the plan\n3. Check understanding")).toEqual([
      "Find out why",
      "Explain the plan",
      "Check understanding",
    ]);
  });
});
