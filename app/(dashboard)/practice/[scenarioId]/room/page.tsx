import { redirect } from "next/navigation";

export default async function LegacyRoomPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  redirect(`/practice/${scenarioId}`);
}
