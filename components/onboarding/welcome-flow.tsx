"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useConvex, useMutation, useQuery } from "convex/react";
import { ArrowLeft, Check, Loader2, Mic, Repeat, Trophy, Users } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { track } from "@/lib/analytics";
import { guessHeardAbout, heardAboutOptions, type HeardAboutId } from "@/lib/heard-about";
import { readFirstTouch } from "@/components/providers/first-touch";
import { isGoalComingSoon, isGoalComingSoonOnSite, isSpeakingGoal, practiceGoals, type PracticeGoalId } from "@/lib/goals";
import { createLanguagePair, flagEmoji, practiceLanguages } from "@/lib/languages";
import { plans } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { useActiveLanguagePair } from "@/components/providers/language-pair-context";
import { HeadphonesTip, Kbd, MicCheck } from "@/components/practice/room-parts";
import { Button } from "@/components/ui/button";
import { XingoMark } from "@/components/ui/logo";

/** Longest the setting-up question waits for an answer before going on (D-055). */
const HEARD_ABOUT_WAIT_MS = 12_000;

/**
 * First-run flow: goal -> language -> how it works -> setup -> setting up (with one
 * quick question) -> first dialogue. Ends inside a practice room so a new learner is
 * speaking within a minute. The Continue button stays pinned to the bottom (D-055).
 */
