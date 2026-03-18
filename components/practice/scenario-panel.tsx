import type { Scenario } from "@/types/scenario";
import { scoringWeights } from "@/utils/scoring";

interface ScenarioPanelProps {
  scenario: Scenario;
}

export function ScenarioPanel({ scenario }: ScenarioPanelProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="surface-card rounded-[2rem] p-6">
        <p className="eyebrow">Scenario</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">{scenario.title}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{scenario.description}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[scenario.aiAgentA, scenario.aiAgentB].map((agent) => (
            <div key={agent.role} className="rounded-[1.5rem] border border-line bg-white/70 p-5">
              <div className="text-sm font-semibold">{agent.role}</div>
              <div className="mt-2 text-sm text-muted">{agent.voice}</div>
              <p className="mt-4 text-sm leading-6 text-muted">{agent.goal}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="surface-card rounded-[2rem] p-6">
          <p className="eyebrow">Scoring</p>
          <div className="mt-4 space-y-4">
            {Object.entries(scoringWeights).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="capitalize">{key}</span>
                <span className="font-semibold">{Math.round(value * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="surface-card rounded-[2rem] p-6">
          <p className="eyebrow">Expected skills</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {scenario.expectedSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-line bg-white/80 px-3 py-2 text-sm text-muted"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
