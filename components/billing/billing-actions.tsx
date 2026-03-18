"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const planInfo = [
  { name: "professional", label: "Professional", description: "Unlimited premium modules" },
  { name: "organization", label: "Organization", description: "Cohorts, reporting, and assignments" },
] as const;

export function BillingActions() {
  const user = useQuery(api.users.current, {});

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="section-frame rounded-[2rem] p-6">
        <p className="eyebrow">Current plan</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight capitalize">
          {user?.subscriptionStatus ?? "free"}
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Checkout and customer portal routes are live. If Stripe price IDs are not configured yet,
          the buttons below will fail fast with a clear server response instead of guessing.
        </p>
        <form action="/api/stripe/portal" method="post" className="mt-6">
          <button
            type="submit"
            className="rounded-full border border-line px-5 py-3 text-sm font-semibold transition hover:bg-white/70"
          >
            Open billing portal
          </button>
        </form>
      </div>
      <div className="surface-card rounded-[2rem] p-6">
        <p className="eyebrow">Upgrade</p>
        <div className="mt-5 space-y-4">
          {planInfo.map((plan) => (
            <form
              key={plan.name}
              action="/api/stripe/checkout"
              method="post"
              className="rounded-[1.5rem] border border-line bg-white/70 p-4"
            >
              <input type="hidden" name="plan" value={plan.name} />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">{plan.label}</div>
                  <div className="mt-1 text-sm text-muted">{plan.description}</div>
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
                >
                  Start checkout
                </button>
              </div>
            </form>
          ))}
        </div>
      </div>
    </section>
  );
}
