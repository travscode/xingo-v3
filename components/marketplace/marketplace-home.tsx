"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ArrowRight, ArrowUpRight, BarChart3, Building2, ChevronRight, Plus, Search, Sparkles, Wallet } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { friendlyError } from "@/lib/errors";
import { formatAud } from "@/lib/marketplace";
import { ORG_ROLE_LABELS } from "@/lib/orgs";
import { cn } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/marketplace/course-card";
import { CreatorProfileEditor } from "@/components/marketplace/creator-profile-editor";
import { creatorHref, VerifiedBadge } from "@/components/marketplace/verified-badge";

type Tab = "discover" | "added" | "yours" | "orgs";
type KindFilter = "all" | "roleplay" | "interpreting";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "discover", label: "Discover" },
  { id: "added", label: "Added by you" },
  { id: "yours", label: "Created by you" },
  { id: "orgs", label: "Organisations" },
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

type FeaturedSlot = NonNullable<ReturnType<typeof useQuery<typeof api.featured.list>>>[number];

/** One admin-picked banner: the whole card is the link. Site paths stay in the tab; https opens a new one. */
function FeaturedBanner({ slot, size = "small" }: { slot: FeaturedSlot; size?: "wide" | "large" | "small" }) {
  const large = size !== "small";
  const external = !slot.linkUrl.startsWith("/");
  const body = (
    <>
      {slot.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slot.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
        />
      ) : null}
      {/* Legibility scrim so the title reads on any photo. */}
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent" />
      <span className="relative flex w-full items-end justify-between gap-3 p-4 sm:p-5">
        <span className="min-w-0">
          <span className={cn("line-clamp-2 block font-bold leading-tight tracking-[-0.02em] text-paper", large ? "text-xl sm:text-3xl" : "text-lg")}>
            {slot.title}
          </span>
          {slot.subtitle ? (
            <span className={cn("mt-1 line-clamp-2 block text-paper/80", large ? "text-sm sm:text-[15px] sm:leading-6" : "text-sm")}>{slot.subtitle}</span>
          ) : null}
        </span>
        {external ? (
          <>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-paper" aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </>
        ) : (
          <ArrowRight className="h-5 w-5 shrink-0 text-paper" aria-hidden />
        )}
      </span>
    </>
  );
  const className = cn(
    "group relative flex overflow-hidden rounded-2xl bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live focus-visible:ring-offset-2",
    size === "wide" && "aspect-[16/9] sm:aspect-[3/1]",
    size === "large" && "aspect-[16/9] md:aspect-auto md:h-full md:min-h-80",
    size === "small" && "aspect-[16/9]",
  );

  return external ? (
    <a href={slot.linkUrl} target="_blank" rel="noopener noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <Link href={slot.linkUrl} className={className}>
      {body}
    </Link>
  );
}

