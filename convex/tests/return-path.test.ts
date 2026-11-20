import { describe, expect, test } from "vitest";
import { safeReturnPath } from "../../lib/return-path";

describe("safeReturnPath (Checkout cancel URL)", () => {
  test("keeps plain same-site paths", () => {
    expect(safeReturnPath("/courses/naati-certification-practice-ccl")).toBe("/courses/naati-certification-practice-ccl");
    expect(safeReturnPath("/billing")).toBe("/billing");
  });

  test("rejects anything that could leave the site or inject a query", () => {
    for (const bad of [undefined, "", "courses", "//evil.com", "https://evil.com", "/a?b=c", "/a#b", "/a\\b", "/a b", `/${"x".repeat(200)}`]) {
      expect(safeReturnPath(bad)).toBeNull();
    }
  });
});
