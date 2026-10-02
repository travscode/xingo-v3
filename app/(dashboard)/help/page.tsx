import Link from "next/link";
import { PageHeader } from "@/components/ui/primitives";
import { MAX_ATTEMPT_MINUTES, plans } from "@/lib/plans";
import { CCL_PASS_SCORE, PASS_SCORE } from "@/lib/scoring";

export const metadata = { title: "Help" };

const SUPPORT_EMAIL = "support@xingo.ai";

const faqs: Array<{ q: string; a: React.ReactNode }> = [
  {
    q: "How does a practice session work?",
    a: "Two AI participants — an English-speaking professional and a client who speaks your other language — can only understand each other through you. Introduce yourself to the client first, then to the professional, then interpret every turn until the conversation wraps up.",
  },
  {
    q: "What are the controls?",
    a: "Hold the Space bar (or the mic button) while you speak and release to send. Tap Space, or tap a person's card, to switch who you're talking to. The person you're talking to is highlighted in blue; red means your microphone is open.",
  },
  {
    q: "The AI can't hear me / talks over me",
    a: "Allow microphone access in your browser's address bar, and use headphones — with speakers the AI can hear itself. Chrome and Edge on a laptop work best. If audio is blocked, use the \"Turn sound on\" link in the room.",
  },
  {
    q: "Assessed vs practice sessions",
    a: "Assessed sessions hide the transcript, like the real test, and give you a score. Practice sessions show a live transcript (with translation) but aren't scored.",
  },
  {
    q: "How is my score calculated?",
    a: `An examiner-style AI reviews your transcript for accuracy, terminology, fluency, turn management and professionalism. Most dialogues pass at ${PASS_SCORE}/100. NAATI CCL practice is shown out of 90 with a pass mark of ${CCL_PASS_SCORE}. Sessions with only a couple of turns are too short to score.`,
  },
  {
    q: "What counts as a practice minute?",
    a: `Time while a session is live, rounded up to the minute. Briefings, results and browsing are free. The Free plan includes ${plans.free.monthlyMinutes} minutes a month; Pro includes ${plans.professional.monthlyMinutes}. A single session can run up to ${MAX_ATTEMPT_MINUTES} minutes.`,
  },
  {
    q: "Billing and refunds",
    a: (
      <>
        Manage your card, invoices and subscription from <Link href="/billing" className="font-semibold underline">Plan &amp; minutes</Link>.
        If a session failed because of a technical problem, email us and we&apos;ll restore the minutes.
      </>
    ),
  },
  {
    q: "Is this affiliated with NAATI?",
    a: "No. XINGO is independent practice software. NAATI is the National Accreditation Authority for Translators and Interpreters; our CCL-style dialogues are modelled on the public test format.",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Help"
        description={
          <>
            Can&apos;t find an answer? Email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-ink underline">
              {SUPPORT_EMAIL}
            </a>
            .
          </>
        }
      />
      <div className="divide-y divide-gray-200 rounded-xl border border-gray-200">
        {faqs.map((faq) => (
          <details key={faq.q} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
              {faq.q}
              <span className="text-xl leading-none text-gray-500 transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-gray-700">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
