import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { withTwoMLinks } from "@/components/marketing/two-m-link";

const TOKEN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * Renders blog inline markup: **bold** and [label](href). Everything else is plain
 * text, except that "2M Language Services" always links to 2m.com.au (XINGO's partner).
 */
export function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let last = 0;
  const plain = (value: string, key: number) => <Fragment key={`t${key}`}>{withTwoMLinks(value)}</Fragment>;

  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(plain(text.slice(last, index), last));

    if (match[1]) {
      nodes.push(
        <strong key={index} className="font-semibold text-ink">
          {match[1]}
        </strong>,
      );
    } else {
      const label = match[2];
      const href = match[3];
      nodes.push(
        href.startsWith("/") ? (
          <Link key={index} href={href} className="font-medium text-ink underline underline-offset-2 hover:text-gray-500">
            {label}
          </Link>
        ) : (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink underline underline-offset-2 hover:text-gray-500"
          >
            {label}
          </a>
        ),
      );
    }

    last = index + match[0].length;
  }

  if (last < text.length) nodes.push(plain(text.slice(last), last));
  return <>{nodes}</>;
}
