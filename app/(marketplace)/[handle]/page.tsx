import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreatorPage } from "@/components/marketplace/creator-page";
import { OrgPage } from "@/components/marketplace/org-page";
import { creatorCanonicalPath } from "@/components/marketplace/verified-badge";
import { loadCreator, loadHandlePage } from "./load";

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const page = await loadHandlePage(handle);
  if (!page) return { title: "Not found", robots: { index: false } };

  if (page.kind === "person") {
    const creator = await loadCreator(page.handle);
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

  const title = `${page.displayName}: practice courses`;
  const description = page.tagline || `Spoken practice courses by ${page.displayName} on the XINGO marketplace.`;
  return {
    title,
    description,
    alternates: { canonical: `/${page.handle}` },
    openGraph: { title, description, url: `/${page.handle}`, images: page.bannerUrl ? [{ url: page.bannerUrl }] : undefined },
  };
}

/** xingo.ai/<handle>: an organisation's page, or a person's creator page. Static routes win over this. */
export default async function HandleRoute({ params }: Props) {
  const { handle } = await params;
  const page = await loadHandlePage(handle);
  if (!page) notFound();
  return page.kind === "person" ? <CreatorPage handle={page.handle} /> : <OrgPage handle={page.handle} />;
}
