import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { action, internalAction, internalMutation, internalQuery, mutation, query, type QueryCtx } from "./_generated/server";
import { getClerkIdFromIdentity, requirePlatformAdmin, requireUser } from "./model/auth";
import { activateBeta } from "./model/beta";
import { getEntitlement } from "./model/entitlements";
import { queueEmail } from "./model/notify";
import { siteUrlFromEnv } from "./emails";
import {
  BETA_COHORT,
  BETA_COURSE_ID,
  BETA_MAX_BATCH,
  BETA_PREVIEW_TOKEN,
  FEEDBACK_MAX_CHARS,
  SURVEY_QUESTIONS,
  SURVEY_TEXT_MAX_CHARS,
  isBetaActive,
  isValidEmail,
  isValidRating,
  pickSurveyTrigger,
  type SurveyTrigger,
} from "../lib/beta";

/** Private beta: invites, floating feedback and the post-dialogue survey (D-049). */

const MAX_AUDIO_BYTES = 4 * 1024 * 1024;
/** Spreads sends so Resend's rate limit is never hit. */
const SEND_SPACING_MS = 600;

async function requireBetaTester(ctx: Parameters<typeof requireUser>[0]) {
  const user = await requireUser(ctx);
  if (!isBetaActive(user)) throw new ConvexError("BETA_ONLY");
  return user;
}

function isScored(session: Doc<"sessions">) {
  return Boolean(session.assessment) && (session.completionStatus === "completed" || session.completionStatus === "needs_review");
}

async function userByEmail(ctx: QueryCtx, email: string) {
  return ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();
}

async function cohortInvite(ctx: QueryCtx, email: string) {
  return ctx.db
    .query("betaInvites")
    .withIndex("by_email", (q) => q.eq("email", email))
    .filter((q) => q.eq(q.field("cohort"), BETA_COHORT))
    .first();
}

// ---------- Invites (Admin → Beta) ----------

/** What will happen to each address, shown before anything is sent. */
export const checkEmails = query({
  args: { emails: v.array(v.string()) },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);

    return Promise.all(
      args.emails.slice(0, BETA_MAX_BATCH).map(async (email) => {
        const [invite, user] = await Promise.all([cohortInvite(ctx, email), userByEmail(ctx, email)]);
        const status = invite ? "already_invited" : user?.emailOptOut ? "opted_out" : user ? "has_account" : "ready";
        return { email, status: status as "already_invited" | "opted_out" | "has_account" | "ready" };
      }),
    );
  },
});

export const sendInvites = mutation({
  args: { emails: v.array(v.string()) },
  handler: async (ctx, args) => {
    const admin = await requirePlatformAdmin(ctx);
    if (args.emails.length > BETA_MAX_BATCH) throw new ConvexError(`Send at most ${BETA_MAX_BATCH} invites at a time.`);

    const now = new Date().toISOString();
    let queued = 0;
    let skipped = 0;

    for (const raw of new Set(args.emails.map((email) => email.trim().toLowerCase()))) {
      const [existing, user] = isValidEmail(raw) ? await Promise.all([cohortInvite(ctx, raw), userByEmail(ctx, raw)]) : [null, null];
      if (!isValidEmail(raw) || existing || user?.emailOptOut) {
        skipped += 1;
        continue;
      }

      const inviteId = await ctx.db.insert("betaInvites", {
        email: raw,
        cohort: BETA_COHORT,
        token: crypto.randomUUID(),
        status: "invited",
        hadAccount: Boolean(user),
        invitedByClerkId: admin.clerkId,
        createdAt: now,
      });

      // An account with this verified address is the same person: no link needed to join.
      if (user?.emailVerified) {
        const invite = await ctx.db.get(inviteId);
        if (invite) await activateBeta(ctx, user, invite);
      }

      await ctx.scheduler.runAfter(queued * SEND_SPACING_MS, internal.beta.deliverInvite, { inviteId, reminder: false });
      queued += 1;
    }

    return { queued, skipped };
  },
});

