import { BetaStart } from "@/components/beta/beta-start";

export const metadata = { title: "Joining the beta", robots: { index: false } };

export default async function BetaStartPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <BetaStart token={token} />;
}
