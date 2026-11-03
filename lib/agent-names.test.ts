import { describe, expect, test } from "vitest";
import {
  NAME_BANK,
  NAME_BANK_LANGUAGES,
  genderForVoice,
  languagesNameSuits,
  localizeScenarioNames,
  nameForLanguage,
  suggestLocalizedNames,
} from "./agent-names";
import { practiceLanguages } from "./languages";

const scenario = {
  id: "ccl-visa",
  moduleId: "naati-certification-practice-ccl",
  title: "Visa document check with Ana",
  description: "Karen Lee checks Ana Torres's documents.",
  aiAgentA: {
    name: "Karen Lee",
    role: "Migration Agent",
    voice: "coral",
    language: "English",
    goal: "Check Ana's evidence. Ask Ms Torres about the lease.",
  },
  aiAgentB: {
    name: "Ana Torres",
    role: "Applicant",
    voice: "shimmer",
    language: "Spanish",
    goal: "Get the visa. Karen will ask questions.",
    openingLine: "Hola, soy Ana Torres.",
    localizedNames: [
      { language: "German", name: "Petra Richter" },
      { language: "Spanish", name: "Ana Torres" },
    ],
  },
  practiceRuntime: { briefing: "Interpret for Ana and Karen.", sourceLanguage: "English", targetLanguage: "Spanish" },
};

describe("per-language character names (D-045)", () => {
  test("the bank covers every practice language with ten names per gender", () => {
    for (const language of practiceLanguages) {
      expect(NAME_BANK_LANGUAGES).toContain(language.name);
    }
    for (const language of NAME_BANK_LANGUAGES) {
      for (const gender of ["female", "male"] as const) {
        const names = NAME_BANK[language][gender];
        expect(names, `${language} ${gender}`).toHaveLength(10);
        expect(new Set(names).size, `${language} ${gender} duplicates`).toBe(10);
        for (const name of names) expect(name.split(/\s+/), name).toHaveLength(2);
      }
    }
  });

  test("a character uses the name for the session's language, else the authored one", () => {
    expect(nameForLanguage(scenario.aiAgentB, "german")).toBe("Petra Richter");
    expect(nameForLanguage(scenario.aiAgentB, "Arabic")).toBe("Ana Torres");
    expect(nameForLanguage(scenario.aiAgentA, "German")).toBe("Karen Lee");
  });

  test("the scenario text follows the swap: full name, given name and family name", () => {
    const german = localizeScenarioNames(scenario, "German");
    expect(german.aiAgentB.name).toBe("Petra Richter");
    expect(german.title).toBe("Visa document check with Petra");
    expect(german.description).toBe("Karen Lee checks Petra Richter's documents.");
    expect(german.aiAgentA.goal).toBe("Check Petra's evidence. Ask Ms Richter about the lease.");
    expect(german.practiceRuntime.briefing).toBe("Interpret for Petra and Karen.");
    // The professional and settings are untouched.
    expect(german.aiAgentA.name).toBe("Karen Lee");
    expect(german.aiAgentB.language).toBe("Spanish");
    expect(german.id).toBe("ccl-visa");
  });

  test("English sessions and languages without a name leave the scenario as written", () => {
    expect(localizeScenarioNames(scenario, "English")).toBe(scenario);
    expect(localizeScenarioNames(scenario, "Arabic")).toBe(scenario);
    expect(localizeScenarioNames(scenario, undefined)).toBe(scenario);
  });

  test("a name part shared with the other character isn't swapped", () => {
    const shared = {
      ...scenario,
      aiAgentA: { ...scenario.aiAgentA, name: "Ana Lee", goal: "Ana Lee asks Ana Torres questions." },
    };
    const german = localizeScenarioNames(shared, "German");
    expect(german.aiAgentA.goal).toBe("Ana Lee asks Petra Richter questions.");
  });

  test("suggestions follow the voice's gender and keep a name where it already fits", () => {
    expect(genderForVoice("shimmer")).toBe("female");
    expect(genderForVoice("cedar")).toBe("male");
    expect(genderForVoice("alloy")).toBeNull();
    expect(languagesNameSuits("Ana Torres")).toEqual(["Spanish"]);
    expect(languagesNameSuits("Wei Zhang")).toEqual(["Mandarin"]);

    const names = suggestLocalizedNames("female", 0, { name: "Ana Torres", languages: ["Spanish"] });
    expect(names.find((entry) => entry.language === "Spanish")?.name).toBe("Ana Torres");
    expect(names.find((entry) => entry.language === "German")?.name).toBe(NAME_BANK.German.female[0]);
    expect(names.find((entry) => entry.language === "Greek")?.name).toBe("Eleni Papadopoulou");
    expect(suggestLocalizedNames("male", 3).find((entry) => entry.language === "Greek")?.name).toBe(NAME_BANK.Greek.male[3]);
  });
});
