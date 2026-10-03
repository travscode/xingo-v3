import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleBlock } from "@/components/marketing/seo/article-blocks";
import { Breadcrumbs } from "@/components/marketing/seo/breadcrumbs";
import { FaqSection } from "@/components/marketing/seo/faq-section";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { RichText } from "@/components/marketing/seo/rich-text";
import { MigrationDisclaimer } from "@/components/marketing/migration-disclaimer";
import { formatPostDate, sectionId } from "@/lib/blog/utils";
import {
  getAllMigrationGuides,
  getMigrationGuide,
  getRelatedGuides,
  guideReadingMinutes,
  guideWordCount,
  MIGRATION_GUIDES_ANCHOR,
  MIGRATION_HUB_PATH,
  MIGRATION_HUB_TITLE,
  migrationGuidePath,
} from "@/lib/migration-guides";
import { DEFAULT_OG_IMAGE, pageMetadata } from "@/lib/seo-metadata";
import { signUpHref } from "@/lib/seo-pages";
import { articleJsonLd, BLOG_AUTHOR } from "@/lib/structured-data";

/*
 * One page per migration guide (lib/migration-guides). General information only,
 * never migration advice — see the writing rules in lib/migration-guides/types.ts.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllMigrationGuides().map((guide) => ({ guide: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ guide: string }> }): Promise<Metadata> {
  const { guide: slug } = await params;
  const guide = getMigrationGuide(slug);
  if (!guide) return {};

  const path = migrationGuidePath(guide.slug);
  const base = pageMetadata({ title: guide.metaTitle, description: guide.description, path, type: "article" });
  return {
    ...base,
    keywords: guide.keywords,
    authors: [{ name: BLOG_AUTHOR }],
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: guide.published,
      modifiedTime: guide.updated,
      authors: [BLOG_AUTHOR],
      section: "Migrating to Australia",
      tags: guide.keywords,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function MigrationGuidePage({ params }: { params: Promise<{ guide: string }> }) {
  const { guide: slug } = await params;
  const guide = getMigrationGuide(slug);
  if (!guide) notFound();

  const path = migrationGuidePath(guide.slug);
  const related = getRelatedGuides(guide);
  const hubGuides = `${MIGRATION_HUB_PATH}#${MIGRATION_GUIDES_ANCHOR}`;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
      <Breadcrumbs
        crumbs={[
          { name: "Home", path: "/" },
          { name: MIGRATION_HUB_TITLE, path: MIGRATION_HUB_PATH },
          { name: guide.title, path },
        ]}
      />

      <article className="mx-auto mt-6 max-w-[42rem]">
        <header>
          <p className="eyebrow">Migration guide · {guide.group}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-balance sm:text-[2.6rem] sm:leading-[1.1]">
            {guide.title}
          </h1>
          <p className="mt-4 flex flex-wrap gap-x-2 text-sm text-gray-500">
            <span>By {BLOG_AUTHOR}</span>
            <span aria-hidden>·</span>
            <span>
              Updated <time dateTime={guide.updated}>{formatPostDate(guide.updated)}</time>
            </span>
            <span aria-hidden>·</span>
            <span>{guideReadingMinutes(guide)} min read</span>
          </p>
        </header>

        <div className="mt-8 space-y-5">
          {guide.intro.map((paragraph) => (
            <p key={paragraph} className="text-[17px] leading-7 text-gray-700">
              <RichText text={paragraph} />
            </p>
          ))}
        </div>

        <section aria-labelledby="at-a-glance" className="mt-8 rounded-xl border border-gray-200 p-5 sm:p-6">
          <h2 id="at-a-glance" className="text-sm font-bold uppercase tracking-[0.08em]">
            At a glance
          </h2>
          <ul className="mt-3 space-y-2.5">
            {guide.atAGlance.map((point) => (
              <li key={point} className="flex gap-3 text-[15px] leading-6 text-gray-700">
                <Check size={18} strokeWidth={2.5} className="mt-0.5 shrink-0 text-success" aria-hidden />
                <span>
                  <RichText text={point} />
                </span>
              </li>
            ))}
          </ul>
        </section>

        <MigrationDisclaimer className="mt-6" />

        {guide.image ? (
          <div className="relative mt-8 aspect-[3/2] overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src={guide.image.src}
              alt={guide.image.alt}
              fill
              priority
              sizes="(min-width: 768px) 672px, calc(100vw - 32px)"
              className="object-cover"
            />
          </div>
        ) : null}

        <nav aria-label="In this guide" className="mt-8 rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-bold">In this guide</p>
          <ol className="mt-2 space-y-1 text-sm">
            {guide.sections.map((section) => (
              <li key={section.heading}>
                <a href={`#${section.id ?? sectionId(section.heading)}`} className="text-gray-500 hover:text-ink">
                  {section.heading}
                </a>
              </li>
            ))}
            <li>
              <a href="#how-xingo-helps" className="text-gray-500 hover:text-ink">
                How XINGO helps
              </a>
            </li>
          </ol>
        </nav>

        {guide.sections.map((section) => (
          <section key={section.heading} id={section.id ?? sectionId(section.heading)} className="mt-10 scroll-mt-24">
            <h2 className="text-2xl font-bold tracking-[-0.03em]">{section.heading}</h2>
            <div className="mt-4 space-y-5">
              {section.blocks.map((block, blockIndex) => (
                <ArticleBlock key={blockIndex} block={block} />
              ))}
            </div>
          </section>
        ))}

        <section id="how-xingo-helps" className="mt-12 scroll-mt-24 rounded-2xl border border-gray-200 p-5 sm:p-7">
          <h2 className="text-2xl font-bold tracking-[-0.03em]">How XINGO helps</h2>
          <div className="mt-3 space-y-4">
            {guide.xingo.text.map((paragraph) => (
              <p key={paragraph} className="text-[16px] leading-7 text-gray-700">
                <RichText text={paragraph} />
              </p>
            ))}
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {guide.xingo.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="mk-lift group flex h-full flex-col rounded-xl bg-gray-50 p-4 hover:bg-gray-100">
                  <span className="inline-flex items-center gap-1.5 font-bold">
                    {link.label}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                  <span className="mt-1 text-sm leading-6 text-gray-500">{link.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12">
          <FaqSection title="Questions" faqs={guide.faqs} />
        </div>

        <aside aria-label="Start practising" className="mt-12 rounded-xl bg-ink p-6 text-paper sm:p-8">
          <p className="text-xl font-bold tracking-[-0.02em]">{guide.cta.title}</p>
          <p className="mt-2 text-[15px] leading-6 text-gray-300">{guide.cta.body}</p>
          <div className="mt-5">
            <Button asChild variant="accent" size="md">
              <Link href={signUpHref(guide.cta.goal)}>
                {guide.cta.buttonLabel ?? "Start practising free"} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </aside>

        <Link href={hubGuides} className="group mt-10 inline-flex items-center gap-2 text-[15px] font-semibold">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" aria-hidden />
          All migration guides
        </Link>

        <section aria-labelledby="sources-heading" className="mt-8 border-t border-gray-200 pt-6">
          <h2 id="sources-heading" className="text-sm font-bold">
            Official sources
          </h2>
          <ul className="mt-2 space-y-1.5 text-sm">
            {guide.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gray-500">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-5 text-gray-500">
            Checked {formatPostDate(guide.updated)}. Rules, fees and requirements change, so check the official source before you
            act. XINGO is independent and isn&apos;t affiliated with Home Affairs, NAATI, Ahpra or any test provider.
          </p>
          <MigrationDisclaimer className="mt-5" />
        </section>
      </article>

      {related.length ? (
        <section className="mx-auto mt-16 max-w-6xl" aria-labelledby="related-heading">
          <div className="flex items-end justify-between gap-4">
            <h2 id="related-heading" className="text-lg font-bold tracking-[-0.02em]">
              Related guides
            </h2>
            <Link href={hubGuides} className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold">
              All guides <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
          <ul className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={migrationGuidePath(item.slug)}
                  className="mk-lift flex h-full flex-col rounded-xl border border-gray-200 p-5 hover:border-ink"
                >
                  <span className="eyebrow">{item.group}</span>
                  <span className="mt-2 font-bold leading-6">{item.title}</span>
                  <span className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">{item.excerpt}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <JsonLd
        data={articleJsonLd({
          path,
          headline: guide.title,
          description: guide.description,
          datePublished: guide.published,
          dateModified: guide.updated,
          keywords: guide.keywords,
          section: "Migrating to Australia",
          wordCount: guideWordCount(guide),
        })}
      />
    </main>
  );
}
