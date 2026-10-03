/**
 * Customer (transactional) emails: the content for each major account event.
 * Rendered with the branded "letter" template (lib/email/render.ts) and sent by
 * convex/transactional.ts. Framework-free. No monthly invoices (D-036).
 */

import type { EmailContent, EmailTemplateId } from "./render";
import { EARNINGS_HOLD_DAYS, formatAud, PAYOUT_THRESHOLD_CENTS } from "../marketplace";
import { packs, plans, isPackId } from "../plans";

export type TransactionalEmail =
  | { kind: "welcome" }
  | { kind: "pack_purchased"; packId: string }
  | { kind: "pro_started" }
  | { kind: "pro_cancelling"; endsAt?: string }
  | { kind: "pro_ended" }
  | { kind: "payment_failed" }
  | { kind: "course_published"; courseTitle: string; slug: string }
  | { kind: "payout_sent"; amountCents: number }
  | { kind: "payout_account_ready" }
  | { kind: "course_removed"; courseTitle: string; reason: string }
  | { kind: "minutes_used_up"; resetsOn: string };

export type BuiltEmail = { subject: string; preheader: string; templateId: EmailTemplateId; content: EmailContent };

const signature = "The XINGO team";

function longDate(iso?: string) {
  if (!iso) return "the end of your current billing period";
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "Australia/Sydney" });
}

