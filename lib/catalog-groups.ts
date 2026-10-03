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
