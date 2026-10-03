import { AdminGate } from "@/components/admin/admin-gate";
import { CampaignPage } from "@/components/admin/email/campaign-page";
import type { Id } from "@/convex/_generated/dataModel";

export const metadata = { title: "Email · Admin" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AdminGate>
      <CampaignPage id={id as Id<"emailCampaigns">} />
    </AdminGate>
  );
}
