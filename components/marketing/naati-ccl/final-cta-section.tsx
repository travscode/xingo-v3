import { CtaBand } from "@/components/marketing/cta-band";
import { cclSignUpHref } from "./content";

export function NaatiCclFinalCtaSection() {
  return (
    <CtaBand
      title="Start practising for your CCL test today."
      description="Create a free account and go straight to the CCL course. Your first dialogue is free."
      href={cclSignUpHref}
      label="Try a free CCL dialogue"
    />
  );
}
