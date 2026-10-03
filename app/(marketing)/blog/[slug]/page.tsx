import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { blogPostPath, BLOG_PATH, getAllPosts, getPost, getRelatedPosts } from "@/lib/blog";
import { formatPostDate, postWordCount, readingTimeMinutes, sectionId } from "@/lib/blog/utils";
import { DEFAULT_OG_IMAGE } from "@/lib/seo-metadata";
import { signUpHref } from "@/lib/seo-pages";
import { articleJsonLd, BLOG_AUTHOR, faqJsonLd } from "@/lib/structured-data";
import { ArticleBlock } from "@/components/marketing/seo/article-blocks";
import { Breadcrumbs } from "@/components/marketing/seo/breadcrumbs";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { RichText } from "@/components/marketing/seo/rich-text";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const path = blogPostPath(post.slug);
  return {
    title: post.metaTitle,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: BLOG_AUTHOR }],
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: path,
      siteName: "XINGO",
      locale: "en_AU",
      publishedTime: post.published,
      modifiedTime: post.updated,
      authors: [BLOG_AUTHOR],
      section: post.category,
      tags: post.keywords,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images: [DEFAULT_OG_IMAGE.url] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const path = blogPostPath(post.slug);
  const related = getRelatedPosts(post);
  const minutes = readingTimeMinutes(post);
  const ctaHref = signUpHref(post.cta.goal);
  const midpoint = Math.ceil(post.sections.length / 2);

  const cta = (
    <aside aria-label="Practise this" className="rounded-xl bg-ink p-6 text-paper sm:p-8">
      <p className="text-xl font-bold tracking-[-0.02em]">{post.cta.title}</p>
      <p className="mt-2 text-[15px] leading-6 text-gray-300">{post.cta.body}</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button asChild variant="accent" size="md">
          <Link href={ctaHref}>
            {post.cta.buttonLabel ?? "Start practising free"} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Link href={post.cta.pagePath} className="text-sm font-semibold text-gray-300 underline underline-offset-2 hover:text-paper">
          {post.cta.pageLabel}
        </Link>
      </div>
    </aside>
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
      <Breadcrumbs
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Guides", path: BLOG_PATH },
          { name: post.title, path },
        ]}
      />

      <article className="mx-auto mt-6 max-w-[42rem]">
        <header>
          <p className="eyebrow">{post.category}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-balance sm:text-[2.6rem] sm:leading-[1.1]">
            {post.title}
          </h1>
          <p className="mt-4 flex flex-wrap gap-x-2 text-sm text-gray-500">
            <span>By {BLOG_AUTHOR}</span>
            <span aria-hidden>·</span>
            <span>
              Updated <time dateTime={post.updated}>{formatPostDate(post.updated)}</time>
            </span>
            <span aria-hidden>·</span>
            <span>{minutes} min read</span>
          </p>
        </header>

        <div className="mt-8 space-y-5">
          {post.intro.map((paragraph) => (
            <p key={paragraph} className="text-[17px] leading-7 text-gray-700">
              <RichText text={paragraph} />
            </p>
          ))}
        </div>

        {post.sections.length > 3 ? (
          <nav aria-label="In this guide" className="mt-8 rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-bold">In this guide</p>
            <ol className="mt-2 space-y-1 text-sm">
              {post.sections.map((section) => (
                <li key={section.heading}>
                  <a href={`#${section.id ?? sectionId(section.heading)}`} className="text-gray-500 hover:text-ink">
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        {post.sections.map((section, index) => (
          <div key={section.heading}>
            {index === midpoint && post.sections.length > 4 ? <div className="mt-10">{cta}</div> : null}
            <section id={section.id ?? sectionId(section.heading)} className="mt-10 scroll-mt-24">
              <h2 className="text-2xl font-bold tracking-[-0.03em]">{section.heading}</h2>
              <div className="mt-4 space-y-5">
                {section.blocks.map((block, blockIndex) => (
                  <ArticleBlock key={blockIndex} block={block} />
                ))}
              </div>
            </section>
          </div>
        ))}

        {post.faqs?.length ? (
          <section className="mt-12">
            <h2 className="text-2xl font-bold tracking-[-0.03em]">Questions</h2>
            <dl className="mt-4 divide-y divide-gray-200 rounded-xl border border-gray-200">
              {post.faqs.map((faq) => (
                <div key={faq.q} className="px-5 py-4">
                  <dt className="font-bold">{faq.q}</dt>
                  <dd className="mt-2 text-[15px] leading-6 text-gray-700">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <div className="mt-12">{cta}</div>

        <section className="mt-12 border-t border-gray-200 pt-6">
          <h2 className="text-sm font-bold">Official sources</h2>
          <ul className="mt-2 space-y-1.5 text-sm">
            {post.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gray-500">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-5 text-gray-500">
            Exam rules, fees and dates change. Always check the official source before you book. XINGO is independent and
            not affiliated with NAATI or any exam body.
          </p>
        </section>
      </article>

      {related.length ? (
        <section className="mx-auto mt-16 max-w-6xl" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-lg font-bold tracking-[-0.02em]">
            Related guides
          </h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={blogPostPath(item.slug)}
                  className="mk-lift flex h-full flex-col rounded-xl border border-gray-200 p-5 hover:border-ink"
                >
                  <span className="eyebrow">{item.category}</span>
                  <span className="mt-2 font-bold leading-6">{item.title}</span>
                  <span className="mt-2 text-xs text-gray-500">{readingTimeMinutes(item)} min read</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <JsonLd
        data={articleJsonLd({
          path,
          headline: post.title,
          description: post.description,
          datePublished: post.published,
          dateModified: post.updated,
          keywords: post.keywords,
          section: post.category,
          wordCount: postWordCount(post),
        })}
      />
      {post.faqs?.length ? <JsonLd data={faqJsonLd(post.faqs)} /> : null}
    </main>
  );
}
