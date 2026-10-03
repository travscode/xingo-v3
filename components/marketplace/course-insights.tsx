"use client";

import { useQuery } from "convex/react";
import { BookmarkPlus, Clock, Eye, Mic, Users, Wallet } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { formatAud } from "@/lib/marketplace";
import { Card, Skeleton } from "@/components/ui/primitives";

function Bars({ values, label }: { values: Array<{ day: string; value: number }>; label: string }) {
  const max = Math.max(1, ...values.map((v) => v.value));
  return (
    <figure>
      <figcaption className="text-sm font-semibold">{label}</figcaption>
      <div className="mt-3 flex h-28 items-end gap-[3px]" role="img" aria-label={`${label}, last 30 days`}>
        {values.map((v) => (
          <div
            key={v.day}
            title={`${v.day}: ${v.value}`}
            className="flex-1 rounded-sm bg-ink/80"
            style={{ height: `${Math.max(2, (v.value / max) * 100)}%`, opacity: v.value === 0 ? 0.15 : 1 }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-500">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </figure>
  );
}

export function CourseInsights({ moduleId }: { moduleId: string }) {
  const data = useQuery(api.marketplace.courseAnalytics, { moduleId });

  if (!data) return <Skeleton className="h-80" />;

  const { totals, series } = data;
  const stats = [
    { label: "Page views", value: totals.views.toLocaleString("en-AU"), icon: Eye },
    { label: "Added to libraries", value: totals.adds.toLocaleString("en-AU"), icon: BookmarkPlus },
    { label: "Learners", value: totals.learners.toLocaleString("en-AU"), icon: Users },
    { label: "Sessions", value: totals.sessions.toLocaleString("en-AU"), icon: Mic },
    { label: "Minutes practised", value: totals.minutes.toLocaleString("en-AU"), icon: Clock },
    { label: "Earned", value: formatAud(totals.earnedCents), icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="flex items-center gap-1.5 text-sm text-gray-500">
              <stat.icon className="h-3.5 w-3.5" aria-hidden /> {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{stat.value}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <Bars label="Page views" values={series.map((s) => ({ day: s.day, value: s.views }))} />
        </Card>
        <Card className="p-5">
          <Bars label="Added" values={series.map((s) => ({ day: s.day, value: s.adds }))} />
        </Card>
        <Card className="p-5">
          <Bars label="Practice sessions" values={series.map((s) => ({ day: s.day, value: s.sessions }))} />
        </Card>
      </div>
      <p className="text-xs text-gray-500">Your own practice isn&apos;t counted. Earnings come from paid minutes only.</p>
    </div>
  );
}
