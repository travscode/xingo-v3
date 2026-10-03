import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalQuery } from "./_generated/server";
import { getUserByClerkId } from "./model/auth";
import { siteUrlFromEnv } from "./emails";
import { renderEmail } from "../lib/email/render";
import { buildTransactionalEmail, type TransactionalEmail } from "../lib/email/transactional";

/**
 * Customer emails for major account events (D-036), sent through Resend.
 * Queue them with `queueEmail` (convex/model/notify.ts), never from the client.
 * Service emails go even if someone opted out of news emails (as the Privacy
 * Policy says); they never include marketing.
 */

const email = v.union(
  v.object({ kind: v.literal("welcome") }),
  v.object({ kind: v.literal("pack_purchased"), packId: v.string() }),
  v.object({ kind: v.literal("pro_started") }),
  v.object({ kind: v.literal("pro_cancelling"), endsAt: v.optional(v.string()) }),
  v.object({ kind: v.literal("pro_ended") }),
  v.object({ kind: v.literal("payment_failed") }),
  v.object({ kind: v.literal("course_published"), courseTitle: v.string(), slug: v.string() }),
  v.object({ kind: v.literal("payout_sent"), amountCents: v.number() }),
  v.object({ kind: v.literal("payout_account_ready") }),
  v.object({ kind: v.literal("course_removed"), courseTitle: v.string(), reason: v.string() }),
  v.object({ kind: v.literal("minutes_used_up"), resetsOn: v.string() }),
  v.object({
    kind: v.literal("org_collection_invite"),
    orgName: v.string(),
    collectionTitle: v.string(),
    inviterName: v.string(),
    url: v.string(),
  }),
  v.object({ kind: v.literal("org_team_invite"), orgName: v.string(), role: v.string(), inviterName: v.string(), url: v.string() }),
  v.object({ kind: v.literal("org_access_approved"), orgName: v.string(), collectionTitle: v.string(), url: v.string() }),
  v.object({
    kind: v.literal("org_access_requested"),
    requesterName: v.string(),
    requesterEmail: v.string(),
    collectionTitle: v.string(),
    url: v.string(),
  }),
);

export const recipient = internalQuery({
  args: { clerkId: v.optional(v.string()), toEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.clerkId) {
      const user = await getUserByClerkId(ctx, args.clerkId);
      return user ? { email: user.email, name: user.name } : null;
    }
    if (!args.toEmail) return null;
    // Invitations can go to people without an account yet.
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.toEmail!))
      .first();
    return { email: args.toEmail, name: user?.name ?? "" };
  },
});

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

export const send = internalAction({
  args: { clerkId: v.optional(v.string()), toEmail: v.optional(v.string()), email, dedupeKey: v.string() },
  handler: async (ctx, args): Promise<{ sent: boolean; reason?: string }> => {
    const apiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.EMAIL_FROM_ADDRESS;
    if (!apiKey || !fromAddress) {
      console.warn("[transactional] email not configured; skipped", args.email.kind);
      return { sent: false, reason: "not_configured" };
    }

    const to = await ctx.runQuery(internal.transactional.recipient, { clerkId: args.clerkId, toEmail: args.toEmail });
    if (!to?.email) return { sent: false, reason: "no_recipient" };

    const site = siteUrlFromEnv();
    const senderName = process.env.EMAIL_SENDER_NAME ?? "XINGO";
    const built = buildTransactionalEmail(args.email as TransactionalEmail, site);
    const person = { firstName: firstName(to.name), name: to.name, email: to.email };
    const { html, text } = renderEmail(built.templateId, built.content, { preheader: built.preheader }, {
      siteUrl: site,
      recipient: person,
      // Service emails: the footer link goes to email preferences rather than a one-click unsubscribe.
      unsubscribeUrl: `${site}/account`,
      senderName,
      senderAddress: process.env.EMAIL_POSTAL_ADDRESS ?? "Australia",
    });
    const subject = built.subject.replace(/\{\{\s*firstName\s*\}\}/g, person.firstName);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": args.dedupeKey.slice(0, 256),
      },
      body: JSON.stringify({
        from: `${senderName} <${fromAddress}>`,
        to: [to.email],
        reply_to: process.env.EMAIL_REPLY_TO || undefined,
        subject,
        html,
        text,
        tags: [{ name: "type", value: args.email.kind }],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("[transactional] Resend error", response.status, args.email.kind, detail.slice(0, 300));
      // 409 = same idempotency key already used: the email was already sent.
      return { sent: false, reason: response.status === 409 ? "duplicate" : `resend_${response.status}` };
    }

    return { sent: true };
  },
});