/** Sends the real invite email to the admin, with a link that grants nothing. */
export const sendTestInvite = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await requirePlatformAdmin(ctx);
    await queueEmail(ctx, {
      toEmail: admin.email,
      email: { kind: "beta_invite", url: `${siteUrlFromEnv()}/beta/${BETA_PREVIEW_TOKEN}`, hadAccount: false, reminder: false },
      dedupeKey: `beta-test-${admin.clerkId}-${Date.now()}`,
    });
    return { email: admin.email };
  },
});

export const remind = mutation({
  args: { inviteId: v.id("betaInvites") },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const invite = await ctx.db.get(args.inviteId);
    if (!invite || invite.status !== "invited" || invite.remindedAt) return { queued: false };
    await ctx.db.patch(invite._id, { remindedAt: new Date().toISOString() });
    await ctx.scheduler.runAfter(0, internal.beta.deliverInvite, { inviteId: invite._id, reminder: true });
    return { queued: true };
  },
});

export const inviteForDelivery = internalQuery({
  args: { inviteId: v.id("betaInvites") },
  handler: async (ctx, args) => ctx.db.get(args.inviteId),
});

export const recordDelivery = internalMutation({
  args: { inviteId: v.id("betaInvites"), error: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.inviteId, { sentAt: new Date().toISOString(), sendError: args.error });
  },
});

export const deliverInvite = internalAction({
  args: { inviteId: v.id("betaInvites"), reminder: v.boolean() },
  handler: async (ctx, args): Promise<void> => {
    const invite: Doc<"betaInvites"> | null = await ctx.runQuery(internal.beta.inviteForDelivery, { inviteId: args.inviteId });
    if (!invite || invite.status === "unsubscribed") return;

    const site = siteUrlFromEnv();
    const result: { sent: boolean; reason?: string } = await ctx.runAction(internal.transactional.send, {
      toEmail: invite.email,
      email: { kind: "beta_invite", url: `${site}/beta/${invite.token}`, hadAccount: invite.hadAccount, reminder: args.reminder },
      dedupeKey: `beta-${args.reminder ? "reminder" : "invite"}-${invite._id}`,
      unsubscribeUrl: `${site}/e/u/${invite.token}`,
    });

    await ctx.runMutation(internal.beta.recordDelivery, {
      inviteId: invite._id,
      error: result.sent || result.reason === "duplicate" ? undefined : (result.reason ?? "not_sent"),
    });
  },
});

/** Joins the beta from an invite link. The link works once, for one account. */
export const claim = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const invite = await ctx.db
      .query("betaInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!invite) throw new ConvexError("BETA_INVITE_INVALID");
    if (invite.status === "accepted" && invite.clerkId !== user.clerkId) throw new ConvexError("BETA_INVITE_USED");

    await activateBeta(ctx, user, invite);
    return { onboarded: Boolean(user.onboardedAt) };
  },
});

/** Every invite with how far that person has got. */
export const listInvites = query({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);

    const [invites, scenarios] = await Promise.all([
      ctx.db.query("betaInvites").collect(),
      ctx.db
        .query("scenarios")
        .withIndex("by_moduleId", (q) => q.eq("moduleId", BETA_COURSE_ID))
        .collect(),
    ]);

    const rows = await Promise.all(
      invites.map(async (invite) => {
        const clerkId = invite.clerkId;
        const [user, sessions, surveys, feedbackRows] = clerkId
          ? await Promise.all([
              ctx.db
                .query("users")
                .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
                .unique(),
              ctx.db
                .query("sessions")
                .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
                .collect(),
              ctx.db
                .query("betaSurveys")
                .withIndex("by_clerk_trigger", (q) => q.eq("clerkId", clerkId))
                .collect(),
              ctx.db
                .query("betaFeedback")
                .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
                .collect(),
            ])
          : [null, [], [], []];
        const scored = sessions.filter((session) => session.moduleId === BETA_COURSE_ID && isScored(session));
        const entitlement = user ? await getEntitlement(ctx, { ...user, previewAs: undefined }) : null;

        return {
          _id: invite._id,
          email: invite.email,
          name: user?.name ?? null,
          clerkId: clerkId ?? null,
          status: invite.status,
          hadAccount: invite.hadAccount,
          createdAt: invite.createdAt,
          sentAt: invite.sentAt ?? null,
          sendError: invite.sendError ?? null,
          remindedAt: invite.remindedAt ?? null,
          acceptedAt: invite.acceptedAt ?? null,
          ended: Boolean(user?.betaEndedAt),
          scoredDialogues: new Set(scored.map((session) => session.scenarioId)).size,
          surveysAnswered: surveys.filter((survey) => survey.answeredAt).length,
          feedbackCount: feedbackRows.length,
          remainingMinutes: entitlement?.remainingMinutes ?? null,
        };
      }),
    );

    return {
      totalDialogues: scenarios.length,
      invites: rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.email.localeCompare(b.email)),
    };
  },
});

