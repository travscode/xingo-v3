import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { handleProblem, isSafeFeatureLink, parseEmailList, RESERVED_HANDLES } from "./orgs";

describe("handles", () => {
  test("every top-level page of the site is reserved", () => {
    const app = join(__dirname, "..", "app");
    const routes = readdirSync(app, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((entry) =>
        entry.name.startsWith("(")
          ? readdirSync(join(app, entry.name), { withFileTypes: true }).filter((child) => child.isDirectory()).map((child) => child.name)
          : [entry.name],
      )
      .filter((name) => !name.startsWith("[") && !name.startsWith("_"));
    expect(routes.length).toBeGreaterThan(10);
    for (const route of routes) expect(RESERVED_HANDLES.has(route), route).toBe(true);
  });

  test("validates shape and reserved names", () => {
    expect(handleProblem("apple")).toBeNull();
    expect(handleProblem("flatwhite.club")).toBeNull();
    expect(handleProblem("ab")).not.toBeNull();
    expect(handleProblem("Apple")).not.toBeNull();
    expect(handleProblem("pricing")).not.toBeNull();
    expect(handleProblem("marketplace")).not.toBeNull();
    expect(handleProblem("brand.png")).not.toBeNull();
  });
});

describe("email lists", () => {
  test("accepts pasted lists and drops duplicates and junk", () => {
    const { emails, invalid } = parseEmailList("a@x.com, B@x.com\nJane <jane@x.com>; a@x.com\nnot-an-email");
    expect(emails).toEqual(["a@x.com", "b@x.com", "jane@x.com"]);
    expect(invalid).toEqual(["not-an-email"]);
  });
});

describe("featured links", () => {
  test("allows site paths and https only", () => {
    expect(isSafeFeatureLink("/marketplace/apple")).toBe(true);
    expect(isSafeFeatureLink("https://apple.com")).toBe(true);
    expect(isSafeFeatureLink("javascript:alert(1)")).toBe(false);
    expect(isSafeFeatureLink("//evil.com")).toBe(false);
    expect(isSafeFeatureLink("http://x.com")).toBe(false);
  });
});
