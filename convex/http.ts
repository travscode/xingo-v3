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

/**
 * Stripe Connect webhook (creator payout accounts): https://<deployment>.convex.site/stripe/connect-webhook
 */
http.route({
  path: "/stripe/connect-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    const result = await ctx.runAction(internal.connect.handleConnectWebhook, {
      payload: await request.text(),
      signature,
    });

    return new Response(result.message, { status: result.status });
  }),
});

// ---- Email tracking (proxied from https://www.xingo.ai/e/* via next.config.ts) ------------

// 43-byte transparent GIF.
const PIXEL = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), (c) => c.charCodeAt(0));

http.route({
  pathPrefix: "/e/o/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const token = new URL(request.url).pathname.split("/").pop()?.replace(/\.gif$/, "") ?? "";
    if (token) await ctx.runMutation(internal.emails.recordOpen, { token });

    return new Response(PIXEL, {
      headers: { "Content-Type": "image/gif", "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" },
    });
  }),
});

http.route({
  pathPrefix: "/e/c/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const [, , , token = "", index = "0"] = new URL(request.url).pathname.split("/");
    const destination = await ctx.runMutation(internal.emails.recordClick, {
      token,
      linkIndex: Number.parseInt(index, 10) || 0,
    });

    return new Response(null, { status: 302, headers: { Location: destination, "Cache-Control": "no-store" } });
  }),
});

const unsubscribePage = (ok: boolean) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>XINGO — Unsubscribe</title></head><body style="margin:0;background:#f6f6f6;font-family:Inter,-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#000"><div style="max-width:480px;margin:64px auto;background:#fff;border-radius:16px;padding:40px 32px"><p style="font-weight:800;font-size:20px;margin:0 0 24px">XINGO</p><h1 style="font-size:28px;margin:0 0 12px">${ok ? "You're unsubscribed" : "Link not recognised"}</h1><p style="color:#6b6b6b;line-height:24px;margin:0 0 24px">${ok ? "You won't receive these emails any more. You'll still get essential account emails such as receipts. You can turn updates back on from your Account page." : "This unsubscribe link has expired or is invalid. You can manage email preferences from your Account page."}</p><a href="https://www.xingo.ai/account" style="display:inline-block;background:#000;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px">Go to my account</a></div></body></html>`;

http.route({
  pathPrefix: "/e/u/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const token = new URL(request.url).pathname.split("/").pop() ?? "";
    const result = await ctx.runMutation(internal.emails.unsubscribe, { token });
    return new Response(unsubscribePage(result.ok), { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }),
});

// RFC 8058 one-click unsubscribe (Gmail/Yahoo "Unsubscribe" button).
http.route({
  pathPrefix: "/e/u/",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const token = new URL(request.url).pathname.split("/").pop() ?? "";
    await ctx.runMutation(internal.emails.unsubscribe, { token });
    return new Response("Unsubscribed", { status: 200 });
  }),
});

/** Verifies a Svix-signed webhook (Resend). Secret format: whsec_<base64>. */
async function verifySvix(request: Request, payload: string, secret: string) {
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signatures = request.headers.get("svix-signature");

  if (!id || !timestamp || !signatures || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    return false;
  }

  const keyBytes = Uint8Array.from(atob(secret.replace(/^whsec_/, "")), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${timestamp}.${payload}`));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));

  return signatures.split(" ").some((part) => part.split(",")[1] === expected);
}

http.route({
  path: "/e/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.RESEND_WEBHOOK_SECRET;
    const payload = await request.text();

    if (!secret || !(await verifySvix(request, payload, secret))) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(payload) as { type?: string; data?: { email_id?: string } };
    const messageId = event.data?.email_id;

    if (messageId && (event.type === "email.bounced" || event.type === "email.complained")) {
      await ctx.runMutation(internal.emails.recordDeliveryEvent, {
        providerMessageId: messageId,
        type: event.type === "email.bounced" ? "bounced" : "complained",
      });
    }

    return new Response("ok", { status: 200 });
  }),
});

export default http;