/** Ends beta access for everyone who joined. Their feedback and scores are kept. */
export const endBeta = mutation({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);
    const now = new Date().toISOString();
    const invites = await ctx.db.query("betaInvites").collect();
    let ended = 0;

    for (const invite of invites) {
      const clerkId = invite.clerkId;
      if (!clerkId) continue;
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
        .unique();
      if (user && isBetaActive(user)) {
        await ctx.db.patch(user._id, { betaEndedAt: now, updatedAt: now });
        ended += 1;
      }
    }

    return { ended };
  },
});

// ---------- Floating feedback ----------

export const submitFeedback = mutation({
  args: { comment: v.string(), page: v.string(), source: v.union(v.literal("typed"), v.literal("voice")) },
  handler: async (ctx, args) => {
    const user = await requireBetaTester(ctx);
    const comment = args.comment.trim().slice(0, FEEDBACK_MAX_CHARS);
    if (!comment) throw new ConvexError("FEEDBACK_EMPTY");

    await ctx.db.insert("betaFeedback", {
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      page: args.page.slice(0, 300),
      comment,
      source: args.source,
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  },
});

/** Turns spoken feedback into text. The audio is passed to Whisper and never stored. */
export const transcribeFeedback = action({
  args: { audio: v.bytes(), mimeType: v.string() },
  handler: async (ctx, args): Promise<{ text: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user: Doc<"users"> | null = await ctx.runQuery(internal.users.getByClerkIdInternal, {
      clerkId: getClerkIdFromIdentity(identity),
    });
    if (!isBetaActive(user)) throw new ConvexError("BETA_ONLY");

    const key = process.env.OPENAI_API_KEY;
    if (!key || args.audio.byteLength === 0 || args.audio.byteLength > MAX_AUDIO_BYTES) {
      throw new ConvexError("DICTATION_FAILED");
    }

    const extension = args.mimeType.includes("mp4") ? "mp4" : args.mimeType.includes("ogg") ? "ogg" : "webm";
    const form = new FormData();
    form.append("file", new Blob([args.audio], { type: args.mimeType }), `feedback.${extension}`);
    form.append("model", "whisper-1");
    form.append("response_format", "json");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });

    if (!response.ok) {
      console.error("[beta.transcribeFeedback]", response.status, (await response.text()).slice(0, 300));
      throw new ConvexError("DICTATION_FAILED");
    }

    const data = (await response.json()) as { text?: string };
    return { text: (data.text ?? "").trim() };
  },
});

export const listFeedback = query({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);
    return ctx.db.query("betaFeedback").withIndex("by_createdAt").order("desc").take(1000);
  },
});

// ---------- Survey ----------

