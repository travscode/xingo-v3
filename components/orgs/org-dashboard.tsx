"use client";

import { Component, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ArrowLeft, BadgeCheck, ExternalLink, Pencil, Plus } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { friendlyError } from "@/lib/errors";
import { canManageOrg, ORG_ROLE_LABELS } from "@/lib/orgs";
import { formatMinuteCount } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge, Card, EmptyState, PageHeader, ProgressBar, SectionTitle, Skeleton, Stat } from "@/components/ui/primitives";
import { Field, TextArea, TextInput } from "@/components/admin/content/fields";
import { ImageUpload } from "@/components/marketplace/image-upload";
import { OrgAvatar } from "@/components/orgs/join-invitation";
import { CollectionsTab, PeopleTab } from "@/components/orgs/org-collections";
import { TeamTab } from "@/components/orgs/org-team";

export type OrgDashboardData = FunctionReturnType<typeof api.orgs.dashboard>;

const allTabs = [
  { id: "overview", label: "Overview", managersOnly: false },
  { id: "courses", label: "Courses", managersOnly: false },
  { id: "collections", label: "Collections", managersOnly: false },
  { id: "people", label: "People", managersOnly: false },
  { id: "team", label: "Team", managersOnly: false },
  { id: "profile", label: "Profile", managersOnly: true },
] as const;

export type OrgTabId = (typeof allTabs)[number]["id"];

/** Turns a thrown query error (ORG_FORBIDDEN, ORG_NOT_FOUND) into a plain message instead of a crash. */
class OrgErrorBoundary extends Component<{ children: ReactNode }, { error: unknown }> {
  state = { error: null as unknown };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <EmptyState
          title="You can't open this organisation"
          description={friendlyError(this.state.error)}
          action={
            <Button asChild>
              <Link href="/marketplace">Back to the marketplace</Link>
            </Button>
          }
        />
      );
    }
    return this.props.children;
  }
}

export function OrgDashboard({ handle }: { handle: string }) {
  return (
    <OrgErrorBoundary key={handle}>
      <Dashboard handle={handle} />
    </OrgErrorBoundary>
  );
}

function Dashboard({ handle }: { handle: string }) {
  const data = useQuery(api.orgs.dashboard, { handle });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (data === undefined) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-16" />
        <Skeleton className="h-10" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const manager = canManageOrg(data.me.role);
  const tabs = allTabs.filter((item) => manager || !item.managersOnly);
  const tab = (tabs.find((item) => item.id === searchParams.get("tab"))?.id ?? "overview") as OrgTabId;
  const go = (next: OrgTabId, extra?: Record<string, string>) => {
    const params = new URLSearchParams({ tab: next, ...extra });
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Marketplace
      </Link>
      <div className="flex items-center gap-3">
        <OrgAvatar name={data.org.displayName} url={data.org.avatarUrl} />
        <div className="min-w-0 flex-1">
          <PageHeader
            title={
              <span className="flex items-center gap-2">
                <span className="truncate">{data.org.displayName}</span>
                {data.org.verified ? (
                  <>
                    <BadgeCheck className="h-6 w-6 shrink-0" aria-hidden />
                    <span className="sr-only">Verified</span>
                  </>
                ) : null}
              </span>
            }
          />
          <p className="mt-1 text-sm text-gray-500">
            @{data.org.handle} · You&apos;re {data.me.role === "admin" || data.me.role === "owner" ? "an" : "a"} {ORG_ROLE_LABELS[data.me.role].toLowerCase()}
          </p>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-gray-200" role="tablist">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => go(item.id)}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold",
              tab === item.id ? "border-ink text-ink" : "border-transparent text-gray-500 hover:text-ink",
            )}
          >
            {item.label}
            {item.id === "people" && data.requestsWaiting ? (
              <span className="ml-1.5 rounded-full bg-ink px-1.5 py-0.5 text-[11px] font-bold text-paper">{data.requestsWaiting}</span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "overview" ? <OverviewTab data={data} go={go} /> : null}
      {tab === "courses" ? <CoursesTab data={data} /> : null}
      {tab === "collections" ? <CollectionsTab data={data} go={go} /> : null}
      {tab === "people" ? (
        <PeopleTab data={data} collectionId={searchParams.get("collection")} go={go} />
      ) : null}
      {tab === "team" ? <TeamTab data={data} /> : null}
      {tab === "profile" && manager ? <ProfileTab data={data} /> : null}
    </div>
  );
}

