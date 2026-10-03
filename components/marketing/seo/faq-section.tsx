import { faqJsonLd } from "@/lib/structured-data";
import { JsonLd } from "./json-ld";

/** FAQ list plus schema.org FAQPage structured data for search results. */
export function FaqSection({ faqs, title = "Questions" }: { faqs: Array<{ q: string; a: string }>; title?: string }) {
  return (
    <section>
      <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{title}</h2>
      <div className="mt-6 divide-y divide-gray-200 rounded-xl border border-gray-200">
        {faqs.map((faq) => (
          <details key={faq.q} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
              {faq.q}
              <span className="text-xl leading-none text-gray-500 transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-gray-700">{faq.a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={faqJsonLd(faqs)} />
    </section>
  );
}
