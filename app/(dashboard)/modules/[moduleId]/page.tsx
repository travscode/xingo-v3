import { LiveModuleDetail } from "@/components/modules/live-module-detail";

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  return <LiveModuleDetail moduleId={moduleId} />;
}
