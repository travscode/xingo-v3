import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { CtaBand } from "@/components/marketing/cta-band";
import { practiceModules } from "@/components/marketing/catalogue";
import { IllustratedSteps } from "@/components/marketing/illustrated-steps";
import { Journey } from "@/components/marketing/journey";
import { PortraitStack, ScenePhoto, type PersonKey, type SceneKey } from "@/components/marketing/people";
import { ScoreMock } from "@/components/marketing/practice-mock";
import { HeroStory } from "@/components/marketing/hero-story";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { FreeBadge, PremiumBadge } from "@/components/ui/badges";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { LogoCarousel } from "@/components/marketing/logo-carousel";
import { examPages } from "@/lib/exam-pages";
import { CCL_MAX_SCORE, CCL_PASS_SCORE } from "@/lib/scoring";
import { packList, plans } from "@/lib/plans";
import { pageMetadata } from "@/lib/seo-metadata";
import { organizationJsonLd, websiteJsonLd } from "@/lib/structured-data";
import { TwoMLink } from "@/components/marketing/two-m-link";

export const metadata: Metadata = pageMetadata({
  title: "XINGO — Practise NAATI CCL, OET and IELTS Speaking Out Loud",
  description:
    "Spoken AI role-play practice for NAATI CCL and CPI, OET, IELTS, AMC and OSCE. Talk out loud, get scored against the test's criteria. Free minutes monthly.",
  path: "/",
  absoluteTitle: true,
});

const cheapestPack = packList[0];

const practiceModes: Array<{
  scene: SceneKey;
  people: PersonKey[];
  title: string;
  description: string;
  href: string;
  link: string;
}> = [
  {
    scene: "clinic",
    people: ["drKim", "mei"],
    title: "Interpret a conversation",
    description:
      "Two AI people who don't share a language, such as a doctor and a patient. You relay every turn, both ways. For NAATI CCL, CPI and medical interpreting.",
    href: "/how-it-works",
    link: "How interpreting practice works",
  },
  {
    scene: "examPrep",
    people: ["examiner"],
    title: "Talk one-on-one",
    description:
      "One AI character plays the patient, relative, colleague or examiner, and you play yourself. For OET, IELTS, AMC and OSCE role-plays.",
    href: "/how-it-works#roleplay",
    link: "How role-play practice works",
  },
];

