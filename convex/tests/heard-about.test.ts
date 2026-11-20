import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { seedUser, setup } from "./setup.helpers";

const pair = { sourceLanguage: "English", targetLanguage: "Hindi" };

async function heardAboutOf(t: ReturnType<typeof setup>, clerkId: string) {
  return t.run(async (ctx) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
    return user?.heardAbout ?? null;
  });
}

describe("onboarding: how did you hear about us (D-051)", () => {
  test("stores a known answer", async () => {
    const t = setup();
    const asUser = await seedUser(t, "user_a");
    await asUser.mutation(api.users.completeOnboarding, { practiceGoal: "naati_ccl", languagePair: pair, heardAbout: "tiktok" });
    expect(await heardAboutOf(t, "user_a")).toBe("tiktok");
  });

  test("ignores unknown values and keeps the first answer", async () => {
    const t = setup();
    const asUser = await seedUser(t, "user_b");
    await asUser.mutation(api.users.completeOnboarding, { practiceGoal: "naati_ccl", languagePair: pair, heardAbout: "<script>" });
    expect(await heardAboutOf(t, "user_b")).toBeNull();

    await asUser.mutation(api.users.completeOnboarding, { practiceGoal: "naati_ccl", languagePair: pair, heardAbout: "google" });
    await asUser.mutation(api.users.completeOnboarding, { practiceGoal: "naati_ccl", languagePair: pair, heardAbout: "friend" });
    expect(await heardAboutOf(t, "user_b")).toBe("google");
  });

  test("the question is optional", async () => {
    const t = setup();
    const asUser = await seedUser(t, "user_c");
    await asUser.mutation(api.users.completeOnboarding, { practiceGoal: "medical", languagePair: pair });
    expect(await heardAboutOf(t, "user_c")).toBeNull();
  });
});
