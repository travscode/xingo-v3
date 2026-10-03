import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { ScenePhoto } from "@/components/marketing/people";
import { Button } from "@/components/ui/button";
import { cclSignUpHref, heroPoints, pageSections } from "./content";

export function NaatiCclHeroSection() {
  return (
    <section className="pt-8 sm:pt-14">
      <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
        <div>
          <p className="eyebrow">NAATI CCL practice</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-[-0.04em] text-balance sm:text-6xl">
            Don&apos;t walk into your CCL test unpractised.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-7 text-gray-500">
            Practise CCL-style dialogues out loud with two AI speakers, in your language pair. Get a score out of 90 and
            feedback after every attempt.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={cclSignUpHref}>
                Try a free CCL dialogue
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#prepare">How to prepare</a>
            </Button>
          </div>
          <ul className="mt-8 flex flex-col gap-2 text-[15px] sm:flex-row sm:flex-wrap sm:gap-6">
            {heroPoints.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <Check size={16} className="shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <ScenePhoto scene="clinic" sizes="420px" className="hidden aspect-[4/5] w-full lg:block" />
      </div>

      <nav aria-label="On this page" className="mt-12 flex gap-1 overflow-x-auto border-b border-gray-200">
        {pageSections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="shrink-0 border-b-2 border-transparent px-3 py-3 text-sm font-medium text-gray-500 hover:border-ink hover:text-ink"
          >
            {section.label}
          </a>
        ))}
      </nav>
    </section>
  );
}
