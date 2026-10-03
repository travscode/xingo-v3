import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Languages, MessagesSquare } from "lucide-react";
import { MarketingIntro } from "@/components/marketing/cta-band";
import { SALES_EMAIL } from "@/components/marketing/catalogue";
import { Portrait, ScenePhoto, type SceneKey } from "@/components/marketing/people";
import { Breadcrumbs } from "@/components/marketing/seo/breadcrumbs";
import { FaqSection } from "@/components/marketing/seo/faq-section";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import {
  IllustrativeLabel,
  ReadinessSummaryCard,
  TeamReadinessDemo,
} from "@/components/marketing/team-readiness";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { flagEmoji, practiceLanguages } from "@/lib/languages";
import { MAX_ATTEMPT_MINUTES } from "@/lib/plans";
import { rubrics } from "@/lib/rubrics";
import { pageMetadata } from "@/lib/seo-metadata";
import { servicePageJsonLd } from "@/lib/structured-data";

/*
 * Employer landing page (docs/seo.md). Scenario building, scoring and practice
 * modes exist today; private courses, invites and the team view do not (D-021),
 * so they are presented as a pilot and the demo is labelled illustrative.
 */

const PATH = "/staff-training";
const TITLE = "AI Role-Play Training for Staff and Volunteers";
const DESCRIPTION =
  "Build spoken role-play scenarios for the conversations your team really has. Staff practise out loud with AI, in English or another language, and get scored.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

const mailto = `mailto:${SALES_EMAIL}?subject=${encodeURIComponent("XINGO staff training pilot")}`;
const TARGET = rubrics.roleplay.passScore;
const criteria = rubrics.roleplay.dimensions.map((dimension) => dimension.label);

const steps = [
  {
    title: "Build your scenarios",
    description:
      "Describe who the AI plays and what they want: an upset customer, a nervous patient, a visitor who's lost. Choose one-on-one or interpreter in the middle.",
    pilot: false,
  },
  {
    title: "Set the goal and what's assessed",
    description:
      "Write the task card your staff see, the points they must cover, when the conversation is finished, and the time limit.",
    pilot: false,
  },
  {
    title: "Invite your team",
    description: "Staff get a private course and practise on their own time, in practice mode first, then assessed.",
    pilot: true,
  },
  {
    title: "See who's ready",
    description: "One view of who has passed, who needs more practice and who hasn't started, with every score.",
    pilot: true,
  },
] as const;

const useCases: Array<{ title: string; description: string; scene: SceneKey }> = [
  {
    title: "Retail customer service",
    description: "Returns without a receipt, complaints at the counter, and the customer who wants the manager.",
    scene: "retail",
  },
  {
    title: "Hospitality and front of house",
    description: "Check-ins that go wrong, booking mix-ups, and guests with dietary or access needs.",
    scene: "hotel",
  },
  {
    title: "Healthcare reception and intake",
    description: "Checking in a worried patient, explaining wait times and calming a distressed family member.",
    scene: "healthReception",
  },
  {
    title: "Contact centres",
    description: "Billing disputes, cancellations and hardship calls, rehearsed out loud before the first live call.",
    scene: "contactCentre",
  },
  {
    title: "Volunteers for major events",
    description:
      "Directions, lost property, ticket problems and access requests from international visitors, in English or their language.",
    scene: "eventVolunteer",
  },
  {
    title: "Language services teams",
    description: "Interpreters rehearse the interpreter-in-the-middle format in your domains before an assignment.",
    scene: "team",
  },
];

const finishedWhen = [
  "The customer accepts a store credit or a manager callback",
  "The patient's details are confirmed and an interpreter is booked",
  "The visitor knows how to reach the accessible entrance",
];

const availableNow = [
  "Scenario builder: one-on-one role-plays or interpreter in the middle",
  "AI voice characters that stay in role",
  "English only, or English and another language",
  "Task cards, a clear finish line and a time limit",
  "Practice mode with coaching, and assessed sessions",
  "A score and specific feedback for every assessed session",
];

const inPilot = [
  "Private courses only your team can see",
  "Inviting staff by email",
  "A team view of who's ready, with scores",
  "Assessment criteria set by your organisation",
  "Team reporting",
];

