import { cache } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CreatorPage } from "@/components/marketplace/creator-page";
import { creatorCanonicalPath } from "@/components/marketplace/verified-badge";

type Props = { params: Promise<{ handle: string }> };

const load = cache(async (handle: string) => {
  try {
    return await fetchQuery(api.creators.profile, { handle });
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const creator = await load(handle);
  if (!creator) return { title: "Creator", robots: { index: false } };
  const title = `${creator.displayName}: practice courses`;
  const description = creator.tagline || `Spoken practice courses by ${creator.displayName} on the XINGO marketplace.`;
  return {
    title,
    description,
    alternates: { canonical: creatorCanonicalPath(creator.handle) },
    openGraph: { title, description, url: creatorCanonicalPath(creator.handle), images: creator.bannerUrl ? [{ url: creator.bannerUrl }] : undefined },
  };
}

export default async function CreatorRoute({ params }: Props) {
  const { handle } = await params;
  // Organisations have their own page with collections.
  const creator = await load(handle);
  if (creator?.isOrganization) redirect(`/${creator.handle}`);
  return <CreatorPage handle={handle} />;
}
