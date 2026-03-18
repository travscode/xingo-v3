export default function HowItWorksPage() {
  const steps = [
    "User selects a learning module and reviews the scenario briefing.",
    "Two AI agents begin a role-specific conversation with voice and context.",
    "The interpreter responds live between both sides as the dialogue evolves.",
    "XINGO records the session, scores performance, and updates progress.",
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 pb-10 lg:px-10">
      <section className="section-frame rounded-[2.5rem] px-8 py-12 lg:px-12">
        <p className="eyebrow">How it works</p>
        <h1 className="display mt-4 max-w-4xl text-5xl font-semibold tracking-tight">
          A repeatable simulation loop instead of one-off role play.
        </h1>
        <div className="mt-10 grid gap-5 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step} className="surface-card rounded-[2rem] p-6">
              <div className="text-sm font-semibold text-brand">0{index + 1}</div>
              <p className="mt-4 text-sm leading-7 text-muted">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
