import { describe, expect, test } from "vitest";
import { matchesLibraryFilters } from "./catalog-groups";

const mod = (id: string, overrides: Partial<Parameters<typeof matchesLibraryFilters>[0]> = {}) => ({
  id,
  isFree: false,
  practiceType: "interpreting" as const,
  attemptCount: 0,
  scenarios: [{ isFreePreview: false }],
  ...overrides,
});

describe("library filters", () => {
  test("no filters matches everything", () => {
    expect(matchesLibraryFilters(mod("anything"), [])).toBe(true);
  });

  test("free includes free modules and modules with a free preview", () => {
    expect(matchesLibraryFilters(mod("a", { isFree: true }), ["free"])).toBe(true);
    expect(matchesLibraryFilters(mod("b", { scenarios: [{ isFreePreview: true }] }), ["free"])).toBe(true);
    expect(matchesLibraryFilters(mod("c"), ["free"])).toBe(false);
  });

  test("exam and training are alternatives (OR); different groups combine (AND)", () => {
    const oet = mod("oet-speaking-nursing", { practiceType: "roleplay" });
    const ndis = mod("ndis-disability-services");
    expect(matchesLibraryFilters(oet, ["exam"])).toBe(true);
    expect(matchesLibraryFilters(ndis, ["exam"])).toBe(false);
    expect(matchesLibraryFilters(ndis, ["exam", "training"])).toBe(true);
    expect(matchesLibraryFilters(oet, ["exam", "interpreting"])).toBe(false);
    expect(matchesLibraryFilters(oet, ["exam", "roleplay"])).toBe(true);
  });

  test("in progress needs at least one attempt", () => {
    expect(matchesLibraryFilters(mod("x", { attemptCount: 2 }), ["in-progress"])).toBe(true);
    expect(matchesLibraryFilters(mod("x"), ["in-progress"])).toBe(false);
  });
});
