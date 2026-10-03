/**
 * Content for the 14-day onboarding series (D-037): 7 tracks × 7 emails, sent
 * every other day after the transactional welcome. Types and the schedule live
 * in ./onboarding-types.ts; sending in convex/onboarding.ts. Framework-free.
 *
 * Voice: a coach checking in, not a sales drip. Most emails give general advice
 * for the learner's test or career with one clear next step. Facts come only
 * from lib/blog, lib/exam-pages, lib/migration-guides and lib/rubrics; XINGO
 * scores are always called estimates. Australian English, "course" not the
 * other word, no invented numbers. Minutes and plans are mentioned once, softly,
 * on day 13. Body is markdown-lite (lib/email/render.ts).
 */

import { getGoal } from "../goals";
import { packs, plans } from "../plans";
import { cclLanguagePages } from "../seo-pages";
import type { OnboardingContext, OnboardingDay, OnboardingTrack } from "./onboarding-types";
import type { BuiltEmail } from "./transactional";

type Draft = {
  subject: string;
  preheader: string;
  /** Paragraphs after the greeting, joined with blank lines. */
  body: string[];
  ctaLabel: string;
  ctaUrl: string;
};

type Series = Record<OnboardingDay, Draft>;

const signature = "The XINGO team";

/** Official pages already cited in lib/blog and lib/migration-guides. */
const official = {
  naatiCcl: "https://www.naati.com.au/migration-assessments/ccl/",
  naatiCclPracticeTest: "https://www.naati.com.au/ccl-practice-test/",
  naatiCclMaterials: "https://www.naati.com.au/migration-assessments/ccl/downloadable-ccl-practice-materials-by-language/",
  naatiCpi: "https://www.naati.com.au/certification/cpi/",
  naatiLearnCpi: "https://learn.naati.com.au/course/view.php?id=337",
  naatiDirectory: "https://www.naati.com.au/online-directory/",
  ausitEthics: "https://ausit.org/code-of-ethics/",
  ieltsSpeaking: "https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-speaking",
  homeAffairsEnglish: "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/english-language",
  oetSpeaking: "https://oet.com/test-information/speaking/",
  ahpraEnglish: "https://www.ahpra.gov.au/Registration/Registration-Standards/English-language-skills/Accepted-English-language-tests.aspx",
  amcClinical: "https://www.amc.org.au/pathways/standard-pathway/amc-assessments/clinical-examination/",
  nmbaOsce: "https://www.nursingmidwiferyboard.gov.au/Accreditation/IQNM/Examination/Objective-structured-clinical-exam.aspx",
  nbcmi: "https://www.certifiedmedicalinterpreters.org/",
  cchi: "https://cchicertification.org/",
  twoM: "https://www.2m.com.au/",
};

type Helpers = {
  ctx: OnboardingContext;
  /** Absolute URL for a site path. */
  url: (path: string) => string;
  /** Markdown link to a site path. */
  link: (label: string, path: string) => string;
  /** Their other language, or null. */
  lang: string | null;
  /** "your Spanish" / "your other language". */
  yourLanguage: string;
  /** Path of the first recommended course for their goal (or the library). */
  coursePath: string;
};

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function helpers(ctx: OnboardingContext, fallbackGoal: string | null): Helpers {
  const base = ctx.siteUrl.replace(/\/+$/, "");
  const url = (path: string) => `${base}${path}`;
  const lang = ctx.language?.trim() ? ctx.language.trim() : null;
  const goal = getGoal(ctx.goalId ?? undefined) ?? getGoal(fallbackGoal ?? undefined);
  const firstCourse = goal?.moduleOrder[0];
  return {
    ctx,
    url,
    link: (label, path) => `[${label}](${url(path)})`,
    lang,
    yourLanguage: lang ? `your ${lang}` : "your other language",
    coursePath: firstCourse ? `/courses/${firstCourse}` : "/courses",
  };
}

