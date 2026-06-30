import { runConvexMutation } from "@/lib/convex-admin";
import { stripe } from "@/lib/stripe";
import type { AiUsageSource } from "@/lib/usage-billing";

type RecordOpenAiUsageArgs = {
  eventId: string;
  clerkId: string;
  source: AiUsageSource;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  moduleId?: string;
  scenarioId?: string;
  attemptId?: string;
  requestPath?: string;
};

/**
 * Persists one OpenAI usage event and, when needed, creates a matching Stripe invoice item.
 */
export async function recordOpenAiUsage(args: RecordOpenAiUsageArgs) {
  const usageResult = await runConvexMutation("usage:recordEventAdmin", {
    id: args.eventId,
    clerkId: args.clerkId,
    source: args.source,
    model: args.model,
    moduleId: args.moduleId,
    scenarioId: args.scenarioId,
    attemptId: args.attemptId,
    requestPath: args.requestPath,
    promptTokens: args.promptTokens,
    completionTokens: args.completionTokens,
    totalTokens: args.totalTokens,
  });

  const payload = usageResult?.value ?? usageResult;

  if (
    !payload ||
    payload.existed ||
    !payload.shouldCreateInvoiceItem ||
    !payload.stripeCustomerId
  ) {
    return payload;
  }

  try {
    const invoiceItem = await stripe.invoiceItems.create({
      customer: payload.stripeCustomerId,
      currency: "usd",
      description: `XINGO AI overage for ${args.source} usage (${args.totalTokens} tokens)`,
      metadata: {
        clerkId: args.clerkId,
        usageEventId: args.eventId,
        source: args.source,
        model: args.model,
        moduleId: args.moduleId ?? "",
        scenarioId: args.scenarioId ?? "",
        attemptId: args.attemptId ?? "",
      },
      unit_amount_decimal: payload.overageChargeCents.toFixed(6),
      quantity: 1,
    });

    await runConvexMutation("usage:markInvoiceStatusAdmin", {
      id: args.eventId,
      stripeChargeStatus: "invoiced",
      stripeInvoiceItemId: invoiceItem.id,
    });
  } catch (error) {
    await runConvexMutation("usage:markInvoiceStatusAdmin", {
      id: args.eventId,
      stripeChargeStatus: "failed",
      stripeChargeError:
        error instanceof Error
          ? error.message.slice(0, 500)
          : "Stripe charge failed",
    });
  }

  return payload;
}
