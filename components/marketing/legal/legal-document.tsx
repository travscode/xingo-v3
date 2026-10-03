import type { ReactNode } from "react";
import Link from "next/link";
import { LEGAL_CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/legal";

export type LegalSection = { id: string; heading: string; body: ReactNode };

const related = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/creator-terms", label: "Creator Terms" },
];

/** Plain, readable legal page: summary up top, contents, numbered sections. */
export function LegalDocument({
  title,
  summary,
  sections,
  current,
}: {
  title: string;
  summary: ReactNode;
  sections: LegalSection[];
  current: string;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-2 text-4xl font-bold tracking-[-0.035em]">{title}</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated {LEGAL_LAST_UPDATED}</p>

      <div className="mt-8 rounded-xl bg-gray-50 p-5 text-[15px] leading-7">{summary}</div>

      <nav aria-label="Contents" className="mt-8">
        <p className="text-sm font-semibold">Contents</p>
        <ol className="mt-2 grid gap-1 text-sm text-gray-500 sm:grid-cols-2">
          {sections.map((section, index) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="hover:text-ink hover:underline">
                {index + 1}. {section.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 space-y-10">
        {sections.map((section, index) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="text-xl font-bold tracking-[-0.02em]">
              {index + 1}. {section.heading}
            </h2>
            <div className="legal-prose mt-3 space-y-3 text-[15px] leading-7 text-gray-700">{section.body}</div>
          </section>
        ))}
      </div>

      <div className="mt-12 border-t border-gray-200 pt-6 text-sm text-gray-500">
        <p>
          Questions? Email <a className="font-semibold text-ink underline" href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
        </p>
        <p className="mt-3 flex flex-wrap gap-4">
          {related
            .filter((item) => item.href !== current)
            .map((item) => (
              <Link key={item.href} href={item.href} className="font-semibold text-ink underline">
                {item.label}
              </Link>
            ))}
        </p>
      </div>
    </main>
  );
}
