import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation, internalQuery, mutation, query, type QueryCtx } from "./_generated/server";
import { requirePlatformAdmin } from "./model/auth";
import { collectLinks } from "../lib/email/render";

/**
 * Admin email campaigns: drafts, audience, queued sending, tracking and reports.
 * Sending runs in emailActions.ts; tracking endpoints are in http.ts.
 */

const templateId = v.union(v.literal("announcement"), v.literal("spotlight"), v.literal("newsletter"), v.literal("letter"));

const content = v.object({
  kicker: v.optional(v.string()),
  headline: v.optional(v.string()),
  body: v.string(),
  heroImageUrl: v.optional(v.string()),
  ctaLabel: v.optional(v.string()),
  ctaUrl: v.optional(v.string()),
  sections: v.optional(
    v.array(
      v.object({
        title: v.string(),
        body: v.string(),
        imageUrl: v.optional(v.string()),
        linkLabel: v.optional(v.string()),
        linkUrl: v.optional(v.string()),
      }),
    ),
  ),
  signature: v.optional(v.string()),
});

export function siteUrlFromEnv() {
  return (process.env.SITE_URL ?? "https://www.xingo.ai").replace(/\/$/, "");
}

async function campaignStats(ctx: QueryCtx, campaignId: Id<"emailCampaigns">) {
  const recipients = await ctx.db
    .query("emailRecipients")
    .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
    .collect();
  const sent = recipients.filter((r) => r.status === "sent").length;

  return {
    recipients: recipients.length,
    queued: recipients.filter((r) => r.status === "queued" || r.status === "sending").length,
    sent,
    failed: recipients.filter((r) => r.status === "failed" || r.status === "bounced").length,
    opened: recipients.filter((r) => r.openCount > 0).length,
    clicked: recipients.filter((r) => r.clickCount > 0).length,
    unsubscribed: recipients.filter((r) => r.unsubscribedAt).length,
  };
}

// ---- Admin queries ------------------------------------------------------------

export const listCampaigns = query({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);
    const campaigns = await ctx.db.query("emailCampaigns").order("desc").collect();

    return Promise.all(
      campaigns.map(async (campaign) => ({
        _id: campaign._id,
        name: campaign.name,
        subject: campaign.subject,
        status: campaign.status,
        templateId: campaign.templateId,
        updatedAt: campaign.updatedAt,
        sentAt: campaign.sentAt,
        stats: await campaignStats(ctx, campaign._id),
      })),
    );
  },
});

export const getCampaign = query({
  args: { id: v.id("emailCampaigns") },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const campaign = await ctx.db.get(args.id);

    if (!campaign) {
      return null;
    }

    const clicks = await ctx.db
      .query("emailClicks")
      .withIndex("by_campaign", (q) => q.eq("campaignId", campaign._id))
      .collect();
    const linkStats = (campaign.links ?? []).map((url, index) => {
      const linkClicks = clicks.filter((click) => click.linkIndex === index);
      return { url, clicks: linkClicks.length, uniqueClickers: new Set(linkClicks.map((c) => c.recipientId)).size };
    });

    return { campaign, stats: await campaignStats(ctx, campaign._id), linkStats };
  },
});

export const listRecipients = query({
  args: {
    id: v.id("emailCampaigns"),
    filter: v.union(v.literal("all"), v.literal("opened"), v.literal("clicked"), v.literal("not_opened"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const recipients = await ctx.db
      .query("emailRecipients")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.id))
      .collect();

    return recipients
      .filter((r) =>
        args.filter === "opened"
          ? r.openCount > 0
          : args.filter === "clicked"
            ? r.clickCount > 0
            : args.filter === "not_opened"
              ? r.status === "sent" && r.openCount === 0
              : args.filter === "failed"
                ? r.status === "failed" || r.status === "bounced"
                : true,
      )
      .slice(0, 1000)
      .map((r) => ({
        _id: r._id,
        name: r.name,
        email: r.email,
        status: r.status,
        error: r.error,
        sentAt: r.sentAt,
        openCount: r.openCount,
        clickCount: r.clickCount,
        unsubscribedAt: r.unsubscribedAt,
      }));
  },
});

