import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  Flag,
  GraduationCap,
  Headset,
  Languages,
  MessagesSquare,
  Mic,
  Palette,
  Rocket,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { CtaBand, MarketingIntro } from "@/components/marketing/cta-band";
import { MarketplaceHero } from "@/components/marketing/marketplace-hero";
import { ScenePhoto, type SceneKey } from "@/components/marketing/people";
import { Breadcrumbs } from "@/components/marketing/seo/breadcrumbs";
import { FaqSection } from "@/components/marketing/seo/faq-section";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { practiceLanguages } from "@/lib/languages";
import {
  CREATOR_GUIDELINES,
  CREATOR_REVENUE_SHARE,
  courseKinds,
  creatorEarningCents,
  creatorVoices,
  EARNINGS_HOLD_DAYS,
  LISTING_LIMITS,
  netMinuteValueCents,
  PAYOUT_THRESHOLD_CENTS,
  reportReasons,
} from "@/lib/marketplace";
import { MAX_ATTEMPT_MINUTES, plans } from "@/lib/plans";
import { pageMetadata } from "@/lib/seo-metadata";
import { webPageJsonLd } from "@/lib/structured-data";

/*
 * Public landing page for the XINGO Marketplace (docs/seo.md, D-031). The header's
 * "Marketplace" link points here; the live marketplace is /marketplace and the
 * detailed creator guide is /marketplace/create. Every number on this page comes
 * from lib/marketplace.ts or lib/plans.ts. Team-only courses, invites and the team
 * view aren't built (D-021), so they're described as a pilot.
 */

const PATH = "/sell-practice-courses";
const TITLE = "Sell Practice Courses Online: Create AI Role-Plays and Earn";
const DESCRIPTION = `Create and sell spoken practice courses on the XINGO Marketplace: practice exams, job interview role-plays and interpreting scenarios with AI voice partners. Earn ${Math.round(CREATOR_REVENUE_SHARE * 100)}% of net revenue from paid minutes.`;

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

const CREATE_HREF = "/marketplace/new";
const MARKETPLACE_HREF = "/marketplace";

// ---- Real numbers ---------------------------------------------------------------

const share = Math.round(CREATOR_REVENUE_SHARE * 100);
const cents = (value: number) => `${value.toFixed(1)}¢`;
const proMinute = cents(netMinuteValueCents("allowance", "professional") * CREATOR_REVENUE_SHARE);
const packMinute = cents(netMinuteValueCents("pack", "free") * CREATOR_REVENUE_SHARE);
const EXAMPLE_MINUTES = 10;
const exampleSession = `${Math.round(
  creatorEarningCents({ fromAllowance: EXAMPLE_MINUTES, fromPacks: 0, plan: "professional" }),
)}¢`;
// "A$50", matching how prices are written elsewhere (lib/plans.ts priceLabel).
const threshold = `A$${PAYOUT_THRESHOLD_CENTS / 100}`;
const pro = plans.professional;
const languageCount = practiceLanguages.length;
const sampleLanguages = practiceLanguages
  .slice(0, 4)
  .map((language) => language.name)
  .join(", ");

// ---- Content --------------------------------------------------------------------

const creatorSteps: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: Mic,
    title: "Describe the conversation",
    description:
      "A five-step wizard asks for the format, a course name, who the AI plays, the learner's part (or the person who needs an interpreter), and when the conversation is finished. No scripts and no recording.",
  },
  {
    icon: Palette,
    title: "Dress up the course page",
    description: `Add a banner, your logo, what learners get, who it's for, up to ${LISTING_LIMITS.keywords} keywords and related certifications. A page-strength checklist shows what's missing.`,
  },
  {
    icon: Rocket,
    title: "Publish",
    description: `Accept the creator guidelines and your course goes live with its own page. Add up to ${LISTING_LIMITS.scenarios} scenarios, from easy to hard, whenever you like.`,
  },
  {
    icon: BarChart3,
    title: "Earn and improve",
    description:
      "Your insights dashboard shows page views, adds, learners, sessions, minutes and earnings, with 30-day charts.",
  },
];

