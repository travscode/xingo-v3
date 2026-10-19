/**
 * The Australian skilled migration points table (subclasses 189, 190 and 491), as
 * published by Home Affairs. Powers the points estimator on
 * /migrate-to-australia/skilled-migration-points-test (docs/seo.md).
 *
 * Framework-free and display-only: XINGO never awards or checks points. Values were
 * checked against the Home Affairs 189 points table (page last updated 11 June 2026)
 * on POINTS_TABLE_CHECKED. Re-check before changing copy that quotes them.
 */

export const POINTS_TABLE_CHECKED = "2026-10-19";
export const POINTS_TABLE_SOURCE =
  "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189/points-table";

/** Home Affairs: you need at least this many points to be invited. */
export const POINTS_PASS_MARK = 65;
/** Overseas and Australian skilled employment combined are capped at this. */
export const EMPLOYMENT_POINTS_CAP = 20;
/** Credentialled community language (e.g. a NAATI CCL credential). */
export const COMMUNITY_LANGUAGE_POINTS = 5;

export type PointsOption = { value: string; label: string; points: number };

export type PointsFactor = {
  id: string;
  label: string;
  hint?: string;
  options: PointsOption[];
};

const yesNo = (points: number, yes: string): PointsOption[] => [
  { value: "no", label: "No", points: 0 },
  { value: "yes", label: yes, points },
];

export const visaOptions: PointsOption[] = [
  { value: "189", label: "Skilled Independent (189)", points: 0 },
  { value: "190", label: "Skilled Nominated (190), state nomination", points: 5 },
  { value: "491", label: "Skilled Work Regional (491), nomination or sponsorship", points: 15 },
];

export const pointsFactors: PointsFactor[] = [
  {
    id: "age",
    label: "Age when invited",
    options: [
      { value: "18-24", label: "18 to 24", points: 25 },
      { value: "25-32", label: "25 to 32", points: 30 },
      { value: "33-39", label: "33 to 39", points: 25 },
      { value: "40-44", label: "40 to 44", points: 15 },
    ],
  },
  {
    id: "english",
    label: "English",
    hint: "Your lowest component score decides your level.",
    options: [
      { value: "competent", label: "Competent English", points: 0 },
      { value: "proficient", label: "Proficient English", points: 10 },
      { value: "superior", label: "Superior English", points: 20 },
    ],
  },
  {
    id: "overseasWork",
    label: "Skilled work outside Australia (last 10 years)",
    options: [
      { value: "0", label: "Less than 3 years", points: 0 },
      { value: "3", label: "3 to under 5 years", points: 5 },
      { value: "5", label: "5 to under 8 years", points: 10 },
      { value: "8", label: "8 years or more", points: 15 },
    ],
  },
  {
    id: "australianWork",
    label: "Skilled work in Australia (last 10 years)",
    options: [
      { value: "0", label: "Less than 1 year", points: 0 },
      { value: "1", label: "1 to under 3 years", points: 5 },
      { value: "3", label: "3 to under 5 years", points: 10 },
      { value: "5", label: "5 to under 8 years", points: 15 },
      { value: "8", label: "8 years or more", points: 20 },
    ],
  },
  {
    id: "qualification",
    label: "Highest qualification",
    options: [
      { value: "none", label: "None of these", points: 0 },
      { value: "award", label: "Award recognised by your assessing authority", points: 10 },
      { value: "diploma", label: "Australian diploma or trade qualification", points: 10 },
      { value: "bachelor", label: "Bachelor or Masters degree", points: 15 },
      { value: "doctorate", label: "Doctorate (PhD)", points: 20 },
    ],
  },
  {
    id: "specialist",
    label: "Australian Masters by research or PhD in a STEM field",
    options: yesNo(10, "Yes"),
  },
  { id: "australianStudy", label: "Meets the Australian study requirement", options: yesNo(5, "Yes") },
  { id: "professionalYear", label: "Professional Year in Australia", options: yesNo(5, "Yes") },
  {
    id: "communityLanguage",
    label: "Credentialled community language (NAATI)",
    hint: "For example, a pass in the NAATI CCL test.",
    options: yesNo(COMMUNITY_LANGUAGE_POINTS, "Yes"),
  },
  { id: "regionalStudy", label: "Study in regional Australia", options: yesNo(5, "Yes") },
  {
    id: "partner",
    label: "Partner",
    options: [
      { value: "none", label: "Partner applying, doesn't meet these", points: 0 },
      { value: "single", label: "Single, or partner is a citizen or PR", points: 10 },
      { value: "skilled", label: "Skilled partner (English + skills assessment)", points: 10 },
      { value: "english", label: "Partner has competent English only", points: 5 },
    ],
  },
];

export type PointsSelection = Record<string, string>;

function pointsFor(options: PointsOption[], value: string | undefined) {
  return options.find((option) => option.value === value)?.points ?? 0;
}

/** Estimated total for a selection, applying the employment cap. */
export function estimatePoints(selection: PointsSelection) {
  let employment = 0;
  let total = pointsFor(visaOptions, selection.visa);

  for (const factor of pointsFactors) {
    const points = pointsFor(factor.options, selection[factor.id]);
    if (factor.id === "overseasWork" || factor.id === "australianWork") employment += points;
    else total += points;
  }

  return total + Math.min(employment, EMPLOYMENT_POINTS_CAP);
}

/** A sensible starting point: the first option of every factor. */
export function defaultSelection(): PointsSelection {
  return Object.fromEntries([
    ["visa", visaOptions[0].value],
    ...pointsFactors.map((factor) => [factor.id, factor.options[0].value]),
  ]);
}
