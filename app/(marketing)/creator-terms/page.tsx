import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, type LegalSection } from "@/components/marketing/legal/legal-document";
import { LEGAL_CONTACT_EMAIL } from "@/lib/legal";
import {
  CREATOR_GUIDELINES,
  CREATOR_REVENUE_SHARE,
  EARNINGS_HOLD_DAYS,
  formatAud,
  netMinuteValueCents,
  PAYOUT_THRESHOLD_CENTS,
} from "@/lib/marketplace";
import { pageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Creator Terms",
  description: "The terms for publishing practice courses on the XINGO marketplace: your content, earnings, payouts, guidelines and removal.",
  path: "/creator-terms",
});

const share = Math.round(CREATOR_REVENUE_SHARE * 100);
const mail = <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>;
const cents = (value: number) => `${(value * CREATOR_REVENUE_SHARE).toFixed(1)}¢`;

const sections: LegalSection[] = [
  {
    id: "scope",
    heading: "These terms",
    body: (
      <p>
        These Creator Terms apply when you create or publish a course on the XINGO marketplace. They add to our{" "}
        <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>. You accept them when you publish
        a course.
      </p>
    ),
  },
  {
    id: "content",
    heading: "Your content",
    body: (
      <>
        <p>
          You keep ownership of the courses you create: titles, descriptions, scenarios, task cards and images you upload. You give
          XINGO a non-exclusive, worldwide, royalty-free licence to host, display, promote and run your course on the Service while
          it&apos;s published, including having AI voices perform your characters and generating scores and feedback. Learners may
          keep their own transcripts and results after a course is unpublished.
        </p>
        <p>You promise that:</p>
        <ul>
          <li>you own your content or have permission to use it, including any logos, images and certification names;</li>
          <li>your course follows the creator guidelines below and doesn&apos;t break any law or anyone else&apos;s rights; and</li>
          <li>
            you don&apos;t claim, or imply, that a certification body, employer or other organisation endorses your course unless it
            has agreed in writing.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "guidelines",
    heading: "Creator guidelines",
    body: (
      <ul>
        {CREATOR_GUIDELINES.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    ),
  },
  {
    id: "earnings",
    heading: "How you earn",
    body: (
      <>
        <p>
          Learners pay XINGO for practice minutes through a paid plan or minute packs. When learners practise in your course, you earn{" "}
          <strong>{share}% of XINGO&apos;s net revenue</strong> from the paid minutes they spend in it. Net revenue means the price
          paid, less GST and an allowance for payment processing fees.
        </p>
        <ul>
          <li>
            A paid plan minute is valued at the plan price divided by its monthly minutes; a pack minute at the lowest per-minute pack
            price. At current prices you earn about {cents(netMinuteValueCents("allowance", "professional"))} per paid plan minute and
            about {cents(netMinuteValueCents("pack", "free"))} per pack minute.
          </li>
          <li>Free-plan minutes, your own practice, and practice by XINGO staff don&apos;t earn.</li>
          <li>Your earnings for each session are recorded when it ends and shown on your Earnings page.</li>
          <li>
            We may change the share or how minutes are valued. We&apos;ll give you at least 30 days&apos; notice, and changes
            won&apos;t affect earnings already recorded.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "payouts",
    heading: "Payouts",
    body: (
      <ul>
        <li>
          Payouts are made through Stripe Connect. To receive them you set up a Stripe account from your Earnings page and accept
          Stripe&apos;s Connected Account Agreement. Stripe verifies your identity and bank details.
        </li>
        <li>
          Earnings are held for {EARNINGS_HOLD_DAYS} days to cover refunds and chargebacks, then paid monthly once your available
          balance is at least {formatAud(PAYOUT_THRESHOLD_CENTS)}. Smaller balances carry over.
        </li>
        <li>
          If a learner&apos;s payment is refunded or reversed, we may deduct the related earnings from your balance or future
          payouts.
        </li>
        <li>
          You&apos;re responsible for your own tax, including GST if you&apos;re registered. We may ask for your ABN and GST status
          and provide earnings statements.
        </li>
        <li>
          Payouts are made in Australian dollars. Creator payouts are currently available to creators who can hold a Stripe account in
          Australia.
        </li>
      </ul>
    ),
  },
  {
    id: "removal",
    heading: "Reports, removal and withholding",
    body: (
      <ul>
        <li>Learners can report courses. We review reports and may ask you to change a course.</li>
        <li>
          We may unpublish or remove a course that breaks these terms or the guidelines, or that we reasonably believe could harm
          learners or others. We&apos;ll tell you why, except where the law or safety prevents it.
        </li>
        <li>
          We may withhold earnings connected to a serious breach (for example, content you don&apos;t have the rights to) while we
          investigate, and keep them where the breach is confirmed.
        </li>
        <li>You can unpublish your course at any time. Earnings already recorded remain payable under these terms.</li>
      </ul>
    ),
  },
  {
    id: "general",
    heading: "General",
    body: (
      <ul>
        <li>You&apos;re an independent creator, not XINGO&apos;s employee, contractor or agent.</li>
        <li>
          XINGO doesn&apos;t guarantee any number of learners or amount of earnings, and may change how the marketplace ranks and
          shows courses.
        </li>
        <li>
          We may update these terms with at least 30 days&apos; notice for material changes. If you don&apos;t agree, you can unpublish
          your courses.
        </li>
        <li>Questions: {mail}.</li>
      </ul>
    ),
  },
];

export default function CreatorTermsPage() {
  return (
    <LegalDocument
      title="Creator Terms"
      current="/creator-terms"
      sections={sections}
      summary={
        <>
          <p className="font-semibold">The short version</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>You own your course; you let XINGO host, run and promote it while it&apos;s published.</li>
            <li>
              You earn {share}% of XINGO&apos;s net revenue from paid minutes practised in your course, paid monthly via Stripe from{" "}
              {formatAud(PAYOUT_THRESHOLD_CENTS)}, after a {EARNINGS_HOLD_DAYS}-day hold.
            </li>
            <li>Only publish content you have the rights to, and don&apos;t imply endorsements you don&apos;t have.</li>
          </ul>
        </>
      }
    />
  );
}
