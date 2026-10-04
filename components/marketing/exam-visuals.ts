import type { PersonKey, SceneKey } from "@/components/marketing/people";

/*
 * Art direction for each /exams/[slug] page: which photos, who the learner
 * talks to and one example line. All people are fictional (people.tsx) and the
 * lines are illustrative, shown as examples. Exam facts stay in lib/exam-pages.ts.
 */

export type ExamVisual = {
  /** Hero photo: someone practising for this exam. */
  heroScene: SceneKey;
  /** Photo beside "What XINGO helps you practise". */
  practiceScene: SceneKey;
  /** Photo in the closing call to action. */
  closingScene: SceneKey;
  /** The AI partner shown speaking in the hero. */
  speaker: { person: PersonKey; name: string; role: string; line: string };
  /** For interpreting exams: the second party, whom the learner interprets for. */
  listener?: { person: PersonKey; name: string };
  /** What the exam calls the card the candidate reads. */
  cardLabel: string;
  /** Who the learner talks to in each scenario, in lib/exam-pages.ts order. One or two people. */
  cast: ReadonlyArray<readonly PersonKey[]>;
};

export const examVisuals: Record<string, ExamVisual> = {
  "oet-speaking": {
    heroScene: "examPrep",
    practiceScene: "clinic",
    closingScene: "healthReception",
    speaker: { person: "mei", name: "Mrs Chen", role: "Patient", line: "I'm not getting out of this bed. What if my hip goes again?" },
    cardLabel: "Role-play card",
    cast: [["mei"], ["tom"], ["aisha"], ["jp"], ["lucas"], ["daniel"]],
  },
  "ielts-speaking": {
    heroScene: "speakingTestPrep",
    practiceScene: "learnerHeadphones",
    closingScene: "tutorSession",
    speaker: { person: "examiner", name: "Examiner", role: "Part 2", line: "Now I'm going to give you a topic. You have one minute to prepare." },
    cardLabel: "Cue card",
    cast: [["examiner"]],
  },
  "amc-clinical-exam": {
    heroScene: "learnerHeadphones",
    practiceScene: "clinic",
    closingScene: "healthReception",
    speaker: { person: "jp", name: "Mr Walsh", role: "Patient, 58", line: "I've been exhausted for months. My wife made me come in." },
    cardLabel: "Station",
    cast: [["jp"], ["linh"], ["priya"], ["hana"], ["tom"], ["lucas"]],
  },
  "nmba-osce": {
    heroScene: "examPrep",
    practiceScene: "healthReception",
    closingScene: "clinic",
    speaker: { person: "drKim", name: "Dr Kim", role: "After-hours doctor", line: "I've got two minutes. What exactly do you want me to do?" },
    cardLabel: "Station",
    cast: [["drKim"], ["jp"], ["aisha"], ["mateo"], ["mai"], ["nurse"]],
  },
  "cmi-oral-exam": {
    heroScene: "interpreterDesk",
    practiceScene: "clinicInterpreter",
    closingScene: "team",
    speaker: { person: "drKim", name: "Dr Kim", role: "Clinician · English", line: "When did the chest pain start, and does it spread anywhere?" },
    listener: { person: "jp", name: "the patient" },
    cardLabel: "Dialogue",
    cast: [
      ["drKim", "mateo"],
      ["lawyer", "mai"],
      ["drKim", "jp"],
      ["nurse", "linh"],
      ["drKim", "mei"],
      ["hana", "tom"],
    ],
  },
  "cchi-oral-exam": {
    heroScene: "clinicInterpreter",
    practiceScene: "interpreterDesk",
    closingScene: "team",
    speaker: { person: "nurse", name: "Nurse Reyes", role: "Provider · English", line: "How much does she weigh? I need that to work out the dose." },
    listener: { person: "linh", name: "the parent" },
    cardLabel: "Dialogue",
    cast: [
      ["drKim", "jp"],
      ["nurse", "linh"],
      ["hana", "tom"],
      ["lawyer", "mai"],
      ["drKim", "mei"],
      ["drKim", "mateo"],
    ],
  },
};

const fallback: ExamVisual = examVisuals["oet-speaking"];

export function examVisual(slug: string): ExamVisual {
  return examVisuals[slug] ?? fallback;
}

/** People for scenario `index`, cycling if an exam has more scenarios than cast entries. */
export function castFor(visual: ExamVisual, index: number) {
  return visual.cast[index % visual.cast.length];
}
