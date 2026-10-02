/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import schema from "../schema";

export const modules = import.meta.glob(["../**/*.ts", "../**/*.js", "!../**/*.test.ts", "!../tests/**"]);

export function setup() {
  return convexTest(schema, modules);
}

export async function seedUser(
  t: ReturnType<typeof setup>,
  clerkId: string,
  overrides: Record<string, unknown> = {},
) {
  await t.run(async (ctx) => {
    await ctx.db.insert("users", {
      clerkId,
      email: `${clerkId}@example.com`,
      name: clerkId,
      role: "interpreter",
      subscriptionStatus: "free",
      languagePreferences: [],
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
      ...overrides,
    });
  });

  return t.withIdentity({ subject: clerkId, tokenIdentifier: `test|${clerkId}` });
}

export async function seedCatalog(t: ReturnType<typeof setup>) {
  const agent = { role: "Doctor", voice: "cedar", goal: "Ask questions" };

  await t.run(async (ctx) => {
    for (const [id, isFree] of [["free-mod", true], ["paid-mod", false]] as const) {
      await ctx.db.insert("modules", {
        id,
        title: id,
        description: "",
        industryCategory: "medical",
        durationMinutes: 10,
        difficultyLevel: "beginner",
        learningObjectives: [],
        isFree,
        isAccredited: false,
        badgeIcon: "",
        createdAt: "2026-01-01T00:00:00.000Z",
      });
    }

    for (const [id, moduleId, isFreePreview] of [
      ["free-scn", "free-mod", false],
      ["paid-scn", "paid-mod", false],
      ["preview-scn", "paid-mod", true],
    ] as const) {
      await ctx.db.insert("scenarios", {
        id,
        moduleId,
        title: id,
        description: "",
        aiAgentA: agent,
        expectedSkills: [],
        difficultyLevel: "beginner",
        isFreePreview,
      });
    }
  });
}
