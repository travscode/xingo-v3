import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { DashboardShell } from "@/components/dashboard/shell";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { AppProviders } from "@/components/providers/app-providers";
import { MARKETPLACE_OPEN } from "@/lib/marketplace";

/**
 * While the marketplace is closed (D-043) only platform admins get in. Convex enforces
 * this on every query and mutation; this just keeps everyone else off the empty pages.
 */
async function canEnterClosedMarketplace(getToken: (options: { template: string }) => Promise<string | null>) {
  try {
    const token = await getToken({ template: "convex" });
    if (!token) return false;
    const me = await fetchQuery(api.users.me, {}, { token });
    return Boolean(me?.marketplaceOpen);
  } catch {
    return false;
  }
}

/**
 * The marketplace is public (and indexable), but signed-in people browse it inside
 * the app so it feels like part of their library.
 */
export default async function MarketplaceLayout({ children }: { children: ReactNode }) {
  // Paths the proxy skips (e.g. "/something.png" falling through to /[handle]) have no Clerk
  // context; render them signed out so the 404 shows instead of an error.
  const session = await auth().catch(() => null);
  const userId = session?.userId ?? null;

  if (!MARKETPLACE_OPEN) {
    if (!session || !userId) notFound();
    if (!(await canEnterClosedMarketplace(session.getToken))) redirect("/courses");
  }

  return (
    <AppProviders>
      {userId ? (
        <DashboardShell>{children}</DashboardShell>
      ) : (
        <MarketingShell>
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">{children}</div>
        </MarketingShell>
      )}
    </AppProviders>
  );
}
