"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ArrowRight, BarChart3, Plus, Search, Sparkles, Wallet } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { friendlyError } from "@/lib/errors";
import { formatAud } from "@/lib/marketplace";
import { cn } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/marketplace/course-card";

type Tab = "discover" | "added" | "yours";
type KindFilter = "all" | "roleplay" | "interpreting";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "discover", label: "Discover" },
  { id: "added", label: "Added by you" },
  { id: "yours", label: "Created by you" },
];

/** The one invitation to create, shown above the community courses. */
function CreatorBanner() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-ink p-5 text-paper sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-ink">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="font-bold">Share your expertise. Earn when people practise it.</p>
          <p className="mt-0.5 text-sm text-paper/70">
            Turn the conversations you know best into practice courses for learners, your team or your students.
          </p>
        </div>
      </div>
      <Button asChild variant="inverse" className="shrink-0">
        <Link href="/marketplace/create">
          Learn more <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}

function Discover({ signedIn }: { signedIn: boolean }) {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const courses = useQuery(api.marketplace.browse, { search: search.trim() || undefined, kind: kind === "all" ? undefined : kind });
  const add = useMutation(api.marketplace.addToLibrary);
  const router = useRouter();
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addCourse = async (moduleId: string, slug: string) => {
    if (!signedIn) {
      router.push(`/sign-up?redirect_url=${encodeURIComponent(`/marketplace/${slug}`)}`);
      return;
    }
    setAdding(moduleId);
    setError(null);
    try {
      await add({ moduleId });
    } catch (addError) {
      setError(friendlyError(addError));
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="space-y-6">
      <CreatorBanner />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search the marketplace</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search courses, skills or certifications"
            className="h-11 w-full rounded-lg bg-gray-100 pl-9 pr-3 text-[15px] outline-none focus:ring-2 focus:ring-live"
          />
        </label>
        <div className="flex gap-1" role="group" aria-label="Type of practice">
          {(
            [
              ["all", "All"],
              ["roleplay", "Role-plays"],
              ["interpreting", "Interpreting"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={kind === value}
              onClick={() => setKind(value)}
              className={cn(
                "h-11 rounded-lg px-3 text-sm font-semibold",
                kind === value ? "bg-ink text-paper" : "bg-gray-100 hover:bg-gray-200",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {error ? <p className="text-sm text-record">{error}</p> : null}
      {courses === undefined ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-72" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          title={search || kind !== "all" ? "No courses match" : "The marketplace is just opening"}
          description={
            search || kind !== "all"
              ? "Try a different word, or clear the filter."
              : "Be one of the first to publish a course. It takes about ten minutes."
          }
          action={
            <Button asChild>
              <Link href="/marketplace/create">Create a course</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.moduleId}
              course={course}
              adding={adding === course.moduleId}
              onAdd={() => void addCourse(course.moduleId, course.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Added() {
  const courses = useQuery(api.marketplace.myAdded, {});

  if (courses === undefined) return <Skeleton className="h-64" />;
  if (courses.length === 0) {
    return (
      <EmptyState
        title="Nothing added yet"
        description="Courses you add from Discover appear here and in your practice library."
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        These are in your <Link href="/courses" className="font-semibold text-ink underline">practice library</Link>, ready when you are.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.moduleId} course={course} />
        ))}
      </div>
    </div>
  );
}

function Yours() {
  const courses = useQuery(api.marketplace.myCourses, {});
  const summary = useQuery(api.marketplace.creatorSummary, {});

  if (courses === undefined) return <Skeleton className="h-64" />;
  if (courses.length === 0) {
    return (
      <EmptyState
        title="You haven't created a course yet"
        description="Describe a conversation, publish it, and earn when people practise it."
        action={
          <Button asChild>
            <Link href="/marketplace/new">
              <Plus className="h-4 w-4" aria-hidden /> Create a course
            </Link>
          </Button>
        }
      />
    );
  }

  const totals = courses.reduce(
    (sum, course) => ({
      views: sum.views + course.stats.views,
      learners: sum.learners + course.stats.learners,
      sessions: sum.sessions + course.stats.sessions,
    }),
    { views: 0, learners: 0, sessions: 0 },
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Page views", value: totals.views.toLocaleString("en-AU") },
          { label: "Learners", value: totals.learners.toLocaleString("en-AU") },
          { label: "Sessions", value: totals.sessions.toLocaleString("en-AU") },
          { label: "Earned", value: formatAud(summary?.totalCents ?? 0) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/marketplace/earnings">
            <Wallet className="h-4 w-4" aria-hidden /> Earnings & payouts
          </Link>
        </Button>
      </div>
      <div className="divide-y divide-gray-200 rounded-xl border border-gray-200">
        {courses.map((course) => (
          <Link
            key={course.moduleId}
            href={`/marketplace/manage/${course.moduleId}`}
            className="flex flex-col gap-2 px-5 py-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold">{course.title}</span>
                <Badge tone={course.status === "published" ? "success" : course.status === "removed" ? "warning" : "neutral"} className="capitalize">
                  {course.status === "removed" ? "Removed" : course.status}
                </Badge>
              </div>
              <p className="truncate text-sm text-gray-500">{course.tagline || "No summary yet"}</p>
            </div>
            <div className="flex shrink-0 items-center gap-4 text-sm tabular-nums text-gray-500">
              <span>{course.stats.views} views</span>
              <span>{course.stats.learners} learners</span>
              <span className="font-semibold text-ink">{formatAud(course.stats.earnedCents)}</span>
              <BarChart3 className="h-4 w-4" aria-hidden />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function MarketplaceHome() {
  const { isAuthenticated } = useConvexAuth();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const requested = searchParams.get("tab") as Tab | null;
  const tab: Tab = isAuthenticated && requested && tabs.some((t) => t.id === requested) ? requested : "discover";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Marketplace"
        description="Practice courses from trainers, teachers and organisations. Add one to your library and practise it like any other course."
        actions={
          <Button asChild>
            <Link href={isAuthenticated ? "/marketplace/new" : "/marketplace/create"}>
              <Plus className="h-4 w-4" aria-hidden /> Create a course
            </Link>
          </Button>
        }
      />
      {isAuthenticated ? (
        <div className="flex gap-1 border-b border-gray-200" role="tablist" aria-label="Marketplace">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => router.replace(item.id === "discover" ? pathname : `${pathname}?tab=${item.id}`, { scroll: false })}
              className={cn(
                "-mb-px border-b-2 px-3 py-2.5 text-sm font-semibold",
                tab === item.id ? "border-ink text-ink" : "border-transparent text-gray-500 hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
      {tab === "discover" ? <Discover signedIn={isAuthenticated} /> : tab === "added" ? <Added /> : <Yours />}
    </div>
  );
}
