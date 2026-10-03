import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand, MarketingIntro } from "@/components/marketing/cta-band";
import { FaqSection } from "@/components/marketing/seo/faq-section";
import { GuideLinks } from "@/components/marketing/seo/guide-links";
import { Button } from "@/components/ui/button";
import { cclVocabularyDomains } from "@/lib/ccl-vocabulary";
import { CCL_MAX_SCORE } from "@/lib/scoring";
import { pageMetadata } from "@/lib/seo-metadata";
import { cclLanguagePages, signUpHref } from "@/lib/seo-pages";
import { Breadcrumbs } from "@/components/marketing/seo/breadcrumbs";

const path = "/naati/ccl/vocabulary";
const title = "NAATI CCL Vocabulary by Domain — English Word Lists";
const description =
  "English word lists for all 12 NAATI CCL domains — health, Centrelink, insurance, banking, housing, legal and more — with notes on Australian terms.";

export const metadata: Metadata = pageMetadata({ title, description, path });

const guideSlugs = ["naati-ccl-topics-domains", "naati-ccl-common-mistakes", "naati-ccl-note-taking"];

export default function CclVocabularyPage() {
  const href = signUpHref("naati_ccl");

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-8 sm:gap-20 sm:px-6">
      <MarketingIntro
        breadcrumbs={
          <Breadcrumbs
            className="mb-6 sm:mb-8"
            crumbs={[
              { name: "Home", path: "/" },
              { name: "NAATI CCL", path: "/naati/ccl" },
              { name: "Vocabulary", path },
            ]}
          />
        }
        eyebrow="NAATI CCL · Vocabulary"
        title="CCL vocabulary, domain by domain."
        description="NAATI draws CCL dialogues from twelve community settings. Start from these English terms, add the equivalents in your language, and say them out loud until they're automatic."
      >
        <Button asChild size="lg">
          <Link href={href}>
            Practise a CCL dialogue free <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="#domains">Jump to the word lists</Link>
        </Button>
      </MarketingIntro>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Build your own glossary", "Write the term in your language next to each English word. Check it with a reliable dictionary or a fluent speaker."],
          ["Prefer the community term", "Use the word in your language where a common one exists. Leaning on English can cost marks for language quality."],
          ["Learn it in a sentence", "Vocabulary sticks when you use it. Practise each domain in a full dialogue, not just a list."],
        ].map(([heading, body]) => (
          <div key={heading} className="rounded-xl border border-gray-200 p-5">
            <h2 className="font-bold">{heading}</h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">{body}</p>
          </div>
        ))}
        <p className="text-xs text-gray-500 sm:col-span-3">
          Domain names follow NAATI&apos;s CCL information. These lists are our starting points, not official NAATI material, and
          not a list of test questions.
        </p>
      </section>

      <section id="domains" className="scroll-mt-24">
        <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Word lists for the 12 CCL domains</h2>
        <nav aria-label="Domains" className="mt-4 flex flex-wrap gap-2">
          {cclVocabularyDomains.map((domain) => (
            <a
              key={domain.slug}
              href={`#${domain.slug}`}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold hover:bg-gray-200"
            >
              {domain.name}
            </a>
          ))}
        </nav>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {cclVocabularyDomains.map((domain) => (
            <section key={domain.slug} id={domain.slug} className="scroll-mt-24 rounded-xl border border-gray-200 p-5">
              <h3 className="text-lg font-bold">{domain.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{domain.summary}</p>
              <ul className="mt-4 divide-y divide-gray-200 border-y border-gray-200">
                {domain.terms.map((item) => (
                  <li key={item.term} className="py-2 text-[15px] leading-6">
                    <span className="font-semibold">{item.term}</span>
                    {item.note ? <span className="text-gray-500"> — {item.note}</span> : null}
                  </li>
                ))}
              </ul>
              {domain.practice?.length ? (
                <p className="mt-3 text-sm text-gray-500">
                  Practise it: <span className="font-semibold text-ink">{domain.practice.join(", ")}</span> in the CCL
                  course.
                </p>
              ) : null}
            </section>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Language-specific tips</h2>
        <p className="mt-2 max-w-2xl text-gray-500">
          Each language page covers what trips up speakers of that language — number systems, respectful forms and English
          borrowings.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {cclLanguagePages.map((language) => (
            <Link
              key={language.slug}
              href={`/naati/ccl/${language.slug}`}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold hover:bg-gray-200"
            >
              CCL {language.name}
            </Link>
          ))}
        </div>
      </section>

      <GuideLinks slugs={guideSlugs} />

      <FaqSection
        faqs={[
          {
            q: "Is there an official NAATI CCL vocabulary list?",
            a: "NAATI publishes the test domains and practice materials, but not a word list to memorise. Build your own glossary by domain from practice dialogues and lists like these.",
          },
          {
            q: "Should I use English words if that's what people say in my community?",
            a: "In the CCL, use the term in your language where a common equivalent exists. Over-reliance on English can affect your language quality marks. Proper nouns such as Centrelink or Medicare usually stay as they are.",
          },
          {
            q: "How many words do I need to learn?",
            a: "There's no fixed number. Focus on the terms you hesitate over in practice dialogues — that's the vocabulary costing you marks.",
          },
          {
            q: "Is XINGO affiliated with NAATI?",
            a: "No. XINGO is independent practice software. These lists are our own starting points, not official NAATI material.",
          },
        ]}
      />

      <CtaBand
        title="Use the words in a real dialogue."
        description={`Interpret a CCL-style dialogue out loud with two AI speakers and get a score out of ${CCL_MAX_SCORE}. Your first dialogue is free.`}
        href={href}
        label="Try a free CCL dialogue"
      />
    </main>
  );
}
