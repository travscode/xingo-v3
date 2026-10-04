"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { Check, ExternalLink, Globe, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { track } from "@/lib/analytics";
import type { Id } from "@/convex/_generated/dataModel";
import { friendlyError } from "@/lib/errors";
import { canManageOrg, MAX_INVITES_PER_BATCH, parseEmailList } from "@/lib/orgs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge, Card, EmptyState, SectionTitle, Skeleton } from "@/components/ui/primitives";
import { Field, Select, TextArea, TextInput } from "@/components/admin/content/fields";
import { ImageUpload } from "@/components/marketplace/image-upload";
import type { OrgDashboardData, OrgTabId } from "@/components/orgs/org-dashboard";

type Go = (tab: OrgTabId, extra?: Record<string, string>) => void;
type Collection = OrgDashboardData["collections"][number];
type Visibility = "public" | "invite";

const visibilityChoices: { id: Visibility; label: string; body: string; icon: typeof Globe }[] = [
  { id: "public", label: "Public", body: "Anyone can find these courses and add them to their library.", icon: Globe },
  { id: "invite", label: "Invite only", body: "Only people you invite (or approve) can see and practise these courses.", icon: Lock },
];

// ---- Collections ---------------------------------------------------------------------

export function CollectionsTab({ data, go }: { data: OrgDashboardData; go: Go }) {
  const [editing, setEditing] = useState<Collection | "new" | null>(null);
  const deleteCollection = useMutation(api.orgs.deleteCollection);
  const [error, setError] = useState<string | null>(null);
  const manager = canManageOrg(data.me.role);

  if (editing) {
    return (
      <CollectionForm
        key={editing === "new" ? "new" : editing.id}
        data={data}
        collection={editing === "new" ? null : editing}
        onDone={() => setEditing(null)}
      />
    );
  }

  if (data.collections.length === 0) {
    return (
      <EmptyState
        title="No collections yet"
        description="A collection groups courses for one audience, like new starters or a class. Make it public, or invite only for the people you choose."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" aria-hidden /> New collection
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" aria-hidden /> New collection
        </Button>
      </div>
      {error ? <p className="rounded-lg bg-record/10 px-3 py-2 text-sm text-record">{error}</p> : null}
      <ul className="space-y-3">
        {data.collections.map((collection) => (
          <li key={collection.id}>
            <Card className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{collection.title}</p>
                    <Badge tone={collection.visibility === "public" ? "neutral" : "dark"}>
                      {collection.visibility === "public" ? <Globe className="h-3 w-3" aria-hidden /> : <Lock className="h-3 w-3" aria-hidden />}
                      {collection.visibility === "public" ? "Public" : "Invite only"}
                    </Badge>
                  </div>
                  {collection.description ? <p className="mt-1 text-sm text-gray-500">{collection.description}</p> : null}
                  <p className="mt-2 text-xs tabular-nums text-gray-500">
                    {collection.moduleIds.length} {collection.moduleIds.length === 1 ? "course" : "courses"} · {collection.counts.active} with access
                    {collection.counts.invited ? ` · ${collection.counts.invited} invited` : ""}
                    {collection.counts.requested ? ` · ${collection.counts.requested} waiting` : ""}
                  </p>
                  <Link
                    href={`/${data.org.handle}/${collection.slug}`}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-ink"
                  >
                    xingo.ai/{data.org.handle}/{collection.slug} <ExternalLink className="h-3 w-3" aria-hidden />
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => go("people", { collection: collection.id })}>
                    People
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(collection)}>
                    <Pencil className="h-4 w-4" aria-hidden /> Edit
                  </Button>
                  {manager ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Delete ${collection.title}`}
                      onClick={() => {
                        if (
                          !window.confirm(
                            `Delete "${collection.title}"? Its invitations are withdrawn and learners lose access to its courses. The courses themselves are kept.`,
                          )
                        )
                          return;
                        setError(null);
                        deleteCollection({ collectionId: collection.id }).catch((deleteError) => setError(friendlyError(deleteError)));
                      }}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CollectionForm({ data, collection, onDone }: { data: OrgDashboardData; collection: Collection | null; onDone: () => void }) {
  const save = useMutation(api.orgs.saveCollection);
  const [title, setTitle] = useState(collection?.title ?? "");
  const [description, setDescription] = useState(collection?.description ?? "");
  const [visibility, setVisibility] = useState<Visibility>(collection?.visibility ?? "invite");
  const [selected, setSelected] = useState<Set<string>>(new Set(collection?.moduleIds ?? []));
  // id: undefined = unchanged, null = removed, otherwise a new upload.
  const [banner, setBanner] = useState<{ id: Id<"_storage"> | null | undefined; preview: string | null }>({
    id: undefined,
    preview: collection?.bannerUrl ?? null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (moduleId: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await save({
        handle: data.org.handle,
        ...(collection ? { collectionId: collection.id } : {}),
        title: title.trim(),
        description: description.trim(),
        visibility,
        moduleIds: data.courses.filter((course) => selected.has(course.moduleId)).map((course) => course.moduleId),
        ...(banner.id !== undefined ? { bannerStorageId: banner.id } : {}),
      });
      track("collection_save", { created: !collection, visibility, courses: selected.size });
      onDone();
    } catch (saveError) {
      setError(friendlyError(saveError));
      setSaving(false);
    }
  };

  return (
    <form
      className="max-w-2xl space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (title.trim()) void submit();
      }}
    >
      <SectionTitle>{collection ? "Edit collection" : "New collection"}</SectionTitle>
      <Field label="Title" htmlFor="col-title" hint="e.g. New starter training, Year 11 Japanese">
        <TextInput id="col-title" autoFocus maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Description (optional)" htmlFor="col-description" hint="Who it's for and what they'll practise.">
        <TextArea id="col-description" rows={3} maxLength={400} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>

      <fieldset className="space-y-2">
        <legend className="mb-1.5 text-sm font-semibold">Who can see it</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {visibilityChoices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              aria-pressed={visibility === choice.id}
              onClick={() => setVisibility(choice.id)}
              className={cn(
                "flex flex-col rounded-xl border-2 p-4 text-left",
                visibility === choice.id ? "border-ink" : "border-gray-200 hover:border-gray-400",
              )}
            >
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold">
                  <choice.icon className="h-4 w-4" aria-hidden /> {choice.label}
                </span>
                {visibility === choice.id ? <Check className="h-4 w-4" aria-hidden /> : null}
              </span>
              <span className="mt-1 text-sm text-gray-500">{choice.body}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <Field label="Banner (optional)">
        <ImageUpload
          label="banner"
          value={banner.id ?? undefined}
          previewUrl={banner.preview}
          onChange={(id, preview) => setBanner({ id: id ?? null, preview })}
        />
      </Field>

      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold">Courses</legend>
        {data.courses.length === 0 ? (
          <p className="rounded-lg bg-gray-50 px-3 py-3 text-sm text-gray-500">
            Your organisation has no courses yet. You can save the collection now and add courses later.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
              {data.courses.map((course) => (
                <li key={course.moduleId}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-black"
                      checked={selected.has(course.moduleId)}
                      onChange={() => toggle(course.moduleId)}
                    />
                    <span className="min-w-0 flex-1 truncate text-[15px]">{course.title}</span>
                    {course.status !== "published" ? <Badge>{course.status === "draft" ? "Draft" : "Taken down"}</Badge> : null}
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-xs text-gray-500">Only published courses appear to learners. Drafts show up once you publish them.</p>
          </>
        )}
      </fieldset>

      {error ? <p className="rounded-lg bg-record/10 px-3 py-2 text-sm text-record">{error}</p> : null}
      <div className="flex gap-2 border-t border-gray-200 pt-5">
        <Button type="submit" disabled={!title.trim() || saving}>
          {saving ? "Saving…" : collection ? "Save collection" : "Create collection"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ---- People --------------------------------------------------------------------------

const statusLabels = {
  invited: { label: "Invited", tone: "neutral" },
  requested: { label: "Requested", tone: "warning" },
  active: { label: "Active", tone: "success" },
  declined: { label: "Declined", tone: "neutral" },
  revoked: { label: "Removed", tone: "neutral" },
} as const;

export function PeopleTab({ data, collectionId, go }: { data: OrgDashboardData; collectionId: string | null; go: Go }) {
  if (data.collections.length === 0) {
    return (
      <EmptyState
        title="Make a collection first"
        description="People get access to collections. Create one, then invite learners to it here."
        action={<Button onClick={() => go("collections")}>Go to collections</Button>}
      />
    );
  }

  const collection = data.collections.find((item) => item.id === collectionId) ?? data.collections[0];

  return (
    <div className="space-y-6">
      <Field label="Collection" htmlFor="people-collection" className="max-w-sm">
        <Select
          id="people-collection"
          value={collection.id}
          onChange={(e) => go("people", { collection: e.target.value })}
          options={data.collections.map((item) => ({
            value: item.id,
            label: `${item.title}${item.counts.requested ? ` (${item.counts.requested} waiting)` : ""}`,
          }))}
        />
      </Field>
      {collection.visibility === "public" ? (
        <p className="text-sm text-gray-500">
          This collection is public, so anyone can open it. Inviting people still emails them the link, and its courses go into their library when they accept.
        </p>
      ) : null}
      <InviteBox key={`invite-${collection.id}`} collection={collection} />
      <PeopleList key={`list-${collection.id}`} collectionId={collection.id} />
    </div>
  );
}

function InviteBox({ collection }: { collection: Collection }) {
  const invite = useMutation(api.orgs.inviteToCollection);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const parsed = parseEmailList(text);
  const tooMany = parsed.emails.length > MAX_INVITES_PER_BATCH;

  const send = async () => {
    setSending(true);
    setError(null);
    setSummary(null);
    try {
      const result = await invite({ collectionId: collection.id, emails: parsed.emails });
      track("org_invite_send", { kind: "collection", invited: result.invited, approved: result.approved });
      const parts = [
        result.invited ? `${result.invited} ${result.invited === 1 ? "invitation" : "invitations"} sent` : null,
        result.approved ? `${result.approved} waiting ${result.approved === 1 ? "request" : "requests"} approved` : null,
        result.alreadyIn ? `${result.alreadyIn} already had access` : null,
      ].filter(Boolean);
      setSummary(parts.length ? `${parts.join(", ")}.` : "Nobody new to invite.");
      setText("");
    } catch (sendError) {
      setError(friendlyError(sendError));
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="space-y-3 p-4 sm:p-5">
      <Field
        label={`Invite people to ${collection.title}`}
        htmlFor="invite-emails"
        hint="Paste email addresses, one per line or separated by commas. They get access when they sign in with that email or open the link we send."
      >
        <TextArea
          id="invite-emails"
          rows={4}
          value={text}
          placeholder={"sam@example.com\nalex@example.com"}
          onChange={(e) => {
            setText(e.target.value);
            setSummary(null);
          }}
        />
      </Field>
      {text.trim() ? (
        <div className="space-y-1 text-sm" aria-live="polite">
          <p className="tabular-nums">
            {parsed.emails.length} {parsed.emails.length === 1 ? "email" : "emails"} found
          </p>
          {parsed.invalid.length ? (
            <p className="text-record">
              {parsed.invalid.length === 1 ? "This doesn't" : "These don't"} look like an email: {parsed.invalid.slice(0, 5).join(", ")}
              {parsed.invalid.length > 5 ? ` and ${parsed.invalid.length - 5} more` : ""}
            </p>
          ) : null}
          {tooMany ? <p className="text-record">You can invite up to {MAX_INVITES_PER_BATCH} people at a time.</p> : null}
        </div>
      ) : null}
      {error ? <p className="rounded-lg bg-record/10 px-3 py-2 text-sm text-record">{error}</p> : null}
      {summary ? (
        <p className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-sm" aria-live="polite">
          <Check className="h-4 w-4 text-success" aria-hidden /> {summary}
        </p>
      ) : null}
      <Button onClick={() => void send()} disabled={parsed.emails.length === 0 || tooMany || sending}>
        {sending ? "Sending…" : parsed.emails.length > 1 ? `Send ${parsed.emails.length} invites` : "Send invite"}
      </Button>
    </Card>
  );
}

function PeopleList({ collectionId }: { collectionId: Id<"orgCollections"> }) {
  const people = useQuery(api.orgs.collectionPeople, { collectionId });
  const respond = useMutation(api.orgs.respondToRequest);
  const revoke = useMutation(api.orgs.revokeInvite);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const run = (id: string, action: () => Promise<unknown>) => {
    setBusy(id);
    setError(null);
    action()
      .catch((actionError) => setError(friendlyError(actionError)))
      .finally(() => setBusy(null));
  };

  if (people === undefined) return <Skeleton className="h-40" />;
  if (people.length === 0) {
    return <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">Nobody has been invited yet.</p>;
  }

  // Requests first, then everyone else in the order the server gives (most recent first).
  const sorted = [...people].sort((a, b) => Number(b.status === "requested") - Number(a.status === "requested"));

  return (
    <section>
      <SectionTitle>People ({people.length})</SectionTitle>
      {error ? <p className="mb-3 rounded-lg bg-record/10 px-3 py-2 text-sm text-record">{error}</p> : null}
      <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
        {sorted.map((person) => {
          const status = statusLabels[person.status];
          return (
            <li key={person.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold">{person.name ?? person.email}</p>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
                {person.name ? <p className="truncate text-sm text-gray-500">{person.email}</p> : null}
                {person.status === "requested" && person.note ? (
                  <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">&ldquo;{person.note}&rdquo;</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {person.status === "requested" ? (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy === person.id}
                      onClick={() => run(person.id, () => respond({ inviteId: person.id, approve: true }))}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy === person.id}
                      onClick={() => run(person.id, () => respond({ inviteId: person.id, approve: false }))}
                    >
                      Decline
                    </Button>
                  </>
                ) : null}
                {person.status === "invited" ? (
                  <Button size="sm" variant="ghost" disabled={busy === person.id} onClick={() => run(person.id, () => revoke({ inviteId: person.id }))}>
                    Withdraw invite
                  </Button>
                ) : null}
                {person.status === "active" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy === person.id}
                    onClick={() => {
                      if (!window.confirm(`Remove ${person.name ?? person.email}'s access to this collection? Its invite-only courses leave their library.`)) return;
                      run(person.id, () => revoke({ inviteId: person.id }));
                    }}
                  >
                    Remove access
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