const examLinks = [
  { href: "/naati/ccl", label: "NAATI CCL" },
  { href: "/naati/cpi", label: "NAATI CPI" },
  ...examPages.map((page) => ({ href: `/exams/${page.slug}`, label: page.shortName })),
  { href: "/interpreting/medical-interpreting-practice", label: "Medical interpreting" },
  { href: "/interpreting/ndis-interpreting", label: "NDIS interpreting" },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 sm:gap-28 sm:px-6">
      {/* Hero */}
      <section className="grid items-center gap-10 pt-8 sm:pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div>
          <p className="eyebrow mk-rise">Interpreting tests and speaking exams</p>
          <h1 className="mk-rise mk-delay-1 mt-4 text-[2.75rem] leading-[1.04] font-bold tracking-[-0.04em] text-balance sm:text-7xl">
            Practise out loud. Pass your test.{" "}
            <span className="relative whitespace-nowrap">
              <span className="absolute inset-x-0 bottom-[0.08em] h-[0.32em] bg-accent" aria-hidden />
              <span className="relative">Get to work.</span>
            </span>
          </h1>
          <p className="mk-rise mk-delay-2 mt-6 max-w-xl text-lg leading-7 text-gray-500">
            Realistic spoken role-plays with AI voices for NAATI, OET, IELTS and more. You talk, XINGO scores you
            against the test&apos;s criteria, and you know exactly what to fix before the day that counts.
          </p>
          <div className="mk-rise mk-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Start practising free
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          </div>
          <p className="mk-rise mk-delay-4 mt-4 text-sm text-gray-500">
            {plans.free.monthlyMinutes} free practice minutes every month. No card needed.
          </p>
        </div>
        <HeroStory className="mk-rise mk-delay-2 mx-auto max-w-md" />
      </section>

      {/* Where it leads: 2M's clients (under contract with 2M) */}
      <section aria-labelledby="partners-heading">
        <h2 id="partners-heading" className="text-center text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
          Practise here. Interpret for organisations like these.
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[15px] leading-7 text-gray-500">
          XINGO is partnered with <TwoMLink />, who interpret for organisations across Australia. Get qualified on XINGO and you
          could work with them through 2M.
        </p>
        <LogoCarousel className="mt-8" />
      </section>

      {/* Two ways to practise */}
      <section aria-labelledby="modes-heading">
        <p className="eyebrow">Two ways to practise</p>
        <h2 id="modes-heading" className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.03em] text-balance sm:text-4xl">
          Interpret between two people, or talk with one.
        </h2>
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {practiceModes.map((mode) => (
            <li key={mode.title}>
              <Link
                href={mode.href}
                className="mk-lift group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-paper hover:border-ink"
              >
                <div className="relative">
                  <ScenePhoto
                    scene={mode.scene}
                    sizes="(min-width: 1152px) 560px, (min-width: 768px) 50vw, calc(100vw - 32px)"
                    className="aspect-[3/2] w-full rounded-none"
                  />
                  <span className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-paper py-1 pl-1 pr-3 text-xs font-semibold">
                    <PortraitStack persons={mode.people} size={28} />
                    {mode.people.length > 1 ? "Two AI voices + you" : "One AI voice + you"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-bold tracking-[-0.02em]">{mode.title}</h3>
                  <p className="mt-2 flex-1 text-[15px] leading-6 text-gray-500">{mode.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold">
                    {mode.link}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section>
        <p className="eyebrow">How it works</p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-2xl text-3xl font-bold tracking-[-0.03em] text-balance sm:text-4xl">
            A real interpreting session, whenever you want one.
          </h2>
          <Link
            href="/how-it-works"
            className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold"
          >
            More about a session
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <IllustratedSteps className="mt-10" />
      </section>

      <Journey />

      {/* NAATI CCL callout */}
      <section className="grid items-center gap-8 rounded-2xl bg-gray-50 p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div>
          <Badge tone="accent">NAATI CCL</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-balance sm:text-4xl">
            Sitting the CCL? Know your score before test day.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-6 text-gray-500">
            Practise short community dialogues in the CCL format, in your language pair. Every attempt is scored out
            of {CCL_MAX_SCORE}, with {CCL_PASS_SCORE} as the pass mark, so you can see where you stand.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Button asChild>
              <Link href="/naati/ccl">
                Explore CCL practice
                <ArrowRight size={16} />
              </Link>
            </Button>
            <Link
              href="/blog/naati-ccl-test-format-and-marking"
              className="text-sm font-semibold underline underline-offset-2 hover:text-gray-500"
            >
              How the CCL is marked
            </Link>
          </div>
          <p className="mt-6 text-xs text-gray-500">XINGO is independent and not affiliated with NAATI.</p>
        </div>
        <ScoreMock scale="ccl" className="mx-auto w-full max-w-sm" />
      </section>

      {/* Exams */}
      <section aria-labelledby="exams-heading">
        <h2 id="exams-heading" className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
          Practising for a different test?
        </h2>
        <p className="mt-2 text-[15px] text-gray-500">These are the tests you can practise for on XINGO today.</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {examLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex items-center rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-semibold transition-colors hover:border-ink hover:bg-gray-50"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/exams"
              className="group inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-semibold text-gray-500 hover:text-ink"
            >
              All exams
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        </ul>
      </section>

      {/* Courses */}
      <section>
        <p className="eyebrow">Courses</p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-2xl text-3xl font-bold tracking-[-0.03em] text-balance sm:text-4xl">
            Practise for the settings you&apos;ll work in.
          </h2>
          <p className="max-w-sm text-sm text-gray-500">
            Free courses are open to everyone. Every premium course includes one free preview dialogue.
          </p>
        </div>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {practiceModules.map((course) => (
            <li
              key={course.title}
              className="mk-lift rounded-xl border border-gray-200 bg-paper p-6 hover:border-ink"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-bold">{course.title}</h3>
                {course.access === "free" ? <FreeBadge /> : <PremiumBadge />}
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-500">{course.description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Pricing teaser */}
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="eyebrow">Pricing</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            Pay for practice time. Nothing else.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-6 text-gray-500">
            You pay for minutes spent in a live session. Scoring and feedback are included.
          </p>
          <Button asChild variant="outline" className="mt-8">
            <Link href="/pricing">See full pricing</Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <PriceTile
            label={plans.free.label}
            price={plans.free.priceLabel}
            note={`${plans.free.monthlyMinutes} min / month`}
          />
          <PriceTile
            label={plans.professional.label}
            price={plans.professional.priceLabel.replace(" / month", "")}
            note={`${plans.professional.monthlyMinutes} min / month`}
            highlight
          />
          <PriceTile label="Minute packs" price={`from ${cheapestPack.priceLabel}`} note="One-off. Never expire." />
        </div>
      </section>

      <CtaBand
        title="Your next practice session starts here."
        description="Create an account, pick a course and start talking."
        label="Start practising free"
        secondary={
          <ul className="flex flex-col gap-1 text-sm text-gray-300 sm:ml-4">
            <li className="flex items-center gap-2">
              <Check size={14} /> {plans.free.monthlyMinutes} free minutes every month
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} /> No card needed
            </li>
          </ul>
        }
      />
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
    </main>
  );
}

function PriceTile({
  label,
  price,
  note,
  highlight,
}: {
  label: string;
  price: string;
  note: string;
  highlight?: boolean;
}) {
  return (
    <div className={highlight ? "rounded-xl bg-ink p-5 text-paper" : "rounded-xl border border-gray-200 p-5"}>
      <div className={highlight ? "text-sm text-gray-300" : "text-sm text-gray-500"}>{label}</div>
      <div className="mt-2 text-2xl font-bold tracking-[-0.03em]">{price}</div>
      <div className={highlight ? "mt-1 text-xs text-gray-300" : "mt-1 text-xs text-gray-500"}>{note}</div>
    </div>
  );
}
