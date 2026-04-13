import Link from "next/link";

const steps = [
  {
    title: "Pick a setting",
    copy: "Start from a module, then choose a scenario that matches the kind of conversation you want to practice.",
  },
  {
    title: "Interpret live",
    copy: "Two AI participants move the conversation forward. You step in between them as the interpreter.",
  },
  {
    title: "Finish and assess",
    copy: "When the session ends, XINGO scores the attempt and saves the result to your progress history.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 pb-10 pt-4 lg:px-10">
      <section className="rounded-[2.5rem] border border-line bg-white/82 px-6 py-8 shadow-[0_16px_44px_rgba(18,18,18,0.06)] lg:px-10 lg:py-12">
        <p className="eyebrow">How it works</p>
        <h1 className="display mt-4 max-w-3xl text-5xl font-semibold lg:text-6xl">
          A small flow. One task at a time.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          XINGO is designed so first-time users can start practicing without learning a complex system.
        </p>
      </section>

      <section className="space-y-4">
        {steps.map((step, index) => (
          <article key={step.title} className="surface-card rounded-[2rem] p-6 lg:p-8">
            <div className="grid gap-4 lg:grid-cols-[140px_1fr] lg:items-start">
              <div className="eyebrow">Step 0{index + 1}</div>
              <div>
                <h2 className="text-2xl font-semibold">{step.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{step.copy}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[2.25rem] border border-line bg-[#121212] px-6 py-8 text-white lg:px-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Start</p>
          <h2 className="display mt-3 text-4xl font-semibold">Open a free module and begin.</h2>
          <Link href="/sign-up" className="action-secondary mt-6 bg-white text-black hover:bg-white">
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}
