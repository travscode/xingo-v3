import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand, MarketingIntro } from "@/components/marketing/cta-band";
import { FaqSection } from "@/components/marketing/seo/faq-section";
import { HowSteps } from "@/components/marketing/seo/how-steps";
import { CheckList, ScenarioList } from "@/components/marketing/seo/scenario-list";
import { Button } from "@/components/ui/button";
import { signUpHref } from "@/lib/seo-pages";

export const metadata: Metadata = {
  title: "NAATI CPI Test Practice — Live Role-Play Interpreting with AI",
  description:
    "Prepare for the NAATI Certified Provisional Interpreter (CPI) test with spoken role-plays: face-to-face style and telephone dialogues in community, health and legal settings. Instant feedback.",
  alternates: { canonical: "/naati/cpi" },
};

const href = signUpHref("naati_cpi");

export default function NaatiCpiPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-8 sm:gap-20 sm:px-6">
      <MarketingIntro
        eyebrow="NAATI CPI preparation"
        title="Rehearse the CPI role-plays until they feel routine."
        description="The Certified Provisional Interpreter test is a set of live role-plays: an English speaker, a speaker of your language, and you in the middle. XINGO gives you that format on demand — two AI speakers, consecutive interpreting, scored feedback."
      >
        <Button asChild size="lg">
          <Link href={href}>
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/interpreting/telephone-interpreting-practice">Practise the phone task</Link>
        </Button>
      </MarketingIntro>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Live role-plays", "Dialogues between an English speaker and a speaker of your other language, interpreted consecutively."],
          ["Different domains", "Each task is set in a different setting — community, health, legal and more."],
          ["Face-to-face and remote", "The test includes a remote (phone-style) dialogue as well as face-to-face tasks."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-xl border border-gray-200 p-5">
            <p className="font-bold">{title}</p>
            <p className="mt-1 text-sm leading-6 text-gray-500">{body}</p>
          </div>
        ))}
        <p className="text-xs text-gray-500 sm:col-span-3">
          Summary only. Test formats change — read NAATI&apos;s CPI candidate instructions before you book.
        </p>
      </section>

      <ScenarioList
        title="CPI-style dialogues"
        scenarios={[
          { title: "GP clinic registration", description: "Medicare details, forms and clinic rules." },
          { title: "School enrolment meeting", description: "Documents, catchment zones and support services." },
          { title: "Rental repair request", description: "An urgent repair and a tenant's rights." },
          { title: "Employment services intake", description: "Work history, mutual obligations and next steps." },
          { title: "Police property damage report", description: "Sequence of events and evidence." },
          { title: "Centrelink payment call (phone)", description: "Audio-only, with reference numbers and amounts." },
        ]}
      />
      <CheckList
        title="What CPI candidates work on"
        items={["Consecutive interpreting in both directions", "Longer turns and note-taking", "Managing the flow and asking for clarification", "Accurate terminology across domains", "Professional, first-person delivery", "Phone interpreting without visual cues"]}
      />
      <HowSteps />
      <FaqSection
        faqs={[
          { q: "Is XINGO affiliated with NAATI?", a: "No. XINGO is independent practice software modelled on the public test format." },
          { q: "Do I need to finish the Diploma of Interpreting first?", a: "NAATI sets the eligibility rules for the CPI test — check their website. XINGO is useful practice whether you're studying or already eligible." },
          { q: "Can I practise in my language?", a: "Choose from 30+ listed languages or type in another. The other participant always speaks English." },
          { q: "How long is a session?", a: "Most dialogues take 5–12 minutes. You're only charged practice minutes while a session is live." },
        ]}
      />
      <CtaBand title="Try a CPI-style dialogue free." description="Free practice minutes every month. No card needed." href={href} label="Start free" />
    </main>
  );
}
