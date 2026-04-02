import type { Scenario } from "@/types/scenario";
import { scoringWeights } from "@/utils/scoring";

interface ScenarioPanelProps {
  scenario: Scenario;
}

export function ScenarioPanel({ scenario }: ScenarioPanelProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="surface-card rounded-[1.75rem] p-6">
        <p className="eyebrow">Scenario</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{scenario.title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{scenario.description}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted">
          <span className="mono-chip rounded-full px-3 py-2">
            {scenario.practiceRuntime.sourceLanguage} ↔ {scenario.practiceRuntime.targetLanguage}
          </span>
          <span className="mono-chip rounded-full px-3 py-2">{scenario.practiceRuntime.interpreterRole}</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[scenario.aiAgentA, scenario.aiAgentB].map((agent) => (
            <div key={agent.role} className="rounded-[1.25rem] border border-line bg-white/70 p-4">
              <div className="text-sm font-semibold">{agent.role}</div>
              <div className="mt-1 text-sm text-muted">
                {agent.name} • {agent.language}
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{agent.goal}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="surface-card rounded-[1.75rem] p-6">
          <p className="eyebrow">Scoring</p>
          <div className="mt-4 space-y-4">
            {Object.entries(scoringWeights).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="capitalize">{key}</span>
                <span className="score-pill rounded-full px-3 py-1.5 font-semibold">
                  {Math.round(value * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="surface-card rounded-[1.75rem] p-6">
          <p className="eyebrow">Expected skills</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {scenario.expectedSkills.map((skill) => (
              <span
                key={skill}
                className="mono-chip rounded-full px-3 py-2 text-sm"
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
