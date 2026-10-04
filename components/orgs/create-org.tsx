"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Check, Globe, Lock, Mail } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { track } from "@/lib/analytics";
import { friendlyError } from "@/lib/errors";
import { handleProblem, normaliseHandle } from "@/lib/orgs";
import { slugify } from "@/lib/marketplace";
import { Button } from "@/components/ui/button";
import { Card, PageHeader } from "@/components/ui/primitives";
import { Field, TextInput } from "@/components/admin/content/fields";

const points = [
  { icon: Globe, title: "A team page", body: "Your courses live together at xingo.ai/<handle>, under your organisation's name." },
  {
    icon: Lock,
    title: "Public or invite only",
    body: "Group courses into collections. Anyone can open a public collection; invite-only collections are for the people you invite.",
  },
  { icon: Mail, title: "Your staff, by email", body: "Invite teammates to make courses with you, and learners to practise them." },
];

/** /marketplace/org/new: name + handle, then straight to the dashboard. */
export function CreateOrg() {
  const router = useRouter();
  const mine = useQuery(api.orgs.mine, {});
  const create = useMutation(api.orgs.create);
  const [name, setName] = useState("");
  const [handleInput, setHandleInput] = useState("");
  const [handleEdited, setHandleEdited] = useState(false);
  const [checking, setChecking] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suggest a handle from the name until the person types their own.
  const handle = normaliseHandle(handleEdited ? handleInput : slugify(name, 30));
  const localProblem = handle ? handleProblem(handle) : null;

  useEffect(() => {
    const timer = setTimeout(() => setChecking(handle), 250);
    return () => clearTimeout(timer);
  }, [handle]);

  const availability = useQuery(api.orgs.handleAvailable, checking && !localProblem ? { handle: checking } : "skip");
  const settled = checking === handle && availability !== undefined;
  const problem = localProblem ?? (settled && !availability.available ? availability.problem : null);
  const ready = name.trim().length > 1 && handle.length > 0 && settled && availability.available && !localProblem;

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await create({ displayName: name.trim(), handle });
      track("org_create", { handle: result.handle });
      router.push(`/marketplace/org/${result.handle}`);
    } catch (createError) {
      setError(friendlyError(createError));
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Marketplace
      </Link>
      <PageHeader
        title="Create an organisation"
        description="For schools, employers and training teams who make courses together and share them with their own learners."
      />

      <ul className="grid gap-3 sm:grid-cols-3">
        {points.map((point) => (
          <li key={point.title} className="rounded-xl bg-gray-50 p-4">
            <point.icon className="h-5 w-5" aria-hidden />
            <p className="mt-3 text-sm font-bold">{point.title}</p>
            <p className="mt-1 text-sm leading-6 text-gray-500">{point.body}</p>
          </li>
        ))}
      </ul>

      {mine && mine.length > 0 ? (
        <Card tone="muted" className="p-4 text-sm">
          <p className="font-semibold">You&apos;re already on {mine.length === 1 ? "a team" : "these teams"}:</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {mine.map((org) => (
              <li key={org.handle}>
                <Link href={`/marketplace/org/${org.handle}`} className="font-semibold underline underline-offset-2 hover:text-gray-700">
                  {org.displayName}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (ready && !saving) void submit();
        }}
      >
        <Field label="Organisation name" htmlFor="org-name" hint="e.g. Riverside TAFE, Sunrise Health">
          <TextInput id="org-name" autoFocus maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field
          label="Handle"
          htmlFor="org-handle"
          hint={
            <>
              Your page will be at <span className="font-semibold text-ink">xingo.ai/{handle || "your-handle"}</span>. You can&apos;t change it later.
            </>
          }
        >
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-gray-500">@</span>
            <TextInput
              id="org-handle"
              maxLength={31}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="pl-7"
              value={handleEdited ? handleInput : handle}
              aria-invalid={Boolean(problem)}
              aria-describedby="org-handle-status"
              onChange={(e) => {
                setHandleEdited(true);
                setHandleInput(e.target.value);
              }}
            />
          </div>
        </Field>
        <p id="org-handle-status" aria-live="polite" className="-mt-3 min-h-5 text-sm">
          {!handle ? null : problem ? (
            <span className="text-record">{problem}</span>
          ) : ready ? (
            <span className="inline-flex items-center gap-1 text-success">
              <Check className="h-4 w-4" aria-hidden /> Available
            </span>
          ) : (
            <span className="text-gray-500">Checking…</span>
          )}
        </p>

        {error ? <p className="rounded-lg bg-record/10 px-3 py-2 text-sm text-record">{error}</p> : null}

        <div className="border-t border-gray-200 pt-5">
          <Button type="submit" disabled={!ready || saving}>
            {saving ? "Creating…" : "Create organisation"}
          </Button>
          <p className="mt-3 text-sm text-gray-500">
            You&apos;ll be the owner. Next you can add courses, make collections and invite your team.
          </p>
        </div>
      </form>
    </div>
  );
}
