import Image from "next/image";
import { BadgeCheck, Check, Languages, MessagesSquare, Plus, Wallet } from "lucide-react";
import { people, scenes, type PersonKey, type SceneKey } from "@/components/marketing/people";
import { CREATOR_REVENUE_SHARE } from "@/lib/marketplace";
import { cn } from "@/lib/utils";

/**
 * Hero visual for the marketplace landing (/sell-practice-courses): a dark card
 * with three example course cards taking turns at the front of a stack (CSS
 * only, `.mkt-card` in globals.css) and the real creator share rule.
 * Fictional creators and courses; labelled illustrative. No counts or earnings
 * figures are shown, because they would be invented.
 */

type ExampleCourse = {
  title: string;
  creator: string;
  person: PersonKey;
  scene: SceneKey;
  kind: "roleplay" | "interpreting";
  chip: string;
};

const examples: ExampleCourse[] = [
  {
    title: "Nursing handover and patient role-plays",
    creator: "Sofia, exam coach",
    person: "sofia",
    scene: "examPrep",
    kind: "roleplay",
    chip: "Speaking exam prep",
  },
  {
    title: "Medical interpreting: GP appointments",
    creator: "Linh, interpreter trainer",
    person: "linh",
    scene: "clinic",
    kind: "interpreting",
    chip: "Interpreting",
  },
  {
    title: "Billing calls for contact centre staff",
    creator: "Daniel, team trainer",
    person: "daniel",
    scene: "contactCentre",
    kind: "roleplay",
    chip: "Staff training",
  },
];

const share = Math.round(CREATOR_REVENUE_SHARE * 100);

function ExampleCard({ course, index }: { course: ExampleCourse; index: number }) {
  return (
    <div
      className={cn(
        "mkt-card [grid-area:1/1] overflow-hidden rounded-2xl bg-paper text-ink",
        `mkt-card-${index}`,
      )}
    >
      <div className="relative aspect-[2/1] bg-gray-200">
        <Image
          src={scenes[course.scene].src}
          alt=""
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 380px, 80vw"
          className="object-cover"
        />
        <Image
          src={people[course.person]}
          alt=""
          width={44}
          height={44}
          className="absolute -bottom-5 left-4 h-11 w-11 rounded-xl border-2 border-paper bg-paper object-cover"
        />
      </div>
      <div className="p-4 pt-7">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-gray-700">
            {course.kind === "roleplay" ? (
              <MessagesSquare className="h-3 w-3" aria-hidden />
            ) : (
              <Languages className="h-3 w-3" aria-hidden />
            )}
            {course.kind === "roleplay" ? "One-on-one" : "Interpreting"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-accent-ink">
            <BadgeCheck className="h-3 w-3" aria-hidden />
            {course.chip}
          </span>
        </div>
        <p className="mt-2 font-bold leading-snug">{course.title}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-gray-500">
            By <span className="font-semibold text-ink">{course.creator}</span>
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-ink px-2.5 py-1 text-xs font-semibold text-paper">
            <Plus className="h-3 w-3" aria-hidden /> Add
          </span>
        </div>
      </div>
    </div>
  );
}

export function MarketplaceHero({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative isolate w-full overflow-hidden rounded-[2rem] bg-ink px-5 pb-6 pt-5 text-paper sm:px-8 sm:pb-8",
        className,
      )}
    >
      <p className="sr-only">
        Illustrative example of the XINGO Marketplace: practice courses made by fictional creators, such as an exam
        coach, an interpreter trainer and a team trainer. Creators earn {share}% of the net revenue from paid minutes
        practised in their courses.
      </p>

      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 right-[-10%] -z-10 h-[60%] w-[70%] rounded-full bg-accent/20 blur-[90px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] [background-size:22px_22px]"
      />

      <div aria-hidden>
        <div className="flex items-center justify-between gap-3 text-xs font-semibold tracking-wide text-paper/60">
          <span>XINGO Marketplace</span>
          <span className="rounded-md border border-dashed border-paper/40 px-2 py-0.5 text-[11px] uppercase tracking-[0.08em]">
            Illustrative example
          </span>
        </div>

        {/* Stack: back cards peek above the front one. */}
        <div className="relative mx-auto mt-16 grid w-[88%] max-w-[380px] sm:mt-[4.5rem]">
          {examples.map((course, index) => (
            <ExampleCard key={course.title} course={course} index={index} />
          ))}
          <span className="mk-rise mk-delay-3 absolute -right-3 -top-14 z-10 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-ink sm:-right-6">
            <Check className="h-3.5 w-3.5" strokeWidth={3} /> Published
          </span>
        </div>

        <div className="mk-rise mk-delay-4 relative z-10 -mt-4 ml-auto w-[86%] max-w-[320px] rounded-xl border border-paper/15 bg-ink/90 p-4 backdrop-blur sm:mr-[-0.5rem]">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper/10">
              <Wallet className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-paper/60">Your share as the creator</p>
              <p className="text-2xl font-bold tracking-[-0.03em] tabular-nums text-accent">{share}%</p>
            </div>
          </div>
          <p className="mt-2 text-xs leading-5 text-paper/70">
            of XINGO&apos;s net revenue from paid minutes practised in your course.
          </p>
        </div>
      </div>
    </div>
  );
}
