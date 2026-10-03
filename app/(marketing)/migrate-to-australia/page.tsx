import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Info } from "lucide-react";
import { CtaBand, MarketingIntro } from "@/components/marketing/cta-band";
import { LogoCarousel } from "@/components/marketing/logo-carousel";
import { MigrationPathway } from "@/components/marketing/migration-pathway";
import { Breadcrumbs } from "@/components/marketing/seo/breadcrumbs";
import { FaqSection } from "@/components/marketing/seo/faq-section";
import { GuideLinks } from "@/components/marketing/seo/guide-links";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { practiceLanguages } from "@/lib/languages";
import { MAX_ATTEMPT_MINUTES, plans } from "@/lib/plans";
import { CCL_MAX_SCORE } from "@/lib/scoring";
import { pageMetadata } from "@/lib/seo-metadata";
import { webPageJsonLd } from "@/lib/structured-data";
import { TWO_M_URL, TwoMLink, withTwoMLinks } from "@/components/marketing/two-m-link";

/*
 * Landing page for people migrating (or planning to migrate) to Australia
 * (docs/seo.md). General information only — never migration advice (only
 * registered migration agents, lawyers and exempt persons may give immigration
 * assistance). Every visa/points/credential fact below is sourced from an official
 * page listed in `sources` and was checked on 2026-10-03; re-check before editing.
 * 2M partnership: under contract, confirmed by the founder (see logo-carousel.tsx).
 */

const PATH = "/migrate-to-australia";
const TITLE = "Migrating to Australia: English Tests, CCL and Work";
const DESCRIPTION =
  "Moving to Australia? See where English tests, NAATI CCL points and interpreter certification fit, and practise IELTS, OET and CCL speaking out loud with AI.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

const HOME_AFFAIRS = "https://immi.homeaffairs.gov.au/";
const OMARA_REGISTER = "https://portal.mara.gov.au/search-the-register-of-migration-agents/";

const src = {
  englishTests: "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/english-language",
  competent: "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/english-language/competent-english",
  points189: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189/points-table",
  whoCanHelp: "https://immi.homeaffairs.gov.au/help-support/who-can-help-with-your-application",
  translations: "https://immi.homeaffairs.gov.au/help-text/evidence/Pages/et-h0136.aspx",
  freeTranslating:
    "https://immi.homeaffairs.gov.au/settling-in-australia/settle-in-australia/language-services/free-translating-service",
  ccl: "https://www.naati.com.au/migration-assessments/ccl/",
  cpi: "https://www.naati.com.au/certification/cpi/",
  certification: "https://www.naati.com.au/certification/",
  naatiDirectory: "https://www.naati.com.au/online-directory/",
  ahpraEnglish: "https://www.ahpra.gov.au/Registration/Registration-Standards/English-language-skills.aspx",
  amc: "https://www.amc.org.au/pathways/standard-pathway/amc-assessments/clinical-examination/",
  nmbaOsce: "https://www.nursingmidwiferyboard.gov.au/Accreditation/IQNM/Examination/Objective-structured-clinical-exam.aspx",
  ieltsSpeaking: "https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-speaking",
  oetSpeaking: "https://oet.com/test-information/speaking/",
};

type PathStep = {
  title: string;
  body: string;
  official: { label: string; href: string };
  practice: Array<{ label: string; href: string }>;
  note?: string;
};

