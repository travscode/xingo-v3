import type { Metadata } from "next";
import { JoinInvitation } from "@/components/orgs/join-invitation";

export const metadata: Metadata = { title: "Invitation", robots: { index: false } };

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <JoinInvitation token={token} />;
}
