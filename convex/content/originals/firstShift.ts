import type { OriginalCreator } from "./types";

export const firstShift: OriginalCreator = {
  handle: "first-shift",
  displayName: "First Shift",
  tagline: "Speaking practice for your first job in Australian retail: the register, the phone, the roster and the boss.",
  bio: "First Shift is a XINGO Original studio based in Geelong, Victoria. We make speaking practice for people starting their first job in Australian retail, whether that's a weekend casual role at a gift shop or full-time work at a big homewares store. In every course you play the new staff member. You serve customers at the register, process returns, help people find stock and answer the store phone. You also practise the conversations behind the counter that nobody trains you for: your first day with a supervisor, asking to swap a shift, calling in sick, reporting a hazard and asking a question about your pay. Each course starts gently and builds to the busy, awkward moments, so you can stay calm and clear when they happen for real.",
  location: "Geelong, VIC",
  accent: "#1D4ED8",
  visualStyle:
    "Bold flat vector illustration with chunky rounded shapes, thick even outlines and no gradients, in cobalt blue with sunny yellow highlights on white. Friendly, simple characters with name badges and lanyards in bright, tidy shop settings.",
  logoBrief:
    "A chunky cobalt blue name badge with a sunny yellow sunrise rising over its top edge, drawn as a bold flat vector mark.",
  avatarBrief:
    "A friendly flat vector shop worker in a cobalt blue polo and yellow lanyard, smiling and waving, on a plain white circle.",
  courses: [
    // 1. Register
    {
      slug: "serving-at-the-register",
      kind: "roleplay",
      title: "Serving at the Register",
      tagline: "Greet, scan, take payment and say goodbye: the everyday checkout conversation, from easy to busy.",
      description:
        "This course is for anyone starting a casual or part-time job on the checkout in an Australian shop. You play the new staff member behind the register, and the customers come to you. You'll practise the small, repeated phrases that make a checkout feel smooth: greeting people, asking if they found everything, telling them the total, asking how they'd like to pay, offering a bag or a receipt and saying goodbye. In the first scenario a friendly regular buys a few things and pays by card, so you can get the rhythm right. In the second, an item scans at the wrong price and you need to explain what you'll do about it without losing the customer's patience. In the third, a customer in a hurry wants to split payment across a gift card and a bank card, use a discount code and get a gift receipt, while a queue builds behind them. By the end you'll sound calm and polite even when the till is not cooperating.",
      keywords: ["retail", "checkout", "customer service", "payment", "first job", "casual work"],
      whatYouGet: [
        "Three checkout conversations that build from a simple sale to a rushed, complicated one",
        "Natural phrases for totals, payment, bags and receipts that Australian customers expect",
        "Practice explaining a price problem clearly without blaming anyone",
        "Confidence to stay polite and organised while a queue builds",
      ],
      audience: "New casual and part-time retail workers who serve customers at a register.",
      bannerBrief:
        "A flat vector checkout counter with a smiling worker in a cobalt polo handing a yellow shopping bag to a customer, a card reader glowing yellow.",
      scenarios: [
        {
          title: "A friendly regular at the checkout",
          description:
            "You're working the register at Harbourline Homewares, and a cheerful regular customer brings three items to your counter. Greet her, ring up the sale, take payment and see her off.",
          difficultyLevel: "beginner",
          character: {
            name: "Margaret Doyle",
            role: "retired regular customer at Harbourline Homewares",
            goal:
              "You're buying a set of four tea towels ($18), a candle ($12.50) and a birthday card ($6.95). You want to chat a little and you like polite service. You'll pay by card with tap. You don't need a bag unless the learner offers one, then you say yes please. If asked whether you found everything, you mention you couldn't find the matching oven mitt. You'd like a receipt only if asked.",
            demeanor: "warm, chatty and patient, speaks slowly, likes small talk about the weather",
            openingLine: "Hello love, just these three today, thanks.",
            endCondition:
              "the learner has told you the total, you have paid, they have offered a bag or receipt and said goodbye",
            voice: "marin",
          },
          learnerRole: "new casual checkout staff member",
          taskCard:
            "- Greet the customer and ask if she found everything\n- Tell her the total and ask how she'd like to pay\n- Offer a bag and a receipt\n- Thank her and say goodbye",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "The price on the shelf was lower",
          description:
            "You're on the register when a customer says the kitchen scales rang up higher than the shelf ticket. You need to check the price politely and tell him what happens next.",
          difficultyLevel: "intermediate",
          character: {
            name: "Tuan Nguyen",
            role: "customer buying kitchen scales at Harbourline Homewares",
            goal:
              "You're buying digital kitchen scales. The shelf ticket said $24.99 but the till shows $34.99. You want the lower price. You're polite but firm. If the learner asks where you saw it, say aisle 6, near the mixing bowls. If they offer to check or call a supervisor, you agree to wait two minutes. If they come back and honour $24.99, you pay by card. If they just say the till is right, you ask to speak to someone.",
            demeanor: "calm, polite but persistent, short clear sentences",
            openingLine: "Sorry, that's not right. The ticket on the shelf said twenty-four ninety-nine.",
            endCondition:
              "the learner has checked or explained the price, told you the final amount and you have either paid or been passed to a supervisor",
            voice: "cedar",
          },
          learnerRole: "new casual checkout staff member",
          taskCard:
            "- Apologise and ask where he saw the lower price\n- Explain that you'll check it or ask a supervisor\n- Tell him the final price clearly\n- Finish the sale politely",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "Split payment with a queue building",
          description:
            "It's a busy Saturday and a customer in a hurry wants to use a gift card, a discount code and her bank card, plus a gift receipt. Keep her moving while getting every step right.",
          difficultyLevel: "advanced",
          character: {
            name: "Priya Raman",
            role: "busy customer buying a gift at Harbourline Homewares",
            goal:
              "You're buying a $79 linen throw as a gift. You have a store gift card with $50 on it, a code SPRING10 for 10% off, and you'll pay the rest by debit card. You also want a gift receipt and the price tag removed. You're running late for a party. You push to skip steps and talk fast. If the learner says the code only works online, you ask them to check again. You stay friendly if they explain each step clearly.",
            demeanor: "fast-talking, a bit impatient, checks her phone, friendly if kept informed",
            openingLine: "Hi, I'm in a real rush. I've got a gift card and a code, can we do this quickly?",
            endCondition:
              "the learner has applied or explained the discount, taken the gift card and the rest by card, given you the final amount and arranged the gift receipt",
            voice: "coral",
          },
          learnerRole: "new casual checkout staff member",
          taskCard:
            "- Stay calm and take one payment step at a time\n- Check whether the discount code can be used in store\n- Tell her what the gift card covers and what's left to pay\n- Arrange a gift receipt and remove the price tag",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 2. Returns
    {
      slug: "returns-and-refunds-at-the-counter",
      kind: "roleplay",
      title: "Returns and Refunds at the Counter",
      tagline: "Handle returns, exchanges and refund requests clearly, kindly and by the store's rules.",
      description:
        "This course is for new retail staff who are put on the service desk and suddenly have to handle returns. You play the staff member, and each customer brings something back. You'll practise asking for a receipt, finding out what's wrong with an item, explaining the store's own returns policy in plain words and offering a refund, exchange or store credit. In the first scenario a customer returns a faulty kettle with a receipt, so the path is clear and you can focus on the steps. In the second, someone has changed their mind about a gift and has no receipt, so you need to explain what you can and can't do. In the third, a frustrated customer wants cash back for a used item bought weeks ago and won't take no for an answer, and you must hold the line politely and offer the options you do have. You'll finish ready to say no kindly and to call a supervisor when you should.",
      keywords: ["retail", "returns", "refunds", "exchange", "customer service", "service desk"],
      whatYouGet: [
        "Three returns conversations from straightforward to tense",
        "Clear phrases for asking about receipts, faults and payment method",
        "Practice explaining a store policy without sounding cold",
        "Ways to decline a request and still offer real options",
      ],
      audience: "New retail staff who work on a service desk or handle returns at the register.",
      bannerBrief:
        "A flat vector service desk with a boxed kettle on the counter, a cobalt-shirted worker holding a yellow receipt and a customer pointing at the box.",
      scenarios: [
        {
          title: "A faulty kettle with a receipt",
          description:
            "You're on the service desk at Bayside Variety and a customer brings back a kettle that stopped working. He has his receipt, so process the return step by step.",
          difficultyLevel: "beginner",
          character: {
            name: "Gary Pappas",
            role: "customer returning a faulty kettle at Bayside Variety",
            goal:
              "You bought a white kettle for $39 nine days ago. It stopped heating yesterday. You have the receipt and the box. You paid by card. You'd be happy with a refund or a new one, whichever is easier. If the learner asks what's wrong, explain it turns on but the water never boils. If they offer an exchange, you ask if the same model is in stock, then accept.",
            demeanor: "easygoing, friendly, speaks slowly and clearly, a little apologetic",
            openingLine: "G'day, this kettle's carked it after a week. I've got the receipt here.",
            endCondition:
              "the learner has asked what's wrong, checked the receipt and arranged a refund or exchange you have agreed to",
            voice: "ash",
          },
          learnerRole: "new service desk staff member",
          taskCard:
            "- Ask what the problem is with the kettle\n- Ask for the receipt and how he paid\n- Offer a refund or an exchange\n- Confirm what happens next and thank him",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "A change of mind with no receipt",
          description:
            "A customer wants to return an unwanted gift but has no receipt. You need to explain the store's policy and offer what you can.",
          difficultyLevel: "intermediate",
          character: {
            name: "Mei Zhou",
            role: "customer returning an unwanted gift at Bayside Variety",
            goal:
              "You received a blue ceramic vase as a gift and don't like it. It's unused with the tag on. You have no receipt and don't know the price. You want your money back. Bayside Variety's policy: without a receipt, change-of-mind returns get store credit at the current price, which is $29. If the learner explains this clearly, you ask if you can swap it for the green one instead, then accept. If they're vague, you get confused and ask again.",
            demeanor: "polite, slightly unsure, asks the learner to repeat things",
            openingLine: "Hi, I got this as a present but it's not really my style. Can I get a refund?",
            endCondition:
              "the learner has explained the no-receipt policy clearly and you have agreed to store credit or an exchange",
            voice: "sage",
          },
          learnerRole: "new service desk staff member",
          taskCard:
            "- Ask whether she has a receipt and if the item is unused\n- Explain that without a receipt you can offer store credit or an exchange\n- Tell her the value of the credit\n- Help her choose and finish the return",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "Cash back for a used item, weeks later",
          description:
            "A frustrated customer wants a cash refund for a used camping chair bought seven weeks ago. You need to explain the policy, stay calm and offer the options you actually have.",
          difficultyLevel: "advanced",
          character: {
            name: "Darren Walsh",
            role: "frustrated customer at Bayside Variety",
            goal:
              "You bought a $65 camping chair seven weeks ago, used it on a trip and now say it's uncomfortable. You paid by card but want cash. The store policy is 30 days for change of mind, and refunds go back to the original card. You push hard, say other shops do it and ask for the manager. You calm down if the learner stays polite, explains clearly and offers to check if it's faulty or to call a supervisor.",
            demeanor: "irritated, interrupts, raises his voice a little, softens when treated with respect",
            openingLine: "I want my money back for this chair. Cash. It's rubbish.",
            endCondition:
              "the learner has explained the policy, declined the cash refund politely and offered a supervisor or another option you accept",
            voice: "ballad",
          },
          learnerRole: "new service desk staff member",
          taskCard:
            "- Listen and ask when and how he bought the chair\n- Explain the 30-day policy and that refunds go back to the card\n- Decline the cash refund politely\n- Offer a realistic next step, such as a supervisor or a fault check",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 3. Finding stock
    {
      slug: "helping-customers-find-stock",
      kind: "roleplay",
      title: "Helping Customers Find Stock",
      tagline: "Ask the right questions, point people to the right aisle and handle 'we're out of that'.",
      description:
        "This course is for new shop floor staff who get stopped every few minutes with 'excuse me, do you have...?' You play the staff member, and customers approach you with questions. You'll practise greeting people on the floor, asking what they're after, giving clear directions around the store, checking stock and suggesting alternatives. In the first scenario a customer wants photo frames and you can walk her to the right aisle. In the second, the item a customer wants is out of stock, so you need to check the system, explain when more is coming and offer another option. In the third, a customer wants a gift for someone she barely knows and only has a vague idea and a budget, so you need to ask good questions, make suggestions and help her decide without pushing. By the end you'll be comfortable starting conversations on the floor and turning a 'no' into something useful.",
      keywords: ["retail", "shop floor", "directions", "stock", "customer service", "first job"],
      whatYouGet: [
        "Three shop floor conversations from a simple request to an open-ended one",
        "Clear language for giving directions inside a store",
        "Practice explaining that something is out of stock and offering alternatives",
        "Questions that help undecided customers choose",
      ],
      audience: "New retail staff who work on the shop floor and help customers find products.",
      bannerBrief:
        "A flat vector store aisle with tall cobalt shelves, a worker pointing ahead with a yellow arrow sign and a customer holding a shopping basket.",
      scenarios: [
        {
          title: "Where are the photo frames?",
          description:
            "You're stocking shelves at Waterfront Gifts & Home when a customer asks you for photo frames. Find out what she needs and tell her where to go.",
          difficultyLevel: "beginner",
          character: {
            name: "Rosa Bianchi",
            role: "customer looking for photo frames at Waterfront Gifts & Home",
            goal:
              "You want two photo frames for 6 by 4 inch photos of your grandchildren. You'd like simple white or wooden frames, about $10 to $15 each. The frames are in aisle 4, on the left, past the candles. If the learner asks about size or colour, answer clearly. You're happy if they give you directions or walk you there. You thank them warmly.",
            demeanor: "gentle, friendly, speaks slowly, a bit unsure of the store layout",
            openingLine: "Excuse me, dear, do you sell photo frames?",
            endCondition:
              "the learner has asked what size or style you need and given you clear directions or taken you to the frames",
            voice: "shimmer",
          },
          learnerRole: "new shop floor staff member",
          taskCard:
            "- Greet the customer and ask what she's looking for\n- Ask about the size or style she needs\n- Give clear directions to aisle 4 or offer to walk her there\n- Check if she needs anything else",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "Out of stock on the shelf",
          description:
            "A customer can't find the bathroom scales he saw in the catalogue, and the shelf is empty. Check what's going on and offer him a useful option.",
          difficultyLevel: "intermediate",
          character: {
            name: "Ahmad Haddad",
            role: "customer looking for catalogue item at Waterfront Gifts & Home",
            goal:
              "You want the $45 glass bathroom scales from this week's catalogue. The shelf is empty. The system shows none in store, five arriving Thursday, and two at the Belmont store. You need them this week. If the learner offers to hold one from Thursday's delivery, call Belmont, or suggest the $52 model that is in stock, consider it. You choose the option that's explained most clearly. If they only say 'we're out', you're unimpressed.",
            demeanor: "practical, a bit disappointed, asks direct questions",
            openingLine: "Hi, I'm after those glass bathroom scales from the catalogue. The shelf's empty.",
            endCondition:
              "the learner has checked stock, explained when more arrive and you have agreed to an alternative or a hold",
            voice: "verse",
          },
          learnerRole: "new shop floor staff member",
          taskCard:
            "- Apologise and offer to check the stock system\n- Explain what's in store, at the other store and arriving Thursday\n- Offer at least one alternative\n- Confirm what he's chosen and what happens next",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "A gift for someone she barely knows",
          description:
            "A customer needs a farewell gift for a co-worker she hardly knows, with a $40 budget and no ideas. Ask good questions, suggest a few options and help her decide.",
          difficultyLevel: "advanced",
          character: {
            name: "Joy Santos",
            role: "customer shopping for a farewell gift at Waterfront Gifts & Home",
            goal:
              "You need a farewell gift for Ken, a co-worker retiring next Friday. You don't know him well. Your budget is $40 and it must fit in a bag. Only if asked: he talks about gardening, drinks tea and is moving to the coast. You reject the first idea if it's generic, like a candle. You like a tea gift set ($35) or a garden tool kit ($38). You ask if the store gift wraps (yes, free).",
            demeanor: "chatty, indecisive, changes her mind, appreciates patient questions",
            openingLine: "Okay, I need help. I have to buy a present for someone at work and I've got no idea.",
            endCondition:
              "the learner has asked about the person and budget, suggested at least two options and you have chosen one",
            voice: "marin",
          },
          learnerRole: "new shop floor staff member",
          taskCard:
            "- Ask about the person, the occasion and her budget\n- Suggest at least two items that fit\n- Respond politely if she doesn't like an idea\n- Help her decide and mention gift wrapping",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 4. Phone
    {
      slug: "answering-store-phone-enquiries",
      kind: "roleplay",
      title: "Answering the Store Phone",
      tagline: "Pick up, greet properly and handle questions about hours, orders and holds over the phone.",
      description:
        "This course is for new retail staff who dread the phone ringing. Phone calls are harder than face-to-face because you can't point, smile or show anything, and callers expect you to find answers quickly. You play the staff member who picks up, and each scenario is a different kind of call. You'll practise the standard greeting with the store name, asking for the caller's name, putting someone on hold politely, checking information and repeating back numbers and dates. In the first call, a friendly customer asks about opening hours and parking. In the second, a caller is chasing a click-and-collect order that hasn't been marked ready, and you need to find out what's happened. In the third, an impatient caller wants you to hold an item for a week and match another shop's price, and you need to explain what you can and can't do without promising too much.",
      keywords: ["retail", "phone calls", "customer service", "enquiries", "orders", "first job"],
      whatYouGet: [
        "Three phone calls that build from a simple question to a tricky request",
        "A clear, professional greeting for answering the store phone",
        "Practice putting callers on hold and repeating back details",
        "Ways to say no on the phone without sounding rude",
      ],
      audience: "New retail staff who answer the store phone or take customer calls.",
      bannerBrief:
        "A flat vector worker in a cobalt polo holding a yellow cordless phone behind a counter, with simple speech bubbles and a clock on the wall.",
      scenarios: [
        {
          title: "What time do you close?",
          description:
            "The phone rings at Kardinia Kitchenware and you pick up. Greet the caller with the store name and answer his questions about opening hours and parking.",
          difficultyLevel: "beginner",
          character: {
            name: "Kevin O'Brien",
            role: "customer phoning Kardinia Kitchenware",
            goal:
              "You want to know what time the store closes today (Thursday) and on Sunday. Hours: Monday to Wednesday 9 to 5:30, Thursday 9 to 9, Saturday 9 to 5, Sunday 10 to 4. You also ask where to park. There's free parking behind the store off Mercer Lane. If the learner doesn't know something, you're happy for them to check. You thank them and hang up.",
            demeanor: "friendly, relaxed, speaks clearly, says 'no worries' a lot",
            openingLine: "Oh hi, just wondering what time you close tonight?",
            endCondition:
              "the learner has greeted you with the store name, told you tonight's and Sunday's hours and explained where to park",
            voice: "cedar",
          },
          learnerRole: "new casual staff member answering the phone",
          taskCard:
            "- Answer with a greeting and the store name\n- Tell him the closing time tonight and the Sunday hours\n- Explain where to park\n- Ask if there's anything else and end the call politely",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "Where's my click-and-collect order?",
          description:
            "A caller says she got no message that her online order is ready for pickup. Take her details, check, and explain what's happened.",
          difficultyLevel: "intermediate",
          character: {
            name: "Linh Tran",
            role: "customer phoning about a click-and-collect order",
            goal:
              "You ordered a cast-iron pot online four days ago, order number KK4471, under the name Linh Tran. The website said ready in two days. You've had no text. The truth: it arrived yesterday but wasn't scanned, so no text went out. You want to collect it at 5 pm today. Give your order number only when asked, and spell your name if asked. You're mildly annoyed but calm if the learner puts you on hold politely.",
            demeanor: "polite but a little annoyed, precise with numbers, expects to be kept updated",
            openingLine: "Hi, I ordered something online for pickup and I still haven't heard anything.",
            endCondition:
              "the learner has taken your name and order number, checked the order, explained what happened and confirmed you can collect today",
            voice: "coral",
          },
          learnerRole: "new casual staff member answering the phone",
          taskCard:
            "- Greet the caller and ask for her name and order number\n- Put her on hold politely while you check\n- Explain what happened with the order\n- Confirm when she can collect it and what to bring",
          learnerOpens: true,
          timeLimitMinutes: 6,
        },
        {
          title: "Hold it for a week and match the price",
          description:
            "An impatient caller wants you to hold an expensive item for a week and match a competitor's price over the phone. Explain the rules, offer what you can and don't over-promise.",
          difficultyLevel: "advanced",
          character: {
            name: "Stavros Georgiou",
            role: "impatient caller wanting a hold and price match",
            goal:
              "You want the $249 stand mixer held for seven days and want it for $219, a price you saw at another shop. Store rules: holds are 48 hours only; price matching needs proof shown in store and the item in stock there. You push for a week and an over-the-phone match. If the learner explains clearly, you accept a 48-hour hold and agree to bring proof. If they promise things they can't, you pin them down on it.",
            demeanor: "impatient, talks over people, tests what the learner will promise",
            openingLine: "Yeah, mate, I want you to put a mixer aside for me and match a price. Can you do that?",
            endCondition:
              "the learner has explained the hold and price-match rules, taken your name and number and agreed a realistic hold",
            voice: "ash",
          },
          learnerRole: "new casual staff member answering the phone",
          taskCard:
            "- Greet him and find out exactly what he wants\n- Explain the 48-hour hold rule and the price-match proof rule\n- Offer a realistic option without over-promising\n- Take his name and number and repeat them back",
          learnerOpens: true,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 5. Induction
    {
      slug: "first-day-induction",
      kind: "roleplay",
      title: "Your First Day Induction",
      tagline: "Meet your supervisor, follow a store tour and ask the questions that make day one easier.",
      description:
        "This course is for anyone about to start their first shift in an Australian shop. Your first day is full of names, rules and instructions, and it's easy to nod along without understanding. You play the new staff member, and each scenario is a conversation with someone showing you the ropes. You'll practise introducing yourself, checking instructions, asking someone to repeat or slow down and asking about breaks, uniforms, lockers and who to go to with problems. In the first scenario a friendly supervisor gives you a slow, clear tour. In the second, a shift lead explains your tasks, but your key card doesn't work and there's no shirt in your size, so you need to raise problems politely. In the third, a busy store manager rattles off instructions while doing three things at once, and you need to ask clarifying questions and confirm what you've been told.",
      keywords: ["first day", "induction", "workplace", "supervisor", "retail", "new job"],
      whatYouGet: [
        "Three first-day conversations from a calm tour to a rushed briefing",
        "Phrases for introducing yourself to a supervisor and team",
        "Practice asking someone to repeat, slow down or explain",
        "Confidence to raise small problems early instead of guessing",
      ],
      audience: "People about to start their first job or first shift in an Australian store.",
      bannerBrief:
        "A flat vector supervisor with a yellow clipboard showing a new worker with a fresh cobalt name badge around a bright stockroom.",
      scenarios: [
        {
          title: "A tour with your supervisor",
          description:
            "It's your first morning at Sunny Days Discount Store and your supervisor is showing you around. Introduce yourself, listen and ask about breaks and where to put your things.",
          difficultyLevel: "beginner",
          character: {
            name: "Leanne Fraser",
            role: "store supervisor at Sunny Days Discount Store",
            goal:
              "You're welcoming a new casual on their first shift, 9 am to 3 pm. You show them the staff room, lockers (bring your own padlock), the sign-in tablet and the fire exits. Breaks: 30 minutes for lunch at 12, plus a 10-minute break around 10:30. Uniform is the blue polo and black pants. Only mention breaks and lockers if asked. You ask the learner's name and if they've worked in retail before.",
            demeanor: "warm, encouraging, speaks slowly and checks understanding",
            openingLine: "Morning! You must be our new starter. I'm Leanne. Come on through and I'll show you around.",
            endCondition:
              "the learner has introduced themselves, asked about breaks and where to leave their things, and confirmed their shift times",
            voice: "sage",
          },
          learnerRole: "new casual staff member on your first day",
          taskCard:
            "- Introduce yourself and say if you've worked in a shop before\n- Ask when your breaks are\n- Ask where to leave your bag and things\n- Confirm your finishing time",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "My key card won't work",
          description:
            "Your shift lead is explaining your tasks for the day, but your key card won't open the stockroom and there's no shirt in your size. Raise both problems politely and get a plan.",
          difficultyLevel: "intermediate",
          character: {
            name: "Sanjay Mehta",
            role: "shift lead at Sunny Days Discount Store",
            goal:
              "You're giving a new starter their tasks: face up aisles 3 to 5, unpack the homewares delivery, cover the register from 1 to 2. You assume everything's set up. If they mention their key card, you say IT hasn't activated it and you'll let them in today and email the manager. If they mention the shirt, you lend a spare from the office until Monday. Only fix problems the learner actually raises.",
            demeanor: "friendly but busy, talks a bit quickly, appreciates people who speak up",
            openingLine: "Right, so today I'll get you facing up aisles three to five first. Sound good?",
            endCondition:
              "the learner has repeated back their tasks and raised both the key card and the uniform problem, and you have given a fix for each",
            voice: "ballad",
          },
          learnerRole: "new casual staff member on your first day",
          taskCard:
            "- Listen to your tasks and repeat them back\n- Tell him your key card doesn't open the stockroom\n- Explain there's no uniform shirt in your size\n- Confirm what happens about both problems",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "A rushed briefing from a busy manager",
          description:
            "The store manager briefs you while dealing with deliveries and phone calls, and the instructions come fast and a bit confusing. Ask clarifying questions and confirm exactly what you need to do.",
          difficultyLevel: "advanced",
          character: {
            name: "Bronwyn Kelly",
            role: "store manager at Sunny Days Discount Store",
            goal:
              "You're rushed. You tell the new starter to set up the sale table, do the till float count with Sanjay at 2 and 'sort out the returns cage'. You don't explain which sale items, where the table goes, or what sorting means unless asked. Answers if asked: the red-ticket items, by the front doors, scan returns back into stock. You get a bit short if they interrupt, but you respect people who check.",
            demeanor: "brisk, distracted, clipped sentences, warmer once the learner asks good questions",
            openingLine: "Hi, yep, sorry, it's mad today. Okay, three things for you, are you ready?",
            endCondition:
              "the learner has asked about the sale table, the float count and the returns cage, and repeated all three tasks back to you correctly",
            voice: "shimmer",
          },
          learnerRole: "new casual staff member on your first day",
          taskCard:
            "- Listen carefully to the three tasks\n- Ask a clarifying question about anything unclear\n- Politely interrupt or ask her to slow down if needed\n- Repeat all three tasks back to confirm",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 6. Roster swap
    {
      slug: "swapping-a-roster-shift",
      kind: "roleplay",
      title: "Asking to Swap a Roster Shift",
      tagline: "Ask a supervisor or co-worker to change a shift, explain why, and work out a fair swap.",
      description:
        "This course is for retail workers who need to change a shift on the roster and feel awkward asking. Casual and part-time work often means juggling study, family and other jobs, so knowing how to ask clearly and politely matters. You play the staff member making the request. You'll practise explaining which shift you need to change and why, suggesting a solution, asking a co-worker for a favour and responding when someone says no or adds conditions. In the first scenario a friendly supervisor is happy to help as long as you give the details. In the second, you ask a co-worker to swap directly and he has his own conditions. In the third, your manager is short-staffed and pushes back, so you need to explain why it matters, offer a compromise and accept the outcome professionally.",
      keywords: ["roster", "shifts", "workplace", "supervisor", "casual work", "requests"],
      whatYouGet: [
        "Three conversations about changing a shift, from easy to tough",
        "Polite ways to ask for a change and explain your reason",
        "Practice negotiating a swap with a co-worker",
        "Phrases for offering a compromise when the answer is no",
      ],
      audience: "Casual and part-time retail workers who need to change shifts on the roster.",
      bannerBrief:
        "A flat vector wall roster with cobalt blocks and one yellow shift being swapped by two smiling workers pointing at it.",
      scenarios: [
        {
          title: "Can I change my Saturday shift?",
          description:
            "You need to change next Saturday's shift because of a family event. Ask your supervisor, explain why and suggest another time you can work.",
          difficultyLevel: "beginner",
          character: {
            name: "Ji-woo Park",
            role: "supervisor at Bellarine Outdoor Supply",
            goal:
              "A staff member is asking to change their shift next Saturday, 9 am to 3 pm. You're happy to help if they give you the date, the reason and an alternative. You can move them to Sunday 10 am to 4 pm or Friday evening 4 to 9. You ask which they'd prefer. You remind them to put the request in the roster app too. You're relaxed and supportive.",
            demeanor: "relaxed, supportive, speaks clearly, asks simple follow-up questions",
            openingLine: "Hey, you wanted a quick word?",
            endCondition:
              "the learner has said which shift, why they need the change and agreed a new shift with you",
            voice: "marin",
          },
          learnerRole: "casual staff member at an outdoor store",
          taskCard:
            "- Say which shift you need to change\n- Briefly explain why\n- Suggest or choose another shift you can do\n- Thank her and confirm the new shift",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "Swapping directly with a co-worker",
          description:
            "Your supervisor said you can swap your Thursday late shift if you find someone to cover it. Ask your co-worker and work out a deal he's happy with.",
          difficultyLevel: "intermediate",
          character: {
            name: "Matteo Russo",
            role: "casual co-worker at Bellarine Outdoor Supply",
            goal:
              "A co-worker asks you to take their Thursday 5 to 9 pm shift. You have footy training Thursday until 6:30, so you can only start at 7. You'd swap if they take your Sunday 8 am open in return. If they can't do Sunday, you could cover only from 7 if they find someone for 5 to 7. You're friendly but you don't agree until the details are clear.",
            demeanor: "laid-back, jokey, but careful about details, says 'yeah, nah' and 'mate'",
            openingLine: "Oi, what's up? You look like you want something.",
            endCondition:
              "the learner has asked about the swap, dealt with your training clash and you have both agreed a clear swap or a clear no",
            voice: "verse",
          },
          learnerRole: "casual staff member at an outdoor store",
          taskCard:
            "- Ask him if he can cover your Thursday 5 to 9 pm shift\n- Respond to his condition about training\n- Offer something in return\n- Confirm the exact shifts you've agreed to swap",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "The manager says we're short-staffed",
          description:
            "You need next Friday off for a TAFE exam, but your manager says the store is short-staffed for a big sale. Explain why it matters, offer a compromise and handle her answer professionally.",
          difficultyLevel: "advanced",
          character: {
            name: "Helen Nikolaidis",
            role: "store manager at Bellarine Outdoor Supply",
            goal:
              "A staff member wants next Friday 12 to 8 pm off for a TAFE exam at 1 pm. It's the first day of the winter sale and two people are already off. You first say no. You ask why they didn't ask earlier (roster went out a week ago). You agree only if they offer a real compromise, such as working 4 to 8 pm after the exam or taking an extra Saturday shift. You value honesty.",
            demeanor: "stressed, direct, a bit sceptical at first, fair if given a solution",
            openingLine: "If this is about Friday, I'll be honest, it's not a great day to ask.",
            endCondition:
              "the learner has explained the exam, responded to your concerns and you have agreed a compromise or a clear final answer",
            voice: "coral",
          },
          learnerRole: "part-time staff member at an outdoor store",
          taskCard:
            "- Explain why you need Friday off and the exam time\n- Respond honestly when she asks why you didn't ask sooner\n- Offer a compromise, such as working after the exam\n- Accept her final answer politely",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 7. Calling in sick
    {
      slug: "calling-in-sick",
      kind: "roleplay",
      title: "Calling In Sick",
      tagline: "Ring your workplace, explain you can't come in and answer the questions your manager asks.",
      description:
        "This course is for retail workers who aren't sure what to say when they're too unwell to work. Calling in sick can feel awkward, especially in a new job or a second language, but it's a short, predictable conversation once you know the steps. You play the staff member who rings up. You'll practise saying who you are, explaining that you're unwell without oversharing, saying which shift you'll miss, answering questions about when you might be back and responding to questions about evidence like a medical certificate. In the first call, your supervisor is understanding and just needs the basics. In the second, he asks follow-up questions about paperwork and your next shift. In the third, a stressed manager on a busy Saturday asks if you could come in later instead, and you need to say no clearly and kindly. This course doesn't give medical or legal advice; it's about the conversation.",
      keywords: ["sick leave", "phone call", "workplace", "manager", "casual work", "retail"],
      whatYouGet: [
        "Three short phone calls about missing a shift, from simple to pressured",
        "Clear words for saying you're unwell without oversharing",
        "Practice answering questions about your return and paperwork",
        "Ways to say no politely when asked to come in anyway",
      ],
      audience: "Retail staff who need to call their workplace when they're too unwell to work.",
      bannerBrief:
        "A flat vector worker wrapped in a cobalt blanket on a couch holding a phone, with a yellow mug and a tissue box nearby.",
      scenarios: [
        {
          title: "Letting your supervisor know",
          description:
            "You woke up with a fever and can't work your 10 am shift. Call your supervisor, say who you are, explain you're sick and say which shift you'll miss.",
          difficultyLevel: "beginner",
          character: {
            name: "Tony Ferrara",
            role: "supervisor at Corio Sports & Leisure",
            goal:
              "A staff member is calling in sick for today's 10 am to 4 pm shift. You're understanding. You need their name, which shift, and roughly how they're feeling. You don't need details. You ask if they think they'll be okay for their next shift on Wednesday, and ask them to text you if not. You tell them to rest up and you'll find cover.",
            demeanor: "kind, calm, unhurried, a bit fatherly",
            openingLine: "Corio Sports, Tony speaking.",
            endCondition:
              "the learner has given their name, said they're sick, said which shift they'll miss and answered about their next shift",
            voice: "cedar",
          },
          learnerRole: "casual staff member calling in sick",
          taskCard:
            "- Say who you are\n- Explain that you're unwell and can't come in\n- Say which shift you'll miss\n- Answer his question about your next shift",
          learnerOpens: false,
          timeLimitMinutes: 4,
        },
        {
          title: "Questions about paperwork and next shift",
          description:
            "You're sick for a second day in a row. Call your workplace, explain, and answer the shift manager's questions about a medical certificate and when you'll be back.",
          difficultyLevel: "intermediate",
          character: {
            name: "Sione Taufa",
            role: "shift manager at Corio Sports & Leisure",
            goal:
              "A staff member is calling in sick for a second day, for today's 12 to 6 shift. Store policy here is that two or more days in a row needs a medical certificate or similar evidence. You ask if they can get one and send it to the manager's email. You ask when they think they'll be back, as they're rostered Friday. If they're unsure, ask them to call by Thursday at 5 pm.",
            demeanor: "friendly but businesslike, asks clear direct questions, patient",
            openingLine: "Hey, Sione here. Are you okay? We had you down for twelve.",
            endCondition:
              "the learner has explained they're still sick, agreed about the certificate and told you when they'll update you about Friday",
            voice: "ash",
          },
          learnerRole: "part-time staff member calling in sick",
          taskCard:
            "- Explain that you're still sick and can't work today's shift\n- Answer his question about a medical certificate\n- Say when you'll let him know about Friday\n- Repeat back what you need to do",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "Can't you come in later?",
          description:
            "It's a busy Saturday and you're sick. Your manager is stressed and asks if you could come in for a few hours anyway. Say no clearly and kindly, and offer what you can.",
          difficultyLevel: "advanced",
          character: {
            name: "Nadia Khoury",
            role: "store manager at Corio Sports & Leisure",
            goal:
              "It's 7:30 am Saturday and a staff member is calling in sick for 9 to 5. Two others are already off and there's a sale on. You ask if they could come in from 1 pm, or just do two hours on the register. You push twice. You accept no if they're clear and polite. You ask if they could message the group chat to find cover. You end kindly if they stay respectful.",
            demeanor: "stressed, talks fast, guilt-trips a little, decent underneath",
            openingLine: "Please tell me you're just running late.",
            endCondition:
              "the learner has said they're sick, declined coming in later clearly and politely, and you have agreed a next step",
            voice: "sage",
          },
          learnerRole: "casual staff member calling in sick",
          taskCard:
            "- Say who you are and that you're too sick to work today\n- Apologise for the timing without changing your answer\n- Decline politely if she asks you to come in later\n- Offer a small helpful step and agree on what happens next",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 8. Complaints
    {
      slug: "retail-customer-complaints",
      kind: "roleplay",
      title: "Handling a Customer Complaint",
      tagline: "Listen, apologise, fix what you can and know when to bring in a supervisor.",
      description:
        "This course is for new retail staff who want to handle unhappy customers without freezing up. Complaints usually come to whoever is nearest, and that's often the newest person on the floor. You play the staff member, and the customer comes to you. You'll practise listening without interrupting, apologising in a way that sounds sincere, asking questions to understand the problem, offering a fix and calling in a supervisor when it's beyond you. In the first scenario a customer is mildly annoyed about a long queue and just wants to be heard. In the second, a customer was charged full price when the item was on promotion, and you need to sort out the difference. In the third, a very angry customer complains about a rude staff member and a late delivery and demands a manager, and you need to stay calm, take details and manage what happens next.",
      keywords: ["complaints", "customer service", "retail", "de-escalation", "apology", "problem solving"],
      whatYouGet: [
        "Three complaint conversations from mild to heated",
        "Natural ways to apologise and show you're listening",
        "Practice fixing a pricing mistake step by step",
        "Phrases for calming an angry customer and passing them on properly",
      ],
      audience: "New retail staff who deal with customers face to face and want to handle complaints well.",
      bannerBrief:
        "A flat vector worker listening calmly with a hand on her chest while a customer gestures, a yellow speech bubble turning into a sun.",
      scenarios: [
        {
          title: "The queue took forever",
          description:
            "A customer at your register is annoyed that she waited fifteen minutes in the queue. Listen, apologise and finish her sale on a good note.",
          difficultyLevel: "beginner",
          character: {
            name: "Pauline Hughes",
            role: "annoyed customer at Northgate Pet Supplies",
            goal:
              "You waited 15 minutes because only one register was open. You're buying a bag of dog food ($42) and a chew toy ($9). You want someone to acknowledge the wait. If the learner apologises sincerely and explains briefly (two staff called in sick), you relax. You ask if they could suggest opening another register next time. You pay by card and leave satisfied if treated well.",
            demeanor: "mildly annoyed at first, sighs, warms up quickly when listened to",
            openingLine: "Finally. That's the longest I've ever waited in here.",
            endCondition:
              "the learner has apologised, acknowledged the wait, finished the sale and you are happier",
            voice: "shimmer",
          },
          learnerRole: "new casual staff member at the register",
          taskCard:
            "- Apologise for the wait and show you understand\n- Briefly explain why it was busy, without making excuses\n- Say you'll pass on her feedback\n- Finish the sale politely",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "I should have got the promo price",
          description:
            "A customer comes back to the counter with his receipt: he was charged full price for something that was on a two-for-one deal. Check what happened and fix it.",
          difficultyLevel: "intermediate",
          character: {
            name: "Vikram Iyer",
            role: "customer at Northgate Pet Supplies",
            goal:
              "You bought two bags of cat litter at $18 each, $36 total. The sign said two for $28, so you were overcharged $8. You have the receipt and paid by card. You want the $8 back. If the learner asks to see the receipt or check the sign, agree. The promo was set up wrong in the till. You accept a refund of the difference to your card. You're not angry, just want it fixed properly.",
            demeanor: "polite, precise, a bit tired, likes clear explanations",
            openingLine: "Hi, sorry, I think I've been overcharged. The sign said two for twenty-eight.",
            endCondition:
              "the learner has checked the receipt or promotion, explained the error and refunded or arranged the $8 difference",
            voice: "ballad",
          },
          learnerRole: "new casual staff member at the counter",
          taskCard:
            "- Apologise and ask to see the receipt\n- Check the promotion and explain what went wrong\n- Work out the difference and offer to refund it\n- Thank him for pointing it out",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "An angry customer wants the manager",
          description:
            "An angry customer complains that a staff member was rude on the phone and his delivery is a week late, and he demands the manager, who is at lunch. Calm him down, take the details and agree a next step.",
          difficultyLevel: "advanced",
          character: {
            name: "Craig Mitchell",
            role: "angry customer at Northgate Pet Supplies",
            goal:
              "You ordered a $189 dog crate for home delivery, due last Tuesday. It hasn't come. When you rang, someone was rude and hung up. You demand the manager now. The manager is at lunch until 2 pm. You calm down only if the learner listens, apologises without blaming colleagues, takes your name, phone 0412 555 018 and order DC2290, and promises a call by a set time. You'd accept a refund of delivery costs.",
            demeanor: "loud, frustrated, interrupts, uses short angry sentences, calms when respected",
            openingLine: "I want to see the manager. Right now. This is a joke.",
            endCondition:
              "the learner has listened, apologised, taken your details and order number, and agreed when the manager will contact you",
            voice: "verse",
          },
          learnerRole: "new casual staff member on the shop floor",
          taskCard:
            "- Stay calm, listen and let him finish\n- Apologise without blaming your co-worker\n- Explain the manager is at lunch and take his name, number and order details\n- Agree when the manager will call him back",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 9. Safety
    {
      slug: "reporting-a-safety-hazard",
      kind: "roleplay",
      title: "Reporting a Workplace Safety Hazard",
      tagline: "Spot a hazard, report it clearly and make sure it actually gets fixed.",
      description:
        "This course is for retail workers who want to speak up about safety with confidence. Shops are full of small hazards: spills, broken ladders, boxes in walkways and blocked exits. Reporting them quickly and clearly keeps everyone safe, but new staff often worry about making a fuss. You play the staff member who notices the problem. You'll practise describing what you saw and where, explaining the risk, saying what you've already done and asking what happens next. In the first scenario you tell the duty manager about a spill in an aisle. In the second, you report a near miss with a damaged stockroom ladder to the safety rep, who asks for details for the incident form. In the third, an assistant manager brushes off your report of boxes blocking a fire exit, and you need to stay polite, explain the risk and make sure it's taken seriously. This course is about the conversation, not workplace law.",
      keywords: ["workplace safety", "hazard", "incident report", "retail", "speaking up", "supervisor"],
      whatYouGet: [
        "Three safety conversations from a quick report to pushing back",
        "Clear words for describing what happened, where and when",
        "Practice giving details for an incident or near-miss form",
        "Polite but firm phrases for when a report is brushed off",
      ],
      audience: "Retail staff who want to report hazards and incidents clearly at work.",
      bannerBrief:
        "A flat vector worker pointing at a bright yellow wet-floor sign in a cobalt aisle while a supervisor nods and takes notes.",
      scenarios: [
        {
          title: "There's a spill in aisle 7",
          description:
            "You've just seen a broken bottle of oil spreading across aisle 7. Find the duty manager, tell him what and where, and say what you've done so far.",
          difficultyLevel: "beginner",
          character: {
            name: "Duc Pham",
            role: "duty manager at Pakington Home & Hardware",
            goal:
              "A staff member is reporting a spill. You need to know what was spilled, where, how big it is, and whether anyone's hurt. The spill kit and wet-floor signs are in the cleaning cupboard next to the staff room. You ask the learner to put signs out and stay near the spill while you get the mop. You thank them for reporting it quickly.",
            demeanor: "calm, practical, quick questions, appreciative",
            openingLine: "Yep, what's up?",
            endCondition:
              "the learner has said what and where the spill is, whether anyone's hurt and agreed what they'll do next",
            voice: "cedar",
          },
          learnerRole: "new casual staff member",
          taskCard:
            "- Tell him what you saw and exactly where\n- Say whether anyone is hurt\n- Explain what you've done so far\n- Agree on what you'll do next",
          learnerOpens: true,
          timeLimitMinutes: 4,
        },
        {
          title: "A near miss with the stockroom ladder",
          description:
            "A step on the stockroom ladder cracked while you were on it and you nearly fell. Report it to the health and safety rep and give the details she needs for the form.",
          difficultyLevel: "intermediate",
          character: {
            name: "Grace Wilson",
            role: "health and safety rep at Pakington Home & Hardware",
            goal:
              "A staff member is reporting a near miss. You fill in the incident form and need: the time, where, what happened, which ladder, whether they're hurt and who else saw it. It's the grey three-step ladder in the back stockroom. You ask if they tagged it out of service. If they didn't, you explain you'll tag it now. You ask if they're sure they're okay and say anyone can report hazards anytime.",
            demeanor: "kind, thorough, asks one question at a time, takes notes",
            openingLine: "Thanks for coming to find me. Take a seat. What happened?",
            endCondition:
              "the learner has given the time, place, what happened, whether they're hurt and any witnesses for the form",
            voice: "marin",
          },
          learnerRole: "casual staff member reporting a near miss",
          taskCard:
            "- Explain what happened, when and where\n- Describe the ladder and the damage\n- Say whether you're hurt and if anyone saw it\n- Ask what happens to the ladder now",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "Boxes blocking the fire exit",
          description:
            "Delivery boxes are stacked in front of the back fire exit, and the assistant manager says it's fine for now. Explain the risk politely but firmly and agree when it'll be cleared.",
          difficultyLevel: "advanced",
          character: {
            name: "Lachlan Ross",
            role: "assistant manager at Pakington Home & Hardware",
            goal:
              "You stacked twelve boxes of paint tins in front of the back fire exit because the stockroom is full. You say it's only until Monday. You're busy and a bit defensive. You push back twice: 'nobody uses that door' and 'we'll move it later'. If the learner stays polite and explains the risk clearly, you agree to move them today and ask for help. If they get rude, you get more stubborn.",
            demeanor: "busy, defensive, dismissive at first, reasonable if challenged respectfully",
            openingLine: "If it's about the boxes, yeah, I know. They're only there till Monday.",
            endCondition:
              "the learner has explained the risk clearly and politely, and you have agreed a time to clear the exit",
            voice: "ash",
          },
          learnerRole: "part-time staff member",
          taskCard:
            "- Explain what you saw and why it's a risk\n- Stay polite if he brushes it off\n- Offer to help move the boxes\n- Get a clear agreement on when the exit will be cleared",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 10. Pay
    {
      slug: "asking-about-your-pay",
      kind: "roleplay",
      title: "Asking About Your Pay",
      tagline: "Read your payslip, ask clear questions and follow up when something looks wrong.",
      description:
        "This course is for new retail workers who feel unsure talking about money with their employer. Payslips can be confusing, and it's normal to have questions about your hours, your rate or when you get paid. You play the staff member asking. You'll practise asking what parts of a payslip mean, giving dates and hours clearly, explaining a mismatch and following up politely when the first answer isn't enough. In the first scenario a friendly payroll officer explains your first payslip. In the second, some hours are missing from your pay and you need to give the dates and agree on a fix. In the third, you believe your Sunday shifts were paid at the wrong rate, and the area manager is unsure and a bit defensive, so you need to explain calmly, refer to your letter of offer and agree a next step. This course practises the conversation only; it isn't pay or legal advice.",
      keywords: ["payslip", "pay", "hours", "workplace", "retail", "casual work"],
      whatYouGet: [
        "Three money conversations from a simple question to a firm follow-up",
        "Plain words for hours, rates, tax and super on a payslip",
        "Practice giving dates and numbers clearly",
        "Polite ways to follow up when an answer doesn't add up",
      ],
      audience: "Retail staff who want to ask questions about their pay and payslip with confidence.",
      bannerBrief:
        "A flat vector worker holding a cobalt payslip with yellow highlighted lines, sitting across a desk from a friendly payroll officer.",
      scenarios: [
        {
          title: "What does my payslip mean?",
          description:
            "You've just got your first payslip and some of it doesn't make sense. Ask the payroll officer to explain the parts you don't understand.",
          difficultyLevel: "beginner",
          character: {
            name: "Annie Cho",
            role: "payroll officer for the Coastline Retail Group",
            goal:
              "A new staff member has questions about their first payslip. It shows 18 ordinary hours, gross pay before tax, tax withheld, net pay into their bank and super paid separately into their super fund. Pay is fortnightly on Wednesdays. You explain in plain words, one thing at a time. Only explain items they ask about. You ask if they've given their tax file number and super details, because those affect the payslip.",
            demeanor: "patient, warm, explains simply, checks understanding",
            openingLine: "Hi there, you're one of our new starters, aren't you? How can I help?",
            endCondition:
              "the learner has asked about at least two parts of the payslip and when they get paid, and understands your answers",
            voice: "coral",
          },
          learnerRole: "new casual staff member",
          taskCard:
            "- Say it's your first payslip and you have some questions\n- Ask what at least two parts mean, such as gross, tax or super\n- Ask when you get paid\n- Check you've understood by repeating back",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "Some of my hours are missing",
          description:
            "Your payslip shows 22 hours, but you worked 27 because you stayed late twice. Explain the dates and hours to your store manager and agree how it gets fixed.",
          difficultyLevel: "intermediate",
          character: {
            name: "Daniel Okafor",
            role: "store manager at Wavecrest Homewares",
            goal:
              "A staff member says hours are missing. The truth: they stayed 2.5 hours late on Tuesday the 9th and Friday the 12th, but forgot to clock out so the system cut it off. You need the dates, times and who asked them to stay. If they say you asked them to stay, you remember. You can fix it as a correction in the next pay. You remind them always to clock out.",
            demeanor: "friendly, a bit distracted, fair once given details",
            openingLine: "Sure, I've got five minutes. What's up with your pay?",
            endCondition:
              "the learner has given the dates and hours missing, and you have agreed how and when it will be corrected",
            voice: "ballad",
          },
          learnerRole: "casual staff member",
          taskCard:
            "- Explain that hours are missing from your payslip\n- Give the dates and how long you stayed\n- Say who asked you to stay back\n- Confirm when the missing pay will be fixed",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "Sunday shifts at the wrong rate",
          description:
            "Your letter of offer says Sundays are paid at a higher rate, but your last three Sundays were paid at the normal rate. Raise it calmly with the area manager, who is unsure and a bit defensive.",
          difficultyLevel: "advanced",
          character: {
            name: "Kirra Anderson",
            role: "area manager for the Coastline Retail Group",
            goal:
              "A staff member says Sundays were underpaid. Their letter of offer (which you haven't read) lists a separate Sunday rate. You first say casual rates already include everything. You get a bit defensive about 'being accused'. If the learner stays calm, refers to the letter and gives the three Sunday dates, you agree to check with payroll and reply by Friday in writing. You won't promise back pay on the spot.",
            demeanor: "professional, guarded, a bit defensive, respects calm facts",
            openingLine: "Okay, I've got a few minutes. You said there's a problem with your pay?",
            endCondition:
              "the learner has explained the issue with dates, referred to their letter of offer and you have agreed a written follow-up by a set day",
            voice: "sage",
          },
          learnerRole: "part-time staff member",
          taskCard:
            "- Explain calmly what your letter of offer says about Sundays\n- Give the dates of the Sunday shifts affected\n- Respond politely if she becomes defensive\n- Ask for a written reply and agree a date",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
  ],
};
