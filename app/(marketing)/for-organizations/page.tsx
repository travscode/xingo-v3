export default function ForOrganizationsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 pb-10 lg:px-10">
      <section className="section-frame rounded-[2.5rem] px-8 py-12 lg:px-12">
        <p className="eyebrow">For organizations</p>
        <h1 className="display mt-4 max-w-4xl text-5xl font-semibold tracking-tight">
          Manage cohorts, monitor performance, and assign work from the same dashboard.
        </h1>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {[
            "Bulk import students with CSV and map them into Clerk-backed organization memberships.",
            "Filter learners by score, industry specialization, and completion status.",
            "Search qualified interpreters and create job assignments tied to training results.",
            "Track adoption with completion, time-on-platform, and session-quality metrics.",
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
