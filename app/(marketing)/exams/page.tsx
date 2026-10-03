import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand } from "@/components/marketing/cta-band";
import { examsByCountry, type ExamIndexEntry } from "@/components/marketing/exam-index";
import { Flag } from "@/components/marketing/flag";
import { PortraitStack, ScenePhoto } from "@/components/marketing/people";
import { TaskCardVisual } from "@/components/marketing/practice-mock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { pageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Exam Practice — NAATI, OET, IELTS, AMC & OSCE",
  description:
    "Spoken role-play practice for NAATI CCL and CPI, OET and IELTS Speaking, the AMC clinical exam, the NMBA OSCE and US medical interpreter oral exams.",
  path: "/exams",
});

const countryId = (country: string) => country.toLowerCase().replace(/\s+/g, "-");

export default function ExamsHubPage() {
  const groups = examsByCountry();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-8 sm:gap-20 sm:px-6">
      {/* Hero */}
      <section className="grid items-center gap-10 pt-8 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <p className="eyebrow">Exam preparation</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-[-0.035em] text-balance sm:text-6xl">
            Practise for your exam, out loud.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-7 text-gray-500">
            Interpreting tests and English speaking exams. Every practice session is spoken, timed like the real thing
            and scored with feedback.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Start practising free
                <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
          <nav aria-label="Exams by country" className="mt-8 flex flex-wrap gap-2">
            {groups.map((group) => (
              <a
                key={group.country}
                href={`#${countryId(group.country)}`}
                className="inline-flex items-center gap-2.5 rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-semibold transition-colors hover:border-ink hover:bg-gray-50"
              >
                <Flag country={group.country} />
                {group.country}
                <span className="font-medium text-gray-500 tabular-nums">{group.exams.length}</span>
              </a>
            ))}
          </nav>
        </div>
        <div className="relative">
          <ScenePhoto
            scene="examPrep"
            priority
            sizes="(min-width: 1024px) 520px, calc(100vw - 32px)"
            className="aspect-[4/3] w-full"
          />
          <div className="absolute bottom-3 left-3 rounded-xl border border-gray-200 sm:bottom-5 sm:left-5">
            <TaskCardVisual />
          </div>
        </div>
      </section>

      {groups.map((group) => (
        <section key={group.country} id={countryId(group.country)} aria-labelledby={`${countryId(group.country)}-heading`} className="scroll-mt-24">
          <div className="flex flex-col gap-2 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id={`${countryId(group.country)}-heading`}
                className="flex items-center gap-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl"
              >
                <Flag country={group.country} className="h-[21px] w-[42px] rounded-[4px]" />
                {group.country}
              </h2>
              <p className="mt-2 max-w-xl text-[15px] leading-6 text-gray-500">{group.description}</p>
            </div>
            <p className="text-sm font-semibold text-gray-500 tabular-nums">
              {group.exams.length} {group.exams.length === 1 ? "exam" : "exams"}
            </p>
          </div>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {group.exams.map((exam) => (
              <li key={exam.href}>
                <ExamCard exam={exam} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <CtaBand title="Try your first practice session free." description="Free practice minutes every month. No card needed." />
    </main>
  );
}

function ExamCard({ exam }: { exam: ExamIndexEntry }) {
  return (
    <Link
      href={exam.href}
      className="mk-lift group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-paper hover:border-ink"
    >
      <div className="flex items-center gap-3 bg-gray-50 px-5 py-4">
        <PortraitStack persons={exam.partners.people} size={40} />
        <p className="min-w-0 text-xs leading-5 text-gray-500">
          <span className="block font-semibold text-ink">You practise with</span>
          {exam.partners.label}
        </p>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div>
          <Badge>{exam.kind}</Badge>
        </div>
        <h3 className="mt-3 text-xl font-bold tracking-[-0.02em]">{exam.shortName}</h3>
        <p className="text-sm text-gray-500">{exam.fullName}</p>
        <p className="mt-3 line-clamp-3 text-[15px] leading-6 text-gray-700">{exam.summary}</p>
        <p className="mt-3 text-sm leading-6">
          <span className="font-semibold">Who it&apos;s for: </span>
          <span className="text-gray-500">{exam.audience}</span>
        </p>
        <div className="mt-5 flex flex-1 flex-col justify-end">
          <dl className="grid gap-px overflow-hidden rounded-lg border border-gray-200 bg-gray-200 sm:grid-cols-2">
            {exam.glance.map((fact) => (
              <div key={fact.label} className="bg-paper px-3.5 py-3">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">{fact.label}</dt>
                <dd className="mt-1 text-sm font-semibold">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold">
          Explore {exam.shortName}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
