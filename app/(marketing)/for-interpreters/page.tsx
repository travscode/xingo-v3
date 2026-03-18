export default function ForInterpretersPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 pb-10 lg:px-10">
      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="section-frame rounded-[2.5rem] px-8 py-12 lg:px-12">
          <p className="eyebrow">For interpreters</p>
          <h1 className="display mt-4 text-5xl font-semibold tracking-tight">
            Practice until terminology, timing, and confidence become routine.
          </h1>
          <p className="mt-6 text-base leading-8 text-muted">
            Free onboarding modules lower the barrier to entry. Paid modules expand into the
            high-stakes sectors where interpreters need repeatable exposure.
          </p>
        </div>
        <div className="grid gap-5">
          {[
            "Replay scenarios as often as needed instead of waiting for live role-play sessions.",
            "See score trends, completion rates, and sector-specific strengths over time.",
            "Earn badges that can later support interpreter discovery by hiring organizations.",
          ].map((item) => (
            <div key={item} className="surface-card rounded-[2rem] p-6 text-sm leading-7 text-muted">
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
