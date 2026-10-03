import type { ReactNode } from "react";
import Image from "next/image";
import { Mic } from "lucide-react";
import { people, type PersonKey } from "@/components/marketing/people";
import { Badge } from "@/components/ui/primitives";
import { CCL_MAX_SCORE, CCL_PASS_SCORE, PASS_SCORE, assessmentDimensions } from "@/lib/scoring";
import { cn } from "@/lib/utils";

/*
 * Illustrations of the real product UI, built from HTML/CSS so they stay crisp
 * and on-brand. Purely decorative: each one carries a text description for
 * screen readers and hides the animated parts. Animations live in globals.css
 * (mk-*) and stop under prefers-reduced-motion.
 */

type Phase = 1 | 2 | 3;

/** Stacks one piece of content per phase in the same grid cell; CSS fades between them. */
function PhaseStack({ phases, className }: { phases: Record<Phase, ReactNode>; className?: string }) {
  return (
    <span className={cn("grid", className)}>
      {([1, 2, 3] as const).map((phase) => (
        <span key={phase} className={cn("col-start-1 row-start-1", `mk-p${phase}`)}>
          {phases[phase]}
        </span>
      ))}
    </span>
  );
}

function VoiceBars({ className }: { className?: string }) {
  return (
    <span className={cn("mk-bars flex h-5 items-center gap-[3px]", className)}>
      <span />
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

function MockTile({
  person,
  name,
  role,
  language,
  activePhases,
  speakingPhase,
  listeningPhase,
  labels,
}: {
  person: PersonKey;
  name: string;
  role: string;
  language: string;
  activePhases: Phase[];
  speakingPhase?: Phase;
  listeningPhase?: Phase;
  labels: Record<Phase, ReactNode>;
}) {
  return (
    <div className="relative flex flex-col items-center rounded-2xl bg-gray-50 px-2 py-4 text-center sm:px-4 sm:py-5">
      {activePhases.map((phase) => (
        <span
          key={phase}
          className={cn("absolute inset-0 rounded-2xl border-2 border-live", `mk-p${phase}`)}
          aria-hidden
        />
      ))}
      <div className="relative">
        {speakingPhase ? (
          <span className={`mk-p${speakingPhase} absolute inset-0`}>
            <span className="avatar-speaking-ring" />
          </span>
        ) : null}
        {listeningPhase ? (
          <span className={`mk-p${listeningPhase} absolute inset-0`}>
            <span className="record-ring" />
          </span>
        ) : null}
        <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gray-200 sm:h-20 sm:w-20">
          <Image src={people[person]} alt="" fill sizes="80px" className="object-cover" />
          {speakingPhase ? (
            <span
              className={`mk-p${speakingPhase} absolute inset-0 flex items-center justify-center bg-ink/50 text-paper`}
            >
              <VoiceBars />
            </span>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-sm font-bold">{name}</p>
      <p className="text-xs text-gray-500">
        {role} · {language}
      </p>
      <PhaseStack phases={labels} className="mt-2 text-xs font-semibold" />
    </div>
  );
}

/** Animated practice room: the professional speaks, you interpret, the client answers. */
export function RoomMock({ className }: { className?: string }) {
  return (
    <figure className={cn("rounded-2xl border border-gray-200 bg-paper p-3 sm:p-5", className)}>
      <figcaption className="sr-only">
        The XINGO practice room: a doctor speaking English and a patient speaking Mandarin, with you interpreting
        between them by holding the microphone button.
      </figcaption>
      <div aria-hidden>
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Medical ER intake</p>
            <p className="text-xs text-gray-500">English ⇄ Mandarin</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge tone="live">Live</Badge>
            <span className="text-xs font-semibold tabular-nums text-gray-500">6 min left</span>
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-ink px-3 py-2.5 text-sm font-semibold text-paper">
          <PhaseStack
            phases={{
              1: "Listen to Dr Kim.",
              2: "Interpret into Mandarin for Mei.",
              3: "Now interpret Mei's answer into English.",
            }}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
          <MockTile
            person="drKim"
            name="Dr Kim"
            role="Doctor"
            language="English"
            activePhases={[1]}
            speakingPhase={1}
            labels={{
              1: <span className="text-live">Speaking</span>,
              2: <span className="text-gray-500">Tap to talk to them</span>,
              3: <span className="text-gray-500">Tap to talk to them</span>,
            }}
          />
          <MockTile
            person="mei"
            name="Mei"
            role="Patient"
            language="Mandarin"
            activePhases={[2, 3]}
            speakingPhase={3}
            listeningPhase={2}
            labels={{
              1: <span className="text-gray-500">Tap to talk to them</span>,
              2: <span className="text-record">Listening to you</span>,
              3: <span className="text-live">Speaking</span>,
            }}
          />
        </div>

        <div className="mt-4 flex flex-col items-center pb-1">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-ink text-paper sm:h-20 sm:w-20">
            <span className="mk-p2 absolute inset-0 rounded-full bg-record">
              <span className="record-ring" />
            </span>
            <Mic className="relative h-7 w-7" />
          </div>
          <PhaseStack
            className="mt-2 text-center text-xs font-semibold sm:text-sm"
            phases={{
              1: "Hold to talk",
              2: "Talking to Mei… release to send",
              3: "Hold to talk",
            }}
          />
        </div>
      </div>
    </figure>
  );
}

/** Illustrative dimension values for the example score cards. */
const exampleDimensionValues = [0.86, 0.72, 0.8, 0.9, 0.84];

/** Example result card. Clearly labelled as an example; values are illustrative. */
export function ScoreMock({ scale = "general", className }: { scale?: "ccl" | "general"; className?: string }) {
  const max = scale === "ccl" ? CCL_MAX_SCORE : 100;
  const pass = scale === "ccl" ? CCL_PASS_SCORE : PASS_SCORE;
  const score = Math.min(max, pass + 4);

  return (
    <figure className={cn("rounded-2xl border border-gray-200 bg-paper p-5 sm:p-6", className)}>
      <div className="flex items-center justify-between gap-3">
        <figcaption className="text-sm font-semibold">Your result</figcaption>
        <Badge>Example</Badge>
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-5xl font-bold tracking-[-0.04em] tabular-nums">{score}</span>
          <span className="text-lg text-gray-500 tabular-nums">/ {max}</span>
        </div>
        <div className="text-right">
          <Badge tone="accent">Pass</Badge>
          <p className="mt-1 text-xs text-gray-500 tabular-nums">Pass mark {pass}</p>
        </div>
      </div>
      <ul className="mt-6 space-y-3">
        {assessmentDimensions.map((dimension, index) => (
          <li key={dimension.key}>
            <div className="flex justify-between text-xs font-semibold">
              <span>{dimension.label}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-200" aria-hidden>
              <div
                className="mk-fill h-full rounded-full bg-accent"
                style={{
                  width: `${exampleDimensionValues[index % exampleDimensionValues.length] * 100}%`,
                  animationDelay: `${300 + index * 90}ms`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 rounded-lg bg-gray-50 p-3 text-sm leading-6">
        <span className="font-semibold">Work on next: </span>
        <span className="text-gray-700">you dropped the appointment time in turn 4. Carry every number across.</span>
      </div>
      <p className="mt-3 text-xs text-gray-500">Illustrative example, not a real result.</p>
    </figure>
  );
}

/* ---- Small step illustrations (used inside step cards) ------------------- */

function MiniAvatar({ person, active }: { person: PersonKey; active?: boolean }) {
  return (
    <span className={cn("relative block h-12 w-12 rounded-full bg-paper", active && "ring-2 ring-live")}>
      <Image src={people[person]} alt="" width={48} height={48} sizes="48px" className="rounded-full object-cover" />
      {active ? (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/50 text-paper">
          <VoiceBars className="h-3.5" />
        </span>
      ) : null}
    </span>
  );
}

/** Two speakers who can't understand each other, with you in the middle. */
export function SpeakersVisual() {
  return (
    <div className="flex w-full items-center justify-center gap-3" aria-hidden>
      <div className="flex flex-col items-center gap-1.5">
        <MiniAvatar person="drKim" active />
        <span className="text-[11px] font-semibold">English</span>
      </div>
      <div className="flex flex-1 items-center gap-1.5 text-gray-500">
        <span className="h-px flex-1 border-t border-dashed border-gray-300" />
        <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-paper">You</span>
        <span className="h-px flex-1 border-t border-dashed border-gray-300" />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <MiniAvatar person="mei" />
        <span className="text-[11px] font-semibold">Your language</span>
      </div>
    </div>
  );
}

/** Hold-to-talk mic, open. */
export function MicVisual() {
  return (
    <div className="flex flex-col items-center gap-3" aria-hidden>
      <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-record text-paper">
        <span className="record-ring" />
        <Mic className="h-7 w-7" />
      </span>
      <span className="flex items-center gap-1.5 text-xs font-semibold">
        Hold
        <kbd className="rounded-md border border-gray-300 bg-paper px-2 py-0.5 font-sans text-[11px]">Space</kbd>
        to talk
      </span>
    </div>
  );
}

/** Compact score card. `criteria` swaps the score for exam-criteria feedback (no pass claim). */
export function ScoreVisual({ criteria = false }: { criteria?: boolean }) {
  return (
    <div className="w-full max-w-[220px] rounded-xl bg-paper p-4" aria-hidden>
      {criteria ? (
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">Feedback</span>
          <Badge>By criterion</Badge>
        </div>
      ) : (
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold tracking-[-0.04em] tabular-nums">
            {PASS_SCORE + 7}
            <span className="ml-1 text-sm font-medium text-gray-500">/ 100</span>
          </span>
          <Badge tone="accent">Pass</Badge>
        </div>
      )}
      <div className="mt-3 space-y-2">
        {exampleDimensionValues.slice(0, 3).map((value, index) => (
          <div key={index} className="h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className="mk-fill h-full rounded-full bg-accent"
              style={{ width: `${value * 100}%`, animationDelay: `${200 + index * 120}ms` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Exam-style task card, for speaking-exam role-plays. */
export function TaskCardVisual() {
  return (
    <div className="w-full max-w-[230px] rounded-xl bg-paper p-4 text-left" aria-hidden>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">Role-play card</p>
      <dl className="mt-2 space-y-1.5 text-xs">
        <div>
          <dt className="inline font-semibold">Setting: </dt>
          <dd className="inline text-gray-700">Hospital ward</dd>
        </div>
        <div>
          <dt className="inline font-semibold">You are: </dt>
          <dd className="inline text-gray-700">the nurse</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Task: </dt>
          <dd className="inline text-gray-700">explain the discharge plan</dd>
        </div>
      </dl>
    </div>
  );
}

/** One partner speaking, mic ready. */
export function PartnerVisual() {
  return (
    <div className="flex items-center gap-4" aria-hidden>
      <div className="flex flex-col items-center gap-1.5">
        <MiniAvatar person="jp" active />
        <span className="text-[11px] font-semibold text-live">Speaking</span>
      </div>
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-ink text-paper">
        <Mic className="h-6 w-6" />
      </span>
    </div>
  );
}