function bullets(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

function setupSteps(kind: "roleplay" | "interpreting", h: Helpers) {
  const common = [
    "**Put on headphones.** They stop the AI hearing itself through your speakers.",
    "**Test your microphone** on the start screen. If your browser blocks it, allow it from the address bar.",
  ];
  if (kind === "roleplay") {
    return bullets([
      ...common,
      "**Hold Space (or the mic button) while you talk**, then let go so the other person can answer.",
      "**Choose Practice mode** for your first go. Your task card stays on screen, points tick off as you cover them, and nothing is scored.",
    ]);
  }
  return bullets([
    ...common,
    h.lang
      ? `**Check your language pair** is English and ${h.lang}.`
      : "**Choose your language pair**: English and the language you interpret.",
    "**Hold Space (or the mic button) while you talk, and tap Space to switch** who you're talking to. Start by introducing yourself.",
    "**Choose Practice mode** for your first go. You'll see one step at a time, each turn gets a quick tip, and nothing is scored.",
  ]);
}

function firstSessionsLine(h: Helpers, what: string) {
  const { sessions, bestScore } = h.ctx;
  const best = bestScore ? `, and your best so far is **${bestScore}**` : "";
  return `Nice work: you've already finished ${plural(sessions, `scored ${what}`)}${best}. That's the hardest step done. Here's how to read the results page so each session teaches you something:`;
}

function readingResults(scoreLine: string, breakdownLine: string) {
  return bullets([
    `**Your score** ${scoreLine}`,
    `**Breakdown** ${breakdownLine}`,
    "**What went well** and **Work on next** are based on what you actually said. Pick one item from Work on next, not all of them.",
    "**Your next step** suggests what to try next, and the transcript shows exactly where things slipped.",
  ]);
}

/** Day 7 progress lines from real numbers only. */
function weekProgress(h: Helpers, what: string): string {
  const { sessions, bestScore, minutesLeft } = h.ctx;
  const minutes = `You have **${plural(minutesLeft, "practice minute")}** left right now.`;
  if (sessions === 0) {
    return `It's been a week since you joined, and you haven't done a scored ${what} yet. That's completely fine, and it's not too late. Starting is often the hardest part, so make it small: pick a time today or tomorrow, put it in your calendar, and follow the plan below. ${minutes}`;
  }
  const best = bestScore ? ` Your best score so far is **${bestScore}** (an estimate, not an official result).` : "";
  return `It's been a week since you joined. So far you've completed **${plural(sessions, `scored ${what}`)}**.${best} ${minutes} A good way to keep the momentum going: choose a time for your next session now and put it in your calendar. Practice you've scheduled is much easier to keep than practice you're waiting to find time for.`;
}

function fiveMinutePlan(steps: string[]) {
  return `Here's a five-minute plan for today:\n\n${bullets(steps)}`;
}

function assessedAndCompletion() {
  return "If a session ends before you've finished the task, because time ran out or the conversation stalled, the score is scaled by how much you covered, and an unfinished session can't pass. That's deliberate: in the real test, unfinished work costs marks too.";
}

function transcriptRule() {
  return "The transcript is hidden in assessed sessions, as in the real test. If you open it part-way through, the session switches to Practice mode and isn't scored.";
}

function minutesNote(h: Helpers) {
  const free = h.ctx.freeMonthlyMinutes;
  const pro = plans.professional;
  if (h.ctx.isPro) {
    return `A note on minutes: your ${pro.label} plan gives you **${pro.monthlyMinutes} practice minutes** each month, and any pack minutes you've bought stay on your account and never expire.`;
  }
  return `A note on minutes: the Free plan gives you **${free} practice minutes** each month, which is enough for a short session or two. If you want more, minute packs never expire, and ${pro.label} gives you ${pro.monthlyMinutes} minutes a month plus every course. No pressure either way. Everything is under ${h.link("Plan & minutes", "/billing")}.`;
}

const replyInvite = "If you have a question about your preparation, or something in XINGO isn't working for you, just reply to this email.";

function cclPagePath(language: string | null) {
  if (!language) return "/naati/ccl";
  const lower = language.toLowerCase();
  const page = cclLanguagePages.find((p) => p.name.toLowerCase() === lower || lower.startsWith(p.name.toLowerCase()));
  return page ? `/naati/ccl/${page.slug}` : "/naati/ccl";
}

// ---------------------------------------------------------------------------
// IELTS Speaking
// ---------------------------------------------------------------------------

function ielts(h: Helpers): Series {
  const course = h.coursePath;
  const started = h.ctx.sessions > 0;
  return {
    1: started
      ? {
          subject: "Your first IELTS mock test is done. Here's what next",
          preheader: "How to read your estimated band and feedback, and the one thing to do with it.",
          body: [
            firstSessionsLine(h, "mock test"),
            readingResults(
              "is an estimated band. Pronunciation is a quarter of the real band but can't be judged from a transcript, so treat it as a guide, not an official result.",
              "shows fluency and coherence, vocabulary, grammar, how well you developed your answers, and whether you stayed on the question.",
            ),
            "Then open the transcript and find one answer you could have extended with a reason and an example. Do another mock test with just that fix in mind.",
          ],
          ctaLabel: "Do another mock test",
          ctaUrl: h.url(course),
        }
      : {
          subject: "Your first IELTS mock test, in five minutes",
          preheader: "Headphones on, mic checked, Practice mode first. The quickest way to get started.",
          body: [
            "Welcome to XINGO. The best preparation for IELTS Speaking is speaking, out loud, to someone who's listening. So here's how to get your first mock test done today in about five minutes:",
            setupSteps("roleplay", h),
            "Don't aim for perfect answers yet. Aim to keep talking: give each answer a reason and an example, the way you would with a friendly examiner.",
            "When you're comfortable, switch to Assessed mode. It runs all three parts on the real timings and gives you an estimated band with feedback.",
          ],
          ctaLabel: "Start a mock test",
          ctaUrl: h.url(course),
        },
    3: {
      subject: "IELTS Part 2: how to fill two minutes without a script",
      preheader: "Use your minute of preparation for keywords, not sentences, then follow a simple four-part shape.",
      body: [
        "Part 2 is where fluency and coherence are most exposed, because nobody is asking you questions to keep you going. You get a cue card, one minute to prepare, then you speak for one to two minutes.",
        "**In your minute, write keywords, not sentences.** A few words against each prompt is enough, plus one 'extra' line: a specific moment or feeling you can fall back on when the prompts run out.",
        "**Then use a simple shape:**",
        bullets([
          "A one-sentence opener that names your topic.",
          "The prompts in order, each with a detail, not just a short answer.",
          "A story or turning point. This is where your past tenses and vocabulary get a workout.",
          "A reflection to finish: what it meant to you, or how you feel about it now.",
        ]),
        "If the examiner stops you before you finish, that's fine. It means you used the time well. Running out of things to say well short of two minutes is the bigger risk.",
        `Our ${h.link("Part 2 guide", "/blog/ielts-speaking-part-2-strategy")} has a worked example. Then try it: do a mock test and focus only on your Part 2 talk.`,
      ],
      ctaLabel: "Practise Part 2 now",
      ctaUrl: h.url(course),
    },
    5: {
      subject: "Five IELTS Speaking habits that hold your band back",
      preheader: "Short answers, memorised scripts and long silences, and what to do instead.",
      body: [
        "Most IELTS Speaking problems aren't about knowing English. They're habits, and habits can be changed with practice. Here are five to watch for:",
        bullets([
          "**One-line answers in Part 1.** Add a reason and an example to every answer.",
          "**Memorised paragraphs.** Examiners are trained to notice rehearsed language. Practise flexible language instead of scripts.",
          "**Skipping prompts in Part 2.** Cover every point on the card and keep going until you're stopped.",
          "**Fancy words used slightly wrongly.** Being precise beats being impressive. 'I could barely float' works better than a rare word in the wrong place.",
          "**Forgetting Part 3.** It asks about society, not you. Give a view, a reason, an example and, where it fits, a contrasting view.",
        ]),
        "If your mind goes blank, go back to your notes, add a comparison, or describe a feeling. One 'Let me think…' is fine; constant 'um' isn't.",
        "Pick the one habit you recognise most and make it your only goal in your next mock test.",
      ],
      ctaLabel: "Practise one habit",
      ctaUrl: h.url(course),
    },
    7: {
      subject: "Your first week of IELTS practice",
      preheader: started ? "A quick look at your progress so far, and the next step." : "It's not too late. Here's a five-minute plan to get your first mock test done.",
      body: started
        ? [
            weekProgress(h, "mock test"),
            "A useful habit now: compare the breakdown across your sessions rather than the band alone. If fluency is ahead of vocabulary, spend this week on topic vocabulary. If your answers are short, practise extending them.",
            "Remember the band is an estimate. It leaves out pronunciation, so keep recording yourself on your phone and listening back for that.",
            "Your Progress page shows every session in one place.",
          ]
        : [
            weekProgress(h, "mock test"),
            fiveMinutePlan([
              "Put on headphones and open the IELTS Speaking course.",
              "Choose Practice mode, so nothing is scored.",
              "Answer the Part 1 questions out loud, adding a reason to each answer.",
              "Stop there if you like. You've started.",
            ]),
            "Five minutes of real speaking beats an hour of reading about the test.",
          ],
      ctaLabel: started ? "See my progress" : "Start a 5-minute session",
      ctaUrl: h.url(started ? "/progress" : course),
    },
    9: {
      subject: "Taking IELTS for a visa? Check these before you book",
      preheader: "Which IELTS versions Home Affairs accepts, how levels work, and why your weakest skill matters.",
      body: [
        "If your IELTS result is for an Australian visa, a few official details are worth checking before you book. At the time of writing:",
        bullets([
          "**Sit it at a secure test centre.** Paper and computer-based tests are fine, but Home Affairs lists IELTS Online as not accepted for visas.",
          "**Every component counts.** English levels are minimums in each of the four skills, not an average. In IELTS, Competent is 6 in each, Proficient 7 and Superior 8, for tests taken from 7 August 2025.",
          "**Higher levels earn points.** Proficient English adds 10 points and Superior 20 in the skilled points test.",
          "**Results don't last forever.** For most visas, the score must be from the three years before you apply.",
          "**Registering as a health professional?** Ahpra accepts IELTS Academic, not General Training.",
        ]),
        `Always confirm on the official [Home Affairs English page](${official.homeAffairsEnglish}) and the [IELTS Speaking format page](${official.ieltsSpeaking}). XINGO isn't affiliated with IELTS or Home Affairs; we just want you to book with the right information.`,
        "Our guide puts it all in one place, with the score tables.",
      ],
      ctaLabel: "Read the English test guide",
      ctaUrl: h.url("/migrate-to-australia/english-test-for-australian-pr"),
    },
    11: {
      subject: "Ready for a full IELTS mock under test conditions?",
      preheader: "Assessed mode runs all three parts on real timings, with no hints. Here's how scoring works.",
      body: [
        "Once Practice mode feels comfortable, the next step is an assessed mock test. It runs all three parts on the real timings, the examiner doesn't give feedback mid-test, and you get an estimated band at the end.",
        "A few things worth knowing:",
        bullets([
          "**Every session has a time limit**, like the real test.",
          `**Finishing matters.** ${assessedAndCompletion()}`,
          `**No peeking.** ${transcriptRule()}`,
        ]),
        `After each assessed test, check your ${h.link("Progress page", "/progress")} to see your sessions side by side. Look for the criterion that moves least, and make that your focus.`,
        `Want more variety? The ${h.link("marketplace", "/marketplace")} has community courses, including English-only role-plays, if you'd like to practise everyday conversation alongside the test.`,
      ],
      ctaLabel: "Take an assessed mock test",
      ctaUrl: h.url(course),
    },
    13: {
      subject: "A simple two-week plan for IELTS Speaking",
      preheader: "Short daily practice, one mock test a week, and a way to track what's improving.",
      body: [
        "Two weeks in, the most useful thing you can do is make speaking practice a habit. Here's a simple plan for the next fortnight:",
        bullets([
          "**Most days, 10 minutes:** pick a cue card you haven't seen, take one minute for notes, speak for two minutes and record it. Listen back once.",
          "**Twice a week:** answer three Part 3-style questions on the same topic: view, reason, example.",
          "**Once a week:** a full assessed mock test on XINGO, then compare the breakdown on your Progress page.",
          "**Keep a short list** of words you reached for and couldn't find, and use them in your next session.",
        ]),
        minutesNote(h),
        replyInvite,
        "Good luck with your preparation.",
      ],
      ctaLabel: "Plan my next session",
      ctaUrl: h.url(course),
    },
  };
}

// ---------------------------------------------------------------------------
// OET Speaking
// ---------------------------------------------------------------------------

function oet(h: Helpers): Series {
  const course = "/courses";
  const started = h.ctx.sessions > 0;
  return {
    1: started
      ? {
          subject: "Your first OET role-play is done. Here's what next",
          preheader: "How to read your estimated score and feedback, and the one thing to work on.",
          body: [
            firstSessionsLine(h, "role-play"),
            readingResults(
              "is an estimate on OET's 0–500 scale, with an estimated grade. Intelligibility and pronunciation can't be judged from a transcript, so it's a guide, not an official result.",
              "follows OET's clinical communication criteria: relationship and the patient's perspective, structure, information gathering and giving, plus language and fluency.",
            ),
            "Then read the transcript and find the moment the patient pushed back. Did you respond to their reason, or repeat yourself? Try the same card again with that in mind.",
          ],
          ctaLabel: "Try another role-play",
          ctaUrl: h.url(course),
        }
      : {
          subject: "Your first OET role-play, in five minutes",
          preheader: "Pick nursing or medicine, read the card, and lead the conversation. Here's how to start.",
          body: [
            "Welcome to XINGO. OET Speaking rewards people who've rehearsed out loud with a patient who reacts, so the best first step is a single role-play today. It takes about five minutes:",
            setupSteps("roleplay", h),
            "Open the **nursing** or **medicine** course, whichever matches your profession, and pick any card. Read the setting and tasks, then open the conversation yourself, as you would in the test: greet the patient, introduce yourself and say why you're there.",
            "When you're ready, Assessed mode runs on a five-minute timer and gives you an estimated score with feedback against the clinical communication criteria.",
          ],
          ctaLabel: "Start a role-play",
          ctaUrl: h.url(course),
        },
    3: {
      subject: "A five-minute shape for every OET role-play",
      preheader: "Open, explore, explain, close: a practical structure that gives each criterion a moment.",
      body: [
        "Five of OET's nine Speaking criteria are about clinical communication, not English. A clear structure is the easiest way to show them. Here's a practical shape (not an official model) for your five minutes:",
        bullets([
          "**Open (about 30 seconds).** Greet, introduce yourself and your role, confirm the patient's name and the purpose. Ask if now is okay.",
          "**Explore (about a minute).** Before explaining anything, find out what they know and how they feel. An open question often reveals the concern the interlocutor was told to raise.",
          "**Explain and negotiate (2 to 2½ minutes).** Work through the tasks. Signpost each one, give information in small chunks and check understanding.",
          "**Close (about 30 seconds).** Summarise, ask them to explain the key point back (teach-back), invite questions and say what happens next.",
        ]),
        "In your three minutes of preparation, underline the tasks, spot the emotional hook, and decide on lay words for any jargon on the card.",
        `Our ${h.link("OET role-play guide", "/blog/oet-speaking-role-play-structure")} has a worked example. Then try the shape on a fresh card.`,
      ],
      ctaLabel: "Practise the structure",
      ctaUrl: h.url(course),
    },
    5: {
      subject: "Common OET Speaking mistakes, and easy fixes",
      preheader: "Monologues, jargon and formulaic empathy can cost you. Small changes make a big difference.",
      body: [
        "Strong English alone doesn't guarantee a strong OET Speaking result. A candidate with good grammar who rattles through the tasks without listening can lose marks that a well-structured candidate earns. Watch for these:",
        bullets([
          "**Reading the tasks off the card in order**, without connecting them to what the patient just said.",
          "**Long monologues** with no pause to check understanding. Chunk, then check.",
          "**Medical terms the patient wouldn't know**, or explaining them only after using them several times.",
          "**Formulaic empathy.** 'I understand how you feel' can count against you. Name the specific emotion: 'You sound frustrated that you've been waiting four hours.'",
          "**Dropping a task to avoid conflict.** Return to it gently and explain why it matters.",
          "**Running out of time** before the close.",
        ]),
        "Choose one of these and make it your only focus in your next role-play. Small, specific goals improve faster than trying to fix everything at once.",
      ],
      ctaLabel: "Practise with a new card",
      ctaUrl: h.url(course),
    },
    7: {
      subject: "One week of OET practice: where you're at",
      preheader: started ? "Your progress so far, and how to use it this week." : "It's not too late. Here's a five-minute plan for your first role-play.",
      body: started
        ? [
            weekProgress(h, "role-play"),
            "This week, look at the breakdown rather than the total. If 'Providing structure' is your lowest, practise the open–explore–explain–close shape. If it's 'Relationship and patient's perspective', spend longer exploring before you explain.",
            "Because intelligibility can't be judged from a transcript, keep recording yourself and listening back for pace and clarity.",
            "Your Progress page shows every session together.",
          ]
        : [
            weekProgress(h, "role-play"),
            fiveMinutePlan([
              "Put on headphones and open the nursing or medicine course.",
              "Choose Practice mode, so nothing is scored.",
              "Read one card, then just do the opening: greet, introduce yourself, confirm their name and the purpose.",
              "If you're enjoying it, keep going.",
            ]),
            "One real conversation will teach you more about your OET readiness than another week of reading.",
          ],
      ctaLabel: started ? "See my progress" : "Start a 5-minute role-play",
      ctaUrl: h.url(started ? "/progress" : course),
    },
    9: {
      subject: "OET and Ahpra: the details worth checking",
      preheader: "The Speaking minimum for tests from 23 April 2026, test-centre rules, and where to confirm them.",
      body: [
        "If your OET result is for registration in Australia, a few official details matter as much as your preparation. At the time of writing:",
        bullets([
          "**Ahpra lists a Speaking minimum of 360** for OET tests taken on or after 23 April 2026, with new minimums across the accepted tests.",
          "**Results generally need to be recent**, from the two years before you apply for registration.",
          "**Take it at a test centre.** Ahpra accepts results from tests taken at a test centre, and Home Affairs doesn't accept OET@Home for visas.",
          "**The format:** a short warm-up that isn't assessed, then two role-plays of about five minutes, each after around three minutes' preparation. It's recorded and marked later; the interlocutor doesn't mark you.",
        ]),
        `Check the official [OET Speaking information](${official.oetSpeaking}) and [Ahpra's accepted tests page](${official.ahpraEnglish}) before you book. XINGO isn't affiliated with OET or Ahpra, and our scores are estimates.`,
        `For the bigger picture, our guides for ${h.link("nurses", "/migrate-to-australia/nurses-moving-to-australia")} and ${h.link("doctors", "/migrate-to-australia/doctors-moving-to-australia")} moving to Australia explain where OET fits.`,
      ],
      ctaLabel: "Read IELTS vs PTE vs OET",
      ctaUrl: h.url("/migrate-to-australia/ielts-vs-pte-vs-oet"),
    },
    11: {
      subject: "Practise OET role-plays like the real thing",
      preheader: "Assessed mode, the five-minute timer and why finishing every task matters.",
      body: [
        "Once you're comfortable in Practice mode, start doing some role-plays in Assessed mode. They run on a five-minute timer with no hints, and the patient or relative reacts to what you say: scared, sceptical or angry.",
        bullets([
          `**Cover every task.** ${assessedAndCompletion()}`,
          `**No peeking.** ${transcriptRule()}`,
          "**Mix up the cards.** Don't get comfortable with one patient's mood. The test may give you a reluctant or emotional patient on purpose.",
        ]),
        `Track your sessions on your ${h.link("Progress page", "/progress")} and watch which criterion moves least.`,
        `If your registration path also includes the ${h.link("NMBA OSCE", "/exams/nmba-osce")} or the ${h.link("AMC clinical exam", "/exams/amc-clinical-exam")}, XINGO has courses for the communication side of those too.`,
      ],
      ctaLabel: "Do an assessed role-play",
      ctaUrl: h.url(course),
    },
    13: {
      subject: "Your next two weeks of OET Speaking practice",
      preheader: "A simple routine: short daily practice, timed role-plays and one focus each week.",
      body: [
        "Two weeks in, consistency matters more than intensity. Here's a simple routine for the next fortnight:",
        bullets([
          "**Three or four times a week:** one timed role-play. Alternate Practice and Assessed mode.",
          "**Before each one:** spend your three minutes underlining tasks, spotting the emotional hook and choosing lay words.",
          "**After each one:** note one thing to keep and one thing to change.",
          "**Once a week:** practise with a colleague or friend playing the patient, and record it for pronunciation and pace.",
        ]),
        minutesNote(h),
        replyInvite,
        "Good luck with your preparation.",
      ],
      ctaLabel: "Plan my next role-play",
      ctaUrl: h.url(course),
    },
  };
}

// ---------------------------------------------------------------------------
// Clinical: AMC Clinical Exam and NMBA OSCE
// ---------------------------------------------------------------------------

function clinical(h: Helpers): Series {
  const amc = h.ctx.goalId === "amc";
  const course = amc ? "/courses/amc-clinical-exam" : "/courses/nmba-osce-nursing";
  const exam = amc ? "AMC clinical exam" : "NMBA OSCE";
  const unit = "station";
  const started = h.ctx.sessions > 0;
  const blog = amc ? "/blog/amc-clinical-exam-communication-stations" : "/blog/nmba-osce-communication-isbar";
  const guide = amc ? "/migrate-to-australia/doctors-moving-to-australia" : "/migrate-to-australia/nurses-moving-to-australia";

  return {
    1: started
      ? {
          subject: amc ? "Your first AMC station is done. Here's what next" : "Your first OSCE station is done. Here's what next",
          preheader: "How to read your score and feedback, and the one thing to work on next.",
          body: [
            firstSessionsLine(h, unit),
            readingResults(
              "is XINGO's estimate, not an official result. Physical examination and hands-on skills aren't assessed in voice practice.",
              amc
                ? "covers history and assessment, explanation, structure and time, empathy and professionalism, and communication."
                : "covers task completion, language, fluency, interaction and professionalism.",
            ),
            amc
              ? "Then check the transcript against the stem: did you reach every task in the eight minutes? If not, plan your time split before the next station."
              : "Then check the transcript: did your opening include identity checks and consent, and did every escalation end with a specific request?",
          ],
          ctaLabel: "Try another station",
          ctaUrl: h.url(course),
        }
      : {
          subject: amc ? "Your first AMC station, in five minutes" : "Your first OSCE station, in five minutes",
          preheader: "Headphones, mic check, Practice mode. The quickest way to rehearse a station out loud.",
          body: [
            `Welcome to XINGO. The ${exam} asks you to do things out loud, with a person in front of you and a clock running. The best first step is one station today:`,
            setupSteps("roleplay", h),
            amc
              ? "Read the stem, then talk to the AI patient or relative. They reveal key history only when you ask, question your jargon and react like a real person."
              : "Read your task, then talk to the AI patient, relative or colleague: escalate a deteriorating patient, educate, gain consent or calm an upset relative.",
            "When you're ready, Assessed mode times you like the exam: eight minutes after reading.",
          ],
          ctaLabel: "Start a station",
          ctaUrl: h.url(course),
        },
    3: amc
      ? {
          subject: "AMC stations: do every task in the stem",
          preheader: "Not finishing the tasks is one of the commonest reasons stations go badly. Here's how to pace eight minutes.",
          body: [
            "In the AMC clinical exam, not completing the tasks is one of the commonest reasons stations go badly. If the stem says take a focused history, explain the likely diagnosis and outline management, you need to reach all three in eight minutes.",
            "**Use your reading time to split the clock.** For a history-and-explain station, you might aim for about four minutes of history, one to summarise and give the diagnosis, and the rest on management and questions.",
            "**For history stations:**",
            bullets([
              "Open well: introduce yourself, confirm name and age, ask an open question, then let them talk.",
              "Characterise the main problem and ask red-flag questions early.",
              "Ask about ideas, concerns and expectations. 'What were you worried this might be?' often unlocks the real agenda.",
              "Summarise briefly before moving to the next task.",
            ]),
            `Our ${h.link("AMC communication stations guide", blog)} covers counselling and bad-news stations too. Then try a station with a planned time split.`,
          ],
          ctaLabel: "Practise a timed station",
          ctaUrl: h.url(course),
        }
      : {
          subject: "ISBAR for the OSCE: the two parts people weaken",
          preheader: "Interpret your observations and always make a specific request. Here's how.",
          body: [
            "ISBAR (Identify, Situation, Background, Assessment, Recommendation) is widely used in Australian health services, and it's a sensible default whenever an OSCE station asks you to escalate or hand over care.",
            "The two parts candidates most often weaken:",
            bullets([
              "**Assessment.** Don't just read out observations. Say what you think is happening: 'I think she may be septic or bleeding.'",
              "**Recommendation.** Ask for something specific, by a time: 'I'd like you to review her within 30 minutes. In the meantime, can I start oxygen and take bloods?'",
            ]),
            "Then close the loop: repeat back any orders, confirm when they'll attend, and say you'll call back if anything changes. If a simulated doctor is rushed and asks 'So what do you want me to do?', that's your cue for a clear recommendation.",
            `Our ${h.link("ISBAR and OSCE communication guide", blog)} has a full worked call. Then try an escalation station out loud.`,
          ],
          ctaLabel: "Practise an ISBAR call",
          ctaUrl: h.url(course),
        },
    5: amc
      ? {
          subject: "Common AMC station mistakes, and how to fix them",
          preheader: "Jargon, closed-question runs, rushed bad news and skipped risk questions.",
          body: [
            "Most AMC communication mistakes aren't about medical knowledge. They're about what happens under time pressure in a second language. Watch for these:",
            bullets([
              "**Running out of time** before the last task. Glance at the clock once or twice, not constantly.",
              "**Long runs of closed questions.** Start open, then focus.",
              "**Jargon.** 'Your thyroid is a gland in your neck that controls how fast your body runs' beats 'You have hypothyroidism'.",
              "**Rushing bad news.** Deliver it, then stop talking. Acknowledge the emotion before moving to next steps, and avoid false reassurance.",
              "**Avoiding the suicide question.** Ask directly and compassionately; asking doesn't plant the idea.",
              "**Management that isn't Australian.** Refer to the GP, local services and Australian guidelines, and safety-net clearly.",
            ]),
            "Pick one of these as your focus for your next station, and listen for it in the transcript afterwards.",
          ],
          ctaLabel: "Practise one fix",
          ctaUrl: h.url(course),
        }
      : {
          subject: "Common OSCE communication slips, and easy fixes",
          preheader: "A missing opening, vague handovers and 'Do you understand?' Small habits that cost marks.",
          body: [
            "Many overseas-qualified nurses know exactly what to do clinically but haven't practised saying it in Australian clinical English under time pressure. These slips come up often:",
            bullets([
              "**No consistent opening.** Hand hygiene, introduce yourself, check identity, explain what you'll do, gain consent. Every patient station, every time.",
              "**Reading observations without interpreting them** in an escalation call.",
              "**Ending a call without a request.** Say exactly what you need and by when.",
              "**'Do you understand?'** Use teach-back instead: 'Can you tell me in your own words when you'd call us?'",
              "**A warm but vague handover.** Include numbers, times and outstanding tasks.",
              "**Arguing with an upset relative.** Acknowledge the specific concern, explain what's being done and involve them in the plan.",
            ]),
            "Choose one and make it your single focus for your next station.",
          ],
          ctaLabel: "Practise one fix",
          ctaUrl: h.url(course),
        },
    7: {
      subject: amc ? "One week of AMC practice: where you're at" : "One week of OSCE practice: where you're at",
      preheader: started ? "Your progress so far, and what to focus on this week." : "It's not too late. Here's a five-minute plan for your first station.",
      body: started
        ? [
            weekProgress(h, unit),
            amc
              ? "This week, look at 'Structure & time' in your breakdown. If it's lowest, plan your time split during reading time before every station."
              : "This week, look at which part of each station feels least natural: the opening, the escalation, the education or the relative. Practise that part out loud daily.",
            "Then re-read one transcript as if you were the examiner. Would a patient have understood every explanation without medical training?",
            "Your Progress page shows every session in one place.",
          ]
        : [
            weekProgress(h, unit),
            fiveMinutePlan([
              "Put on headphones and open the course.",
              "Choose Practice mode, so nothing is scored.",
              amc ? "Read one stem and just take the history for a few minutes." : "Read one task and just do your opening: identify, explain, consent.",
              "Stop there if you like. You've started.",
            ]),
            "Eight minutes goes faster than you expect. The sooner you've felt it, the better.",
          ],
      ctaLabel: started ? "See my progress" : "Start a 5-minute station",
      ctaUrl: h.url(started ? "/progress" : course),
    },
    9: amc
      ? {
          subject: "The AMC clinical exam: the official details",
          preheader: "Stations, timings, how passing works and where to check the current specifications.",
          body: [
            "Station numbers, timings and pass rules can change, so it's worth knowing where to check. At the time of writing, the AMC describes:",
            bullets([
              "**16 assessed stations plus 4 rest stations.** Each is 10 minutes: 2 minutes' reading and 8 minutes of assessment.",
              "**14 scored stations.** Two are pilot stations. You pass with a pass in 9 or more of the 14.",
              "**Station types** across history taking, examination, diagnostic formulation and management, including counselling and education.",
              "**Online or in person.** Online stations have no hands-on examination; you describe your approach instead.",
              "**On the Standard pathway**, you pass the AMC CAT MCQ exam before the clinical exam.",
            ]),
            `Confirm everything on the [AMC clinical examination page](${official.amcClinical}). XINGO isn't affiliated with the AMC, and our station scores are estimates for practice.`,
            `Our guide for ${h.link("doctors moving to Australia", guide)} covers the pathways and English requirements, including the OET Speaking minimum of 360 for tests from 23 April 2026.`,
          ],
          ctaLabel: "Read the doctors' guide",
          ctaUrl: h.url(guide),
        }
      : {
          subject: "The NMBA OSCE: the official details",
          preheader: "Where the OSCE fits after the Self-check, how it runs, and where to check venues and dates.",
          body: [
            "The OSCE is one step in a longer process, so it helps to know where it fits. At the time of writing, the NMBA describes:",
            bullets([
              "**The Self-check first.** It places you in a stream. Stream B goes through Orientation Part 1, a portfolio, an MCQ exam (the NCLEX-RN for registered nurses) and then the OSCE.",
              "**10 stations** for registered nurses, with simulated patients, assessed against the Registered Nurse Standards for Practice. Communication is assessed in every station.",
              "**In person, in Australia only.** Check the NMBA for venues, dates and fees.",
              "**Results within eight weeks.** A pass stays valid for five years.",
            ]),
            `Confirm everything on the [NMBA OSCE page](${official.nmbaOsce}) and in the candidate handbook linked there. XINGO isn't affiliated with the NMBA or Ahpra, and our scores are estimates for practice.`,
            `Our guide for ${h.link("nurses moving to Australia", guide)} covers the English standard, the Self-check and the fast-track pathway.`,
          ],
          ctaLabel: "Read the nurses' guide",
          ctaUrl: h.url(guide),
        },
    11: {
      subject: amc ? "Run AMC stations under exam conditions" : "Run OSCE stations under exam conditions",
      preheader: "Assessed mode, the eight-minute timer, and why finishing every task matters.",
      body: [
        "Once Practice mode feels comfortable, move some stations to Assessed mode. You get the timer, no hints, and a score with feedback at the end, like a real station.",
        bullets([
          `**Every task counts.** ${assessedAndCompletion()}`,
          `**No peeking.** ${transcriptRule()}`,
          "**Mix station types** so you don't over-prepare one format.",
        ]),
        "Voice practice covers the communication in each station, not hands-on skills, so pair it with clinical practice.",
        `Check your ${h.link("Progress page", "/progress")} after each one. If you still need an English result, the ${h.link("OET Speaking", "/exams/oet-speaking")} course uses the same kind of role-plays.`,
      ],
      ctaLabel: "Do an assessed station",
      ctaUrl: h.url(course),
    },
    13: {
      subject: amc ? "A two-week plan for AMC communication stations" : "A two-week plan for OSCE communication stations",
      preheader: "Timed stations, mixed types and one focus per week. A routine you can keep.",
      body: [
        "Two weeks in, the goal is a routine you can keep. Here's a simple plan for the next fortnight:",
        bullets(
          amc
            ? [
                "**Three or four times a week:** one timed station, rotating history, counselling, bad news and mental health.",
                "**Every station:** plan your time split during reading time.",
                "**Weekly:** swap roles with a study partner so you see stations from the patient's chair.",
                "**After each:** listen for jargon, closed-question runs and missed tasks.",
              ]
            : [
                "**Daily, two minutes:** say ISBAR out loud for one made-up patient until the order is automatic.",
                "**Three or four times a week:** one timed station, rotating escalation, education, consent and upset relatives.",
                "**Weekly:** practise an escalation call with a partner playing an impatient doctor.",
                "**After each:** check your opening, your request and your teach-back.",
              ],
        ),
        minutesNote(h),
        replyInvite,
        "Good luck with your preparation.",
      ],
      ctaLabel: "Plan my next station",
      ctaUrl: h.url(course),
    },
  };
}

// ---------------------------------------------------------------------------
// NAATI CCL
// ---------------------------------------------------------------------------

function ccl(h: Helpers): Series {
  const course = h.coursePath;
  const started = h.ctx.sessions > 0;
  const langPage = cclPagePath(h.lang);
  const langPageLabel = h.lang && langPage !== "/naati/ccl" ? `${h.lang} CCL page` : "CCL language pages";
  return {
    1: started
      ? {
          subject: "Your first CCL dialogue is scored. Here's how to read it",
          preheader: "What your score out of 90 means, what the breakdown shows, and what to drill next.",
          body: [
            firstSessionsLine(h, "dialogue"),
            readingResults(
              "is out of 90, with 63 as the pass mark, the same scale as the real test. It's XINGO's estimate, not a NAATI result.",
              "shows accuracy, quality of language, delivery, technique and register.",
            ),
            "Then open the transcript and count anything you left out. Omissions are the most common accuracy error in the CCL, and they're very trainable. Make 'nothing missing' your only goal in the next dialogue.",
          ],
          ctaLabel: "Interpret another dialogue",
          ctaUrl: h.url(course),
        }
      : {
          subject: h.lang ? `Your first ${h.lang} CCL dialogue, in five minutes` : "Your first CCL dialogue, in five minutes",
          preheader: "Headphones, mic check, language pair, Practice mode. The quickest way to start.",
          body: [
            `Welcome to XINGO. The CCL is a speaking test, so the best preparation is interpreting out loud, both ways. Here's how to do your first dialogue in ${h.yourLanguage} today, in about five minutes:`,
            setupSteps("interpreting", h),
            "You'll hear an English-speaking professional and a community member. Interpret each turn into the other language, in the first person, as if you were the speaker.",
            "When you're ready, Assessed mode runs the dialogue without tips and scores it out of 90.",
          ],
          ctaLabel: "Start a CCL dialogue",
          ctaUrl: h.url(course),
        },
    3: {
      subject: "How the CCL is marked, and what that means for you",
      preheader: "Marks are deducted, not added, and each dialogue must pass on its own. Practise accordingly.",
      body: [
        "Knowing how the CCL is marked changes how you practise. At the time of writing, according to NAATI:",
        bullets([
          "**Two dialogues, each marked out of 45**, for a total of 90.",
          "**Marking is by deduction.** You start with full marks and lose them for errors, weighted by how much each affects communication. A changed number or missing instruction costs more than a small grammar slip.",
          "**You need 63 overall and at least 29 in each dialogue.** A strong first dialogue can't rescue a weak second one.",
          "**Segments are 35 words or less**, and you should start within about five seconds of the chime.",
        ]),
        "So: treat every dialogue as if it has to pass on its own, and aim for consistency over a few brilliant segments. Omissions are the most common accuracy error, usually a detail at the end of a long segment: the second item in a list, an 'unless', a 'by Friday'.",
        `Our guide to ${h.link("CCL format and marking", "/blog/naati-ccl-test-format-and-marking")} has worked examples. Then try a dialogue with one goal: nothing left out.`,
      ],
      ctaLabel: "Practise a dialogue",
      ctaUrl: h.url(course),
    },
    5: {
      subject: "The CCL mistakes that cost the most marks",
      preheader: "Omissions, changed meaning, English words, register slips and numbers, with a fix for each.",
      body: [
        "Most CCL errors are invisible while you're speaking. Here are the common ones, and how to fix each:",
        bullets([
          "**Leaving things out.** Note numbers, lists and conditions as you listen.",
          "**Changing the meaning.** 'May' becomes 'will', 'last week' becomes 'next week', a dropped 'not' reverses the message.",
          "**Adding things.** Interpret in the first person and stop when the message ends.",
          `**Leaning on English words.** Use the ${h.lang ?? "other-language"} term where a common one exists.`,
          "**Register slips.** Decide how you'll address each speaker and stay consistent.",
          "**Numbers, dates and names.** Ten minutes of number drills a day, both directions.",
          "**Hesitation and constant self-correction.** Start with what you're sure of; use one clean correction phrase.",
        ]),
        "Record your next dialogue and keep a simple tally against the transcript. After a few dialogues, your biggest column tells you exactly what to practise.",
        `More detail in ${h.link("common CCL mistakes", "/blog/naati-ccl-common-mistakes")}.`,
      ],
      ctaLabel: "Practise and tally your errors",
      ctaUrl: h.url(course),
    },
    7: {
      subject: "One week of CCL practice: where you're at",
      preheader: started ? "Your progress so far, and how to use it this week." : "It's not too late. Here's a five-minute plan for your first dialogue.",
      body: started
        ? [
            weekProgress(h, "dialogue"),
            "This week, look at which part of the breakdown is lowest. If it's accuracy, work on note-taking for numbers and conditions. If it's quality of language, build a glossary of the words you habitually say in English.",
            "Remember: in the test, each dialogue needs 29 out of 45 on its own. Practising two dialogues back to back builds that stamina.",
          ]
        : [
            weekProgress(h, "dialogue"),
            fiveMinutePlan([
              "Put on headphones and open the CCL course.",
              h.lang ? `Check your language pair is English and ${h.lang}.` : "Check your language pair.",
              "Choose Practice mode, so nothing is scored.",
              "Introduce yourself, then interpret the first few turns. Stop whenever you like.",
            ]),
            "Every CCL candidate has to get used to hearing themselves interpret. The sooner you start, the sooner it feels normal.",
          ],
      ctaLabel: started ? "See my progress" : "Start a 5-minute dialogue",
      ctaUrl: h.url(started ? "/progress" : course),
    },
    9: {
      subject: "Free CCL resources worth using, starting with NAATI's",
      preheader: "NAATI's free practice test, past materials, vocabulary by domain, and what to avoid.",
      body: [
        "You don't need to pay for everything to prepare well for the CCL. Start with these:",
        bullets([
          `**[NAATI's free CCL practice test](${official.naatiCclPracticeTest}).** One dialogue in the real format, so you hear the chimes and pace. Do it first, and record it.`,
          `**[NAATI's downloadable practice materials](${official.naatiCclMaterials}).** Past dialogues with audio and transcripts. Great for drilling, though a dialogue you've heard is no longer a fair test.`,
          `**Our ${h.link("CCL vocabulary by domain", "/naati/ccl/vocabulary")}.** English terms across the twelve domains. Add your ${h.lang ?? "other-language"} equivalents and say them aloud.`,
          `**Our ${h.link(langPageLabel, langPage)}**, with language-specific tips on numbers, register and borrowed English words.`,
        ]),
        "Be wary of sites selling 'predicted' dialogues. NAATI test content is confidential, and memorising dialogues doesn't build the skill the test measures.",
        `XINGO isn't affiliated with NAATI, and our scores are estimates. Our ${h.link("four-week CCL plan", "/blog/naati-ccl-free-practice-resources")} shows how to combine all of these.`,
      ],
      ctaLabel: "See the four-week plan",
      ctaUrl: h.url("/blog/naati-ccl-free-practice-resources"),
    },
    11: {
      subject: "Practise the CCL under test rules",
      preheader: "Assessed dialogues, one repeat, a five-second start and two dialogues back to back.",
      body: [
        "Once Practice mode feels comfortable, start running dialogues in Assessed mode. There are no tips, and you get a score out of 90 at the end.",
        "To get the most from it, set yourself the test's rules: allow yourself one repeat per dialogue, start within about five seconds, and don't pause.",
        bullets([
          `**Finish the dialogue.** ${assessedAndCompletion()}`,
          `**No peeking.** ${transcriptRule()}`,
          "**Two in a row.** Regularly do two dialogues back to back, in different domains, so your concentration lasts the full test.",
        ]),
        `Your ${h.link("Progress page", "/progress")} shows each session side by side. For more domains, the ${h.link("community services", "/courses/community-services")} course is a good next step.`,
      ],
      ctaLabel: "Do an assessed dialogue",
      ctaUrl: h.url(course),
    },
    13: {
      subject: "Your CCL plan for the next two weeks",
      preheader: "Daily number drills, full dialogues under test rules and a domain rotation you can keep.",
      body: [
        "Two weeks in, here's a simple plan for the next fortnight, based on how the CCL is marked:",
        bullets([
          "**Daily, ten minutes:** numbers, dates and amounts in both directions, plus ten glossary words said aloud.",
          "**Most days:** one full dialogue under test rules, rotating domains so you cover at least six of the twelve.",
          "**After each:** write down your three biggest errors and drill those.",
          "**Twice a week:** two dialogues back to back, each needing 29 out of 45 on its own.",
        ]),
        minutesNote(h) + (h.ctx.isPro ? "" : ` There's also a ${packs.starter.label} pack if the CCL is your main focus.`),
        replyInvite,
        "Good luck with your preparation.",
      ],
      ctaLabel: "Plan my next dialogue",
      ctaUrl: h.url(course),
    },
  };
}

// ---------------------------------------------------------------------------
// Interpreter: NAATI CPI, medical, NDIS, legal
// ---------------------------------------------------------------------------

function interpreter(h: Helpers): Series {
  const course = h.coursePath;
  const started = h.ctx.sessions > 0;
  const focus = (() => {
    switch (h.ctx.goalId) {
      case "medical":
        return { label: "medical interpreting", page: "/interpreting/medical-interpreting-practice", pageLabel: "medical interpreting practice" };
      case "ndis":
        return { label: "NDIS interpreting", page: "/interpreting/ndis-interpreting", pageLabel: "NDIS interpreting practice" };
      case "legal":
        return { label: "legal interpreting", page: "/interpreting/legal-interpreting-practice", pageLabel: "legal interpreting practice" };
      default:
        return { label: "the NAATI CPI test", page: "/naati/cpi", pageLabel: "CPI practice page" };
    }
  })();
  const cpi = h.ctx.goalId === "naati_cpi" || !h.ctx.goalId;

  return {
    1: started
      ? {
          subject: "Your first interpreting session is scored. What next?",
          preheader: "How to read your score and feedback, and the one habit to work on next.",
          body: [
            firstSessionsLine(h, "dialogue"),
            readingResults(
              "is XINGO's estimate of your performance, not a NAATI result.",
              "covers accuracy, terminology, fluency, turn management and professionalism.",
            ),
            "Then read the transcript and check one thing: did you stay in the first person all the way through? Slipping into 'she says…' is one of the easiest habits to fix.",
          ],
          ctaLabel: "Interpret another dialogue",
          ctaUrl: h.url(course),
        }
      : {
          subject: "Your first interpreting dialogue, in five minutes",
          preheader: "Headphones, mic check, language pair, Practice mode. The quickest way to start.",
          body: [
            `Welcome to XINGO. Whether you're preparing for ${focus.label} or building your skills for work, interpreting improves with reps out loud. Here's how to do your first dialogue in ${h.yourLanguage} today:`,
            setupSteps("interpreting", h),
            "Introduce yourself to both people, then interpret each turn in the first person. If a turn is too long to hold, practise interrupting politely.",
            "When you're ready, Assessed mode runs the dialogue without tips and scores it at the end.",
          ],
          ctaLabel: "Start a dialogue",
          ctaUrl: h.url(course),
        },
    3: {
      subject: "First person and managing the flow: two core skills",
      preheader: "The two CPI criteria with no real CCL equivalent, and how to practise both.",
      body: [
        "Two skills separate professional interpreting from being bilingual, and NAATI assesses both in the CPI test:",
        bullets([
          "**Application of mode.** Interpret consecutively in the first person, at an appropriate length, without summarising or slipping into reported speech. 'I've had this pain for three days', not 'She says she's had pain'.",
          "**Interactional management.** Manage turns, interrupt appropriately when a turn runs long, ask for clarification professionally, and keep both parties informed.",
        ]),
        "In practice, that means:",
        bullets([
          "Introduce yourself to both parties at the start.",
          "When you ask one person to clarify, tell the other person you've done so.",
          "Build your note-taking for longer turns, roughly 50 to 100 words.",
        ]),
        `Our ${h.link("CPI preparation guide", "/blog/naati-cpi-test-preparation")} goes deeper. Then try a dialogue with one goal: first person, every turn.`,
      ],
      ctaLabel: "Practise a dialogue",
      ctaUrl: h.url(course),
    },
    5: {
      subject: "Common interpreting habits to unlearn",
      preheader: "Reported speech, summarising, softening and register shifts, and how to catch them.",
      body: [
        "These habits are common, even among experienced bilingual workers, and each one is fixable with deliberate practice:",
        bullets([
          "**Reported speech.** 'He says that…' instead of the first person.",
          "**Summarising long turns** instead of interrupting to keep them manageable.",
          "**Adding or softening.** 'It's important, okay?' changes the tone, even if it feels helpful.",
          "**Register shifts.** Don't make a formal professional sound casual, or a community member sound formal.",
          "**Dropped numbers and qualifiers.** Doses, dates, 'only', 'unless'. These carry meaning.",
          "**Side conversations.** If someone asks your opinion, stay within your role and interpret it for the other party.",
        ]),
        `For ethics and role boundaries, the [AUSIT Code of Ethics](${official.ausitEthics}) is the standard reference in Australia.`,
        "Record your next session and listen for just one of these.",
      ],
      ctaLabel: "Practise and listen back",
      ctaUrl: h.url(course),
    },
    7: {
      subject: "One week of interpreting practice: where you're at",
      preheader: started ? "Your progress so far, and what to focus on this week." : "It's not too late. Here's a five-minute plan for your first dialogue.",
      body: started
        ? [
            weekProgress(h, "dialogue"),
            "This week, look at the lowest part of your breakdown. If it's turn management, practise interrupting early and briefly. If it's accuracy, work on notes for numbers and conditions.",
            "Your Progress page shows every session in one place.",
          ]
        : [
            weekProgress(h, "dialogue"),
            fiveMinutePlan([
              "Put on headphones and open your course.",
              h.lang ? `Check your language pair is English and ${h.lang}.` : "Check your language pair.",
              "Choose Practice mode, so nothing is scored.",
              "Introduce yourself, interpret the first few turns, and stop whenever you like.",
            ]),
            "The first dialogue is the hardest one to start. After that, it gets easier.",
          ],
      ctaLabel: started ? "See my progress" : "Start a 5-minute dialogue",
      ctaUrl: h.url(started ? "/progress" : course),
    },
    9: {
      subject: "From practice to work: becoming an interpreter",
      preheader: "CPI eligibility, NAATI's free preparation, staying certified and finding work in Australia.",
      body: [
        "If you're aiming to work as an interpreter in Australia, here's the path in brief, at the time of writing:",
        bullets([
          `**Become eligible for the CPI.** NAATI describes several routes, such as a NAATI-endorsed Diploma of Interpreting. See [NAATI's CPI page](${official.naatiCpi}).`,
          `**Prepare with free official material.** [NAATI Learn](${official.naatiLearnCpi}) has CPI practice dialogues in many languages.`,
          "**Sit the CPI.** Three role-plays of about 10 to 12 minutes: two face to face and one remote.",
          "**Stay certified.** NAATI credentials expire after three years, so keep a record of your training and work from the start.",
          `**Find work.** Many interpreters contract to language service providers. List yourself in the [NAATI online directory](${official.naatiDirectory}).`,
        ]),
        `XINGO is partnered with [2M Language Services](${official.twoM}). Once you're NAATI certified, you can apply to work with 2M as an interpreter. 2M makes its own decisions about who it engages, and XINGO isn't affiliated with NAATI: practising here doesn't give you a credential by itself.`,
      ],
      ctaLabel: "Read the full guide",
      ctaUrl: h.url("/migrate-to-australia/become-an-interpreter-in-australia"),
    },
    11: {
      subject: "Practise interpreting under test conditions",
      preheader: "Assessed dialogues, audio-only calls and tracking what's improving.",
      body: [
        "Once Practice mode feels comfortable, move some dialogues to Assessed mode: no tips, and a score at the end.",
        bullets([
          `**Finish the conversation.** ${assessedAndCompletion()}`,
          `**No peeking.** ${transcriptRule()}`,
          `**Practise without visual cues.** ${cpi ? "The CPI includes a remote task. " : ""}Our ${h.link("telephone interpreting practice", "/interpreting/telephone-interpreting-practice")} runs audio-only calls with callers who speak quickly and quote reference numbers.`,
        ]),
        `Check your ${h.link("Progress page", "/progress")} after each session, and see our ${h.link(focus.pageLabel, focus.page)} for the scenarios available in your area.`,
      ],
      ctaLabel: "Do an assessed dialogue",
      ctaUrl: h.url(course),
    },
    13: {
      subject: "A two-week interpreting practice routine",
      preheader: "Role-plays across domains, one audio-only session a week, and a terminology log.",
      body: [
        "Two weeks in, here's a routine for the next fortnight that builds the skills the CPI and real assignments ask for:",
        bullets([
          "**Three or four dialogues a week**, across different domains, at least one audio-only.",
          "**Record and review** against meaning, mode, management, delivery and language.",
          `**Keep a terminology log** by domain, in English and ${h.lang ?? "your other language"}.`,
          "**Before a test:** do three role-plays in a row to build stamina.",
        ]),
        minutesNote(h),
        replyInvite,
        "Good luck with your preparation.",
      ],
      ctaLabel: "Plan my next dialogue",
      ctaUrl: h.url(course),
    },
  };
}

// ---------------------------------------------------------------------------
// US medical interpreter oral exam (CMI / CHI)
// ---------------------------------------------------------------------------

function usInterpreter(h: Helpers): Series {
  const course = h.coursePath;
  const started = h.ctx.sessions > 0;
  return {
    1: started
      ? {
          subject: "Your first medical role-play is scored. What next?",
          preheader: "How to read your score and feedback, and what to drill before your next session.",
          body: [
            firstSessionsLine(h, "role-play"),
            readingResults(
              "is XINGO's estimate from your transcript, not an NBCMI or CCHI result.",
              "covers accuracy, terminology, fluency, turn management and professionalism, including first person and register.",
            ),
            "Then open the transcript and check every number: doses, frequencies, durations. That's where accuracy points are most often lost, and it's easy to drill.",
          ],
          ctaLabel: "Try another role-play",
          ctaUrl: h.url(course),
        }
      : {
          subject: "Your first CMI/CHI-style role-play, in five minutes",
          preheader: "Headphones, mic check, language pair, Practice mode. The quickest way to start.",
          body: [
            `Welcome to XINGO. The consecutive part of the US medical interpreter oral exams is short, fast exchanges between a provider and a patient. Here's how to practise your first one in ${h.yourLanguage} today:`,
            setupSteps("interpreting", h),
            "The clinician always speaks English and the patient speaks your other language. Interpret each turn in the first person, keeping every number and qualifier.",
            "When you're ready, Assessed mode runs without tips and scores the role-play at the end.",
          ],
          ctaLabel: "Start a role-play",
          ctaUrl: h.url(course),
        },
    3: {
      subject: "CMI vs CHI oral exams: what to know first",
      preheader: "How the two exams differ, what raters look for, and which part XINGO covers.",
      body: [
        "Both US medical interpreter credentials have a written exam first, then an oral exam. At the time of writing:",
        bullets([
          "**CMI (NBCMI):** sight translation, then short consecutive role-plays in both directions. No simultaneous. Rated on accuracy, listening and retention, grammar, interpreting style and terminology.",
          "**CHI (CCHI):** consecutive vignettes make up the largest share, plus simultaneous and sight translation. Rated on lexical content and accuracy, grammar and quality of speech.",
          "**Both use recorded prompts**, and the oral exams are offered in a limited set of languages.",
        ]),
        "Five habits raters notice in both: first person always, every number and qualifier, register preserved, clean delivery, and not freezing on a term.",
        "XINGO covers the consecutive role-play section. Sight translation and simultaneous aren't covered, so practise those separately.",
        `Our ${h.link("CMI vs CHI guide", "/blog/medical-interpreter-oral-exam-cmi-chi")} compares them side by side.`,
      ],
      ctaLabel: "Practise consecutive turns",
      ctaUrl: h.url(course),
    },
    5: {
      subject: "Medical interpreting mistakes raters notice",
      preheader: "Third person, dropped doses, register shifts and false starts, with a fix for each.",
      body: [
        "Many candidates can interpret a ten-word sentence perfectly but start summarising at thirty. Here are the common slips, and how to fix them:",
        bullets([
          "**Third person.** Render 'I have chest pain', not 'She says she has chest pain'.",
          "**Dropped numbers and qualifiers.** 'One tablet, twice a day, for ten days, even if the rash goes away.' Every part matters.",
          "**Register shifts.** Don't make a casual patient sound formal or a formal provider sound chatty.",
          "**False starts.** A short pause to plan beats a false start and two self-corrections.",
          "**Freezing on a term.** Convey the meaning accurately and keep going.",
          "**Summarising long utterances.** Build memory deliberately, rather than hoping.",
        ]),
        "Pick one of these as your only focus in your next role-play, and check the transcript for it afterwards.",
      ],
      ctaLabel: "Practise one fix",
      ctaUrl: h.url(course),
    },
    7: {
      subject: "One week of medical interpreting practice",
      preheader: started ? "Your progress so far, and what to focus on this week." : "It's not too late. Here's a five-minute plan for your first role-play.",
      body: started
        ? [
            weekProgress(h, "role-play"),
            "This week, look at the lowest part of your breakdown. If it's accuracy, it's often numbers or length. If it's terminology, study by specialty, in both clinical and everyday language.",
            "Your Progress page shows every session in one place.",
          ]
        : [
            weekProgress(h, "role-play"),
            fiveMinutePlan([
              "Put on headphones and open the course.",
              h.lang ? `Check your language pair is English and ${h.lang}.` : "Check your language pair.",
              "Choose Practice mode, so nothing is scored.",
              "Interpret the first few turns, then stop whenever you like.",
            ]),
            "Short, frequent sessions suit this exam well, because the items themselves are short.",
          ],
      ctaLabel: started ? "See my progress" : "Start a 5-minute role-play",
      ctaUrl: h.url(started ? "/progress" : course),
    },
    9: {
      subject: "Before you register: check the NBCMI and CCHI handbooks",
      preheader: "Prerequisites, oral exam languages and how to study terminology in context.",
      body: [
        "Before you choose between CMI and CHI, a few things are worth checking in the official candidate handbooks:",
        bullets([
          "**Prerequisites.** Both bodies set requirements such as minimum age, education, language proficiency and completed medical interpreter training.",
          "**Your language.** The oral exams are offered in a limited set of languages, and CCHI has a different performance option for others.",
          "**Delivery.** Check whether you'll test at a centre or with online proctoring.",
        ]),
        `Read the [NBCMI](${official.nbcmi}) and [CCHI](${official.cchi}) sites for current details. XINGO isn't affiliated with either, and our scores are estimates for practice.`,
        `**A study tip for terminology:** group it by specialty (cardiology, endocrinology, obstetrics, paediatrics, neurology, pharmacy) and learn both the clinical and everyday ways people say things in English and ${h.lang ?? "your other language"}: 'myocardial infarction' and 'heart attack'.`,
        `See our ${h.link("CMI", "/exams/cmi-oral-exam")} and ${h.link("CHI", "/exams/cchi-oral-exam")} pages for the scenarios XINGO covers.`,
      ],
      ctaLabel: "Read the CMI vs CHI guide",
      ctaUrl: h.url("/blog/medical-interpreter-oral-exam-cmi-chi"),
    },
    11: {
      subject: "Build memory for longer medical utterances",
      preheader: "Shadow, repeat, then interpret, plus assessed role-plays to check your progress.",
      body: [
        "Short utterances are packed with details that are easy to drop. A simple way to build memory for longer ones:",
        bullets([
          "**Shadow first.** Repeat English medical audio in English, a beat behind.",
          "**Then repeat whole utterances** in the same language after they finish, increasing length gradually.",
          "**Then interpret,** lengthening the turns as accuracy holds.",
        ]),
        "Once Practice mode feels comfortable, check your progress in Assessed mode:",
        bullets([
          `**Finish the role-play.** ${assessedAndCompletion()}`,
          `**No peeking.** ${transcriptRule()}`,
        ]),
        `Your ${h.link("Progress page", "/progress")} shows every session. For more variety, try the ${h.link("emergency intake", "/courses/medical-er-intake")} course.`,
      ],
      ctaLabel: "Do an assessed role-play",
      ctaUrl: h.url(course),
    },
    13: {
      subject: "A four-week outline for the medical oral exam",
      preheader: "Diagnose, build memory, learn terminology in context, then timed mocks.",
      body: [
        "Two weeks in, here's a four-week outline you can start now:",
        bullets([
          "**Week 1, diagnose:** record yourself on mixed consecutive items and note where accuracy drops: numbers, length or terminology.",
          "**Week 2, memory and numbers:** daily shadowing and progressively longer utterances.",
          "**Week 3, terminology in context:** one specialty a day, plus two short sight translations of real documents.",
          "**Week 4, timed mocks:** assessed sessions in exam conditions, with limited repeats and no pausing.",
        ]),
        minutesNote(h),
        replyInvite,
        "Good luck with your preparation.",
      ],
      ctaLabel: "Plan my next session",
      ctaUrl: h.url(course),
    },
  };
}

// ---------------------------------------------------------------------------
// General: everyday speaking and interpreting confidence
// ---------------------------------------------------------------------------

function general(h: Helpers): Series {
  const course = "/courses";
  const started = h.ctx.sessions > 0;
  const pairLine = h.lang
    ? `**Check your language pair** is English and ${h.lang}, or choose **English only** if you just want to practise speaking English.`
    : "**Choose your language pair**, or **English only** if you just want to practise speaking English.";
  return {
    1: started
      ? {
          subject: "Your first XINGO session is scored. Here's what next",
          preheader: "How to read your score and feedback, and the one thing to try next time.",
          body: [
            firstSessionsLine(h, "session"),
            readingResults(
              "is XINGO's estimate based on your transcript. Use it to compare your own sessions over time.",
              "shows the parts of the conversation that went well and the parts that pulled your score down.",
            ),
            "Then pick one thing from Work on next and do the same kind of conversation again with only that in mind. Repeating with one fix teaches you more than moving on straight away.",
          ],
          ctaLabel: "Try another session",
          ctaUrl: h.url(course),
        }
      : {
          subject: "Your first XINGO conversation, in five minutes",
          preheader: "Headphones, mic check, Practice mode. The quickest way to start speaking.",
          body: [
            "Welcome to XINGO. Speaking confidence comes from speaking, so the best first step is one short conversation today. It takes about five minutes:",
            bullets([
              "**Put on headphones.** They stop the AI hearing itself through your speakers.",
              "**Test your microphone** on the start screen. If your browser blocks it, allow it from the address bar.",
              pairLine,
              "**Hold Space (or the mic button) while you talk**, and tap Space to switch who you're talking to.",
              "**Choose Practice mode** for your first go. Nothing is scored.",
            ]),
            "Pick any course that looks useful, and don't worry about getting it right. The goal today is to hear yourself speaking in a real conversation.",
          ],
          ctaLabel: "Start a conversation",
          ctaUrl: h.url(course),
        },
    3: {
      subject: "Shadowing: a ten-minute daily speaking habit",
      preheader: "A simple technique interpreters use to build listening, memory and fluency.",
      body: [
        "Here's a habit that works whatever you're preparing for. It's called shadowing, and interpreters use it to build listening stamina and memory.",
        bullets([
          "**Pick a short audio clip** in the language you want to improve: a news report, a podcast, a radio interview.",
          "**Repeat it out loud a beat behind the speaker**, in the same language. Don't translate; just keep up.",
          "**Then pause after each sentence** and repeat the whole sentence from memory.",
          "**Make the sentences longer** as it gets easier.",
        ]),
        "Ten minutes a day is plenty. Pair it with short real conversations, at the shops, with neighbours, at work, and your speaking will feel more natural within weeks.",
        "Then put it to work in a XINGO session, where someone actually responds to what you say.",
      ],
      ctaLabel: "Practise a conversation",
      ctaUrl: h.url(course),
    },
    5: {
      subject: "Practice habits that don't help, and what does",
      preheader: "Practising silently, re-using the same material and skipping review. Small changes help.",
      body: [
        "Lots of people put in hours of practice and feel stuck. Usually it's the way they practise, not the effort. Watch for these:",
        bullets([
          "**Practising silently.** Reading dialogues in your head doesn't build speaking speed. Say everything out loud.",
          "**Only practising your strong side.** If you're bilingual, practise both directions equally.",
          "**Re-using the same material** until you've memorised it, then mistaking familiarity for progress.",
          "**Never listening back.** Record yourself. It's uncomfortable, but it's the fastest way to hear hesitations and gaps.",
          "**Waiting until you feel ready.** Confidence comes after practice, not before it.",
        ]),
        "Try this: do one XINGO session, then read the transcript and find one thing you'd say differently. Do it again with that single change.",
      ],
      ctaLabel: "Practise and review",
      ctaUrl: h.url(course),
    },
    7: {
      subject: "One week with XINGO: where you're at",
      preheader: started ? "Your progress so far, and an idea for this week." : "It's not too late. Here's a five-minute plan for your first conversation.",
      body: started
        ? [
            weekProgress(h, "session"),
            "This week, try a different setting from your first sessions. Variety builds vocabulary faster than repeating the same kind of conversation, and you'll find out which situations feel easy and which still feel hard.",
            "Your Progress page shows every session in one place, so you can see what's changing.",
          ]
        : [
            weekProgress(h, "session"),
            fiveMinutePlan([
              "Put on headphones and open any course.",
              "Choose Practice mode, so nothing is scored.",
              "Say hello and keep the conversation going for a few turns.",
              "Stop whenever you like. You've started.",
            ]),
            "Five minutes of real speaking is worth more than an hour of thinking about it.",
          ],
      ctaLabel: started ? "See my progress" : "Start a 5-minute session",
      ctaUrl: h.url(started ? "/progress" : course),
    },
    9: {
      subject: "Free help for speaking and settling in Australia",
      preheader: "Free English classes, free interpreters, and how your languages can help at work.",
      body: [
        "If you're in Australia, or moving here, a few free services and guides are worth knowing about:",
        bullets([
          `**Free English classes.** The Adult Migrant English Program offers free classes for eligible migrants, with time limits to register. See our ${h.link("AMEP guide", "/migrate-to-australia/free-english-classes-amep")}.`,
          `**Free interpreters.** Free interpreting is available for many conversations, including at the doctor and pharmacy, while you're still learning. See ${h.link("free interpreter services", "/migrate-to-australia/free-interpreter-services")}.`,
          `**Your languages at work.** Being bilingual can help in health, community services, customer service and more. See ${h.link("jobs for bilingual migrants", "/migrate-to-australia/jobs-for-bilingual-migrants")}.`,
        ]),
        `Preparing for a test later? Our ${h.link("exam pages", "/exams")} cover IELTS, OET, the AMC clinical exam and more. XINGO isn't affiliated with any exam body, but we link the official sources so you can check the details.`,
      ],
      ctaLabel: "Explore the migration guides",
      ctaUrl: h.url("/migrate-to-australia"),
    },
    11: {
      subject: "Try Assessed mode, and explore the marketplace",
      preheader: "Practise like it counts, see your progress, and find community courses for your goals.",
      body: [
        "Once Practice mode feels comfortable, try an assessed session. There are no tips, and you get a score with feedback at the end.",
        bullets([
          "**Every session has a time limit**, so conversations always come to an end.",
          `**Finish the task.** ${assessedAndCompletion()}`,
          `**No peeking.** ${transcriptRule()}`,
        ]),
        `Your ${h.link("Progress page", "/progress")} shows every session side by side.`,
        `Want something more specific? The ${h.link("marketplace", "/marketplace")} has community courses made by trainers, teachers and employers, including English-only role-plays. Add one to your library and it works just like the others.`,
      ],
      ctaLabel: "Browse the marketplace",
      ctaUrl: h.url("/marketplace"),
    },
    13: {
      subject: "Make speaking practice a habit",
      preheader: "A simple routine for the next two weeks: short, regular and easy to keep.",
      body: [
        "Two weeks in, the best thing you can do is make practice small and regular. Here's a routine for the next fortnight:",
        bullets([
          "**Most days, ten minutes:** shadowing, or a short real conversation.",
          "**Twice a week:** one XINGO session, alternating Practice and Assessed mode.",
          "**Once a week:** listen back to a recording, or read a transcript, and choose one thing to change.",
          "**Keep a word list** of things you wanted to say but couldn't, and use them next time.",
        ]),
        minutesNote(h),
        replyInvite,
        "Happy practising.",
      ],
      ctaLabel: "Plan my next session",
      ctaUrl: h.url(course),
    },
  };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const tracks: Record<OnboardingTrack, { build: (h: Helpers) => Series; fallbackGoal: string | null }> = {
  ielts: { build: ielts, fallbackGoal: "ielts" },
  oet: { build: oet, fallbackGoal: "oet" },
  clinical: { build: clinical, fallbackGoal: "nmba_osce" },
  ccl: { build: ccl, fallbackGoal: "naati_ccl" },
  interpreter: { build: interpreter, fallbackGoal: "naati_cpi" },
  us_interpreter: { build: usInterpreter, fallbackGoal: "us_medical_oral" },
  general: { build: general, fallbackGoal: null },
};

export function buildOnboardingEmail(day: OnboardingDay, track: OnboardingTrack, ctx: OnboardingContext): BuiltEmail {
  const { build, fallbackGoal } = tracks[track] ?? tracks.general;
  const draft = build(helpers(ctx, fallbackGoal))[day];
  return {
    subject: draft.subject,
    preheader: draft.preheader,
    templateId: "letter",
    content: {
      body: ["Hi {{firstName}},", ...draft.body].join("\n\n"),
      ctaLabel: draft.ctaLabel,
      ctaUrl: draft.ctaUrl,
      signature,
    },
  };
}
