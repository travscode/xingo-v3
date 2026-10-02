import { AdminGate } from "@/components/admin/admin-gate";
import { DialogueEditorPage } from "@/components/admin/content/dialogue-editor";

export const metadata = { title: "Dialogue · Admin" };

/** `/admin/content/<module>/new` creates a dialogue; any other id edits one. */
export default async function Page({ params }: { params: Promise<{ moduleId: string; scenarioId: string }> }) {
  const { moduleId, scenarioId } = await params;

  return (
    <AdminGate>
      <DialogueEditorPage moduleId={moduleId} scenarioId={scenarioId === "new" ? undefined : scenarioId} />
    </AdminGate>
  );
}
