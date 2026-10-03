import { getGoal } from "./goals";

/**
 * How the practice library groups modules. Modules not listed fall back to a
 * group by industry. Order here is the order of the category carousel.
 */
export const libraryGroups = [
  { id: "naati", label: "NAATI tests", modules: ["naati-certification-practice-ccl", "naati-certification-practice-cpi", "telephone-interpreting"] },
  { id: "english", label: "English exams", modules: ["oet-speaking-nursing", "oet-speaking-medicine", "ielts-speaking"] },
  { id: "clinical", label: "Clinical exams", modules: ["amc-clinical-exam", "nmba-osce-nursing"] },
  { id: "medical", label: "Medical interpreting", modules: ["medical-er-intake"] },
  { id: "legal", label: "Legal & immigration", modules: ["courtroom-hearings", "immigration-interviews"] },
  { id: "community", label: "Community & NDIS", modules: ["community-services", "ndis-disability-services"] },
  { id: "us", label: "US certification", modules: ["us-medical-interpreter-oral"] },
] as const;

export type LibraryGroupId = (typeof libraryGroups)[number]["id"] | "for-you" | "all";

const fallbackByIndustry: Record<string, LibraryGroupId> = {
  medical: "medical",
  legal: "legal",
  immigration: "legal",
  community: "community",
  business: "community",
};

export function groupForModule(moduleId: string, industryCategory: string): LibraryGroupId {
  const group = libraryGroups.find((item) => (item.modules as readonly string[]).includes(moduleId));
  return group?.id ?? fallbackByIndustry[industryCategory] ?? "community";
}

/** Modules matching the learner's goal or already practised. */
export function isForYou(moduleId: string, attemptCount: number, practiceGoal: string | null) {
  const goalModules: readonly string[] = getGoal(practiceGoal ?? undefined)?.moduleOrder ?? [];
  return attemptCount > 0 || goalModules.includes(moduleId);
}

/** Modules that prepare for a specific test; everything else is skills training. */
const examModuleIds = new Set<string>([
  "naati-certification-practice-ccl",
  "naati-certification-practice-cpi",
  "oet-speaking-nursing",
  "oet-speaking-medicine",
  "ielts-speaking",
  "amc-clinical-exam",
  "nmba-osce-nursing",
  "us-medical-interpreter-oral",
]);

export type LibraryFilterId = "free" | "exam" | "training" | "interpreting" | "roleplay" | "in-progress";

export const libraryFilters: Array<{ id: LibraryFilterId; label: string }> = [
  { id: "free", label: "Free to try" },
  { id: "exam", label: "Exam prep" },
  { id: "training", label: "Skills training" },
  { id: "interpreting", label: "Interpreting" },
  { id: "roleplay", label: "Role-play" },
  { id: "in-progress", label: "In progress" },
];

type FilterableModule = {
  id: string;
  isFree: boolean;
  practiceType: "interpreting" | "roleplay";
  attemptCount: number;
  scenarios: Array<{ isFreePreview: boolean }>;
};

export function matchesLibraryFilter(learningModule: FilterableModule, filter: LibraryFilterId) {
  switch (filter) {
    case "free":
      return learningModule.isFree || learningModule.scenarios.some((scenario) => scenario.isFreePreview);
    case "exam":
      return examModuleIds.has(learningModule.id);
    case "training":
      return !examModuleIds.has(learningModule.id);
    case "interpreting":
    case "roleplay":
      return learningModule.practiceType === filter;
    case "in-progress":
      return learningModule.attemptCount > 0;
  }
}

/**
 * Tags combine with AND, except mutually exclusive pairs (exam/training,
 * interpreting/role-play), which combine with OR.
 */
export function matchesLibraryFilters(learningModule: FilterableModule, filters: LibraryFilterId[]) {
  const groups: LibraryFilterId[][] = [["free"], ["exam", "training"], ["interpreting", "roleplay"], ["in-progress"]];

  return groups.every((group) => {
    const active = group.filter((filter) => filters.includes(filter));
    return active.length === 0 || active.some((filter) => matchesLibraryFilter(learningModule, filter));
  });
}
