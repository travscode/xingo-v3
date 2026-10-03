"use client";

import { useState } from "react";
import Link from "next/link";
import { useAction, useMutation, useQuery } from "convex/react";
import { ExternalLink, Flag, Pencil, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { friendlyError } from "@/lib/errors";
import { formatAud, reportReasons } from "@/lib/marketplace";
import { cn } from "@/lib/utils";
import { Badge, Card, EmptyState, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Field, TextArea, TextInput } from "@/components/admin/content/fields";
import { ImageUpload } from "@/components/marketplace/image-upload";

const reasonLabel = (id: string) => reportReasons.find((reason) => reason.id === id)?.label ?? id;

/** Admin → Reports: what learners flagged, with dismiss / take down. */
export function ReportsAdmin() {
  const [status, setStatus] = useState<"open" | "dismissed" | "actioned">("open");
  const reports = useQuery(api.marketplace.adminReports, { status });
  const resolve = useMutation(api.marketplace.resolveReport);
  const [error, setError] = useState<string | null>(null);

  const act = (reportId: Id<"contentReports">, action: "dismiss" | "remove_course") => {
    const note = window.prompt(
      action === "remove_course" ? "Reason shown to the creator (optional):" : "Note for the record (optional):",
      "",
    );
    if (note === null) return;
    setError(null);
    resolve({ reportId, action, note: note || undefined }).catch((resolveError) => setError(friendlyError(resolveError)));
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-1">
        {(["open", "dismissed", "actioned"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatus(value)}
            className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold capitalize", status === value ? "bg-ink text-paper" : "bg-gray-100 hover:bg-gray-200")}
          >
            {value === "actioned" ? "Taken down" : value}
          </button>
        ))}
      </div>
      {error ? <p className="text-sm text-record">{error}</p> : null}
      {!reports ? (
        <Skeleton className="h-40" />
      ) : reports.length === 0 ? (
        <EmptyState title={status === "open" ? "Nothing to review" : "None yet"} description="Reports from learners appear here, and you get an email for each one." />
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => (
            <li key={report.id}>
              <Card className="flex flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 font-semibold">
                    <Flag className="h-4 w-4" aria-hidden /> {reasonLabel(report.reason)}
                  </p>
                  <span className="text-sm text-gray-500">{new Date(report.createdAt).toLocaleString("en-AU")}</span>
                </div>
                {report.course ? (
                  <p className="text-sm">
                    <Link href={`/marketplace/${report.course.slug}`} className="inline-flex items-center gap-1 font-semibold underline" target="_blank">
                      {report.course.title} <ExternalLink className="h-3 w-3" aria-hidden />
                    </Link>{" "}
                    by {report.course.creatorName}
                    {report.owner ? <span className="text-gray-500"> ({report.owner.email})</span> : null} ·{" "}
                    <Badge className="capitalize">{report.course.status}</Badge>
                  </p>
                ) : null}
                {report.details ? <p className="whitespace-pre-line rounded-lg bg-gray-50 p-3 text-sm">{report.details}</p> : null}
                <p className="text-xs text-gray-500">Reported by {report.reporter ? `${report.reporter.name} (${report.reporter.email})` : "a learner"}</p>
                {report.resolution ? <p className="text-sm text-gray-500">Resolution: {report.resolution}</p> : null}
                {report.status === "open" ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => act(report.id, "remove_course")}>
                      Take course down
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => act(report.id, "dismiss")}>
                      Dismiss
                    </Button>
                  </div>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Admin → Marketplace: every course and creator, with full override controls. */
export function MarketplaceAdmin() {
  const listings = useQuery(api.marketplace.adminListings, {});
  const creators = useQuery(api.marketplaceAdmin.creators, {});
  const overview = useQuery(api.marketplace.adminPayoutOverview, {});
  const setStatus = useMutation(api.marketplace.adminSetListingStatus);
  const publish = useMutation(api.marketplace.publish);
  const unpublish = useMutation(api.marketplace.unpublish);
  const moveCourse = useMutation(api.marketplaceAdmin.moveCourse);
  const deleteCourse = useMutation(api.marketplaceAdmin.deleteCourse);
  const runPayouts = useAction(api.connect.runPayouts);
  const [message, setMessage] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  const act = (work: Promise<unknown>) => work.catch((error) => setMessage(friendlyError(error)));
  const shown = (listings ?? []).filter((listing) =>
    `${listing.title} ${listing.creatorName} ${listing.slug}`.toLowerCase().includes(filter.trim().toLowerCase()),
  );

  return (
    <div className="space-y-10">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Owed to creators", value: overview ? formatAud(overview.owedCents) : "…" },
          { label: "Payable now", value: overview ? formatAud(overview.payableNowCents) : "…" },
          { label: "Paid out", value: overview ? formatAud(overview.paidCents) : "…" },
          { label: "Failed payouts", value: overview ? String(overview.failedPayouts) : "…" },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{item.value}</p>
          </Card>
        ))}
      </section>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={running || !overview?.connectEnabled}
          onClick={() => {
            if (!window.confirm("Send payouts now to every creator over the threshold? This moves real money through Stripe.")) return;
            setRunning(true);
            setMessage(null);
            runPayouts({})
              .then((result) => setMessage(`Paid ${result.paid} creators (${formatAud(result.totalCents)}). ${result.failed} failed.`))
              .catch((runError) => setMessage(friendlyError(runError)))
              .finally(() => setRunning(false));
          }}
        >
          {running ? "Paying…" : "Pay creators"}
        </Button>
        <p className="text-sm text-gray-500">
          {overview?.connectEnabled ? "Pays balances past the holding period, from A$50." : "Stripe Connect isn't switched on yet."}
        </p>
      </div>
      {message ? <p className="text-sm">{message}</p> : null}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Courses ({listings?.length ?? "…"})</h2>
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter by title or creator"
            className="h-9 w-64 rounded-lg bg-gray-100 px-3 text-sm outline-none focus:ring-2 focus:ring-live"
          />
        </div>
        {!listings ? (
          <Skeleton className="h-40" />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-gray-200 text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Course</th>
                  <th className="px-4 py-3 font-semibold">Creator</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Views · Added</th>
                  <th className="px-4 py-3 font-semibold">Reports</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shown.map((listing) => (
                  <tr key={listing.moduleId} className="align-top">
                    <td className="px-4 py-3">
                      <Link href={`/marketplace/${listing.slug}`} className="font-semibold hover:underline">
                        {listing.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={listing.creatorHandle ?? ""}
                        onChange={(event) => act(moveCourse({ moduleId: listing.moduleId, toHandle: event.target.value }))}
                        className="max-w-[180px] rounded-md border border-gray-200 bg-paper px-2 py-1 text-sm"
                        aria-label={`Creator of ${listing.title}`}
                      >
                        {!listing.creatorHandle ? <option value="">{listing.creatorName}</option> : null}
                        {(creators ?? []).map((creator) => (
                          <option key={creator.handle} value={creator.handle}>
                            {creator.displayName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={listing.status === "published" ? "success" : listing.status === "removed" ? "warning" : "neutral"} className="capitalize">
                        {listing.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {listing.viewCount} · {listing.addCount}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{listing.openReports > 0 ? <Badge tone="warning">{listing.openReports} open</Badge> : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button asChild size="sm" variant="secondary">
                          <Link href={`/marketplace/manage/${listing.moduleId}`}>
                            <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                          </Link>
                        </Button>
                        {listing.status === "published" ? (
                          <Button size="sm" variant="ghost" onClick={() => act(unpublish({ moduleId: listing.moduleId }))}>
                            Unpublish
                          </Button>
                        ) : listing.status === "draft" ? (
                          <Button size="sm" variant="ghost" onClick={() => act(publish({ moduleId: listing.moduleId, acceptGuidelines: true }))}>
                            Publish
                          </Button>
                        ) : null}
                        {listing.status === "removed" ? (
                          <Button size="sm" variant="ghost" onClick={() => act(setStatus({ moduleId: listing.moduleId, action: "restore" }))}>
                            Restore
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const reason = window.prompt("Reason shown to the creator:", "");
                              if (reason !== null) act(setStatus({ moduleId: listing.moduleId, action: "remove", reason: reason || undefined }));
                            }}
                          >
                            Take down
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Delete ${listing.title}`}
                          onClick={() => {
                            if (window.confirm(`Delete "${listing.title}" permanently? Its scenarios, ratings and library entries go too. Learners' past results stay.`)) {
                              act(deleteCourse({ moduleId: listing.moduleId }));
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Creators ({creators?.length ?? "…"})</h2>
        {!creators ? (
          <Skeleton className="h-40" />
        ) : (
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
            {creators.map((creator) => (
              <li key={creator.handle} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: creator.accent }}>
                      {creator.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={creator.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {creator.displayName} <span className="font-normal text-gray-500">@{creator.handle}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {creator.courses} {creator.courses === 1 ? "course" : "courses"}
                        {creator.isHouse ? " · made by XINGO" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/marketplace/creators/${creator.handle}`}>
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden /> View
                      </Link>
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditing(editing === creator.handle ? null : creator.handle)}>
                      <Pencil className="h-3.5 w-3.5" aria-hidden /> {editing === creator.handle ? "Close" : "Edit"}
                    </Button>
                  </div>
                </div>
                {editing === creator.handle ? <CreatorAdminForm creator={creator} onDone={() => setEditing(null)} /> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

type AdminCreator = NonNullable<ReturnType<typeof useQuery<typeof api.marketplaceAdmin.creators>>>[number];

function CreatorAdminForm({ creator, onDone }: { creator: AdminCreator; onDone: () => void }) {
  const update = useMutation(api.marketplaceAdmin.updateCreator);
  const [form, setForm] = useState({
    displayName: creator.displayName,
    tagline: creator.tagline,
    bio: creator.bio,
    location: creator.location,
    accent: creator.accent,
    avatarStorageId: creator.avatarStorageId,
    avatarUrl: creator.avatarUrl,
    bannerStorageId: creator.bannerStorageId,
    bannerUrl: creator.bannerUrl,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }));

  return (
    <div className="mt-4 grid gap-4 rounded-xl bg-gray-50 p-4 md:grid-cols-2">
      <Field label="Display name" htmlFor={`c-${creator.handle}-name`}>
        <TextInput id={`c-${creator.handle}-name`} value={form.displayName} onChange={(e) => set({ displayName: e.target.value })} />
      </Field>
      <Field label="Location" htmlFor={`c-${creator.handle}-loc`}>
        <TextInput id={`c-${creator.handle}-loc`} value={form.location} onChange={(e) => set({ location: e.target.value })} />
      </Field>
      <Field label="Tagline" htmlFor={`c-${creator.handle}-tag`} className="md:col-span-2">
        <TextInput id={`c-${creator.handle}-tag`} maxLength={140} value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} />
      </Field>
      <Field label="Bio" htmlFor={`c-${creator.handle}-bio`} className="md:col-span-2">
        <TextArea id={`c-${creator.handle}-bio`} rows={4} value={form.bio} onChange={(e) => set({ bio: e.target.value })} />
      </Field>
      <Field label="Avatar">
        <ImageUpload label="avatar" aspect="square" value={form.avatarStorageId ?? undefined} previewUrl={form.avatarUrl} onChange={(id, preview) => set({ avatarStorageId: id, avatarUrl: preview })} />
      </Field>
      <Field label="Profile banner">
        <ImageUpload label="banner" value={form.bannerStorageId ?? undefined} previewUrl={form.bannerUrl} onChange={(id, preview) => set({ bannerStorageId: id, bannerUrl: preview })} />
      </Field>
      <Field label="Accent colour" htmlFor={`c-${creator.handle}-accent`}>
        <input id={`c-${creator.handle}-accent`} type="color" value={form.accent} onChange={(e) => set({ accent: e.target.value })} className="h-10 w-16 rounded border border-gray-200" />
      </Field>
      <div className="flex items-end gap-2 md:col-span-2">
        <Button
          disabled={saving}
          onClick={() => {
            setSaving(true);
            setError(null);
            update({
              handle: creator.handle,
              displayName: form.displayName,
              tagline: form.tagline,
              bio: form.bio,
              location: form.location || undefined,
              accent: form.accent,
              avatarStorageId: form.avatarStorageId ?? null,
              bannerStorageId: form.bannerStorageId ?? null,
            })
              .then(onDone)
              .catch((saveError) => setError(friendlyError(saveError)))
              .finally(() => setSaving(false));
          }}
        >
          {saving ? "Saving…" : "Save creator"}
        </Button>
        {error ? <p className="text-sm text-record">{error}</p> : null}
      </div>
    </div>
  );
}