/** The survey due on this results page. Always worked out here, never by the client. */
async function surveyStateFor(ctx: QueryCtx, user: Doc<"users">, attemptId: string) {
  if (!isBetaActive(user)) return null;

  const session = await ctx.db
    .query("sessions")
    .withIndex("by_public_id", (q) => q.eq("id", attemptId))
    .unique();
  if (!session || session.clerkId !== user.clerkId || session.moduleId !== BETA_COURSE_ID || !isScored(session)) return null;

  const [rows, sessions, scenarios] = await Promise.all([
    ctx.db
      .query("betaSurveys")
      .withIndex("by_clerk_trigger", (q) => q.eq("clerkId", user.clerkId))
      .collect(),
    ctx.db
      .query("sessions")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", user.clerkId))
      .collect(),
    ctx.db
      .query("scenarios")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", BETA_COURSE_ID))
      .collect(),
  ]);

  const done = new Set(sessions.filter((s) => s.moduleId === BETA_COURSE_ID && isScored(s)).map((s) => s.scenarioId));
  const finishedCourse = scenarios.length > 0 && scenarios.every((scenario) => done.has(scenario.id));
  const trigger = pickSurveyTrigger(rows, attemptId, finishedCourse);

  return trigger ? { trigger, session, row: rows.find((row) => row.trigger === trigger) ?? null } : null;
}

export const surveyPrompt = query({
  args: { attemptId: v.string() },
  handler: async (ctx, args): Promise<{ trigger: SurveyTrigger } | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", getClerkIdFromIdentity(identity)))
      .unique();
    if (!user) return null;
    const state = await surveyStateFor(ctx, user, args.attemptId);
    return state ? { trigger: state.trigger } : null;
  },
});

export const submitSurvey = mutation({
  args: {
    attemptId: v.string(),
    overall: v.number(),
    helpful: v.number(),
    worked: v.number(),
    fair: v.number(),
    difficulty: v.number(),
    suggestions: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireBetaTester(ctx);
    const answers = { overall: args.overall, helpful: args.helpful, worked: args.worked, fair: args.fair, difficulty: args.difficulty };
    if (SURVEY_QUESTIONS.some((question) => !isValidRating(answers[question.key]))) throw new ConvexError("SURVEY_INVALID");

    const state = await surveyStateFor(ctx, user, args.attemptId);
    if (!state) return { saved: false };

    const now = new Date().toISOString();
    const fields = {
      ...answers,
      suggestions: args.suggestions.trim().slice(0, SURVEY_TEXT_MAX_CHARS),
      attemptId: args.attemptId,
      scenarioId: state.session.scenarioId,
      answeredAt: now,
    };

    if (state.row) await ctx.db.patch(state.row._id, fields);
    else {
      await ctx.db.insert("betaSurveys", {
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        trigger: state.trigger,
        dismissCount: 0,
        ...fields,
      });
    }
    return { saved: true };
  },
});

export const dismissSurvey = mutation({
  args: { attemptId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireBetaTester(ctx);
    const state = await surveyStateFor(ctx, user, args.attemptId);
    if (!state) return;

    if (state.row) {
      await ctx.db.patch(state.row._id, { dismissCount: state.row.dismissCount + 1, lastDismissedAttemptId: args.attemptId });
    } else {
      await ctx.db.insert("betaSurveys", {
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        trigger: state.trigger,
        dismissCount: 1,
        lastDismissedAttemptId: args.attemptId,
      });
    }
  },
});

export const listSurveys = query({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);
    const rows = await ctx.db.query("betaSurveys").collect();
    const answered = rows.filter((row) => row.answeredAt);
    const scenarioTitles = new Map<string, string>();

    for (const row of answered) {
      if (row.scenarioId && !scenarioTitles.has(row.scenarioId)) {
        const scenarioId = row.scenarioId;
        const scenario = await ctx.db
          .query("scenarios")
          .withIndex("by_public_id", (q) => q.eq("id", scenarioId))
          .unique();
        scenarioTitles.set(scenarioId, scenario?.title ?? scenarioId);
      }
    }

    return {
      dismissed: rows.length - answered.length,
      responses: answered
        .sort((a, b) => (b.answeredAt ?? "").localeCompare(a.answeredAt ?? ""))
        .map((row) => ({ ...row, scenarioTitle: row.scenarioId ? (scenarioTitles.get(row.scenarioId) ?? null) : null })),
    };
  },
});

export type BetaInviteId = Id<"betaInvites">;