/** Up to three featured banners picked in Admin → Marketplace. Hidden when none are active. */
function FeaturedBanners() {
  const slots = useQuery(api.featured.list, {});
  if (!slots || slots.length === 0) return null;
  const shown = slots.slice(0, 3);

  return (
    <section aria-label="Featured">
      {shown.length === 1 ? (
        <FeaturedBanner slot={shown[0]} size="wide" />
      ) : shown.length === 2 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {shown.map((slot) => (
            <FeaturedBanner key={slot.position} slot={slot} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
          <div className="md:col-span-2 md:row-span-2">
            <FeaturedBanner slot={shown[0]} size="large" />
          </div>
          {shown.slice(1).map((slot) => (
            <FeaturedBanner key={slot.position} slot={slot} />
          ))}
        </div>
      )}
    </section>
  );
}

/** Row of creator studios (avatars), linking to their pages. */
function FeaturedCreators() {
  const creators = useQuery(api.creators.featured, {});
  if (!creators || creators.length === 0) return null;

  return (
    <section aria-labelledby="creators-heading">
      <h2 id="creators-heading" className="text-sm font-semibold text-gray-500">
        Creators
      </h2>
      <ul className="-mx-1 mt-3 flex gap-3 overflow-x-auto px-1 pb-2">
        {creators.map((creator) => (
          <li key={creator.handle} className="shrink-0">
            <Link
              href={creatorHref(creator.handle, creator.isOrganization)}
              className="group flex w-28 flex-col items-center gap-2 rounded-2xl p-2 text-center hover:bg-gray-50"
            >
              <span
                className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full ring-2 ring-offset-2 transition-transform group-hover:scale-105"
                style={{ backgroundColor: creator.accent, ["--tw-ring-color" as string]: creator.accent }}
              >
                {creator.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={creator.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-paper">{creator.displayName.slice(0, 1)}</span>
                )}
              </span>
              <span className="line-clamp-2 text-xs font-semibold leading-tight">
                {creator.displayName}
                {creator.verified ? <VerifiedBadge className="ml-0.5 align-[-2px]" /> : null}
              </span>
              <span className="text-[11px] text-gray-500">
                {creator.courses} {creator.courses === 1 ? "course" : "courses"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Discover({ signedIn }: { signedIn: boolean }) {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [sort, setSort] = useState<"popular" | "top" | "new">("popular");
  const [visible, setVisible] = useState(12);
  const courses = useQuery(api.marketplace.browse, { search: search.trim() || undefined, kind: kind === "all" ? undefined : kind, sort });
  const add = useMutation(api.marketplace.addToLibrary);
  const router = useRouter();
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addCourse = async (moduleId: string, slug: string) => {
    if (!signedIn) {
      router.push(`/sign-up?redirect=${encodeURIComponent(`/marketplace/${slug}`)}`);
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
      <FeaturedBanners />
      <CreatorBanner />
      <FeaturedCreators />
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
              ["roleplay", "One-on-one"],
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
      <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Sort courses">
        <span className="mr-1 text-sm text-gray-500">Sort:</span>
        {(
          [
            ["popular", "Popular"],
            ["top", "Top rated"],
            ["new", "New"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={sort === value}
            onClick={() => {
              setSort(value);
              setVisible(12);
            }}
            className={cn("rounded-full px-3 py-1 text-sm font-semibold", sort === value ? "bg-ink text-paper" : "text-gray-500 hover:bg-gray-100 hover:text-ink")}
          >
            {label}
          </button>
        ))}
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
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, visible).map((course) => (
              <CourseCard
                key={course.moduleId}
                course={course}
                adding={adding === course.moduleId}
                onAdd={() => void addCourse(course.moduleId, course.slug)}
              />
            ))}
          </div>
          {courses.length > visible ? (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={() => setVisible((value) => value + 12)}>
                Show more ({courses.length - visible} more)
              </Button>
            </div>
          ) : null}
        </>
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

/** Organisations you're on the team of, plus the way to start one (the "Organisations" tab). */
function YourOrganisations() {
  const orgs = useQuery(api.orgs.mine, {});
  if (orgs === undefined) return <Skeleton className="h-24" />;

  return (
    <section aria-labelledby="your-orgs-heading" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="your-orgs-heading" className="text-lg font-bold tracking-[-0.02em]">
          Your organisations
        </h2>
        <Button asChild variant="outline" size="sm">
          <Link href="/marketplace/org/new">
            <Plus className="h-4 w-4" aria-hidden /> Create an organisation
          </Link>
        </Button>
      </div>
      {orgs.length === 0 ? (
        <p className="text-sm text-gray-500">
          Publish courses as a team, with your own page and invite-only collections for your learners.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
          {orgs.map((org) => (
            <li key={org.handle}>
              <Link href={`/marketplace/org/${org.handle}`} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                  {org.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={org.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-4 w-4 text-gray-500" aria-hidden />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1">
                    <span className="truncate font-semibold">{org.displayName}</span>
                    {org.verified ? <VerifiedBadge size="md" /> : null}
                  </span>
                  <span className="block truncate text-sm text-gray-500">
                    @{org.handle} · {ORG_ROLE_LABELS[org.role]}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Yours() {
  const courses = useQuery(api.marketplace.myCourses, {});
  const summary = useQuery(api.marketplace.creatorSummary, {});

  if (courses === undefined) return <Skeleton className="h-64" />;
  if (courses.length === 0) {
    return (
      <div className="space-y-10">
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
      </div>
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
      <CreatorProfileEditor />
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
        <div className="flex gap-1 overflow-x-auto border-b border-gray-200" role="tablist" aria-label="Marketplace">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => router.replace(item.id === "discover" ? pathname : `${pathname}?tab=${item.id}`, { scroll: false })}
              className={cn(
                "-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold",
                item.id === "orgs" && "ml-auto",
                tab === item.id ? "border-ink text-ink" : "border-transparent text-gray-500 hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
      {tab === "discover" ? (
        <Discover signedIn={isAuthenticated} />
      ) : tab === "added" ? (
        <Added />
      ) : tab === "orgs" ? (
        <YourOrganisations />
      ) : (
        <Yours />
      )}
    </div>
  );
}