export function WelcomeFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const convex = useConvex();
  const me = useQuery(api.users.me, {});
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const setHeardAbout = useMutation(api.users.setHeardAbout);
  const { setActivePair } = useActiveLanguagePair();

  // Landing pages can preselect a goal and language (lib/seo-pages.ts → signUpHref).
  const presetGoal = practiceGoals.find((option) => option.id === searchParams.get("goal"))?.id ?? null;
  const presetLanguage = practiceLanguages.find(
    (option) => option.name.toLowerCase() === (searchParams.get("language") ?? "").toLowerCase(),
  )?.name ?? null;
  // Beta invites (D-049) already know the goal, so they start at the language step.
  const [step, setStep] = useState(presetGoal && searchParams.get("beta") ? 2 : 1);
  const [pickedGoal, setGoal] = useState<PracticeGoalId | null>(presetGoal);
  const [language, setLanguage] = useState<string | null>(presetLanguage);
  const [settingUp, setSettingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coming-soon goals (D-043) aren't offered. Until live statuses load, use the site's line-up.
  const catalog = useQuery(api.catalog.forCurrentUser, {});
  const comingSoonIds = new Set(catalog?.modules.filter((m) => m.comingSoon).map((m) => m.id) ?? []);
  const goalComingSoon = (id: PracticeGoalId) =>
    catalog ? isGoalComingSoon(id, (moduleId) => comingSoonIds.has(moduleId)) : isGoalComingSoonOnSite(id);
  const goal = pickedGoal && !goalComingSoon(pickedGoal) ? pickedGoal : null;

  const firstName = me?.user.name.split(" ")[0];
  const speakingOnly = isSpeakingGoal(goal);
  // English-only exams skip the language step.
  const chosenLanguage = speakingOnly ? "English" : language;
  const totalSteps = speakingOnly ? 3 : 4;
  const visibleStep = speakingOnly && step >= 3 ? step - 1 : step;

  // The goal the learner arrived with goes first, in its group, and its group goes first.
  const groups = (
    [
      ["interpreting", "Interpreting"],
      ["speaking", "English speaking exams"],
    ] as const
  )
    .map(([kind, heading]) => ({
      kind,
      heading,
      goals: practiceGoals
        .filter((option) => option.kind === kind && !goalComingSoon(option.id))
        .sort((a, b) => Number(b.id === presetGoal) - Number(a.id === presetGoal)),
    }))
    .filter((group) => group.goals.length > 0)
    .sort((a, b) => Number(b.goals.some((g) => g.id === presetGoal)) - Number(a.goals.some((g) => g.id === presetGoal)));

  const next = (from: "goal" | "language" | "how") => {
    track("onboarding_step", {
      step: from,
      goal: goal ?? undefined,
      language: chosenLanguage ?? undefined,
      preset: from === "goal" ? Boolean(presetGoal) : undefined,
    });
    setStep(from === "goal" ? (speakingOnly ? 3 : 2) : from === "language" ? 3 : 4);
    window.scrollTo({ top: 0 });
  };

  /** Saves the setup and works out where the first dialogue is. Runs behind the setting-up screen. */
  const prepare = async () => {
    if (!goal || !chosenLanguage) throw new Error("missing");
    const pair = createLanguagePair("English", chosenLanguage);
    await completeOnboarding({
      practiceGoal: goal,
      languagePair: { sourceLanguage: pair.sourceLanguage, targetLanguage: pair.targetLanguage },
    });
    setActivePair(pair);
    track("onboarding_complete", { goal, language: chosenLanguage });

    const nextParam = searchParams.get("next");
    if (nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") && nextParam !== "/dashboard" && nextParam !== "/welcome") {
      return nextParam;
    }
    const latest = await convex.query(api.catalog.forCurrentUser, {});
    return latest.nextUp ? `/practice/${latest.nextUp.scenarioId}` : "/dashboard";
  };

  if (settingUp && goal) {
    return (
      <SettingUp
        goal={goal}
        prepare={prepare}
        onDone={(href) => router.replace(href)}
        onFailed={() => {
          setSettingUp(false);
          setError("We couldn't save that. Please try again.");
        }}
        saveHeardAbout={(heardAbout) => setHeardAbout({ heardAbout })}
        prefetch={(href) => router.prefetch(href)}
      />
    );
  }

  const footer =
    step === 1 ? (
      <Button size="lg" block disabled={!goal} onClick={() => next("goal")}>
        Continue
      </Button>
    ) : step === 2 ? (
      <Button size="lg" block disabled={!chosenLanguage} onClick={() => next("language")}>
        Continue
      </Button>
    ) : step === 3 ? (
      <Button size="lg" block onClick={() => next("how")}>
        Continue
      </Button>
    ) : (
      <Button
        size="lg"
        block
        disabled={!goal || !chosenLanguage}
        onClick={() => {
          setError(null);
          track("onboarding_step", { step: "setup", goal: goal ?? undefined, language: chosenLanguage ?? undefined });
          setSettingUp(true);
        }}
      >
        {goal === "ielts" ? "Start my first mock test" : "Start my first dialogue"}
      </Button>
    );

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="flex items-center justify-between px-4 py-4 sm:px-8">
        <div className="flex items-center gap-2">
          <XingoMark className="h-7 w-auto" />
          <span className="text-lg font-bold tracking-[-0.03em]">XINGO</span>
        </div>
        <div className="flex items-center gap-1.5" aria-label={`Step ${visibleStep} of ${totalSteps}`}>
          {Array.from({ length: totalSteps }, (_, index) => (
            <span
              key={index}
              className={cn("h-1.5 w-8 rounded-full", index < visibleStep ? "bg-ink" : "bg-gray-200")}
            />
          ))}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-8 pt-6 sm:pt-12">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(speakingOnly && step === 3 ? 1 : step - 1)}
            className="mb-6 inline-flex min-h-11 w-fit items-center gap-1 text-sm font-semibold text-gray-500 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        ) : null}

        {step === 1 ? (
          <>
            <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              {firstName ? `Welcome, ${firstName}.` : "Welcome."} What are you preparing for?
            </h1>
            <p className="mt-2 text-gray-500">We&apos;ll put the right dialogues first. You can practise anything later.</p>
            {groups.map((group) => (
              <div key={group.kind} className="mt-8">
                <p className="mb-3 text-sm font-semibold text-gray-500">{group.heading}</p>
                <div className="grid gap-3">
                  {group.goals.map((option) => (
                    <ChoiceCard
                      key={option.id}
                      selected={goal === option.id}
                      onClick={() => setGoal(option.id)}
                      title={option.label}
                      description={option.description}
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Which language do you interpret into and out of English?
            </h1>
            <p className="mt-2 text-gray-500">
              The professional always speaks English. The client speaks your language.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {practiceLanguages.map((option) => (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => setLanguage(option.name)}
                  aria-pressed={language === option.name}
                  className={cn(
                    "flex min-h-14 items-center gap-2 rounded-xl border-2 px-4 py-3 text-left text-base font-semibold transition-colors",
                    language === option.name ? "border-ink bg-paper" : "border-transparent bg-gray-50 hover:bg-gray-100",
                  )}
                >
                  <span aria-hidden>{flagEmoji(option.name)}</span>
                  {option.name}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Here&apos;s how a session works.</h1>
            <div className="mt-8 grid gap-3">
              {speakingOnly ? (
                <HowItWorksRow
                  icon={<Users className="h-5 w-5" />}
                  title="A realistic role-play partner"
                  body="The AI plays the patient, relative, colleague or examiner from the exam. You play yourself, with your task card on screen."
                />
              ) : (
                <HowItWorksRow
                  icon={<Users className="h-5 w-5" />}
                  title="Two AI people, one interpreter: you"
                  body={`An English-speaking professional and a ${chosenLanguage}-speaking client. They can't understand each other — only you can.`}
                />
              )}
              <HowItWorksRow
                icon={<Mic className="h-5 w-5" />}
                title="Hold to talk, tap to switch"
                body={
                  <>
                    Hold <Kbd>Space</Kbd> (or the mic button) while you speak, then release.{" "}
                    {speakingOnly
                      ? "Sessions are timed like the real exam."
                      : "Tap Space to switch who you're talking to. Start by introducing yourself to the client."}
                  </>
                }
              />
              <HowItWorksRow
                icon={<Trophy className="h-5 w-5" />}
                title="Finish and get scored"
                body={
                  speakingOnly
                    ? "You'll get an estimated score against the exam's criteria and specific feedback on what to improve."
                    : "You'll get a score, feedback on accuracy and terminology, and one thing to work on next."
                }
              />
              <HowItWorksRow
                icon={<Repeat className="h-5 w-5" />}
                title={`${plans.free.monthlyMinutes} free minutes to start`}
                body="Minutes count only while a session is live. Free dialogues are marked in the library."
              />
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Last thing: your setup.</h1>
            <p className="mt-2 text-gray-500">Two quick checks so the AI can hear you clearly.</p>
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl bg-gray-50 p-4">
                <HeadphonesTip />
              </div>
              <MicCheck prominent />
            </div>
          </>
        ) : null}

        {error ? <p className="mt-6 text-sm text-record">{error}</p> : null}
      </main>

      <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto w-full max-w-2xl">{footer}</div>
      </div>
    </div>
  );
}

/**
 * Shown after "Start my first dialogue" while the setup is saved and the first dialogue
 * is found. Uses the wait to ask how they heard about XINGO (D-055): an answer goes
 * straight on, otherwise it moves on by itself (no visible countdown). Where they came
 * from (campaign tags, referrer) pre-selects a likely answer.
 */
function SettingUp({
  goal,
  prepare,
  onDone,
  onFailed,
  saveHeardAbout,
  prefetch,
}: {
  goal: PracticeGoalId;
  prepare: () => Promise<string>;
  onDone: (href: string) => void;
  onFailed: () => void;
  saveHeardAbout: (heardAbout: HeardAboutId) => Promise<unknown>;
  prefetch: (href: string) => void;
}) {
  const [suggested] = useState<HeardAboutId | null>(() => guessHeardAbout(readFirstTouch()));
  const [picked, setPicked] = useState<HeardAboutId | null>(null);
  const hrefRef = useRef<Promise<string> | null>(null);
  const finishedRef = useRef(false);
  // Latest callbacks, so the parent re-rendering (live queries) doesn't restart the wait.
  const propsRef = useRef({ prepare, onDone, onFailed, saveHeardAbout, prefetch });
  useEffect(() => {
    propsRef.current = { prepare, onDone, onFailed, saveHeardAbout, prefetch };
  });

  const finish = useCallback(
    async (how: "picked" | "timeout" | "skipped", answer: HeardAboutId | null) => {
      if (finishedRef.current || !hrefRef.current) return;
      finishedRef.current = true;
      track("onboarding_heard_about", { heard_about: answer ?? undefined, suggested: suggested ?? undefined, how });
      try {
        const href = await hrefRef.current;
        // The answer is nice to have: never hold the learner up if it fails.
        if (answer) await propsRef.current.saveHeardAbout(answer).catch(() => undefined);
        propsRef.current.onDone(href);
      } catch {
        propsRef.current.onFailed();
      }
    },
    [suggested],
  );

  // Save the setup straight away; it runs while they answer.
  useEffect(() => {
    if (hrefRef.current) return;
    hrefRef.current = propsRef.current.prepare();
    hrefRef.current
      .then((href) => propsRef.current.prefetch(href))
      .catch(() => {
        if (!finishedRef.current) {
          finishedRef.current = true;
          propsRef.current.onFailed();
        }
      });
  }, []);

  // Moves on by itself if they don't answer, keeping the suggestion if there was one.
  useEffect(() => {
    const timer = window.setTimeout(() => void finish("timeout", suggested), HEARD_ABOUT_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [finish, suggested]);

  const what = goal === "ielts" ? "first mock test" : "first dialogue";

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="flex items-center gap-2 px-4 py-4 sm:px-8">
        <XingoMark className="h-7 w-auto" />
        <span className="text-lg font-bold tracking-[-0.03em]">XINGO</span>
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-10 pt-6 sm:pt-12">
        <p className="flex items-center gap-2 text-sm font-semibold text-gray-500" role="status">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Setting up your {what}…
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">While you wait: how did you hear about XINGO?</h1>
        <p className="mt-2 text-gray-500">Tap one and we&apos;ll take you straight in.</p>
        <div className="mt-8 grid gap-2 sm:grid-cols-2">
          {heardAboutOptions.map((option) => {
            const selected = (picked ?? suggested) === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                disabled={picked !== null}
                onClick={() => {
                  setPicked(option.id);
                  void finish("picked", option.id);
                }}
                className={cn(
                  "flex min-h-14 items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left text-base font-semibold transition-colors",
                  selected ? "border-ink bg-paper" : "border-transparent bg-gray-50 hover:bg-gray-100",
                )}
              >
                {option.label}
                {picked === option.id ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                ) : selected ? (
                  <Check className="h-4 w-4 shrink-0" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => void finish("skipped", null)}
          disabled={picked !== null}
          className="mx-auto mt-6 min-h-11 px-4 text-sm font-semibold text-gray-500 hover:text-ink"
        >
          Skip
        </button>
      </main>
    </div>
  );
}

function ChoiceCard({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex min-h-[72px] items-center justify-between gap-4 rounded-xl border-2 px-5 py-4 text-left transition-colors",
        selected ? "border-ink" : "border-transparent bg-gray-50 hover:bg-gray-100",
      )}
    >
      <div>
        <p className="text-base font-bold">{title}</p>
        <p className="mt-0.5 text-sm text-gray-500">{description}</p>
      </div>
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          selected ? "bg-ink text-paper" : "border-2 border-gray-300",
        )}
      >
        {selected ? <Check className="h-4 w-4" /> : null}
      </span>
    </button>
  );
}

function HowItWorksRow({ icon, title, body }: { icon: React.ReactNode; title: string; body: React.ReactNode }) {
  return (
    <div className="flex gap-4 rounded-xl bg-gray-50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-paper">{icon}</div>
      <div>
        <p className="font-bold">{title}</p>
        <p className="mt-0.5 text-sm leading-6 text-gray-500">{body}</p>
      </div>
    </div>
  );
}
