import { marketingNavigation } from "@/lib/navigation";

/**
 * Header links for the public site: the shared marketing navigation plus the
 * Marketplace, which is owned by the marketplace pages.
 */
export const marketingNavItems: ReadonlyArray<{ href: string; label: string }> = [
  ...marketingNavigation,
  { href: "/marketplace", label: "Marketplace" },
];
