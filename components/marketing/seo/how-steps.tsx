import { IllustratedSteps } from "@/components/marketing/illustrated-steps";

export function HowSteps({ variant = "interpreting" }: { variant?: "interpreting" | "roleplay" }) {
  return (
    <section>
      <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">How a session works</h2>
      <IllustratedSteps variant={variant} className="mt-6" />
    </section>
  );
}
