"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Check } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { friendlyError } from "@/lib/errors";
import { canManageOrg, MAX_INVITES_PER_BATCH, ORG_ROLE_LABELS, parseEmailList, type OrgRole } from "@/lib/orgs";
import { Button } from "@/components/ui/button";
import { Badge, Card, SectionTitle } from "@/components/ui/primitives";
import { Field, Select, TextArea } from "@/components/admin/content/fields";
import type { OrgDashboardData } from "@/components/orgs/org-dashboard";

const roleHelp: Record<OrgRole, string> = {
  owner: "Everything, including other owners",
  admin: "Team, profile and everything creators can do",
  creator: "Makes courses and collections, invites learners",
};

export function TeamTab({ data }: { data: OrgDashboardData }) {
  const router = useRouter();
  const setRole = useMutation(api.orgs.setMemberRole);
  const removeMember = useMutation(api.orgs.removeMember);
  const revoke = useMutation(api.orgs.revokeInvite);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const myRole = data.me.role;
  const manager = canManageOrg(myRole);

  const run = (id: string, action: () => Promise<unknown>) => {
    setBusy(id);
    setError(null);
    action()
      .catch((actionError) => setError(friendlyError(actionError)))
      .finally(() => setBusy(null));
  };

  const members = [...data.members].sort((a, b) => {
    const rank = { owner: 0, admin: 1, creator: 2 } as const;
    return rank[a.role] - rank[b.role] || a.name.localeCompare(b.name);
  });

  const leave = async () => {
    if (!window.confirm(`Leave ${data.org.displayName}? You'll lose access to its dashboard and private courses.`)) return;
    setBusy(data.me.clerkId);
    setError(null);
    try {
      await removeMember({ handle: data.org.handle, clerkId: data.me.clerkId });
      router.push("/marketplace");
    } catch (leaveError) {
      setError(friendlyError(leaveError));
      setBusy(null);
    }
  };

  return (
    <div className="space-y-8">
      {manager ? <TeamInviteBox handle={data.org.handle} /> : null}

      <section>
        <SectionTitle>Team ({members.length})</SectionTitle>
        {error ? <p className="mb-3 rounded-lg bg-record/10 px-3 py-2 text-sm text-record">{error}</p> : null}
        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
          {members.map((member) => {
            const self = member.clerkId === data.me.clerkId;
            // Only owners can touch owners or make new ones; the server enforces the same rule.
            const canEdit = manager && !self && (member.role !== "owner" || myRole === "owner");
            const roles: OrgRole[] = myRole === "owner" ? ["owner", "admin", "creator"] : ["admin", "creator"];
            return (
              <li key={member.clerkId} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {member.name}
                    {self ? <span className="font-normal text-gray-500"> (you)</span> : null}
                  </p>
                  <p className="truncate text-sm text-gray-500">{member.email}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {canEdit ? (
                    <Select
                      aria-label={`Role for ${member.name}`}
                      className="h-9 w-auto text-sm"
                      value={member.role}
                      disabled={busy === member.clerkId}
                      onChange={(e) => {
                        const role = e.target.value as OrgRole;
                        run(member.clerkId, () => setRole({ handle: data.org.handle, clerkId: member.clerkId, role }));
                      }}
                      options={roles.map((role) => ({ value: role, label: ORG_ROLE_LABELS[role] }))}
                    />
                  ) : (
                    <Badge tone={member.role === "owner" ? "dark" : "neutral"}>{ORG_ROLE_LABELS[member.role]}</Badge>
                  )}
                  {canEdit ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy === member.clerkId}
                      onClick={() => {
                        if (!window.confirm(`Remove ${member.name} from ${data.org.displayName}?`)) return;
                        run(member.clerkId, () => removeMember({ handle: data.org.handle, clerkId: member.clerkId }));
                      }}
                    >
                      Remove
                    </Button>
                  ) : null}
                  {self ? (
                    <Button size="sm" variant="ghost" disabled={busy === member.clerkId} onClick={() => void leave()}>
                      Leave organisation
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
        <dl className="mt-3 space-y-1 text-xs text-gray-500">
          {(Object.keys(roleHelp) as OrgRole[]).map((role) => (
            <div key={role}>
              <dt className="inline font-semibold text-gray-700">{ORG_ROLE_LABELS[role]}:</dt> <dd className="inline">{roleHelp[role]}</dd>
            </div>
          ))}
        </dl>
      </section>

      {manager && data.teamInvites.length > 0 ? (
        <section>
          <SectionTitle>Waiting to join ({data.teamInvites.length})</SectionTitle>
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
            {data.teamInvites.map((invite) => (
              <li key={invite.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{invite.email}</p>
                  <p className="text-sm text-gray-500">Invited as {ORG_ROLE_LABELS[invite.role]}</p>
                </div>
                <Button size="sm" variant="ghost" disabled={busy === invite.id} onClick={() => run(invite.id, () => revoke({ inviteId: invite.id }))}>
                  Withdraw invite
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function TeamInviteBox({ handle }: { handle: string }) {
  const inviteTeam = useMutation(api.orgs.inviteTeam);
  const [text, setText] = useState("");
  const [role, setRole] = useState<"admin" | "creator">("creator");
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
      const result = await inviteTeam({ handle, emails: parsed.emails, role });
      const parts = [
        result.invited ? `${result.invited} ${result.invited === 1 ? "invitation" : "invitations"} sent` : null,
        result.skipped ? `${result.skipped} already on the team` : null,
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
        label="Invite teammates"
        htmlFor="team-emails"
        hint="One email per line or separated by commas. They join when they sign in with that email or open the link we send."
      >
        <TextArea
          id="team-emails"
          rows={3}
          value={text}
          placeholder={"jo@example.com"}
          onChange={(e) => {
            setText(e.target.value);
            setSummary(null);
          }}
        />
      </Field>
      <Field label="Role" htmlFor="team-role" hint={roleHelp[role]} className="max-w-xs">
        <Select
          id="team-role"
          value={role}
          onChange={(e) => setRole(e.target.value as "admin" | "creator")}
          options={[
            { value: "creator", label: ORG_ROLE_LABELS.creator },
            { value: "admin", label: ORG_ROLE_LABELS.admin },
          ]}
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
        {sending ? "Sending…" : parsed.emails.length > 1 ? `Invite ${parsed.emails.length} teammates` : "Invite teammate"}
      </Button>
    </Card>
  );
}