export function buildTransactionalEmail(email: TransactionalEmail, siteUrl: string): BuiltEmail {
  const free = plans.free;
  const pro = plans.professional;

  switch (email.kind) {
    case "welcome":
      return {
        subject: "Welcome to XINGO, {{firstName}}",
        preheader: `Your ${free.monthlyMinutes} free practice minutes are ready.`,
        templateId: "letter",
        content: {
          body: [
            "Hi {{firstName}},",
            "Welcome to XINGO. You can now practise spoken interpreting and speaking exams out loud, with AI role-players and a score at the end of every assessed session.",
            `You have **${free.monthlyMinutes} free practice minutes** every month. Here's how to make the most of them:`,
            "- **Pick a course** for the test you're preparing for, or try one from the marketplace.\n- **Use headphones** and hold Space (or the mic button) while you talk.\n- **Start in Practice mode** to see the transcript and tips, then switch to Assessed for a score.",
            "If anything isn't clear, just reply to this email.",
          ].join("\n\n"),
          ctaLabel: "Start your first practice",
          ctaUrl: `${siteUrl}/dashboard`,
          signature,
        },
      };

    case "pack_purchased": {
      const pack = isPackId(email.packId) ? packs[email.packId] : null;
      const minutes = pack ? `${pack.minutes} practice minutes` : "Your practice minutes";
      return {
        subject: pack ? `Your ${pack.label} minutes are ready` : "Your practice minutes are ready",
        preheader: `${minutes} have been added to your account. They never expire.`,
        templateId: "letter",
        content: {
          body: [
            "Hi {{firstName}},",
            `Thanks for your purchase. **${minutes}** have been added to your account${pack ? ` (${pack.label}, ${pack.priceLabel})` : ""}.`,
            "Pack minutes never expire. Any monthly minutes you have are used first, then pack minutes.",
            `Your receipt is in **Plan & minutes → Invoices & payment**.`,
          ].join("\n\n"),
          ctaLabel: "Start practising",
          ctaUrl: `${siteUrl}/courses`,
          signature,
        },
      };
    }

    case "pro_started":
      return {
        subject: `Welcome to XINGO ${pro.label}`,
        preheader: `${pro.monthlyMinutes} practice minutes every month and every course unlocked.`,
        templateId: "letter",
        content: {
          body: [
            "Hi {{firstName}},",
            `You're now on **XINGO ${pro.label}** (${pro.priceLabel}). That means:`,
            `- **${pro.monthlyMinutes} practice minutes** every month\n- **Every course** unlocked, including the premium exam courses\n- Pack minutes you already have stay on your account`,
            "Your plan renews automatically each month. You can change your card, see invoices or cancel any time from **Plan & minutes → Invoices & payment**.",
          ].join("\n\n"),
          ctaLabel: "Go to my courses",
          ctaUrl: `${siteUrl}/courses`,
          signature,
        },
      };

    case "pro_cancelling":
      return {
        subject: `Your ${pro.label} plan ends on ${longDate(email.endsAt)}`,
        preheader: `You keep ${pro.label} until then. Pack minutes stay on your account.`,
        templateId: "letter",
        content: {
          body: [
            "Hi {{firstName}},",
            `We've cancelled your ${pro.label} subscription as requested. You won't be charged again, and you keep everything in ${pro.label} until **${longDate(email.endsAt)}**.`,
            `After that you'll move to the Free plan (${free.monthlyMinutes} minutes a month). Any pack minutes you've bought stay on your account and never expire.`,
            "Changed your mind? You can resume from **Plan & minutes → Invoices & payment** before then.",
          ].join("\n\n"),
          ctaLabel: "Manage my plan",
          ctaUrl: `${siteUrl}/billing`,
          signature,
        },
      };

    case "pro_ended":
      return {
        subject: `Your ${pro.label} plan has ended`,
        preheader: `You're now on the Free plan with ${free.monthlyMinutes} minutes a month.`,
        templateId: "letter",
        content: {
          body: [
            "Hi {{firstName}},",
            `Your ${pro.label} plan has ended and your account is now on the Free plan, with **${free.monthlyMinutes} practice minutes** each month. Your results and progress are all still there, and any pack minutes you've bought stay on your account.`,
            "Whenever you're ready for more practice, you can go Pro again or buy a minute pack.",
          ].join("\n\n"),
          ctaLabel: "See plans",
          ctaUrl: `${siteUrl}/billing`,
          signature,
        },
      };

    case "payment_failed":
      return {
        subject: "Action needed: we couldn't take your XINGO payment",
        preheader: "Update your payment details to keep your Pro plan.",
        templateId: "letter",
        content: {
          body: [
            "Hi {{firstName}},",
            `We tried to renew your ${pro.label} plan but the payment didn't go through. This is often an expired card or a bank check.`,
            "We'll try again over the next few days. To avoid losing Pro, please update your payment details:",
            "**Plan & minutes → Invoices & payment → Update payment method**",
          ].join("\n\n"),
          ctaLabel: "Update payment details",
          ctaUrl: `${siteUrl}/billing`,
          signature,
        },
      };

    case "course_published":
      return {
        subject: `Your course is live: ${email.courseTitle}`,
        preheader: "Share the link so learners can find it.",
        templateId: "letter",
        content: {
          body: [
            "Hi {{firstName}},",
            `**${email.courseTitle}** is now published on the XINGO marketplace. Learners can find it, add it to their library and practise it.`,
            "To get your first learners:",
            "- **Share the link** with your students, team or followers.\n- **Complete the course page**: a banner, logo and three or more scenarios help people decide.\n- **Watch Insights** to see views, learners and sessions.",
          ].join("\n\n"),
          ctaLabel: "View my course",
          ctaUrl: `${siteUrl}/marketplace/${email.slug}`,
          signature,
        },
      };

    case "payout_sent":
      return {
        subject: `You've been paid ${formatAud(email.amountCents)}`,
        preheader: "Your XINGO course earnings are on their way to your bank.",
        templateId: "letter",
        content: {
          body: [
            "Hi {{firstName}},",
            `We've sent **${formatAud(email.amountCents)}** of course earnings to your Stripe account. Stripe pays it into your bank on your payout schedule, usually within a few business days.`,
            "You can see every payout on your Earnings page and in your Stripe dashboard.",
          ].join("\n\n"),
          ctaLabel: "View my earnings",
          ctaUrl: `${siteUrl}/marketplace/earnings`,
          signature,
        },
      };

    case "payout_account_ready":
      return {
        subject: "Payouts are set up",
        preheader: "Your course earnings will now be paid to your bank.",
        templateId: "letter",
        content: {
          body: [
            "Hi {{firstName}},",
            "Stripe has verified your payout account, so your XINGO course earnings can now be paid to your bank.",
            `Earnings are paid monthly once your available balance reaches ${formatAud(PAYOUT_THRESHOLD_CENTS)}, after a ${EARNINGS_HOLD_DAYS}-day holding period for refunds. You'll get an email each time we send a payout.`,
          ].join("\n\n"),
          ctaLabel: "View my earnings",
          ctaUrl: `${siteUrl}/marketplace/earnings`,
          signature,
        },
      };

    case "course_removed":
      return {
        subject: `Your course has been removed: ${email.courseTitle}`,
        preheader: "It's no longer visible on the marketplace.",
        templateId: "letter",
        content: {
          body: [
            "Hi {{firstName}},",
            `We've removed **${email.courseTitle}** from the XINGO marketplace. Learners can no longer find or practise it.`,
            `**Reason:** ${email.reason}`,
            "If you think this is a mistake, or you'd like to fix the course and have it restored, reply to this email and we'll take a look.",
          ].join("\n\n"),
          ctaLabel: "Read the Creator Terms",
          ctaUrl: `${siteUrl}/creator-terms`,
          signature,
        },
      };

    case "minutes_used_up":
      return {
        subject: "You've used this month's practice minutes",
        preheader: `Your free minutes come back on ${longDate(email.resetsOn)}, or keep going now.`,
        templateId: "letter",
        content: {
          body: [
            "Hi {{firstName}},",
            `Nice work: you've used all your practice minutes for this month. Your monthly minutes come back on **${longDate(email.resetsOn)}**.`,
            `If your test is coming up, you can keep practising now with a minute pack (they never expire) or ${pro.label}, which includes ${pro.monthlyMinutes} minutes a month.`,
          ].join("\n\n"),
          ctaLabel: "Get more minutes",
          ctaUrl: `${siteUrl}/billing`,
          signature,
        },
      };
  }
}
