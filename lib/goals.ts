/**
 * What a learner is preparing for. Chosen in the welcome flow; drives which
 * module the app recommends first.
 */
export const practiceGoals = [
  {
    id: "naati_ccl",
    label: "NAATI CCL test",
    description: "Short two-way dialogues, scored out of 90.",
    moduleOrder: ["naati-certification-practice-ccl", "community-services", "naati-certification-practice-cpi"],
  },
  {
    id: "naati_cpi",
    label: "NAATI Certified Provisional Interpreter",
    description: "Longer community and health dialogues.",
    moduleOrder: ["naati-certification-practice-cpi", "naati-certification-practice-ccl", "medical-er-intake"],
  },
  {
    id: "medical",
    label: "Medical interpreting",
    description: "Hospitals, clinics, emergency intake.",
    moduleOrder: ["medical-er-intake", "community-services"],
  },
  {
    id: "legal",
    label: "Legal & immigration",
    description: "Courts, hearings, visa interviews.",
    moduleOrder: ["courtroom-hearings", "immigration-interviews"],
  },
  {
    id: "general",
    label: "General practice",
    description: "Build confidence across everyday settings.",
    moduleOrder: ["community-services", "medical-er-intake"],
  },
] as const;

export type PracticeGoalId = (typeof practiceGoals)[number]["id"];

export function getGoal(goalId: string | undefined) {
  return practiceGoals.find((goal) => goal.id === goalId) ?? null;
}

/** Orders module ids so the learner's goal modules come first. */
export function orderModulesForGoal<T extends { id: string; createdAt: string }>(
  modules: T[],
  goalId: string | undefined,
) {
  const order: readonly string[] = getGoal(goalId)?.moduleOrder ?? [];
  const rank = (id: string) => {
    const index = order.indexOf(id);
    return index === -1 ? order.length : index;
  };

  return [...modules].sort(
    (a, b) => rank(a.id) - rank(b.id) || a.createdAt.localeCompare(b.createdAt),
  );
}
