/**
 * schema.org JSON-LD builders for public pages (docs/seo.md).
 *
 * Framework-free: each helper returns a plain object; render it with
 * `<JsonLd data={...} />` (components live next to the pages that use them) or
 * `JSON.stringify` it into a `<script type="application/ld+json">`.
 *
 * Rules: describe only what is on the page, never imply affiliation with an
 * exam body, and never add ratings/reviews we don't have.
 */

import { SITE_URL } from "./seo-pages";

export const ORGANIZATION_NAME = "XINGO";
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const BLOG_AUTHOR = "XINGO team";

type JsonLdObject = Record<string, unknown>;

/** Absolute URL for a site path ("/blog" → "https://www.xingo.ai/blog"). */
export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Serialises JSON-LD safely for inline <script> tags (escapes "<"). */
export function serializeJsonLd(data: JsonLdObject | JsonLdObject[]) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: ORGANIZATION_NAME,
    url: SITE_URL,
    email: "hello@xingo.ai",
    description:
      "Spoken practice for interpreting tests and English speaking exams with AI role-play partners and scored feedback.",
    areaServed: "AU",
  };
}

export function websiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: ORGANIZATION_NAME,
    url: SITE_URL,
    inLanguage: "en-AU",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function faqJsonLd(faqs: Array<{ q: string; a: string }>): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

export function articleJsonLd(article: {
  path: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  keywords?: string[];
  section?: string;
  wordCount?: number;
}): JsonLdObject {
  const url = absoluteUrl(article.path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: article.headline,
    description: article.description,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    inLanguage: "en-AU",
    author: { "@type": "Organization", name: BLOG_AUTHOR, url: SITE_URL },
    publisher: { "@id": ORGANIZATION_ID, "@type": "Organization", name: ORGANIZATION_NAME, url: SITE_URL },
    ...(article.section ? { articleSection: article.section } : {}),
    ...(article.keywords?.length ? { keywords: article.keywords.join(", ") } : {}),
    ...(article.wordCount ? { wordCount: article.wordCount } : {}),
  };
}

/** A blog index or other list of links. */
export function itemListJsonLd(items: Array<{ name: string; path: string }>): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

/**
 * A practice course offered by XINGO. Use only for pages that describe one of
 * our own courses — never for the exam itself (we don't run exams).
 */
export function courseJsonLd(course: {
  name: string;
  description: string;
  path: string;
  /** e.g. "NAATI CCL test preparation". */
  teaches?: string;
  inLanguage?: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    description: course.description,
    url: absoluteUrl(course.path),
    inLanguage: course.inLanguage ?? "en-AU",
    provider: { "@type": "Organization", "@id": ORGANIZATION_ID, name: ORGANIZATION_NAME, url: SITE_URL },
    ...(course.teaches ? { teaches: course.teaches } : {}),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "Self-paced",
    },
    // Free monthly minutes + a free preview dialogue; full access is paid (lib/plans.ts).
    offers: {
      "@type": "Offer",
      category: "Partially Free",
      priceCurrency: "AUD",
      url: absoluteUrl(course.path),
    },
  };
}

/**
 * A marketing page that describes a service we offer (e.g. staff training for
 * organisations): WebPage whose main entity is a Service provided by XINGO.
 * No offers or prices — pages using this sell through a conversation.
 */
export function servicePageJsonLd(page: {
  path: string;
  name: string;
  description: string;
  /** e.g. "Staff communication training". */
  serviceType: string;
  /** Who it's for, e.g. "Employers and organisations". */
  audience: string;
}): JsonLdObject {
  const url = absoluteUrl(page.path);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: page.name,
    description: page.description,
    inLanguage: "en-AU",
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "Service",
      name: page.name,
      description: page.description,
      serviceType: page.serviceType,
      url,
      provider: { "@type": "Organization", "@id": ORGANIZATION_ID, name: ORGANIZATION_NAME, url: SITE_URL },
      audience: { "@type": "BusinessAudience", name: page.audience },
      areaServed: "AU",
    },
  };
}

/**
 * A plain marketing page (e.g. the marketplace landing): WebPage, optionally with
 * an ordered list of steps as its main entity. No offers, prices or ratings.
 */
export function webPageJsonLd(page: {
  path: string;
  name: string;
  description: string;
  /** What the page is about, e.g. "Creating and selling practice courses". */
  about?: string;
  /** Ordered steps shown on the page (rendered as an ItemList). */
  steps?: Array<{ name: string; description: string }>;
}): JsonLdObject {
  const url = absoluteUrl(page.path);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: page.name,
    description: page.description,
    inLanguage: "en-AU",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    ...(page.about ? { about: { "@type": "Thing", name: page.about } } : {}),
    ...(page.steps?.length
      ? {
          mainEntity: {
            "@type": "ItemList",
            itemListOrder: "https://schema.org/ItemListOrderAscending",
            itemListElement: page.steps.map((step, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: step.name,
              description: step.description,
            })),
          },
        }
      : {}),
  };
}
