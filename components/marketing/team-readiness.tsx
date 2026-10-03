import { Check, Circle, Minus } from "lucide-react";
import { Portrait, PortraitStack, type PersonKey } from "@/components/marketing/people";
import { Badge } from "@/components/ui/primitives";
import { flagEmoji } from "@/lib/languages";
import { rubrics } from "@/lib/rubrics";
import { cn } from "@/lib/utils";

/*
 * Illustrative "team readiness" view for the /staff-training page. Everything
 * here is fictional and static (server-rendered, CSS-only motion): the team
 * workspace is in pilot, not a shipped feature (D-021), so it is always
 * labelled "Illustrative example".
 */

const TARGET = rubrics.roleplay.passScore;

type Status = "ready" | "practice" | "not-started";

type StaffMember = {
  person: PersonKey;
  name: string;
  role: string;
  /** Other language, or null for English only. */
  language: string | null;
  /** Scenarios passed out of the course total. */
  passed: number;
  score: number | null;
  status: Status;
};

const COURSE = "Welcoming visitors";
const SCENARIO_COUNT = 4;

export const exampleStaff: StaffMember[] = [
  { person: "priya", name: "Priya Nair", role: "Guest services", language: "Hindi", passed: 4, score: 86, status: "ready" },
  { person: "tom", name: "Tom Gallagher", role: "Ticketing", language: null, passed: 4, score: 78, status: "ready" },
  { person: "aisha", name: "Aisha Rahman", role: "Accessibility host", language: "Arabic", passed: 4, score: 91, status: "ready" },
  { person: "daniel", name: "Daniel Okafor", role: "Phone enquiries", language: null, passed: 4, score: 74, status: "ready" },
  { person: "mai", name: "Mai Tran", role: "Volunteer", language: "Vietnamese", passed: 2, score: 58, status: "practice" },
  { person: "lucas", name: "Lucas Oliveira", role: "Volunteer", language: "Portuguese", passed: 4, score: 81, status: "ready" },
  { person: "hana", name: "Hana Sato", role: "Information desk", language: "Japanese", passed: 4, score: 88, status: "ready" },
  { person: "mateo", name: "Mateo Fernández", role: "Information desk", language: "Spanish", passed: 0, score: null, status: "not-started" },
];

const readyCount = exampleStaff.filter((member) => member.status === "ready").length;
const practiceCount = exampleStaff.filter((member) => member.status === "practice").length;
const notStartedCount = exampleStaff.filter((member) => member.status === "not-started").length;

export const exampleReadySummary = `${readyCount} of ${exampleStaff.length} ready`;

/** Mai's scenario checklist, shown beside the team list. */
const exampleScenarios: Array<{ title: string; score: number | null }> = [
  { title: "Directions to a seat", score: 82 },
  { title: "Lost bag report", score: 76 },
  { title: "Wheelchair access request", score: 58 },
  { title: "Ticket won't scan", score: null },
];

function StatusChip({ status }: { status: Status }) {
  if (status === "ready") {
    return (
      <Badge tone="success" className="whitespace-nowrap">
        <Check size={12} strokeWidth={3} aria-hidden />
        Ready
      </Badge>
    );
  }
  if (status === "practice") {
    return (
      <Badge tone="warning" className="whitespace-nowrap">
        Needs practice
      </Badge>
    );
  }
  return (
    <Badge tone="neutral" className="whitespace-nowrap">
      Not started
    </Badge>
  );
}

function LanguagePair({ language }: { language: string | null }) {
  if (!language) {
    return (
      <span className="whitespace-nowrap">
        <span aria-hidden>{flagEmoji("English")} </span>English only
      </span>
    );
  }
  return (
    <span className="whitespace-nowrap">
      <span aria-hidden>{flagEmoji("English")} </span>English ⇄ <span aria-hidden>{flagEmoji(language)} </span>
      {language}
    </span>
  );
}

/** Label every illustrative mock carries. */
export function IllustrativeLabel({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-dashed border-gray-500 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500",
        className,
      )}
    >
      Illustrative example
    </span>
  );
}

