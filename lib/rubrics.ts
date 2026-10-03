/**
 * Scoring rubrics. Every assessment stores a 0–100 overall score and five
 * 0–100 dimension scores in fixed slots (accuracy, terminology, fluency,
 * turnManagement, professionalism). A rubric gives those slots their meaning
 * for a given kind of practice, tells the grader what to look for, and says how
 * to display the score (e.g. CCL /90, OET /500 with a grade, IELTS band /9).
 *
 * Imported by Convex (grading) and the UI (results, progress) — keep framework-free.
 */

export type RubricId = "interpreting" | "ccl" | "oet" | "ielts" | "clinical" | "roleplay";

export type DimensionKey = "accuracy" | "terminology" | "fluency" | "turnManagement" | "professionalism";

export type Rubric = {
  id: RubricId;
  /** Labels for the five stored dimension slots, in display order. */
  dimensions: Array<{ key: DimensionKey; label: string; guidance: string }>;
  /** Overall 0–100 score at or above which the attempt counts as passed. */
  passScore: number;
  /** How the score is shown to learners. */
  display: (score: number) => { value: string; max?: string; note?: string };
  passLabel: string;
  graderRole: string;
  /** Limits the grader must state honestly in feedback. */
  caveat?: string;
};

const percent = (score: number) => ({ value: `${Math.round(score)}`, max: "100" });

const oetGrade = (scaled: number) =>
  scaled >= 450 ? "A" : scaled >= 350 ? "B" : scaled >= 300 ? "C+" : scaled >= 200 ? "C" : scaled >= 100 ? "D" : "E";

const ieltsBand = (score: number) => Math.round(((score / 100) * 9) * 2) / 2;

