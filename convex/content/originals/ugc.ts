/**
 * Marketplace seed, reshaped to read like ordinary user-made content (D-038 follow-up).
 *
 * The ten Originals studios (./data) are regrouped into small creator accounts with
 * uneven course counts. Each course here points at an existing Originals course by slug
 * and keeps its first `keepScenarios` scenarios; optional title/tagline rewrites replace
 * the studio copy. Slugs in `droppedSlugs` come off the marketplace.
 *
 * Creators are accounts, not people: no personal names, credentials or life stories.
 * The creator page adds "Made by the XINGO team" in code, so bios never say it.
 * Rules are checked in ugc.test.ts.
 */

export type UgcCreator = {
  /** Lowercase, URL-safe: /^[a-z0-9][a-z0-9._-]{2,23}$/ */
  handle: string;
  displayName: string;
  /** ≤ 140 chars. */
  tagline: string;
  /** 15–90 words. */
  bio: string;
  location?: string;
  /** Hex, readable on white. */
  accent: string;
  /** Candid phone photo of an object, place or hands. No faces, text or logos. */
  avatarBrief: string;
  /** Wide candid phone photo. No faces, text or logos. */
  bannerBrief?: string;
  courses: Array<{
    /** An existing Originals course slug. */
    slug: string;
    /** Keep that course's first N scenarios. */
    keepScenarios: 1 | 2 | 3;
    /** ≤ 60 chars. */
    title?: string;
    /** ≤ 140 chars. */
    tagline?: string;
    bannerBrief: string;
  }>;
};

