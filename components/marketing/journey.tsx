const stages = [
  {
    title: "Practise",
    description: "Realistic dialogues and role-plays, spoken out loud, whenever you have ten minutes.",
    ours: true,
  },
  {
    title: "Get scored",
    description: "A score against the test's criteria and plain notes on what to fix. Repeat until you clear the pass mark every time.",
    ours: true,
  },
  {
    title: "Get certified",
    description: "Walk into your test having already done it many times, with no surprises in the format.",
    ours: false,
  },
  {
    title: "Get work",
    description: "Your credential opens the door: interpreting assignments, visa points or registration in your profession.",
    ours: false,
  },
] as const;

/** Practise → get scored → get certified → get work, on a dark band. */
export function Journey() {
  return (
    <section className="rounded-2xl bg-ink px-6 py-10 text-paper sm:px-10 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-300">The path</p>
      <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.03em] text-balance sm:text-4xl">
        From first practice to your first job.
      </h2>
      <p className="mt-3 max-w-xl text-[15px] leading-6 text-gray-300">
        XINGO handles the first two steps. The last two are yours, and we make sure you&apos;re ready for them.
      </p>
      <ol className="mt-10 grid gap-8 md:grid-cols-4 md:gap-6">
        {stages.map((stage, index) => (
          <li key={stage.title} className="relative flex gap-4 md:flex-col md:gap-0">
            {/* Connector: vertical on mobile, horizontal from md */}
            {index < stages.length - 1 ? (
              <span
                aria-hidden
                className={
                  "absolute left-[15px] top-9 h-[calc(100%-4px)] w-0.5 md:left-9 md:top-[15px] md:h-0.5 md:w-[calc(100%-16px)] " +
                  (stage.ours && stages[index + 1].ours ? "bg-accent" : "bg-gray-700")
                }
              />
            ) : null}
            <span
              className={
                stage.ours
                  ? "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-ink"
                  : "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-gray-500 text-sm font-bold text-paper"
              }
            >
              {index + 1}
            </span>
            <div className="md:mt-5">
              <h3 className="text-lg font-bold tracking-[-0.02em]">{stage.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-gray-300">{stage.description}</p>
              <p className="mt-2 text-xs font-semibold text-gray-500">{stage.ours ? "With XINGO" : "Your part"}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
