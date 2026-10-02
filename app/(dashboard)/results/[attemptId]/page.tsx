import { LiveResults } from "@/components/practice/live-results";

export const metadata = { title: "Results" };

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  return <LiveResults attemptId={attemptId} />;
}