export const ugcCreators: UgcCreator[] = [
  {
    handle: "flatwhite.club",
    displayName: "Flat White Club",
    tagline: "ordering coffee shouldn't be the scariest part of your morning ☕",
    bio: "Café and brunch role-plays for anyone who still rehearses their order in the queue. Milk options, sizes, splitting the bill, asking for the eggs a bit runnier. Short, friendly, low stakes.",
    location: "Fitzroy, VIC",
    accent: "#8a5a2b",
    avatarBrief:
      "close-up of a latte art heart in a ceramic cup on a scratched timber bench, morning window light, a sugar sachet torn open beside it",
    bannerBrief:
      "wide shot along a narrow café counter from the customer side, takeaway cups stacked unevenly, steam blurring the coffee machine, soft morning light through a fogged window",
    courses: [
      {
        slug: "your-first-melbourne-coffee",
        keepScenarios: 3,
        title: "your first coffee order (it's fine, promise)",
        bannerBrief:
          "hand holding a paper takeaway cup outside a café window, slightly tilted shot, tram wires and grey sky behind, condensation on the glass",
      },
      {
        slug: "weekend-brunch-in-melbourne",
        keepScenarios: 2,
        title: "Weekend brunch, split bill and all",
        tagline: "Get a table, order the eggs how you like them and work out who owes what without the awkward maths.",
        bannerBrief:
          "overhead phone shot of a crowded café table: half-eaten smashed avo on sourdough, two coffees, a crumpled napkin, a phone face-down",
      },
      {
        slug: "bakery-counter-english",
        keepScenarios: 2,
        bannerBrief:
          "glass bakery cabinet shot at a low angle, a few croissants left on a tray, flour dust on the counter edge, fluorescent light reflection",
      },
      {
        slug: "dinner-out-bookings-and-bills",
        keepScenarios: 1,
        title: "Booking dinner + sorting the bill",
        bannerBrief:
          "dim restaurant table after dinner, candle burned low, a card machine and folded receipt next to empty wine glasses, warm blurry lights",
      },
    ],
  },
  {
    handle: "newintown.au",
    displayName: "new in town",
    tagline: "the first-month stuff nobody explains. bank, doctor, rental, forms.",
    bio: "We post the conversations you have in your first few weeks in Australia: opening an account, seeing a GP, inspecting a rental, standing at a service counter holding a letter you don't fully understand. Pick the one that's on your list this week.",
    accent: "#1f6f8b",
    avatarBrief:
      "a single new house key on a plain ring resting on an unpacked moving box, afternoon light, packing tape torn at the edge",
    bannerBrief:
      "wide phone shot of a mostly empty apartment living room, moving boxes stacked against a wall, a mattress leaning by the window, late afternoon sun on bare floorboards",
    courses: [
      {
        slug: "seeing-a-gp",
        keepScenarios: 3,
        title: "Seeing a GP for the first time",
        bannerBrief:
          "medical centre waiting room from a seated angle, rows of plastic chairs, a water cooler, a clipboard form on a knee with a pen, no faces",
      },
      {
        slug: "at-the-pharmacy",
        keepScenarios: 2,
        bannerBrief:
          "hand passing a folded paper script across a pharmacy counter, shelves of unbranded boxes softly blurred behind",
      },
      {
        slug: "opening-a-bank-account",
        keepScenarios: 2,
        title: "opening a bank account",
        tagline: "What to bring, what they'll ask, and how to question a fee you didn't expect.",
        bannerBrief:
          "passport and a printed lease agreement on a laminate desk, a bank pen on a chain lying across them, overhead office lighting",
      },
      {
        slug: "renting-your-first-place",
        keepScenarios: 3,
        title: "Rental inspections and applications",
        bannerBrief:
          "back view of a small group shuffling through a narrow hallway at a rental open inspection, shoes on worn carpet, natural light from a doorway",
      },
      {
        slug: "at-the-service-counter",
        keepScenarios: 1,
        title: "That confusing letter (at the counter)",
        tagline: "Update your details, fix a form problem and ask someone to explain a letter, slowly.",
        bannerBrief:
          "hand holding a folded official-looking letter and a numbered queue ticket, blurry service centre counters in the background",
      },
      {
        slug: "asking-for-help-around-town",
        keepScenarios: 2,
        bannerBrief:
          "phone in hand showing a blank map screen, a busy shopping strip footpath ahead, slightly crooked shot, overcast light",
      },
      {
        slug: "riding-melbourne-trams",
        keepScenarios: 1,
        title: "Trams: directions, top-ups, fare checks",
        tagline: "Ask which tram you need, top up your card and stay calm through a fare check or a diverted route.",
        bannerBrief:
          "view from inside a tram looking out a scratched window, city street sliding past, hand gripping a hanging strap at the edge of the frame",
      },
    ],
  },
  {
    handle: "market.mornings",
    displayName: "market mornings",
    tagline: "saturday market practice. tastings, prices, the 1pm specials",
    bio: "Just the one course for now: buying fruit, cheese and fish at a busy market, asking to taste things and getting a better price near closing.",
    accent: "#4f7a28",
    avatarBrief:
      "a paper bag of stone fruit spilling onto a wooden market crate, early morning light, a few leaves stuck to the fruit",
    courses: [
      {
        slug: "market-day-shopping",
        keepScenarios: 3,
        title: "Market morning: tastings, prices, closing-time deals",
        bannerBrief:
          "wide shot of a market aisle with produce stalls, crates of tomatoes and citrus, shoppers' backs and canvas bags, cool morning light",
      },
    ],
  },
  {
    handle: "pourcraft",
    displayName: "pourcraft",
    tagline: "Bar shifts, the talking side. Taps, tabs and saying no nicely.",
    bio: "Role-plays for people working behind a bar. Explaining what's on tap, running tabs on a busy night, checking ID and the hard part: slowing someone down or refusing service without starting a fight. Ends with close, because someone always wants one more.",
    location: "Newtown, NSW",
    accent: "#9c2f3a",
    avatarBrief:
      "close-up of a hand pulling a beer from an unbranded tap, foam spilling slightly over the glass rim, warm bar light",
    bannerBrief:
      "wide view along a bar top late at night, beer mats scattered, a row of clean upside-down glasses on a rubber mat, moody amber light and bokeh",
    courses: [
      {
        slug: "behind-the-bar",
        keepScenarios: 2,
        title: "Behind the bar on a busy night",
        bannerBrief:
          "bartender's hands lining up three pints on a drip tray, slightly blurred motion, bottles out of focus behind",
      },
      {
        slug: "responsible-service-of-alcohol",
        keepScenarios: 3,
        title: "saying no at the bar (RSA practice)",
        tagline: "Check ID, slow someone down and refuse service with respect. The conversations nobody enjoys, practised first.",
        bannerBrief:
          "an ID card held between two fingers over a bar counter under a dim downlight, glass of water beside it, no visible details on the card",
      },
      {
        slug: "closing-shift",
        keepScenarios: 1,
        bannerBrief:
          "chairs stacked upside down on tables in an empty bar, mop bucket in the corner, one pendant light still on",
      },
    ],
  },
  {
    handle: "floorstaff.notes",
    displayName: "Floor Staff Notes",
    tagline: "For café and restaurant staff who want to sound calm at the counter, even when the docket rail is full.",
    bio: "Front-of-house practice. Taking orders, table service, allergies, phone bookings and complaints. Written for people starting out in hospo or working in their second language.",
    accent: "#b4532a",
    avatarBrief:
      "a waiter's notepad and pen on a steel counter next to a stack of saucers, slightly out-of-focus espresso machine behind",
    courses: [
      {
        slug: "cafe-counter-orders",
        keepScenarios: 3,
        title: "Taking orders at the café counter",
        bannerBrief:
          "barista's hands tapping a coffee basket on a knock box, milk jug and cups crowded on the drip tray, busy blurred counter",
      },
      {
        slug: "restaurant-table-service",
        keepScenarios: 2,
        bannerBrief:
          "hand placing a plate of pasta on a set table, white napkin folded beside it, background diners blurred into warm light",
      },
      {
        slug: "phone-bookings",
        keepScenarios: 1,
        title: "Answering the booking phone",
        bannerBrief:
          "cordless phone and an open paper booking diary on a restaurant host stand, pen in the spine, evening light",
      },
      {
        slug: "dietary-requirements-allergies",
        keepScenarios: 2,
        title: "Allergies: ask, check, never guess",
        bannerBrief:
          "kitchen pass with a single plate flagged by a toothpick, a chef's hand pointing at it, stainless steel and heat lamps",
      },
      {
        slug: "handling-customer-complaints",
        keepScenarios: 2,
        bannerBrief:
          "half-finished meal pushed aside on a café table, a waiter's apron and hand at the edge of the frame, soft daylight",
      },
    ],
  },
  {
    handle: "ourstreet.chats",
    displayName: "our street",
    tagline: "neighbour convos: hellos, parcels, the barking dog",
    bio: "Little role-plays about living next to people. Introducing yourself over the fence, a parcel that went to the wrong house, raising noise calmly, chatting about the weather when you're both putting the bins out.",
    location: "Brisbane, QLD",
    accent: "#2d7a5f",
    avatarBrief:
      "a weathered timber side fence with a frangipani branch leaning over it, late afternoon sun, bins visible at the bottom of the frame",
    bannerBrief:
      "wide suburban street at dusk from a front yard, wheelie bins out on the kerb, a jacaranda dropping purple flowers on the footpath",
    courses: [
      {
        slug: "meet-the-neighbours",
        keepScenarios: 3,
        bannerBrief:
          "hand holding a plate of biscuits covered in cling wrap at a neighbour's front door, worn doormat, screen door",
      },
      {
        slug: "neighbour-noise-conversations",
        keepScenarios: 2,
        title: "Noise next door (without a feud)",
        bannerBrief:
          "dark apartment wall at night with a bedside lamp on, a phone glowing on the pillow, faint light under the door",
      },
      {
        slug: "small-talk-with-locals",
        keepScenarios: 2,
        title: "Bin-night small talk",
        tagline: "Weather, footy, weekend plans. Easy chats with the people on your street, and how to get out of one nicely.",
        bannerBrief:
          "two pairs of thongs and legs standing near wheelie bins on a driveway, evening light, shot from waist height",
      },
    ],
  },
  {
    handle: "renter.diaries",
    displayName: "Renter Diaries",
    tagline: "The leaky tap, the rent increase email, the tradie who didn't come back.",
    bio: "We rent, and we've had all of these calls. Two courses: talking to your property manager about repairs and rent, and dealing with a tradie in your home.",
    accent: "#5b4b9a",
    avatarBrief: "a dripping kitchen tap over a stainless sink, a tea towel bunched underneath, dim kitchen light",
    courses: [
      {
        slug: "calling-your-property-manager",
        keepScenarios: 2,
        title: "Calling your property manager",
        bannerBrief:
          "water stain spreading on a ceiling corner of a rental bedroom, a bucket on the carpet below, shot upward from the doorway",
      },
      {
        slug: "tradie-at-home",
        keepScenarios: 1,
        title: "when the tradie's at yours",
        bannerBrief:
          "toolbox open on a kitchen floor, a pair of work boots and a hand holding a spanner under the sink cupboard",
      },
    ],
  },
  {
    handle: "hardrubbishday",
    displayName: "hard rubbish day",
    tagline: "one course. calling the council. you can do it 🛋️",
    bio: "Booking a hard rubbish pickup, sorting out a parking permit and making a complaint the council will actually act on. That's the whole account.",
    accent: "#6b6f2a",
    avatarBrief: "an old armchair left on a grass nature strip, a bit faded, overcast sky, a lamp shade on the seat",
    courses: [
      {
        slug: "calling-the-council",
        keepScenarios: 3,
        bannerBrief:
          "pile of hard rubbish on a kerb: a mattress, a broken bookshelf, a box of cords, leafy suburban street behind, flat grey light",
      },
    ],
  },
  {
    handle: "commgarden_crew",
    displayName: "Community Garden Crew",
    tagline: "Plots, rosters, op shops and fairs. Getting involved locally, one conversation at a time.",
    bio: "We put together a couple of role-plays about joining things: asking for a garden plot (and coping with the waitlist), sorting out a watering roster clash, dropping off at the op shop and signing up to help at a stall.",
    location: "Marrickville, NSW",
    accent: "#3d8b3d",
    avatarBrief: "dirt-covered hands holding a small seedling in a punnet, raised garden bed out of focus behind",
    bannerBrief:
      "wide shot of a community garden on a weekday morning, mismatched raised beds, a hose snaking across the path, a wheelbarrow tipped on its side",
    courses: [
      {
        slug: "community-garden-plot",
        keepScenarios: 2,
        title: "Getting a garden plot",
        bannerBrief:
          "watering can and a pair of gardening gloves on the edge of a raised bed full of silverbeet, morning dew",
      },
      {
        slug: "op-shops-volunteering-and-events",
        keepScenarios: 2,
        title: "Op shop drop-offs and volunteering",
        bannerBrief:
          "bags of folded clothes left at an op-shop donation door, a rack of jumpers visible through the glass, afternoon light",
      },
    ],
  },
  {
    handle: "weekendoval",
    displayName: "weekend oval",
    tagline: "signing up, game time, club politics. local sport chats for players and parents",
    bio: "Two courses from the sidelines. One for joining a local club yourself (rego, fees, how much you'll actually play). One for parents talking to a junior coach.",
    accent: "#1d5fa8",
    avatarBrief: "a scuffed footy resting on damp grass by a white boundary line, early morning mist",
    courses: [
      {
        slug: "joining-a-sports-club",
        keepScenarios: 3,
        title: "Joining a local club",
        tagline: "Ask about joining, sort out a rego hiccup and talk fees and playing time without feeling like the new kid.",
        bannerBrief:
          "clubrooms canteen window with an urn and stacked paper cups, a muddy kit bag on the bench outside, Saturday morning light",
      },
      {
        slug: "junior-sport-club-english",
        keepScenarios: 2,
        title: "talking to your kid's coach",
        bannerBrief:
          "small football boots lined up on a car boot ledge, oranges cut in a container, oval and goalposts blurred behind",
      },
    ],
  },
  {
    handle: "the.school.run",
    displayName: "The School Run",
    tagline: "Front office, classroom door, school gate. The chats you have between drop-off and pick-up.",
    bio: "Practice for parents and carers dealing with school in a new language. Enrolling, a quick word with the teacher, calling in sick, and the small talk at pick-up that somehow feels harder than all of it.",
    accent: "#c2410c",
    avatarBrief: "a small school backpack hanging on a hook by a front door, a lunchbox poking out of the pocket",
    bannerBrief:
      "wide shot of a primary school gate at 3pm from across the road, parents' backs and prams lined along the fence, gum trees, bright afternoon",
    courses: [
      {
        slug: "enrolling-at-a-new-school",
        keepScenarios: 2,
        bannerBrief:
          "enrolment forms, a birth certificate envelope and an immunisation booklet on a school office counter, hand holding a pen",
      },
      {
        slug: "parent-teacher-chats",
        keepScenarios: 3,
        title: "Talking to the teacher",
        bannerBrief:
          "two small chairs and one adult chair around a low classroom table, colourful art on the walls blurred, afternoon light",
      },
      {
        slug: "calling-in-a-sick-child",
        keepScenarios: 1,
        title: "calling in sick (for them)",
        bannerBrief:
          "child-sized feet under a blanket on a couch, a thermometer and a glass of water on the coffee table, phone in an adult's hand",
      },
      {
        slug: "pick-up-chats-playdates-and-parties",
        keepScenarios: 2,
        title: "Pick-up chats, playdates, party RSVPs",
        bannerBrief:
          "a handmade birthday invitation envelope tucked into a school bag zip, playground equipment soft in the background",
      },
    ],
  },
  {
    handle: "littlelockers",
    displayName: "little lockers",
    tagline: "daycare tours, drop-off handovers, the fees conversation",
    bio: "Childcare conversations for new families: touring a centre, telling the educators how your child slept, and sorting out days and fees.",
    accent: "#d97706",
    avatarBrief: "a row of tiny cubby lockers with a pair of small gumboots and a sun hat, soft indoor light",
    courses: [
      {
        slug: "childcare-and-daycare-english",
        keepScenarios: 2,
        title: "Daycare: tours, handovers, fees",
        bannerBrief:
          "childcare centre entrance with a sign-in tablet on a stand, a pram parked by the door, finger paintings drying on a line",
      },
    ],
  },
  {
    handle: "casualroster",
    displayName: "Casual Roster",
    tagline: "First job in retail? Practise the register, the returns desk and day one before you get there.",
    bio: "For first jobs in shops. Serving at the register when the line's long, handling a return the right way, and getting through your induction without nodding along to things you didn't catch.",
    accent: "#0f766e",
    avatarBrief: "a lanyard with a blank name badge lying on a shop counter next to a receipt roll",
    bannerBrief:
      "wide view of an empty shop floor before opening, lights half on, a trolley of stock boxes in an aisle, polished lino reflecting",
    courses: [
      {
        slug: "serving-at-the-register",
        keepScenarios: 2,
        title: "On the register",
        bannerBrief:
          "hand holding a barcode scanner over a pile of mixed groceries on a checkout belt, card terminal at the edge of frame",
      },
      {
        slug: "returns-and-refunds-at-the-counter",
        keepScenarios: 3,
        title: "Returns and refunds without the panic",
        bannerBrief:
          "a shoebox with the lid off and a crumpled receipt on a returns counter, shop lighting, slightly angled shot",
      },
      {
        slug: "first-day-induction",
        keepScenarios: 1,
        title: "day one: induction",
        tagline: "Meet your supervisor, follow the tour and ask the questions that make the first shift easier.",
        bannerBrief:
          "back of a new staff member in a plain polo following someone down a stockroom aisle, cardboard boxes stacked high",
      },
    ],
  },
  {
    handle: "know.your.shift",
    displayName: "know your shift",
    tagline: "calling in sick + asking about your pay. two convos people put off",
    bio: "Calling in sick without over-explaining, and asking about your payslip when the hours don't look right. Both feel awkward. Both are normal parts of having a job.",
    accent: "#475569",
    avatarBrief: "a printed payslip folded in half on a kitchen bench beside a cup of tea and a highlighter",
    courses: [
      {
        slug: "calling-in-sick",
        keepScenarios: 2,
        title: "Calling in sick (5 min practice)",
        bannerBrief:
          "phone on a messy bedside table at dawn, tissue box, glass of water, curtains half open",
      },
      {
        slug: "asking-about-your-pay",
        keepScenarios: 2,
        title: "My pay looks wrong. Now what?",
        bannerBrief:
          "hand pointing at a highlighted line on a payslip next to a pocket calculator on a timber table",
      },
    ],
  },
  {
    handle: "careshift_notes",
    displayName: "careshift notes",
    tagline: "Aged care conversations: mornings, handovers, incidents and notes that the next shift can actually use.",
    bio: "Role-plays for aged-care workers. Starting a resident's morning at their pace, giving a handover that doesn't miss anything, reporting a fall in order, and talking through progress notes so they're facts, not guesses.",
    location: "Geelong, VIC",
    accent: "#0e7490",
    avatarBrief: "a pair of hands in blue gloves folding a white towel on a bed edge, soft window light",
    bannerBrief:
      "long aged-care corridor with handrails, a laundry trolley parked by a door, morning light at the far end, no people",
    courses: [
      {
        slug: "aged-care-morning-routine",
        keepScenarios: 3,
        title: "The morning routine",
        tagline: "Knock, greet, offer choices and help a resident start the day at their own pace.",
        bannerBrief:
          "bedside table in a residential room: reading glasses, a cup of tea, a small vase of flowers, curtains just opened",
      },
      {
        slug: "shift-handover-to-a-colleague",
        keepScenarios: 2,
        title: "Shift handover",
        bannerBrief:
          "a clipboard handover sheet and two coffee cups on a nurses' station bench, one hand resting on the page",
      },
      {
        slug: "reporting-a-fall-or-incident",
        keepScenarios: 2,
        title: "Reporting a fall, in order",
        bannerBrief:
          "walking frame tipped slightly beside an armchair in a quiet lounge room, afternoon light, no people",
      },
      {
        slug: "end-of-shift-notes",
        keepScenarios: 1,
        bannerBrief: "pen and an open progress notes binder under a desk lamp at night, a lanyard coiled beside it",
      },
    ],
  },
  {
    handle: "supportworker.talk",
    displayName: "support worker talk",
    tagline: "Their day, their call. Practice for disability support shifts.",
    bio: "Planning a shift with the person you support, then heading out to the shops or a class while they stay in charge. Two courses, more slowly being added.",
    accent: "#7c3aed",
    avatarBrief: "two coffee cups on an outdoor café table beside a set of car keys and a folded shopping list",
    courses: [
      {
        slug: "disability-support-visit",
        keepScenarios: 2,
        title: "Planning the shift together",
        bannerBrief:
          "a weekly planner on a fridge door with magnets, kitchen bench below with a kettle, morning light",
      },
      {
        slug: "community-outing-support",
        keepScenarios: 3,
        title: "Out and about",
        bannerBrief:
          "footpath outside a local shopping strip, a wheelchair's wheel and a tote bag in frame, shot from behind at hip height",
      },
    ],
  },
  {
    handle: "smokobreak",
    displayName: "smoko break",
    tagline: "quotes, trade counters, toolbox talks. site english for tradies",
    bio: "Practice for people on the tools. Walking a job and quoting it properly, ordering at the trade counter when they're out of what you need, running the morning toolbox talk, interviewing an apprentice. Keep it short, smoko's only fifteen minutes.",
    accent: "#ca8a04",
    avatarBrief: "a dusty thermos and a pie in a paper bag on a ute tailgate, hi-vis vest bunched beside it",
    bannerBrief:
      "wide shot of a residential building site at 7am, timber frames up, a ute parked on the dirt, long shadows and a dusty sky",
    courses: [
      {
        slug: "quoting-a-job-for-a-homeowner",
        keepScenarios: 2,
        title: "Quoting a job (and not underselling it)",
        bannerBrief:
          "tape measure extended along a cracked bathroom tile wall, a hand holding a pencil, natural light from a small window",
      },
      {
        slug: "ordering-at-the-trade-counter",
        keepScenarios: 2,
        title: "trade counter orders",
        bannerBrief:
          "trade supply counter with pipe fittings in a tray, a crumpled order list and a pencil, racks of timber blurred behind",
      },
      {
        slug: "running-a-site-toolbox-talk",
        keepScenarios: 3,
        title: "Running the toolbox talk",
        bannerBrief:
          "crew's boots in a loose circle on a concrete slab, hard hats held at their sides, early light, shot from knee height",
      },
      {
        slug: "hiring-your-first-apprentice",
        keepScenarios: 1,
        bannerBrief:
          "two folding chairs and a ute bonnet used as a desk, a résumé held in a dusty hand, site fence behind",
      },
    ],
  },
  {
    handle: "soletrader.chats",
    displayName: "Sole Trader Chats",
    tagline: "The admin side of working for yourself. Invoices, bookkeepers, clients who need it all by Friday.",
    bio: "Running your own small business means a lot of slightly uncomfortable conversations. We practise three of them: chasing a late payment, getting your paperwork straight with a bookkeeper, and rescheduling clients when things change.",
    accent: "#a16207",
    avatarBrief: "a receipt spike full of curled receipts on a cluttered desk next to a laptop edge and a mug",
    bannerBrief:
      "wide desk shot in a spare-room office: shoebox of receipts, an open diary, a laptop with a blank screen, afternoon light through blinds",
    courses: [
      {
        slug: "chasing-an-unpaid-invoice",
        keepScenarios: 3,
        title: "chasing an unpaid invoice",
        tagline: "Ask for your money clearly and politely, deal with the excuses and agree a firm date.",
        bannerBrief:
          "phone on a desk next to a printed invoice with a coffee ring stain, hand hovering over the phone",
      },
      {
        slug: "talking-with-your-bookkeeper",
        keepScenarios: 2,
        bannerBrief:
          "folders and a shoebox of receipts on a small office table, a calculator and two pens, overhead light",
      },
      {
        slug: "scheduling-jobs-with-clients",
        keepScenarios: 1,
        title: "Rain day! Moving jobs around",
        bannerBrief:
          "rain on a ute windscreen, a paper diary open on the dash with crossed-out times, grey light",
      },
    ],
  },
  {
    handle: "stall.saturdays",
    displayName: "stall saturdays",
    tagline: "selling at the market: browsers, returns, bulk orders",
    bio: "For anyone with a weekend stall. Chatting to people who are just looking, a return with no receipt, and a business buyer who wants a bulk price.",
    accent: "#be185d",
    avatarBrief: "handmade ceramic mugs lined up on a trestle table with a cash tin, canvas awning shadow",
    courses: [
      {
        slug: "running-a-market-stall",
        keepScenarios: 2,
        title: "Running your stall",
        bannerBrief:
          "wide market stall from behind the table: handmade candles and soaps, a card reader, shoppers' legs and bags passing in front",
      },
    ],
  },
  {
    handle: "awkward.hellos",
    displayName: "awkward hellos",
    tagline: "saying hi to someone you like is a skill. you can practise it 💬",
    bio: "Low-pressure practice for the moments that make your heart race a bit. Starting a chat in a bookshop or at the dog park, asking for a number (and taking no for an answer), first dates, kitchen small talk at parties. Respectful, relaxed, never pushy.",
    accent: "#db2777",
    avatarBrief: "two coffee cups touching on a park bench, autumn leaves on the slats, golden afternoon light",
    bannerBrief:
      "wide shot of a bookshop aisle from the end, a hand reaching for a book on a high shelf, warm lamps, cosy clutter",
    courses: [
      {
        slug: "meet-cutes-start-a-conversation",
        keepScenarios: 3,
        title: "Say hi first (bookshop, dog park, gym)",
        bannerBrief:
          "dog park on a sunny morning, two dogs sniffing each other in the foreground, owners' legs and leads blurred behind",
      },
      {
        slug: "asking-for-a-number-respectfully",
        keepScenarios: 2,
        title: "Asking for their number, no cringe",
        bannerBrief:
          "two phones on a café table side by side, one hand sliding one across, latte glasses and sunlight",
      },
      {
        slug: "first-date-conversation",
        keepScenarios: 2,
        title: "first date: keep the convo going",
        bannerBrief:
          "two drinks on a small bar table, fairy lights out of focus, one hand gesturing mid-story at the edge of frame",
      },
      {
        slug: "small-talk-at-a-party",
        keepScenarios: 1,
        title: "Kitchen chat at a party",
        tagline: "Talk to people you don't know, keep a quiet conversation going and leave it gracefully.",
        bannerBrief:
          "house party kitchen bench crowded with chip bowls and bottles, people's backs and elbows, warm messy light",
      },
    ],
  },
  {
    handle: "friendship.reps",
    displayName: "Friendship Reps",
    tagline: "Making friends as an adult takes practice. So does saying no to them sometimes.",
    bio: "Courses about adult friendship. Turning a friendly face into an actual friend, telling a mate what isn't working, and turning down plans without a three-paragraph excuse.",
    accent: "#9333ea",
    avatarBrief: "two pairs of sneakers on a picnic rug in a park, a shared bag of hot chips between them",
    courses: [
      {
        slug: "making-friends-as-an-adult",
        keepScenarios: 3,
        title: "Making friends after 25",
        bannerBrief:
          "backs of a small group walking along a beach path at sunset, one person slightly behind, loose and candid",
      },
      {
        slug: "setting-boundaries-with-friends",
        keepScenarios: 2,
        title: "Boundaries, kindly",
        bannerBrief:
          "phone screen face-up on a couch cushion showing a blank message thread, hand hovering, evening lamp light",
      },
      {
        slug: "saying-no-politely",
        keepScenarios: 2,
        title: "how to say no (nicely)",
        bannerBrief:
          "hand pushing back a second slice of cake on a plate across a kitchen table, mugs and crumbs, daylight",
      },
    ],
  },
  {
    handle: "interview.nerves",
    displayName: "interview nerves",
    tagline: "Job interviews and networking events, rehearsed.",
    bio: "Two courses for when you have to talk about yourself to strangers. Answering \"tell me about yourself\", explaining a gap, and walking up to someone at a work event.",
    accent: "#334155",
    avatarBrief: "an ironed shirt on a hanger hooked over a bedroom door, morning light, a résumé on the bed below",
    courses: [
      {
        slug: "job-interview-confidence",
        keepScenarios: 3,
        title: "\"Tell me about yourself\"",
        bannerBrief:
          "empty chair across a small meeting room table with a glass of water and a printed résumé, glass wall reflections",
      },
      {
        slug: "networking-events-without-the-dread",
        keepScenarios: 1,
        title: "networking without the dread",
        bannerBrief:
          "event room with high tables, name lanyards on a check-in table, people's backs and drinks in hands, warm uplighting",
      },
    ],
  },
  {
    handle: "twoway.practice",
    displayName: "Two-Way Practice",
    tagline: "Dialogue practice for community interpreters: health, housing, counters and schools.",
    bio: "Interpreting dialogues you can run as often as you like. GP and emergency triage, pharmacy counselling, housing and tenancy, a government counter, a parent-teacher interview. Plus one on briefings and boundaries, the part of the job that happens before anyone starts talking.",
    accent: "#1e40af",
    avatarBrief: "an interpreter's spiral notepad with a pen on top, a glass of water and a lanyard on a meeting table",
    bannerBrief:
      "wide shot of a small consulting room from the doorway: three chairs, a desk, a box of tissues, a window with half-closed blinds",
    courses: [
      {
        slug: "gp-consultation-interpreting",
        keepScenarios: 3,
        title: "GP consults",
        bannerBrief:
          "doctor's desk with a blood pressure cuff, a keyboard and a notepad, three chairs angled towards it, soft clinical light",
      },
      {
        slug: "emergency-triage-interpreting",
        keepScenarios: 2,
        bannerBrief:
          "hospital emergency waiting area at night, rows of chairs, a vending machine glow, a wristband on an armrest",
      },
      {
        slug: "pharmacy-counselling-interpreting",
        keepScenarios: 1,
        bannerBrief:
          "medicine box and a printed leaflet on a pharmacy counter, a pharmacist's hand pointing at the dosage section, no readable text",
      },
      {
        slug: "housing-tenancy-interpreting",
        keepScenarios: 2,
        title: "Housing and tenancy dialogues",
        bannerBrief:
          "housing office meeting table with a folder of forms, a set of keys and a pen, fluorescent office light",
      },
      {
        slug: "government-services-counter",
        keepScenarios: 3,
        title: "At the government counter",
        bannerBrief:
          "row of service counters with perspex screens, a queue ticket machine, the back of someone waiting with a folder",
      },
      {
        slug: "interpreting-parent-teacher-interviews",
        keepScenarios: 2,
        title: "Parent-teacher interviews",
        bannerBrief:
          "classroom after hours, three chairs pulled up to a teacher's desk with a workbook open, afternoon sun on the floor",
      },
      {
        slug: "interpreter-briefings-and-boundaries",
        keepScenarios: 1,
        title: "Briefings + boundaries (before you start)",
        bannerBrief:
          "corridor outside a consulting room, two people's backs talking quietly near a door, an ID lanyard in hand",
      },
    ],
  },
  {
    handle: "statement.practice",
    displayName: "statement practice",
    tagline: "police and legal aid interpreting. exact words, exact times, no guessing",
    bio: "Two legal-setting interpreting courses: a police witness statement and a legal aid intake interview. Slower, more precise dialogues where small details matter.",
    accent: "#3f3f46",
    avatarBrief: "a closed manila folder and a pen squared up on a grey interview room table, cold overhead light",
    courses: [
      {
        slug: "police-witness-statement-interpreting",
        keepScenarios: 3,
        title: "Witness statements",
        bannerBrief:
          "plain interview room with a table, three chairs and a box of tissues, a notepad with blank lines, flat light",
      },
      {
        slug: "legal-aid-intake-interpreting",
        keepScenarios: 2,
        title: "Legal aid intake",
        bannerBrief:
          "waiting area of a community legal centre, a stack of brochures with no readable text, a pram and a backpack by a chair",
      },
    ],
  },
  {
    handle: "dogpark.mornings",
    displayName: "dogpark mornings 🐾",
    tagline: "vet visits in english. describing what's wrong, asking about cost",
    bio: "One course about taking your pet to the vet: booking a check-up, explaining symptoms and talking through treatment and price before you agree to anything.",
    accent: "#15803d",
    avatarBrief: "a worn red dog lead hanging on a hook by a back door, a tennis ball on the floor below",
    bannerBrief:
      "wide grassy off-lead park at sunrise, a dog mid-run in the distance, dew on the grass, a lead coiled on a bench",
    courses: [
      {
        slug: "at-the-vet",
        keepScenarios: 2,
        title: "At the vet",
        bannerBrief:
          "dog's paw resting on a steel vet examination table, a hand gently holding it, clinic light, slightly blurred background",
      },
    ],
  },
];

