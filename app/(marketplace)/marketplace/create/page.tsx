import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Building2, Check, GraduationCap, Mic, Palette, Rocket, Wallet } from "lucide-react";
import {
  CREATOR_GUIDELINES,
  CREATOR_REVENUE_SHARE,
  EARNINGS_HOLD_DAYS,
  formatAud,
  netMinuteValueCents,
  PAYOUT_THRESHOLD_CENTS,
} from "@/lib/marketplace";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Create a practice course and earn",
  description:
    "Turn the conversations you know best into AI role-play and interpreting practice. Publish to the XINGO marketplace, train your team, and earn when people practise.",
  alternates: { canonical: "/marketplace/create" },
};

const share = Math.round(CREATOR_REVENUE_SHARE * 100);
const perMinute = (cents: number) => `${(cents * CREATOR_REVENUE_SHARE).toFixed(1)}¢`;

const steps = [
  {
    icon: Mic,
    title: "Describe the conversation",
    body: "Who the AI plays, what they want, and when the conversation is done. No scripts, no recording.",
  },
  {
    icon: Palette,
    title: "Make the page yours",
    body: "Add a banner, your logo, related certifications and keywords so the right people find it.",
  },
  {
    icon: Rocket,
    title: "Publish",
    body: "Learners add it to their library and practise it out loud, with scoring and feedback built in.",
  },
  {
    icon: Wallet,
    title: "Earn",
    body: `You get ${share}% of what XINGO earns from paid minutes practised in your course, paid out monthly.`,
  },
];

const audiences = [
  { icon: GraduationCap, title: "Teachers & exam coaches", body: "Give students realistic speaking practice between lessons." },
  { icon: Building2, title: "Employers & trainers", body: "Rehearse the conversations your team has every day: sales, service, intake, handover." },
  { icon: BarChart3, title: "Subject experts", body: "Package what you know into practice people can't get anywhere else." },
];

export default function CreateLandingPage() {
  return (
    <div className="space-y-20">
      <section className="max-w-3xl">
        <p className="eyebrow">XINGO Marketplace</p>
        <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
          Share your expertise. <span className="bg-accent px-1">Earn when people practise it.</span>
        </h1>
        <p className="mt-5 text-lg leading-8 text-gray-500">
          Create spoken practice courses with AI voice partners: job interviews, patient consultations, customer calls,
          interpreting assignments, anything people need to rehearse out loud. Publish them for everyone, or use them to train your own team.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/marketplace/new">
              Create your first course <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/marketplace">Browse the marketplace</Link>
          </Button>
        </div>
        <p className="mt-3 text-sm text-gray-500">Free to create. About ten minutes for your first course.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-[-0.03em]">How it works</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-sm font-bold text-paper">{index + 1}</span>
                <step.icon className="h-5 w-5 text-gray-500" aria-hidden />
              </div>
              <p className="mt-4 font-bold">{step.title}</p>
              <p className="mt-1 text-sm leading-6 text-gray-500">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-8 rounded-2xl bg-ink p-6 text-paper sm:p-10 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold tracking-[-0.03em]">How you earn</h2>
          <p className="mt-3 leading-7 text-paper/75">
            Learners pay XINGO for practice minutes, through a Pro plan or a minute pack. When they practise in your course, you
            receive {share}% of the net revenue from those minutes (after GST and card fees). Minutes from the free monthly
            allowance don&apos;t earn, and neither does your own practice.
          </p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Per paid minute on Pro", value: perMinute(netMinuteValueCents("allowance", "professional")) },
            { label: "Per minute from a pack", value: perMinute(netMinuteValueCents("pack", "free")) },
            { label: "Paid out", value: `Monthly, from ${formatAud(PAYOUT_THRESHOLD_CENTS)}` },
            { label: "Holding period", value: `${EARNINGS_HOLD_DAYS} days, for refunds` },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-paper/10 p-4">
              <dt className="text-sm text-paper/60">{item.label}</dt>
              <dd className="mt-1 text-xl font-bold">{item.value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-paper/50 lg:col-span-2">
          Payouts go to your bank account through Stripe. You can see every session, minute and cent in your creator dashboard.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-[-0.03em]">Who creates on XINGO</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {audiences.map((item) => (
            <div key={item.title} className="rounded-2xl bg-gray-50 p-5">
              <item.icon className="h-5 w-5" aria-hidden />
              <p className="mt-3 font-bold">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-gray-500">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl">
        <h2 className="text-2xl font-bold tracking-[-0.03em]">Get more people practising</h2>
        <ul className="mt-4 space-y-2 text-[15px] leading-7">
          {[
            "A clear title and one-line summary that says exactly what learners will practise.",
            "A banner and logo, so your course stands out in the marketplace.",
            "Three or more scenarios, from easy to hard, so learners can see progress.",
            "Keywords people actually search for, like the job title or test name.",
            "Related certifications, if your course genuinely prepares people for one.",
            "Share your course link with your students, team or followers.",
          ].map((tip) => (
            <li key={tip} className="flex gap-2">
              <Check className="mt-1.5 h-4 w-4 shrink-0" aria-hidden /> {tip}
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-3xl">
        <h2 className="text-2xl font-bold tracking-[-0.03em]">Creator guidelines</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-gray-700">
          {CREATOR_GUIDELINES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
        <Button asChild size="lg" className="mt-8">
          <Link href="/marketplace/new">
            Create your first course <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </section>
    </div>
  );
}
