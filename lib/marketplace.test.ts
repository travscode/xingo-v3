import { describe, expect, test } from "vitest";
import { averageRating, compareCourses, courseBadges } from "./marketplace";

const now = Date.parse("2026-10-03T00:00:00.000Z");

describe("marketplace badges and sorting", () => {
  test("badges come only from real activity", () => {
    expect(courseBadges({ addCount: 0, publishedAt: "2026-01-01T00:00:00.000Z" }, now)).toEqual([]);
    expect(courseBadges({ addCount: 0, publishedAt: "2026-10-01T00:00:00.000Z" }, now)).toEqual(["new"]);
    expect(courseBadges({ addCount: 5, practiceCount: 0, publishedAt: "2026-01-01T00:00:00.000Z" }, now)).toEqual(["popular"]);
    expect(courseBadges({ addCount: 0, ratingSum: 24, ratingCount: 5, publishedAt: "2026-01-01T00:00:00.000Z" }, now)).toEqual(["top_rated"]);
    expect(courseBadges({ addCount: 0, ratingSum: 20, ratingCount: 4, publishedAt: "2026-01-01T00:00:00.000Z" }, now)).toEqual([]);
  });

  test("averages round to one decimal and need ratings", () => {
    expect(averageRating({ addCount: 0 })).toBeNull();
    expect(averageRating({ addCount: 0, ratingSum: 14, ratingCount: 3 })).toBe(4.7);
  });

  test("top rated needs at least three ratings to lead", () => {
    const lone = { addCount: 0, ratingSum: 5, ratingCount: 1 };
    const solid = { addCount: 0, ratingSum: 13, ratingCount: 3 };
    expect([lone, solid].sort(compareCourses("top"))[0]).toBe(solid);
  });
});
