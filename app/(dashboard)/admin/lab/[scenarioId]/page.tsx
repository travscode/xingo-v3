import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/admin-gate";
import { AutoSwitchRoom } from "@/components/admin/lab/auto-switch-room";

export const metadata: Metadata = { title: "Auto-switch lab · Admin", robots: { index: false } };

export default async function LabRoomPage({ params }: { params: Promise<{ scenarioId: string }> }) {
  const { scenarioId } = await params;
  return (
    <AdminGate>
      <AutoSwitchRoom scenarioId={scenarioId} />
    </AdminGate>
  );
}
