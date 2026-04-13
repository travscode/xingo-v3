import Link from "next/link";

const steps = [
  "Invite learners or upload a cohort.",
  "Assign practice and watch assessment history build over time.",
  "Use scores and badges to spot who is ready for more.",
];

const features = [
  "Per-candidate pricing",
  "Progress reporting",
  "Recruitment access on higher tiers",
];

export default function ForOrganizationsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 pb-10 pt-4 lg:px-10">
      <section className="rounded-[2.5rem] border border-line bg-white/82 px-6 py-8 shadow-[0_16px_44px_rgba(18,18,18,0.06)] lg:px-10 lg:py-12">
        <p className="eyebrow">For teams</p>
        <h1 className="display mt-4 max-w-3xl text-5xl font-semibold lg:text-6xl">
          One place to train a cohort and see who is improving.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          XINGO keeps interpreter practice, assessment history, and team
          visibility together.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/pricing" className="action-primary">
            View pricing
          </Link>
          <Link href="/sign-up" className="action-secondary">
            Sign up now
          </Link>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {steps.map((step, index) => (
          <article key={step} className="surface-card rounded-[2rem] p-6">
            <div className="score-pill inline-flex rounded-full px-3 py-1.5 text-sm font-semibold">
              0{index + 1}
            </div>
            <p className="mt-4 text-sm leading-7 text-muted">{step}</p>
          </article>
        ))}
      </section>

      <section className="section-frame rounded-[2rem] p-6 lg:p-8">
        <p className="eyebrow">Built for rollout</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {features.map((item) => (
            <div
              key={item}
              className="rounded-[1.5rem] border border-line bg-white px-4 py-5 text-sm font-medium"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
