import { internal } from "../_generated/api";
import type { MutationCtx } from "../_generated/server";
import type { TransactionalEmail } from "../../lib/email/transactional";

/**
 * Queues a customer email (D-036). Runs after the current mutation commits, so a
 * rolled-back change never emails anyone. `dedupeKey` makes Resend drop repeats
 * (e.g. Stripe retrying a webhook) for 24 hours.
 */
export async function queueEmail(
  ctx: MutationCtx,
  args: { clerkId: string; email: TransactionalEmail; dedupeKey: string },
) {
  await ctx.scheduler.runAfter(0, internal.transactional.send, {
    clerkId: args.clerkId,
    email: args.email,
    dedupeKey: args.dedupeKey,
  });
}
