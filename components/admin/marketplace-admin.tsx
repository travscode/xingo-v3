"use client";

import { useState } from "react";
import Link from "next/link";
import { useAction, useMutation, useQuery } from "convex/react";
import { ExternalLink, Flag } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { friendlyError } from "@/lib/errors";
import { formatAud, reportReasons } from "@/lib/marketplace";
import { cn } from "@/lib/utils";
import { Badge, Card, EmptyState, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

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

/** Admin → Marketplace: every community course, creator payouts. */
export function MarketplaceAdmin() {
  const listings = useQuery(api.marketplace.adminListings, {});
  const overview = useQuery(api.marketplace.adminPayoutOverview, {});
  const setStatus = useMutation(api.marketplace.adminSetListingStatus);
  const runPayouts = useAction(api.connect.runPayouts);
  const [message, setMessage] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  return (
    <div className="space-y-8">
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
          {overview?.connectEnabled ? "Pays balances past the holding period, from A$50." : "Stripe Connect isn't switched on yet. See docs/runbooks/stripe-connect-setup.md."}
        </p>
      </div>
      {message ? <p className="text-sm">{message}</p> : null}

      {!listings ? (
        <Skeleton className="h-40" />
      ) : listings.length === 0 ? (
        <EmptyState title="No community courses yet" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-gray-200 text-xs text-gray-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Course</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Views</th>
                <th className="px-5 py-3 font-semibold">Added</th>
                <th className="px-5 py-3 font-semibold">Reports</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {listings.map((listing) => (
                <tr key={listing.moduleId}>
                  <td className="px-5 py-3">
                    <Link href={`/marketplace/${listing.slug}`} className="font-semibold hover:underline">
                      {listing.title}
                    </Link>
                    <span className="block text-gray-500">{listing.creatorName}</span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={listing.status === "published" ? "success" : listing.status === "removed" ? "warning" : "neutral"} className="capitalize">
                      {listing.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 tabular-nums">{listing.viewCount}</td>
                  <td className="px-5 py-3 tabular-nums">{listing.addCount}</td>
                  <td className="px-5 py-3 tabular-nums">{listing.openReports > 0 ? <Badge tone="warning">{listing.openReports} open</Badge> : "—"}</td>
                  <td className="px-5 py-3 text-right">
                    {listing.status === "removed" ? (
                      <Button size="sm" variant="ghost" onClick={() => void setStatus({ moduleId: listing.moduleId, action: "restore" })}>
                        Restore
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const reason = window.prompt("Reason shown to the creator:", "");
                          if (reason !== null) void setStatus({ moduleId: listing.moduleId, action: "remove", reason: reason || undefined });
                        }}
                      >
                        Take down
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
