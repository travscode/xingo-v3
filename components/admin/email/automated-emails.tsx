"use client";

import { useQuery } from "convex/react";
import { Mail, Repeat } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/primitives";

const customerEmails = [
  "Welcome (on sign-up)",
  "Minute pack bought",
  "Pro started",
  "Pro cancelled (ends on date)",
  "Pro ended",
  "Payment failed",
  "Out of minutes (once a month)",
  "Creator: course published",
  "Creator: course removed",
  "Creator: payouts set up",
  "Creator: payout sent",
];

/** Admin → Email: the emails XINGO sends automatically. */
export function AutomatedEmails() {
  const stats = useQuery(api.emails.automationStats, {});

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-5">
        <p className="flex items-center gap-2 font-bold">
          <Mail className="h-4 w-4" aria-hidden /> Customer emails
        </p>
        <p className="mt-1 text-sm text-gray-500">Sent automatically on account and billing events. Not affected by news opt-outs.</p>
        <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
          {customerEmails.map((item) => (
            <li key={item}>· {item}</li>
          ))}
        </ul>
      </Card>
      <Card className="p-5">
        <p className="flex items-center gap-2 font-bold">
          <Repeat className="h-4 w-4" aria-hidden /> 14-day onboarding series
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Days 1, 3, 5, 7, 9, 11 and 13 after sign-up, tailored to each learner&apos;s goal. Sent around 9am Sydney time; skipped for
          anyone who opted out of tips.
        </p>
        {stats ? (
          <>
            <p className="mt-3 text-sm">
              <span className="text-2xl font-bold tabular-nums">{stats.sent30d}</span>
              <span className="text-gray-500"> sent in the last 30 days{stats.failed30d ? ` · ${stats.failed30d} failed` : ""}</span>
            </p>
            {stats.byDay.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                {stats.byDay.map((row) => (
                  <span key={row.day} className="rounded-md bg-gray-100 px-2 py-1 tabular-nums">
                    Day {row.day}: {row.sent}
                  </span>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </Card>
    </div>
  );
}
