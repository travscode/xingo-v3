import { describe, expect, test } from "vitest";
import { averageRating, compareCourses, courseBadges, isCourseComplete } from "./marketplace";

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

describe("course ordering", () => {
  test("courses with an image come before those without, whatever the sort", () => {
    const bare = { addCount: 50, practiceCount: 200, ratingSum: 50, ratingCount: 10, publishedAt: "2026-10-03" };
    const pictured = { addCount: 0, publishedAt: "2026-01-01", bannerStorageId: "img" };
    const logoOnly = { addCount: 0, publishedAt: "2026-01-01", logoStorageId: "img" };
    for (const sort of ["popular", "top", "new"] as const) {
      expect([bare, pictured].sort(compareCourses(sort))[0]).toBe(pictured);
      expect([bare, logoOnly].sort(compareCourses(sort))[0]).toBe(logoOnly);
    }
  });
});

describe("complete courses", () => {
  const full = {
    addCount: 0,
    bannerStorageId: "b",
    logoStorageId: "l",
    tagline: "Order coffee like a local",
    description: "A".repeat(90),
    whatYouGet: ["One", "Two"],
    audience: "New arrivals",
    scenarioCount: 3,
  };

  test("needs every part filled in and three scenarios", () => {
    expect(isCourseComplete(full)).toBe(true);
    expect(isCourseComplete({ ...full, logoStorageId: undefined })).toBe(false);
    expect(isCourseComplete({ ...full, scenarioCount: 2 })).toBe(false);
    expect(isCourseComplete({ ...full, audience: " " })).toBe(false);
  });

  test("among courses with images, complete ones come first", () => {
    const partial = { addCount: 99, practiceCount: 500, bannerStorageId: "b", publishedAt: "2026-10-03" };
    for (const sort of ["popular", "top", "new"] as const) {
      expect([partial, full].sort(compareCourses(sort))[0]).toBe(full);
    }
  });
});
