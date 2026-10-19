import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand } from "@/components/marketing/cta-band";
import { Button } from "@/components/ui/button";

/*
 * Public pages for courses that are coming soon (D-043): say so plainly and send
 * people to NAATI CCL, the course that's open now.
 */

export const OPEN_COURSE_HREF = "/naati/ccl";

export function ComingSoonHeroButton() {
  return (
    <Button asChild size="lg">
      <Link href={OPEN_COURSE_HREF}>
        Practise NAATI CCL <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
}

export function ComingSoonCtaBand({ name }: { name: string }) {
  return (
    <CtaBand
      title={`${name} practice is coming soon.`}
      description="NAATI CCL practice is open now, with free practice minutes every month. No card needed."
      href={OPEN_COURSE_HREF}
      label="Practise NAATI CCL"
    />
  );
}
