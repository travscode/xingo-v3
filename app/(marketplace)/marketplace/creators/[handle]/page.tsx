import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CreatorPage } from "@/components/marketplace/creator-page";

type Props = { params: Promise<{ handle: string }> };

async function load(handle: string) {
  try {
    return await fetchQuery(api.creators.profile, { handle });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const creator = await load(handle);
  if (!creator) return { title: "Creator", robots: { index: false } };
  const title = `${creator.displayName}: practice courses`;
  const description = creator.tagline || `Spoken practice courses by ${creator.displayName} on the XINGO marketplace.`;
  return {
    title,
    description,
    alternates: { canonical: `/marketplace/creators/${creator.handle}` },
    openGraph: { title, description, url: `/marketplace/creators/${creator.handle}`, images: creator.bannerUrl ? [{ url: creator.bannerUrl }] : undefined },
  };
}

export default async function CreatorRoute({ params }: Props) {
  const { handle } = await params;
  return <CreatorPage handle={handle} />;
}
