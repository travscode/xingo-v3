import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand, MarketingIntro } from "@/components/marketing/cta-band";
import { Breadcrumbs } from "@/components/marketing/seo/breadcrumbs";
import { FaqSection } from "@/components/marketing/seo/faq-section";
import { Button } from "@/components/ui/button";
import { formatPostDate } from "@/lib/blog/utils";
import { NAATI_CCL_CHECKED, NAATI_CCL_DIALOGUE_WORDS, NAATI_CCL_URL, naatiCclLanguages } from "@/lib/naati-ccl";
import { CCL_MAX_SCORE } from "@/lib/scoring";
import { COMMUNITY_LANGUAGE_POINTS } from "@/lib/points-test";
import { pageMetadata } from "@/lib/seo-metadata";
import { cclLanguagePages, flagFor, naatiNameFor, signUpHref } from "@/lib/seo-pages";

/*
 * "naati languages": the languages NAATI offers the CCL test in (lib/naati-ccl.ts),
 * linking the ones with a CCL practice page. Facts are NAATI's; re-check the list
 * before editing (docs/seo.md).
 */

const path = "/naati/ccl/languages";
const total = naatiCclLanguages.length;
const title = "NAATI Languages: The Full CCL Test Language List";
const description = `Every language NAATI offers the CCL test in (${total} at the time of writing), from Arabic to Yoruba, with CCL practice pages for ${cclLanguagePages.length} of them.`;

export const metadata: Metadata = pageMetadata({ title, description, path });

const practicePageByNaatiName = new Map(cclLanguagePages.map((page) => [naatiNameFor(page), page]));

const faqs = [
  {
    q: "How many languages does NAATI offer the CCL test in?",
    a: `${total} at the time of writing, including Afrikaans, which NAATI marks as pending candidate demand. NAATI says it adds languages based on community demand, so check its CCL page for the current list.`,
  },
  {
    q: "Is the CCL test available in Sinhala, Bengali or Farsi?",
    a: "Yes. NAATI lists them as Sinhalese, Bangla and Persian. The list on this page uses NAATI's own spelling.",
  },
  {
    q: "Are NAATI certification tests offered in the same languages?",
    a: "Not necessarily. Certification tests for translators and interpreters have their own language lists, set by NAATI. Check the certification page for your language before you plan.",
  },
  {
    q: "My language isn't on the list. Can I still claim community language points?",
    a: `Home Affairs awards ${COMMUNITY_LANGUAGE_POINTS} points for a credentialled community language, which can also come from NAATI certification at Certified Provisional level or above. Whether that's possible depends on which tests NAATI offers in your language. A registered migration agent can advise on your situation.`,
  },
  {
    q: "Can I practise the CCL in my language on XINGO?",
    a: "Yes. Pick your language when you sign up, or type it in if it isn't listed. The professional always speaks English. AI voice quality is better in widely spoken languages, so try a free dialogue first.",
  },
];

export default function NaatiLanguagesPage() {
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
              { name: "Languages", path },
            ]}
          />
        }
        eyebrow="NAATI CCL · Languages"
        title="NAATI CCL languages: the full list."
        description={`At the time of writing, NAATI offers the Credentialed Community Language (CCL) test in ${total} languages, always paired with English. Find yours below, then practise CCL-style dialogues in it out loud.`}
      >
        <Button asChild size="lg">
          <Link href={href}>
            Practise a CCL dialogue free <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="#list">See the list</Link>
        </Button>
      </MarketingIntro>

      <section id="list" aria-labelledby="list-heading" className="scroll-mt-24">
        <h2 id="list-heading" className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
          The {total} CCL test languages
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-6 text-gray-500">
          Spelt as NAATI lists them. Languages in bold have a CCL practice page with tips for that language.
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {naatiCclLanguages.map((language) => {
            const page = practicePageByNaatiName.get(language.name);
            const label = (
              <>
                {page ? <span aria-hidden="true">{flagFor(page.flag)}</span> : null}
                {language.name}
                {language.pending ? <span className="text-xs font-normal text-gray-500">(pending demand)</span> : null}
              </>
            );
            return (
              <li key={language.name}>
                {page ? (
                  <Link
                    href={`/naati/ccl/${page.slug}`}
                    className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-sm font-bold hover:bg-gray-100"
                  >
                    {label}
                  </Link>
                ) : (
                  <span className="flex flex-wrap items-center gap-x-2 rounded-lg px-3 py-2.5 text-sm text-gray-700">{label}</span>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs leading-5 text-gray-500">
          Source:{" "}
          <a href={NAATI_CCL_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            NAATI — Credentialed Community Language test
          </a>
          , checked {formatPostDate(NAATI_CCL_CHECKED)}. NAATI adds and removes languages, so check before you book. XINGO is
          independent and not affiliated with NAATI.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            heading: "CCL languages and certification languages differ",
            body: "The CCL list is for the community language credential used for migration points. NAATI's translator and interpreter certification tests have their own language lists.",
          },
          {
            heading: `Worth ${COMMUNITY_LANGUAGE_POINTS} points for skilled visas`,
            body: "Passing the CCL gives a credentialled community language, which counts in the points test for the 189, 190 and 491 visas at the time of writing.",
          },
          {
            heading: "Same format in every language",
            body: `Two recorded dialogues of about ${NAATI_CCL_DIALOGUE_WORDS} words each, half in English and half in your other language, marked out of ${CCL_MAX_SCORE}.`,
          },
        ].map((item) => (
          <div key={item.heading} className="rounded-xl border border-gray-200 p-5">
            <h2 className="font-bold">{item.heading}</h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">{item.body}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="next-heading">
        <h2 id="next-heading" className="text-lg font-bold">
          Read next
        </h2>
        <ul className="mt-3 grid gap-3 md:grid-cols-3">
          {[
            {
              href: "/migrate-to-australia/community-language-points",
              title: "Which NAATI test for PR?",
              description: "What counts as a credentialed community language, and CCL vs certification.",
            },
            {
              href: "/blog/naati-ccl-test-format-and-marking",
              title: "CCL test format and marking",
              description: "How the dialogues run, how marks are deducted and what passes.",
            },
            {
              href: "/migrate-to-australia/skilled-migration-points-test",
              title: "Australian PR points test",
              description: "The full points table and where your languages count.",
            },
          ].map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="mk-lift flex h-full flex-col rounded-xl border border-gray-200 p-5 hover:border-ink">
                <span className="font-bold leading-6">{link.title}</span>
                <span className="mt-1 text-sm leading-6 text-gray-500">{link.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <FaqSection faqs={faqs} />

      <CtaBand
        title="Found your language? Start practising."
        description={`CCL-style dialogues with two AI speakers, scored out of ${CCL_MAX_SCORE}. Free practice minutes every month, no card needed.`}
        href={href}
        label="Try a free CCL dialogue"
      />
    </main>
  );
}
