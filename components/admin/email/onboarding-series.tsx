"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Pencil, RotateCcw } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { friendlyError } from "@/lib/errors";
import { plans } from "@/lib/plans";
import {
  buildOnboardingEmail,
  buildOnboardingFromOverride,
  onboardingOverrideFrom,
  sampleOnboardingContext,
} from "@/lib/email/onboarding-content";
import {
  ONBOARDING_DAYS,
  ONBOARDING_TRACKS,
  type OnboardingDay,
  type OnboardingOverride,
  type OnboardingTrack,
} from "@/lib/email/onboarding-types";
import { cn } from "@/lib/utils";
import { Badge, PageHeader, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Breadcrumbs, Field, FormSection, Select, TextArea, TextInput } from "@/components/admin/content/fields";
import { EmailPreview } from "@/components/admin/email/email-preview";

type Stage = "new" | "practised";
type Stats = { sent: number; tracked: number; opened: number; clicked: number };

function percent(part: number, whole: number) {
  return whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—";
}

function siteUrl() {
  return typeof window === "undefined" ? "https://www.xingo.ai" : window.location.origin;
}

/** Admin → Email → Onboarding series: results, preview and edits for each email. */
export function OnboardingSeries({ adminName, adminEmail }: { adminName: string; adminEmail: string }) {
  const report = useQuery(api.emails.onboardingReport, {});
  const [track, setTrack] = useState<OnboardingTrack>("ccl");
  const [day, setDay] = useState<OnboardingDay>(1);
  const [stage, setStage] = useState<Stage>("new");
  const [editing, setEditing] = useState<OnboardingOverride | null>(null);

  const overrideFor = (t: OnboardingTrack, d: OnboardingDay) => report?.overrides.find((o) => o.track === t && o.day === d) ?? null;

  const automatic = useMemo(
    () => buildOnboardingEmail(day, track, sampleOnboardingContext(track, stage, siteUrl(), plans.free.monthlyMinutes)),
    [day, stage, track],
  );
  const saved = overrideFor(track, day);
  const shown = editing ?? saved;
  const email = shown ? buildOnboardingFromOverride(shown, siteUrl()) : automatic;

  if (!report) {
    return <Skeleton className="h-96" />;
  }

  const select = (nextTrack: OnboardingTrack, nextDay: OnboardingDay) => {
    if (editing && !window.confirm("Discard your unsaved changes?")) return;
    setEditing(null);
    setTrack(nextTrack);
    setDay(nextDay);
  };

  const totals = ONBOARDING_DAYS.reduce<Stats>(
    (sum, d) => {
      const s = report.stats[`${track}:${d}`];
      return s ? { sent: sum.sent + s.sent, tracked: sum.tracked + s.tracked, opened: sum.opened + s.opened, clicked: sum.clicked + s.clicked } : sum;
    },
    { sent: 0, tracked: 0, opened: 0, clicked: 0 },
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Email", href: "/admin?tab=email" }, { label: "Onboarding series" }]} />
      <PageHeader
        title="Onboarding series"
        description="Seven emails over a learner's first two weeks, on a pathway that matches their goal. Preview each one, see how it's doing, and edit it if you need to."
      />

      <div className="max-w-md">
        <Field label="Pathway" htmlFor="onboarding-track" hint="Learners get the pathway for the goal they chose at sign-up.">
          <Select
            id="onboarding-track"
            value={track}
            onChange={(event) => select(event.target.value as OnboardingTrack, day)}
            options={ONBOARDING_TRACKS.map((t) => ({ value: t.id, label: t.label }))}
          />
        </Field>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-gray-200 text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Subject</th>
              <th className="px-4 py-3 text-right font-semibold">Sent</th>
              <th className="px-4 py-3 text-right font-semibold">Opened</th>
              <th className="px-4 py-3 text-right font-semibold">Clicked</th>
            </tr>
          </thead>
          <tbody>
            {ONBOARDING_DAYS.map((d) => {
              const stats = report.stats[`${track}:${d}`];
              const override = overrideFor(track, d);
              const subject =
                override?.subject ??
                buildOnboardingEmail(d, track, sampleOnboardingContext(track, "new", siteUrl(), plans.free.monthlyMinutes)).subject;
              const active = d === day;
              return (
                <tr
                  key={d}
                  onClick={() => select(track, d)}
                  className={cn("cursor-pointer border-b border-gray-200 last:border-0", active ? "bg-gray-100" : "hover:bg-gray-50")}
                >
                  <td className="whitespace-nowrap px-4 py-3 font-semibold">
                    <button type="button" className="text-left" aria-pressed={active} onClick={() => select(track, d)}>
                      Day {d}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span className="truncate">{subject.replace(/\{\{\s*firstName\s*\}\}/g, "Alex")}</span>
                      {override ? <Badge>Edited</Badge> : null}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{stats?.sent ?? 0}</td>
                  <StatCell part={stats?.opened ?? 0} whole={stats?.tracked ?? 0} />
                  <StatCell part={stats?.clicked ?? 0} whole={stats?.tracked ?? 0} />
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t border-gray-200 font-semibold">
            <tr>
              <td className="px-4 py-3" colSpan={2}>
                All seven
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{totals.sent}</td>
              <StatCell part={totals.opened} whole={totals.tracked} />
              <StatCell part={totals.clicked} whole={totals.tracked} />
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-xs leading-5 text-gray-500">
        {report.trackingSince
          ? `Opens and clicks are counted from ${new Date(report.trackingSince).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}, so rates use only the emails sent since then.`
          : "Opens and clicks are counted from the next emails sent; earlier emails show only as sent."}{" "}
        Some email apps load images
        automatically, which counts as an open, so the open rate runs high. Clicks are the more reliable number.
      </p>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="min-w-0 space-y-5">
          {editing ? (
            <EditForm
              track={track}
              day={day}
              edit={editing}
              onChange={setEditing}
              onDone={() => setEditing(null)}
            />
          ) : (
            <Details
              track={track}
              day={day}
              edited={Boolean(saved)}
              stage={stage}
              onStage={setStage}
              onEdit={() => setEditing(saved ?? onboardingOverrideFrom(automatic, siteUrl()))}
            />
          )}
        </div>
        <div className="min-w-0 xl:sticky xl:top-6 xl:h-fit">
          <EmailPreview
            templateId={email.templateId}
            content={email.content}
            subject={email.subject.replace(/\{\{\s*firstName\s*\}\}/g, adminName.split(" ")[0] || "there")}
            preheader={email.preheader}
            fromName="XINGO"
            recipientName={adminName}
            recipientEmail={adminEmail}
          />
        </div>
      </div>
    </div>
  );
}

function StatCell({ part, whole }: { part: number; whole: number }) {
  return (
    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
      {whole > 0 ? (
        <>
          {part} <span className="text-gray-500">({percent(part, whole)})</span>
        </>
      ) : (
        <span className="text-gray-500">—</span>
      )}
    </td>
  );
}

function Details({
  track,
  day,
  edited,
  stage,
  onStage,
  onEdit,
}: {
  track: OnboardingTrack;
  day: OnboardingDay;
  edited: boolean;
  stage: Stage;
  onStage: (stage: Stage) => void;
  onEdit: () => void;
}) {
  const label = ONBOARDING_TRACKS.find((t) => t.id === track)?.label ?? track;
  return (
    <FormSection title={`Day ${day} · ${label}`}>
      {edited ? (
        <p className="text-sm leading-6">
          This email has been <strong>edited</strong>. Everyone on this pathway gets your version, with their first name filled in.
        </p>
      ) : (
        <>
          <p className="text-sm leading-6">
            This is the <strong>automatic</strong> version. It fills in details for each learner, such as their language, how many
            sessions they&apos;ve done and their best score, so it can read differently from person to person.
          </p>
          <Field label="Preview as">
            <div className="flex rounded-lg bg-gray-100 p-0.5 text-sm font-semibold" role="radiogroup">
              {(
                [
                  ["new", "Hasn't practised yet"],
                  ["practised", "Has done 3 sessions"],
                ] as const
              ).map(([value, text]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={stage === value}
                  onClick={() => onStage(value)}
                  className={cn("flex-1 rounded-md px-3 py-2", stage === value ? "bg-paper shadow-sm" : "text-gray-500")}
                >
                  {text}
                </button>
              ))}
            </div>
          </Field>
          <p className="text-xs leading-5 text-gray-500">The preview uses a sample learner. Your name stands in for theirs.</p>
        </>
      )}
      <div>
        <Button onClick={onEdit}>
          <Pencil className="h-4 w-4" /> Edit this email
        </Button>
      </div>
    </FormSection>
  );
}

function EditForm({
  track,
  day,
  edit,
  onChange,
  onDone,
}: {
  track: OnboardingTrack;
  day: OnboardingDay;
  edit: OnboardingOverride;
  onChange: (edit: OnboardingOverride) => void;
  onDone: () => void;
}) {
  const save = useMutation(api.emails.saveOnboardingOverride);
  const reset = useMutation(api.emails.resetOnboardingOverride);
  const report = useQuery(api.emails.onboardingReport, {});
  const hasSaved = Boolean(report?.overrides.some((o) => o.track === track && o.day === day));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<OnboardingOverride>) => onChange({ ...edit, ...patch });

  const run = async (work: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await work();
      onDone();
    } catch (caught) {
      setError(friendlyError(caught));
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormSection
      title={`Edit day ${day}`}
      description="Your version replaces the automatic one for everyone on this pathway, from the next send. Personal details such as their score or language won't be filled in."
    >
      <Field label="Subject line" required htmlFor="ob-subject" hint={`${edit.subject.length} characters. Aim for under 50 so it isn't cut off on phones.`}>
        <TextInput id="ob-subject" value={edit.subject} onChange={(event) => set({ subject: event.target.value })} />
      </Field>
      <Field label="Preview text" htmlFor="ob-preheader" hint="Shown after the subject in most inboxes.">
        <TextInput id="ob-preheader" value={edit.preheader} onChange={(event) => set({ preheader: event.target.value })} />
      </Field>
      <Field
        label="Email text"
        required
        htmlFor="ob-body"
        hint={
          <>
            Leave a blank line between paragraphs. Start a line with &ldquo;- &rdquo; for a bullet. **bold**, [link text](/courses).
            &#123;&#123;firstName&#125;&#125; becomes the learner&apos;s first name.
          </>
        }
      >
        <TextArea id="ob-body" rows={18} value={edit.body} onChange={(event) => set({ body: event.target.value })} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Button text" htmlFor="ob-cta-label" hint="Leave empty for no button.">
          <TextInput id="ob-cta-label" value={edit.ctaLabel} onChange={(event) => set({ ctaLabel: event.target.value })} />
        </Field>
        <Field label="Button link" htmlFor="ob-cta-url" hint="A XINGO page like /courses, or a full https:// link.">
          <TextInput id="ob-cta-url" value={edit.ctaUrl} onChange={(event) => set({ ctaUrl: event.target.value })} />
        </Field>
      </div>
      {error ? <p className="text-sm text-record">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={busy} onClick={() => void run(() => save({ track, day, ...edit }))}>
          {busy ? "Saving…" : "Save"}
        </Button>
        <Button variant="ghost" disabled={busy} onClick={onDone}>
          Cancel
        </Button>
        {hasSaved ? (
          <Button
            variant="ghost"
            className="ml-auto"
            disabled={busy}
            onClick={() => {
              if (window.confirm("Go back to the automatic version? Your edits will be deleted.")) void run(() => reset({ track, day }));
            }}
          >
            <RotateCcw className="h-4 w-4" /> Use automatic version
          </Button>
        ) : null}
      </div>
    </FormSection>
  );
}
