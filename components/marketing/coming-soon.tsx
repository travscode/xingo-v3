import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand } from "@/components/marketing/cta-band";
import { Button } from "@/components/ui/button";
import { openAlternativeFor } from "@/lib/site-status";

/*
 * Public pages for courses that are coming soon (D-043): say so plainly and send
 * people to the open course that fits (lib/site-status.ts): NAATI CCL, or the free
 * medical course for US medical interpreters.
 */

export function ComingSoonHeroButton({ goal }: { goal?: string }) {
  const alternative = openAlternativeFor(goal);
  return (
    <Button asChild size="lg">
      <Link href={alternative.href}>
        {alternative.label} <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
}

export function ComingSoonCtaBand({ name, goal }: { name: string; goal?: string }) {
  const alternative = openAlternativeFor(goal);
  return (
    <CtaBand
      title={`${name} practice is coming soon.`}
      description={`${alternative.name} practice is open now, with free practice minutes every month. No card needed.`}
      href={alternative.href}
      label={alternative.label}
    />
  );
}
