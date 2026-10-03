import { describe, expect, test } from "vitest";
import { api, internal } from "../_generated/api";
import { seedUser, setup } from "./setup.helpers";

describe("creator payouts page", () => {
  test("bank payouts from Stripe are recorded once per payout and shown only to their creator", async () => {
    const t = setup();
    const creator = await seedUser(t, "creator");
    const other = await seedUser(t, "other");
    await t.mutation(internal.connectData.saveAccount, {
      clerkId: "creator",
      stripeAccountId: "acct_1",
      detailsSubmitted: true,
      payoutsEnabled: true,
    });

    const payout = {
      stripeAccountId: "acct_1",
      stripePayoutId: "po_1",
      amountCents: 7_500,
      currency: "aud",
      status: "in_transit",
      createdAt: "2026-10-01T00:00:00.000Z",
    };
    await t.mutation(internal.connectData.recordBankPayout, payout);
    // payout.paid arrives later for the same payout: updated, not duplicated.
    await t.mutation(internal.connectData.recordBankPayout, { ...payout, status: "paid", arrivalDate: "2026-10-03T00:00:00.000Z" });
    // Unknown connected account: ignored.
    await t.mutation(internal.connectData.recordBankPayout, { ...payout, stripeAccountId: "acct_unknown", stripePayoutId: "po_2" });

    const mine = await creator.query(api.payouts.overview, {});
    expect(mine?.account).toMatchObject({ connected: true, payoutsEnabled: true });
    expect(mine?.bankPayouts).toEqual([expect.objectContaining({ amountCents: 7_500, status: "paid", arrivalDate: "2026-10-03T00:00:00.000Z" })]);
    expect(mine?.totals.toBankCents).toBe(7_500);
    expect(mine?.series).toHaveLength(12);

    const theirs = await other.query(api.payouts.overview, {});
    expect(theirs?.bankPayouts).toEqual([]);
    expect(theirs?.account.connected).toBe(false);
  });
});
