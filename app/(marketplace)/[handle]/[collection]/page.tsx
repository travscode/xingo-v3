import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrgCollectionPage } from "@/components/marketplace/org-page";
import { loadHandlePage } from "../load";

type Props = { params: Promise<{ handle: string; collection: string }> };

/**
 * Signed out, invite-only collections still appear (title, description, count) so visitors can
 * ask for access; a collection the public can't see at all is unknown here, so the client decides.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle, collection: slug } = await params;
  const page = await loadHandlePage(handle);
  if (page?.kind !== "organization") return { title: "Not found", robots: { index: false } };
  const collection = page.collections.find((item) => item.slug === slug);
  if (!collection) return { title: page.displayName, robots: { index: false } };
  const title = `${collection.title} | ${page.displayName}`;
  const description = collection.description || `Practice courses from ${page.displayName} on XINGO.`;
  return {
    title,
    description,
    alternates: { canonical: `/${page.handle}/${collection.slug}` },
    openGraph: { title, description, url: `/${page.handle}/${collection.slug}`, images: collection.bannerUrl ? [{ url: collection.bannerUrl }] : undefined },
    ...(collection.visibility === "invite" ? { robots: { index: false } } : {}),
  };
}

export default async function OrgCollectionRoute({ params }: Props) {
  const { handle, collection } = await params;
  const page = await loadHandlePage(handle);
  if (page?.kind !== "organization") notFound();
  return <OrgCollectionPage handle={page.handle} slug={decodeURIComponent(collection)} />;
}
