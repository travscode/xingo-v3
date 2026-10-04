"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { BadgeCheck } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { track } from "@/lib/analytics";
import { friendlyError } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, PageHeader, Skeleton } from "@/components/ui/primitives";

export function OrgAvatar({ name, url, size = "md" }: { name: string; url: string | null; size?: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? "h-16 w-16 text-xl" : size === "sm" ? "h-8 w-8 text-xs" : "h-12 w-12 text-base";
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className={`${box} shrink-0 rounded-full object-cover`} />
  ) : (
    <span className={`${box} flex shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold`} aria-hidden>
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

/** /join/<token>: what an invitation is for, then sign in and accept. */
export function JoinInvitation({ token }: { token: string }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const invite = useQuery(api.orgs.invitation, { token });
  const accept = useMutation(api.orgs.acceptInvitation);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (invite === undefined || isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-10" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (invite === null || invite.status === "revoked" || invite.status === "declined") {
    return (
      <div className="mx-auto max-w-lg">
        <EmptyState
          title="This invitation isn't valid any more"
          description="It may have been withdrawn. Ask the organisation to send you a new one."
          action={
            <Button asChild>
              <Link href="/marketplace">Go to the marketplace</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const destination =
    invite.kind === "collection" && invite.collectionSlug ? `/${invite.orgHandle}/${invite.collectionSlug}` : invite.kind === "team" ? `/marketplace/org/${invite.orgHandle}` : `/${invite.orgHandle}`;
  const here = `/join/${token}`;
  const what =
    invite.kind === "collection"
      ? `You've been invited to practise ${invite.collectionTitle ?? "a collection of courses"}.`
      : `You've been invited to join the team as ${invite.role === "Admin" ? "an" : "a"} ${invite.role ?? "member"}.`;

  const onAccept = async () => {
    setAccepting(true);
    setError(null);
    try {
      const result = await accept({ token });
      track("invite_accept", { kind: result.team ? "team" : "collection", organisation: result.orgHandle });
      router.push(
        result.team || !result.collectionSlug ? `/marketplace/org/${result.orgHandle}` : `/${result.orgHandle}/${result.collectionSlug}`,
      );
    } catch (acceptError) {
      setError(friendlyError(acceptError));
      setAccepting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <OrgAvatar name={invite.orgName} url={invite.avatarUrl} size="lg" />
        <p className="flex items-center gap-1.5 text-lg font-bold">
          {invite.orgName}
          {invite.verified ? (
            <>
              <BadgeCheck className="h-5 w-5" aria-hidden />
              <span className="sr-only">Verified</span>
            </>
          ) : null}
        </p>
      </div>

      <PageHeader title="You're invited" description={what} />

      {invite.kind === "collection" && invite.collectionDescription ? (
        <Card tone="muted" className="p-4">
          <p className="font-semibold">{invite.collectionTitle}</p>
          <p className="mt-1 text-sm leading-6 text-gray-500">{invite.collectionDescription}</p>
        </Card>
      ) : null}

      <p className="text-sm text-gray-500">
        Sent to <span className="font-semibold text-ink">{invite.sentTo}</span>
      </p>

      {invite.acceptedByViewer ? (
        <div className="space-y-3">
          <p className="text-[15px]">You&apos;ve already accepted this invitation.</p>
          <Button asChild>
            <Link href={destination}>{invite.kind === "team" ? "Open the dashboard" : "Open the collection"}</Link>
          </Button>
        </div>
      ) : invite.status === "active" ? (
        <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
          This invitation has already been used. If it was meant for you, ask the organisation to send a new one.
        </p>
      ) : !isAuthenticated ? (
        <div className="space-y-3">
          <p className="text-[15px] text-gray-700">Log in or create a free account to accept. Use the email it was sent to if you can.</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`/sign-up?redirect=${encodeURIComponent(here)}`}>Create an account</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/sign-in?redirect=${encodeURIComponent(here)}`}>Log in</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Button size="lg" onClick={() => void onAccept()} disabled={accepting}>
            {accepting ? "Accepting…" : "Accept invitation"}
          </Button>
          {invite.kind === "collection" ? (
            <p className="text-sm text-gray-500">The courses are added to your library. Practice uses your minutes unless the organisation covers them.</p>
          ) : (
            <p className="text-sm text-gray-500">You&apos;ll be able to make courses and invite learners for {invite.orgName}.</p>
          )}
        </div>
      )}

      {error ? <p className="rounded-lg bg-record/10 px-3 py-2 text-sm text-record">{error}</p> : null}
    </div>
  );
}
