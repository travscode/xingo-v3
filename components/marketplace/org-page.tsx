"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ArrowLeft, ArrowRight, Lock, Mail, MapPin, Settings } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { friendlyError } from "@/lib/errors";
import { Badge, Card, PageHeader, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { CourseBanner, CourseCard } from "@/components/marketplace/course-card";
import { VerifiedBadge } from "@/components/marketplace/verified-badge";

type OrgData = Extract<NonNullable<FunctionReturnType<typeof api.orgs.page>>, { kind: "organization" }>;
type Collection = OrgData["collections"][number];

/** How many courses a collection shows on the organisation page before "See all". */
const PREVIEW_COURSES = 6;

function useOrg(handle: string) {
  const page = useQuery(api.orgs.page, { handle });
  return page === undefined ? undefined : page?.kind === "organization" ? page : null;
}

function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-2xl font-bold">We couldn&apos;t find that page</h1>
      <Button asChild className="mt-6">
        <Link href="/marketplace">Browse the marketplace</Link>
      </Button>
    </div>
  );
}

function canSeeCourses(collection: Collection) {
  return collection.access === "team" || collection.access === "public" || collection.access === "active";
}

/** Course grid with "Add" for a collection the viewer can open. */
function CollectionCourses({ courses, signedIn }: { courses: Collection["courses"]; signedIn: boolean }) {
  const add = useMutation(api.marketplace.addToLibrary);
  const router = useRouter();
  const pathname = usePathname();
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {error ? <p className="rounded-lg bg-record/10 px-3 py-2 text-sm text-record">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard
            key={course.moduleId}
            course={course}
            adding={adding === course.moduleId}
            onAdd={() => {
              if (!signedIn) {
                router.push(`/sign-up?redirect=${encodeURIComponent(pathname)}`);
                return;
              }
              setAdding(course.moduleId);
              setError(null);
              add({ moduleId: course.moduleId })
                .catch((addError) => setError(friendlyError(addError)))
                .finally(() => setAdding(null));
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** The lock panel for an invite-only collection, with the one action that fits the viewer's status. */
function CollectionAccess({
  collection,
  signedIn,
  quiet,
}: {
  collection: Collection;
  signedIn: boolean;
  /** Secondary buttons, for the organisation page where several collections can be locked. */
  quiet?: boolean;
}) {
  const variant = quiet ? "secondary" : "primary";
  const requestAccess = useMutation(api.orgs.requestAccess);
  const pathname = usePathname();
  const [writing, setWriting] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (withNote: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const result = await requestAccess({ collectionId: collection.id, note: withNote ? note.trim() || undefined : undefined });
      // "active" means they were already invited: the courses appear as the page updates.
      if (result.status === "requested") setSent(true);
      setWriting(false);
    } catch (requestError) {
      setError(friendlyError(requestError));
    } finally {
      setBusy(false);
    }
  };

  const requested = sent || collection.access === "requested";
  const courseLine = `${collection.courseCount} ${collection.courseCount === 1 ? "course" : "courses"}`;

  return (
    <Card tone="muted" className="flex flex-col gap-4 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper">
          <Lock className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-semibold">Invite only · {courseLine}</p>
          <p className="mt-0.5 text-sm text-gray-500">
            {requested
              ? "Request sent. We'll email you when the team approves it."
              : collection.access === "invited"
                ? signedIn
                  ? "You've been invited. Open the collection to add its courses to your library."
                  : "You've been invited — check your email for the link."
                : "Ask the team for access. They'll see your name and email."}
          </p>
        </div>
      </div>

      {requested ? null : !signedIn ? (
        <div>
          <Button asChild variant={variant}>
            <Link href={`/sign-in?redirect=${encodeURIComponent(pathname)}`}>
              {collection.access === "invited" ? "Log in to open" : "Log in to request access"}
            </Link>
          </Button>
        </div>
      ) : collection.access === "invited" ? (
        <div>
          <Button variant={variant} disabled={busy} onClick={() => void send(false)}>
            {busy ? "Opening…" : "Open collection"}
          </Button>
        </div>
      ) : writing ? (
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-semibold">Note to the team (optional)</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={300}
              rows={3}
              placeholder="For example, which class or team you're in"
              className="mt-1.5 w-full rounded-lg border border-gray-200 bg-paper px-3 py-2.5 text-[15px] leading-6 outline-none focus:border-ink"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy} onClick={() => void send(true)}>
              {busy ? "Sending…" : "Send request"}
            </Button>
            <Button variant="ghost" disabled={busy} onClick={() => setWriting(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Button variant={variant} onClick={() => setWriting(true)}>
            <Mail className="h-4 w-4" aria-hidden /> Request access
          </Button>
        </div>
      )}
      {error ? <p className="rounded-lg bg-record/10 px-3 py-2 text-sm text-record">{error}</p> : null}
    </Card>
  );
}

function CollectionSection({ org, collection }: { org: OrgData; collection: Collection }) {
  const href = `/${org.handle}/${collection.slug}`;
  const visible = canSeeCourses(collection);
  const preview = collection.courses.slice(0, PREVIEW_COURSES);

  return (
    <section aria-labelledby={`collection-${collection.id}`} className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id={`collection-${collection.id}`} className="text-xl font-bold tracking-[-0.02em]">
              <Link href={href} className="hover:underline">
                {collection.title}
              </Link>
            </h2>
            {collection.visibility === "invite" ? (
              <Badge>
                <Lock className="h-3 w-3" aria-hidden /> Invite only
              </Badge>
            ) : null}
            {collection.access === "active" ? <Badge tone="success">You have access</Badge> : null}
          </div>
          {collection.description ? <p className="mt-1 max-w-3xl text-sm text-gray-500">{collection.description}</p> : null}
        </div>
        {visible && collection.courses.length > PREVIEW_COURSES ? (
          <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold hover:underline">
            See all {collection.courses.length} courses <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </div>
      {visible ? (
        preview.length > 0 ? (
          <CollectionCourses courses={preview} signedIn={org.viewer.signedIn} />
        ) : (
          <p className="text-sm text-gray-500">No published courses in this collection yet.</p>
        )
      ) : (
        <CollectionAccess collection={collection} signedIn={org.viewer.signedIn} quiet />
      )}
    </section>
  );
}

function ManageButton({ org }: { org: OrgData }) {
  if (!org.viewer.teamRole) return null;
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={`/marketplace/org/${org.handle}`}>
        <Settings className="h-4 w-4" aria-hidden /> Manage
      </Link>
    </Button>
  );
}

/** xingo.ai/<handle> for an organisation: who they are, then their collections. */
export function OrgPage({ handle }: { handle: string }) {
  const org = useOrg(handle);

  if (org === undefined) return <Skeleton className="h-96" />;
  if (org === null) return <NotFound />;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between gap-3">
        <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Marketplace
        </Link>
        <ManageButton org={org} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200">
        <div className="relative aspect-[4/1] min-h-32 w-full" style={{ backgroundColor: org.accent }}>
          {org.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={org.bannerUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="relative px-5 pb-6 sm:px-8">
          <div
            className="-mt-12 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-paper"
            style={{ backgroundColor: org.accent }}
          >
            {org.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-paper">{org.displayName.slice(0, 1)}</span>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">{org.displayName}</h1>
            {org.verified ? <VerifiedBadge size="lg" /> : null}
            <span className="text-sm text-gray-500">@{org.handle}</span>
          </div>
          {org.tagline ? <p className="mt-1 text-lg text-gray-500">{org.tagline}</p> : null}
          {org.location ? (
            <p className="mt-3 inline-flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" aria-hidden /> {org.location}
            </p>
          ) : null}
          {org.bio ? <p className="mt-5 max-w-3xl whitespace-pre-line leading-7 text-gray-700">{org.bio}</p> : null}
        </div>
      </section>

      {org.collections.length === 0 ? (
        <p className="text-sm text-gray-500">
          {org.viewer.teamRole ? "No collections yet. Create one from Manage." : "No courses published yet."}
        </p>
      ) : (
        org.collections.map((collection) => <CollectionSection key={collection.id} org={org} collection={collection} />)
      )}
    </div>
  );
}

/** xingo.ai/<handle>/<collection>: one collection, with the same access rules as the organisation page. */
export function OrgCollectionPage({ handle, slug }: { handle: string; slug: string }) {
  const org = useOrg(handle);

  if (org === undefined) return <Skeleton className="h-96" />;
  const collection = org?.collections.find((item) => item.slug === slug);
  if (!org || !collection) return <NotFound />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <Link href={`/${org.handle}`} className="inline-flex min-w-0 items-center gap-1 text-sm font-semibold text-gray-500 hover:text-ink">
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden /> <span className="truncate">{org.displayName}</span>
        </Link>
        <ManageButton org={org} />
      </div>

      {collection.bannerUrl ? (
        <CourseBanner url={collection.bannerUrl} title={collection.title} className="aspect-[4/1] min-h-32 rounded-2xl" />
      ) : null}

      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-1">
            {org.displayName}
            {org.verified ? <VerifiedBadge /> : null}
          </span>
        }
        title={collection.title}
        description={
          collection.description ||
          `${collection.courseCount} ${collection.courseCount === 1 ? "course" : "courses"} from ${org.displayName}.`
        }
      />

      {canSeeCourses(collection) ? (
        collection.courses.length > 0 ? (
          <CollectionCourses courses={collection.courses} signedIn={org.viewer.signedIn} />
        ) : (
          <p className="text-sm text-gray-500">No published courses in this collection yet.</p>
        )
      ) : (
        <CollectionAccess collection={collection} signedIn={org.viewer.signedIn} />
      )}
    </div>
  );
}
