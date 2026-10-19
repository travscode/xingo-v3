import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { seedUser, setup } from "./setup.helpers";
import { buildEnhancePrompt, cleanEnhancement, type EnhanceContext, type EnhanceDraft } from "../../lib/content-enhance";

const blank = { name: "", role: "", demeanor: "", goal: "", openingLine: "", endCondition: "", instructions: "" };

const draft: EnhanceDraft = {
  title: "Customer wants to switch to iOS",
  description: "",
  interpreterRole: "Community interpreter",
  learnerRole: "Salesperson",
  taskCard: "",
  briefing: "",
  assessmentFocus: ["Trade-in value"],
  expectedSkills: [],
  professional: { ...blank, role: "Customer", goal: "Wants an iPhone" },
  client: { ...blank, role: "Unused" },
};

const roleplay: EnhanceContext = {
  courseTitle: "iPhone sales",
  courseDescription: "",
  practiceType: "roleplay",
  hasClient: false,
  difficultyLevel: "intermediate",
};

describe("enhance with AI", () => {
  test("keeps the author's text when the model returns blanks, and never touches unused fields", () => {
    const { draft: next } = cleanEnhancement(
      {
        title: "  ",
        description: "A long-time Android user asks about switching.",
        interpreterRole: "Changed",
        taskCard: "You are a salesperson.",
        assessmentFocus: ["Trade-in value", "trade-in value", "Data transfer"],
        expectedSkills: [],
        professional: { role: "", goal: "Wants to keep their photos", name: "Priya Shah" },
        client: { role: "Should be ignored" },
        summary: "Added detail.",
      },
      draft,
      roleplay,
    );

    expect(next.title).toBe(draft.title);
    expect(next.description).toBe("A long-time Android user asks about switching.");
    expect(next.interpreterRole).toBe("Community interpreter");
    expect(next.taskCard).toBe("You are a salesperson.");
    expect(next.assessmentFocus).toEqual(["Trade-in value", "Data transfer"]);
    expect(next.professional.role).toBe("Customer");
    expect(next.professional.name).toBe("Priya Shah");
    expect(next.client).toEqual(draft.client);
  });

  test("prompt explains the role-play format and includes the draft", () => {
    const { system, user } = buildEnhancePrompt(draft, roleplay);
    expect(system).toContain("role-play");
    expect(user).toContain("Customer wants to switch to iOS");
  });

  test("only platform admins can call it", async () => {
    const t = setup();
    const asLearner = await seedUser(t, "learner");
    await expect(
      asLearner.action(api.contentActions.enhanceDialogueAdmin, {
        moduleId: "m",
        context: roleplay,
        draft,
      }),
    ).rejects.toThrow("Not authorized");
  });
});
