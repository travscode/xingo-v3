"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useConvex, useMutation, useQuery } from "convex/react";
import { ArrowLeft, Check, Mic, Repeat, Trophy, Users } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { track } from "@/lib/analytics";
import { practiceGoals, type PracticeGoalId } from "@/lib/goals";
import { createLanguagePair, flagEmoji, practiceLanguages } from "@/lib/languages";
import { plans } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { useActiveLanguagePair } from "@/components/providers/language-pair-context";
import { HeadphonesTip, Kbd, MicCheck } from "@/components/practice/room-parts";
import { Button } from "@/components/ui/button";
import { XingoMark } from "@/components/ui/logo";

const TOTAL_STEPS = 3;

/**
 * First-run flow: goal -> language -> how it works -> first dialogue.
 * Ends inside a practice room so a new learner is speaking within a minute.
 */
export function WelcomeFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const convex = useConvex();
  const me = useQuery(api.users.me, {});
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const { setActivePair } = useActiveLanguagePair();

  // Landing pages can preselect a goal and language (lib/seo-pages.ts → signUpHref).
  const presetGoal = practiceGoals.find((option) => option.id === searchParams.get("goal"))?.id ?? null;
  const presetLanguage = practiceLanguages.find(
    (option) => option.name.toLowerCase() === (searchParams.get("language") ?? "").toLowerCase(),
  )?.name ?? null;
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<PracticeGoalId | null>(presetGoal);
  const [language, setLanguage] = useState<string | null>(presetLanguage);
  const [customLanguage, setCustomLanguage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = me?.user.name.split(" ")[0];
  const chosenLanguage = language === "__custom" ? customLanguage.trim() : language;

  const finish = async () => {
    if (!goal || !chosenLanguage) return;

    setSaving(true);
    setError(null);

    try {
      const pair = createLanguagePair("English", chosenLanguage);
      await completeOnboarding({
        practiceGoal: goal,
        languagePair: { sourceLanguage: pair.sourceLanguage, targetLanguage: pair.targetLanguage },
      });
      setActivePair(pair);
      track("onboarding_complete", { goal, language: chosenLanguage });

      const next = searchParams.get("next");
      if (next && next.startsWith("/") && !next.startsWith("//") && next !== "/dashboard" && next !== "/welcome") {
        router.replace(next);
        return;
      }

      const catalog = await convex.query(api.catalog.forCurrentUser, {});
      router.replace(catalog.nextUp ? `/practice/${catalog.nextUp.scenarioId}` : "/dashboard");
    } catch {
      setError("We couldn't save that. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="flex items-center justify-between px-4 py-4 sm:px-8">
        <div className="flex items-center gap-2">
          <XingoMark className="h-7 w-auto" />
          <span className="text-lg font-bold tracking-[-0.03em]">XINGO</span>
        </div>
        <div className="flex items-center gap-1.5" aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
          {Array.from({ length: TOTAL_STEPS }, (_, index) => (
            <span
              key={index}
              className={cn("h-1.5 w-8 rounded-full", index < step ? "bg-ink" : "bg-gray-200")}
            />
          ))}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-10 pt-6 sm:pt-12">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="mb-6 inline-flex w-fit items-center gap-1 text-sm font-semibold text-gray-500 hover:text-ink"
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
            <div className="mt-8 grid gap-3">
              {practiceGoals.map((option) => (
                <ChoiceCard
                  key={option.id}
                  selected={goal === option.id}
                  onClick={() => setGoal(option.id)}
                  title={option.label}
                  description={option.description}
                />
              ))}
            </div>
            <Button size="lg" className="mt-8" disabled={!goal} onClick={() => setStep(2)}>
              Continue
            </Button>
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
                  className={cn(
                    "flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-left text-sm font-semibold transition-colors",
                    language === option.name ? "border-ink bg-paper" : "border-transparent bg-gray-50 hover:bg-gray-100",
                  )}
                >
                  <span aria-hidden>{flagEmoji(option.name)}</span>
                  {option.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setLanguage("__custom")}
                className={cn(
                  "rounded-xl border-2 px-3 py-3 text-left text-sm font-semibold transition-colors",
                  language === "__custom" ? "border-ink" : "border-transparent bg-gray-50 hover:bg-gray-100",
                )}
              >
                Something else
              </button>
            </div>
            {language === "__custom" ? (
              <input
                autoFocus
                value={customLanguage}
                onChange={(event) => setCustomLanguage(event.target.value)}
                placeholder="e.g. Amharic"
                className="mt-3 h-12 rounded-xl bg-gray-100 px-4 text-base outline-none focus:ring-2 focus:ring-live"
              />
            ) : null}
            <Button size="lg" className="mt-8" disabled={!chosenLanguage} onClick={() => setStep(3)}>
              Continue
            </Button>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Here&apos;s how a session works.</h1>
            <div className="mt-8 grid gap-3">
              <HowItWorksRow
                icon={<Users className="h-5 w-5" />}
                title="Two AI people, one interpreter: you"
                body={`An English-speaking professional and a ${chosenLanguage}-speaking client. They can't understand each other — only you can.`}
              />
              <HowItWorksRow
                icon={<Mic className="h-5 w-5" />}
                title="Hold to talk, tap to switch"
                body={
                  <>
                    Hold <Kbd>Space</Kbd> (or the mic button) while you speak. Tap <Kbd>Space</Kbd> to switch who
                    you&apos;re talking to. Start by introducing yourself to the client.
                  </>
                }
              />
              <HowItWorksRow
                icon={<Trophy className="h-5 w-5" />}
                title="Finish and get scored"
                body="You'll get a score, feedback on accuracy and terminology, and one thing to work on next."
              />
              <HowItWorksRow
                icon={<Repeat className="h-5 w-5" />}
                title={`${plans.free.monthlyMinutes} free minutes every month`}
                body="Minutes count only while a session is live. Free dialogues are marked in the library."
              />
            </div>

            <div className="mt-8 space-y-5 rounded-xl border border-gray-200 p-5">
              <HeadphonesTip />
              <MicCheck />
            </div>

            {error ? <p className="mt-4 text-sm text-record">{error}</p> : null}
            <Button size="lg" className="mt-8" disabled={saving} onClick={() => void finish()}>
              {saving ? "Setting up…" : "Start my first dialogue"}
            </Button>
          </>
        ) : null}
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
        "flex items-center justify-between gap-4 rounded-xl border-2 px-5 py-4 text-left transition-colors",
        selected ? "border-ink" : "border-transparent bg-gray-50 hover:bg-gray-100",
      )}
    >
      <div>
        <p className="font-bold">{title}</p>
        <p className="mt-0.5 text-sm text-gray-500">{description}</p>
      </div>
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          selected ? "bg-ink text-paper" : "border-2 border-gray-300",
        )}
      >
        {selected ? <Check className="h-3.5 w-3.5" /> : null}
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
