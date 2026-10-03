import { BadgeCheck } from "lucide-react";
import { handleProblem } from "@/lib/orgs";
import { cn } from "@/lib/utils";

/**
 * The verified tick (D-039): XINGO has checked this creator or organisation is who they say.
 * Ink on light surfaces (colour is for meaning only, and this is identity, not status);
 * pass `className="text-paper"` on dark surfaces.
 */
export function VerifiedBadge({ className, size = "sm" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span
      role="img"
      aria-label="Verified by XINGO"
      title="Verified by XINGO"
      className={cn("inline-flex shrink-0 items-center text-ink", className)}
    >
      <BadgeCheck
        className={cn(size === "sm" && "h-3.5 w-3.5", size === "md" && "h-4 w-4", size === "lg" && "h-6 w-6")}
        aria-hidden
      />
    </span>
  );
}

/** Where a creator's name links: organisations live at /<handle>, people at their creator page. */
export function creatorHref(handle: string, isOrganization?: boolean) {
  return isOrganization ? `/${handle}` : `/marketplace/creators/${handle}`;
}

/** Canonical URL for a creator page: xingo.ai/<handle> when the handle is free at the top level (D-039). */
export function creatorCanonicalPath(handle: string) {
  return handleProblem(handle) ? `/marketplace/creators/${handle}` : `/${handle}`;
}
