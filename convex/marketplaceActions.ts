import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { siteUrlFromEnv } from "./emails";
import { reportReasons } from "../lib/marketplace";

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

/** Emails every platform admin when a course is reported. Skips quietly if email isn't configured. */
export const notifyAdminsOfReport = internalAction({
  args: { reportId: v.id("contentReports") },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM_ADDRESS;
    const data = await ctx.runQuery(internal.marketplace.reportForEmail, { reportId: args.reportId });

    if (!apiKey || !from || !data || data.adminEmails.length === 0) {
      console.warn("[notifyAdminsOfReport] email not sent (not configured or no admins)");
      return;
    }

    const site = siteUrlFromEnv();
    const reason = reportReasons.find((item) => item.id === data.reason)?.label ?? data.reason;
    const courseUrl = data.slug ? `${site}/marketplace/${data.slug}` : site;
    const html = `<div style="font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.5;color:#000">
<p><strong>A course was reported on the XINGO marketplace.</strong></p>
<p>Course: <a href="${courseUrl}">${escape(data.courseTitle)}</a><br>Reason: ${escape(reason)}</p>
${data.details ? `<p style="white-space:pre-wrap;background:#f3f3f3;padding:12px;border-radius:8px">${escape(data.details)}</p>` : ""}
<p><a href="${site}/admin?tab=reports">Review it in Admin → Reports</a></p></div>`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `${process.env.EMAIL_SENDER_NAME ?? "XINGO"} <${from}>`,
        to: data.adminEmails,
        subject: `Course reported: ${data.courseTitle}`,
        html,
        text: `A course was reported: ${data.courseTitle} (${reason}).\n${data.details}\nReview: ${site}/admin?tab=reports`,
      }),
    });

    if (!response.ok) {
      console.error("[notifyAdminsOfReport]", response.status, await response.text());
    }
  },
});