/** Everyone who could receive email, with opt-out state, for the audience picker. */
export const audience = query({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);
    const users = await ctx.db.query("users").collect();

    return users
      .map((user) => ({
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        plan: user.subscriptionStatus,
        practiceGoal: user.practiceGoal ?? null,
        createdAt: user.createdAt,
        optedOut: Boolean(user.emailOptOut),
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
});

// ---- Draft editing ----------------------------------------------------------------

export const createDraft = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await requirePlatformAdmin(ctx);
    const now = new Date().toISOString();

    return ctx.db.insert("emailCampaigns", {
      name: "Untitled email",
      subject: "",
      preheader: "",
      fromName: "XINGO",
      templateId: "announcement",
      content: {
        headline: "",
        body: "Hi {{firstName}},\n\n",
        heroImageUrl: "/email/header-waves-dark.png",
        ctaLabel: "Start practising",
        ctaUrl: `${siteUrlFromEnv()}/dashboard`,
        sections: [],
        signature: "",
      },
      audience: { mode: "all", clerkIds: [] },
      batchSize: 50,
      batchIntervalMinutes: 0,
      status: "draft",
      createdByClerkId: admin.clerkId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateDraft = mutation({
  args: {
    id: v.id("emailCampaigns"),
    name: v.string(),
    subject: v.string(),
    preheader: v.string(),
    fromName: v.string(),
    templateId,
    content,
    audience: v.object({ mode: v.union(v.literal("all"), v.literal("selected")), clerkIds: v.array(v.string()) }),
    batchSize: v.number(),
    batchIntervalMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const campaign = await ctx.db.get(args.id);

    if (!campaign || campaign.status !== "draft") {
      throw new ConvexError("Only drafts can be edited.");
    }

    const { id, ...fields } = args;
    await ctx.db.patch(id, {
      ...fields,
      batchSize: Math.max(1, Math.min(100, Math.round(fields.batchSize))),
      batchIntervalMinutes: Math.max(0, Math.min(1440, Math.round(fields.batchIntervalMinutes))),
      updatedAt: new Date().toISOString(),
    });
  },
});

export const duplicate = mutation({
  args: { id: v.id("emailCampaigns") },
  handler: async (ctx, args) => {
    const admin = await requirePlatformAdmin(ctx);
    const campaign = await ctx.db.get(args.id);

    if (!campaign) {
      throw new ConvexError("Email not found.");
    }

    const now = new Date().toISOString();
    return ctx.db.insert("emailCampaigns", {
      name: `${campaign.name} (copy)`,
      subject: campaign.subject,
      preheader: campaign.preheader,
      fromName: campaign.fromName,
      templateId: campaign.templateId,
      content: campaign.content,
      audience: campaign.audience,
      batchSize: campaign.batchSize,
      batchIntervalMinutes: campaign.batchIntervalMinutes,
      status: "draft",
      createdByClerkId: admin.clerkId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteDraft = mutation({
  args: { id: v.id("emailCampaigns") },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const campaign = await ctx.db.get(args.id);

    if (campaign?.status === "draft") {
      await ctx.db.delete(args.id);
    }
  },
});

export const generateImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

export const resolveImageUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const url = await ctx.storage.getUrl(args.storageId);

    if (!url) {
      throw new ConvexError("Couldn't load that image.");
    }

    return url;
  },
});

// ---- Sending ------------------------------------------------------------------------

function validateForSend(campaign: Doc<"emailCampaigns">) {
  if (!campaign.subject.trim()) throw new ConvexError("Add a subject line first.");
  if (!campaign.content.body.trim()) throw new ConvexError("The email body is empty.");
  if (campaign.content.ctaLabel && !/^https?:\/\//.test(campaign.content.ctaUrl ?? "")) {
    throw new ConvexError("The button link must start with https://");
  }
}

/** Freezes the audience into recipient rows and starts the batch sender. */
export const queueSend = mutation({
  args: { id: v.id("emailCampaigns") },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const campaign = await ctx.db.get(args.id);

    if (!campaign || campaign.status !== "draft") {
      throw new ConvexError("This email has already been sent.");
    }

    validateForSend(campaign);

    const users = await ctx.db.query("users").collect();
    const wanted = campaign.audience.mode === "all" ? null : new Set(campaign.audience.clerkIds);
    const seen = new Set<string>();
    let queued = 0;

    for (const user of users) {
      const email = user.email.trim().toLowerCase();

      if ((wanted && !wanted.has(user.clerkId)) || user.emailOptOut || !email.includes("@") || seen.has(email)) {
        continue;
      }

      seen.add(email);
      await ctx.db.insert("emailRecipients", {
        campaignId: campaign._id,
        clerkId: user.clerkId,
        email,
        name: user.name,
        token: crypto.randomUUID(),
        status: "queued",
        openCount: 0,
        clickCount: 0,
      });
      queued += 1;
    }

    if (queued === 0) {
      throw new ConvexError("Nobody to send to — everyone selected has unsubscribed or has no email.");
    }

    const now = new Date().toISOString();
    await ctx.db.patch(campaign._id, {
      status: "sending",
      links: collectLinks(campaign.templateId, campaign.content, siteUrlFromEnv()),
      sendStartedAt: now,
      updatedAt: now,
    });
    await ctx.scheduler.runAfter(0, internal.emailActions.processBatch, { campaignId: campaign._id });

    return { queued };
  },
});

export const cancelSend = mutation({
  args: { id: v.id("emailCampaigns") },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const campaign = await ctx.db.get(args.id);

    if (campaign?.status === "sending") {
      await ctx.db.patch(args.id, { status: "cancelled", updatedAt: new Date().toISOString() });
    }
  },
});

// ---- Internal: used by the batch sender ---------------------------------------------------

export const getCampaignInternal = internalQuery({
  args: { campaignId: v.id("emailCampaigns") },
  handler: async (ctx, args) => ctx.db.get(args.campaignId),
});

/**
 * Atomically claims the next batch (queued -> sending) so a recipient can never
 * be picked up twice, even if two sender runs overlap.
 */
export const claimBatch = internalMutation({
  args: { campaignId: v.id("emailCampaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);

    if (!campaign || campaign.status !== "sending") {
      return null;
    }

    const recipients = await ctx.db
      .query("emailRecipients")
      .withIndex("by_campaign_status", (q) => q.eq("campaignId", args.campaignId).eq("status", "queued"))
      .take(Math.max(1, Math.min(100, campaign.batchSize)));

    for (const recipient of recipients) {
      await ctx.db.patch(recipient._id, { status: "sending" });
    }

    return { campaign, recipients };
  },
});

/** Puts claimed recipients back in the queue (e.g. after a rate-limit response). */
export const releaseBatch = internalMutation({
  args: { recipientIds: v.array(v.id("emailRecipients")) },
  handler: async (ctx, args) => {
    for (const id of args.recipientIds) {
      await ctx.db.patch(id, { status: "queued" });
    }
  },
});

export const recordBatchResults = internalMutation({
  args: {
    results: v.array(
      v.object({
        recipientId: v.id("emailRecipients"),
        ok: v.boolean(),
        providerMessageId: v.optional(v.string()),
        error: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    for (const result of args.results) {
      await ctx.db.patch(result.recipientId, result.ok
        ? { status: "sent", providerMessageId: result.providerMessageId, sentAt: now }
        : { status: "failed", error: result.error?.slice(0, 300) });
    }
  },
});

export const finishCampaign = internalMutation({
  args: { campaignId: v.id("emailCampaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);

    if (campaign?.status === "sending") {
      const now = new Date().toISOString();
      await ctx.db.patch(args.campaignId, { status: "sent", sentAt: now, updatedAt: now });
    }
  },
});

// ---- Internal: tracking (called from http.ts) ----------------------------------------------

export const recordOpen = internalMutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const recipient = await ctx.db
      .query("emailRecipients")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (recipient) {
      await ctx.db.patch(recipient._id, {
        openCount: recipient.openCount + 1,
        firstOpenedAt: recipient.firstOpenedAt ?? new Date().toISOString(),
      });
    }
  },
});

/** Records a click and returns where to redirect (only URLs frozen in the campaign — no open redirect). */
export const recordClick = internalMutation({
  args: { token: v.string(), linkIndex: v.number() },
  handler: async (ctx, args) => {
    const fallback = siteUrlFromEnv();
    const recipient = await ctx.db
      .query("emailRecipients")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!recipient) {
      return fallback;
    }

    const campaign = await ctx.db.get(recipient.campaignId);
    const url = campaign?.links?.[args.linkIndex];

    if (!url) {
      return fallback;
    }

    const now = new Date().toISOString();
    await ctx.db.patch(recipient._id, {
      clickCount: recipient.clickCount + 1,
      firstClickedAt: recipient.firstClickedAt ?? now,
      // A click implies the email was opened even if images were blocked.
      openCount: Math.max(recipient.openCount, 1),
      firstOpenedAt: recipient.firstOpenedAt ?? now,
    });
    await ctx.db.insert("emailClicks", {
      campaignId: recipient.campaignId,
      recipientId: recipient._id,
      linkIndex: args.linkIndex,
      createdAt: now,
    });

    return url;
  },
});

export const unsubscribe = internalMutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const recipient = await ctx.db
      .query("emailRecipients")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!recipient) {
      return { ok: false };
    }

    const now = new Date().toISOString();
    await ctx.db.patch(recipient._id, { unsubscribedAt: recipient.unsubscribedAt ?? now });

    const user = recipient.clerkId
      ? await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", recipient.clerkId!))
          .unique()
      : await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", recipient.email))
          .unique();

    if (user && !user.emailOptOut) {
      await ctx.db.patch(user._id, { emailOptOut: true, emailOptOutAt: now });
    }

    return { ok: true };
  },
});

