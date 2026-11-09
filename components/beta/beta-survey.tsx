"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Star } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { friendlyError } from "@/lib/errors";
import { SURVEY_QUESTIONS, SURVEY_TEXT_MAX_CHARS, type SurveyAnswers } from "@/lib/beta";
import { cn } from "@/lib/utils";

const RATINGS = [1, 2, 3, 4, 5];

/** Short beta survey on the results page. The server decides whether it's due (D-049). */
export function BetaSurvey({ attemptId }: { attemptId: string }) {
  const prompt = useQuery(api.beta.surveyPrompt, { attemptId });
  const submit = useMutation(api.beta.submitSurvey);
  const dismiss = useMutation(api.beta.dismissSurvey);
  const [expanded, setExpanded] = useState(false);
  const [thanked, setThanked] = useState(false);
  const [answers, setAnswers] = useState<Partial<SurveyAnswers>>({});
  const [suggestions, setSuggestions] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (thanked) {
    return (
      <Card tone="muted" className="flex items-center gap-2 p-5 text-sm font-semibold">
        <Check className="h-4 w-4 text-success" aria-hidden /> Thanks for telling us how that went.
      </Card>
    );
  }

  if (!prompt) return null;

  const complete = SURVEY_QUESTIONS.every((question) => answers[question.key]);
  const title = prompt.trigger === "course_finished" ? "You finished the course. How was it?" : "How did that go?";

  if (!expanded) {
    return (
      <Card tone="muted" className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="font-bold">{title}</p>
          <p className="mt-0.5 text-sm text-gray-500">Five quick questions. It takes about a minute.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => void dismiss({ attemptId })}>
            Not now
          </Button>
          <Button variant="secondary" onClick={() => setExpanded(true)}>
            Take the survey
          </Button>
        </div>
      </Card>
    );
  }

  const send = async () => {
    if (!complete) return;
    setSending(true);
    setError(null);
    try {
      await submit({ attemptId, ...(answers as SurveyAnswers), suggestions });
      setThanked(true);
    } catch (sendError) {
      setError(friendlyError(sendError));
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="p-6">
      <p className="text-lg font-bold">{title}</p>
      <div className="mt-5 space-y-6">
        {SURVEY_QUESTIONS.map((question) => {
          const selected = answers[question.key] ?? 0;
          const choose = (value: number) => setAnswers((current) => ({ ...current, [question.key]: value }));

          return (
            <div key={question.key}>
              <p id={`survey-${question.key}`} className="text-sm font-semibold">
                {question.label}
              </p>
              <div role="radiogroup" aria-labelledby={`survey-${question.key}`} className="mt-2 flex items-center gap-1">
                {RATINGS.map((value) =>
                  question.kind === "stars" ? (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selected === value}
                      aria-label={`${value} out of 5`}
                      onClick={() => choose(value)}
                      className="rounded-lg p-1 hover:bg-gray-100"
                    >
                      <Star className={cn("h-7 w-7", value <= selected ? "fill-ink text-ink" : "text-gray-200")} aria-hidden />
                    </button>
                  ) : (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selected === value}
                      aria-label={`${value} out of 5`}
                      onClick={() => choose(value)}
                      className={cn(
                        "h-10 w-10 rounded-lg text-sm font-semibold transition-colors",
                        selected === value ? "bg-ink text-paper" : "bg-gray-100 hover:bg-gray-200",
                      )}
                    >
                      {value}
                    </button>
                  ),
                )}
              </div>
              {question.kind === "scale" ? (
                <p className="mt-1 flex w-[13.5rem] justify-between text-xs text-gray-500">
                  <span>{question.low}</span>
                  <span>{question.high}</span>
                </p>
              ) : null}
            </div>
          );
        })}
        <label className="block">
          <span className="text-sm font-semibold">Anything you&apos;d change? (optional)</span>
          <textarea
            rows={3}
            maxLength={SURVEY_TEXT_MAX_CHARS}
            value={suggestions}
            onChange={(event) => setSuggestions(event.target.value)}
            className="mt-2 w-full resize-none rounded-lg bg-gray-100 p-3 text-sm outline-none focus:ring-2 focus:ring-live"
          />
        </label>
      </div>
      {error ? <p className="mt-3 text-sm text-record">{error}</p> : null}
      <Button variant="secondary" className="mt-5" disabled={!complete || sending} onClick={() => void send()}>
        {sending ? "Sending…" : "Send"}
      </Button>
    </Card>
  );
}
