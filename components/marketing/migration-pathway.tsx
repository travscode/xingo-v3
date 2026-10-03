"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { BadgeCheck, Briefcase, Languages, MessageCircle, Plane } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { people } from "@/components/marketing/people";
import { Flag } from "@/components/marketing/flag";

/**
 * Hero visual for /migrate-to-australia: a migrant's journey as five stops on a
 * line — arrive, English test, community language, certification, work. One stop
 * lights up at a time (pauses on hover, tap a stop to jump); under reduced motion
 * every stop is shown at once and nothing moves. Illustrative: fictional person,
 * general steps (not everyone takes every step).
 */

const STOP_MS = 3200;

type Stop = {
  id: string;
  label: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  chips: string[];
  xingo: boolean;
};

const stops: Stop[] = [
  {
    id: "arrive",
    label: "Plan or arrive",
    icon: Plane,
    title: "Find your visa's requirements",
    detail: "Each visa sets its own English level and evidence. Start on Home Affairs.",
    chips: ["Home Affairs", "Registered agent"],
    xingo: false,
  },
  {
    id: "english",
    label: "English test",
    icon: MessageCircle,
    title: "Speak with confidence",
    detail: "Rehearse the speaking test out loud with an AI examiner or patient.",
    chips: ["IELTS Speaking", "OET Speaking"],
    xingo: true,
  },
  {
    id: "ccl",
    label: "Community language",
    icon: Languages,
    title: "Interpret in your language pair",
    detail: "CCL-style dialogues with two AI speakers, scored out of 90.",
    chips: ["NAATI CCL"],
    xingo: true,
  },
  {
    id: "certify",
    label: "Certification",
    icon: BadgeCheck,
    title: "Get ready to be certified",
    detail: "Practise the dialogues the entry-level interpreting test is built on.",
    chips: ["NAATI CPI"],
    xingo: true,
  },
  {
    id: "work",
    label: "Work",
    icon: Briefcase,
    title: "Interpret for your community",
    detail: "Once you're NAATI certified, you can apply to work with 2M.",
    chips: ["2M Language Services"],
    xingo: false,
  },
];

const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

export function MigrationPathway({ className }: { className?: string }) {
  const reduced = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || reduced) return;
    const timeout = window.setTimeout(() => setIndex((current) => (current + 1) % stops.length), STOP_MS);
    return () => window.clearTimeout(timeout);
  }, [index, paused, reduced]);

  const active = stops[index];
  const fill = reduced ? 100 : (index / (stops.length - 1)) * 100;

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[2rem] bg-ink p-6 text-paper shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] sm:p-8",
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="sr-only">
        A common pathway: find your visa&apos;s requirements, take an English test, sit the NAATI CCL, get NAATI certified as an
        interpreter, then work. XINGO helps you practise the middle three. Illustrative only.
      </p>
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10 h-[60%] w-[70%] rounded-full bg-accent/20 blur-[90px] transition-all duration-[1600ms] ease-out motion-reduce:transition-none"
        style={{ left: `${-10 + index * 12}%`, top: `${index * 14}%` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] [background-size:22px_22px]"
      />

      {/* Who: a fictional newcomer */}
      <div className="flex items-center justify-between gap-3" aria-hidden>
        <div className="flex items-center gap-3">
          <span className="relative">
            <span className="absolute inset-0 rounded-full border border-paper/30 motion-safe:animate-[storyRing_2.4s_ease-out_infinite]" />
            <Image src={people.linh} alt="" width={96} height={96} className="relative h-11 w-11 rounded-full object-cover ring-2 ring-ink" />
          </span>
          <div>
            <p className="text-sm font-semibold">Linh&apos;s pathway</p>
            <p className="text-xs text-paper/50">Vietnamese · English</p>
          </div>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-paper/15 px-3 py-1 text-xs font-semibold text-paper/70">
          <Flag country="Australia" className="ring-paper/20" />
          Australia
        </span>
      </div>

      {/* The line */}
      <ol className="relative mt-8 space-y-1" aria-label="Pathway steps">
        <span aria-hidden className="absolute bottom-5 left-[19px] top-5 w-0.5 rounded-full bg-paper/15" />
        <span
          aria-hidden
          className="absolute left-[19px] top-5 w-0.5 rounded-full bg-accent transition-[height] duration-700 ease-out motion-reduce:transition-none"
          style={{ height: `calc((100% - 2.5rem) * ${fill / 100})` }}
        />
        {stops.map((stop, i) => {
          const Icon = stop.icon;
          const on = reduced || i === index;
          const done = !reduced && i < index;
          return (
            <li key={stop.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={!reduced && i === index ? "step" : undefined}
                className="group relative flex w-full items-center gap-4 rounded-xl py-1.5 pr-2 text-left"
              >
                <span
                  className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 motion-reduce:transition-none",
                    on && stop.xingo && "scale-110 border-accent bg-accent text-accent-ink",
                    on && !stop.xingo && "scale-110 border-paper bg-paper text-ink",
                    !on && done && "border-accent bg-ink text-accent",
                    !on && !done && "border-paper/25 bg-ink text-paper/60",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-[15px] font-semibold transition-colors duration-300",
                      on ? "text-paper" : "text-paper/55 group-hover:text-paper/80",
                    )}
                  >
                    {stop.label}
                  </span>
                  {reduced ? <span className="block text-xs text-paper/50">{stop.chips.join(" · ")}</span> : null}
                </span>
                {stop.xingo ? (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors",
                      on ? "bg-accent/15 text-accent" : "text-paper/35",
                    )}
                  >
                    Practise on XINGO
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>

      {/* Detail for the active stop */}
      {reduced ? null : (
        <div aria-live="polite" className="mt-6 min-h-[132px] rounded-2xl border border-paper/10 bg-paper/[0.04] p-5">
          <div key={active.id} className="motion-safe:animate-[mkRise_500ms_cubic-bezier(0.2,0.7,0.2,1)_both]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-paper/45">
              Step {index + 1} of {stops.length}
            </p>
            <p className="mt-1.5 text-xl font-bold tracking-[-0.02em]">{active.title}</p>
            <p className="mt-1 text-sm leading-6 text-paper/65">{active.detail}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {active.chips.map((chip) => (
                <span key={chip} className="rounded-full border border-paper/20 px-2.5 py-0.5 text-xs font-semibold">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="mt-4 text-[11px] text-paper/40">Illustrative. Not everyone takes every step.</p>
    </div>
  );
}
