import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { BETA_MINUTES } from "../../lib/plans";

/** Marks a user as a beta tester. Minutes are granted once, however often this runs. */
export async function activateBeta(ctx: MutationCtx, user: Doc<"users">, invite: Doc<"betaInvites">) {
  const now = new Date().toISOString();

  if (!user.betaCohort) {
    await ctx.db.patch(user._id, { betaCohort: invite.cohort, betaJoinedAt: now, updatedAt: now });
    await ctx.db.insert("minuteGrants", {
      clerkId: user.clerkId,
      minutes: BETA_MINUTES,
      source: "promo",
      note: `Private beta (${invite.cohort})`,
      createdAt: now,
    });
  }

  await ctx.db.patch(invite._id, { status: "accepted", clerkId: user.clerkId, acceptedAt: invite.acceptedAt ?? now });
}

/** Someone invited signed up without using their link: match on their verified email. */
export async function applyBetaInviteForEmail(ctx: MutationCtx, clerkId: string, verifiedEmail: string) {
  const invite = await ctx.db
    .query("betaInvites")
    .withIndex("by_email", (q) => q.eq("email", verifiedEmail))
    .filter((q) => q.neq(q.field("status"), "accepted"))
    .first();
  if (!invite) return;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .unique();
  if (user && !user.betaCohort) await activateBeta(ctx, user, invite);
}
