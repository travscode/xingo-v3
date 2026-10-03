"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Check, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { people } from "@/components/marketing/people";

/**
 * Home hero visual: the XINGO story in four beats — listen, interpret, get scored,
 * get to work. One dark card, one idea at a time, auto-advancing like a story.
 * Pauses on hover; tap a bar to jump; holds still under reduced motion.
 * Example content only (fictional people, example score).
 */

const SCENE_MS = 4600;

const scenes = [
  { id: "listen", label: "Listen" },
  { id: "interpret", label: "Interpret" },
  { id: "score", label: "Get scored" },
  { id: "work", label: "Get to work" },
] as const;

const source = "When did the chest pain start, and does it spread anywhere?";
const rendition = "¿Cuándo empezó el dolor de pecho y se extiende a algún lado?";
const greetings = ["Hello", "Hola", "你好", "Xin chào", "مرحبا", "नमस्ते", "Γεια σας", "안녕하세요", "Olá", "Kumusta"];

function Words({ text, active, className }: { text: string; active: boolean; className?: string }) {
  return (
    <p className={className}>
      {text.split(" ").map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block transition-[opacity,transform,filter] duration-500 ease-out motion-reduce:transition-none"
          style={{
            opacity: active ? 1 : 0,
            transform: active ? "none" : "translateY(0.35em)",
            filter: active ? "none" : "blur(4px)",
            transitionDelay: active ? `${250 + index * 110}ms` : "0ms",
          }}
        >
          {word}&nbsp;
        </span>
      ))}
    </p>
  );
}

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1400);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);
  return active ? value : 0;
}

const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

