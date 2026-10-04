import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { MarketingIntro } from "@/components/marketing/cta-band";
import { examIndex } from "@/components/marketing/exam-index";
import {
  ExamClosingCta,
  ExamCoverage,
  ExamGlance,
  ExamHeroFootnote,
  ExamHeroVisual,
  ExamScenarios,
  ExamTips,
  OtherExams,
} from "@/components/marketing/exam-page-parts";
import { examVisual } from "@/components/marketing/exam-visuals";
import { Breadcrumbs } from "@/components/marketing/seo/breadcrumbs";
import { FaqSection } from "@/components/marketing/seo/faq-section";
import { GuideLinks } from "@/components/marketing/seo/guide-links";
import { MigrationGuidesCallout } from "@/components/marketing/migration-guides-callout";
import { HowSteps } from "@/components/marketing/seo/how-steps";
import { Button } from "@/components/ui/button";
import { examPages, getExamPage } from "@/lib/exam-pages";
import { isSpeakingGoal } from "@/lib/goals";
import { pageMetadata } from "@/lib/seo-metadata";
import { signUpHref } from "@/lib/seo-pages";

export function generateStaticParams() {
  return examPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getExamPage(slug);

  if (!page) return {};

  return pageMetadata({ title: page.title, description: page.metaDescription, path: `/exams/${page.slug}` });
}

export default async function ExamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getExamPage(slug);

  if (!page) notFound();

  const href = signUpHref(page.goal);
  const path = `/exams/${page.slug}`;
  const visual = examVisual(page.slug);
  const partners = examIndex.find((exam) => exam.href === path)?.partners.label ?? "A realistic partner";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 pb-8 sm:gap-28 sm:px-6">
      <MarketingIntro
        breadcrumbs={
          <Breadcrumbs
            className="mb-6 sm:mb-8"
            crumbs={[
              { name: "Home", path: "/" },
              { name: "Exams", path: "/exams" },
              { name: page.shortName, path },
            ]}
          />
        }
        eyebrow={`${page.shortName} · ${page.region}`}
        title={page.headline}
        description={page.intro}
        media={<ExamHeroVisual page={page} visual={visual} />}
        footnote={<ExamHeroFootnote visual={visual} partners={partners} />}
      >
        <Button asChild size="lg">
          <Link href={href}>
            Try one free <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="#format">About the exam</Link>
        </Button>
      </MarketingIntro>

      <ExamGlance page={page} />
      <ExamCoverage page={page} visual={visual} />
      <ExamScenarios page={page} visual={visual} href={href} />
      <ExamTips tips={page.tips} />
      <HowSteps variant={isSpeakingGoal(page.goal) ? "roleplay" : "interpreting"} />
      <FaqSection faqs={page.faqs} />
      <GuideLinks pagePath={path} />

      <MigrationGuidesCallout pagePath={path} />

      <ExamClosingCta page={page} visual={visual} href={href} />

      <section className="grid gap-10 md:grid-cols-2">
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
        <OtherExams currentHref={path} />
      </section>
    </main>
  );
}
