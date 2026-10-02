/**
 * What a learner is preparing for. Chosen in the welcome flow; drives which
 * module the app recommends first.
 */
export const practiceGoals = [
  {
    id: "oet",
    kind: "speaking",
    label: "OET Speaking",
    description: "Nurse or doctor role-plays for AHPRA registration.",
    moduleOrder: ["oet-speaking-nursing", "oet-speaking-medicine"],
  },
  {
    id: "ielts",
    kind: "speaking",
    label: "IELTS Speaking",
    description: "Mock speaking tests with an estimated band.",
    moduleOrder: ["ielts-speaking"],
  },
  {
    id: "amc",
    kind: "speaking",
    label: "AMC Clinical Exam",
    description: "Eight-minute stations for international medical graduates.",
    moduleOrder: ["amc-clinical-exam", "oet-speaking-medicine"],
  },
  {
    id: "nmba_osce",
    kind: "speaking",
    label: "NMBA OSCE (overseas-qualified nurses)",
    description: "ISBAR, handover, education and consent stations.",
    moduleOrder: ["nmba-osce-nursing", "oet-speaking-nursing"],
  },
  {
    id: "us_medical_oral",
    kind: "interpreting",
    label: "US medical interpreter oral exam (CMI / CHI)",
    description: "Short, fast consecutive medical role-plays.",
    moduleOrder: ["us-medical-interpreter-oral", "medical-er-intake"],
  },
  {
    id: "naati_ccl",
    kind: "interpreting",
    label: "NAATI CCL test",
    description: "Short two-way dialogues, scored out of 90.",
    moduleOrder: ["naati-certification-practice-ccl", "community-services", "naati-certification-practice-cpi"],
  },
  {
    id: "naati_cpi",
    kind: "interpreting",
    label: "NAATI Certified Provisional Interpreter",
    description: "Longer community and health dialogues.",
    moduleOrder: ["naati-certification-practice-cpi", "telephone-interpreting", "naati-certification-practice-ccl", "medical-er-intake"],
  },
  {
    id: "medical",
    kind: "interpreting",
    label: "Medical interpreting",
    description: "Hospitals, clinics, emergency intake.",
    moduleOrder: ["medical-er-intake", "community-services"],
  },
  {
    id: "ndis",
    kind: "interpreting",
    label: "NDIS & disability services",
    description: "Planning meetings, reviews and support visits.",
    moduleOrder: ["ndis-disability-services", "telephone-interpreting", "community-services"],
  },
  {
    id: "legal",
    kind: "interpreting",
    label: "Legal & immigration",
    description: "Courts, hearings, visa interviews.",
    moduleOrder: ["courtroom-hearings", "immigration-interviews"],
  },
  {
    id: "general",
    kind: "interpreting",
    label: "General practice",
    description: "Build confidence across everyday settings.",
    moduleOrder: ["community-services", "medical-er-intake"],
  },
] as const;

export type PracticeGoalId = (typeof practiceGoals)[number]["id"];

/** English-only speaking exams don't need a second language. */
export function isSpeakingGoal(goalId: string | null | undefined) {
  return practiceGoals.find((goal) => goal.id === goalId)?.kind === "speaking";
}

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
