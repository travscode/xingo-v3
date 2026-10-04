"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Clock,
  ExternalLink,
  Flag,
  Languages,
  MessagesSquare,
  Pencil,
  Play,
  Plus,
  Users,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { track } from "@/lib/analytics";
import { friendlyError } from "@/lib/errors";
import { reportReasons, type ReportReason } from "@/lib/marketplace";
import { Badge, Card, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { CourseBanner, RatingInline } from "@/components/marketplace/course-card";
import { CourseRatings } from "@/components/marketplace/course-ratings";
import { creatorHref, VerifiedBadge } from "@/components/marketplace/verified-badge";

const difficultyLabel = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" } as const;

function ReportForm({ moduleId, signedIn, slug }: { moduleId: string; signedIn: boolean; slug: string }) {
  const report = useMutation(api.marketplace.report);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("inappropriate");
  const [details, setDetails] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!signedIn) {
    return (
      <Link href={`/sign-in?redirect=${encodeURIComponent(`/marketplace/${slug}`)}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-ink">
        <Flag className="h-3.5 w-3.5" aria-hidden /> Sign in to report this course
      </Link>
    );
  }

  if (state === "sent") {
    return <p className="text-sm text-gray-500">Thanks. We&apos;ll review this course.</p>;
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-ink">
        <Flag className="h-3.5 w-3.5" aria-hidden /> Report this course
      </button>
    );
  }

  return (
    <form
      className="max-w-lg space-y-3 rounded-xl border border-gray-200 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        setState("sending");
        setError(null);
        report({ moduleId, reason, details })
          .then(() => {
            track("course_report", { module_id: moduleId, reason });
            setState("sent");
          })
          .catch((reportError) => {
            setError(friendlyError(reportError));
            setState("idle");
          });
      }}
    >
      <p className="font-semibold">What&apos;s wrong with this course?</p>
      <div className="space-y-1.5">
        {reportReasons.map((item) => (
          <label key={item.id} className="flex items-center gap-2 text-sm">
            <input type="radio" name="reason" checked={reason === item.id} onChange={() => setReason(item.id)} />
            {item.label}
          </label>
        ))}
      </div>
      <textarea
        value={details}
        onChange={(event) => setDetails(event.target.value)}
        rows={3}
        placeholder="Anything that helps us review it (optional)"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-ink"
      />
      {error ? <p className="text-sm text-record">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send report"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function CourseListingPage({ slug }: { slug: string }) {
  const listing = useQuery(api.marketplace.listing, { slug });
  const recordView = useMutation(api.marketplace.recordView);
  const add = useMutation(api.marketplace.addToLibrary);
  const remove = useMutation(api.marketplace.removeFromLibrary);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewed = useRef(false);

  useEffect(() => {
    if (listing && !viewed.current) {
      viewed.current = true;
      void recordView({ slug }).catch(() => undefined);
      track("marketplace_course_view", {
        module_id: listing.moduleId,
        course_title: listing.title,
        kind: listing.kind,
        creator: listing.creatorHandle ?? undefined,
        signed_in: listing.signedIn,
        in_library: listing.inLibrary,
      });
    }
  }, [listing, recordView, slug]);

  if (listing === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="aspect-[3/1] w-full" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (listing === null) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <p className="mt-2 text-gray-500">It may have been unpublished or removed.</p>
        <Button asChild className="mt-6">
          <Link href="/marketplace">Browse the marketplace</Link>
        </Button>
      </div>
    );
  }

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (actionError) {
      setError(friendlyError(actionError));
    } finally {
      setBusy(false);
    }
  };

  const signUpHref = `/sign-up?redirect=${encodeURIComponent(`/marketplace/${slug}`)}`;

  const primary = listing.isOwner ? (
    <Button asChild size="lg">
      <Link href={`/marketplace/manage/${listing.moduleId}`}>
        <Pencil className="h-4 w-4" aria-hidden /> Edit course
      </Link>
    </Button>
  ) : !listing.signedIn ? (
    <Button asChild size="lg">
      <Link href={signUpHref}>
        <Plus className="h-4 w-4" aria-hidden /> Add to my courses
      </Link>
    </Button>
  ) : listing.inLibrary ? (
    <Button asChild size="lg">
      <Link href={`/courses/${listing.moduleId}`}>
        <Play className="h-4 w-4" aria-hidden /> Start practising
      </Link>
    </Button>
  ) : (
    <Button size="lg" disabled={busy} onClick={() =>
        void run(() =>
          add({ moduleId: listing.moduleId }).then(() => track("course_add", { module_id: listing.moduleId, source: "listing" })),
        )
      }
    >
      <Plus className="h-4 w-4" aria-hidden /> {busy ? "Adding…" : "Add to my courses"}
    </Button>
  );

  return (
    <div className="space-y-10">
      <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Marketplace
      </Link>

      {listing.status !== "published" ? (
        <div className="rounded-xl bg-warning/30 px-4 py-3 text-sm">
          {listing.status === "removed"
            ? `This course was removed by XINGO${listing.removedReason ? `: ${listing.removedReason}` : "."}`
            : "Draft: only you can see this page. Publish it from the editor when you're ready."}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-gray-200">
        <CourseBanner url={listing.bannerUrl} title="" className="aspect-[3/1] max-h-72 w-full" />
        <div className="relative p-6 sm:p-8">
          {listing.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.logoUrl}
              alt=""
              className="absolute -top-10 left-6 h-20 w-20 rounded-2xl border-4 border-paper bg-paper object-contain sm:left-8"
            />
          ) : null}
          <div className={listing.logoUrl ? "pt-10" : undefined}>
            <div className="flex flex-wrap gap-1.5">
              <Badge>
                {listing.kind === "roleplay" ? <MessagesSquare className="h-3 w-3" aria-hidden /> : <Languages className="h-3 w-3" aria-hidden />}
                {listing.kind === "roleplay" ? "One-on-one with an AI person" : "Interpret between two AI people"}
              </Badge>
              {listing.certifications.map((cert) => (
                <Badge key={cert.name} tone="accent">
                  <BadgeCheck className="h-3 w-3" aria-hidden /> {cert.name}
                </Badge>
              ))}
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">{listing.title}</h1>
            {listing.tagline ? <p className="mt-2 max-w-2xl text-lg text-gray-500">{listing.tagline}</p> : null}
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
              <span>
                By{" "}
                {listing.creatorHandle ? (
                  <Link
                    href={creatorHref(listing.creatorHandle, listing.orgHandle === listing.creatorHandle)}
                    className="font-semibold text-ink hover:underline"
                  >
                    {listing.creatorName}
                  </Link>
                ) : (
                  <span className="font-semibold text-ink">{listing.creatorName}</span>
                )}
                {listing.creatorVerified ? <VerifiedBadge size="md" className="ml-1 align-[-3px]" /> : null}
              </span>
              {listing.isOriginal ? <span className="text-xs">Made by the XINGO team</span> : null}
              <RatingInline rating={listing.rating} count={listing.ratingCount} className="text-ink" />
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {primary}
              {listing.inLibrary && !listing.isOwner ? (
                <Button variant="ghost" disabled={busy} onClick={() =>
                    void run(() =>
                      remove({ moduleId: listing.moduleId }).then(() => track("course_remove", { module_id: listing.moduleId })),
                    )
                  }
                >
                  <Check className="h-4 w-4" aria-hidden /> Added · Remove
                </Button>
              ) : null}
            </div>
            {error ? <p className="mt-3 text-sm text-record">{error}</p> : null}
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5">
                <MessagesSquare className="h-4 w-4 text-gray-500" aria-hidden />
                <dt className="sr-only">Scenarios</dt>
                <dd>
                  {listing.scenarioCount} practice {listing.scenarioCount === 1 ? "scenario" : "scenarios"}
                </dd>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gray-500" aria-hidden />
                <dt className="sr-only">Length</dt>
                <dd>Up to {listing.totalMinutes} min in total</dd>
              </div>
              {listing.addCount > 0 ? (
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-gray-500" aria-hidden />
                  <dt className="sr-only">Learners</dt>
                  <dd>{listing.addCount.toLocaleString("en-AU")} added it</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          {listing.description ? (
            <section>
              <h2 className="text-xl font-bold tracking-[-0.02em]">About this course</h2>
              <p className="mt-3 whitespace-pre-line leading-7 text-gray-700">{listing.description}</p>
            </section>
          ) : null}

          {listing.whatYouGet.length > 0 ? (
            <section>
              <h2 className="text-xl font-bold tracking-[-0.02em]">What you&apos;ll get</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {listing.whatYouGet.map((item) => (
                  <li key={item} className="flex gap-2 text-[15px]">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-ink" aria-hidden /> {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h2 className="text-xl font-bold tracking-[-0.02em]">Practice scenarios</h2>
            <p className="mt-1 text-sm text-gray-500">
              {listing.kind === "roleplay" ? "Each one is a spoken conversation with one AI person, scored with feedback when you finish." : "In each one you interpret between two AI people, then get scored with feedback."}
            </p>
            <ol className="mt-4 divide-y divide-gray-200 rounded-xl border border-gray-200">
              {listing.scenarios.map((scenario, index) => (
                <li key={scenario.id} className="flex gap-4 px-5 py-4">
                  {scenario.character.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={scenario.character.avatarUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold">{index + 1}</span>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold">{scenario.title}</p>
                    {scenario.description ? <p className="mt-0.5 text-sm text-gray-500">{scenario.description}</p> : null}
                    <p className="mt-1 text-xs text-gray-500">
                      With {scenario.character.name} ({scenario.character.role}) · {difficultyLabel[scenario.difficultyLevel]} · up to{" "}
                      {scenario.timeLimitMinutes} min
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <CourseRatings moduleId={listing.moduleId} />
        </div>

        <aside className="space-y-4">
          {listing.audience ? (
            <Card className="p-5">
              <p className="text-sm font-bold">Who it&apos;s for</p>
              <p className="mt-1 text-sm text-gray-700">{listing.audience}</p>
            </Card>
          ) : null}
          {listing.certifications.length > 0 ? (
            <Card className="p-5">
              <p className="text-sm font-bold">Related certifications</p>
              <ul className="mt-3 space-y-3">
                {listing.certifications.map((cert) => (
                  <li key={cert.name} className="flex items-center gap-3">
                    {cert.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cert.logoUrl} alt="" className="h-10 w-10 rounded-lg object-contain" />
                    ) : (
                      <BadgeCheck className="h-6 w-6 shrink-0" aria-hidden />
                    )}
                    <div className="min-w-0 text-sm">
                      <p className="font-semibold">{cert.name}</p>
                      {cert.issuer ? <p className="text-gray-500">{cert.issuer}</p> : null}
                      {cert.url ? (
                        <a href={cert.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-gray-500 underline hover:text-ink">
                          Details <ExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-5 text-gray-500">
                Listed by the creator. Practising here doesn&apos;t award the certification itself.
              </p>
            </Card>
          ) : null}
          <Card tone="muted" className="p-5 text-sm">
            <p className="font-bold">How practice works</p>
            <p className="mt-1 text-gray-700">
              Sessions use your XINGO practice minutes, including the free minutes every account gets each month.
            </p>
          </Card>
        </aside>
      </div>

      {!listing.isOwner ? <ReportForm moduleId={listing.moduleId} signedIn={listing.signedIn} slug={slug} /> : null}
    </div>
  );
}
