import { helpArticles } from "@/lib/mock-data";

export default function HelpPage() {
  return (
    <section className="space-y-6">
      <div className="section-frame rounded-[2.25rem] p-6 lg:p-8">
        <p className="eyebrow">Help</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Answers for the essentials.</h1>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {helpArticles.map((article) => (
          <article key={article} className="surface-card rounded-[2rem] p-6">
            <h2 className="text-2xl font-semibold tracking-tight">{article}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Seeded support content placeholder for the initial knowledge base.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
