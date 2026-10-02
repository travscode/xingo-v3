import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Minus } from "lucide-react";
import { CtaBand, MarketingIntro } from "@/components/marketing/cta-band";
import { FaqSection } from "@/components/marketing/seo/faq-section";
import { HowSteps } from "@/components/marketing/seo/how-steps";
import { ScenarioList } from "@/components/marketing/seo/scenario-list";
import { Button } from "@/components/ui/button";
import { examPages, getExamPage } from "@/lib/exam-pages";
import { isSpeakingGoal } from "@/lib/goals";
import { signUpHref } from "@/lib/seo-pages";

export function generateStaticParams() {
  return examPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getExamPage(slug);

  if (!page) return {};

  return {
    title: page.title,
    description: page.metaDescription,
    alternates: { canonical: `/exams/${page.slug}` },
    openGraph: { title: page.title, description: page.metaDescription, url: `/exams/${page.slug}` },
  };
}

export default async function ExamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getExamPage(slug);

  if (!page) notFound();

  const href = signUpHref(page.goal);
  const others = examPages.filter((other) => other.slug !== page.slug);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-8 sm:gap-20 sm:px-6">
      <MarketingIntro eyebrow={`${page.shortName} · ${page.region}`} title={page.headline} description={page.intro}>
        <Button asChild size="lg">
          <Link href={href}>
            Try one free <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="#format">About the exam</Link>
        </Button>
      </MarketingIntro>

      <section id="format" className="scroll-mt-24">
        <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">The {page.shortName} at a glance</h2>
        <p className="mt-2 text-gray-500">{page.fullName}, run by {page.body}.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {page.format.map((item) => (
            <div key={item.title} className="rounded-xl border border-gray-200 p-5">
              <p className="font-bold">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-gray-500">{item.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Summary only — exam rules change. Always read the official candidate information before you book.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">What XINGO helps you practise</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-5">
            <p className="font-bold">Covered</p>
            <ul className="mt-3 space-y-2">
              {page.covered.map((item) => (
                <li key={item} className="flex gap-2 text-[15px] leading-6">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-gray-200 p-5">
            <p className="font-bold">Not covered (yet)</p>
            <ul className="mt-3 space-y-2">
              {page.notCovered.map((item) => (
                <li key={item} className="flex gap-2 text-[15px] leading-6 text-gray-500">
                  <Minus className="mt-1 h-4 w-4 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ScenarioList title="Practice scenarios" scenarios={page.scenarios} />

      <section>
        <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Tips from the marking criteria</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {page.tips.map((tip) => (
            <div key={tip.title} className="rounded-xl bg-gray-50 p-5">
              <p className="font-bold">{tip.title}</p>
              <p className="mt-2 text-sm leading-6 text-gray-700">{tip.body}</p>
            </div>
          ))}
        </div>
      </section>

      <HowSteps variant={isSpeakingGoal(page.goal) ? "roleplay" : "interpreting"} />
      <FaqSection faqs={page.faqs} />

      <CtaBand
        title={`Practise for the ${page.shortName} today.`}
        description="Free practice minutes every month. No card needed. Prices are in AUD."
        href={href}
        label="Try one free"
      />

      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-bold">Official sources</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {page.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gray-500">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-gray-500">XINGO is independent and not affiliated with {page.body}.</p>
        </div>
        <div>
          <h2 className="text-lg font-bold">Other exams</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { href: "/naati/ccl", label: "NAATI CCL" },
              { href: "/naati/cpi", label: "NAATI CPI" },
              ...others.map((other) => ({ href: `/exams/${other.slug}`, label: other.shortName })),
            ].map((link) => (
              <Link key={link.href} href={link.href} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold hover:bg-gray-200">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
