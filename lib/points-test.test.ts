import { describe, expect, test } from "vitest";
import {
  COMMUNITY_LANGUAGE_POINTS,
  defaultSelection,
  EMPLOYMENT_POINTS_CAP,
  estimatePoints,
  POINTS_PASS_MARK,
  pointsFactors,
} from "./points-test";

describe("points test estimator", () => {
  test("matches the Home Affairs headline values", () => {
    expect(POINTS_PASS_MARK).toBe(65);
    expect(COMMUNITY_LANGUAGE_POINTS).toBe(5);
    expect(EMPLOYMENT_POINTS_CAP).toBe(20);
  });

  test("adds up a typical profile", () => {
    const selection = {
      ...defaultSelection(),
      visa: "189",
      age: "25-32", // 30
      english: "proficient", // 10
      overseasWork: "3", // 5
      qualification: "bachelor", // 15
      partner: "single", // 10
    };
    expect(estimatePoints(selection)).toBe(70);
    expect(estimatePoints({ ...selection, communityLanguage: "yes" })).toBe(75);
    expect(estimatePoints({ ...selection, visa: "491" })).toBe(85);
  });

  test("caps combined skilled employment at 20", () => {
    const base = { ...defaultSelection(), age: "40-44" };
    expect(estimatePoints({ ...base, overseasWork: "8", australianWork: "8" })).toBe(15 + EMPLOYMENT_POINTS_CAP);
  });

  test("every factor has unique option values", () => {
    for (const factor of pointsFactors) {
      expect(new Set(factor.options.map((option) => option.value)).size).toBe(factor.options.length);
    }
  });
});
