import { LivePractice } from "@/components/practice/live-practice";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  return <LivePractice scenarioId={scenarioId} />;
}
