import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand, MarketingIntro } from "@/components/marketing/cta-band";
import { blogPostPath, BLOG_PATH, getAllPosts, getCategories } from "@/lib/blog";
import { formatPostDate, readingTimeMinutes, sectionId } from "@/lib/blog/utils";
import { pageMetadata } from "@/lib/seo-metadata";
import { itemListJsonLd } from "@/lib/structured-data";
import { Breadcrumbs } from "@/components/marketing/seo/breadcrumbs";
import { JsonLd } from "@/components/marketing/seo/json-ld";

const title = "Guides for NAATI, OET, IELTS and Interpreting Tests";
const description =
  "Practical, plain-English guides to the NAATI CCL and CPI, OET Speaking, IELTS Speaking, the AMC clinical exam, the NMBA OSCE and medical interpreter oral exams.";

export const metadata: Metadata = pageMetadata({ title, description, path: BLOG_PATH });

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const categories = getCategories();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 pb-8 sm:px-6">
      <MarketingIntro
        breadcrumbs={
          <Breadcrumbs
            className="mb-6 sm:mb-8"
            crumbs={[
              { name: "Home", path: "/" },
              { name: "Guides", path: BLOG_PATH },
            ]}
          />
        }
        eyebrow="Guides"
        title="Test guides, written plainly."
        description="How the tests work, what examiners reward and how to practise — checked against the official sources and linked to them."
      />

      {categories.map((category) => {
        const inCategory = posts.filter((post) => post.category === category);
        return (
          <section key={category} aria-labelledby={`cat-${sectionId(category)}`}>
            <h2 id={`cat-${sectionId(category)}`} className="text-lg font-bold tracking-[-0.02em]">
              {category}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inCategory.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={blogPostPath(post.slug)}
                    className="mk-lift group flex h-full flex-col rounded-xl border border-gray-200 p-5 hover:border-ink"
                  >
                    <span className="font-bold leading-6">{post.title}</span>
                    <span className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-gray-500">{post.excerpt}</span>
                    <span className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <time dateTime={post.updated}>{formatPostDate(post.updated)}</time>
                      <span className="inline-flex items-center gap-1 font-semibold text-ink">
                        {readingTimeMinutes(post)} min read
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <CtaBand
        title="Reading helps. Speaking is what counts."
        description="Practise your test out loud with AI role-players and get scored feedback. Free minutes every month."
      />

      <JsonLd data={itemListJsonLd(posts.map((post) => ({ name: post.title, path: blogPostPath(post.slug) })))} />
    </main>
  );
}
