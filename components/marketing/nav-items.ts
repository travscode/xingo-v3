import { marketingNavigation } from "@/lib/navigation";

/**
 * Header links for the public site: the shared marketing navigation plus the
 * Marketplace, which goes to its public landing page (/sell-practice-courses).
 * The app (dashboard) navigation still links straight to /marketplace.
 */
export const marketingNavItems: ReadonlyArray<{ href: string; label: string }> = [
  ...marketingNavigation,
  { href: "/sell-practice-courses", label: "Marketplace" },
];