export function HeroStory({ className }: { className?: string }) {
  const reduced = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => false);
  const [chosen, setChosen] = useState(0);
  const [paused, setPaused] = useState(false);
  // Reduced motion: hold on the score beat unless the visitor picks another.
  const index = reduced && chosen === 0 ? 2 : chosen;

  useEffect(() => {
    if (paused || reduced) return;
    const timeout = window.setTimeout(() => setChosen((current) => (current + 1) % scenes.length), SCENE_MS);
    return () => window.clearTimeout(timeout);
  }, [index, paused, reduced]);

  const score = useCountUp(82, index === 2);
  const is = (id: (typeof scenes)[number]["id"]) => scenes[index].id === id;

  return (
    <div
      className={cn(
        "relative isolate aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-ink text-paper shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]",
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="sr-only">
        How XINGO works: listen to the speaker, interpret out loud, get scored against the test&apos;s criteria, and walk into
        your test ready to work.
      </p>

      {/* Atmosphere: a soft lime glow that drifts between beats. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10 h-[70%] w-[70%] rounded-full bg-accent/25 blur-[90px] transition-all duration-[1600ms] ease-out"
        style={{ left: `${[5, 35, 20, 30][index]}%`, top: `${[10, 35, 5, 45][index]}%` }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] [background-size:22px_22px]" />

      {/* Story progress */}
      <div className="absolute inset-x-5 top-5 z-10 flex gap-1.5">
        {scenes.map((scene, i) => (
          <button
            key={scene.id}
            type="button"
            onClick={() => setChosen(i)}
            aria-label={`Show step ${i + 1}: ${scene.label}`}
            className="group relative h-6 flex-1"
          >
            <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-paper/20">
              <span
                key={`${scene.id}-${index}-${paused}`}
                className={cn("block h-full rounded-full bg-paper", i < index && "w-full", i > index && "w-0")}
                style={
                  i === index
                    ? reduced || paused
                      ? { width: "100%" }
                      : { animation: `storyFill ${SCENE_MS}ms linear forwards` }
                    : undefined
                }
              />
            </span>
          </button>
        ))}
      </div>
      <div className="absolute inset-x-5 top-12 z-10 flex items-center justify-between text-xs font-semibold tracking-wide text-paper/60">
        <span>
          <span className="tabular-nums text-paper">0{index + 1}</span> · {scenes[index].label}
        </span>
      </div>

      {/* 1 · Listen */}
      <div className={cn("absolute inset-0 flex flex-col items-center justify-center px-8 transition-opacity", is("listen") ? "opacity-100 delay-200 duration-500" : "pointer-events-none opacity-0 duration-200")}>
        <div className="relative">
          {[0, 1, 2].map((ring) => (
            <span
              key={ring}
              aria-hidden
              className="absolute inset-0 rounded-full border border-paper/30 motion-safe:animate-[storyRing_2.4s_ease-out_infinite]"
              style={{ animationDelay: `${ring * 0.8}s` }}
            />
          ))}
          <Image src={people.drKim} alt="" width={256} height={256} className="relative h-32 w-32 rounded-full object-cover ring-4 ring-ink sm:h-36 sm:w-36" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-paper/50">Dr Kim · English</p>
        <Words text={`“${source}”`} active={is("listen")} className="mt-3 text-center text-2xl font-semibold leading-snug tracking-[-0.02em] sm:text-[1.75rem]" />
      </div>

      {/* 2 · Interpret */}
      <div className={cn("absolute inset-0 flex flex-col justify-center px-8 transition-opacity", is("interpret") ? "opacity-100 delay-200 duration-500" : "pointer-events-none opacity-0 duration-200")}>
        <div className="flex items-center gap-3">
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-record">
            <span aria-hidden className="absolute inset-0 rounded-full bg-record/60 motion-safe:animate-ping" />
            <Mic className="relative h-5 w-5" aria-hidden />
          </span>
          <span className="text-sm font-semibold text-paper/70">You, interpreting for</span>
          <Image src={people.mei} alt="" width={256} height={256} className="h-9 w-9 rounded-full object-cover" />
          <span className="text-sm font-semibold">Mei</span>
        </div>
        <Words text={rendition} active={is("interpret")} className="mt-8 text-[2rem] font-bold leading-[1.1] tracking-[-0.035em] text-accent sm:text-[2.4rem]" />
        <div aria-hidden className="mt-8 flex h-8 items-end gap-1">
          {Array.from({ length: 28 }, (_, bar) => (
            <span
              key={bar}
              className="w-1 rounded-full bg-paper/40 motion-safe:animate-[storyBar_1.1s_ease-in-out_infinite]"
              style={{ height: `${20 + ((bar * 37) % 80)}%`, animationDelay: `${(bar % 7) * 0.12}s` }}
            />
          ))}
        </div>
      </div>

      {/* 3 · Get scored */}
      <div className={cn("absolute inset-0 flex flex-col items-center justify-center px-8 transition-opacity", is("score") ? "opacity-100 delay-200 duration-500" : "pointer-events-none opacity-0 duration-200")}>
        <div className="relative h-44 w-44 sm:h-48 sm:w-48">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - (is("score") ? 0.82 : 0))}
              className="transition-[stroke-dashoffset] duration-[1400ms] ease-out motion-reduce:transition-none"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-bold tabular-nums tracking-[-0.05em]">{reduced ? 82 : score}</span>
            <span className="text-xs font-semibold text-paper/50">out of 100</span>
          </div>
        </div>
        <div className="mt-8 w-full max-w-xs space-y-3">
          {[
            ["Accuracy", 88],
            ["Terminology", 79],
            ["Delivery", 76],
          ].map(([label, value], row) => (
            <div key={label}>
              <div className="flex justify-between text-sm">
                <span className="text-paper/70">{label}</span>
                <span className="font-semibold tabular-nums">{value}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper/10">
                <div
                  className="h-full rounded-full bg-paper transition-[width] duration-1000 ease-out motion-reduce:transition-none"
                  style={{ width: is("score") ? `${value}%` : "0%", transitionDelay: is("score") ? `${400 + row * 150}ms` : "0ms" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 · Get to work */}
      <div className={cn("absolute inset-0 flex flex-col justify-center px-8 transition-opacity", is("work") ? "opacity-100 delay-200 duration-500" : "pointer-events-none opacity-0 duration-200")}>
        <span
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-ink transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)]",
            is("work") ? "scale-100" : "scale-50",
          )}
        >
          <Check className="h-8 w-8" strokeWidth={3} aria-hidden />
        </span>
        <p className="mt-6 text-6xl font-bold tracking-[-0.05em] sm:text-7xl">Ready.</p>
        <p className="mt-3 max-w-xs text-lg leading-7 text-paper/70">You&apos;ve heard it, said it and fixed it. Walk in confident and get to work.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {["NAATI CCL", "OET", "IELTS", "Interpreting"].map((chip) => (
            <span key={chip} className="rounded-full border border-paper/20 px-3 py-1 text-sm font-semibold">
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* Languages drifting along the bottom */}
      <div aria-hidden className="absolute inset-x-0 bottom-5 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
        <div className="flex w-max gap-6 whitespace-nowrap text-sm font-semibold text-paper/35 motion-safe:animate-[logoMarquee_30s_linear_infinite]">
          {[...greetings, ...greetings].map((word, i) => (
            <span key={`${word}-${i}`}>{word}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
