import { redirect } from "next/navigation";
import { LivePractice } from "@/components/practice/live-practice";

export default async function PracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ scenarioId: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}) {
  const { scenarioId } = await params;
  const { attemptId } = await searchParams;

  // Pre-v4 links pointed results at /practice/<id>?attemptId=...
  if (attemptId) {
    redirect(`/results/${attemptId}`);
  }

  return <LivePractice scenarioId={scenarioId} />;
}
