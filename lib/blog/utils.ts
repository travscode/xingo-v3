import type { BlogBlock, BlogPost } from "./types";

const WORDS_PER_MINUTE = 220;

/** Strips the inline markup (**bold**, [label](href)) used in blog text. */
export function plainText(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
}

function blockText(block: BlogBlock): string {
  switch (block.type) {
    case "p":
    case "callout":
      return `${"title" in block && block.title ? block.title : ""} ${block.text}`;
    case "ul":
    case "ol":
      return block.items.join(" ");
    case "table":
      return [...block.head, ...block.rows.flat()].join(" ");
    case "example":
      return block.lines.map((line) => line.text).join(" ");
  }
}

export function postWordCount(post: BlogPost) {
  const text = [
    ...post.intro,
    ...post.sections.flatMap((section) => [section.heading, ...section.blocks.map(blockText)]),
    ...(post.faqs ?? []).flatMap((faq) => [faq.q, faq.a]),
  ]
    .map(plainText)
    .join(" ");

  return text.split(/\s+/).filter(Boolean).length;
}

export function readingTimeMinutes(post: BlogPost) {
  return Math.max(1, Math.round(postWordCount(post) / WORDS_PER_MINUTE));
}

export function sectionId(heading: string) {
  return plainText(heading)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPostDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
