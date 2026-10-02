import { howItWorksSteps } from "@/components/marketing/catalogue";

const roleplaySteps = [
  {
    title: "Read your task card",
    description: "Each scenario starts with a card like the real exam's: the setting, who you are and what you need to do.",
  },
  {
    title: "Speak with a realistic partner",
    description:
      "The AI plays the patient, relative, colleague or examiner. Hold Space (or the mic button) while you talk. The session is timed like the exam.",
  },
  {
    title: "Get exam-style feedback",
    description: "An estimated score against the exam's own criteria, plus specific notes on what to fix next time.",
  },
];

export function HowSteps({ variant = "interpreting" }: { variant?: "interpreting" | "roleplay" }) {
  const steps = variant === "roleplay" ? roleplaySteps : howItWorksSteps;

  return (
    <section>
      <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">How a session works</h2>
      <ol className="mt-6 grid gap-3 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-xl border border-gray-200 p-5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-sm font-bold text-paper">
              {index + 1}
            </span>
            <p className="mt-4 font-bold">{step.title}</p>
            <p className="mt-1 text-sm leading-6 text-gray-500">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
