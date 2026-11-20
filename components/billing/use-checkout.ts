"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { rememberCheckout, takePendingCheckout, track, type AnalyticsItem } from "@/lib/analytics";
import { friendlyError } from "@/lib/errors";
import { CURRENCY_LABEL, packs, plans, type PackId } from "@/lib/plans";

/**
 * Starts Stripe Checkout for a pack or Pro and reports the GA funnel
 * (checkout_start, then purchase or checkout_cancel when Stripe sends the learner back).
 * `cancelPath` is where Stripe returns them if they back out; success always lands on /billing.
 */
export function useCheckout({ cancelPath }: { cancelPath?: string } = {}) {
  const createCheckout = useAction(api.billing.createCheckout);
  const createPortal = useAction(api.billing.createPortal);
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reportedReturnRef = useRef(false);

  // Back from Stripe Checkout: report the purchase (or the cancel) once.
  useEffect(() => {
    if (reportedReturnRef.current || (status !== "success" && status !== "cancelled")) return;
    reportedReturnRef.current = true;
    const item = takePendingCheckout();

    if (status === "cancelled") {
      track("checkout_cancel", { kind: item?.item_category, item_id: item?.item_id });
      return;
    }
    if (!item) return; // Refreshed the page, or a different tab started checkout.

    track("purchase", {
      transaction_id: searchParams.get("session_id") ?? undefined,
      value: item.price,
      currency: CURRENCY_LABEL,
      kind: item.item_category,
      items: [item],
    });
  }, [searchParams, status]);

  const go = async (key: string, run: () => Promise<{ url: string }>) => {
    setPending(key);
    setError(null);

    try {
      const { url } = await run();
      window.location.assign(url);
    } catch (checkoutError) {
      setError(friendlyError(checkoutError));
      setPending(null);
    }
  };

  const startCheckout = (item: AnalyticsItem) => {
    rememberCheckout(item);
    track("checkout_start", {
      kind: item.item_category,
      pack_id: item.item_category === "pack" ? item.item_id : undefined,
      value: item.price,
      currency: CURRENCY_LABEL,
      items: [item],
    });
  };

  const buyPack = (packId: PackId) => {
    const pack = packs[packId];
    startCheckout({ item_id: pack.id, item_name: pack.label, item_category: "pack", price: pack.priceCents / 100, quantity: 1 });
    void go(packId, () => createCheckout({ kind: "pack", packId, cancelPath }));
  };

  const subscribe = () => {
    const pro = plans.professional;
    startCheckout({ item_id: pro.id, item_name: pro.label, item_category: "subscription", price: pro.priceCents / 100, quantity: 1 });
    void go("pro", () => createCheckout({ kind: "subscription", cancelPath }));
  };

  const openPortal = () => {
    track("billing_portal_open");
    void go("portal", () => createPortal({}));
  };

  return { status, pending, error, buyPack, subscribe, openPortal };
}
