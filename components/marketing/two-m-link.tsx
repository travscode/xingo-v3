import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const TWO_M_NAME = "2M Language Services";
export const TWO_M_URL = "https://www.2m.com.au/";

/** "2M Language Services", linking to 2m.com.au (XINGO's partner). Opens in a new tab. */
export function TwoMLink({ className, children = TWO_M_NAME }: { className?: string; children?: ReactNode }) {
  return (
    <a
      href={TWO_M_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("font-semibold text-ink underline decoration-1 underline-offset-2 hover:decoration-2", className)}
    >
      {children}
    </a>
  );
}

/** Renders text with every "2M Language Services" turned into a link (for copy kept as plain strings). */
export function withTwoMLinks(text: string, className?: string): ReactNode {
  if (!text.includes(TWO_M_NAME)) return text;
  const parts = text.split(TWO_M_NAME);
  return parts.flatMap((part, index) =>
    index === 0 ? [part] : [<TwoMLink key={index} className={className} />, part],
  );
}
