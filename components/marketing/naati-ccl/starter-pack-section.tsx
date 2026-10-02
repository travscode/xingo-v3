import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { plans } from "@/lib/plans";
import { cclSignUpHref } from "./content";

/** Free-preview call to action. */
export function NaatiCclStarterPackSection() {
  return (
    <section className="flex flex-col gap-6 rounded-xl border border-gray-200 p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
      <div className="max-w-xl">
        <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Try a free CCL dialogue</h2>
        <p className="mt-3 text-[15px] leading-6 text-gray-500">
          Every free account includes one preview dialogue from the CCL module and {plans.free.monthlyMinutes} practice
          minutes a month. No card needed.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href={cclSignUpHref}>
          Create free account
          <ArrowRight size={18} />
        </Link>
      </Button>
    </section>
  );
}
