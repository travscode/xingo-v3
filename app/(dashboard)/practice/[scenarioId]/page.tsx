import { LivePracticeResults } from "@/components/practice/live-practice-results";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  return <LivePracticeResults scenarioId={scenarioId} />;
}
