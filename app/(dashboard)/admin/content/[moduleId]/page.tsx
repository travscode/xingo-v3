import { Suspense } from "react";
import { AdminGate } from "@/components/admin/admin-gate";
import { ModulePage } from "@/components/admin/content/module-page";

export const metadata = { title: "Module · Admin" };

export default async function Page({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;

  return (
    <AdminGate>
      <Suspense fallback={null}>
        <ModulePage moduleId={moduleId} />
      </Suspense>
    </AdminGate>
  );
}