const faqs = [
  {
    q: "What is AI role-play training for staff?",
    a: "Your staff member speaks out loud with an AI character who plays a customer, patient, caller or visitor. The character has its own goal and reacts to what your staff member says. Each session is timed, and assessed sessions are scored with specific feedback.",
  },
  {
    q: "Can we build scenarios for our own situations?",
    a: "Yes, today. The scenario builder asks who the AI plays, what they want, what your staff member plays, what's on their task card, when the conversation is finished, and the time limit. Courses built today are published on the XINGO marketplace, so anyone can practise them. Private, team-only courses are part of the pilot.",
  },
  {
    q: "Which languages can staff practise in?",
    a: `English only, or English and another language. The language picker lists ${practiceLanguages.length} languages and staff can type any other. In a one-on-one role-play the AI character speaks the chosen language. In the interpreter format, one person speaks English, the other speaks the second language, and your staff member interprets both ways.`,
  },
  {
    q: "How is each session scored?",
    a: `Assessed role-plays are scored out of 100 across ${criteria.join(", ").toLowerCase()}, with a target of ${TARGET}. The score reflects whether the conversation reached its goal: an unfinished session is scaled by how much of the task was covered and can't reach the target. Scores are estimated from the transcript, so tone and pronunciation aren't judged.`,
  },
  {
    q: "Can we set our own assessment criteria?",
    a: "Today the role-play criteria are the same for every course, and you shape what counts through the goal, the task card and when the conversation is finished. Criteria set by your organisation are something we're working out with pilot teams.",
  },
  {
    q: "Can I see which staff are ready?",
    a: "Not yet as a self-serve feature. Today each person sees their own scores and history. Inviting staff and a team view showing who's ready, who needs practice and who hasn't started are what we're building with pilot organisations. Get in touch if you'd like to be one.",
  },
  {
    q: "What's the difference between practice and assessed sessions?",
    a: "In practice mode, role-play task-card points tick off as your staff member covers them, and in the interpreter format each turn gets a verdict and a one-line tip, with up to three tries. Practice sessions aren't scored. Assessed sessions run like the real thing and are scored at the end. Opening the transcript during an assessed session turns it into practice.",
  },
  {
    q: "Does it work for volunteers at big events?",
    a: "Yes. Volunteers and guest-services staff can rehearse the questions international visitors ask most, such as directions, lost property, tickets and access needs, in English or with a visitor who speaks another language.",
  },
  {
    q: "What do staff need?",
    a: `A web browser, a microphone and ideally headphones. Sessions run in the browser and a single session is capped at ${MAX_ATTEMPT_MINUTES} minutes.`,
  },
  {
    q: "What does it cost for a team?",
    a: "There's no self-serve team plan yet. Tell us about your team, the conversations you want to train and the languages you need, and we'll work out a pilot with you.",
  },
];

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Staff training", path: PATH },
];

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-balance sm:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-[15px] leading-6 text-gray-500">{description}</p> : null}
    </div>
  );
}

function PilotBadge() {
  return <Badge tone="live">Pilot</Badge>;
}

/** Small UI vignette for each "how it works" step. */
function StepVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="w-full max-w-[240px] rounded-xl bg-paper p-4 text-left text-xs" aria-hidden>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">The AI plays</p>
        <p className="mt-1 font-semibold">Customer returning a faulty kettle</p>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">They want</p>
        <p className="mt-1 text-gray-700">A refund today, and they lost the receipt.</p>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="w-full max-w-[240px] rounded-xl bg-paper p-4 text-left text-xs" aria-hidden>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">It&apos;s finished when…</p>
        <p className="mt-1 text-gray-700">The customer accepts an exchange or store credit.</p>
        <ul className="mt-3 space-y-1.5">
          {["Apologise and listen", "Check proof of purchase", "Offer the options"].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check size={12} strokeWidth={3} className="text-success" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="w-full max-w-[240px] space-y-2" aria-hidden>
        {(["priya", "tom", "aisha"] as const).map((person) => (
          <div key={person} className="flex items-center gap-3 rounded-lg bg-paper px-3 py-2 text-xs">
            <Portrait person={person} size={24} />
            <span className="flex-1 truncate text-gray-700">{person}@example.org</span>
            <span className="font-semibold text-gray-500">Invited</span>
          </div>
        ))}
      </div>
    );
  }
  return <ReadinessSummaryCard compact className="w-full max-w-[260px] border-0" />;
}

