import { marketingNavigation } from "@/lib/navigation";
import { MARKETPLACE_OPEN } from "@/lib/marketplace";

/**
 * Header links for the public site: the shared marketing navigation plus the
 * Marketplace, which goes to its public landing page (/sell-practice-courses), while
 * the marketplace is open (D-043). The app (dashboard) navigation links straight to /marketplace.
 */
export const marketingNavItems: ReadonlyArray<{ href: string; label: string }> = [
  ...marketingNavigation,
  ...(MARKETPLACE_OPEN ? [{ href: "/sell-practice-courses", label: "Marketplace" }] : []),
];
