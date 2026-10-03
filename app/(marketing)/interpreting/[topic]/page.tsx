import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CtaBand, MarketingIntro } from "@/components/marketing/cta-band";
import { Breadcrumbs } from "@/components/marketing/seo/breadcrumbs";
import { FaqSection } from "@/components/marketing/seo/faq-section";
import { GuideLinks } from "@/components/marketing/seo/guide-links";
import { HowSteps } from "@/components/marketing/seo/how-steps";
import { CheckList, ScenarioList } from "@/components/marketing/seo/scenario-list";
import { Button } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo-metadata";
import { getTopicPage, signUpHref, topicPages } from "@/lib/seo-pages";

export function generateStaticParams() {
  return topicPages.map((page) => ({ topic: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const page = getTopicPage(topic);

  if (!page) return {};

  return pageMetadata({ title: page.title, description: page.metaDescription, path: `/interpreting/${page.slug}` });
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const page = getTopicPage(topic);

  if (!page) notFound();

  const href = signUpHref(page.goal);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-8 sm:gap-20 sm:px-6">
      <MarketingIntro
        breadcrumbs={
          <Breadcrumbs
            className="mb-6 sm:mb-8"
            crumbs={[
              { name: "Home", path: "/" },
              { name: "Interpreting", path: "/interpreting" },
              { name: page.eyebrow, path: `/interpreting/${page.slug}` },
            ]}
          />
        }
        eyebrow={page.eyebrow}
        title={page.headline}
        description={page.intro}
      >
        <Button asChild size="lg">
          <Link href={href}>
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/pricing">See pricing</Link>
        </Button>
      </MarketingIntro>

      <CheckList title="Who it's for" items={page.whoFor} />
      <ScenarioList title="Dialogues you can practise" scenarios={page.scenarios} />
      <CheckList title="What you'll get better at" items={page.skills} />
      <HowSteps />
      <FaqSection faqs={page.faqs} />
      <GuideLinks pagePath={`/interpreting/${page.slug}`} />
      <CtaBand
        title="Try a dialogue free."
        description="Free practice minutes every month. No card needed."
        href={href}
        label="Start free"
      />

      <section>
        <h2 className="text-lg font-bold">More interpreting practice</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ...topicPages.filter((other) => other.slug !== page.slug).map((other) => ({ href: `/interpreting/${other.slug}`, label: other.eyebrow })),
            { href: "/naati/ccl", label: "NAATI CCL" },
            { href: "/naati/cpi", label: "NAATI CPI" },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold hover:bg-gray-200">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