const pathway: PathStep[] = [
  {
    title: "Find out what your visa asks for",
    body: "Each visa sets its own requirements, including the level of English you need and how you prove it. Read the eligibility page for the visa you're considering, and get advice about your own situation from a registered migration agent.",
    official: { label: "Home Affairs: visas and requirements", href: HOME_AFFAIRS },
    practice: [],
    note: "This step is yours and your agent's. XINGO doesn't give migration advice.",
  },
  {
    title: "Prove your English",
    body: "Home Affairs accepts results from a list of English tests, including IELTS Academic, IELTS General Training, OET and PTE Academic, taken at a secure test centre. The score you need depends on the visa. Speaking is the hardest part to practise on your own.",
    official: { label: "Home Affairs: accepted English tests", href: src.englishTests },
    practice: [
      { label: "IELTS Speaking practice", href: "/exams/ielts-speaking" },
      { label: "OET Speaking practice", href: "/exams/oet-speaking" },
    ],
  },
  {
    title: "Consider the NAATI CCL",
    body: "On points-tested skilled visas, a credentialled community language can add points. Most people use NAATI's Credentialed Community Language (CCL) test: two dialogues you interpret between English and your other language.",
    official: { label: "NAATI: the CCL test", href: src.ccl },
    practice: [{ label: "NAATI CCL practice", href: "/naati/ccl" }],
  },
  {
    title: "Register in your profession",
    body: "Health practitioners must meet their National Board's English language standard, and some also sit a clinical assessment, such as the AMC clinical exam for international medical graduates or the NMBA OSCE for internationally qualified nurses.",
    official: { label: "Ahpra: English language skills", href: src.ahpraEnglish },
    practice: [
      { label: "AMC clinical exam practice", href: "/exams/amc-clinical-exam" },
      { label: "NMBA OSCE practice", href: "/exams/nmba-osce" },
    ],
  },
  {
    title: "Put your languages to work",
    body: "To work as an interpreter you need NAATI certification. The Certified Provisional Interpreter (CPI) test is NAATI's entry-level generalist interpreting test, with prerequisites to meet before you sit it.",
    official: { label: "NAATI: Certified Provisional Interpreter", href: src.cpi },
    practice: [{ label: "NAATI CPI practice", href: "/naati/cpi" }],
  },
];

const englishLevels = [
  { level: "Competent English", points: "0" },
  { level: "Proficient English", points: "10" },
  { level: "Superior English", points: "20" },
];

const features = [
  {
    title: "Speak out loud with AI voices",
    body: "An AI examiner, patient or pair of speakers talks back in real time, so you rehearse the conversation, not a worksheet.",
  },
  {
    title: "Scored feedback after assessed sessions",
    body: `CCL-style dialogues are scored out of ${CCL_MAX_SCORE}, IELTS mock tests get an estimated band, and OET, AMC and OSCE role-plays get feedback on the criteria. Scores are estimates, not official results.`,
  },
  {
    title: "Your language pair",
    body: `For interpreting practice, pick English and one of ${practiceLanguages.length} listed languages, or type another.`,
  },
  {
    title: "Practice mode, then assessed",
    body: "Practice mode coaches you as you go. Assessed sessions run like the real thing, with no hints, and are scored at the end.",
  },
];

const advice = [
  {
    title: "Practise speaking every day, out loud",
    body: "Reading and listening help, but speaking tests reward fluency under pressure. Short daily sessions with a timer build it faster than occasional long ones.",
  },
  {
    title: "Build vocabulary in both languages",
    body: "For the CCL, learn the words for health, housing, legal, employment and other community topics in English and your language.",
    link: { label: "CCL vocabulary lists", href: "/naati/ccl/vocabulary" },
  },
  {
    title: "Use headphones and a quiet room",
    body: "The CCL is delivered online with remote proctoring. Practise on the set-up you'll use on the day so nothing surprises you.",
  },
  {
    title: "Get documents translated properly",
    body: "Home Affairs asks for an English translation of documents not in English. In Australia, it says to use a NAATI-accredited translator. Eligible permanent residents and some other visa holders can get up to 10 documents translated free within two years of their visa grant.",
    link: { label: "Find a NAATI translator", href: src.naatiDirectory, external: true },
  },
  {
    title: "Check your credential dates",
    body: "NAATI says CCL credentials issued from 9 August 2022 are valid for five years. Make sure yours lines up with your application timeline.",
  },
  {
    title: "Only take advice from registered people",
    body: "Only registered migration agents, legal practitioners and exempt persons can help with your visa application. Check an agent on the official register before you pay anyone.",
    link: { label: "Search the register", href: OMARA_REGISTER, external: true },
  },
];

