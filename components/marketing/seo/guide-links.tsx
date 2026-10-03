import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { blogPostPath, getPost, getPostsForPage, type BlogPost } from "@/lib/blog";

/**
 * "Guides" row linking a landing page to its blog articles. Pass `pagePath` to
 * list the posts whose CTA points at that page, or `slugs` to pick them.
 */
export function GuideLinks({
  pagePath,
  slugs,
  title = "Guides",
  extra,
}: {
  pagePath?: string;
  slugs?: string[];
  title?: string;
  /** Additional non-blog links (e.g. the CCL vocabulary page), shown first. */
  extra?: Array<{ href: string; title: string; description: string }>;
}) {
  const posts: BlogPost[] = slugs
    ? slugs.map((slug) => getPost(slug)).filter((post): post is BlogPost => post !== null)
    : pagePath
      ? getPostsForPage(pagePath, 3)
      : [];
  const items = [
    ...(extra ?? []),
    ...posts.map((post) => ({ href: blogPostPath(post.slug), title: post.title, description: post.excerpt })),
  ];

  if (!items.length) return null;

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{title}</h2>
        <Link href="/blog" className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold">
          All guides <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      <ul className={`mt-6 grid gap-3 ${items.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}>
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="mk-lift flex h-full flex-col rounded-xl border border-gray-200 p-5 hover:border-ink">
              <span className="font-bold leading-6">{item.title}</span>
              <span className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">{item.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
