import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand, MarketingIntro } from "@/components/marketing/cta-band";
import { CCL_MAX_SCORE } from "@/lib/scoring";
import { examPages } from "@/lib/exam-pages";

export const metadata: Metadata = {
  title: "Speaking & Interpreting Exam Practice — NAATI, OET, IELTS, AMC, OSCE, CMI",
  description:
    "Spoken role-play practice for NAATI CCL and CPI, OET Speaking, IELTS Speaking, the AMC clinical exam, the NMBA OSCE and US medical interpreter oral exams (CMI, CHI).",
  alternates: { canonical: "/exams" },
};

export default function ExamsHubPage() {
  const cards = [
    { href: "/naati/ccl", name: "NAATI CCL", region: "Australia", body: `Two short dialogues, scored out of ${CCL_MAX_SCORE}.` },
    { href: "/naati/cpi", name: "NAATI CPI", region: "Australia", body: "Live role-plays, including a remote task." },
    ...examPages.map((page) => ({ href: `/exams/${page.slug}`, name: page.shortName, region: page.region, body: page.intro })),
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-8 sm:gap-20 sm:px-6">
      <MarketingIntro
        eyebrow="Exam preparation"
        title="Practise for your exam, out loud."
        description="Interpreting tests and English speaking exams. Every practice session is spoken, timed like the real thing and scored with feedback."
      />
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="mk-lift group flex flex-col rounded-xl border border-gray-200 p-5 hover:border-ink">
            <p className="text-xs font-semibold text-gray-500">{card.region}</p>
            <p className="mt-1 text-lg font-bold">{card.name}</p>
            <p className="mt-1 line-clamp-3 flex-1 text-sm leading-6 text-gray-500">{card.body}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
              Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>
      <CtaBand title="Start with a free dialogue." description="No card needed." />
    </main>
  );
}