const audiences: Array<{
  scene: SceneKey;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  pilot?: boolean;
}> = [
  {
    scene: "creatorStudio",
    eyebrow: "Creators, teachers and exam coaches",
    title: "Monetise your expertise.",
    description:
      "You know which conversations people struggle with. Turn them into practice they can speak through again and again, and earn a share of the revenue every time a paid minute is practised.",
    href: CREATE_HREF,
    linkLabel: "Create your first course",
  },
  {
    scene: "trainerWhiteboard",
    eyebrow: "Employers and trainers",
    title: "Build scenarios for your own situations.",
    description:
      "Rehearse the complaints, calls and check-ins your team really has. Courses you build today are published on the marketplace. Team-only courses, invites and a team view are in pilot.",
    href: "/staff-training",
    linkLabel: "See AI role-play training for staff",
    pilot: true,
  },
  {
    scene: "learnerHeadphones",
    eyebrow: "Learners",
    title: "Find practice beyond our own courses.",
    description:
      "Courses made by coaches, trainers and interpreters, for the conversations XINGO's own courses don't cover. Add one to your library and practise it with your usual minutes.",
    href: MARKETPLACE_HREF,
    linkLabel: "Open the marketplace",
  },
];

const ideas: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: GraduationCap,
    title: "Practice exams for certifications",
    description:
      "Mock speaking tasks for the test your students are sitting, timed and scored. Name the certification only if your course genuinely prepares people for it.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Job interview role-plays",
    description:
      "Graduate interviews, nursing panels and hospitality hiring, with an interviewer who asks follow-up questions.",
  },
  {
    icon: Headset,
    title: "Customer service scenarios",
    description: "Refunds without a receipt, billing disputes, booking mix-ups and the caller who wants the manager.",
  },
  {
    icon: Scale,
    title: "Medical and legal interpreting dialogues",
    description:
      "GP appointments, hospital discharge, lawyer meetings and community services, with the learner interpreting in the middle.",
  },
  {
    icon: Languages,
    title: "Language-specific practice",
    description: `Learners choose English only or English and another language, such as ${sampleLanguages}. One course, many languages.`,
  },
  {
    icon: MessagesSquare,
    title: "Workplace conversations",
    description: "Sales calls, patient consultations, handovers and difficult conversations with a colleague.",
  },
];

const faqs = [
  {
    q: "What can I sell on the XINGO Marketplace?",
    a: "Spoken practice courses. A course is a set of scenarios where the learner talks out loud with AI voice partners: either one-on-one with an AI person, or interpreting between two AI people who speak different languages. Practice exams, job interview role-plays, customer service scenarios and interpreting dialogues all work. The marketplace isn't for videos, documents or file downloads.",
  },
  {
    q: "How much do I earn?",
    a: `You earn ${share}% of XINGO's net revenue (after GST and card fees) from paid minutes practised in your course. That's about ${proMinute} for each minute a Pro learner practises and about ${packMinute} for each minute paid for with a minute pack. For example, a Pro learner practising your course for ${EXAMPLE_MINUTES} minutes earns you about ${exampleSession}. Minutes from the free monthly allowance and your own practice don't earn.`,
  },
  {
    q: "Is it free to create a course?",
    a: "Yes. There's no fee to create or publish a course. Trying your own scenarios uses practice minutes, like any other session.",
  },
  {
    q: "Do I need technical skills?",
    a: `No. You describe the conversation in plain English: who the AI plays, what they want, the learner's part and when the conversation is finished. There's nothing to record or code. You choose from ${creatorVoices.length} AI voices for your characters.`,
  },
  {
    q: "Who owns my content?",
    a: "You keep the rights to what you create. Publishing lets XINGO show your course page on the marketplace and run your scenarios as practice for learners. You must own, or have permission to use, everything you upload, including logos and certification names.",
  },
  {
    q: "Can I use it to train my own team?",
    a: "Yes. You can build scenarios for your own situations today, and your team can practise them. Courses are currently published on the public marketplace. Private, team-only courses, inviting staff and a team view of who's ready are being built with pilot organisations.",
  },
  {
    q: "How do learners pay?",
    a: `Learners pay XINGO for practice minutes, through the Pro plan (${pro.priceLabel} for ${pro.monthlyMinutes} minutes a month) or a minute pack. Marketplace courses aren't locked to a plan: learners add your course to their library and use their minutes on it. A single session is capped at ${MAX_ATTEMPT_MINUTES} minutes.`,
  },
  {
    q: "What languages can my course be practised in?",
    a: `You write your scenarios in English. Learners choose how they practise: English only, or English and one of ${languageCount} listed languages, or another language they type. In an interpreting course, one AI person speaks English and the other speaks the learner's other language.`,
  },
  {
    q: "How do payouts work?",
    a: `Earnings are recorded each time a paid session in your course finishes. They're held for ${EARNINGS_HOLD_DAYS} days to cover refunds, then paid out monthly through Stripe to your bank account once your available balance reaches ${threshold}. You set up your payout account from your earnings page.`,
  },
  {
    q: "Can my course be removed?",
    a: "You can unpublish your course at any time, and publish it again later. Anyone signed in can report a course, and XINGO reviews every report. A course that breaks the creator guidelines can be taken down, and its earnings withheld.",
  },
];

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Sell practice courses", path: PATH },
];

