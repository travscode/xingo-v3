import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

/**
 * Stripe webhook endpoint: https://<deployment>.convex.site/stripe/webhook
 */
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    const result = await ctx.runAction(internal.billing.handleWebhook, {
      payload: await request.text(),
      signature,
    });

    return new Response(result.message, { status: result.status });
  }),
});

export default http;
