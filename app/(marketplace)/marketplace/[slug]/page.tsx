import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CourseListingPage } from "@/components/marketplace/listing-page";

type Props = { params: Promise<{ slug: string }> };

async function loadPublic(slug: string) {
  try {
    return await fetchQuery(api.marketplace.listing, { slug });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await loadPublic(slug);

  if (!listing) {
    return { title: "Course", robots: { index: false } };
  }

  const title = `${listing.title} | Practice course by ${listing.creatorName}`;
  const description = listing.tagline || `Spoken practice course by ${listing.creatorName} on XINGO.`;

  return {
    title,
    description,
    keywords: listing.keywords,
    alternates: { canonical: `/marketplace/${listing.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/marketplace/${listing.slug}`,
      images: listing.bannerUrl ? [{ url: listing.bannerUrl }] : undefined,
    },
    twitter: { card: listing.bannerUrl ? "summary_large_image" : "summary", title, description },
  };
}

export default async function CourseListingRoute({ params }: Props) {
  const { slug } = await params;
  const listing = await loadPublic(slug);
  const jsonLd = listing
    ? {
        "@context": "https://schema.org",
        "@type": "Course",
        name: listing.title,
        description: listing.tagline || listing.description.slice(0, 300),
        provider: { "@type": "Organization", name: listing.creatorName },
        url: `https://www.xingo.ai/marketplace/${listing.slug}`,
        keywords: listing.keywords.join(", "),
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "online",
          courseWorkload: `PT${Math.max(1, listing.totalMinutes)}M`,
        },
      }
    : null;

  return (
    <>
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      ) : null}
      <CourseListingPage slug={slug} />
    </>
  );
}