const faqs = [
  {
    q: "Which English test do I need to migrate to Australia?",
    a: "It depends on your visa. Home Affairs accepts results from a list of tests, including IELTS Academic, IELTS General Training, OET, PTE Academic, TOEFL iBT, C1 Advanced, CELPIP General, LANGUAGECERT Academic and the Michigan English Test, taken at a secure test centre. Check the eligibility page for your visa to see the level and evidence it needs.",
  },
  {
    q: "Is IELTS General Training accepted for Australian visas?",
    a: "Yes. Home Affairs lists both IELTS Academic and IELTS General Training, including One Skill Retake for eligible visas. The score you need depends on the visa and, for points-tested visas, on the English level you want to claim.",
  },
  {
    q: "Can I use OET for an Australian visa?",
    a: "Yes. OET is on the Home Affairs list of accepted tests. It's designed for health professionals, and Ahpra also accepts it for registration. Check the scores your visa and your National Board need.",
  },
  {
    q: "How many points does the NAATI CCL give for PR?",
    a: "At the time of writing, the points table for the Skilled Independent visa (subclass 189) gives 5 points for a recognised qualification in a credentialled community language, such as a NAATI CCL or NAATI certification at Certified Provisional level or above. Points rules can change, so check the current table for your visa or ask a registered migration agent.",
  },
  {
    q: "Does passing the CCL let me work as an interpreter?",
    a: "No. NAATI says the CCL is not a professional certification, and passing it doesn't certify you to work as an interpreter or translator. To work as an interpreter you need NAATI certification, such as Certified Provisional Interpreter.",
  },
  {
    q: "How do I become an interpreter in Australia?",
    a: "Most people start with NAATI's Certified Provisional Interpreter (CPI) test, the entry-level generalist interpreting test. Before you sit it you need to meet NAATI's prerequisites, for example by completing an interpreting qualification and showing ethical and intercultural competency. NAATI's website explains each pathway.",
  },
  {
    q: "Can I work with 2M Language Services after practising on XINGO?",
    a: "XINGO is partnered with 2M Language Services. Once you're NAATI certified, you can apply to work with 2M as an interpreter. 2M makes its own decisions about who it engages, and practising on XINGO doesn't give you a credential by itself.",
  },
  {
    q: "Does practising on XINGO count towards my visa or give me a credential?",
    a: "No. XINGO is independent practice software. It isn't affiliated with NAATI, Home Affairs or any test provider, and our scores are estimates, not official results. Credentials come from NAATI and the test providers.",
  },
  {
    q: "Can XINGO tell me if I'm eligible for a visa?",
    a: "No. We give general information only. For advice about your situation, speak to a registered migration agent or a legal practitioner. You can check an agent on the official register of migration agents.",
  },
  {
    q: "How much does it cost to start practising?",
    a: `It's free to start. Every account gets ${plans.free.monthlyMinutes} free practice minutes each month, free courses, and one preview dialogue in every premium course. No card needed.`,
  },
];

const sources = [
  { label: "Home Affairs — Who can help you with your application?", url: src.whoCanHelp },
  { label: "Home Affairs — English language visa requirements", url: src.englishTests },
  { label: "Home Affairs — Competent English", url: src.competent },
  { label: "Home Affairs — Points table for Skilled Independent visa (subclass 189)", url: src.points189 },
  { label: "Home Affairs — Documents in languages other than English", url: src.translations },
  { label: "Home Affairs — Free Translating Service", url: src.freeTranslating },
  { label: "NAATI — Credentialed Community Language test", url: src.ccl },
  { label: "NAATI — Certified Provisional Interpreter", url: src.cpi },
  { label: "NAATI — Certification system", url: src.certification },
  { label: "Ahpra — English language skills registration standard", url: src.ahpraEnglish },
  { label: "Australian Medical Council — Clinical examination", url: src.amc },
  { label: "NMBA — Objective structured clinical exam", url: src.nmbaOsce },
  { label: "IELTS — Speaking test format", url: src.ieltsSpeaking },
  { label: "OET — Speaking test information", url: src.oetSpeaking },
  { label: "OMARA — Register of migration agents", url: OMARA_REGISTER },
];

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Migrating to Australia", path: PATH },
];

