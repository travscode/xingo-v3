import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { action, internalAction, type ActionCtx } from "./_generated/server";
import { getClerkIdFromIdentity } from "./model/auth";
import { renderEmail } from "../lib/email/render";
import { siteUrlFromEnv } from "./emails";

/**
 * Email delivery through Resend (https://resend.com). Configuration lives in
 * Convex env vars — see docs/runbooks/email-setup.md:
 *   RESEND_API_KEY, EMAIL_FROM_ADDRESS, EMAIL_REPLY_TO, EMAIL_SENDER_NAME, EMAIL_POSTAL_ADDRESS
 */

type Campaign = Doc<"emailCampaigns">;

function emailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM_ADDRESS;

  if (!apiKey || !fromAddress) {
    throw new ConvexError("EMAIL_NOT_CONFIGURED");
  }

  return {
    apiKey,
    fromAddress,
    replyTo: process.env.EMAIL_REPLY_TO,
    senderName: process.env.EMAIL_SENDER_NAME ?? "XINGO",
    senderAddress: process.env.EMAIL_POSTAL_ADDRESS ?? "Australia",
  };
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

function buildMessage(
  campaign: Campaign,
  recipient: { name: string; email: string; token?: string },
  config: ReturnType<typeof emailConfig>,
  options: { track: boolean; subjectPrefix?: string },
) {
  const siteUrl = siteUrlFromEnv();
  const links = campaign.links ?? [];
  const token = recipient.token;
  const unsubscribeUrl = token ? `${siteUrl}/e/u/${token}` : `${siteUrl}/account`;
  const { html, text } = renderEmail(
    campaign.templateId,
    campaign.content,
    { preheader: campaign.preheader },
    {
      siteUrl,
      recipient: { firstName: firstName(recipient.name), name: recipient.name, email: recipient.email },
      unsubscribeUrl,
      senderName: config.senderName,
      senderAddress: config.senderAddress,
      trackLink:
        options.track && token
          ? (url) => {
              const index = links.indexOf(url);
              return index === -1 ? url : `${siteUrl}/e/c/${token}/${index}`;
            }
          : undefined,
      openPixelUrl: options.track && token ? `${siteUrl}/e/o/${token}.gif` : undefined,
    },
  );

  return {
    from: `${campaign.fromName || "XINGO"} <${config.fromAddress}>`,
    to: [recipient.email],
    subject: `${options.subjectPrefix ?? ""}${campaign.subject}`,
    html,
    text,
    ...(config.replyTo ? { reply_to: config.replyTo } : {}),
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}

async function postBatch(apiKey: string, messages: unknown[]) {
  const response = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(messages),
  });
  const body = (await response.json().catch(() => ({}))) as { data?: Array<{ id: string }>; message?: string };
  return { status: response.status, ok: response.ok, body };
}

async function requireAdmin(ctx: ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("Not authenticated");
  }

  const isAdmin = await ctx.runQuery(internal.admin.requireAdminInternal, {
    clerkId: getClerkIdFromIdentity(identity),
  });

  if (!isAdmin) {
    throw new ConvexError("Not authorized");
  }

  return identity;
}

/** Sends a test copy (no tracking, "[Test]" subject) to up to five addresses. */
export const sendTest = action({
  args: { id: v.id("emailCampaigns"), to: v.array(v.string()) },
  handler: async (ctx, args): Promise<{ sent: number }> => {
    const identity = await requireAdmin(ctx);
    const config = emailConfig();
    const campaign = await ctx.runQuery(internal.emails.getCampaignInternal, { campaignId: args.id });

    if (!campaign) {
      throw new ConvexError("Email not found.");
    }

    const addresses = args.to.map((address) => address.trim().toLowerCase()).filter((a) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a)).slice(0, 5);

    if (addresses.length === 0) {
      throw new ConvexError("Enter at least one valid email address.");
    }

    const name = identity.name ?? "XINGO admin";
    const messages = addresses.map((email) =>
      buildMessage(campaign, { name, email }, config, { track: false, subjectPrefix: "[Test] " }),
    );
    const response = await postBatch(config.apiKey, messages);

    if (!response.ok) {
      throw new ConvexError(`The email service rejected the test: ${response.body.message ?? response.status}`);
    }

    return { sent: addresses.length };
  },
});

/**
 * Sends the next batch of queued recipients, then schedules itself until the
 * queue is empty. Batch size and spacing come from the campaign.
 */
export const processBatch = internalAction({
  args: { campaignId: v.id("emailCampaigns") },
  handler: async (ctx, args) => {
    const batch = await ctx.runMutation(internal.emails.claimBatch, { campaignId: args.campaignId });

    if (!batch) {
      return;
    }

    if (batch.recipients.length === 0) {
      await ctx.runMutation(internal.emails.finishCampaign, { campaignId: args.campaignId });
      return;
    }

    let config: ReturnType<typeof emailConfig>;

    try {
      config = emailConfig();
    } catch {
      await ctx.runMutation(internal.emails.recordBatchResults, {
        results: batch.recipients.map((r) => ({ recipientId: r._id, ok: false, error: "Email sending isn't configured (RESEND_API_KEY / EMAIL_FROM_ADDRESS)." })),
      });
      await ctx.scheduler.runAfter(0, internal.emailActions.processBatch, args);
      return;
    }

    const messages = batch.recipients.map((recipient) =>
      buildMessage(batch.campaign, recipient, config, { track: true }),
    );
    const response = await postBatch(config.apiKey, messages);

    if (response.status === 429) {
      // Rate limited: put the batch back and try again shortly.
      await ctx.runMutation(internal.emails.releaseBatch, { recipientIds: batch.recipients.map((r) => r._id) });
      await ctx.scheduler.runAfter(2000, internal.emailActions.processBatch, args);
      return;
    }

    await ctx.runMutation(internal.emails.recordBatchResults, {
      results: batch.recipients.map((recipient, index) =>
        response.ok && response.body.data?.[index]?.id
          ? { recipientId: recipient._id, ok: true, providerMessageId: response.body.data[index].id }
          : { recipientId: recipient._id, ok: false, error: response.body.message ?? `HTTP ${response.status}` },
      ),
    });

    const delayMs = batch.campaign.batchIntervalMinutes > 0 ? batch.campaign.batchIntervalMinutes * 60_000 : 1000;
    await ctx.scheduler.runAfter(delayMs, internal.emailActions.processBatch, args);
  },
});
