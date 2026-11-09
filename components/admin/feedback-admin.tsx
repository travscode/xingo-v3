"use client";

import { useQuery } from "convex/react";
import { Star } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Badge, Card, EmptyState, SectionTitle, Skeleton, Stat } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { SURVEY_QUESTIONS, toCsv } from "@/lib/beta";

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function download(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const SHORT_LABELS = { overall: "Overall", helpful: "Helpful", worked: "Worked", fair: "Fair score", difficulty: "Difficulty" } as const;

/** Everything testers have told us: button comments and survey answers (D-049). */
export function FeedbackAdmin() {
  const feedback = useQuery(api.beta.listFeedback, {});
  const surveys = useQuery(api.beta.listSurveys, {});
  const responses = surveys?.responses ?? [];

  const average = (key: (typeof SURVEY_QUESTIONS)[number]["key"]) =>
    responses.length ? (responses.reduce((sum, row) => sum + (row[key] ?? 0), 0) / responses.length).toFixed(1) : "—";

  return (
    <div className="space-y-10">
      <section>
        <SectionTitle
          action={
            feedback?.length ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  download(
                    "xingo-beta-comments.csv",
                    toCsv([
                      ["When", "Name", "Email", "Page", "How", "Comment"],
                      ...feedback.map((row) => [row.createdAt, row.name, row.email, row.page, row.source, row.comment]),
                    ]),
                  )
                }
              >
                Download CSV
              </Button>
            ) : undefined
          }
        >
          Comments
        </SectionTitle>
        {!feedback ? (
          <Skeleton className="h-32" />
        ) : feedback.length === 0 ? (
          <EmptyState title="No comments yet" />
        ) : (
          <Card className="divide-y divide-gray-200">
            {feedback.map((row) => (
              <div key={row._id} className="px-5 py-4">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                  <span className="text-sm font-semibold text-ink">{row.name}</span>
                  <span>{row.email}</span>
                  <span>{when(row.createdAt)}</span>
                  <span className="font-mono">{row.page}</span>
                  {row.source === "voice" ? <Badge>Spoken</Badge> : null}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{row.comment}</p>
              </div>
            ))}
          </Card>
        )}
      </section>

      <section>
        <SectionTitle
          action={
            responses.length ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  download(
                    "xingo-beta-surveys.csv",
                    toCsv([
                      ["When", "Name", "Email", "Moment", "Dialogue", ...SURVEY_QUESTIONS.map((question) => question.label), "Anything you'd change?"],
                      ...responses.map((row) => [
                        row.answeredAt,
                        row.name,
                        row.email,
                        row.trigger,
                        row.scenarioTitle,
                        ...SURVEY_QUESTIONS.map((question) => row[question.key]),
                        row.suggestions,
                      ]),
                    ]),
                  )
                }
              >
                Download CSV
              </Button>
            ) : undefined
          }
        >
          Surveys
        </SectionTitle>
        {!surveys ? (
          <Skeleton className="h-32" />
        ) : responses.length === 0 ? (
          <EmptyState title="No surveys answered yet" />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
              {SURVEY_QUESTIONS.map((question) => (
                <Stat key={question.key} label={SHORT_LABELS[question.key]} value={average(question.key)} hint="out of 5" />
              ))}
            </div>
            <p className="text-sm text-gray-500">
              {responses.length} answered, {surveys.dismissed} put off. For difficulty, 5 means very hard.
            </p>
            <Card className="divide-y divide-gray-200">
              {responses.map((row) => (
                <div key={row._id} className="px-5 py-4">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                    <span className="text-sm font-semibold text-ink">{row.name}</span>
                    <span>{row.email}</span>
                    {row.answeredAt ? <span>{when(row.answeredAt)}</span> : null}
                    <Badge>{row.trigger === "course_finished" ? "Finished course" : "First dialogue"}</Badge>
                  </p>
                  {row.scenarioTitle ? <p className="mt-1 text-xs text-gray-500">{row.scenarioTitle}</p> : null}
                  <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {SURVEY_QUESTIONS.map((question) => (
                      <span key={question.key} className="inline-flex items-center gap-1 tabular-nums">
                        <span className="text-gray-500">{SHORT_LABELS[question.key]}</span> {row[question.key]}
                        {question.kind === "stars" ? <Star className="h-3 w-3 fill-ink" aria-hidden /> : null}
                      </span>
                    ))}
                  </p>
                  {row.suggestions ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{row.suggestions}</p> : null}
                </div>
              ))}
            </Card>
          </div>
        )}
      </section>
    </div>
  );
}
