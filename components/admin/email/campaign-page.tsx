"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { EmptyState, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { CampaignEditor } from "@/components/admin/email/campaign-editor";
import { CampaignReport } from "@/components/admin/email/campaign-report";

/** Drafts open in the editor; anything sent or sending shows its report. */
export function CampaignPage({ id }: { id: Id<"emailCampaigns"> }) {
  const data = useQuery(api.emails.getCampaign, { id });
  const me = useQuery(api.users.me, {});

  if (data === undefined || me === undefined) {
    return <Skeleton className="h-96" />;
  }

  if (data === null) {
    return (
      <EmptyState
        title="Email not found"
        action={
          <Button asChild>
            <Link href="/admin?tab=email">Back to email</Link>
          </Button>
        }
      />
    );
  }

  const adminName = me?.user.name ?? "Admin";
  const adminEmail = me?.user.email ?? "";

  return data.campaign.status === "draft" ? (
    <CampaignEditor key={data.campaign._id} campaign={data.campaign} adminName={adminName} adminEmail={adminEmail} />
  ) : (
    <CampaignReport campaign={data.campaign} stats={data.stats} linkStats={data.linkStats} adminName={adminName} adminEmail={adminEmail} />
  );
}