/** Small overlay card for the hero photo. */
export function ReadinessSummaryCard({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("rounded-xl border border-gray-200 bg-paper p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-gray-500">{COURSE}</p>
        <IllustrativeLabel className="text-[10px]" />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className={cn("font-bold tracking-[-0.03em] tabular-nums", compact ? "text-xl" : "text-2xl")}>
          {exampleReadySummary}
        </p>
        <PortraitStack
          persons={exampleStaff.slice(0, compact ? 2 : 4).map((member) => member.person)}
          size={compact ? 24 : 28}
        />
      </div>
      <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-gray-200" aria-hidden>
        <div className="mk-fill h-full bg-accent" style={{ width: `${(readyCount / exampleStaff.length) * 100}%` }} />
      </div>
    </div>
  );
}

/** The full team view: summary, staff list and one person's scenario checklist. */
export function TeamReadinessDemo() {
  return (
    <figure className="overflow-hidden rounded-2xl border border-gray-200 bg-paper">
      <figcaption className="sr-only">
        Illustrative example of a team view with fictional staff: {exampleReadySummary} for the {COURSE} course,{" "}
        {practiceCount} needs more practice and {notStartedCount} has not started.
      </figcaption>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 bg-gray-50 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <IllustrativeLabel />
            <span className="text-xs text-gray-500">Fictional staff</span>
          </div>
          <p className="mt-3 text-sm font-semibold text-gray-500">Guest services team · {COURSE}</p>
          <p className="mt-1 text-3xl font-bold tracking-[-0.035em] tabular-nums sm:text-4xl">{exampleReadySummary}</p>
        </div>
        <dl className="grid grid-cols-3 gap-2 text-center sm:min-w-[320px]" aria-hidden>
          <div className="rounded-lg bg-paper px-3 py-2">
            <dt className="text-[11px] font-semibold text-gray-500">Ready</dt>
            <dd className="text-lg font-bold tabular-nums text-success">{readyCount}</dd>
          </div>
          <div className="rounded-lg bg-paper px-3 py-2">
            <dt className="text-[11px] font-semibold text-gray-500">Practising</dt>
            <dd className="text-lg font-bold tabular-nums">{practiceCount}</dd>
          </div>
          <div className="rounded-lg bg-paper px-3 py-2">
            <dt className="text-[11px] font-semibold text-gray-500">Not started</dt>
            <dd className="text-lg font-bold tabular-nums text-gray-500">{notStartedCount}</dd>
          </div>
        </dl>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px]">
        {/* Staff list */}
        <div aria-hidden>
          <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1.3fr)_minmax(0,1fr)_56px_120px] gap-4 border-b border-gray-200 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500 md:grid">
            <span>Person</span>
            <span>Language</span>
            <span>Scenarios passed</span>
            <span className="text-right">Score</span>
            <span>Status</span>
          </div>
          <ul className="divide-y divide-gray-200">
            {exampleStaff.map((member, index) => (
              <li
                key={member.person}
                className={cn(
                  "mk-rise grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-5 py-3.5 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.3fr)_minmax(0,1fr)_56px_120px] md:px-6",
                  member.status === "practice" && "bg-gray-50",
                )}
                style={{ animationDelay: `${120 + index * 70}ms` }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Portrait person={member.person} size={36} className="shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{member.name}</p>
                    <p className="truncate text-xs text-gray-500">{member.role}</p>
                  </div>
                </div>
                <div className="justify-self-end md:hidden">
                  <StatusChip status={member.status} />
                </div>
                <p className="col-span-2 text-xs text-gray-700 md:col-span-1 md:text-sm">
                  <LanguagePair language={member.language} />
                </p>
                <div className="col-span-2 flex items-center gap-3 md:col-span-1">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="mk-fill h-full rounded-full bg-accent"
                      style={{
                        width: `${(member.passed / SCENARIO_COUNT) * 100}%`,
                        animationDelay: `${300 + index * 70}ms`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs tabular-nums text-gray-500">
                    {member.passed}/{SCENARIO_COUNT}
                  </span>
                  <span className="w-14 text-right text-sm font-bold tabular-nums md:hidden">
                    {member.score ?? "—"}
                  </span>
                </div>
                <span className="hidden text-right text-sm font-bold tabular-nums md:block">{member.score ?? "—"}</span>
                <div className="hidden md:block">
                  <StatusChip status={member.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* One person's scenarios */}
        <aside className="border-t border-gray-200 bg-gray-50 p-5 sm:p-6 lg:border-l lg:border-t-0" aria-hidden>
          <div className="flex items-center gap-3">
            <Portrait person="mai" size={40} />
            <div>
              <p className="text-sm font-bold">Mai Tran</p>
              <p className="text-xs text-gray-500">Volunteer · English ⇄ Vietnamese</p>
            </div>
          </div>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
            Assessed scenarios · target {TARGET}
          </p>
          <ul className="mt-3 space-y-2">
            {exampleScenarios.map((scenario) => {
              const passed = scenario.score !== null && scenario.score >= TARGET;
              const below = scenario.score !== null && scenario.score < TARGET;
              return (
                <li key={scenario.title} className="flex items-center gap-3 rounded-lg bg-paper px-3 py-2.5">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                      passed && "bg-accent text-accent-ink",
                      below && "bg-warning/30 text-ink",
                      scenario.score === null && "bg-gray-100 text-gray-500",
                    )}
                  >
                    {passed ? (
                      <Check size={14} strokeWidth={3} />
                    ) : below ? (
                      <Minus size={14} strokeWidth={3} />
                    ) : (
                      <Circle size={10} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{scenario.title}</span>
                  <span className="text-sm font-bold tabular-nums">{scenario.score ?? "—"}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs leading-5 text-gray-500">
            Below target on one scenario and one still to do. In practice mode, task-card points tick off as she covers them.
          </p>
        </aside>
      </div>
    </figure>
  );
}
