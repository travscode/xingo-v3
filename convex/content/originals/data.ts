/**
 * XINGO Originals (D-038): the ten in-house studios, 10 courses each, 3 scenarios
 * per course. Seeded by convex/originals.ts, which runs every scenario through
 * buildScenario(course.kind, scenario) — data.test.ts checks nothing gets clipped.
 *
 * Authoring rules (enforced in data.test.ts):
 * - Field lengths fit cleanCharacter/buildScenario (goal ≤ 600 chars, demeanor ≤ 200,
 *   openingLine ≤ 300, endCondition ≤ 400, role/learnerRole ≤ 80, taskCard ≤ 1500).
 * - Goals are written to the character ("You're …"). Roles have no leading "a"/"the"
 *   (the prompt says "You are {name}, the {role}").
 * - Role-play endCondition is a clause ("When …"); interpreting endCondition lists what
 *   the professional must collect.
 * - Interpreting clients speak the learner's language at runtime, so client text never
 *   names a language or country.
 * - Voices match the character's gender (lib/marketplace.ts creatorVoices).
 */
import type { OriginalCreator } from "./types";
import { lanewayCoffeeClub } from "./lanewayCoffeeClub";
import { lastOrdersAcademy } from "./lastOrdersAcademy";
import { overTheFence } from "./overTheFence";
import { freshStartStudio } from "./freshStartStudio";
import { schoolGateStudio } from "./schoolGateStudio";
import { firstShift } from "./firstShift";
import { kindHands } from "./kindHands";
import { smokoStudio } from "./smokoStudio";
import { sayHiFirst } from "./sayHiFirst";
import { bothSides } from "./bothSides";

export const originals: OriginalCreator[] = [
  lanewayCoffeeClub,
  lastOrdersAcademy,
  overTheFence,
  freshStartStudio,
  schoolGateStudio,
  firstShift,
  kindHands,
  smokoStudio,
  sayHiFirst,
  bothSides,
];
