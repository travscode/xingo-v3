import Link from "next/link";
import { flagEmoji, practiceLanguages } from "@/lib/languages";
import { cclLanguagePages } from "@/lib/seo-pages";

/** Language grid; languages with a dedicated CCL page link to it. */
export function NaatiCclLanguagesSection() {
  const pageByName = new Map(cclLanguagePages.map((page) => [page.name.split(" (")[0].toLowerCase(), page.slug]));

  return (
    <section id="languages" className="scroll-mt-24">
      <p className="eyebrow">Languages</p>
      <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Practise in your language pair</h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-6 text-gray-500">
        Every dialogue pairs English with your other language. Choose yours for tips specific to it, or type in a
        language that isn&apos;t listed once you sign up.
      </p>
      <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {practiceLanguages.map((language) => {
          const slug = pageByName.get(language.name.toLowerCase());
          const content = (
            <>
              <span aria-hidden="true">{flagEmoji(language.name)}</span>
              {language.name}
            </>
          );

          return (
            <li key={language.name}>
              {slug ? (
                <Link
                  href={`/naati/ccl/${slug}`}
                  className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-sm font-semibold hover:bg-gray-100"
                >
                  {content}
                </Link>
              ) : (
                <span className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-500">
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