// ---- Pieces ---------------------------------------------------------------------

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-balance sm:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-[15px] leading-6 text-gray-500">{description}</p> : null}
    </div>
  );
}

/** Small UI vignette for each creator step (decorative). */
function StepVisual({ index }: { index: number }) {
  if (index === 0) {
    const wizard = ["Format", "Name", "Who the AI plays", "The learner's part", "When it's finished"];
    return (
      <div className="w-full max-w-[240px] rounded-xl bg-paper p-4 text-left text-xs" aria-hidden>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">Step 3 of 5</p>
        <div className="mt-2 flex gap-1">
          {wizard.map((item, i) => (
            <span key={item} className={`h-1 flex-1 rounded-full ${i < 3 ? "bg-ink" : "bg-gray-200"}`} />
          ))}
        </div>
        <p className="mt-3 font-semibold">Who will the learner talk to?</p>
        <p className="mt-1 rounded-md bg-gray-100 px-2 py-1.5 text-gray-700">A hiring manager at a busy hospital</p>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="w-full max-w-[240px] rounded-xl bg-paper p-4 text-left text-xs" aria-hidden>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">Page strength</p>
        <ul className="mt-2 space-y-1.5">
          {["Banner", "Logo", "Keywords", "Certifications"].map((item, i) => (
            <li key={item} className="flex items-center gap-2">
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full ${i < 3 ? "bg-success text-paper" : "border border-gray-200"}`}
              >
                {i < 3 ? <Check size={10} strokeWidth={3} /> : null}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="w-full max-w-[240px] rounded-xl bg-paper p-4 text-left text-xs" aria-hidden>
        <div className="flex items-center justify-between">
          <p className="font-semibold">Interview practice</p>
          <Badge tone="accent">Published</Badge>
        </div>
        <p className="mt-3 flex items-center gap-2 text-gray-700">
          <Check size={12} strokeWidth={3} className="text-success" /> Creator guidelines accepted
        </p>
        <p className="mt-1.5 truncate text-gray-500">xingo.ai/marketplace/your-course</p>
      </div>
    );
  }
  return (
    <div className="w-full max-w-[240px] rounded-xl bg-paper p-4 text-left text-xs" aria-hidden>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">Insights · 30 days</p>
      <div className="mt-3 flex h-14 items-end gap-1">
        {[30, 45, 38, 60, 52, 70, 64, 82, 75, 90].map((height, i) => (
          <span key={i} className="mk-fill flex-1 rounded-sm bg-accent" style={{ height: `${height}%` }} />
        ))}
      </div>
      <p className="mt-2 text-gray-500">Views · Adds · Learners · Sessions · Earnings</p>
    </div>
  );
}

// ---- Page -----------------------------------------------------------------------

export default function SellPracticeCoursesPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 sm:px-6">
      <JsonLd
        data={webPageJsonLd({
          path: PATH,
          name: TITLE,
          description: DESCRIPTION,
          about: "Creating and selling spoken practice courses on the XINGO Marketplace",
          steps: creatorSteps.map((step) => ({ name: step.title, description: step.description })),
        })}
      />

      <MarketingIntro
        eyebrow="XINGO Marketplace"
        breadcrumbs={<Breadcrumbs crumbs={crumbs} className="mb-6 sm:mb-8" />}
        title="Monetise your expertise with spoken practice courses."
        description={`Build practice exams, job interview role-plays and interpreting scenarios that learners speak out loud with AI voice partners. Publish them on the XINGO Marketplace and earn ${share}% of the net revenue from paid minutes practised in your course.`}
        media={<MarketplaceHero className="lg:max-w-[460px] lg:justify-self-end" />}
      >
        <Button asChild size="lg">
          <Link href={CREATE_HREF} prefetch={false}>
            Create your first course
            <ArrowRight size={18} />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href={MARKETPLACE_HREF} prefetch={false}>
            Open the marketplace
          </Link>
        </Button>
      </MarketingIntro>

      {/* What it is */}
      <section className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
        <div>
          <SectionHeading
            eyebrow="What it is"
            title="A marketplace for practice you speak, not videos you watch."
            description="Most online courses are lessons you sit through. A course on the XINGO Marketplace is a set of conversations: learners speak out loud with AI voice partners who stay in role, then get a score and specific feedback."
          />
          <ul className="mt-8 space-y-4">
            {[
              "Made by people who know the conversation: coaches, trainers, interpreters and employers.",
              "Practised out loud, in practice mode with coaching or assessed like the real thing.",
              "Every course has its own page, so learners can find it in the marketplace and in search.",
            ].map((line) => (
              <li key={line} className="flex gap-3 text-[15px] leading-6">
                <Check size={18} strokeWidth={2.5} className="mt-0.5 shrink-0 text-success" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-4 self-center">
          {courseKinds.map((kind) => {
            const Icon = kind.id === "roleplay" ? MessagesSquare : Languages;
            return (
              <div key={kind.id} className="rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Icon size={20} aria-hidden />
                  </span>
                  <h3 className="text-lg font-bold tracking-[-0.02em]">{kind.label}</h3>
                </div>
                <p className="mt-3 text-[15px] leading-6 text-gray-700">{kind.description}</p>
                <p className="mt-2 text-sm text-gray-500">For example: {kind.example.toLowerCase()}.</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Audiences */}
      <section>
        <SectionHeading eyebrow="Who it's for" title="One marketplace, three ways in." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {audiences.map((item) => (
            <article
              key={item.title}
              className="mk-lift flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-paper hover:border-ink"
            >
              <ScenePhoto
                scene={item.scene}
                sizes="(min-width: 768px) 360px, calc(100vw - 32px)"
                className="aspect-[3/2] w-full rounded-none"
              />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">{item.eyebrow}</p>
                  {item.pilot ? <Badge tone="live">Pilot</Badge> : null}
                </div>
                <h3 className="mt-2 text-xl font-bold tracking-[-0.02em]">{item.title}</h3>
                <p className="mt-2 flex-1 text-[15px] leading-6 text-gray-500">{item.description}</p>
                <Link
                  href={item.href}
                  prefetch={false}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline-offset-4 hover:underline"
                >
                  {item.linkLabel}
                  <ArrowRight size={16} aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section>
        <SectionHeading
          eyebrow="How it works for creators"
          title="From an idea to a published course in four steps."
          description="Everything below is in the creator tools today."
        />
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {creatorSteps.map((step, index) => (
            <li
              key={step.title}
              className="mk-lift flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-paper hover:border-ink"
            >
              <div className="flex h-44 items-center justify-center bg-gray-50 px-5">
                <StepVisual index={index} />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-xs font-bold text-paper">
                    {index + 1}
                  </span>
                  <step.icon size={18} className="text-gray-500" aria-hidden />
                </div>
                <h3 className="mt-3 text-lg font-bold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-6 text-gray-500">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Earnings */}
      <section className="grid gap-10 rounded-2xl bg-ink p-6 text-paper sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-300">How earnings work</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-balance sm:text-4xl">
            Earn {share}% of the revenue from every paid minute in your course.
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-gray-300">
            Learners pay XINGO for practice minutes, through the Pro plan or a minute pack. When they practise in your
            course, you get {share}% of XINGO&apos;s net revenue from those minutes, after GST and card fees. Minutes from
            the free monthly allowance don&apos;t earn, and neither does your own practice.
          </p>
          <p className="mt-6 rounded-xl bg-paper/10 p-4 text-[15px] leading-6">
            <span className="font-semibold text-accent">Example:</span> a Pro learner practises your course for{" "}
            {EXAMPLE_MINUTES} minutes. You earn about {exampleSession}.
          </p>
          <Link
            href="/marketplace/create"
            prefetch={false}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-paper underline-offset-4 hover:underline"
          >
            Read the full creator guide
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
        <dl className="grid content-center gap-3 sm:grid-cols-2">
          {[
            { label: "Your share", value: `${share}%`, note: "of net revenue from paid minutes" },
            { label: "Per paid Pro minute", value: `about ${proMinute}`, note: `Pro is ${pro.priceLabel}` },
            { label: "Per paid pack minute", value: `about ${packMinute}`, note: "valued at the cheapest pack's rate" },
            { label: "Paid out", value: "Monthly", note: `through Stripe, from ${threshold}` },
            { label: "Holding period", value: `${EARNINGS_HOLD_DAYS} days`, note: "to cover refunds" },
            { label: "Where you see it", value: "Your dashboard", note: "every session, minute and cent" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-paper/10 p-4">
              <dt className="text-sm text-gray-300">{item.label}</dt>
              <dd className="mt-1 text-2xl font-bold tracking-[-0.02em] tabular-nums">{item.value}</dd>
              <dd className="mt-0.5 text-xs text-gray-300">{item.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Ideas */}
      <section className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div>
          <SectionHeading
            eyebrow="Ideas"
            title="What could you create?"
            description="The best courses rehearse a conversation people only get one shot at. A few places to start:"
          />
          <ScenePhoto
            scene="tutorSession"
            sizes="(min-width: 1024px) 420px, calc(100vw - 32px)"
            className="mt-8 aspect-[4/3] w-full"
          />
        </div>
        <ul className="grid gap-4 self-start sm:grid-cols-2">
          {ideas.map((idea) => (
            <li key={idea.title} className="rounded-xl border border-gray-200 p-5">
              <idea.icon size={22} aria-hidden />
              <h3 className="mt-3 font-bold">{idea.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">{idea.description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Trust */}
      <section>
        <SectionHeading
          eyebrow="Quality and trust"
          title="Clear rules, so learners can trust what they find."
          description="Every creator accepts the same guidelines before publishing."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} aria-hidden />
              <h3 className="font-bold">Creator guidelines</h3>
            </div>
            <ul className="mt-4 space-y-3">
              {CREATOR_GUIDELINES.map((rule) => (
                <li key={rule} className="flex gap-3 text-[15px] leading-6 text-gray-700">
                  <Check size={18} strokeWidth={2.5} className="mt-0.5 shrink-0 text-success" aria-hidden />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-gray-50 p-6">
            <div className="flex items-center gap-2">
              <Flag size={20} aria-hidden />
              <h3 className="font-bold">Reporting and review</h3>
            </div>
            <p className="mt-4 text-[15px] leading-6 text-gray-700">
              Anyone signed in can report a course from its page. Each report goes to the XINGO team for review, and a
              course that breaks the guidelines can be taken down.
            </p>
            <p className="mt-5 text-sm font-semibold">Reasons people can report a course:</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {reportReasons.map((reason) => (
                <li key={reason.id} className="rounded-lg bg-paper px-2.5 py-1 text-sm text-gray-700">
                  {reason.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <FaqSection title="Questions from creators" faqs={faqs} />

      <CtaBand
        title="Your first course starts with one conversation."
        description="Describe who the AI plays and what the learner needs to get done. You can add the banner, more scenarios and the rest later."
        href={CREATE_HREF}
        label="Create your first course"
        secondary={
          <Button asChild variant="ghost" size="lg" className="text-paper hover:bg-gray-700">
            <Link href={MARKETPLACE_HREF} prefetch={false}>
              Open the marketplace
            </Link>
          </Button>
        }
      />
    </main>
  );
}
