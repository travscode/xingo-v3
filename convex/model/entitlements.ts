import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import {
  getBillingMonthKey,
  getPlan,
  type PlanId,
} from "../../lib/plans";

type Ctx = QueryCtx | MutationCtx;

export type Entitlement = {
  plan: PlanId;
  planLabel: string;
  billingMonth: string;
  monthlyMinutes: number;
  allowanceUsed: number;
  allowanceRemaining: number;
  packMinutesPurchased: number;
  packMinutesUsed: number;
  packMinutesRemaining: number;
  remainingMinutes: number;
  /** Premium modules unlock with a paid plan or any purchased pack. */
  premiumAccess: boolean;
};

/**
 * Computes what the user may do right now. Pure read; safe in queries.
 *
 * Minutes are spent from the monthly allowance first, then from packs
 * (see `splitCharge`). Pack minutes never expire.
 */
/** Platform admins can open every module and are never blocked by minutes (usage is still recorded). */
const ADMIN_MONTHLY_MINUTES = 100_000;

export async function getEntitlement(
  ctx: Ctx,
  user: Pick<Doc<"users">, "clerkId" | "subscriptionStatus"> & { role?: Doc<"users">["role"] },
  now = new Date(),
): Promise<Entitlement> {
  const isAdmin = user.role === "platform_admin";
  const basePlan = getPlan(user.subscriptionStatus);
  const plan = isAdmin
    ? { ...basePlan, label: "Admin", monthlyMinutes: ADMIN_MONTHLY_MINUTES, premiumAccess: true }
    : basePlan;
  const billingMonth = getBillingMonthKey(now);

  const [monthCharges, allCharges, grants] = await Promise.all([
    ctx.db
      .query("usageCharges")
      .withIndex("by_clerkId_billingMonth", (q) =>
        q.eq("clerkId", user.clerkId).eq("billingMonth", billingMonth),
      )
      .collect(),
    ctx.db
      .query("usageCharges")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", user.clerkId))
      .collect(),
    ctx.db
      .query("minuteGrants")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", user.clerkId))
      .collect(),
  ]);

  const allowanceUsed = monthCharges.reduce((sum, c) => sum + c.fromAllowance, 0);
  const allowanceRemaining = Math.max(0, plan.monthlyMinutes - allowanceUsed);
  const packMinutesPurchased = grants.reduce((sum, g) => sum + g.minutes, 0);
  const packMinutesUsed = allCharges.reduce((sum, c) => sum + c.fromPacks, 0);
  const packMinutesRemaining = Math.max(0, packMinutesPurchased - packMinutesUsed);

  return {
    plan: plan.id,
    planLabel: plan.label,
    billingMonth,
    monthlyMinutes: plan.monthlyMinutes,
    allowanceUsed,
    allowanceRemaining,
    packMinutesPurchased,
    packMinutesUsed,
    packMinutesRemaining,
    remainingMinutes: allowanceRemaining + packMinutesRemaining,
    premiumAccess:
      plan.premiumAccess || grants.some((grant) => grant.source === "pack"),
  };
}

/** Splits a charge across the monthly allowance and pack balance. Never overdraws. */
export function splitCharge(entitlement: Entitlement, minutes: number) {
  const fromAllowance = Math.min(minutes, entitlement.allowanceRemaining);
  const fromPacks = Math.min(
    minutes - fromAllowance,
    entitlement.packMinutesRemaining,
  );

  return { fromAllowance, fromPacks, charged: fromAllowance + fromPacks };
}

export type ScenarioAccess =
  | { allowed: true; reason: "free_module" | "free_preview" | "premium" }
  | { allowed: false; reason: "premium_required" };

export function getScenarioAccess(
  entitlement: Pick<Entitlement, "premiumAccess">,
  learningModule: Pick<Doc<"modules">, "isFree">,
  scenario: Pick<Doc<"scenarios">, "isFreePreview">,
): ScenarioAccess {
  if (learningModule.isFree) {
    return { allowed: true, reason: "free_module" };
  }

  if (scenario.isFreePreview) {
    return { allowed: true, reason: "free_preview" };
  }

  if (entitlement.premiumAccess) {
    return { allowed: true, reason: "premium" };
  }

  return { allowed: false, reason: "premium_required" };
}
