import type { OriginalCreator } from "./types";

export const smokoStudio: OriginalCreator = {
  handle: "smoko-studio",
  displayName: "Smoko Studio",
  tagline: "Plain-talk English practice for tradies and small business owners: quotes, suppliers, site talks, invoices and tricky customers.",
  bio: "Smoko Studio is a XINGO Original studio based in Newcastle, NSW, built for people who run the job and the business at the same time. Our courses put you in the conversations that actually fill a working week: pricing a job at someone's kitchen table, ordering at the trade counter, running the morning toolbox talk, chasing a bill that's gone quiet and calming down an unhappy customer. Every scenario has a real person on the other side with their own budget, deadline and mood. You'll practise saying things clearly, holding your price politely and sorting problems without burning the relationship. No lectures and no jargon tests, just the talk that keeps the work coming in.",
  location: "Newcastle, NSW",
  accent: "#6B7A0F",
  visualStyle:
    "Isometric clay: soft plasticine 3D models in a clean isometric view, olive and hi-vis orange on a warm off-white ground, with chunky tools, utes and site gear that look hand-pressed.",
  logoBrief:
    "An isometric plasticine enamel mug steaming beside a chunky olive hard hat, with a hi-vis orange stripe, in soft clay with visible thumbprint texture.",
  avatarBrief:
    "A round isometric clay badge of a small olive ute with a hi-vis orange ladder on the roof racks, soft plasticine shading on an off-white ground.",
  courses: [
    // 1. Quoting a job
    {
      slug: "quoting-a-job-for-a-homeowner",
      kind: "roleplay",
      title: "Quoting a Job for a Homeowner",
      tagline: "Walk the job, ask the right questions, explain your price and lock in the next step without underselling yourself.",
      description:
        "This course is for tradies who know their work but find the quoting conversation harder than the job itself. You play the tradesperson standing in someone's home, working out what they actually want and turning it into a clear price. You'll practise asking questions about the scope, explaining what's included and what isn't, giving a timeframe, and saying what happens next. The first scenario is a friendly homeowner with a dripping shower who just wants to know what it'll cost and when you can come back. The second is a deck replacement where the owner has a cheaper quote from someone else and wants you to justify the difference. The third is a kitchen renovation where the client keeps adding extras, pushes hard for a fixed price and asks for a discount, so you need to hold your ground, put the variations into words and still leave on good terms. By the end you'll have phrases ready for scope, inclusions, exclusions, deposits and follow-up.",
      keywords: ["quoting", "tradies", "homeowners", "pricing", "scope of work", "small business"],
      whatYouGet: [
        "Three quoting conversations that step up from a simple repair to a pushy renovation client",
        "Practice explaining inclusions, exclusions and variations in plain English",
        "Phrases for holding your price when someone has a cheaper quote",
        "Confidence agreeing on next steps, deposits and start dates",
      ],
      audience: "Tradespeople and contractors who quote jobs face to face in people's homes.",
      bannerBrief:
        "An isometric clay house cut away to show a kitchen, with a plasticine tradie holding a clipboard beside an olive ute and an orange tape measure.",
      scenarios: [
        {
          title: "Dripping shower in Merewether",
          description:
            "You're a plumber visiting a homeowner whose shower won't stop dripping. Find out what's going on, give a rough price and book a time to come back and fix it.",
          difficultyLevel: "beginner",
          character: {
            name: "Margaret Ellis",
            role: "retired homeowner with a dripping shower in Merewether",
            goal:
              "You're a friendly retiree whose shower has dripped for three weeks and your water bill went up. You want to know what's wrong, roughly what it costs and when it can be fixed. You ask if it's a big job and whether you need to buy anything. You'd prefer a weekday morning because you mind your grandson in the afternoons. If asked, you mention the house is 1970s and the taps are the old cross-head kind. You're happy with any fair price under about $350.",
            demeanor: "warm, chatty, a little anxious about cost, speaks slowly and nods along",
            openingLine: "Thanks for coming, love. It's this one here, it just drips and drips, day and night.",
            endCondition:
              "the learner has explained the likely problem, given a price or price range, and booked a day and time to come back",
            voice: "marin",
          },
          learnerRole: "plumber quoting a small repair",
          taskCard:
            "- Ask how long it's been dripping and how old the taps are\n- Explain what you think the problem is in simple words\n- Give a price or price range and what it includes\n- Book a day and time that suits her",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "The deck quote that's $2,000 higher",
          description:
            "You're a carpenter who quoted $14,500 to replace a backyard deck, and the owner has a cheaper quote. Explain the difference in your price and try to win the job.",
          difficultyLevel: "intermediate",
          character: {
            name: "Dimitri Papadakis",
            role: "homeowner comparing two quotes for a new deck",
            goal:
              "You want a new 20-square-metre hardwood deck before your daughter's engagement party in eight weeks. You have this quote at $14,500 and another at $12,400 from Lakeside Decking. You want to know why this one is dearer. You ask about timber type, footings, removing the old deck and warranty. If asked, you admit the other quote doesn't mention removal or council checks. You'll go with this tradie if they explain clearly and can finish before the party, maybe with a small discount.",
            demeanor: "direct, practical, polite but businesslike, compares numbers out loud",
            openingLine: "Look, I'll be honest, I've got another quote here that's two grand cheaper. Why should I go with you?",
            endCondition:
              "the learner has explained what their quote includes compared with the cheaper one, answered the timing question and agreed a next step",
            voice: "cedar",
          },
          learnerRole: "carpenter who has quoted a deck replacement",
          taskCard:
            "- Stay calm and ask what the other quote includes\n- Explain what your $14,500 covers, item by item\n- Confirm you can finish before his party in eight weeks\n- Decide whether to offer anything extra or hold your price\n- Agree on a clear next step",
          learnerOpens: false,
          timeLimitMinutes: 7,
        },
        {
          title: "Kitchen reno with a growing wish list",
          description:
            "You're a builder quoting a kitchen renovation, but the client keeps adding extras and wants a fixed price with a discount. Hold your price, explain variations and leave with an agreed scope.",
          difficultyLevel: "advanced",
          character: {
            name: "Priya Raman",
            role: "homeowner planning a kitchen renovation in Charlestown",
            goal:
              "You want a new kitchen for $38,000 all in. During the chat you keep adding things: moving the sink to the island, a butler's pantry, extra power points. You want one fixed price, no surprises, and 10% off for paying the deposit quickly. You push back if the tradie mentions variations or provisional sums. If asked, you reveal your real limit is $42,000 and the pantry is optional. You respect someone who explains costs clearly and stays firm but friendly.",
            demeanor: "confident, fast-talking, friendly but relentless, interrupts with new ideas",
            openingLine: "So, the basic plan's on the table, but I've had a few more ideas since we spoke. Can you just give me one number?",
            endCondition:
              "the learner has separated the core job from the extras, explained how variations are priced, responded to the discount request and agreed what the written quote will cover",
            voice: "coral",
          },
          learnerRole: "builder quoting a kitchen renovation",
          taskCard:
            "- Find out her budget and which extras really matter\n- Explain the difference between the fixed price and variations\n- Respond to the 10% discount request without giving your margin away\n- Agree what the written quote will and won't include",
          learnerOpens: false,
          timeLimitMinutes: 9,
        },
      ],
    },
    // 2. Trade counter
    {
      slug: "ordering-at-the-trade-counter",
      kind: "roleplay",
      title: "Ordering at the Trade Counter",
      tagline: "Order materials clearly, sort out substitutes and fix a stuff-up with your supplier before it costs you a day.",
      description:
        "For tradies and small builders who order materials in person or over the phone and want to get it right first time. You play the customer at a trade supply counter, and the person behind the counter is busy, knowledgeable and expects you to know what you need. You'll practise giving sizes, quantities and delivery details clearly, checking prices, and dealing with problems on the spot. The first scenario is a straightforward timber order with a friendly counter worker. In the second, half your order is out of stock and you need to choose a substitute, check it will do the job and change your delivery. In the third, a delivery turned up wrong and your account is suddenly on hold, so you need to stay firm, explain the impact on your job and negotiate a fix and a credit. You'll finish with clear phrases for specs, stock checks, back orders and complaints.",
      keywords: ["trade supplies", "ordering materials", "suppliers", "delivery", "tradies"],
      whatYouGet: [
        "Practice giving sizes, lengths and quantities without confusion",
        "Language for substitutes, back orders and delivery changes",
        "A firm-but-fair complaint to a supplier about a wrong delivery",
        "Phrases for asking about trade accounts, credits and pricing",
      ],
      audience: "Tradies and small builders who order materials from trade suppliers.",
      bannerBrief:
        "An isometric clay trade counter stacked with plasticine timber, boxes of screws and an orange forklift, with an olive ute backed up to the loading bay.",
      scenarios: [
        {
          title: "Timber for a pergola",
          description:
            "You're at the trade counter ordering treated pine for a pergola job. Give the sizes and quantities, check the price and arrange delivery.",
          difficultyLevel: "beginner",
          character: {
            name: "Tony Russo",
            role: "counter salesperson at Hunter Trade Supplies",
            goal:
              "You're serving a tradie who needs timber for a pergola. You want exact sizes, lengths and quantities. You ask if they have a trade account and the account name. Treated pine 90x90 posts are $48 each at 3 metres; 140x45 beams are $9.50 a metre. Delivery is $65 within 15 kilometres, next morning if ordered before 2pm. If asked, you mention the 5% trade discount for account holders. You read back the order to confirm.",
            demeanor: "friendly, efficient, slightly rushed, uses short questions",
            openingLine: "G'day, what can I get you today?",
            endCondition:
              "the learner has given sizes and quantities, heard the total, and confirmed delivery address and time",
            voice: "ash",
          },
          learnerRole: "carpenter ordering timber for a pergola",
          taskCard:
            "- Order four 90x90 treated pine posts and enough beams for the job\n- Give lengths clearly and check the price\n- Arrange delivery to the job site for tomorrow morning\n- Listen to the read-back and correct anything wrong",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "Out of stock on the plasterboard",
          description:
            "You're ordering plasterboard for a job starting Monday, but the board you want is out of stock. Work out a substitute or a new delivery plan that keeps your job on track.",
          difficultyLevel: "intermediate",
          character: {
            name: "Linh Tran",
            role: "trade counter supervisor at Hunter Trade Supplies",
            goal:
              "You're helping a tradie who wants 40 sheets of 10mm wet-area plasterboard. You only have 15 in stock; more arrives next Thursday. You can offer 13mm wet-area board at $4 more per sheet, or split the delivery. You ask what room it's for and when they need it. You won't promise the Thursday truck is certain. If asked, you can order from the Maitland branch for Saturday delivery with a $40 transfer fee.",
            demeanor: "helpful, calm, honest about stock, explains options clearly but won't overpromise",
            openingLine: "Right, I've checked the system and we've only got fifteen sheets of the ten-mil. Let's work something out.",
            endCondition:
              "the learner has chosen an option, confirmed the price difference or extra fee, and agreed delivery dates",
            voice: "sage",
          },
          learnerRole: "plasterer ordering board for a bathroom job",
          taskCard:
            "- Explain you need 40 sheets for a bathroom job starting Monday\n- Ask about every option she has\n- Check the extra cost of each option\n- Choose one and confirm the delivery date",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "Wrong delivery and an account on hold",
          description:
            "You're calling your supplier because yesterday's delivery was wrong and now your account has been put on hold. Get the right stock sent, your account unlocked and a credit for the mistake.",
          difficultyLevel: "advanced",
          character: {
            name: "Gareth Hughes",
            role: "accounts and dispatch manager at Coalfields Building Supplies",
            goal:
              "A tradie is calling about a wrong delivery: they got pine decking instead of merbau. Their account is on hold because invoice 4471 for $2,180 is 35 days overdue. You won't release new stock until it's paid or there's a payment date. You'll swap the decking but say redelivery is $85. If pushed, you can waive the fee, give a $100 credit and release the account if they commit to paying by Friday. You stay polite but follow policy.",
            demeanor: "polite, procedural, a bit defensive, slowly softens if treated with respect",
            openingLine: "Coalfields Building Supplies, Gareth speaking.",
            endCondition:
              "the learner has explained the wrong delivery, dealt with the overdue invoice, and agreed on redelivery, any fee or credit, and when the account is released",
            voice: "ballad",
          },
          learnerRole: "deck builder with a trade account",
          taskCard:
            "- Explain the wrong delivery and how it's holding up your job\n- Find out why your account is on hold\n- Push back on the $85 redelivery fee\n- Agree on a payment date and when the right decking arrives",
          learnerOpens: true,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 3. Toolbox talk
    {
      slug: "running-a-site-toolbox-talk",
      kind: "roleplay",
      title: "Running a Site Toolbox Talk",
      tagline: "Lead the morning briefing, explain the day's risks clearly and handle the crew member who's heard it all before.",
      description:
        "For leading hands, small builders and business owners who run the crew and need to speak up at the start of the day. You play the person giving the toolbox talk on site. You'll practise explaining the day's plan, naming the hazards in plain English, checking people understand and listening to their concerns. In the first scenario, a new labourer has a few simple questions about the job and where things are, so you get comfortable giving clear instructions. In the second, a scaffolder raises a real concern about the heat and the break schedule, and you need to listen and adjust the plan. In the third, an experienced worker brushes off the rule about harnesses on the roof, in front of everyone, and you need to stay calm, explain why it matters and get agreement without a blow-up. You won't be tested on safety law; this is about communicating clearly and keeping the crew on side.",
      keywords: ["toolbox talk", "site safety", "leadership", "crew briefing", "construction"],
      whatYouGet: [
        "Practice giving a short, clear morning briefing",
        "Language for checking understanding instead of just asking 'all good?'",
        "A calm way to respond when someone challenges a safety rule",
        "Phrases for adjusting plans after listening to the crew",
      ],
      audience: "Leading hands and small business owners who brief a crew on site.",
      bannerBrief:
        "An isometric clay building site with plasticine workers in hi-vis orange gathered around an esky and a whiteboard, an olive ute parked nearby.",
      scenarios: [
        {
          title: "New labourer's first morning",
          description:
            "You're the leading hand giving a new labourer their first toolbox talk. Explain today's job, the main hazards and where to find things, and check they've understood.",
          difficultyLevel: "beginner",
          character: {
            name: "Jayden Walker",
            role: "new labourer on his first day at a house build",
            goal:
              "You're 19 and it's your first day on a two-storey house build in Wallsend. You want to know what you'll be doing, who to ask for help, where the first aid kit and toilet are, and what time smoko is. You ask one question at a time. You're keen but quiet. If asked whether you understand, you honestly say you didn't catch something about the trench, and you need it explained again more simply.",
            demeanor: "keen, polite, a bit nervous, short answers, says 'yep' a lot",
            openingLine: "Morning. Jayden. They said to come find you?",
            endCondition:
              "the learner has explained the day's tasks, the main hazards including the trench, where things are and the break times, and checked Jayden understands",
            voice: "verse",
          },
          learnerRole: "leading hand running the morning toolbox talk",
          taskCard:
            "- Welcome Jayden and explain today's job in simple steps\n- Point out the main hazards, including the open trench\n- Tell him where the first aid kit and amenities are\n- Check he understands by asking him to repeat the key points",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "Heat, breaks and a worried scaffolder",
          description:
            "You're running the toolbox talk on a 38-degree day and a scaffolder raises concerns about the heat. Listen, adjust the plan and make sure the crew agree with it.",
          difficultyLevel: "intermediate",
          character: {
            name: "Mele Fifita",
            role: "scaffolder on a commercial site in Cardiff",
            goal:
              "You're worried about the forecast of 38 degrees. The plan has your crew working on the north face all afternoon with one break. You want an earlier start tomorrow, extra water and shade breaks every hour, and the hardest work done before 11am. You speak up politely but firmly. If asked, you mention a young crew member felt dizzy last week and didn't say anything. You accept a plan that changes timing and checks on people.",
            demeanor: "steady, respectful, firm, speaks for the crew, not looking for a fight",
            openingLine: "Before we start, can I say something about this afternoon? It's meant to hit thirty-eight.",
            endCondition:
              "the learner has listened to Mele's concerns, agreed specific changes to timing, breaks and water, and checked the crew is happy with the new plan",
            voice: "shimmer",
          },
          learnerRole: "site supervisor running the morning toolbox talk",
          taskCard:
            "- Let Mele explain her concerns without interrupting\n- Ask questions to understand what happened last week\n- Agree on clear changes to work times, breaks and water\n- Repeat the new plan so everyone knows it",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "'I've done roofs for 30 years, mate'",
          description:
            "You're giving the toolbox talk and an experienced roofer says he won't wear a harness today. Stay calm in front of the crew, explain why it's not optional and reach an agreement.",
          difficultyLevel: "advanced",
          character: {
            name: "Ray Donnelly",
            role: "experienced roofer who's worked with the business for years",
            goal:
              "You've been roofing for 30 years and think harnesses slow you down. The roof today is a low pitch in Adamstown and you reckon it's fine. You challenge the boss in front of the crew and joke about it. You push back on 'rules' but listen to real reasons. If asked privately, you admit your back is sore and the harness rubs. You'll agree if the boss stays respectful, explains the reasons and offers a better-fitting harness.",
            demeanor: "gruff, joking, stubborn, proud of experience, softens if respected",
            openingLine: "Harness? On that? Mate, I've been doing roofs since before you could drive.",
            endCondition:
              "the learner has stayed calm, explained why the harness is required, uncovered Ray's real problem and agreed on a solution he'll accept",
            voice: "cedar",
          },
          learnerRole: "business owner running the morning toolbox talk",
          taskCard:
            "- Stay calm and don't argue back in front of the crew\n- Explain clearly why the harness rule stays\n- Ask questions to find out what's really bothering Ray\n- Offer a practical fix and get his agreement",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 4. Unpaid invoice
    {
      slug: "chasing-an-unpaid-invoice",
      kind: "roleplay",
      title: "Chasing an Unpaid Invoice",
      tagline: "Ask for your money clearly and politely, deal with excuses and agree a firm payment date.",
      description:
        "For tradies and small business owners who hate chasing money but can't afford to let invoices slide. You play the business owner calling a customer about an overdue bill. You'll practise opening the call politely, stating the invoice number and amount, listening to the reason, and pinning down a clear date. The first scenario is a homeowner who simply forgot and is happy to pay once reminded. The second is a customer who says the invoice went to the wrong email and questions one of the charges, so you need to explain the line item and resend. The third is a property manager who says money is tight and asks to pay over three months, and you need to stay professional, negotiate a payment plan you can live with and confirm it in writing. These conversations are about clear communication, not legal steps or debt collection advice.",
      keywords: ["invoices", "getting paid", "cash flow", "small business", "phone calls"],
      whatYouGet: [
        "A simple, polite script for opening a call about an overdue bill",
        "Practice explaining a disputed charge calmly",
        "Language for negotiating a payment plan and confirming it",
        "Confidence asking for a specific date, not just 'soon'",
      ],
      audience: "Sole traders and small business owners who chase their own invoices.",
      bannerBrief:
        "An isometric clay office desk with a plasticine phone, a stack of orange invoices weighed down by a hammer, and an olive ute visible through the window.",
      scenarios: [
        {
          title: "The friendly reminder",
          description:
            "You're an electrician calling a homeowner whose $640 invoice is two weeks overdue. Remind her politely and agree when she'll pay.",
          difficultyLevel: "beginner",
          character: {
            name: "Helen Park",
            role: "homeowner who had new lights installed",
            goal:
              "You had six downlights installed three weeks ago and loved the job. Invoice 1023 for $640 was due two weeks ago and you simply forgot. You apologise and ask how to pay. You want the bank details or a payment link sent by text. You ask if paying tomorrow is okay. If asked, you mention you might want a ceiling fan installed next month.",
            demeanor: "friendly, apologetic, easy-going, a little embarrassed",
            openingLine: "Hello, Helen speaking.",
            endCondition:
              "the learner has mentioned the invoice number and amount, agreed a payment date and how the details will be sent",
            voice: "marin",
          },
          learnerRole: "electrician calling about an overdue invoice",
          taskCard:
            "- Say who you are and why you're calling\n- Mention the invoice number and amount\n- Agree on a payment date and method\n- Finish the call on a friendly note",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "'I never got it, and what's this charge?'",
          description:
            "You're a landscaper chasing a $3,250 invoice, and the customer says he never received it and questions a $420 charge. Explain the charge, resend the invoice and agree a date.",
          difficultyLevel: "intermediate",
          character: {
            name: "Sanjay Mehta",
            role: "homeowner who had his backyard landscaped",
            goal:
              "You had your backyard landscaped last month. You say invoice 2207 for $3,250 never arrived; it went to your old work email. You question the $420 line for 'extra soil and removal'. You weren't told about it. If the learner explains the extra four cubic metres needed and that your partner approved it by text, you accept it. You want the invoice resent and will pay within seven days.",
            demeanor: "reasonable but suspicious of extras, precise, asks for details",
            openingLine: "Sanjay here. Sorry, which invoice? I don't think I've seen anything from you.",
            endCondition:
              "the learner has confirmed the correct email, explained the $420 charge, and agreed a payment date",
            voice: "ash",
          },
          learnerRole: "landscaper chasing an overdue invoice",
          taskCard:
            "- Confirm the right email address and offer to resend the invoice\n- Explain the $420 extra charge and who approved it\n- Stay calm if he sounds suspicious\n- Agree on a payment date",
          learnerOpens: true,
          timeLimitMinutes: 6,
        },
        {
          title: "Three months to pay? Negotiating a plan",
          description:
            "You're a painter owed $8,900 by a property manager who now wants three months to pay. Negotiate a payment plan that works for your cash flow and confirm it clearly.",
          difficultyLevel: "advanced",
          character: {
            name: "Craig Thompson",
            role: "property manager at Harbourside Rentals",
            goal:
              "You owe $8,900 for painting two rental units, now 45 days overdue. The owner hasn't paid you yet, so you want to pay in three monthly instalments starting next month. You say 'it's not my fault'. You push back on paying anything this week. If pressed, you admit you can pay $3,000 by Friday. You'd accept two payments if the painter is firm and polite, and you hint at more work if it goes well.",
            demeanor: "smooth, vague, deflects blame, makes promises without dates",
            openingLine: "Yeah, look, I know, I know. I've been meaning to call you about that.",
            endCondition:
              "the learner has stated the amount and how overdue it is, negotiated specific payment amounts and dates, and said they'll confirm the plan in writing",
            voice: "ballad",
          },
          learnerRole: "painting business owner owed money",
          taskCard:
            "- State the amount owed and how long it's overdue\n- Listen to his reason without accepting vague promises\n- Negotiate specific amounts and dates you can live with\n- Say you'll confirm the agreement in writing",
          learnerOpens: true,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 5. Complaints
    {
      slug: "handling-a-complaint-about-your-work",
      kind: "roleplay",
      title: "Handling a Complaint About Your Work",
      tagline: "Listen first, find out what went wrong and offer a fix that keeps your reputation intact.",
      description:
        "Every tradie gets a complaint sooner or later. This course is for business owners who want to handle them calmly and professionally in English. You play the tradesperson who did the work, talking to an unhappy customer. You'll practise listening without getting defensive, asking questions to understand the problem, apologising where it fits, and offering a clear next step. In the first scenario, a customer has noticed paint marks on her skirting boards and just wants them fixed. In the second, a fence is leaning after a storm and the owner thinks it's your workmanship, so you need to ask questions, look at the facts and agree an inspection. In the third, a customer is angry about cracked tiles, wants a full refund and is threatening a bad online review, so you need to stay calm, avoid promising what you can't deliver and work towards a fair solution.",
      keywords: ["complaints", "customer service", "tradies", "reputation", "problem solving"],
      whatYouGet: [
        "Practice listening and summarising a complaint before you respond",
        "Language for apologising without admitting to things you're not sure of",
        "Ways to offer an inspection, a fix or a fair compromise",
        "Calm phrases for angry customers and review threats",
      ],
      audience: "Tradespeople and small business owners who deal directly with customers.",
      bannerBrief:
        "An isometric clay living room with a plasticine tradie kneeling by a cracked orange tile, a homeowner with folded arms and an olive toolbox open on the floor.",
      scenarios: [
        {
          title: "Paint on the skirting boards",
          description:
            "You're a painter who finished a lounge room last week, and the customer has rung about paint marks on her skirting boards. Listen, apologise and arrange to fix it.",
          difficultyLevel: "beginner",
          character: {
            name: "Rosa Bianchi",
            role: "homeowner whose lounge room was recently painted",
            goal:
              "You're mostly happy with your new lounge room paint, but there are white marks on the dark skirting boards in two corners and near the door. You want them fixed, not a refund. You ask when they can come and how long it takes. You're home every day except Wednesday. If asked, you also mention a small drip on the window sill. You're relieved when the painter is polite.",
            demeanor: "polite, mildly disappointed, calm, appreciates an apology",
            openingLine: "Hi, it's Rosa from Kotara. Look, the room looks lovely, but there's a bit of a problem with the skirting.",
            endCondition:
              "the learner has listened, apologised, checked for other issues and booked a time to fix the marks",
            voice: "coral",
          },
          learnerRole: "painter who finished the job last week",
          taskCard:
            "- Listen and thank her for letting you know\n- Ask where the marks are and if anything else needs fixing\n- Apologise and offer to fix it at no cost\n- Book a time that suits her",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "The fence is leaning after the storm",
          description:
            "You're a fencer who built a steel panel fence six months ago, and the owner says it's leaning after a storm. Ask questions, stay open-minded and agree on an inspection.",
          difficultyLevel: "intermediate",
          character: {
            name: "Kevin Nguyen",
            role: "homeowner in Jesmond whose new fence is leaning",
            goal:
              "Your fence was built six months ago for $4,600 and after Sunday's storm, three panels near the back are leaning. You think the posts weren't concreted deep enough. You want it fixed for free. You push back if the tradie blames the storm straight away. If asked, you admit the neighbour's big gum tree dropped a branch on that section. You accept an inspection and a fair answer about who pays.",
            demeanor: "frustrated but reasonable, wants to be taken seriously, a bit impatient",
            openingLine: "Yeah, hi. The fence you put in, it's leaning. Pretty badly. I paid good money for that.",
            endCondition:
              "the learner has asked about what happened, found out about the branch, avoided blaming him, and booked an inspection with a clear explanation of next steps",
            voice: "verse",
          },
          learnerRole: "fencing contractor",
          taskCard:
            "- Let him explain without jumping to the storm as an excuse\n- Ask questions about what happened and when\n- Explain how you'll work out the cause\n- Book an inspection and say what happens after",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "Cracked tiles and a review threat",
          description:
            "You're a tiler and an angry customer says tiles in her new bathroom are cracking. She wants a full refund and is threatening a one-star review. Stay calm and work towards a fair solution.",
          difficultyLevel: "advanced",
          character: {
            name: "Fatima Haddad",
            role: "homeowner with cracked tiles in her new bathroom",
            goal:
              "Your bathroom was tiled two months ago for $7,800. Now four floor tiles near the shower have hairline cracks. You're furious; family is visiting soon. You demand a full refund and say you'll post a one-star review today. You push back on any delay. If asked, you reveal a plumber cut into the floor last month to fix a pipe. You calm down if the tiler stays respectful, takes it seriously and offers a quick inspection and repair plan.",
            demeanor: "angry, emotional, talks fast, interrupts, calms if listened to",
            openingLine: "I can't believe this. Two months! Two months and the tiles are cracking. I want my money back.",
            endCondition:
              "the learner has stayed calm, found out about the plumber, avoided a full refund, and agreed a specific inspection time and possible repair plan",
            voice: "sage",
          },
          learnerRole: "tiling business owner",
          taskCard:
            "- Let her vent and show you understand why she's upset\n- Ask questions to find out what might have caused the cracks\n- Don't agree to a full refund on the spot\n- Offer a quick inspection and a fair plan\n- Respond calmly to the review threat",
          learnerOpens: false,
          timeLimitMinutes: 9,
        },
      ],
    },
    // 6. Scheduling
    {
      slug: "scheduling-jobs-with-clients",
      kind: "roleplay",
      title: "Scheduling Jobs With Clients",
      tagline: "Book times clearly, move jobs when the weather turns and juggle a client who needs everything yesterday.",
      description:
        "For tradies and service businesses who spend half their day on the phone sorting out when they can turn up. You play the business owner booking and rearranging work with clients. You'll practise offering times, confirming dates and addresses, explaining delays honestly and setting expectations about how long a job takes. The first scenario is a retiree booking a gutter clean, where you just need to find a time and confirm the details. In the second, rain has wrecked your week and you need to call a client to move his concreting job, offer new dates and handle his disappointment. In the third, a cafe owner needs a fit-out finished before opening day, wants work done after hours and keeps changing what she wants, so you need to set clear limits, explain what's realistic and agree a schedule you can actually meet.",
      keywords: ["scheduling", "bookings", "rescheduling", "clients", "time management"],
      whatYouGet: [
        "Practice offering and confirming days, times and addresses",
        "Language for explaining weather delays honestly",
        "Ways to say what's realistic without losing the client",
        "Confidence negotiating out-of-hours work and deadlines",
      ],
      audience: "Tradies and service business owners who book their own jobs.",
      bannerBrief:
        "An isometric clay wall calendar with plasticine rain clouds over some days, a hi-vis orange phone and an olive ute waiting in a puddle.",
      scenarios: [
        {
          title: "Booking a gutter clean",
          description:
            "You're a handyman taking a call from a retiree who wants her gutters cleaned. Find a time that suits you both and confirm the details.",
          difficultyLevel: "beginner",
          character: {
            name: "Dorothy Kemp",
            role: "retiree in Belmont who needs her gutters cleaned",
            goal:
              "You want your gutters cleaned before winter; it's a single-storey brick house. You ask how much it costs and when someone can come. You prefer Tuesday or Thursday, not before 9am. You give your address, 14 Lakeview Street, Belmont, and spell 'Kemp' if asked. You ask if you need to be home. If asked, you mention the side gate sticks and there's a friendly dog called Biscuit.",
            demeanor: "gentle, slow, chatty, double-checks details",
            openingLine: "Oh hello, I'm ringing about getting my gutters done. Is that something you do?",
            endCondition:
              "the learner has given a price, agreed a day and time, confirmed the address and access details",
            voice: "shimmer",
          },
          learnerRole: "handyman taking a booking call",
          taskCard:
            "- Ask about the house and what she needs\n- Give a price and offer a couple of times\n- Confirm her name, address and the time\n- Ask about access, gates or pets",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "Rain delay on the driveway pour",
          description:
            "You're a concreter calling a client to move his driveway pour because of rain. Explain why, offer new dates and handle his frustration.",
          difficultyLevel: "intermediate",
          character: {
            name: "Marco Esposito",
            role: "homeowner in Lambton waiting for a new driveway",
            goal:
              "Your driveway pour was booked for Thursday and your car is parked on the street. Your in-laws arrive Saturday week. You're annoyed about the delay and ask why they can't pour in light rain. You want the earliest new date and a promise it won't move again. You push back on 'sometime next week'. If asked, you're flexible on Monday or Tuesday and can leave the side gate open.",
            demeanor: "frustrated, talks with his hands, wants certainty, calms with clear dates",
            openingLine: "Hello? Oh, it's you. Let me guess, you're not coming Thursday.",
            endCondition:
              "the learner has explained the weather reason, offered specific new dates, agreed one, and set expectations about further weather delays",
            voice: "cedar",
          },
          learnerRole: "concreter rescheduling a job",
          taskCard:
            "- Explain why you can't pour on Thursday\n- Offer two specific new dates\n- Be honest that weather could still affect it\n- Confirm the new date and what he needs to do",
          learnerOpens: true,
          timeLimitMinutes: 6,
        },
        {
          title: "Cafe fit-out against the clock",
          description:
            "You're a shopfitter and a cafe owner needs her fit-out done before opening in ten days, with work after hours and changes still coming. Agree a realistic schedule and clear limits.",
          difficultyLevel: "advanced",
          character: {
            name: "Grace Liu",
            role: "owner of Little Lane Cafe opening soon in Hamilton",
            goal:
              "Your cafe opens in ten days and invites are out. You want the counter, shelving and seating done, with noisy work only after 6pm because the shop next door complains. You also want to change the counter top to timber. You push for everything by day eight. If asked, you admit the shelving can wait until after opening and you'd pay extra for weekend work. You want a clear daily plan.",
            demeanor: "stressed, fast, decisive, interrupts, appreciates honesty",
            openingLine: "Okay, I've got ten days and I need to know exactly what's happening each day. Can we go through it?",
            endCondition:
              "the learner has explained what's realistic, priced or dealt with the change and after-hours work, agreed what can wait, and set out a day-by-day plan",
            voice: "marin",
          },
          learnerRole: "shopfitter running a small business",
          taskCard:
            "- Find out which parts must be finished before opening\n- Explain what's realistic in ten days\n- Discuss the cost of after-hours or weekend work and the counter change\n- Agree on a clear schedule you can actually meet",
          learnerOpens: false,
          timeLimitMinutes: 9,
        },
      ],
    },
    // 7. Bookkeeper
    {
      slug: "talking-with-your-bookkeeper",
      kind: "roleplay",
      title: "Talking With Your Bookkeeper",
      tagline: "Answer questions about your paperwork, sort out missing records and ask good questions about your numbers.",
      description:
        "For small business owners who'd rather be on the tools than sitting with a bookkeeper or accountant, but know the conversation matters. You play the business owner. You'll practise explaining what you spent money on, admitting what's missing, asking for things to be explained again and making a decision with the facts in front of you. This course is about communication only; it doesn't teach tax rules, and the characters always point you back to your own adviser for the details. In the first scenario, your bookkeeper asks for some receipts and you sort out how to send them. In the second, there are missing invoices and a few personal expenses on the business card, so you need to explain and agree how to fix it. In the third, you meet your accountant about whether you can afford to take on staff, and you need to ask clear questions and not just nod along.",
      keywords: ["bookkeeping", "accountant", "receipts", "small business", "cash flow"],
      whatYouGet: [
        "Practice explaining expenses and paperwork in plain English",
        "Language for asking someone to explain numbers again",
        "Confidence admitting a mistake and agreeing how to fix it",
        "Questions to ask before making a big business decision",
      ],
      audience: "Sole traders and small business owners who work with a bookkeeper or accountant.",
      bannerBrief:
        "An isometric clay desk with a plasticine calculator, a shoebox of orange receipts and an olive hard hat resting on a ledger.",
      scenarios: [
        {
          title: "Where are the receipts?",
          description:
            "You're a sole trader and your bookkeeper has called asking for receipts from last month. Explain what you've got and agree how you'll send them.",
          difficultyLevel: "beginner",
          character: {
            name: "Anita Sharma",
            role: "bookkeeper at Northshore Bookkeeping",
            goal:
              "You're doing the monthly books for a sole trader. You need receipts for three purchases from last month: $312 at a hardware store, $95 for fuel and $480 for a new drill. You ask whether they have photos or paper copies. You suggest snapping a photo and emailing them, or using the shared folder. If asked, you explain you just need them by Friday. You never give tax advice; you say their accountant can answer those questions.",
            demeanor: "organised, patient, friendly, speaks clearly and repeats numbers",
            openingLine: "Hi, it's Anita from Northshore Bookkeeping. Got a minute? I'm missing a few receipts from last month.",
            endCondition:
              "the learner has said which receipts they have, agreed how to send them and confirmed the Friday deadline",
            voice: "coral",
          },
          learnerRole: "sole trader electrician",
          taskCard:
            "- Listen to which receipts she needs\n- Say which ones you have and which you might have lost\n- Agree how you'll send them\n- Confirm the deadline",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "Personal spending on the business card",
          description:
            "You're meeting your bookkeeper, who has found missing invoices and some personal purchases on your business card. Explain what happened and agree how to sort it out.",
          difficultyLevel: "intermediate",
          character: {
            name: "Brendan O'Connor",
            role: "bookkeeper at Harbour Ledger Services",
            goal:
              "You've found two problems: five customer invoices from March totalling $6,200 that aren't in the system, and $740 on the business card that looks personal, including a $260 restaurant bill and $480 at a surf shop. You ask about each one. You're not judging, but you need the facts. You suggest they keep a separate personal card. If asked about tax, you say they should check with their accountant. You want a plan for sending invoices weekly.",
            demeanor: "calm, methodical, slightly dry humour, non-judgemental",
            openingLine: "Thanks for coming in. Couple of things I need to go through with you, nothing scary.",
            endCondition:
              "the learner has explained the missing invoices and the personal purchases, and agreed a plan for sending paperwork in future",
            voice: "ash",
          },
          learnerRole: "owner of a small plumbing business",
          taskCard:
            "- Explain why the March invoices are missing\n- Be honest about the personal purchases\n- Ask what you need to do to fix it\n- Agree a simple routine for the future",
          learnerOpens: false,
          timeLimitMinutes: 7,
        },
        {
          title: "Can I afford to hire?",
          description:
            "You're meeting your accountant to talk about whether your business can afford a full-time worker. Ask clear questions, push for plain explanations and leave with a decision or a next step.",
          difficultyLevel: "advanced",
          character: {
            name: "Mei Chen",
            role: "accountant at Rivergate Accounting",
            goal:
              "Your client wants to hire a full-time worker. Their books show strong months but two slow winter months and $18,000 in overdue invoices. You think hiring is possible only if they chase debts and keep a cash buffer. You use some jargon and only explain it if asked. You won't decide for them, and say any tax or wage questions need checking against their own details. If asked, you suggest a three-month casual trial first.",
            demeanor: "precise, professional, a bit fast, uses jargon until asked to slow down",
            openingLine: "So, you've been thinking about putting someone on full-time. Let's look at the numbers together.",
            endCondition:
              "the learner has asked for unclear terms to be explained, discussed the risks and overdue invoices, and agreed a decision or clear next step",
            voice: "sage",
          },
          learnerRole: "owner of a growing landscaping business",
          taskCard:
            "- Explain why you want to hire someone\n- Ask her to explain any terms you don't understand\n- Ask about the risks and what you'd need to change\n- Agree on a decision or a clear next step",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 8. Apprentice
    {
      slug: "hiring-your-first-apprentice",
      kind: "roleplay",
      title: "Hiring Your First Apprentice",
      tagline: "Interview a nervous school leaver, answer a mature-age applicant's questions and win over a candidate with another offer.",
      description:
        "For tradies who are ready to take on an apprentice and want to run the conversations well. You play the business owner doing the hiring. You'll practise asking open interview questions, describing the job honestly, answering questions about hours, training and the work, and making an offer. In the first scenario, you interview a nervous school leaver and need to put him at ease and find out if he's keen. In the second, a mature-age applicant has lots of practical questions about hours, TAFE days and how the job fits with family, so you need clear, honest answers and to say when you'll check details. In the third, your top candidate has another offer and you need to sell your business, discuss start dates and agree terms without overpromising. Pay rates and training rules are never stated as fact here; the focus is on talking clearly and fairly.",
      keywords: ["apprentices", "hiring", "interviews", "tafe", "small business"],
      whatYouGet: [
        "Practice asking open questions in an interview",
        "Language for describing the job and your workplace honestly",
        "Ways to answer questions you're not sure about without guessing",
        "Confidence making an offer and negotiating a start date",
      ],
      audience: "Tradespeople and small business owners hiring an apprentice for the first time.",
      bannerBrief:
        "An isometric clay workshop with a plasticine boss and a young apprentice in an orange hi-vis vest shaking hands beside an olive ute and a toolbox.",
      scenarios: [
        {
          title: "A nervous school leaver",
          description:
            "You're interviewing a 17-year-old for a first-year carpentry apprenticeship. Put him at ease, ask about his interests and tell him about the job.",
          difficultyLevel: "beginner",
          character: {
            name: "Liam Jackson",
            role: "school leaver applying for a carpentry apprenticeship",
            goal:
              "You're 17 and finished Year 12 at a local high school. You did woodwork at school, helped your uncle build a shed, and you love being outside. You're nervous and give short answers until asked open questions. You want to know what a normal day looks like and what time you start. If asked, you don't have a driver's licence yet but your mum can drop you off. You really want this job.",
            demeanor: "shy, polite, short answers at first, opens up when encouraged",
            openingLine: "Hi, um, I'm Liam. I'm here for the apprenticeship?",
            endCondition:
              "the learner has asked about his experience and interests, explained a normal day, answered his questions and said what happens next",
            voice: "verse",
          },
          learnerRole: "carpenter interviewing an apprentice",
          taskCard:
            "- Welcome Liam and help him relax\n- Ask open questions about his experience and interests\n- Describe a normal day on the job\n- Tell him what happens next",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "Mature-age applicant with questions",
          description:
            "You're interviewing a mature-age applicant for an electrical apprenticeship who has lots of practical questions. Give honest answers and say what you'll check and get back to him on.",
          difficultyLevel: "intermediate",
          character: {
            name: "Tama Wihongi",
            role: "mature-age applicant leaving warehouse work to become a sparky",
            goal:
              "You're 31, with two kids, leaving a forklift job to start an electrical apprenticeship. You ask about start and finish times, which day is TAFE, whether you'd travel far for jobs, and if school pick-ups on Fridays could work. You ask about pay but accept 'I'll send you the details in writing'. You push back gently on vague answers. If asked, you mention you've done your own house wiring plans and have a forklift licence.",
            demeanor: "mature, direct, friendly, thinks before speaking, wants straight answers",
            openingLine: "Thanks for seeing me. I've got a few questions, if that's all right, because it's a big change for me.",
            endCondition:
              "the learner has answered his questions about hours, TAFE, travel and Fridays honestly, said what they'll confirm in writing and asked about his experience",
            voice: "ballad",
          },
          learnerRole: "electrician interviewing an apprentice",
          taskCard:
            "- Answer his questions about hours, TAFE and travel honestly\n- Say clearly what you'll check and send in writing\n- Ask about his work experience and why he wants the change\n- Discuss whether the Friday request can work",
          learnerOpens: false,
          timeLimitMinutes: 7,
        },
        {
          title: "Your top pick has another offer",
          description:
            "You're offering an apprenticeship to your top candidate, but she has an offer from a bigger company. Sell your business honestly, agree a start date and close the deal.",
          difficultyLevel: "advanced",
          character: {
            name: "Kiara Williams",
            role: "apprentice candidate with two job offers",
            goal:
              "You want a plumbing apprenticeship and have an offer from Statewide Plumbing Group, a big company with a company van later on. This business is small but you liked the owner. You ask what makes them better, how much variety you'd get and who'd train you. You want to start in three weeks, not next Monday, after a family trip to Dubbo. If asked, you value one-on-one training most. You'll accept if the owner is honest and flexible.",
            demeanor: "confident, friendly, thoughtful, asks follow-up questions, won't be rushed",
            openingLine: "I'm really keen, honestly. But I've got another offer and I need to make a decision this week.",
            endCondition:
              "the learner has explained what their business offers honestly, handled the start date request and either agreed terms with Kiara or agreed when she'll decide",
            voice: "shimmer",
          },
          learnerRole: "owner of a small plumbing business",
          taskCard:
            "- Ask what matters most to her in an apprenticeship\n- Explain what your business offers without overpromising\n- Negotiate her start date\n- Agree terms or a clear decision date",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 9. Subcontractor
    {
      slug: "negotiating-with-a-subcontractor",
      kind: "roleplay",
      title: "Negotiating With a Subcontractor",
      tagline: "Book a sub, push back on a price rise and sort out a late job and a disputed variation.",
      description:
        "For builders and head contractors who rely on subbies to get jobs done on time and on budget. You play the person booking and managing the subcontractor. You'll practise confirming scope, price and dates, questioning a price change, and negotiating when things go wrong. The first scenario is a simple booking with an electrician where you confirm what's included and when he can start. In the second, your tiler has put his price up because of material costs, and you need to understand why, push back and find a middle ground. In the third, your electrical contractor is running late, wants extra money for a variation you didn't agree to, and your client is waiting, so you need to stay firm, separate the issues and reach a deal that keeps the job moving and the relationship intact.",
      keywords: ["subcontractors", "negotiation", "builders", "variations", "pricing"],
      whatYouGet: [
        "Practice confirming scope, price and start dates with a sub",
        "Language for questioning a price rise politely",
        "Ways to negotiate a middle ground without damaging the relationship",
        "Phrases for handling delays and disputed variations",
      ],
      audience: "Builders and contractors who hire and manage subcontractors.",
      bannerBrief:
        "An isometric clay site office with two plasticine tradies leaning over plans on an orange trestle table, an olive ute and a cable drum outside.",
      scenarios: [
        {
          title: "Booking the sparky",
          description:
            "You're a builder booking an electrician for the rough-in on a renovation. Confirm what's included, the price and when he can start.",
          difficultyLevel: "beginner",
          character: {
            name: "Steve Kowalski",
            role: "electrician who regularly subcontracts for small builders",
            goal:
              "You're being booked for the rough-in on a two-bedroom renovation in New Lambton. Your price is $3,800 for the rough-in, including cabling for 12 power points and 14 lights. You can start Tuesday the 14th and need two days. You ask when the frame inspection is booked and whether the site has power. If asked, the fit-off is a separate $1,900 later. You're easygoing and want clear details.",
            demeanor: "relaxed, friendly, practical, says 'no worries' a lot",
            openingLine: "Yeah, mate, Steve here. You after me for that New Lambton job?",
            endCondition:
              "the learner has confirmed the scope, price, start date and site details",
            voice: "cedar",
          },
          learnerRole: "builder booking a subcontractor",
          taskCard:
            "- Confirm the job and what's included\n- Check the price and when he can start\n- Answer his questions about the site\n- Repeat the agreed details back to him",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "The tiler's price just went up",
          description:
            "You're a builder and your tiler has raised his price by $1,200 after you'd agreed a quote. Find out why, push back and agree a fair price.",
          difficultyLevel: "intermediate",
          character: {
            name: "Hamid Rahimi",
            role: "wall and floor tiler subcontracting on a bathroom job",
            goal:
              "You quoted $5,400 for a bathroom three months ago. Now you want $6,600 because adhesive and waterproofing costs went up and the job was delayed. You push back on 'a quote is a quote'. If asked, you admit $500 of the rise is materials and the rest is because the delay made you turn down other work. You'd accept $5,900 if the builder confirms a firm start date and pays within 14 days.",
            demeanor: "polite, firm, a bit apologetic, explains with numbers",
            openingLine: "I need to talk to you about the price, brother. I'm sorry, but the old number doesn't work any more.",
            endCondition:
              "the learner has found out the reasons for the increase, negotiated a price both agree on and confirmed the start date and payment terms",
            voice: "ash",
          },
          learnerRole: "builder managing a bathroom renovation",
          taskCard:
            "- Ask exactly why the price has gone up\n- Push back politely on the increase\n- Find a middle ground you can both accept\n- Confirm the start date and payment terms",
          learnerOpens: false,
          timeLimitMinutes: 7,
        },
        {
          title: "Late, over budget and a variation you never agreed to",
          description:
            "You're a builder and your electrical contractor is a week late and wants $2,400 for a variation you never signed off. Your client is waiting. Separate the issues and reach a deal.",
          difficultyLevel: "advanced",
          character: {
            name: "Joanne Fraser",
            role: "director of Fraser Electrical, a small electrical contractor",
            goal:
              "Your team is a week behind on a house extension because a worker was sick. You want $2,400 extra for moving the switchboard, which the client asked your electrician for on site; there's no written variation. You want it paid before you finish. You push back hard on doing it free. If asked, you admit nobody told the builder. You'd accept $1,500 if you finish by Friday and the builder confirms the client approved it.",
            demeanor: "assertive, quick, businesslike, defends her team, respects firmness",
            openingLine: "Before you start, I know we're behind. But we also need to talk about the switchboard.",
            endCondition:
              "the learner has dealt with the delay and the variation separately, negotiated an amount and finish date, and agreed to put it in writing",
            voice: "coral",
          },
          learnerRole: "builder managing a house extension",
          taskCard:
            "- Raise the delay and ask for a firm finish date\n- Explain your position on the unapproved variation\n- Negotiate a fair amount, if any\n- Agree to confirm everything in writing",
          learnerOpens: false,
          timeLimitMinutes: 9,
        },
      ],
    },
    // 10. Market stall
    {
      slug: "running-a-market-stall",
      kind: "roleplay",
      title: "Running a Market Stall",
      tagline: "Chat with browsers, handle a return with no receipt and negotiate a bulk order with a business buyer.",
      description:
        "For market stallholders and small shop owners who want to sell with confidence in English. You play the stallholder at a weekend market. You'll practise greeting customers, describing your products, answering questions about price and materials, handling a problem and negotiating a deal. In the first scenario, a friendly shopper asks about your handmade soy candles and you help her choose a gift. In the second, a customer wants to return a cracked ceramic bowl but has no receipt, and you need to ask questions, follow your own stall policy and offer a fair fix. In the third, a cafe owner wants to stock your products and asks for a big discount, so you need to talk about quantities, delivery and price, decline what doesn't work and agree a deal you can actually make money on.",
      keywords: ["market stall", "small shop", "selling", "customer service", "wholesale"],
      whatYouGet: [
        "Practice describing your products simply and warmly",
        "Language for handling returns and problems fairly",
        "Ways to say no to a discount without losing the sale",
        "Confidence negotiating a first wholesale order",
      ],
      audience: "Market stallholders and small shop owners who sell face to face.",
      bannerBrief:
        "An isometric clay market stall with an olive awning, plasticine candles and bowls on an orange cloth, and a small ute parked behind.",
      scenarios: [
        {
          title: "Choosing a candle for a gift",
          description:
            "You're selling handmade soy candles at a weekend market and a shopper is looking for a gift. Help her choose and complete the sale.",
          difficultyLevel: "beginner",
          character: {
            name: "Ivy Santos",
            role: "shopper browsing at the Newcastle foreshore weekend market",
            goal:
              "You're looking for a birthday gift for your sister, who likes fresh, light scents. Your budget is about $40. You ask what the candles are made of, how long they burn and if they come gift-wrapped. Small candles are $22 and large are $38. You ask if they take card. If asked, you say your sister also likes lemon and coconut, and you might buy a second small one for yourself.",
            demeanor: "cheerful, curious, chatty, smells everything",
            openingLine: "Oh, these smell lovely! Are they all handmade?",
            endCondition:
              "the learner has described the candles, helped her choose, told her the price and completed the sale",
            voice: "marin",
          },
          learnerRole: "stallholder selling handmade candles",
          taskCard:
            "- Greet her and ask who the gift is for\n- Describe a few scents and the sizes\n- Help her choose within her budget\n- Tell her the total and finish the sale",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "A cracked bowl and no receipt",
          description:
            "You sell handmade ceramics and a customer is back with a cracked bowl but no receipt. Ask questions, explain your stall policy and offer a fair fix.",
          difficultyLevel: "intermediate",
          character: {
            name: "Peter Andreou",
            role: "customer returning a cracked ceramic bowl",
            goal:
              "You bought a $55 serving bowl here three weeks ago and it cracked. You don't have a receipt; you paid cash. You want a refund. You push back if asked for proof. If asked how it cracked, you admit you put it in the dishwasher, but the tag didn't say not to. You'd accept a replacement or a store credit if the stallholder is polite and explains clearly.",
            demeanor: "irritated, a bit defensive, softens when treated fairly",
            openingLine: "Hi. I bought this from you a few weeks ago and look, it's cracked right through.",
            endCondition:
              "the learner has asked when and how it was bought and how it cracked, explained their policy, and agreed a replacement, credit or refund",
            voice: "ballad",
          },
          learnerRole: "stallholder selling handmade ceramics",
          taskCard:
            "- Stay friendly and look at the bowl\n- Ask when he bought it and how it cracked\n- Explain your policy clearly\n- Offer a fair solution and agree on it",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "A cafe wants to stock your jams",
          description:
            "You make small-batch jams and a cafe owner wants to stock them, but asks for 40% off. Negotiate quantity, delivery and price, and agree a deal you can make money on.",
          difficultyLevel: "advanced",
          character: {
            name: "Hyun-woo Kim",
            role: "owner of Driftwood Cafe in The Junction",
            goal:
              "You love these jams; they sell for $12 at the stall. You want 48 jars a month at $7.20 each, 40% off, delivered free every fortnight. You push back on anything over $8. If asked, you'd take 60 jars a month if the price is right, and you can pick up yourself on Mondays. You'd also like a small display sign with the cafe's name. You want a month's trial before a longer deal.",
            demeanor: "friendly, smart negotiator, calm, uses compliments to push the price",
            openingLine: "These are the best jams I've tried. I'd love them in my cafe. Can we talk about a wholesale price?",
            endCondition:
              "the learner has negotiated price, quantity and delivery, declined any terms that don't work, and agreed a trial deal",
            voice: "verse",
          },
          learnerRole: "small-batch jam maker with a market stall",
          taskCard:
            "- Ask how many jars he wants and how often\n- Respond to the 40% discount without giving away your profit\n- Discuss delivery or pick-up\n- Agree a trial deal with clear terms",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
  ],
};

