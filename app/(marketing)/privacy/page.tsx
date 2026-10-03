import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, type LegalSection } from "@/components/marketing/legal/legal-document";
import { LEGAL_ABN, LEGAL_CONTACT_EMAIL, LEGAL_ENTITY } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How XINGO collects, uses, stores and protects your personal information, including voice practice, transcripts, payments and analytics.",
  path: "/privacy",
});

const mail = <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>;

const providers = [
  ["Clerk", "Sign-in and account security", "Name, email, sign-in details"],
  ["Convex", "Our database and servers", "Your account, practice records, transcripts and results"],
  ["OpenAI", "AI voices, speech-to-text, scoring and feedback", "Your voice during a session, transcripts, scenario content"],
  ["Stripe", "Payments, subscriptions and creator payouts", "Payment details (we never see full card numbers); creators' payout and identity details"],
  ["Resend", "Sending emails", "Your name and email, and whether emails are opened or clicked"],
  ["Google Analytics", "Understanding how the website is used", "Pages visited, device and approximate location (IP addresses are anonymised)"],
  ["Vercel", "Hosting the website", "Technical request data such as IP address"],
];

const sections: LegalSection[] = [
  {
    id: "who",
    heading: "Who we are",
    body: (
      <p>
        {LEGAL_ENTITY} (ABN {LEGAL_ABN}) (&ldquo;XINGO&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) runs xingo.ai and the XINGO practice app. We handle personal information in line
        with the <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles. This policy explains what we collect, why,
        who we share it with, and your choices. Contact us at {mail}.
      </p>
    ),
  },
  {
    id: "collect",
    heading: "What we collect",
    body: (
      <ul>
        <li>
          <strong>Account details:</strong> your name, email address, profile picture (if your sign-in provides one), and sign-in
          information.
        </li>
        <li>
          <strong>Preferences:</strong> what you&apos;re preparing for, your practice languages, and email preferences.
        </li>
        <li>
          <strong>Practice sessions:</strong> while a session is live, your voice is streamed to our AI provider so the AI characters
          can hear and answer you. We keep a text transcript of the session, your scores and feedback, timing, and minutes used. We do{" "}
          <strong>not</strong> store recordings of your voice.
        </li>
        <li>
          <strong>Camera:</strong> if you turn on the optional self-view, the video stays in your browser. It is not recorded or sent
          to us.
        </li>
        <li>
          <strong>Payments:</strong> your plan, purchases and billing history. Card details are handled by Stripe; we never see your
          full card number.
        </li>
        <li>
          <strong>Marketplace creators:</strong> the courses you publish, images you upload, and, if you set up payouts, the details
          Stripe needs to verify you and pay you (collected by Stripe).
        </li>
        <li>
          <strong>Usage and device data:</strong> pages you visit, features you use, browser and device type, and approximate
          location, collected through cookies and similar technology.
        </li>
        <li>
          <strong>Messages:</strong> anything you send us, and reports you make about marketplace courses.
        </li>
      </ul>
    ),
  },
  {
    id: "use",
    heading: "How we use it",
    body: (
      <ul>
        <li>to provide the Service: run practice sessions, score them, show your progress, and keep your account secure;</li>
        <li>to meter practice minutes, take payments and pay marketplace creators;</li>
        <li>to answer you, handle reports, and prevent misuse and fraud;</li>
        <li>to understand how XINGO is used and improve it (we use aggregated or de-identified information where we can);</li>
        <li>to send service emails (like receipts) and, unless you opt out, occasional news and practice tips; and</li>
        <li>to meet legal obligations.</li>
      </ul>
    ),
  },
  {
    id: "sharing",
    heading: "Who we share it with",
    body: (
      <>
        <p>We don&apos;t sell your personal information. We share it only with service providers that help us run XINGO:</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500">
              <tr>
                <th className="py-2 pr-4 font-semibold">Provider</th>
                <th className="py-2 pr-4 font-semibold">What for</th>
                <th className="py-2 font-semibold">What they receive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {providers.map(([name, purpose, data]) => (
                <tr key={name}>
                  <td className="py-2 pr-4 font-semibold text-ink">{name}</td>
                  <td className="py-2 pr-4">{purpose}</td>
                  <td className="py-2">{data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Our AI provider processes session audio and text to provide the Service under its API terms, which do not allow it to use
          that data to train its models by default.
        </p>
        <p>
          If you publish a marketplace course, your creator name and course page are public. If you report a course, the creator
          isn&apos;t told who reported it. We may also disclose information where the law requires it, or to protect someone&apos;s
          safety.
        </p>
      </>
    ),
  },
  {
    id: "overseas",
    heading: "Information stored overseas",
    body: (
      <p>
        Several of our providers store or process information outside Australia, mainly in the United States. We choose providers
        with strong security practices and take reasonable steps to make sure they handle your information consistently with the
        Australian Privacy Principles.
      </p>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies and analytics",
    body: (
      <p>
        We use cookies to keep you signed in and remember preferences, and Google Analytics (with IP anonymisation) to understand how
        the site is used. Our emails include small images and tracked links so we can see whether they&apos;re opened and clicked. You
        can block cookies in your browser, though signing in needs them, and you can turn off news emails in your account or with the
        unsubscribe link in any email.
      </p>
    ),
  },
  {
    id: "retention",
    heading: "How long we keep it",
    body: (
      <p>
        We keep your account and practice history while your account is open so you can track progress. If you ask us to delete your
        account, we delete or de-identify your personal information within 30 days, except records we must keep by law (such as
        payment and tax records) or to resolve a dispute.
      </p>
    ),
  },
  {
    id: "security",
    heading: "Keeping it secure",
    body: (
      <p>
        Information is encrypted in transit, access is limited to people who need it, and payment details stay with Stripe. No system
        is perfectly secure; if a data breach is likely to cause you serious harm, we&apos;ll tell you and the Office of the
        Australian Information Commissioner as the law requires.
      </p>
    ),
  },
  {
    id: "rights",
    heading: "Your choices and rights",
    body: (
      <ul>
        <li>You can see and update most of your details in your account.</li>
        <li>
          You can ask for a copy of your personal information, ask us to correct it, or ask us to delete your account, by emailing{" "}
          {mail}. We&apos;ll respond within 30 days.
        </li>
        <li>You can opt out of news emails at any time. Service emails such as receipts still arrive.</li>
        <li>
          You can use XINGO under a pseudonym (the name on your account doesn&apos;t have to be your legal name), except where payment
          or payout checks need it.
        </li>
      </ul>
    ),
  },
  {
    id: "children",
    heading: "Young people",
    body: <p>XINGO is for people aged 16 and over, or younger with a parent or guardian&apos;s permission. We don&apos;t knowingly collect information from children under 16 without that permission.</p>,
  },
  {
    id: "complaints",
    heading: "Questions and complaints",
    body: (
      <p>
        Email {mail} with any privacy question or complaint. We&apos;ll acknowledge it within 5 business days and aim to resolve it
        within 30 days. If you&apos;re not satisfied, you can contact the Office of the Australian Information Commissioner at{" "}
        <a href="https://www.oaic.gov.au/" target="_blank" rel="noopener noreferrer">oaic.gov.au</a>. We may update this policy; for
        material changes we&apos;ll let you know and ask you to accept the new version. See also our <Link href="/terms">Terms of Service</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      current="/privacy"
      sections={sections}
      summary={
        <>
          <p className="font-semibold">The short version</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Your voice is streamed to our AI provider during a session. We keep the text transcript and your results, not recordings.</li>
            <li>We share data only with the providers that run XINGO (listed below), some of them overseas. We never sell it.</li>
            <li>You can get a copy of your data or have your account deleted by emailing {LEGAL_CONTACT_EMAIL}.</li>
          </ul>
        </>
      }
    />
  );
}
