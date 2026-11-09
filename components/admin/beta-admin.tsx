"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge, Card, EmptyState, SectionTitle, Skeleton, Stat } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { BETA_MAX_BATCH, BETA_TARGET_DIALOGUES, parseEmailList } from "@/lib/beta";
import { friendlyError } from "@/lib/errors";
import { formatMinuteCount } from "@/lib/plans";

const TOP_UP_MINUTES = 30;

function shortDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "—";
}

/** Paste a list, check it, send invites, then watch how far each person gets (D-049). */
export function BetaAdmin() {
  const data = useQuery(api.beta.listInvites, {});
  const sendInvites = useMutation(api.beta.sendInvites);
  const sendTest = useMutation(api.beta.sendTestInvite);
  const remind = useMutation(api.beta.remind);
  const endBeta = useMutation(api.beta.endBeta);
  const grantMinutes = useMutation(api.admin.grantMinutes);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const parsed = parseEmailList(text);
  const checks = useQuery(api.beta.checkEmails, parsed.emails.length > 0 ? { emails: parsed.emails.slice(0, BETA_MAX_BATCH) } : "skip");
  const count = (status: NonNullable<typeof checks>[number]["status"]) => checks?.filter((row) => row.status === status).length ?? 0;
  const sendable = count("ready") + count("has_account");
  const tooMany = parsed.emails.length > BETA_MAX_BATCH;

  const run = async (action: () => Promise<string>) => {
    setMessage(null);
    try {
      setMessage(await action());
    } catch (error) {
      setMessage(friendlyError(error));
    }
  };

  const send = async () => {
    if (!window.confirm(`Send the beta invite to ${sendable} ${sendable === 1 ? "person" : "people"}? This can't be undone.`)) return;
    setSending(true);
    await run(async () => {
      const result = await sendInvites({ emails: parsed.emails });
      setText("");
      return `${result.queued} ${result.queued === 1 ? "invite is" : "invites are"} on the way${result.skipped ? `, ${result.skipped} skipped` : ""}.`;
    });
    setSending(false);
  };

  const invites = data?.invites ?? [];
  const joined = invites.filter((invite) => invite.status === "accepted");
  const reachedTarget = joined.filter((invite) => invite.scoredDialogues >= BETA_TARGET_DIALOGUES);
  const surveyed = joined.filter((invite) => invite.surveysAnswered > 0);
  const anyActive = joined.some((invite) => !invite.ended);

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <p className="text-lg font-bold">Invite beta testers</p>
        <p className="mt-1 text-sm text-gray-500">Paste email addresses, one per line. Nothing is sent until you confirm.</p>
        <textarea
          rows={7}
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Email addresses"
          placeholder={"name@example.com\nsomeone@example.com"}
          className="mt-4 w-full rounded-lg bg-gray-100 p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-live"
        />
        {text.trim() ? (
          <div className="mt-3 space-y-1 text-sm">
            <p>
              <strong>{checks ? sendable : "…"} ready to send</strong>
              {count("has_account") ? ` (${count("has_account")} already have accounts and join straight away)` : ""}
            </p>
            {count("already_invited") ? <p className="text-gray-500">{count("already_invited")} already invited, will be skipped</p> : null}
            {count("opted_out") ? <p className="text-gray-500">{count("opted_out")} unsubscribed from emails, will be skipped</p> : null}
            {parsed.duplicates ? <p className="text-gray-500">{parsed.duplicates} duplicates removed</p> : null}
            {parsed.invalid.length ? <p className="text-record">Not valid: {parsed.invalid.join(", ")}</p> : null}
            {tooMany ? <p className="text-record">Send at most {BETA_MAX_BATCH} at a time.</p> : null}
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button disabled={!checks || sendable === 0 || tooMany || sending} onClick={() => void send()}>
            {sending ? "Sending…" : sendable ? `Send ${sendable} ${sendable === 1 ? "invite" : "invites"}` : "Send invites"}
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              void run(async () => {
                const result = await sendTest({});
                return `Test invite sent to ${result.email}. Its link won't add anyone to the beta.`;
              })
            }
          >
            Send me a test
          </Button>
        </div>
        {message ? <p className="mt-4 text-sm">{message}</p> : null}
      </Card>

      {data && invites.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat label="Invited" value={invites.length} />
          <Stat label="Joined" value={joined.length} />
          <Stat label={`Did ${BETA_TARGET_DIALOGUES}+ dialogues`} value={reachedTarget.length} />
          <Stat label="Answered a survey" value={surveyed.length} />
        </div>
      ) : null}

      <section>
        <SectionTitle
          action={
            anyActive ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (window.confirm("End the beta for everyone? They lose beta access and the feedback button. Their scores and comments are kept.")) {
                    void run(async () => `Beta ended for ${(await endBeta({})).ended} people.`);
                  }
                }}
              >
                End beta
              </Button>
            ) : undefined
          }
        >
          Testers
        </SectionTitle>
        {!data ? (
          <Skeleton className="h-32" />
        ) : invites.length === 0 ? (
          <EmptyState title="No invites yet" />
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-gray-200 text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Person</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Dialogues</th>
                  <th className="px-4 py-3 font-semibold">Surveys</th>
                  <th className="px-4 py-3 font-semibold">Comments</th>
                  <th className="px-4 py-3 font-semibold">Minutes left</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invites.map((invite) => (
                  <tr key={invite._id}>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{invite.email}</span>
                      {invite.name ? <span className="block text-xs text-gray-500">{invite.name}</span> : null}
                    </td>
                    <td className="px-4 py-3">
                      {invite.sendError ? (
                        <Badge tone="warning">Not delivered</Badge>
                      ) : invite.status === "unsubscribed" ? (
                        <Badge>Unsubscribed</Badge>
                      ) : invite.ended ? (
                        <Badge>Ended</Badge>
                      ) : invite.status === "accepted" ? (
                        <Badge tone="success">Joined {shortDate(invite.acceptedAt)}</Badge>
                      ) : (
                        <Badge>Invited {shortDate(invite.sentAt ?? invite.createdAt)}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {invite.status === "accepted" ? `${invite.scoredDialogues} of ${data.totalDialogues}` : "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{invite.status === "accepted" ? invite.surveysAnswered : "—"}</td>
                    <td className="px-4 py-3 tabular-nums">{invite.status === "accepted" ? invite.feedbackCount : "—"}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {invite.remainingMinutes !== null ? formatMinuteCount(invite.remainingMinutes) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {invite.status === "invited" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={Boolean(invite.remindedAt)}
                          onClick={() => void run(async () => ((await remind({ inviteId: invite._id })).queued ? `Reminder sent to ${invite.email}.` : "Already reminded."))}
                        >
                          {invite.remindedAt ? "Reminded" : "Remind"}
                        </Button>
                      ) : invite.clerkId && !invite.ended ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            void run(async () => {
                              await grantMinutes({ clerkId: invite.clerkId!, minutes: TOP_UP_MINUTES, note: "Beta top-up" });
                              return `Added ${TOP_UP_MINUTES} minutes for ${invite.email}.`;
                            })
                          }
                        >
                          +{TOP_UP_MINUTES} min
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>
    </div>
  );
}
