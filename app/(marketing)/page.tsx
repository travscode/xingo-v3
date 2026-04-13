import Link from "next/link";
import Image from "next/image";
import { ModuleCard } from "@/components/modules/module-card";
import { learningModules } from "@/lib/mock-data";
import { ArrowRightIcon } from "@/components/ui/icons";

const paths = [
  {
    title: "For interpreters",
    copy: "Practice on your own schedule. Build confidence before the real thing.",
    href: "/for-interpreters",
    cta: "Start training",
  },
  {
    title: "For teams",
    copy: "Run cohorts, track performance, and see who is ready for more.",
    href: "/for-organizations",
    cta: "See team tools",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-10 pt-4 lg:px-10">
      <section className="grid gap-8 rounded-[2.5rem] border border-line bg-white/80 px-6 py-8 shadow-[0_16px_44px_rgba(18,18,18,0.06)] lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-12">
        <div className="max-w-3xl">
          <p className="eyebrow">Interpreter practice</p>
          <h1 className="display mt-4 text-5xl font-semibold text-balance lg:text-7xl">
            Practice live. Get scored. Keep improving.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            Xingo gives interpreters a simple way to practice real conversations
            in a safe space with AI actors.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-up" className="action-primary">
              Try free practice
              <ArrowRightIcon className="inline-block ml-4" size={14} />
            </Link>
            <Link href="/how-it-works" className="action-secondary">
              See how it works
            </Link>
          </div>
          <div className="mt-18 flex flex-wrap gap-3 text-sm text-muted">
            <span className="mono-chip rounded-full px-4 py-2 border-0 bg-brand-orange text-black font-semibold">
              Real-time practice
            </span>
            <span className="mono-chip rounded-full px-4 py-2 border-0 bg-brand-green text-black font-semibold">
              Saved assessments
            </span>
            <span className="mono-chip rounded-full px-4 py-2 border-0 bg-brand-pink text-black font-semibold">
              Microcredentials
            </span>
          </div>
        </div>

        <div className=" ">
          <div className="flex items-end justify-end">
            <Image
              src="/images/hero-interpreter-training.jpg"
              width={357}
              height={536}
              alt="Woman interpreter training"
              className="rounded-4xl"
            />
          </div>
        </div>
      </section>

      <section className="section-frame rounded-[2.5rem] grid gap-10 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-12 items-center">
        <div className="max-w-xl">
          <h2 className="display text-3xl font-bold lg:text-4xl leading-tight">
            Build confidence, even in <br />
            high-stakes moments
          </h2>
          <p className="mt-6 text-lg text-muted">
            Practice real interpreting. Feel ready faster.
          </p>
          <div className="mt-10 flex items-center gap-8">
            <Link href={paths[0].href} className="action-primary">
              {paths[0].cta}
              <ArrowRightIcon className="inline-block ml-4" size={14} />
            </Link>
            <Link
              href={paths[1].href}
              className="text-sm font-semibold underline underline-offset-4 hover:text-muted transition"
            >
              {paths[1].cta}
            </Link>
          </div>
        </div>
        <div className="relative aspect-[1.8/1] w-full overflow-hidden rounded-4xl">
          <Image
            src="/images/start-practice.jpg"
            fill
            className="object-cover"
            alt="Practice scene"
          />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">Start here</p>
            <h2 className="display mt-3 text-4xl font-bold">
              Learn in industries that matter
            </h2>
          </div>
          <Link
            href="/pricing"
            className="hidden text-sm font-semibold text-muted transition hover:text-foreground md:block"
          >
            View pricing
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {learningModules.slice(0, 3).map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>

      <section className="rounded-[2.25rem] border border-line bg-[#121212] px-6 py-8 text-white lg:px-10 lg:py-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
            Ready
          </p>
          <h2 className="display mt-3 text-4xl font-semibold">
            Start with one session.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/70">
            You do not need to learn the system first. Pick a module and begin.
          </p>
          <Link
            href="/sign-up"
            className="action-secondary mt-6 bg-brand-green text-black hover:bg-white"
          >
            Create free account
            <ArrowRightIcon className="inline-block ml-4" size={14} />
          </Link>
        </div>
      </section>
    </main>
  );
}
