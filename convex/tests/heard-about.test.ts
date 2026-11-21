import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { seedUser, setup } from "./setup.helpers";
import { firstTouchFrom, guessHeardAbout } from "../../lib/heard-about";

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

describe("heard about on the setting-up screen (D-055)", () => {
  test("setHeardAbout keeps the first known answer", async () => {
    const t = setup();
    const asUser = await seedUser(t, "user_d");
    await asUser.mutation(api.users.completeOnboarding, { practiceGoal: "ielts", languagePair: { sourceLanguage: "English", targetLanguage: "English" } });
    expect(await asUser.mutation(api.users.setHeardAbout, { heardAbout: "nope" })).toEqual({ saved: false });
    expect(await asUser.mutation(api.users.setHeardAbout, { heardAbout: "instagram" })).toEqual({ saved: true });
    expect(await asUser.mutation(api.users.setHeardAbout, { heardAbout: "google" })).toEqual({ saved: false });
    expect(await heardAboutOf(t, "user_d")).toBe("instagram");
  });

  test("guesses the answer from campaign tags, click ids and referrers", () => {
    const touch = (query: string, referrer = "") => firstTouchFrom(new URLSearchParams(query), referrer);
    expect(guessHeardAbout(touch("utm_source=facebook&utm_medium=paid"))).toBe("facebook");
    expect(guessHeardAbout(touch("utm_source=ig"))).toBe("instagram");
    expect(guessHeardAbout(touch("utm_source=chatgpt.com"))).toBe("ai_assistant");
    expect(guessHeardAbout(touch("gclid=abc"))).toBe("google");
    expect(guessHeardAbout(touch("fbclid=abc"))).toBe("facebook");
    expect(guessHeardAbout(touch("", "https://www.google.com.au/"))).toBe("google");
    expect(guessHeardAbout(touch("", "https://l.instagram.com/"))).toBe("instagram");
    expect(guessHeardAbout(touch("", "https://www.xingo.ai/exams"))).toBeNull();
    expect(guessHeardAbout(touch("utm_source=newsletter"))).toBeNull();
    expect(guessHeardAbout(null)).toBeNull();
  });
});