function SectionHeading({ id, eyebrow, title, description }: { id?: string; eyebrow: string; title: string; description?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-3 scroll-mt-24 text-3xl font-bold tracking-[-0.03em] text-balance sm:text-4xl">
        {title}
      </h2>
      {description ? <p className="mt-3 text-[15px] leading-6 text-gray-500">{description}</p> : null}
    </div>
  );
}

function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener" className={className ?? "font-semibold text-ink underline underline-offset-4"}>
      {children}
    </a>
  );
}

function Disclaimer({ className }: { className?: string }) {
  return (
    <aside
      aria-label="General information, not migration advice"
      className={`flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-[15px] leading-6 sm:p-5 ${className ?? ""}`}
    >
      <Info size={20} className="mt-0.5 shrink-0" aria-hidden />
      <p className="text-gray-700">
        <strong className="text-ink">General information, not migration advice.</strong> Visa rules change — check the{" "}
        <ExternalLink href={HOME_AFFAIRS}>Department of Home Affairs</ExternalLink> and speak to a{" "}
        <ExternalLink href={OMARA_REGISTER}>registered migration agent</ExternalLink> about your situation.
      </p>
    </aside>
  );
}

export default function MigrateToAustraliaPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 sm:px-6">
      <JsonLd
        data={webPageJsonLd({
          path: PATH,
          name: TITLE,
          description: DESCRIPTION,
          about: "English tests, community language points and interpreter certification for people migrating to Australia",
          steps: pathway.map((step) => ({ name: step.title, description: step.body })),
        })}
      />

      <div>
        <MarketingIntro
          eyebrow="Migrating to Australia"
          breadcrumbs={<Breadcrumbs crumbs={crumbs} className="mb-6 sm:mb-8" />}
          title="Moving to Australia? Make your English and your languages count."
          description={
            <>
              Whether you&apos;re planning the move or have just arrived, language skills turn up at every step: the English
              test for your visa, community language points, registration in your profession and, later, work as an
              interpreter. Practise the speaking parts out loud before they count.
              <span className="mt-4 block text-sm leading-6">
                {plans.free.monthlyMinutes} free practice minutes every month. No card needed.
              </span>
            </>
          }
          media={<MigrationPathway className="mk-rise mk-delay-2 mx-auto w-full max-w-md" />}
        >
          <Button asChild size="lg">
            <Link href="/sign-up">
              Start practising free
              <ArrowRight size={18} />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href="#pathway">See the pathway</a>
          </Button>
        </MarketingIntro>
        <Disclaimer className="mt-10" />
      </div>

      {/* The journey at a glance */}
      <section aria-labelledby="pathway">
        <SectionHeading
          id="pathway"
          eyebrow="The journey at a glance"
          title="Where language fits in a typical migration journey."
          description="Not everyone takes every step, and the order varies. Use this as a map, then check the official page for each step."
        />
        <ol className="mt-10 space-y-4">
          {pathway.map((step, index) => (
            <li
              key={step.title}
              className="grid gap-5 rounded-xl border border-gray-200 p-5 sm:p-6 md:grid-cols-[auto_1fr_minmax(0,16rem)] md:gap-8"
            >
              <span
                className={
                  step.practice.length
                    ? "flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-ink"
                    : "flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-200 text-sm font-bold"
                }
                aria-hidden
              >
                {index + 1}
              </span>
              <div>
                <h3 className="text-lg font-bold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2 max-w-2xl text-[15px] leading-6 text-gray-500">{step.body}</p>
                <ExternalLink
                  href={step.official.href}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ink underline underline-offset-4"
                >
                  {step.official.label}
                  <ArrowUpRight size={14} aria-hidden />
                </ExternalLink>
              </div>
              <div className="md:border-l md:border-gray-200 md:pl-8">
                {step.practice.length ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Practise on XINGO</p>
                    <ul className="mt-2 space-y-2">
                      {step.practice.map((item) => (
                        <li key={item.href}>
                          <Link href={item.href} className="group inline-flex items-center gap-1.5 text-[15px] font-semibold">
                            {item.label}
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-sm leading-6 text-gray-500">{step.note}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Where language skills count */}
      <section>
        <SectionHeading
          eyebrow="Where language skills count"
          title="Three places your languages make a difference."
          description="Facts below come from official pages and were checked in October 2026. Rules change, so confirm them before you rely on them."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <article className="flex flex-col rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold tracking-[-0.02em]">Your English test result</h3>
            <p className="mt-2 text-[15px] leading-6 text-gray-500">
              Most visas set an English level. For points-tested skilled visas, a higher level can also earn points. The
              points table for the Skilled Independent visa (subclass 189) currently shows:
            </p>
            <table className="mt-4 w-full text-left text-sm">
              <caption className="sr-only">English language points, subclass 189 points table</caption>
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th scope="col" className="py-2 font-semibold">
                    English level
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody>
                {englishLevels.map((row) => (
                  <tr key={row.level} className="border-b border-gray-200 last:border-0">
                    <td className="py-2">{row.level}</td>
                    <td className="py-2 text-right font-semibold tabular-nums">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm leading-6 text-gray-500">
              Each level maps to minimum scores in each part of the test. See{" "}
              <ExternalLink href={src.competent}>Home Affairs&apos; English level pages</ExternalLink>.
            </p>
          </article>

          <article className="flex flex-col rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold tracking-[-0.02em]">A community language</h3>
            <p className="mt-2 text-[15px] leading-6 text-gray-500">
              The same points table gives <strong className="text-ink">5 points</strong> for a recognised qualification in a
              credentialled community language. That means a NAATI community language credential (the CCL), or NAATI
              certification at Certified Provisional level or above.
            </p>
            <p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-700">
              NAATI says the CCL is not a professional certification. Passing it doesn&apos;t certify you to work as an
              interpreter or translator.
            </p>
            <p className="mt-4 text-sm leading-6 text-gray-500">
              More detail: <Link href="/blog/naati-ccl-5-points-australian-pr" className="font-semibold text-ink underline underline-offset-4">CCL and the 5 points for PR</Link>.
            </p>
          </article>

          <article className="flex flex-col rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold tracking-[-0.02em]">Registration in your profession</h3>
            <p className="mt-2 text-[15px] leading-6 text-gray-500">
              Ahpra says every applicant for registration must meet their National Board&apos;s English language skills
              standard, whether they trained in Australia or overseas. OET is one of the accepted tests.
            </p>
            <p className="mt-4 text-[15px] leading-6 text-gray-500">
              Some health professionals also sit a clinical assessment with simulated patients, where communication is
              assessed throughout:
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <ExternalLink href={src.amc}>AMC clinical examination</ExternalLink>{" "}
                <span className="text-gray-500">— international medical graduates</span>
              </li>
              <li>
                <ExternalLink href={src.nmbaOsce}>NMBA OSCE</ExternalLink>{" "}
                <span className="text-gray-500">— internationally qualified nurses</span>
              </li>
            </ul>
          </article>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Points tables differ between visas. Check the table for the visa you&apos;re applying for on{" "}
          <ExternalLink href={src.points189}>immi.homeaffairs.gov.au</ExternalLink>.
        </p>
      </section>

      {/* How XINGO helps */}
      <section className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src="/images/scenes/newcomer-kitchen-table.webp"
              alt="A woman wearing headphones practises speaking English out loud at her laptop at a kitchen table, with a moving box behind her."
              fill
              sizes="(min-width: 1024px) 520px, calc(100vw - 32px)"
              className="object-cover"
            />
          </div>
          <div className="mk-rise absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl bg-paper/95 p-3 text-sm sm:right-auto" aria-hidden>
            <span className="mk-bars flex h-5 items-end gap-0.5">
              <span className="w-1 rounded-full bg-record" />
              <span className="w-1 rounded-full bg-record" />
              <span className="w-1 rounded-full bg-record" />
              <span className="w-1 rounded-full bg-record" />
              <span className="w-1 rounded-full bg-record" />
            </span>
            <span className="font-semibold">Speaking — practice mode</span>
          </div>
        </div>
        <div>
          <SectionHeading
            eyebrow="How XINGO helps you practise"
            title="Rehearse the speaking parts before they count."
            description="XINGO is spoken practice with AI voice partners. You talk, they answer, and you get specific feedback on what to fix."
          />
          <ul className="mt-8 space-y-5">
            {features.map((feature) => (
              <li key={feature.title} className="flex gap-3">
                <Check size={18} strokeWidth={2.5} className="mt-1 shrink-0 text-success" aria-hidden />
                <div>
                  <p className="font-bold">{feature.title}</p>
                  <p className="mt-1 text-[15px] leading-6 text-gray-500">{feature.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-6 text-gray-500">
            Free to start: {plans.free.monthlyMinutes} practice minutes every month, plus one preview dialogue in every
            premium course. Sessions run in your browser and each is capped at {MAX_ATTEMPT_MINUTES} minutes. XINGO is
            independent practice and doesn&apos;t award any credential.
          </p>
        </div>
      </section>

      {/* Courses by goal */}
      <section>
        <SectionHeading eyebrow="Pick your goal" title="Practice for the tests on your path." />
        <div className="mt-8 grid gap-4 md:grid-cols-[1.1fr_1fr]">
          <Link
            href="/exams/ielts-speaking"
            className="mk-lift group relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-2xl bg-ink p-6 text-paper"
          >
            <Image
              src="/images/scenes/speaking-test-prep.webp"
              alt="A man wearing a headset rehearses a spoken test answer out loud at his desk, holding a small timer."
              fill
              sizes="(min-width: 768px) 560px, calc(100vw - 32px)"
              className="object-cover opacity-60 transition-opacity group-hover:opacity-50"
            />
            <div className="relative">
              <Badge tone="accent">English test</Badge>
              <p className="mt-3 text-2xl font-bold tracking-[-0.03em]">IELTS Speaking mock tests</p>
              <p className="mt-1 max-w-sm text-sm leading-6 text-paper/80">
                All three parts on real timings with an AI examiner, then an estimated band and feedback.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">
                Practise IELTS Speaking <ArrowRight size={16} aria-hidden />
              </span>
            </div>
          </Link>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              { href: "/exams/oet-speaking", tag: "Health English", title: "OET Speaking", body: "Timed role-plays with an AI patient or relative." },
              { href: "/naati/ccl", tag: "Points", title: "NAATI CCL", body: `Two-speaker dialogues in your language, scored out of ${CCL_MAX_SCORE}.` },
              { href: "/exams/amc-clinical-exam", tag: "Doctors", title: "AMC clinical exam", body: "History, counselling and bad-news stations." },
              { href: "/exams/nmba-osce", tag: "Nurses", title: "NMBA OSCE", body: "ISBAR, education, consent and upset relatives." },
              { href: "/naati/cpi", tag: "Interpreting", title: "NAATI CPI", body: "Face-to-face and phone dialogues, consecutive." },
              { href: "/interpreting", tag: "Interpreting", title: "Specialist settings", body: "Medical, legal, NDIS and telephone practice." },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="mk-lift flex h-full flex-col rounded-xl border border-gray-200 p-4 hover:border-ink">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">{item.tag}</span>
                  <span className="mt-1 font-bold">{item.title}</span>
                  <span className="mt-1 text-sm leading-6 text-gray-500">{item.body}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* From practice to work */}
      <section aria-labelledby="work-heading">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <p className="eyebrow">From practice to work</p>
            <h2 id="work-heading" className="mt-3 text-3xl font-bold tracking-[-0.03em] text-balance sm:text-4xl">
              Your languages can be a career, not just points.
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-gray-500">
              Interpreters help people use health, legal and community services in their own language. If you speak
              English and another language well, it&apos;s work worth considering. Here&apos;s the honest version of the path:
            </p>
            <ol className="mt-6 space-y-4">
              {[
                ["The CCL is for points, not work.", "It shows community-level language ability. It isn't a credential to work as an interpreter."],
                ["NAATI certification is the credential.", "The Certified Provisional Interpreter test is NAATI's entry-level generalist interpreting test. You meet NAATI's prerequisites first, for example through an interpreting qualification."],
                ["Practise the format until it's routine.", "XINGO gives you CPI-style dialogues on demand: two AI speakers, you in the middle, scored feedback after each assessed session."],
                ["Then apply for work.", "XINGO is partnered with 2M Language Services. Once you're NAATI certified, you can apply to work with 2M as an interpreter."],
              ].map(([title, body], index) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper" aria-hidden>
                    {index + 1}
                  </span>
                  <p className="text-[15px] leading-6">
                    <strong>{title}</strong> <span className="text-gray-500">{withTwoMLinks(body)}</span>
                  </p>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="primary">
                <Link href="/naati/cpi">
                  See CPI practice
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <a href={TWO_M_URL} target="_blank" rel="noopener">
                  Visit 2M Language Services
                  <ArrowUpRight size={16} />
                </a>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src="/images/scenes/clinic-interpreter.webp"
              alt="An interpreter with a lanyard and notepad interprets between a doctor and an older couple in a community health clinic."
              fill
              sizes="(min-width: 1024px) 480px, calc(100vw - 32px)"
              className="object-cover"
            />
          </div>
        </div>

        <div className="mt-16">
          <h3 className="text-center text-xl font-bold tracking-[-0.02em] sm:text-2xl">2M interprets for organisations including</h3>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-6 text-gray-500">
            <TwoMLink /> decides who it engages. Applying doesn&apos;t guarantee work, and practising on XINGO
            doesn&apos;t give you a credential by itself.
          </p>
          <LogoCarousel className="mt-6" />
        </div>
      </section>

      {/* Practical advice */}
      <section>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div>
            <SectionHeading
              eyebrow="Practical advice"
              title="Small habits that make the move easier."
              description="General tips from preparing for speaking tests and settling in. None of this replaces advice about your own visa."
            />
            <div className="relative mt-8 hidden aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 lg:block">
              <Image
                src="/images/scenes/community-welcome.webp"
                alt="Families of many backgrounds share food and conversation at picnic tables in a sunny suburban park."
                fill
                sizes="400px"
                className="object-cover"
              />
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {advice.map((tip) => (
              <li key={tip.title} className="flex flex-col rounded-xl border border-gray-200 p-5">
                <p className="font-bold">{tip.title}</p>
                <p className="mt-2 flex-1 text-sm leading-6 text-gray-500">{tip.body}</p>
                {tip.link ? (
                  tip.link.external ? (
                    <ExternalLink
                      href={tip.link.href}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ink underline underline-offset-4"
                    >
                      {tip.link.label}
                      <ArrowUpRight size={14} aria-hidden />
                    </ExternalLink>
                  ) : (
                    <Link href={tip.link.href} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ink underline underline-offset-4">
                      {tip.link.label}
                      <ArrowRight size={14} aria-hidden />
                    </Link>
                  )
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <GuideLinks
        title="Guides for your next step"
        slugs={[
          "naati-ccl-5-points-australian-pr",
          "ielts-speaking-part-2-strategy",
          "oet-speaking-role-play-structure",
          "naati-cpi-test-preparation",
        ]}
      />

      <FaqSection title="Questions from people moving to Australia" faqs={faqs} />

      <section aria-labelledby="sources-heading" className="space-y-6">
        <Disclaimer />
        <div>
          <h2 id="sources-heading" className="text-lg font-bold">
            Sources
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Checked October 2026. XINGO isn&apos;t affiliated with Home Affairs, NAATI, Ahpra, the AMC, the NMBA or any test
            provider.
          </p>
          <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {sources.map((source) => (
              <li key={source.url}>
                <ExternalLink href={source.url} className="text-gray-700 underline underline-offset-4 hover:text-ink">
                  {source.label}
                </ExternalLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        title="Start practising for your next step."
        description={`${plans.free.monthlyMinutes} free practice minutes every month. IELTS, OET, CCL and more. No card needed.`}
        href="/sign-up"
        label="Start practising free"
      />
    </main>
  );
}
