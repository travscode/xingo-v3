import { describe, expect, test } from "vitest";
import { naatiCclLanguages } from "./naati-ccl";
import { cclLanguagePages, naatiNameFor } from "./seo-pages";

describe("NAATI CCL languages", () => {
  test("matches the count NAATI publishes", () => {
    expect(naatiCclLanguages).toHaveLength(55);
    expect(new Set(naatiCclLanguages.map((language) => language.name)).size).toBe(55);
  });

  test("every CCL practice page is for a language NAATI tests", () => {
    const names = new Set(naatiCclLanguages.map((language) => language.name));
    for (const page of cclLanguagePages) expect(names.has(naatiNameFor(page)), page.slug).toBe(true);
  });
});
