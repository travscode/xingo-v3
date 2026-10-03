"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { ExternalLink, Pencil } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { friendlyError } from "@/lib/errors";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Field, TextArea, TextInput } from "@/components/admin/content/fields";

/** "Your creator page": link to the public profile and an inline editor. */
export function CreatorProfileEditor() {
  const mine = useQuery(api.creators.mine, {});
  const update = useMutation(api.creators.updateMine);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: "", tagline: "", bio: "", location: "", accent: "#111111" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!mine) return null;

  if (!editing) {
    return (
      <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 shrink-0 rounded-full" style={{ backgroundColor: mine.accent }} aria-hidden />
          <div>
            <p className="font-semibold">Your creator page</p>
            <p className="text-sm text-gray-500">{mine.tagline || "Add a tagline and bio so learners know who's behind your courses."}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/marketplace/creators/${mine.handle}`}>
              <ExternalLink className="h-4 w-4" aria-hidden /> View
            </Link>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setForm({ displayName: mine.displayName, tagline: mine.tagline, bio: mine.bio, location: mine.location, accent: mine.accent });
              setEditing(true);
            }}
          >
            <Pencil className="h-4 w-4" aria-hidden /> Edit
          </Button>
        </div>
      </Card>
    );
  }

  const set = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }));

  return (
    <Card className="space-y-4 p-5">
      <p className="font-semibold">Edit your creator page</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="cp-name">
          <TextInput id="cp-name" maxLength={80} value={form.displayName} onChange={(e) => set({ displayName: e.target.value })} />
        </Field>
        <Field label="Location (optional)" htmlFor="cp-location">
          <TextInput id="cp-location" maxLength={60} value={form.location} onChange={(e) => set({ location: e.target.value })} placeholder="e.g. Brisbane" />
        </Field>
      </div>
      <Field label="Tagline" htmlFor="cp-tagline" hint="One line about what you teach.">
        <TextInput id="cp-tagline" maxLength={140} value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} />
      </Field>
      <Field label="About you" htmlFor="cp-bio">
        <TextArea id="cp-bio" rows={5} maxLength={1200} value={form.bio} onChange={(e) => set({ bio: e.target.value })} />
      </Field>
      <Field label="Brand colour" htmlFor="cp-accent">
        <input id="cp-accent" type="color" value={form.accent} onChange={(e) => set({ accent: e.target.value })} className="h-10 w-16 rounded border border-gray-200" />
      </Field>
      {error ? <p className="text-sm text-record">{error}</p> : null}
      <div className="flex gap-2">
        <Button
          disabled={saving}
          onClick={() => {
            setSaving(true);
            setError(null);
            update({ ...form, location: form.location || undefined })
              .then(() => setEditing(false))
              .catch((saveError) => setError(friendlyError(saveError)))
              .finally(() => setSaving(false));
          }}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}