/** Existing course slugs to delete from the marketplace (not used above). */
export const droppedSlugs: string[] = [
  // Laneway Coffee Club
  "takeaway-and-phone-orders",
  "getting-a-haircut",
  // Last Orders Academy
  "functions-and-events",
  "kitchen-to-floor-communication",
  // Over the Fence
  "fences-trees-and-boundaries",
  "at-the-local-library",
  // Fresh Start Studio
  "phone-and-internet-plans",
  "getting-around-by-public-transport",
  "first-meeting-at-a-job-agency",
  "at-the-licence-counter",
  // School Gate Studio
  "school-excursions-and-forms",
  "at-the-school-uniform-shop",
  "homework-help-and-tutors",
  // First Shift
  "helping-customers-find-stock",
  "answering-store-phone-enquiries",
  "swapping-a-roster-shift",
  "retail-customer-complaints",
  "reporting-a-safety-hazard",
  // Kind Hands
  "talking-with-worried-family",
  "when-a-resident-says-no",
  "phone-calls-to-client-families",
  "home-care-first-visit",
  // Smoko Studio
  "handling-a-complaint-about-your-work",
  "negotiating-with-a-subcontractor",
  // Say Hi First
  "reconnecting-with-an-old-friend",
  // Both Sides
  "employment-services-interpreting",
  "disability-support-planning-interpreting",
];