export const rubrics: Record<RubricId, Rubric> = {
  interpreting: {
    id: "interpreting",
    dimensions: [
      { key: "accuracy", label: "Accuracy", guidance: "complete, faithful transfer of meaning; no omissions, additions or distortions" },
      { key: "terminology", label: "Terminology", guidance: "correct specialist terms, names, numbers and doses" },
      { key: "fluency", label: "Fluency", guidance: "natural delivery in the target language, few false starts" },
      { key: "turnManagement", label: "Turn management", guidance: "rendering each turn promptly, in the right direction, managing the interaction" },
      { key: "professionalism", label: "Professionalism", guidance: "first person, register preserved, no added commentary" },
    ],
    passScore: 75,
    display: percent,
    passLabel: "Pass mark 75",
    graderRole: "an experienced interpreter examiner",
  },
  ccl: {
    id: "ccl",
    dimensions: [
      { key: "accuracy", label: "Accuracy", guidance: "complete transfer of meaning; omissions and distortions are the main deductions" },
      { key: "terminology", label: "Quality of language", guidance: "idiomatic, appropriate vocabulary and grammar in each language" },
      { key: "fluency", label: "Delivery", guidance: "smooth, confident delivery without long pauses" },
      { key: "turnManagement", label: "Technique", guidance: "rendering each segment promptly and completely" },
      { key: "professionalism", label: "Register", guidance: "appropriate register and first-person rendition" },
    ],
    passScore: 70,
    display: (score) => ({ value: `${Math.round((score / 100) * 90)}`, max: "90" }),
    passLabel: "Pass mark 63",
    graderRole: "a NAATI CCL-style examiner",
  },
  oet: {
    id: "oet",
    dimensions: [
      { key: "professionalism", label: "Relationship & patient's perspective", guidance: "rapport, empathy, eliciting and responding to the patient's ideas, concerns and expectations" },
      { key: "turnManagement", label: "Providing structure", guidance: "clear sequencing, signposting, staying on task and covering every task on the card" },
      { key: "accuracy", label: "Information gathering & giving", guidance: "open then closed questions, checking understanding, chunked explanations, no jargon" },
      { key: "terminology", label: "Appropriateness & language", guidance: "lay terms for patients, appropriate register, range and accuracy of grammar and vocabulary" },
      { key: "fluency", label: "Fluency", guidance: "even pace, few hesitations or repetitions (judged from the transcript)" },
    ],
    // AHPRA Speaking minimum is 360/500 for tests from 23 Apr 2026.
    passScore: 72,
    display: (score) => {
      const scaled = Math.round((score / 100) * 50) * 10;
      return { value: `${scaled}`, max: "500", note: `Estimated grade ${oetGrade(scaled)}` };
    },
    passLabel: "AHPRA requires 360 in Speaking (tests from 23 April 2026)",
    graderRole: "an experienced OET Speaking assessor",
    caveat: "Intelligibility and pronunciation can't be judged from a transcript, so this is an estimate.",
  },
  ielts: {
    id: "ielts",
    dimensions: [
      { key: "fluency", label: "Fluency & coherence", guidance: "speaking at length without effort, logical linking, discourse markers" },
      { key: "terminology", label: "Lexical resource", guidance: "range, precision, collocation and paraphrase" },
      { key: "accuracy", label: "Grammatical range & accuracy", guidance: "complex structures used accurately, error frequency" },
      { key: "turnManagement", label: "Developing answers", guidance: "extending answers with reasons and examples; Part 2 talk covers every prompt" },
      { key: "professionalism", label: "Relevance", guidance: "answering the question asked; staying on topic" },
    ],
    passScore: 78,
    display: (score) => ({ value: ieltsBand(score).toFixed(1), max: "9", note: "Estimated band" }),
    passLabel: "Band 7 is a common requirement",
    graderRole: "an experienced IELTS Speaking examiner",
    caveat: "Pronunciation is a quarter of the real band but can't be judged from a transcript, so this band is an estimate.",
  },
  clinical: {
    id: "clinical",
    dimensions: [
      { key: "accuracy", label: "History & assessment", guidance: "focused, systematic questioning that elicits the key information, including red flags" },
      { key: "terminology", label: "Explanation", guidance: "clear, jargon-free explanation of findings, diagnosis and plan; checking understanding" },
      { key: "turnManagement", label: "Structure & time", guidance: "logical sequence, signposting, completing the task in time" },
      { key: "professionalism", label: "Empathy & professionalism", guidance: "rapport, responding to emotion and concerns, safety-netting, consent" },
      { key: "fluency", label: "Communication", guidance: "clear, confident spoken English and active listening" },
    ],
    passScore: 70,
    display: percent,
    passLabel: "Pass mark 70",
    graderRole: "an experienced clinical examiner (OSCE / AMC-style)",
    caveat: "Physical examination and hands-on skills aren't assessed in voice practice.",
  },
  roleplay: {
    id: "roleplay",
    dimensions: [
      { key: "accuracy", label: "Task completion", guidance: "achieving the goal of the conversation and covering everything the task requires" },
      { key: "terminology", label: "Language", guidance: "clear, appropriate vocabulary and grammar for the situation and audience" },
      { key: "fluency", label: "Fluency", guidance: "even pace, few hesitations, false starts or repetitions (judged from the transcript)" },
      { key: "turnManagement", label: "Interaction", guidance: "listening, asking and answering questions, structuring the conversation" },
      { key: "professionalism", label: "Professionalism", guidance: "tone, courtesy, empathy and staying in role" },
    ],
    passScore: 70,
    display: percent,
    passLabel: "Target 70",
    graderRole: "an experienced communication skills assessor",
    caveat: "Tone and pronunciation can't be judged from a transcript, so this is an estimate.",
  },
};

/** Exam modules with their own rubric; everything else uses interpreting. */
const moduleRubric: Record<string, RubricId> = {
  "naati-certification-practice-ccl": "ccl",
  "oet-speaking-nursing": "oet",
  "oet-speaking-medicine": "oet",
  "ielts-speaking": "ielts",
  "amc-clinical-exam": "clinical",
  "nmba-osce-nursing": "clinical",
};

export function rubricForModule(moduleId: string): Rubric {
  // Community role-play courses are created with an "rp-" id (lib/marketplace.ts).
  if (moduleId.startsWith("rp-")) return rubrics.roleplay;
  return rubrics[moduleRubric[moduleId] ?? "interpreting"];
}
