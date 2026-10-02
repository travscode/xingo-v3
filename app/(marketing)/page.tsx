import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { CtaBand } from "@/components/marketing/cta-band";
import {
  howItWorksSteps,
  practiceModules,
} from "@/components/marketing/catalogue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { CCL_MAX_SCORE, CCL_PASS_SCORE } from "@/lib/scoring";
import { packList, plans } from "@/lib/plans";

const cheapestPack = packList[0];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 sm:gap-28 sm:px-6">
      {/* Hero */}
      <section className="grid items-center gap-10 pt-8 sm:pt-14 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="eyebrow">Interpreter practice</p>
          <h1 className="mt-4 text-5xl font-bold tracking-[-0.04em] text-balance sm:text-7xl">
            Practise interpreting out loud. Get scored in minutes.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-7 text-gray-500">
            XINGO puts you between two AI speakers in a realistic conversation.
            You interpret by voice. Then you get a score and clear feedback.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Start free
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            {plans.free.monthlyMinutes} free practice minutes every month. No
            card needed.
          </p>
        </div>
        <div className="relative mx-auto aspect-[2/3] w-full max-w-sm overflow-hidden rounded-xl bg-gray-100">
          <Image
            src="/images/hero-interpreter-training.jpg"
            alt="An interpreter practising with a headset"
            fill
            priority
            sizes="(min-width: 1024px) 384px, 90vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* How it works */}
      <section>
        <p className="eyebrow">How it works</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
          A real interpreting session, on demand.
        </h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {howItWorksSteps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-xl border border-gray-200 p-6"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-sm font-bold text-paper">
                {index + 1}
              </span>
              <h3 className="mt-5 text-lg font-bold tracking-[-0.02em]">
                {step.title}
              </h3>
              <p className="mt-2 text-[15px] leading-6 text-gray-500">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* NAATI CCL callout */}
      <section className="grid overflow-hidden rounded-xl bg-gray-50 lg:grid-cols-2">
        <div className="p-6 sm:p-10">
          <Badge tone="accent">NAATI CCL</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            Preparing for the CCL test?
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-6 text-gray-500">
            Practise short community dialogues in the CCL format, in your
            language pair. Every attempt is scored out of {CCL_MAX_SCORE}, with{" "}
            {CCL_PASS_SCORE} as the pass mark, so you can see where you stand
            before test day.
          </p>
          <Button asChild className="mt-8">
            <Link href="/naati/ccl">
              Explore CCL practice
              <ArrowRight size={16} />
            </Link>
          </Button>
          <p className="mt-6 text-xs text-gray-500">
            XINGO is independent and not affiliated with NAATI.
          </p>
        </div>
        <div className="relative min-h-64">
          <Image
            src="/images/doctor3.webp"
            alt="A practice session in progress"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* Modules */}
      <section>
        <p className="eyebrow">Modules</p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-2xl text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            Practise for the settings you work in.
          </h2>
          <p className="max-w-sm text-sm text-gray-500">
            Free modules are open to everyone. Every premium module includes one
            free preview dialogue.
          </p>
        </div>
        <ul className="mt-10 grid gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-3">
          {practiceModules.map((module) => (
            <li key={module.title} className="bg-paper p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-bold">{module.title}</h3>
                {module.access === "free" ? (
                  <Badge tone="success">Free</Badge>
                ) : (
                  <Badge>Pro or pack</Badge>
                )}
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                {module.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Pricing teaser */}
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="eyebrow">Pricing</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            Pay for practice time. Nothing else.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-6 text-gray-500">
            You pay for minutes spent in a live session. Scoring and feedback
            are included.
          </p>
          <Button asChild variant="outline" className="mt-8">
            <Link href="/pricing">See full pricing</Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <PriceTile
            label={plans.free.label}
            price={plans.free.priceLabel}
            note={`${plans.free.monthlyMinutes} min / month`}
          />
          <PriceTile
            label={plans.professional.label}
            price={plans.professional.priceLabel.replace(" / month", "")}
            note={`${plans.professional.monthlyMinutes} min / month`}
            highlight
          />
          <PriceTile
            label="Minute packs"
            price={`from ${cheapestPack.priceLabel}`}
            note="One-off. Never expire."
          />
        </div>
      </section>

      <CtaBand
        title="Start with a free session."
        description="Create an account, pick a module and start talking."
        secondary={
          <ul className="flex flex-col gap-1 text-sm text-gray-300 sm:ml-4">
            <li className="flex items-center gap-2">
              <Check size={14} /> {plans.free.monthlyMinutes} free minutes every
              month
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} /> No card needed
            </li>
          </ul>
        }
      />
    </main>
  );
}

function PriceTile({
  label,
  price,
  note,
  highlight,
}: {
  label: string;
  price: string;
  note: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-xl bg-ink p-5 text-paper"
          : "rounded-xl border border-gray-200 p-5"
      }
    >
      <div
        className={
          highlight ? "text-sm text-gray-300" : "text-sm text-gray-500"
        }
      >
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-[-0.03em]">{price}</div>
      <div
        className={
          highlight
            ? "mt-1 text-xs text-gray-300"
            : "mt-1 text-xs text-gray-500"
        }
      >
        {note}
      </div>
    </div>
  );
}
