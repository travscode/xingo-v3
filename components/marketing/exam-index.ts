import type { FlagCountry } from "@/components/marketing/flag";
import type { PersonKey } from "@/components/marketing/people";
import { examPages, type ExamPage } from "@/lib/exam-pages";
import { rubricForModule, rubrics, type Rubric } from "@/lib/rubrics";
import { CCL_MAX_SCORE, CCL_PASS_SCORE } from "@/lib/scoring";

/*
 * Everything the /exams index shows, in one list. Facts restate lib/exam-pages.ts,
 * the NAATI pages and lib/rubrics.ts — don't add numbers here that aren't there.
 */

export type ExamKind = "Interpreting test" | "Speaking exam" | "Clinical exam";

export type ExamIndexEntry = {
  href: string;
  shortName: string;
  fullName: string;
  country: FlagCountry;
  kind: ExamKind;
  /** Who usually sits it. */
  audience: string;
  summary: string;
  /** Who you talk to in XINGO practice (portraits + words). */
  partners: { people: readonly PersonKey[]; label: string };
  /** Two short "at a glance" facts from the exam data. */
  glance: Array<{ label: string; value: string }>;
};

function practiceScore(rubric: Rubric) {
  const { max, note } = rubric.display(rubric.passScore);
  return note === "Estimated band" ? `Estimated band out of ${max}` : `Out of ${max}`;
}

function fromExamPage(
  page: ExamPage,
  extra: Pick<ExamIndexEntry, "kind" | "audience" | "partners"> & { format: string },
): ExamIndexEntry {
  return {
    href: `/exams/${page.slug}`,
    shortName: page.shortName,
    fullName: page.fullName,
    country: page.region,
    kind: extra.kind,
    audience: extra.audience,
    summary: page.intro,
    partners: extra.partners,
    glance: [
      { label: "Format", value: extra.format },
      { label: "XINGO practice score", value: practiceScore(rubricForModule(page.moduleId)) },
    ],
  };
}

const bySlug = new Map(examPages.map((page) => [page.slug, page]));

function page(slug: string) {
  const found = bySlug.get(slug);
  if (!found) throw new Error(`Unknown exam page: ${slug}`);
  return found;
}

export const examIndex: ExamIndexEntry[] = [
  {
    href: "/naati/ccl",
    shortName: "NAATI CCL",
    fullName: "Credentialed Community Language test",
    country: "Australia",
    kind: "Interpreting test",
    audience: "Bilingual people who want the CCL credential, often for Australian migration points.",
    summary:
      "Two dialogues between an English speaker and a speaker of your other language, in a community setting. You interpret short segments both ways.",
    partners: { people: ["drKim", "mei"], label: "An English speaker and a speaker of your language" },
    glance: [
      { label: "Format", value: "Two dialogues, short segments" },
      { label: "XINGO practice score", value: `Out of ${CCL_MAX_SCORE}, pass mark ${CCL_PASS_SCORE}` },
    ],
  },
  {
    href: "/naati/cpi",
    shortName: "NAATI CPI",
    fullName: "Certified Provisional Interpreter test",
    country: "Australia",
    kind: "Interpreting test",
    audience: "Interpreters working towards NAATI certification.",
    summary:
      "Live role-plays with an English speaker, a speaker of your language and you in the middle, across community, health and legal settings.",
    partners: { people: ["lawyer", "mei"], label: "An English speaker and a speaker of your language" },
    glance: [
      { label: "Format", value: "Live role-plays, face-to-face and remote" },
      { label: "XINGO practice score", value: practiceScore(rubrics.interpreting) },
    ],
  },
  fromExamPage(page("oet-speaking"), {
    kind: "Speaking exam",
    audience: "Nurses and doctors who need an English test for registration.",
    partners: { people: ["jp", "mei"], label: "A patient, relative or carer" },
    format: "Two role-plays, about 5 minutes each",
  }),
  fromExamPage(page("ielts-speaking"), {
    kind: "Speaking exam",
    audience: "Anyone who needs a speaking score for study, work or a visa.",
    partners: { people: ["examiner"], label: "An examiner" },
    format: "Three parts, 11–14 minutes",
  }),
  fromExamPage(page("amc-clinical-exam"), {
    kind: "Clinical exam",
    audience: "Overseas-trained doctors seeking registration in Australia.",
    partners: { people: ["mei", "jp"], label: "A simulated patient or relative" },
    format: "16 assessed stations, 8 minutes each",
  }),
  fromExamPage(page("nmba-osce"), {
    kind: "Clinical exam",
    audience: "Internationally qualified nurses seeking registration in Australia.",
    partners: { people: ["drKim", "mei", "jp"], label: "Patients, relatives and doctors" },
    format: "10 stations, 8 minutes each",
  }),
  fromExamPage(page("cmi-oral-exam"), {
    kind: "Interpreting test",
    audience: "Medical interpreters seeking national certification in the US.",
    partners: { people: ["drKim", "jp"], label: "A clinician and a patient" },
    format: "Short consecutive role-plays, both directions",
  }),
  fromExamPage(page("cchi-oral-exam"), {
    kind: "Interpreting test",
    audience: "Healthcare interpreters seeking national certification in the US.",
    partners: { people: ["nurse", "mei"], label: "A provider and a patient" },
    format: "Consecutive dialogue vignettes, both directions",
  }),
];

export const examCountries: Array<{ country: FlagCountry; description: string }> = [
  {
    country: "Australia",
    description: "NAATI interpreting tests, plus English and clinical exams for health professionals.",
  },
  {
    country: "United States",
    description: "Oral exams for national medical interpreter certification.",
  },
];

/** Exams grouped by country, in the order of examCountries. */
export function examsByCountry() {
  return examCountries
    .map((group) => ({ ...group, exams: examIndex.filter((exam) => exam.country === group.country) }))
    .filter((group) => group.exams.length > 0);
}
