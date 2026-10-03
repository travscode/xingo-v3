"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Copy, ExternalLink, Eye, MousePointerClick, Send, UserMinus, XCircle } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Badge, Card, ProgressBar, SectionTitle, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/admin/content/fields";
import { EmailPreview } from "@/components/admin/email/email-preview";

type Filter = "all" | "opened" | "clicked" | "not_opened" | "failed";

function pct(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export function CampaignReport({
  campaign,
  stats,
  linkStats,
  adminName,
  adminEmail,
}: {
  campaign: Doc<"emailCampaigns">;
  stats: { recipients: number; queued: number; sent: number; failed: number; opened: number; clicked: number; unsubscribed: number };
  linkStats: Array<{ url: string; clicks: number; uniqueClickers: number }>;
  adminName: string;
  adminEmail: string;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [showEmail, setShowEmail] = useState(false);
  const recipients = useQuery(api.emails.listRecipients, { id: campaign._id, filter });
  const duplicate = useMutation(api.emails.duplicate);
  const cancelSend = useMutation(api.emails.cancelSend);
  const sending = campaign.status === "sending";
  const done = stats.sent + stats.failed;

  const cards = [
    { label: "Delivered", value: stats.sent, hint: `of ${stats.recipients}`, icon: Send },
    { label: "Opened", value: `${pct(stats.opened, stats.sent)}%`, hint: `${stats.opened} people`, icon: Eye },
    { label: "Clicked", value: `${pct(stats.clicked, stats.sent)}%`, hint: `${stats.clicked} people`, icon: MousePointerClick },
    { label: "Unsubscribed", value: stats.unsubscribed, hint: `${pct(stats.unsubscribed, stats.sent)}%`, icon: UserMinus },
    { label: "Failed", value: stats.failed, hint: "bounced or rejected", icon: XCircle },
  ];

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: "Email", href: "/admin?tab=email" }, { label: campaign.name }]} />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge tone={sending ? "live" : campaign.status === "sent" ? "success" : "warning"} className="capitalize">
              {campaign.status}
            </Badge>
            {campaign.sentAt ? <span className="text-sm text-gray-500">{new Date(campaign.sentAt).toLocaleString()}</span> : null}
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em]">{campaign.subject}</h1>
          <p className="mt-1 text-sm text-gray-500">{campaign.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowEmail((value) => !value)}>
            <Eye className="h-4 w-4" /> {showEmail ? "Hide email" : "View email"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => void duplicate({ id: campaign._id }).then((id) => router.push(`/admin/email/${id}`))}
          >
            <Copy className="h-4 w-4" /> Duplicate
          </Button>
          {sending ? (
            <Button variant="ghost" onClick={() => window.confirm("Stop sending? Emails already sent can't be recalled.") && void cancelSend({ id: campaign._id })}>
              Stop sending
            </Button>
          ) : null}
        </div>
      </header>

      {sending ? (
        <Card className="p-5">
          <div className="flex justify-between text-sm">
            <span className="font-semibold">Sending…</span>
            <span className="tabular-nums text-gray-500">
              {done} / {stats.recipients}
            </span>
          </div>
          <ProgressBar className="mt-2" value={stats.recipients ? done / stats.recipients : 0} tone="accent" />
          {campaign.batchIntervalMinutes > 0 ? (
            <p className="mt-2 text-xs text-gray-500">
              Batches of {campaign.batchSize} every {campaign.batchIntervalMinutes} minutes. You can leave this page.
            </p>
          ) : null}
        </Card>
      ) : null}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="p-4">
              <p className="flex items-center gap-1.5 text-sm text-gray-500">
                <Icon className="h-3.5 w-3.5" /> {card.label}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{card.value}</p>
              <p className="text-xs text-gray-500">{card.hint}</p>
            </Card>
          );
        })}
      </section>
      <p className="-mt-5 text-xs text-gray-500">
        Opens are approximate: some mail apps (e.g. Apple Mail) load images automatically, and others block them. Clicks are the more reliable signal.
      </p>

      {showEmail ? (
        <EmailPreview
          templateId={campaign.templateId}
          content={campaign.content}
          subject={campaign.subject}
          preheader={campaign.preheader}
          fromName={campaign.fromName}
          recipientName={adminName}
          recipientEmail={adminEmail}
        />
      ) : null}

      {linkStats.length > 0 ? (
        <section>
          <SectionTitle>Link clicks</SectionTitle>
          <div className="divide-y divide-gray-200 rounded-xl border border-gray-200">
            {linkStats
              .slice()
              .sort((a, b) => b.clicks - a.clicks)
              .map((link) => (
                <div key={link.url} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-1.5 truncate hover:underline">
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                    <span className="truncate">{link.url}</span>
                  </a>
                  <span className="shrink-0 tabular-nums">
                    <span className="font-semibold">{link.uniqueClickers}</span>
                    <span className="text-gray-500"> people · {link.clicks} clicks</span>
                  </span>
                </div>
              ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionTitle>Recipients</SectionTitle>
        <div className="mb-3 flex flex-wrap gap-1">
          {(
            [
              ["all", "All"],
              ["opened", "Opened"],
              ["clicked", "Clicked"],
              ["not_opened", "Not opened"],
              ["failed", "Failed"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold", filter === value ? "bg-ink text-paper" : "bg-gray-100 hover:bg-gray-200")}
            >
              {label}
            </button>
          ))}
        </div>
        {!recipients ? (
          <Skeleton className="h-40" />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-gray-200 text-xs text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Person</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Opens</th>
                  <th className="px-5 py-3 font-semibold">Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recipients.map((recipient) => (
                  <tr key={recipient._id}>
                    <td className="px-5 py-2.5">
                      <span className="block font-semibold">{recipient.name}</span>
                      <span className="block text-gray-500">{recipient.email}</span>
                    </td>
                    <td className="px-5 py-2.5">
                      {recipient.unsubscribedAt ? (
                        <Badge tone="warning">Unsubscribed</Badge>
                      ) : recipient.status === "sent" ? (
                        <Badge tone="success">Delivered</Badge>
                      ) : recipient.status === "failed" || recipient.status === "bounced" ? (
                        <span title={recipient.error}>
                          <Badge>{recipient.status === "bounced" ? "Bounced" : "Failed"}</Badge>
                        </span>
                      ) : (
                        <Badge tone="live">Queued</Badge>
                      )}
                    </td>
                    <td className="px-5 py-2.5 tabular-nums">{recipient.openCount}</td>
                    <td className="px-5 py-2.5 tabular-nums">{recipient.clickCount}</td>
                  </tr>
                ))}
                {recipients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-gray-500">
                      Nobody in this view yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
