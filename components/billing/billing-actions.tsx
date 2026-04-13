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
    <section className="space-y-6">
      <div className="section-frame rounded-[2.25rem] p-6 lg:p-8">
        <p className="eyebrow">Current plan</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight capitalize">
          {user?.subscriptionStatus ?? "free"}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Checkout and customer portal routes are live. If Stripe price IDs are not configured yet,
          the buttons below will fail fast with a clear server response instead of guessing.
        </p>
        <form action="/api/stripe/portal" method="post" className="mt-6">
          <button type="submit" className="action-secondary">
            Open billing portal
          </button>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {planInfo.map((plan) => (
          <form
            key={plan.name}
            action="/api/stripe/checkout"
            method="post"
            className="surface-card rounded-[2rem] p-6"
          >
            <input type="hidden" name="plan" value={plan.name} />
            <p className="eyebrow">Upgrade</p>
            <div className="mt-3 text-2xl font-semibold">{plan.label}</div>
            <div className="mt-2 text-sm leading-7 text-muted">{plan.description}</div>
            <button type="submit" className="action-primary mt-6 w-full">
              Start checkout
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}
