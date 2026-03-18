import Link from "next/link";
import { ModuleCard } from "@/components/modules/module-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatCard } from "@/components/ui/stat-card";
import { dashboardMetrics, learningModules } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 pb-10 lg:px-10">
      <section className="section-frame overflow-hidden rounded-[2.5rem] px-8 py-12 lg:px-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="eyebrow">AI Interpreter Training Platform</p>
            <h1 className="display mt-5 max-w-4xl text-5xl leading-none font-semibold tracking-tight text-balance lg:text-7xl">
              Real-world voice simulations for interpreters who need repetition, scoring, and proof of skill.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              XINGO combines LMS structure, conversational AI practice, progress tracking, and
              organization oversight so interpreters can train and get discovered.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/sign-up"
                className="rounded-full bg-brand px-6 py-4 text-sm font-semibold text-white transition hover:bg-brand-strong"
              >
                Try free modules
              </Link>
              <Link
                href="/for-organizations"
                className="rounded-full border border-line px-6 py-4 text-sm font-semibold text-foreground transition hover:bg-white/70"
              >
                Explore organization tools
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {dashboardMetrics.map((metric) => (
              <StatCard key={metric.label} label={metric.label} value={metric.value} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading
          eyebrow="What the platform does"
          title="Training, evaluation, and employment flow through the same system."
          description="Interpreters move from practice sessions to credentials. Organizations move from student oversight to job assignment. The architecture is set up to support both."
        />
        <div className="grid gap-5 md:grid-cols-2">
          {[
            "Browse sector-based modules in legal, medical, immigration, and community contexts.",
            "Practice live interpreting against two AI voices that keep the scenario moving.",
            "Track score, duration, transcripts, and completion status across every session.",
            "Issue micro-credentials and surface qualified interpreters to organizations.",
          ].map((item) => (
            <div key={item} className="surface-card rounded-[2rem] p-6 text-sm leading-7 text-muted">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Featured modules"
          title="Start with free modules, then unlock advanced scenarios."
          description="The initial library below mirrors the module model from the specification and gives the product a concrete training footprint."
        />
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {learningModules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>
    </main>
  );
}
