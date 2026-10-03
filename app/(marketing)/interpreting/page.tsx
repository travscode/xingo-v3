import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand, MarketingIntro } from "@/components/marketing/cta-band";
import { CCL_MAX_SCORE } from "@/lib/scoring";
import { cclLanguagePages, topicPages } from "@/lib/seo-pages";
import { pageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Interpreting Practice — NAATI, Medical, Legal & NDIS",
  description:
    "AI role-play practice for interpreters in Australia: NAATI CCL and CPI preparation, medical, legal, NDIS and telephone interpreting. Speak out loud, get scored.",
  path: "/interpreting",
});

export default function InterpretingHubPage() {
  const cards = [
    { href: "/naati/ccl", title: "NAATI CCL", body: `Two-way community dialogues, scored out of ${CCL_MAX_SCORE}.` },
    { href: "/naati/cpi", title: "NAATI CPI", body: "Live role-play preparation, including a phone task." },
    ...topicPages.map((page) => ({ href: `/interpreting/${page.slug}`, title: page.eyebrow, body: page.intro })),
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-8 sm:gap-20 sm:px-6">
      <MarketingIntro
        eyebrow="Interpreting practice"
        title="Practise the interpreting you actually do."
        description="Choose a test or a setting. Every dialogue is spoken, two-way and scored."
      />
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="mk-lift group flex flex-col rounded-xl border border-gray-200 p-5 hover:border-ink">
            <p className="font-bold">{card.title}</p>
            <p className="mt-1 line-clamp-3 flex-1 text-sm leading-6 text-gray-500">{card.body}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
              Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>
      <section>
        <h2 className="text-2xl font-bold tracking-[-0.03em]">NAATI CCL practice by language</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {cclLanguagePages.map((page) => (
            <Link key={page.slug} href={`/naati/ccl/${page.slug}`} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold hover:bg-gray-200">
              CCL {page.name}
            </Link>
          ))}
        </div>
      </section>
      <CtaBand title="Start with a free dialogue." description="No card needed." />
    </main>
  );
}