// ---- Overview ------------------------------------------------------------------------

function OverviewTab({ data, go }: { data: OrgDashboardData; go: (tab: OrgTabId, extra?: Record<string, string>) => void }) {
  const { pool } = data;
  const learners = data.collections.reduce((sum, collection) => sum + collection.counts.active, 0);
  const firstWithRequests = data.collections.find((collection) => collection.counts.requested > 0);

  return (
    <div className="space-y-8">
      <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="font-semibold">Your public page</p>
          <p className="truncate text-sm text-gray-500">xingo.ai/{data.org.handle}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/${data.org.handle}`}>
            <ExternalLink className="h-4 w-4" aria-hidden /> View page
          </Link>
        </Button>
      </Card>

      {data.requestsWaiting > 0 ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-2 border-ink p-5">
          <p className="font-semibold">
            {data.requestsWaiting} {data.requestsWaiting === 1 ? "person is" : "people are"} waiting for access
          </p>
          <Button size="sm" onClick={() => go("people", firstWithRequests ? { collection: firstWithRequests.id } : undefined)}>
            Review requests
          </Button>
        </Card>
      ) : null}

      <section>
        <SectionTitle>Practice minutes</SectionTitle>
        <Card tone="muted" className="p-5">
          {pool.monthlyMinutes > 0 ? (
            <div className="space-y-3">
              <p className="text-[15px]">
                <span className="text-2xl font-bold tabular-nums">{formatMinuteCount(pool.usedThisMonth)}</span>
                <span className="text-gray-500"> of {formatMinuteCount(pool.monthlyMinutes)} minutes used this month</span>
              </p>
              <ProgressBar value={pool.usedThisMonth / pool.monthlyMinutes} tone={pool.remaining === 0 ? "record" : "accent"} />
              <p className="text-sm text-gray-500">
                {pool.remaining === 0
                  ? "The pool is used up for this month. Learners use their own minutes until it resets."
                  : "Your team and invited learners use these minutes when they practise your courses."}{" "}
                To change the pool, email hello@xingo.ai.
              </p>
            </div>
          ) : (
            <p className="text-[15px] text-gray-700">
              No minute pool yet: learners use their own minutes. Contact{" "}
              <a href="mailto:hello@xingo.ai" className="font-semibold underline underline-offset-2">
                hello@xingo.ai
              </a>{" "}
              to set one up.
            </p>
          )}
        </Card>
      </section>

      <section className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Stat label="Courses" value={<span className="tabular-nums">{data.courses.length}</span>} />
        <Stat label="Collections" value={<span className="tabular-nums">{data.collections.length}</span>} />
        <Stat label="Learners with access" value={<span className="tabular-nums">{learners}</span>} />
        <Stat label="Team" value={<span className="tabular-nums">{data.members.length}</span>} />
      </section>
    </div>
  );
}

// ---- Courses -------------------------------------------------------------------------

function CoursesTab({ data }: { data: OrgDashboardData }) {
  const newHref = `/marketplace/new?org=${encodeURIComponent(data.org.handle)}`;

  if (data.courses.length === 0) {
    return (
      <EmptyState
        title="No courses yet"
        description="Courses you make here belong to the organisation. They stay private to your team and invited learners until you put them in a public collection."
        action={
          <Button asChild>
            <Link href={newHref}>
              <Plus className="h-4 w-4" aria-hidden /> New course
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-xl text-sm text-gray-500">
          Courses are private to your team and invited learners until they&apos;re in a public collection.
        </p>
        <Button asChild>
          <Link href={newHref}>
            <Plus className="h-4 w-4" aria-hidden /> New course
          </Link>
        </Button>
      </div>
      <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
        {data.courses.map((course) => (
          <li key={course.moduleId} className="flex items-center gap-3 p-4">
            {course.bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={course.bannerUrl} alt="" className="hidden h-12 w-20 shrink-0 rounded-lg object-cover sm:block" />
            ) : (
              <span className="hidden h-12 w-20 shrink-0 rounded-lg bg-gray-100 sm:block" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{course.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                <Badge tone={course.status === "published" ? "success" : "neutral"}>
                  {course.status === "published" ? "Published" : course.status === "draft" ? "Draft" : "Taken down"}
                </Badge>
                <Badge tone={course.restricted ? "dark" : "neutral"}>{course.restricted ? "Private" : "Public"}</Badge>
                <span className="tabular-nums">
                  {course.scenarioCount} {course.scenarioCount === 1 ? "scenario" : "scenarios"}
                </span>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/marketplace/manage/${course.moduleId}`}>
                <Pencil className="h-4 w-4" aria-hidden /> Edit
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---- Profile -------------------------------------------------------------------------

type ImageState = { id: Id<"_storage"> | null | undefined; preview: string | null };

function ProfileTab({ data }: { data: OrgDashboardData }) {
  const update = useMutation(api.orgs.updateProfile);
  const [form, setForm] = useState({
    displayName: data.org.displayName,
    tagline: data.org.tagline,
    bio: data.org.bio,
    location: data.org.location,
    accent: data.org.accent,
  });
  // id: undefined = unchanged, null = removed, otherwise a new upload.
  const [avatar, setAvatar] = useState<ImageState>({ id: undefined, preview: data.org.avatarUrl });
  const [banner, setBanner] = useState<ImageState>({ id: undefined, preview: data.org.bannerUrl });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<typeof form>) => {
    setSaved(false);
    setForm((current) => ({ ...current, ...patch }));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await update({
        handle: data.org.handle,
        ...form,
        location: form.location || undefined,
        ...(avatar.id !== undefined ? { avatarStorageId: avatar.id } : {}),
        ...(banner.id !== undefined ? { bannerStorageId: banner.id } : {}),
      });
      setSaved(true);
    } catch (saveError) {
      setError(friendlyError(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="max-w-2xl space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <p className="text-sm text-gray-500">
        This is what people see at{" "}
        <Link href={`/${data.org.handle}`} className="font-semibold text-ink underline underline-offset-2">
          xingo.ai/{data.org.handle}
        </Link>
        .
      </p>
      <div className="flex flex-col gap-5 sm:flex-row">
        <Field label="Logo" className="shrink-0">
          <ImageUpload
            label="logo"
            aspect="square"
            value={avatar.id ?? undefined}
            previewUrl={avatar.preview}
            onChange={(id, preview) => {
              setSaved(false);
              setAvatar({ id: id ?? null, preview });
            }}
          />
        </Field>
        <Field label="Banner" className="min-w-0 flex-1">
          <ImageUpload
            label="banner"
            value={banner.id ?? undefined}
            previewUrl={banner.preview}
            onChange={(id, preview) => {
              setSaved(false);
              setBanner({ id: id ?? null, preview });
            }}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="op-name">
          <TextInput id="op-name" maxLength={80} value={form.displayName} onChange={(e) => set({ displayName: e.target.value })} />
        </Field>
        <Field label="Location (optional)" htmlFor="op-location">
          <TextInput id="op-location" maxLength={60} placeholder="e.g. Brisbane" value={form.location} onChange={(e) => set({ location: e.target.value })} />
        </Field>
      </div>
      <Field label="Tagline" htmlFor="op-tagline" hint="One line about who you are and who your courses are for.">
        <TextInput id="op-tagline" maxLength={140} value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} />
      </Field>
      <Field label="About" htmlFor="op-bio">
        <TextArea id="op-bio" rows={5} maxLength={1200} value={form.bio} onChange={(e) => set({ bio: e.target.value })} />
      </Field>
      <Field label="Brand colour" htmlFor="op-accent">
        <input
          id="op-accent"
          type="color"
          value={form.accent}
          onChange={(e) => set({ accent: e.target.value })}
          className="h-10 w-16 rounded border border-gray-200"
        />
      </Field>
      {error ? <p className="rounded-lg bg-record/10 px-3 py-2 text-sm text-record">{error}</p> : null}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save profile"}
        </Button>
        {saved ? <span className="text-sm text-gray-500" aria-live="polite">Saved</span> : null}
      </div>
    </form>
  );
}
