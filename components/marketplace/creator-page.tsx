"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { friendlyError } from "@/lib/errors";
import { Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/marketplace/course-card";

/** A creator's public page: branded header, bio, real totals and their courses. */
export function CreatorPage({ handle }: { handle: string }) {
  const creator = useQuery(api.creators.profile, { handle });
  const add = useMutation(api.marketplace.addToLibrary);
  const router = useRouter();
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (creator === undefined) return <Skeleton className="h-96" />;
  if (creator === null) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">Creator not found</h1>
        <Button asChild className="mt-6">
          <Link href="/marketplace">Browse the marketplace</Link>
        </Button>
      </div>
    );
  }

  const stats = [
    { label: creator.totals.courses === 1 ? "course" : "courses", value: creator.totals.courses },
    ...(creator.totals.learners > 0 ? [{ label: "added to libraries", value: creator.totals.learners }] : []),
    ...(creator.totals.sessions > 0 ? [{ label: "practice sessions", value: creator.totals.sessions }] : []),
  ];

  return (
    <div className="space-y-10">
      <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Marketplace
      </Link>

      <section className="overflow-hidden rounded-2xl border border-gray-200">
        <div className="relative aspect-[4/1] min-h-32 w-full" style={{ backgroundColor: creator.accent }}>
          {creator.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={creator.bannerUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="relative px-6 pb-6 sm:px-8">
          <div
            className="-mt-12 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-paper"
            style={{ backgroundColor: creator.accent }}
          >
            {creator.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={creator.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-paper">{creator.displayName.slice(0, 1)}</span>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-[-0.035em]">{creator.displayName}</h1>
            <span className="text-sm text-gray-500">@{creator.handle}</span>

          </div>
          {creator.tagline ? <p className="mt-1 text-lg text-gray-500">{creator.tagline}</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-500">
            {creator.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" aria-hidden /> {creator.location}
              </span>
            ) : null}
            {stats.map((stat) => (
              <span key={stat.label}>
                <span className="font-semibold tabular-nums text-ink">{stat.value.toLocaleString("en-AU")}</span> {stat.label}
              </span>
            ))}
            {creator.totals.rating !== null ? (
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" aria-hidden />
                <span className="font-semibold text-ink">{creator.totals.rating.toFixed(1)}</span> ({creator.totals.ratingCount})
              </span>
            ) : null}
          </div>
          {creator.bio ? <p className="mt-5 max-w-3xl whitespace-pre-line leading-7 text-gray-700">{creator.bio}</p> : null}
          {creator.isOriginal ? (
            <p className="mt-4 text-xs text-gray-500">Made by the XINGO team. Free to add; practice uses your normal minutes.</p>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold tracking-[-0.02em]">Courses by {creator.displayName}</h2>
        {error ? <p className="mt-2 text-sm text-record">{error}</p> : null}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creator.courses.map((course) => (
            <CourseCard
              key={course.moduleId}
              course={course}
              adding={adding === course.moduleId}
              onAdd={() => {
                setAdding(course.moduleId);
                setError(null);
                add({ moduleId: course.moduleId })
                  .catch((addError) => {
                    if (/Not authenticated|not found/i.test(String(addError))) router.push(`/sign-up?redirect_url=${encodeURIComponent(`/marketplace/creators/${handle}`)}`);
                    else setError(friendlyError(addError));
                  })
                  .finally(() => setAdding(null));
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
