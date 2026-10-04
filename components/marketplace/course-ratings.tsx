"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { Star, Trophy } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { track } from "@/lib/analytics";
import { friendlyError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/primitives";

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn(size, n <= Math.round(value) ? "fill-amber-500 text-amber-500" : "text-gray-300")} />
      ))}
    </span>
  );
}

function RateForm({ moduleId, initial }: { moduleId: string; initial: { stars: number; comment: string } | null }) {
  const rate = useMutation(api.ratings.rateCourse);
  const [stars, setStars] = useState(initial?.stars ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3 rounded-xl border border-gray-200 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!stars) return;
        setState("saving");
        setError(null);
        rate({ moduleId, stars, comment: comment || undefined })
          .then(() => {
            track("course_rate", { module_id: moduleId, stars, with_comment: Boolean(comment.trim()), updated: Boolean(initial) });
            setState("saved");
          })
          .catch((rateError) => {
            setError(friendlyError(rateError));
            setState("idle");
          });
      }}
    >
      <p className="font-semibold">{initial ? "Update your rating" : "Rate this course"}</p>
      <div className="flex gap-1" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={stars === n}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => {
              setStars(n);
              setState("idle");
            }}
          >
            <Star className={cn("h-7 w-7 transition-colors", n <= (hover || stars) ? "fill-amber-500 text-amber-500" : "text-gray-300")} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(event) => {
          setComment(event.target.value);
          setState("idle");
        }}
        rows={3}
        maxLength={600}
        placeholder="What did you like, or what could be better? (optional)"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-ink"
      />
      {error ? <p className="text-sm text-record">{error}</p> : null}
      <Button type="submit" size="sm" disabled={!stars || state === "saving"}>
        {state === "saving" ? "Saving…" : state === "saved" ? "Thanks for rating" : "Submit rating"}
      </Button>
    </form>
  );
}

/** Ratings, reviews and the viewer's own progress for a marketplace course. */
export function CourseRatings({ moduleId }: { moduleId: string }) {
  const data = useQuery(api.ratings.forCourse, { moduleId });
  const removeRating = useMutation(api.marketplaceAdmin.deleteRating);
  if (!data) return null;

  const { progress } = data;
  const finished = progress && progress.total > 0 && progress.passed === progress.total;

  return (
    <section className="space-y-6" aria-labelledby="ratings-heading">
      {progress && progress.total > 0 ? (
        <div className={cn("rounded-2xl p-5", finished ? "bg-accent/40" : "bg-gray-50")}>
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-semibold">
              {finished ? <Trophy className="h-4 w-4" aria-hidden /> : null}
              {finished ? "Course passed. Nice work!" : "Your progress"}
            </p>
            <span className="text-sm tabular-nums text-gray-500">
              {progress.passed} of {progress.total} scenarios passed
            </span>
          </div>
          <ProgressBar className="mt-3" value={progress.passed / progress.total} tone="accent" />
        </div>
      ) : null}

      <div>
        <h2 id="ratings-heading" className="text-xl font-bold tracking-[-0.02em]">
          Ratings
        </h2>
        {data.count > 0 && data.average !== null ? (
          <div className="mt-4 grid gap-6 sm:grid-cols-[auto_1fr]">
            <div>
              <p className="text-5xl font-bold tabular-nums tracking-[-0.04em]">{data.average.toFixed(1)}</p>
              <Stars value={data.average} />
              <p className="mt-1 text-sm text-gray-500">
                {data.count} {data.count === 1 ? "rating" : "ratings"}
              </p>
            </div>
            <ul className="space-y-1.5">
              {data.distribution.map((row) => (
                <li key={row.stars} className="flex items-center gap-2 text-sm">
                  <span className="w-3 tabular-nums text-gray-500">{row.stars}</span>
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden />
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <span className="block h-full rounded-full bg-amber-500" style={{ width: `${(row.count / data.count) * 100}%` }} />
                  </span>
                  <span className="w-6 text-right tabular-nums text-gray-500">{row.count}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500">No ratings yet. Practise a scenario and be the first to rate it.</p>
        )}
        {data.practiceCount > 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            {data.practiceCount.toLocaleString("en-AU")} practice {data.practiceCount === 1 ? "session" : "sessions"}
            {data.passCount > 0 ? ` · ${data.passCount.toLocaleString("en-AU")} passed` : ""}
          </p>
        ) : null}
      </div>

      {data.canRate ? (
        <RateForm moduleId={moduleId} initial={data.mine} />
      ) : data.signedIn ? (
        <p className="text-sm text-gray-500">Finish a session in this course and you can rate it.</p>
      ) : (
        <p className="text-sm text-gray-500">
          <Link href="/sign-in" className="font-semibold text-ink underline">
            Log in
          </Link>{" "}
          and practise this course to rate it.
        </p>
      )}

      {data.reviews.length > 0 ? (
        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
          {data.reviews.map((review) => (
            <li key={review.id} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Stars value={review.stars} size="h-3.5 w-3.5" /> {review.author}
                </span>
                <span className="flex items-center gap-2 text-xs text-gray-500">
                  {new Date(review.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                  {data.isAdmin ? (
                    <button
                      type="button"
                      className="font-semibold text-record hover:underline"
                      onClick={() => window.confirm("Remove this review?") && void removeRating({ ratingId: review.id })}
                    >
                      Remove
                    </button>
                  ) : null}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{review.comment}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