/** Provider feedback (Resend webhook): bounces and spam complaints. */
export const recordDeliveryEvent = internalMutation({
  args: { providerMessageId: v.string(), type: v.union(v.literal("bounced"), v.literal("complained")) },
  handler: async (ctx, args) => {
    const recipient = await ctx.db
      .query("emailRecipients")
      .withIndex("by_providerMessageId", (q) => q.eq("providerMessageId", args.providerMessageId))
      .unique();

    if (!recipient) {
      return;
    }

    if (args.type === "bounced") {
      await ctx.db.patch(recipient._id, { status: "bounced", error: "Bounced" });
      return;
    }

    // A spam complaint means: never email this person again.
    const user = recipient.clerkId
      ? await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", recipient.clerkId!))
          .unique()
      : null;
    const now = new Date().toISOString();
    await ctx.db.patch(recipient._id, { unsubscribedAt: recipient.unsubscribedAt ?? now });
    if (user) await ctx.db.patch(user._id, { emailOptOut: true, emailOptOutAt: now });
  },
});

/** Lets a signed-in user turn admin emails back on from Account. */
export const setMyEmailPreference = mutation({
  args: { subscribed: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        emailOptOut: !args.subscribed,
        emailOptOutAt: args.subscribed ? undefined : new Date().toISOString(),
      });
    }
  },
});
