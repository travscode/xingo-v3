import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { getEntitlement } from "./model/entitlements";
import { siteUrlFromEnv } from "./emails";
import { renderEmail } from "../lib/email/render";
import { buildOnboardingEmail } from "../lib/email/onboarding-content";
import { ONBOARDING_DAYS, trackForGoal, type OnboardingDay } from "../lib/email/onboarding-types";
import { getGoal } from "../lib/goals";
import { plans } from "../lib/plans";
import { rubricForModule } from "../lib/rubrics";

/**
 * 14-day onboarding series (D-037). A daily cron (convex/crons.ts) sends each
 * new learner the email for their day (1, 3, 5, 7, 9, 11, 13 after sign-up),
 * on the pathway that matches their goal. Never a backlog: someone who signed
 * up before the series existed, or misses a day, simply gets the next one.
 * Respects the news/tips opt-out; every email has one-click unsubscribe.
 */

const DAY_MS = 86_400_000;
const SERIES_LENGTH_DAYS = 15;

/** The series email due for someone `daysSinceSignUp` days in, if any (one day of slack). */
export function dueOnboardingDay(daysSinceSignUp: number): OnboardingDay | null {
  const due = [...ONBOARDING_DAYS].reverse().find((day) => day <= daysSinceSignUp && daysSinceSignUp - day <= 1);
  return due ?? null;
}

export const dispatch = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const since = new Date(now - SERIES_LENGTH_DAYS * DAY_MS).toISOString();
    const recent = await ctx.db
      .query("users")
      .withIndex("by_createdAt", (q) => q.gte("createdAt", since))
      .collect();
    let queued = 0;

    for (const user of recent) {
      if (user.emailOptOut || user.role === "platform_admin" || !user.email) continue;

      const day = dueOnboardingDay(Math.floor((now - Date.parse(user.createdAt)) / DAY_MS));
      if (day === null) continue;

      const existing = await ctx.db
        .query("onboardingEmails")
        .withIndex("by_clerk_day", (q) => q.eq("clerkId", user.clerkId).eq("day", day))
        .unique();
      if (existing) continue;

      if (!user.emailToken) await ctx.db.patch(user._id, { emailToken: crypto.randomUUID() });

      const rowId = await ctx.db.insert("onboardingEmails", {
        clerkId: user.clerkId,
        day,
        track: trackForGoal(user.practiceGoal),
        status: "queued",
        createdAt: new Date(now).toISOString(),
      });
      // Spread sends a little so Resend's rate limit is never hit.
      await ctx.scheduler.runAfter(queued * 600, internal.onboarding.send, { rowId });
      queued += 1;
    }

    return { queued };
  },
});

function bestScoreLabel(sessions: Doc<"sessions">[]) {
  const graded = sessions.filter((s) => s.completionStatus === "completed" || s.completionStatus === "needs_review");
  if (graded.length === 0) return { count: 0, best: null };
  const best = graded.reduce((top, s) => (s.score > top.score ? s : top));
  const shown = rubricForModule(best.moduleId).display(best.score);
  return { count: graded.length, best: shown.max ? `${shown.value}/${shown.max}` : shown.value };
}

export const context = internalQuery({
  args: { rowId: v.id("onboardingEmails") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.rowId);
    if (!row || row.status !== "queued") return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", row.clerkId))
      .unique();
    if (!user) return null;

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", user.clerkId))
      .collect();
    const { count, best } = bestScoreLabel(sessions);
    const entitlement = await getEntitlement(ctx, user);
    const pair = user.languagePreferences?.[0];
    const language = pair && pair.targetLanguage.toLowerCase() !== "english" ? pair.targetLanguage : null;

    return {
      row,
      to: { email: user.email, name: user.name, token: user.emailToken ?? null, optedOut: Boolean(user.emailOptOut) },
      ctx: {
        goalLabel: getGoal(user.practiceGoal)?.label ?? null,
        goalId: user.practiceGoal ?? null,
        language,
        sessions: count,
        bestScore: best,
        minutesLeft: Math.max(0, Math.floor(entitlement.remainingMinutes)),
        freeMonthlyMinutes: plans.free.monthlyMinutes,
        isPro: entitlement.plan === "professional",
      },
    };
  },
});

export const markResult = internalMutation({
  args: {
    rowId: v.id("onboardingEmails"),
    status: v.union(v.literal("sent"), v.literal("skipped"), v.literal("failed")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.rowId, {
      status: args.status,
      sentAt: args.status === "sent" ? new Date().toISOString() : undefined,
      error: args.error?.slice(0, 300),
    });
  },
});

export const send = internalAction({
  args: { rowId: v.id("onboardingEmails") },
  handler: async (ctx, args): Promise<void> => {
    const data = await ctx.runQuery(internal.onboarding.context, { rowId: args.rowId });
    if (!data) return;

    const apiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.EMAIL_FROM_ADDRESS;
    if (!apiKey || !fromAddress) {
      await ctx.runMutation(internal.onboarding.markResult, { rowId: args.rowId, status: "skipped", error: "email not configured" });
      return;
    }
    if (data.to.optedOut || !data.to.token) {
      await ctx.runMutation(internal.onboarding.markResult, { rowId: args.rowId, status: "skipped", error: "opted out" });
      return;
    }

    const site = siteUrlFromEnv();
    const firstName = data.to.name.trim().split(/\s+/)[0] || "there";
    const built = buildOnboardingEmail(data.row.day as OnboardingDay, trackForGoal(data.ctx.goalId), { ...data.ctx, siteUrl: site });
    const unsubscribeUrl = `${site}/e/u/${data.to.token}`;
    const senderName = process.env.EMAIL_SENDER_NAME ?? "XINGO";
    const { html, text } = renderEmail(built.templateId, built.content, { preheader: built.preheader }, {
      siteUrl: site,
      recipient: { firstName, name: data.to.name, email: data.to.email },
      unsubscribeUrl,
      senderName,
      senderAddress: process.env.EMAIL_POSTAL_ADDRESS ?? "Australia",
    });

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `onboarding-${data.row.clerkId}-${data.row.day}`,
      },
      body: JSON.stringify({
        from: `${senderName} <${fromAddress}>`,
        to: [data.to.email],
        reply_to: process.env.EMAIL_REPLY_TO || undefined,
        subject: built.subject.replace(/\{\{\s*firstName\s*\}\}/g, firstName),
        html,
        text,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        tags: [
          { name: "type", value: "onboarding" },
          { name: "day", value: String(data.row.day) },
          { name: "track", value: data.row.track },
        ],
      }),
    });

    if (response.ok || response.status === 409) {
      await ctx.runMutation(internal.onboarding.markResult, { rowId: args.rowId, status: "sent" });
    } else {
      const detail = (await response.text()).slice(0, 300);
      console.error("[onboarding] Resend error", response.status, detail);
      await ctx.runMutation(internal.onboarding.markResult, { rowId: args.rowId, status: "failed", error: `${response.status} ${detail}` });
    }
  },
});

export type OnboardingRowId = Id<"onboardingEmails">;
