import { Suspense } from "react";
import { LiveModuleDetail } from "@/components/modules/live-module-detail";

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  return (
    // The unlock dialog reads ?status= when Stripe Checkout sends the learner back.
    <Suspense fallback={null}>
      <LiveModuleDetail moduleId={moduleId} />
    </Suspense>
  );
}
