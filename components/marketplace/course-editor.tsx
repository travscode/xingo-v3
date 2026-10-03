"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ExternalLink, Link2, PartyPopper } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { friendlyError } from "@/lib/errors";
import { CREATOR_GUIDELINES } from "@/lib/marketplace";
import { cn } from "@/lib/utils";
import { Badge, Card, EmptyState, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/admin/content/fields";
import { ListingEditor } from "@/components/marketplace/listing-editor";
import { ScenarioEditor } from "@/components/marketplace/scenario-editor";
import { CourseInsights } from "@/components/marketplace/course-insights";

type Tab = "page" | "scenarios" | "insights";

function PublishPanel({ moduleId, onClose }: { moduleId: string; onClose: () => void }) {
  const publish = useMutation(api.marketplace.publish);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Card className="space-y-4 p-5 sm:p-6">
      <p className="text-lg font-bold">Publish to the marketplace</p>
      <ul className="list-disc space-y-1.5 pl-5 text-sm text-gray-700">
        {CREATOR_GUIDELINES.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
      <label className="flex items-start gap-2 text-sm font-semibold">
        <input type="checkbox" className="mt-1" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
        <span>
          I agree to the{" "}
          <a href="/creator-terms" target="_blank" rel="noopener noreferrer" className="underline">
            Creator Terms
          </a>{" "}
          and my course follows these guidelines.
        </span>
      </label>
      {error ? <p className="text-sm text-record">{error}</p> : null}
      <div className="flex gap-2">
        <Button
          disabled={!accepted || busy}
          onClick={() => {
            setBusy(true);
            setError(null);
            publish({ moduleId, acceptGuidelines: accepted })
              .then(onClose)
              .catch((publishError) => setError(friendlyError(publishError)))
              .finally(() => setBusy(false));
          }}
        >
          {busy ? "Publishing…" : "Publish"}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Not yet
        </Button>
      </div>
    </Card>
  );
}

export function CourseEditor({ moduleId }: { moduleId: string }) {
  const data = useQuery(api.marketplace.editorData, { moduleId });
  const unpublish = useMutation(api.marketplace.unpublish);
  const deleteCourse = useMutation(api.marketplace.deleteCourse);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const created = searchParams.get("created") === "1";
  const requested = searchParams.get("tab") as Tab | null;
  const tab: Tab = requested && ["page", "scenarios", "insights"].includes(requested) ? requested : created ? "scenarios" : "page";

  if (data === undefined) return <Skeleton className="h-96" />;
  if (data === null) {
    return (
      <EmptyState
        title="This course has been deleted"
        description="It's no longer on the marketplace or in anyone's library."
        action={
          <Button asChild>
            <Link href="/marketplace?tab=yours">Back to your courses</Link>
          </Button>
        }
      />
    );
  }

  const { listing, scenarios } = data;
  const published = listing.status === "published";
  const publicUrl = typeof window === "undefined" ? `/marketplace/${listing.slug}` : `${window.location.origin}/marketplace/${listing.slug}`;
  const setTab = (next: Tab) => router.replace(`${pathname}?tab=${next}`, { scroll: false });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Created by you", href: "/marketplace?tab=yours" }, { label: listing.title }]} />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Badge tone={published ? "success" : listing.status === "removed" ? "warning" : "neutral"} className="capitalize">
            {listing.status === "removed" ? "Removed by XINGO" : listing.status}
          </Badge>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em]">{listing.title}</h1>
          {listing.removedReason ? <p className="mt-1 text-sm text-record">{listing.removedReason}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/marketplace/${listing.slug}`}>
              <ExternalLink className="h-4 w-4" aria-hidden /> View page
            </Link>
          </Button>
          {published ? (
            <>
              <Button
                variant="outline"
                onClick={() =>
                  void navigator.clipboard.writeText(publicUrl).then(() => {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 2000);
                  })
                }
              >
                <Link2 className="h-4 w-4" aria-hidden /> {copied ? "Copied" : "Copy link"}
              </Button>
              <Button variant="ghost" onClick={() => window.confirm("Unpublish? It disappears from the marketplace and from learners' libraries until you publish again.") && void unpublish({ moduleId })}>
                Unpublish
              </Button>
            </>
          ) : listing.status === "draft" ? (
            <Button onClick={() => setPublishing(true)}>Publish</Button>
          ) : null}
        </div>
      </header>

      {created && !published ? (
        <div className="flex gap-3 rounded-xl bg-accent/40 p-4 text-sm">
          <PartyPopper className="h-5 w-5 shrink-0" aria-hidden />
          <p>
            <span className="font-semibold">Your course is created as a draft.</span> Try the first scenario yourself, add a couple more, then
            dress up the page and publish.
          </p>
        </div>
      ) : null}

      {publishing ? <PublishPanel moduleId={moduleId} onClose={() => setPublishing(false)} /> : null}

      <div className="flex gap-1 border-b border-gray-200" role="tablist" aria-label="Course editor">
        {(
          [
            ["page", "Course page"],
            ["scenarios", `Scenarios (${scenarios.length})`],
            ["insights", "Insights"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn("-mb-px border-b-2 px-3 py-2.5 text-sm font-semibold", tab === id ? "border-ink" : "border-transparent text-gray-500 hover:text-ink")}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "page" ? (
        <ListingEditor
          key={listing.updatedAt}
          moduleId={moduleId}
          scenarioCount={scenarios.length}
          initial={{
            title: listing.title,
            tagline: listing.tagline,
            description: listing.description,
            keywords: listing.keywords,
            whatYouGet: listing.whatYouGet,
            audience: listing.audience ?? "",
            creatorName: listing.creatorName,
            bannerStorageId: listing.bannerStorageId,
            bannerUrl: listing.bannerUrl,
            logoStorageId: listing.logoStorageId,
            logoUrl: listing.logoUrl,
            certifications: listing.certifications.map((cert) => ({
              name: cert.name,
              issuer: cert.issuer,
              url: cert.url,
              logoStorageId: cert.logoStorageId,
              logoUrl: cert.logoUrl,
            })),
          }}
        />
      ) : tab === "scenarios" ? (
        <ScenarioEditor moduleId={moduleId} kind={listing.kind} scenarios={scenarios} published={published} />
      ) : (
        <CourseInsights moduleId={moduleId} />
      )}

      <section className="mt-12 flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">Delete this course</p>
          <p className="text-sm text-gray-500">
            Removes the course, its scenarios and its page for good, and takes it out of learners&apos; libraries. Past results and
            earnings already recorded are kept. This can&apos;t be undone.
          </p>
          {deleteError ? <p className="mt-1 text-sm text-record">{deleteError}</p> : null}
        </div>
        <Button
          variant="outline"
          className="shrink-0 border-record text-record hover:bg-record/10"
          disabled={deleting}
          onClick={() => {
            if (!window.confirm(`Delete "${listing.title}" permanently? This can't be undone.`)) return;
            setDeleting(true);
            setDeleteError(null);
            deleteCourse({ moduleId })
              .then(({ orgHandle }) => router.replace(orgHandle ? `/marketplace/org/${orgHandle}?tab=courses` : "/marketplace?tab=yours"))
              .catch((error) => {
                setDeleteError(friendlyError(error));
                setDeleting(false);
              });
          }}
        >
          {deleting ? "Deleting…" : "Delete course"}
        </Button>
      </section>
    </div>
  );
}