export default function StaffTrainingPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 sm:px-6">
      <JsonLd
        data={servicePageJsonLd({
          path: PATH,
          name: TITLE,
          description: DESCRIPTION,
          serviceType: "Staff communication and customer service training",
          audience: "Employers, organisations and volunteer programmes",
        })}
      />

      <MarketingIntro
        eyebrow="For employers"
        breadcrumbs={<Breadcrumbs crumbs={crumbs} className="mb-6 sm:mb-8" />}
        title="AI role-play training that gets your staff ready for real conversations."
        description="Build spoken practice for the conversations your team actually has: complaints, check-ins, phone calls, visitors who speak another language. Staff rehearse out loud with an AI character and get scored against the goal you set."
        media={
          <div className="relative">
            <ScenePhoto
              scene="managerReview"
              priority
              sizes="(min-width: 1024px) 480px, calc(100vw - 32px)"
              className="aspect-[4/3] w-full"
            />
            <ReadinessSummaryCard className="mk-rise mk-delay-2 absolute bottom-4 left-4 right-4 sm:left-auto sm:w-[300px]" />
          </div>
        }
      >
        <Button asChild size="lg">
          <a href={mailto}>
            Book a pilot
            <ArrowRight size={18} />
          </a>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link href="/marketplace/create">Try the scenario builder</Link>
        </Button>
      </MarketingIntro>

      {/* Team view */}
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Team workspace — now in pilot"
            title="Know who's ready before they face the public."
            description="Every person practises the same scenarios and gets an honest score. You see who has passed, who needs another go and who hasn't started."
          />
        </div>
        <div className="mt-8">
          <TeamReadinessDemo />
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Illustrative example with fictional staff. The team view is being built with pilot organisations.
        </p>
      </section>

      {/* How it works */}
      <section>
        <SectionHeading eyebrow="How it works" title="From your situations to a team that's ready." />
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="mk-lift flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-paper hover:border-ink"
            >
              <div className="flex h-44 items-center justify-center bg-gray-50 px-5">
                <StepVisual index={index} />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Step {index + 1}
                  </span>
                  {step.pilot ? <PilotBadge /> : <Badge tone="success">Available now</Badge>}
                </div>
                <h3 className="mt-2 text-lg font-bold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-6 text-gray-500">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Use cases */}
      <section>
        <SectionHeading
          eyebrow="Who it's for"
          title="Any team that talks to customers, patients or visitors."
          description="If a conversation matters and your people only get one shot at it, they can rehearse it first."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((item) => (
            <article
              key={item.title}
              className="mk-lift overflow-hidden rounded-xl border border-gray-200 bg-paper hover:border-ink"
            >
              <ScenePhoto
                scene={item.scene}
                sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, calc(100vw - 32px)"
                className="aspect-[3/2] w-full rounded-none"
              />
              <div className="p-5">
                <h3 className="text-lg font-bold tracking-[-0.02em]">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-6 text-gray-500">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-[15px] leading-6 text-gray-500">
          It also suits government and council front counters, banks and insurers, libraries, and any team where the
          first conversation sets the tone.
        </p>
      </section>

      {/* Any language, any goal */}
      <section className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <SectionHeading
            eyebrow="Any language, any goal"
            title="Your conversations, in the languages your public speaks."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-5">
              <MessagesSquare size={22} aria-hidden />
              <h3 className="mt-3 font-bold">One-on-one role-play</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Your staff member plays themselves. The AI plays the customer, patient or caller.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-5">
              <Languages size={22} aria-hidden />
              <h3 className="mt-3 font-bold">Interpreter in the middle</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Two AI people speak different languages. Your staff member interprets both ways.
              </p>
            </div>
          </div>
          <p className="mt-8 text-sm font-semibold">
            English only, or English and one of {practiceLanguages.length} listed languages (or type another):
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            <li className="rounded-lg border border-ink px-2.5 py-1 text-sm font-semibold">
              <span aria-hidden>{flagEmoji("English")} </span>English only
            </li>
            {practiceLanguages.map((language) => (
              <li key={language.name} className="rounded-lg bg-gray-100 px-2.5 py-1 text-sm">
                <span aria-hidden>{flagEmoji(language.name)} </span>
                {language.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-center rounded-2xl bg-gray-50 p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
            You decide what &ldquo;done&rdquo; looks like
          </p>
          <ul className="mt-4 space-y-3">
            {finishedWhen.map((line, index) => (
              <li
                key={line}
                className="mk-rise rounded-xl border border-gray-200 bg-paper p-4"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <p className="text-xs font-semibold text-gray-500">It&apos;s finished when…</p>
                <p className="mt-1 text-[15px] leading-6">{line}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-6 text-gray-500">
            The AI character works toward its own goal, and the session is scored on whether your staff member got the
            conversation there.
          </p>
        </div>
      </section>

      {/* Assessment */}
      <section className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-14">
        <div>
          <SectionHeading
            eyebrow="Assessment"
            title="Practise freely. Get assessed when it counts."
            description="Scores are tied to the goal of the conversation, so getting halfway doesn't count as ready."
          />
          <dl className="mt-8 space-y-6">
            <div>
              <dt className="font-bold">Practice mode coaches every turn</dt>
              <dd className="mt-1 text-[15px] leading-6 text-gray-500">
                In a role-play, task-card points tick off as they&apos;re covered. When interpreting, each turn gets a
                quick verdict and a one-line tip, with up to three tries. Nothing is scored.
              </dd>
            </div>
            <div>
              <dt className="font-bold">Assessed sessions run like the real thing</dt>
              <dd className="mt-1 text-[15px] leading-6 text-gray-500">
                No hints. A score out of 100 at the end, with a target of {TARGET}.
              </dd>
            </div>
            <div>
              <dt className="font-bold">Unfinished means not ready</dt>
              <dd className="mt-1 text-[15px] leading-6 text-gray-500">
                If the conversation doesn&apos;t reach its goal, the score is scaled by how much of the task was
                covered and can&apos;t reach the target.
              </dd>
            </div>
            <div>
              <dt className="font-bold">Feedback people can act on</dt>
              <dd className="mt-1 text-[15px] leading-6 text-gray-500">
                Specific notes on what to fix next time. Scores are estimated from the transcript, so tone and
                pronunciation aren&apos;t judged.
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6" aria-hidden>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Portrait person="daniel" size={40} />
              <div>
                <p className="text-sm font-bold">Billing dispute call</p>
                <p className="text-xs text-gray-500">Assessed · English only</p>
              </div>
            </div>
            <IllustrativeLabel />
          </div>
          <div className="mt-6 flex items-baseline justify-between">
            <p className="text-5xl font-bold tracking-[-0.04em] tabular-nums">
              74<span className="ml-1 text-base font-medium text-gray-500">/ 100</span>
            </p>
            <Badge tone="accent">Target {TARGET} met</Badge>
          </div>
          <ul className="mt-6 space-y-3">
            {criteria.map((label, index) => {
              const value = [82, 70, 68, 76, 74][index] ?? 70;
              return (
                <li key={label}>
                  <div className="flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-semibold tabular-nums">{value}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="mk-fill h-full rounded-full bg-accent"
                      style={{ width: `${value}%`, animationDelay: `${200 + index * 120}ms` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-700">
            &ldquo;You confirmed the account and explained the charge clearly. Next time, offer the payment plan before
            the customer has to ask for it.&rdquo;
          </p>
        </div>
      </section>

      {/* Today vs pilot */}
      <section>
        <SectionHeading
          eyebrow="Where things stand"
          title="What you can use today, and what we're building with pilot teams."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2">
              <Badge tone="success">Available now</Badge>
            </div>
            <ul className="mt-4 space-y-3">
              {availableNow.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-6">
                  <Check size={18} strokeWidth={2.5} className="mt-0.5 shrink-0 text-success" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-dashed border-gray-500 bg-gray-50 p-6">
            <div className="flex items-center gap-2">
              <PilotBadge />
              <span className="text-sm text-gray-500">Team workspace</span>
            </div>
            <ul className="mt-4 space-y-3">
              {inPilot.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-6 text-gray-700">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-live" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-500">
          Training interpreters or running NAATI test prep?{" "}
          <Link href="/for-organizations" className="font-semibold text-ink underline underline-offset-4">
            See cohort access for training providers
          </Link>
          .
        </p>
      </section>

      <FaqSection title="Questions from employers" faqs={faqs} />

      <section className="rounded-xl bg-ink px-6 py-10 text-paper sm:px-10 sm:py-12">
        <h2 className="max-w-2xl text-3xl font-bold tracking-[-0.03em] text-balance sm:text-4xl">
          Run a pilot with your team.
        </h2>
        <p className="mt-3 max-w-xl text-[15px] leading-6 text-gray-300">
          Tell us who you&apos;re training, the conversations that matter and the languages you need. We&apos;ll reply
          by email to set up a pilot.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild variant="accent" size="lg">
            <a href={mailto}>
              Book a pilot
              <ArrowRight size={18} />
            </a>
          </Button>
          <Button asChild variant="ghost" size="lg" className="text-paper hover:bg-gray-700">
            <Link href="/marketplace/create">Try the scenario builder</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
