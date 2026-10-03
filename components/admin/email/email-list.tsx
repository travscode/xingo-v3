"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ChevronRight, Plus } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { friendlyError } from "@/lib/errors";
import { Badge, EmptyState, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { AutomatedEmails } from "@/components/admin/email/automated-emails";

const statusTone = { draft: "neutral", sending: "live", sent: "success", cancelled: "warning" } as const;

function rate(part: number, whole: number) {
  return whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—";
}

/** Admin → Email: all campaigns with headline results. */
export function EmailList() {
  const campaigns = useQuery(api.emails.listCampaigns, {});
  const createDraft = useMutation(api.emails.createDraft);
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    setCreating(true);
    try {
      const id = await createDraft({});
      router.push(`/admin/email/${id}`);
    } catch (createError) {
      setError(friendlyError(createError));
      setCreating(false);
    }
  };

  if (!campaigns) {
    return <Skeleton className="h-64" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">Branded emails to your learners, with open and click tracking.</p>
        <Button onClick={() => void create()} disabled={creating}>
          <Plus className="h-4 w-4" /> {creating ? "Creating…" : "New email"}
        </Button>
      </div>
      {error ? <p className="text-sm text-record">{error}</p> : null}
      <AutomatedEmails />

      {campaigns.length === 0 ? (
        <EmptyState title="No emails yet" description="Create your first email from a branded template." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-gray-200 text-xs text-gray-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Sent</th>
                <th className="px-5 py-3 font-semibold">Opened</th>
                <th className="px-5 py-3 font-semibold">Clicked</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/email/${campaign._id}`} className="block">
                      <span className="block font-semibold">{campaign.name}</span>
                      <span className="block truncate text-gray-500">{campaign.subject || "No subject yet"}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={statusTone[campaign.status]} className="capitalize">
                      {campaign.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 tabular-nums">
                    {campaign.stats.sent}
                    {campaign.stats.queued > 0 ? <span className="text-gray-500"> / {campaign.stats.recipients}</span> : null}
                  </td>
                  <td className="px-5 py-3 tabular-nums">{rate(campaign.stats.opened, campaign.stats.sent)}</td>
                  <td className="px-5 py-3 tabular-nums">{rate(campaign.stats.clicked, campaign.stats.sent)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/email/${campaign._id}`} aria-label={`Open ${campaign.name}`}>
                      <ChevronRight className="ml-auto h-4 w-4 text-gray-500" />
                    </Link>
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
