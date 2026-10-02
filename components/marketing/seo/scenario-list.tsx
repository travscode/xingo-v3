import { Check } from "lucide-react";

export function ScenarioList({
  title,
  scenarios,
}: {
  title: string;
  scenarios: Array<{ title: string; description: string }>;
}) {
  return (
    <section>
      <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{title}</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {scenarios.map((scenario) => (
          <div key={scenario.title} className="rounded-xl bg-gray-50 p-5">
            <p className="font-bold">{scenario.title}</p>
            <p className="mt-1 text-sm leading-6 text-gray-500">{scenario.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CheckList({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{title}</h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[15px] leading-6">
            <Check className="mt-1 h-4 w-4 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
