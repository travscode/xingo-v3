import type { OriginalCreator } from "./types";

export const lanewayCoffeeClub: OriginalCreator = {
  handle: "laneway-coffee-club",
  displayName: "Laneway Coffee Club",
  tagline: "Everyday English for Melbourne life: coffee orders, brunch, trams, markets and the small talk in between.",
  bio: "Laneway Coffee Club is a XINGO Original studio for people building a life in Melbourne. We practise the English you actually need before 10am: ordering a coffee the way you like it, sorting out a brunch booking, asking the tram driver for help, chatting with the stallholder at the market or explaining the haircut you want. Every course is a set of short role-plays with friendly locals who speak at a natural pace, then add the small complications that happen in real life, like a sold-out pastry or a wrong order. The goal is simple: walk into any cafe, shop or chat in this city and feel relaxed. Free to practise, one conversation at a time.",
  location: "Melbourne, VIC",
  accent: "#B4532A",
  visualStyle: "Warm risograph print: grainy two- and three-colour overprint in terracotta, deep teal and cream, with slight misregistration, halftone shading and simple hand-cut shapes.",
  logoBrief: "A risograph-printed takeaway coffee cup in terracotta overprinted on a teal laneway arch, slightly misregistered on grainy cream paper.",
  avatarBrief: "A round risograph badge showing a steaming cup and a tram wire overhead in terracotta and teal halftone on cream, edges a little off-register.",
  courses: [
    {
      slug: "your-first-melbourne-coffee",
      kind: "roleplay",
      title: "Your First Melbourne Coffee",
      tagline: "Order a flat white, a long black or an oat latte with confidence, even when the cafe is packed.",
      description:
        "Melbourne takes its coffee seriously, and ordering can feel like a test when there is a queue behind you. This course is for new arrivals, students and anyone who freezes at the counter. You practise the words locals use every day: flat white, long black, magic, cup size, milk choices, extra shot, have here or takeaway, and how to pay by card or with your phone. In the first scenario a patient barista at a quiet neighbourhood cafe helps you order a simple coffee and pay. In the second, the cafe has run out of your milk and the barista suggests alternatives, so you need to understand the options and decide. In the third, it is the morning rush at a city laneway cafe, your coffee comes out wrong and you need to fix it politely and quickly without holding everyone up. By the end you will know the menu, the rhythm of the counter and the polite phrases that get you exactly what you want.",
      keywords: ["coffee", "cafe", "ordering", "melbourne", "flat white", "small talk"],
      whatYouGet: [
        "Three counter conversations that step up from a quiet cafe to the morning rush",
        "Melbourne coffee words: flat white, long black, magic, piccolo, extra shot",
        "Polite ways to ask for changes and fix a wrong order",
        "Practice paying, choosing sizes and saying have here or takeaway",
      ],
      audience: "Newcomers to Melbourne who want to order coffee quickly and naturally.",
      bannerBrief: "A risograph print of a barista handing a cup across a laneway counter, terracotta steam over a teal espresso machine, grainy and off-register.",
      scenarios: [
        {
          title: "A quiet morning at the corner cafe",
          description:
            "You're at Sparrow & Spoon, a small cafe in Brunswick, on a quiet weekday morning. Order a coffee the way you like it, choose a size and pay.",
          difficultyLevel: "beginner",
          character: {
            name: "Sophie Nguyen",
            role: "barista at a quiet neighbourhood cafe in Brunswick",
            goal: "You're serving at Sparrow & Spoon. You want to take a clear coffee order. Ask what they'd like, then check size (small $4.80, regular $5.30, large $5.80), milk (full cream, skim, oat or almond, plant milk is 60 cents extra) and whether it's for here or takeaway. If they ask, explain a flat white is like a latte with less foam. Offer a banana bread for $6.50. Card or phone payment only today.",
            demeanor: "friendly and unhurried, speaks slowly, smiles a lot, simple sentences",
            endCondition: "the learner has ordered a coffee, confirmed the size and milk, said here or takeaway, and paid",
            voice: "marin",
          },
          learnerRole: "customer",
          taskCard:
            "- Greet the barista and order a coffee\n- Choose a size and a milk\n- Say if it's for here or takeaway\n- Ask one question about the menu\n- Pay and say thanks",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "Sorry, we're out of oat milk",
          description:
            "You're ordering at Kettle Lane, a busy cafe in Fitzroy, but they've run out of the milk you usually have. Listen to the options and decide what to order.",
          difficultyLevel: "intermediate",
          character: {
            name: "Marco Bellini",
            role: "barista and part-owner of a busy Fitzroy cafe",
            goal: "You run Kettle Lane with your sister. Today the oat milk delivery didn't arrive, so you only have full cream, skim, lactose-free and soy. Apologise and explain the options clearly. Suggest lactose-free if they avoid dairy for the stomach, or a long black if they want no milk at all. A regular is $5.40, soy is 70 cents extra. If they seem unsure, offer a small taster. Don't be pushy; let them decide.",
            demeanor: "chatty and apologetic, a bit quick, uses Aussie phrases like 'no worries' and 'heaps'",
            endCondition: "the learner has understood the milk problem, chosen something else and paid",
            voice: "cedar",
          },
          learnerRole: "customer",
          taskCard:
            "- Order your usual coffee with oat milk\n- Understand why it's not available\n- Ask about the other options\n- Decide on a different order and pay",
          learnerOpens: true,
          timeLimitMinutes: 6,
        },
        {
          title: "Morning rush and the wrong coffee",
          description:
            "You're in a packed city laneway cafe at 8:30am and your coffee comes out wrong. Fix it politely and quickly while the barista juggles a long queue.",
          difficultyLevel: "advanced",
          character: {
            name: "Hannah Okafor",
            role: "barista at a crowded CBD laneway cafe during the morning rush",
            goal: "You're slammed at Tenpenny Lane Espresso with twenty orders waiting. You handed this customer a large latte with full cream, but they ordered a regular skim flat white. At first you insist the docket says latte. Only if they explain clearly and calmly, check the docket again, admit the mistake and remake it. If they're rude or vague, stay short with them. Offer a free cookie only if they stay polite.",
            demeanor: "rushed and a bit defensive, talks fast, calls names over the noise, warms up if treated kindly",
            openingLine: "Large latte for... um, you? Here you go, next!",
            endCondition: "the learner has explained the mistake clearly and the barista has agreed to remake the right coffee",
            voice: "coral",
          },
          learnerRole: "customer",
          taskCard:
            "- Notice the coffee is wrong and get the barista's attention\n- Explain exactly what you ordered\n- Stay calm if she doesn't believe you at first\n- Get the right coffee made without holding up the queue",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    {
      slug: "weekend-brunch-in-melbourne",
      kind: "roleplay",
      title: "Weekend Brunch in Melbourne",
      tagline: "Get a table, order smashed avo the way you want it and sort out the bill with friends.",
      description:
        "Brunch is a Melbourne weekend ritual, and it comes with its own language: walk-ins, waitlists, sides, swaps, gluten-free options and splitting the bill. This course is for anyone who wants to enjoy a long breakfast out without worrying about the English. You start by asking for a table and ordering a simple dish from a relaxed waiter. In the second scenario you have a food allergy and need to ask good questions about the menu, understand what the kitchen can change and order safely. In the third, your group's bill is wrong, the cafe has a no-split policy and the manager is reluctant, so you have to explain the problem, negotiate a fair fix and keep it friendly. You will practise asking about wait times, describing what you want, checking ingredients, making polite requests and handling money conversations with confidence. Each scenario is short, realistic and set in an invented Melbourne cafe.",
      keywords: ["brunch", "restaurant", "menu", "allergies", "paying the bill", "melbourne"],
      whatYouGet: [
        "Practice getting a table, joining a waitlist and ordering brunch",
        "Clear phrases for asking about allergies and changing a dish",
        "A realistic bill problem to negotiate politely",
        "Confidence with sides, swaps and splitting payments",
      ],
      audience: "Anyone who wants to enjoy brunch out in Melbourne and handle the menu and bill with ease.",
      bannerBrief: "A risograph print of a brunch table seen from above, terracotta eggs and teal plates on cream, grainy halftone and misaligned layers.",
      scenarios: [
        {
          title: "A table for two and smashed avo",
          description:
            "You've just walked into Wattle & Rye, a sunny cafe in Northcote, on a Saturday. Ask for a table, order a brunch dish and a drink.",
          difficultyLevel: "beginner",
          character: {
            name: "Dimitri Papadakis",
            role: "waiter at a sunny weekend brunch cafe in Northcote",
            goal: "You're working the floor at Wattle & Rye. You want to seat them and take a simple order. There's a table for two by the window right now. Recommend the smashed avo on sourdough with feta ($21) or the big breakfast ($26). Ask how they want their eggs if they order some: poached, fried or scrambled. Sides like bacon or mushrooms are $5 each. Ask if they'd like a coffee or juice.",
            demeanor: "cheerful and relaxed, speaks clearly, makes small jokes about the weather",
            endCondition: "the learner has been seated and ordered a meal and a drink",
            voice: "ash",
          },
          learnerRole: "customer",
          taskCard:
            "- Ask for a table for two\n- Ask what the waiter recommends\n- Order a dish and say how you want any eggs\n- Order a drink",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "Ordering safely with an allergy",
          description:
            "You're at Little Fig, a brunch spot in Carlton, and you have a nut allergy. Ask about the dishes and find something you can safely eat.",
          difficultyLevel: "intermediate",
          character: {
            name: "Priya Raman",
            role: "waitress at a popular brunch cafe in Carlton",
            goal: "You work at Little Fig. The house granola and the pesto on the green eggs both contain nuts, and the banana bread is made in a kitchen that uses almonds. The corn fritters ($23) and the mushroom toast ($22) can be made nut-free if the customer asks. You'll check with the chef if asked a specific question. Don't promise anything is completely allergen-free; say the kitchen handles nuts but takes care.",
            demeanor: "careful and kind, asks follow-up questions, a little formal when talking about allergies",
            endCondition: "the learner has explained the allergy, asked about dishes and ordered something that can be made safely",
            voice: "sage",
          },
          learnerRole: "customer with a nut allergy",
          taskCard:
            "- Tell the waitress about your nut allergy\n- Ask which dishes are safe or can be changed\n- Ask how the kitchen avoids cross-contact\n- Order a dish and confirm the change",
          learnerOpens: true,
          timeLimitMinutes: 6,
        },
        {
          title: "The bill doesn't add up",
          description:
            "You're paying for a group of five at Grain Store Kitchen in Collingwood. The bill looks too high and the cafe says it doesn't split bills, so sort it out politely.",
          difficultyLevel: "advanced",
          character: {
            name: "Liam O'Connor",
            role: "duty manager at a busy Collingwood brunch cafe",
            goal: "You manage Grain Store Kitchen on a hectic Sunday. The group's bill is $168, but it wrongly includes two extra flat whites ($11) and a $15 side they cancelled. Your policy is one bill per table and a 10% weekend surcharge. Defend the policy at first. Only after they point out specific wrong items, check and remove them. You'll allow paying in two or three parts if they ask nicely, but not five.",
            demeanor: "polite but firm, a bit tired, sticks to policy until given clear reasons",
            endCondition: "the learner has had the wrong items checked and an agreement has been reached on the total and how to pay",
            voice: "ballad",
          },
          learnerRole: "customer paying for a group",
          taskCard:
            "- Ask to go through the bill item by item\n- Point out the items you didn't receive\n- Ask about the surcharge\n- Negotiate how the group can pay\n- Stay friendly and confirm the final total",
          learnerOpens: true,
          timeLimitMinutes: 8,
        },
      ],
    },
    {
      slug: "bakery-counter-english",
      kind: "roleplay",
      title: "Bakery Counter English",
      tagline: "Buy bread, pastries and a birthday cake, and handle the sold-out shelf like a local.",
      description:
        "A good local bakery is part of everyday life in Melbourne, but the counter moves fast and the names can be confusing: sourdough, rye, vanilla slice, sausage roll, sliced or unsliced. This course is for learners who want to shop for bread and treats without pointing and hoping. In the first scenario you buy a loaf and a couple of pastries from a friendly baker and ask simple questions. In the second, the item you came for has sold out, so you need to understand the alternatives, ask about tomorrow's baking and maybe pre-order. In the third, you are collecting a custom birthday cake and the writing on it is wrong, with the party starting in an hour, so you need to explain the problem, consider the bakery's options and agree on a solution under time pressure. Along the way you practise quantities, describing food, asking about ingredients and making polite complaints that still keep the relationship friendly.",
      keywords: ["bakery", "bread", "shopping", "pre-order", "cake", "complaints"],
      whatYouGet: [
        "Everyday bakery words and quantities for bread and pastries",
        "Practice asking about sold-out items and ordering ahead",
        "A cake pick-up problem to solve politely under time pressure",
        "Phrases for describing food and asking about ingredients",
      ],
      audience: "Learners who want to shop at a local bakery confidently and handle small problems.",
      bannerBrief: "A risograph print of loaves and croissants on a bakery shelf in terracotta and teal, flour dust shown as cream grain, layers slightly offset.",
      scenarios: [
        {
          title: "A loaf and two pastries",
          description:
            "You're at Crumb & Co, a family bakery in Coburg. Buy a loaf of bread and two pastries, and ask one question about what's on the shelf.",
          difficultyLevel: "beginner",
          character: {
            name: "Thuy Tran",
            role: "baker serving at a family bakery in Coburg",
            goal: "You run Crumb & Co with your husband. You want to help the customer choose. White sourdough is $8.50, seeded rye is $9, and you can slice it for free. Croissants are $5, almond croissants $6.50, and a vanilla slice is $6. Ask if they want the bread sliced and if the pastries go in one bag. If asked, say the rye is best for toast and the sourdough was baked at 5am.",
            demeanor: "warm and patient, speaks slowly, proud of her baking",
            endCondition: "the learner has chosen a loaf and two pastries, answered the slicing question and paid",
            voice: "shimmer",
          },
          learnerRole: "customer",
          taskCard:
            "- Greet the baker and ask for a loaf of bread\n- Say if you want it sliced\n- Choose two pastries\n- Ask one question about the bread or pastries\n- Pay",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "Sold out of your favourite",
          description:
            "You've come to Hearth Bakehouse in Thornbury for their famous cardamom buns, but they're sold out. Find an alternative and see if you can order some for tomorrow.",
          difficultyLevel: "intermediate",
          character: {
            name: "Georgios Kallis",
            role: "counter staff at a popular Thornbury bakehouse",
            goal: "You work at Hearth Bakehouse. The cardamom buns ($6 each) sold out by 9am. Suggest the cinnamon scroll ($5.50) or the orange and fennel bun ($6). Tomorrow's batch is ready at 7:30am. You can hold up to six buns if the customer leaves a name and phone number, but pre-orders must be collected by 10am or they go back on the shelf. Mention it only if they ask about tomorrow.",
            demeanor: "easygoing and talkative, slightly fast, uses casual phrases",
            endCondition: "the learner has chosen something today or declined, and has either arranged a pre-order for tomorrow or decided not to",
            voice: "verse",
          },
          learnerRole: "customer",
          taskCard:
            "- Ask for the cardamom buns\n- Ask what's similar today\n- Find out when the next batch is ready\n- Arrange to collect some tomorrow, with the pick-up conditions clear",
          learnerOpens: true,
          timeLimitMinutes: 6,
        },
        {
          title: "The birthday cake is wrong",
          description:
            "You're picking up a custom cake for your daughter's party in an hour, and the name on it is spelt wrong and it's the wrong flavour. Sort out a fix with the bakery.",
          difficultyLevel: "advanced",
          character: {
            name: "Mei Zhou",
            role: "manager of a custom cake bakery in Box Hill",
            goal: "You manage Sugar Lane Cakes. The order form says chocolate with Happy Birthday Ammy, but the customer says they wanted vanilla and Amy. The $85 deposit was paid by phone, so you're unsure who made the error. You can fix the name in 15 minutes for free. Remaking the flavour takes three hours. Offer a vanilla cake from the display fridge, plain, for $60 with the name piped. Only offer a $20 refund if they stay calm and persuasive.",
            demeanor: "professional and slightly defensive at first, organised, softens when the customer is reasonable",
            endCondition: "the learner has explained the problem, heard the options and agreed on a solution and price for the cake",
            voice: "marin",
          },
          learnerRole: "customer collecting a cake",
          taskCard:
            "- Explain what's wrong with the cake\n- Say what you ordered and when\n- Ask what the bakery can do in under an hour\n- Negotiate a fair price or refund\n- Confirm when you can collect it",
          learnerOpens: true,
          timeLimitMinutes: 8,
        },
      ],
    },
    {
      slug: "market-day-shopping",
      kind: "roleplay",
      title: "Market Day Shopping",
      tagline: "Buy fruit, cheese and fish at a Melbourne market, ask for tastings and haggle a little at closing time.",
      description:
        "Melbourne's markets are noisy, friendly and full of chat, and stallholders love customers who talk back. This course is for learners who want to shop at a fresh food market using weights, prices and quick questions. In the first scenario a fruit and veg seller helps you buy in kilos and bunches and explains what's in season. In the second you're at a deli stall where they've cut the wrong amount of cheese and the price is higher than you expected, so you need to understand the weight, ask for a change and decide. In the third it's near closing time at the fish stall, prices are dropping and you want a good deal on a bigger order, so you practise polite haggling, comparing offers and walking away if it isn't right. You'll learn kilo and gram language, asking for tastings, describing quality and freshness, and the relaxed back-and-forth that makes market shopping fun.",
      keywords: ["market", "fresh food", "prices", "weights", "haggling", "shopping"],
      whatYouGet: [
        "Practice buying by the kilo, gram and bunch",
        "Questions about freshness, seasons and tastings",
        "A deli misunderstanding about weight and price to fix",
        "Polite haggling at closing time, including when to walk away",
      ],
      audience: "Learners who want to shop at fresh food markets and chat easily with stallholders.",
      bannerBrief: "A risograph print of market crates piled with lemons and greens under a striped awning, terracotta and teal overprint on cream, slightly off-register.",
      scenarios: [
        {
          title: "Fruit and veg by the kilo",
          description:
            "You're at a fruit and veg stall at Queensberry Market on a Saturday morning. Buy a few things for the week and ask what's in season.",
          difficultyLevel: "beginner",
          character: {
            name: "Tony Russo",
            role: "fruit and veg stallholder at a Melbourne market",
            goal: "You've had this stall for twenty years. You want to sell and chat. Tomatoes are $6.99 a kilo, bananas $3.50 a kilo, broccoli $2 each, and a bunch of coriander is $3. Mandarins are in season, $4 a kilo, and you offer a taste. Ask how much they want and whether they want a bag. Round the total down a little if they're friendly.",
            demeanor: "loud, cheerful and generous, calls people 'mate' or 'love', repeats prices clearly",
            endCondition: "the learner has bought at least three items with quantities and paid",
            voice: "cedar",
          },
          learnerRole: "customer",
          taskCard:
            "- Say hello and ask for at least three items\n- Use kilos, bunches or numbers for quantities\n- Ask what's in season or good today\n- Check the total and pay",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "Too much cheese at the deli",
          description:
            "You're at a deli stall in the market's food hall. You asked for some cheese and olives, but the amount and price aren't what you expected, so sort it out.",
          difficultyLevel: "intermediate",
          character: {
            name: "Fatima Haddad",
            role: "deli assistant at a busy market food hall stall",
            goal: "You work at Haddad's Deli. The customer asked for 200 grams of the aged cheddar, but you heard 500 grams and cut $27.50 worth (it's $55 a kilo). Olives are $3.20 per 100 grams. If they point out the mistake, apologise and cut a new 200 gram piece for $11. Offer a free taste of the labneh. Don't notice the error unless the customer questions the price.",
            demeanor: "efficient and friendly, slightly distracted by the queue, apologises easily",
            openingLine: "Okay, so that's the cheddar and the olives. That'll be thirty-three ninety, thanks.",
            endCondition: "the learner has questioned the price, got the right amount of cheese and paid the corrected total",
            voice: "coral",
          },
          learnerRole: "customer",
          taskCard:
            "- Check the price when you hear the total\n- Explain how much cheese you actually wanted\n- Ask for the price per kilo or per 100 grams\n- Pay the correct amount",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "Closing-time deal at the fish stall",
          description:
            "It's 1:30pm and the fish stall closes at 2pm. You want enough seafood for a dinner for eight, so negotiate a fair price without overpaying.",
          difficultyLevel: "advanced",
          character: {
            name: "Bilal Khoury",
            role: "owner of a fish stall at a Melbourne market",
            goal: "You run Khoury's Seafood and want to clear stock before close. Prawns are $38 a kilo, snapper fillets $42 a kilo, mussels $10 a kilo. Start firm. If they buy 2 kilos of prawns and 1.5 kilos of snapper, you'll take 10% off. If they push, offer free mussels instead of a bigger discount. Your lowest total for that order is $120. If they ask, say the prawns came in this morning and the snapper yesterday.",
            demeanor: "sharp, quick-talking and a bit cheeky, enjoys a bargain, respects confident customers",
            endCondition: "the learner has asked about freshness, negotiated a price and either agreed a deal or politely walked away",
            voice: "ash",
          },
          learnerRole: "customer buying for a dinner party",
          taskCard:
            "- Explain what you need and for how many people\n- Ask how fresh the seafood is\n- Ask for a better price for a bigger order\n- Accept a deal or politely decline",
          learnerOpens: true,
          timeLimitMinutes: 8,
        },
      ],
    },
    {
      slug: "riding-melbourne-trams",
      kind: "roleplay",
      title: "Riding Melbourne Trams",
      tagline: "Ask for directions, top up your myki, and handle a fare check or a diverted route without stress.",
      description:
        "Trams are the easiest way to get around Melbourne, until something unexpected happens. This course is for new arrivals, students and visitors who want to ask for help on public transport and understand the answers. In the first scenario you ask a friendly local at a tram stop which route goes where you need to go and where to get off. In the second, your route is diverted because of roadworks and you need to understand a staff member's directions, including the replacement bus and where to change. In the third, an authorised officer checks your myki and it shows you didn't touch on, so you have to explain what happened calmly, ask questions about the process and respond appropriately. You will practise route numbers, stop names, directions, transport words like touch on and zone, and how to stay calm and clear when a conversation gets formal. All places and stops are realistic but invented.",
      keywords: ["trams", "public transport", "directions", "myki", "travel", "melbourne"],
      whatYouGet: [
        "Practice asking which tram to take and where to get off",
        "Understanding diversions, replacement buses and changes",
        "A calm, clear conversation with a fare inspector",
        "Everyday transport words: touch on, top up, stop numbers, zones",
      ],
      audience: "People new to Melbourne who want to use trams and ask for help with confidence.",
      bannerBrief: "A risograph print of a green-and-gold-style tram rendered in terracotta and teal crossing a cream street, overhead wires in grainy black, layers misregistered.",
      scenarios: [
        {
          title: "Which tram goes to the museum?",
          description:
            "You're at a tram stop on Swanston Street and need to get to the Carlton Gardens. Ask a local which tram to take and where to get off.",
          difficultyLevel: "beginner",
          character: {
            name: "Kirra Watson",
            role: "local uni student waiting at a city tram stop",
            goal: "You're waiting for your tram to class. You're happy to help. Tell them to take the number 86 or 96 from the stop across the road, heading north, and get off at stop 9, about ten minutes. Remind them to touch on their myki when they get on. If asked, say a myki can be topped up at the 7-day shop on the corner. Mention the trams are free in the city zone only if asked.",
            demeanor: "relaxed, friendly and helpful, speaks clearly and checks they understood",
            endCondition: "the learner knows which tram to catch, which direction, where to get off and how to pay",
            voice: "sage",
          },
          learnerRole: "visitor asking for directions",
          taskCard:
            "- Politely get the person's attention\n- Ask which tram goes to the Carlton Gardens\n- Ask where to get off and how long it takes\n- Check how to pay for the trip",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "Route diverted, now what?",
          description:
            "Your tram to St Kilda has stopped because of roadworks and everyone is getting off. Ask the customer service staff member how to finish your trip.",
          difficultyLevel: "intermediate",
          character: {
            name: "Daniel Park",
            role: "tram customer service officer handling a diversion",
            goal: "You're helping passengers off a route 16 tram stopped at Domain Interchange for roadworks. Explain that replacement buses leave from the stop on the left, outside the park gates, every ten minutes. Passengers should take the bus to Fitzroy Street and change to a route 12 or 96 tram there. Myki fares aren't charged twice. Delays are about twenty minutes. Repeat once if asked, but you're busy.",
            demeanor: "professional and calm but brief, speaks over noise, uses transport jargon",
            openingLine: "Sorry folks, this tram's terminating here due to works. Replacement buses are running.",
            endCondition: "the learner understands where the replacement bus leaves, where to change and roughly how long it will take",
            voice: "ballad",
          },
          learnerRole: "passenger on a diverted tram",
          taskCard:
            "- Explain where you are trying to go\n- Ask where the replacement bus leaves from\n- Find out where to change and whether you pay again\n- Check how long the delay is",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "The fare check",
          description:
            "An authorised officer checks your myki and says it wasn't touched on. Explain what happened calmly and find out what your options are.",
          difficultyLevel: "advanced",
          character: {
            name: "Grace Tupou",
            role: "authorised officer doing fare checks on a tram",
            goal: "You're checking fares on a route 19 tram. The passenger's myki shows no touch-on and $1.20 balance. You must take their name and address and explain they may receive a penalty notice by mail. If they say the reader wasn't working, check: the reader by the middle door is faulty, so note it. You can't cancel anything on the spot, but say they can explain in writing when they receive the notice. Ask for ID.",
            demeanor: "formal, neutral and firm, follows procedure, not rude but doesn't joke",
            openingLine: "Good morning. Could I see your myki, please?",
            endCondition: "the learner has explained what happened, provided details and understood what happens next and how to respond",
            voice: "shimmer",
          },
          learnerRole: "passenger whose myki wasn't touched on",
          taskCard:
            "- Show your card and listen to the problem\n- Explain clearly why it wasn't touched on\n- Ask what happens next\n- Find out how you can explain or appeal later",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    {
      slug: "takeaway-and-phone-orders",
      kind: "roleplay",
      title: "Takeaway and Phone Orders",
      tagline: "Order takeaway over the counter or on the phone, give your details and fix a missing dish.",
      description:
        "Ordering takeaway sounds easy until you have to do it on the phone, spell your name, give an address and catch prices over a noisy kitchen. This course is for learners who want to order food confidently in person and by phone. In the first scenario you order at the counter of a local noodle shop, choose dishes and spice levels and find out how long it will take. In the second you phone a pizza place for pick-up, the line is noisy and they keep mishearing, so you need to repeat, spell and confirm your order and details. In the third you get home and a dish is missing and another is wrong, so you call back, explain the problem and push for a refund or redelivery when the staff member offers less. You will practise menu numbers, quantities, spice and dietary requests, spelling names and phone numbers, and calm complaints over the phone.",
      keywords: ["takeaway", "phone calls", "ordering food", "complaints", "spelling", "refunds"],
      whatYouGet: [
        "Counter and phone ordering practice with realistic menus",
        "Spelling your name and confirming your phone number clearly",
        "A noisy-line call where you must check and repeat details",
        "A missing-dish complaint with a refund or redelivery to negotiate",
      ],
      audience: "Learners who want to order takeaway by phone or at the counter without stress.",
      bannerBrief: "A risograph print of takeaway containers and chopsticks in a paper bag, terracotta and teal overprint on cream with visible grain and offset outlines.",
      scenarios: [
        {
          title: "Noodles to take away",
          description:
            "You're at Golden Lantern Noodle House in Richmond. Order two dishes to take away, choose the spice level and ask how long it'll be.",
          difficultyLevel: "beginner",
          character: {
            name: "Raj Mehta",
            role: "counter staff at a busy noodle shop in Richmond",
            goal: "You take orders at Golden Lantern. Beef pho is $17.50, chicken laksa $18.50, vegetable fried rice $14, spring rolls four for $8. Ask about spice level (mild, medium, hot) for the laksa. Ask for a name for the order. Takeaway is ready in about fifteen minutes. If asked, say there's free chilli oil and cutlery in the bag.",
            demeanor: "polite and efficient, speaks clearly, repeats the order back",
            endCondition: "the learner has ordered two dishes, chosen a spice level, given a name, paid and knows when it will be ready",
            voice: "verse",
          },
          learnerRole: "customer",
          taskCard:
            "- Order two dishes to take away\n- Choose a spice level\n- Give your name for the order\n- Ask how long it will take and pay",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "Pizza pick-up on a noisy line",
          description:
            "You're phoning Nonna's Wood Fire in Footscray to order pizzas for pick-up. The line is noisy and they keep mishearing, so make sure everything is right.",
          difficultyLevel: "intermediate",
          character: {
            name: "Linh Pham",
            role: "staff member taking phone orders at a pizza shop",
            goal: "You answer phones at Nonna's Wood Fire on a busy Friday. Large margherita is $22, large pepperoni $25, garlic bread $9. You mishear once: say medium instead of large, or pepperoni instead of the pizza they asked for. You need a name spelt out and a mobile number. Pick-up is in 35 minutes. Read the order back at the end. Card payment on pick-up.",
            demeanor: "friendly but hurried, background noise, sometimes says 'sorry, say again?'",
            openingLine: "Nonna's, hold on... yep, sorry, what can I get you?",
            endCondition: "the learner has corrected any mistakes, spelt their name, given a phone number and confirmed the order and pick-up time",
            voice: "marin",
          },
          learnerRole: "customer ordering by phone",
          taskCard:
            "- Order two pizzas and one side for pick-up\n- Correct anything the staff member gets wrong\n- Spell your name and give your phone number\n- Confirm the total and pick-up time",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "Missing dish, wrong curry",
          description:
            "Your delivery from Spice Route Kitchen has arrived without the butter chicken and with a lamb curry you didn't order. Call them and get it properly fixed.",
          difficultyLevel: "advanced",
          character: {
            name: "Wei Chen",
            role: "shift manager at a busy Indian takeaway in Preston",
            goal: "You manage Spice Route Kitchen. The order was $64 with butter chicken ($24) and a vegetable korma ($20); the driver brought lamb rogan josh instead of korma and no butter chicken. First offer a $10 voucher for next time. If pushed, offer to redeliver both dishes in 45 minutes. A refund of $44 to the card is possible only if they insist clearly. Ask for the order number and address.",
            demeanor: "polite but tries to minimise cost, a bit evasive at first, agrees when the customer is firm",
            openingLine: "Spice Route Kitchen, Wei speaking.",
            endCondition: "the learner has explained both problems, rejected or accepted the first offer and agreed a clear fix",
            voice: "cedar",
          },
          learnerRole: "customer making a complaint by phone",
          taskCard:
            "- Explain what was missing and what was wrong\n- Give your order details\n- Say what outcome you want\n- Don't accept a weak offer if it doesn't suit you\n- Confirm exactly what will happen next",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    {
      slug: "getting-a-haircut",
      kind: "roleplay",
      title: "Getting a Haircut",
      tagline: "Book an appointment, explain the cut you want and speak up when it's not quite right.",
      description:
        "Haircuts are surprisingly hard in a second language: you need to describe length, shape and style, and understand questions you've never heard before. This course is for anyone who wants to walk out of the salon happy. In the first scenario you call a local barber to book a time and ask about price. In the second you sit in the chair and explain the cut you want while the hairdresser asks lots of questions about layers, fringe, clippers and length, and suggests something different. In the third, the cut is shorter than you asked for, so you need to say so politely, discuss what can be fixed and handle a conversation about whether you should pay full price. You will learn hair vocabulary, how to describe changes with your hands and words, how to accept or decline a suggestion, and how to raise a problem without making it awkward.",
      keywords: ["haircut", "salon", "barber", "appointments", "describing", "complaints"],
      whatYouGet: [
        "Practice booking an appointment by phone",
        "Hair words: fringe, layers, trim, clippers, number two, taper",
        "Saying yes or no to a hairdresser's suggestion",
        "A polite, clear conversation when the cut isn't what you asked for",
      ],
      audience: "Learners who want to book and get a haircut they're happy with.",
      bannerBrief: "A risograph print of scissors, comb and a barber pole in terracotta and teal on cream, halftone mirror reflections, layers slightly off.",
      scenarios: [
        {
          title: "Booking a time at the barber",
          description:
            "You're calling Sharp Corner Barbers in Brunswick East to book a haircut this week. Find a time that suits you and check the price.",
          difficultyLevel: "beginner",
          character: {
            name: "Elena Costa",
            role: "receptionist at a neighbourhood barber shop",
            goal: "You take bookings at Sharp Corner Barbers. A standard cut is $40, a skin fade $45, beard trim $20. Free times: Thursday at 11am or 4:30pm, Saturday at 9am. Ask which service they want, which barber (Sam or Nick, either is fine) and a name and mobile number. Say walk-ins are welcome but there can be a wait. Remind them you take card only.",
            demeanor: "bright and friendly, speaks clearly, a little chatty",
            openingLine: "Sharp Corner Barbers, Elena speaking, how can I help?",
            endCondition: "the learner has booked a day and time, chosen a service and given a name and number",
            voice: "coral",
          },
          learnerRole: "customer booking by phone",
          taskCard:
            "- Say you'd like to book a haircut\n- Ask about price\n- Choose a day and time that suits you\n- Give your name and phone number",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "Explaining the cut you want",
          description:
            "You're in the chair at Fern Street Hair in Carlton North. Explain the haircut you want and decide whether to take the hairdresser's suggestion.",
          difficultyLevel: "intermediate",
          character: {
            name: "Joon-ho Kim",
            role: "hairdresser at a stylish Carlton North salon",
            goal: "You're a senior stylist at Fern Street Hair. You want to understand exactly what the client wants: how much off, the fringe, layers, clippers or scissors, and how they style it. Ask lots of questions. Suggest a shorter textured cut because their hair is thick and Melbourne is getting warm, but accept it if they say no. The cut costs $65. If asked, recommend a sea salt spray for $28, no pressure.",
            demeanor: "thoughtful and creative, asks many questions, uses hairdressing words, relaxed tone",
            openingLine: "So, what are we doing today?",
            endCondition: "the learner has described the cut clearly and accepted or declined the suggestion so the stylist can start",
            voice: "ash",
          },
          learnerRole: "client at a hair salon",
          taskCard:
            "- Describe how you want your hair cut\n- Answer the stylist's questions about length and style\n- Accept or decline the suggestion politely\n- Confirm the plan before the stylist starts",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "That's a bit shorter than I asked for",
          description:
            "Your haircut is finished and it's much shorter than you wanted. Say so politely, talk about what can be done and discuss the price.",
          difficultyLevel: "advanced",
          character: {
            name: "Bec Sullivan",
            role: "owner and stylist at a busy Northcote hair studio",
            goal: "You own Studio Nine. You cut the client's hair to about two centimetres, but they asked for five. At first you say it's what they asked for, and that it will grow back in a few weeks. If they explain calmly and clearly, admit you may have misunderstood. Offer a free tidy-up next month and a styling product. Only give 50% off today's $70 if they ask politely and directly. You won't give a full refund.",
            demeanor: "confident and a little defensive, talks quickly, becomes apologetic if the client stays calm",
            openingLine: "There we go! What do you reckon?",
            endCondition: "the learner has said clearly the cut is too short, discussed options and agreed what they'll pay and any follow-up",
            voice: "sage",
          },
          learnerRole: "client unhappy with a haircut",
          taskCard:
            "- Say politely that the cut is shorter than you asked for\n- Explain what you originally wanted\n- Ask what can be done now or later\n- Discuss the price and agree on a fair outcome",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    {
      slug: "small-talk-with-locals",
      kind: "roleplay",
      title: "Small Talk with Locals",
      tagline: "Chat with neighbours about the weather, footy and weekend plans, and say no nicely.",
      description:
        "Small talk is how Melburnians connect: four seasons in one day, the footy, the new cafe on the corner, what you did on the weekend. This course is for learners who understand English but feel stuck in casual chat. In the first scenario you meet a friendly neighbour in the street and practise greeting, introducing yourself and talking about the weather. In the second, a neighbour at a street barbecue asks lots of questions, uses slang and footy talk, and you need to keep the conversation going, ask questions back and explain things about yourself. In the third, a neighbour asks you a favour you don't want to do, minding their dog for a week, and keeps pushing, so you need to decline kindly, offer an alternative and keep the relationship warm. You will practise Aussie expressions, follow-up questions, showing interest and polite refusals that don't feel rude.",
      keywords: ["small talk", "neighbours", "slang", "conversation", "saying no", "melbourne"],
      whatYouGet: [
        "Easy openers about the weather, the suburb and the weekend",
        "Practice with Aussie slang and footy talk at a street barbecue",
        "Follow-up questions that keep a chat going",
        "A kind but clear way to decline a favour",
      ],
      audience: "Learners who want to feel relaxed chatting with neighbours and locals.",
      bannerBrief: "A risograph print of two neighbours chatting over a front fence with a lemon tree, terracotta and teal overprint on cream, grainy and offset.",
      scenarios: [
        {
          title: "Hello from next door",
          description:
            "You've just moved into a unit in Pascoe Vale and your neighbour says hello while you're getting the mail. Introduce yourself and chat for a few minutes.",
          difficultyLevel: "beginner",
          character: {
            name: "Margaret Doyle",
            role: "retired neighbour who has lived on the street for forty years",
            goal: "You're a friendly retired teacher who lives next door. You want to welcome the new neighbour. Ask their name, where they've moved from and what they do. Talk about the crazy Melbourne weather, sunny this morning, rain this afternoon. Tell them bin night is Tuesday, recycling every second week. Mention the bakery on the corner is good. Invite them to knock if they ever need anything.",
            demeanor: "warm, chatty and slow-paced, laughs easily, asks lots of gentle questions",
            openingLine: "Oh hello! You must be the new one in number three. I'm Margaret.",
            endCondition: "the learner has introduced themselves, answered a few questions, asked one back and said goodbye",
            voice: "shimmer",
          },
          learnerRole: "new neighbour",
          taskCard:
            "- Greet your neighbour and introduce yourself\n- Say a little about where you're from\n- Ask her at least one question\n- Say goodbye in a friendly way",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "Footy talk at the street barbecue",
          description:
            "You're at your street's end-of-year barbecue. A chatty neighbour starts talking footy and using slang, so keep up, ask questions and share a bit about yourself.",
          difficultyLevel: "intermediate",
          character: {
            name: "Sione Fifita",
            role: "chatty neighbour at a street barbecue",
            goal: "You live three doors down and love footy. You go for an invented club, the Westgate Wolves. Use some slang: arvo, barbie, snag, footy, reckon, heaps good. Ask the learner if they follow any sport, what they think of Melbourne, and what they do on weekends. If they don't understand slang, explain it happily. Invite them to the local park footy kick on Sunday arvo, no pressure.",
            demeanor: "big laugh, very friendly, talks a lot, uses slang, interrupts a little",
            openingLine: "G'day! Grab a snag, there's heaps. You a footy person?",
            endCondition: "the learner has kept the chat going, asked about at least one slang word or topic and responded to the invitation",
            voice: "ballad",
          },
          learnerRole: "neighbour at a street barbecue",
          taskCard:
            "- Answer the footy question honestly\n- Ask what a slang word means\n- Ask at least two questions back\n- Respond to the invitation",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "Can you mind my dog for a week?",
          description:
            "A neighbour you like asks you to look after her dog while she's away. You can't, so say no kindly and keep things friendly.",
          difficultyLevel: "advanced",
          character: {
            name: "Anjali Iyer",
            role: "neighbour about to go away for a family wedding",
            goal: "You live across the road and fly out on Friday for your cousin's wedding. Your kennel booking fell through. You want the learner to mind your dog Biscuit for seven days: two walks and two meals a day. You'll offer $150. When they decline, push twice: it's only a week, Biscuit loves them. Accept an alternative if they offer one, like checking your mail or asking another neighbour. Stay friendly.",
            demeanor: "warm but stressed and persuasive, talks fast, gets a bit disappointed",
            openingLine: "Hey, I'm so glad I caught you. I've got a huge favour to ask.",
            endCondition: "the learner has clearly declined, given a reason or alternative, and the conversation has ended on good terms",
            voice: "marin",
          },
          learnerRole: "neighbour asked for a favour",
          taskCard:
            "- Listen to the favour\n- Say no clearly but kindly\n- Stay firm if she pushes\n- Offer a small alternative and keep things friendly",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    {
      slug: "dinner-out-bookings-and-bills",
      kind: "roleplay",
      title: "Dinner Out: Bookings and Bills",
      tagline: "Book a table, ask about the menu and handle a late-night booking mix-up with grace.",
      description:
        "Going out for dinner in Melbourne usually starts with a booking, and that means phone calls, times, numbers and sometimes a mix-up at the door. This course is for learners who want to make and manage restaurant bookings in clear, polite English. In the first scenario you phone a local trattoria to book a table and ask about the menu. In the second you need to change your booking to more people at a different time, and the restaurant has limited options, so you need to understand them and choose. In the third you arrive for a birthday dinner and the restaurant has no record of your booking, the place is full, and you need to stay calm, give details and negotiate the best possible outcome for your group. You will practise days, times and numbers, special requests, confirming details, and polite pressure when something goes wrong.",
      keywords: ["restaurants", "bookings", "phone calls", "changing plans", "problems", "dinner"],
      whatYouGet: [
        "Practice booking a table and asking about the menu by phone",
        "Changing a booking when the restaurant has limited times",
        "A lost-booking problem at the door to sort out calmly",
        "Clear phrases for days, times, numbers and special requests",
      ],
      audience: "Learners who want to book and enjoy dinners out without booking stress.",
      bannerBrief: "A risograph print of a candlelit restaurant table and a booking book in terracotta and teal on cream, grainy halftone glow, slightly misregistered.",
      scenarios: [
        {
          title: "A table for Friday night",
          description:
            "You're calling Trattoria Bella in Carlton to book dinner for four on Friday. Book the table and ask one question about the menu.",
          difficultyLevel: "beginner",
          character: {
            name: "Luca Ferraro",
            role: "host taking bookings at a family trattoria in Carlton",
            goal: "You take bookings at Trattoria Bella. On Friday you have tables for four at 6pm or 8:15pm; 7pm is full. Ask for a name and mobile number. Tables are kept for 15 minutes. If asked, say most pastas are $28 to $34, there's a vegetarian lasagne, and gluten-free pasta is $4 extra. BYO wine is fine with $10 corkage per bottle.",
            demeanor: "charming and warm, speaks clearly, a little old-fashioned",
            openingLine: "Buonasera, Trattoria Bella, Luca speaking.",
            endCondition: "the learner has booked a time, given a name and number and asked one question about the menu",
            voice: "verse",
          },
          learnerRole: "customer booking by phone",
          taskCard:
            "- Ask to book a table for four on Friday\n- Choose a time from the options\n- Give your name and phone number\n- Ask one question about the menu or drinks",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "Changing the booking to eight people",
          description:
            "Your Saturday booking at Seoul Garden in the CBD was for four, but now eight people are coming. Call to change it and work with the options they have.",
          difficultyLevel: "intermediate",
          character: {
            name: "Ji-woo Lee",
            role: "front of house manager at a Korean barbecue restaurant",
            goal: "You manage bookings at Seoul Garden. The booking is for four at 7pm Saturday. A table for eight is only free at 5:30pm, or at 8:45pm on the upstairs bench seating. Groups of eight or more must take the $55 per person set menu and pay a $100 deposit by card over the phone. You can't split the group across two tables at 7pm. Explain clearly and let them choose.",
            demeanor: "organised and polite, quick and businesslike, patient with questions",
            openingLine: "Seoul Garden, Ji-woo speaking, how can I help?",
            endCondition: "the learner has understood the options, chosen a new time or kept the old booking, and confirmed the details",
            voice: "coral",
          },
          learnerRole: "customer changing a booking",
          taskCard:
            "- Give your booking details and explain the change\n- Ask about times for a bigger group\n- Understand the set menu and deposit rules\n- Choose an option and confirm everything",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "We have no booking under that name",
          description:
            "You've arrived with five friends for a birthday dinner at Ember & Salt, but they can't find your booking and the restaurant is full. Sort it out.",
          difficultyLevel: "advanced",
          character: {
            name: "Nikos Andreou",
            role: "maître d' at a busy grill restaurant in South Yarra",
            goal: "You run the floor at Ember & Salt on a packed Saturday. You can't find a booking for six at 7:30pm. At first suggest they may have booked somewhere else. If they show a confirmation text or give the date they booked, find it under a misspelt name, for 7:30pm next Saturday. You can offer the bar for six now with a limited menu, a proper table at 9pm, or a free dessert platter. Don't offer anything else.",
            demeanor: "smooth, polite but under pressure, firm about the full room, warms up if the guest stays calm",
            openingLine: "Good evening, welcome. Name for the booking?",
            endCondition: "the learner has given booking details, the mistake has been found and the group has accepted an option or decided to leave",
            voice: "cedar",
          },
          learnerRole: "customer arriving for a birthday booking",
          taskCard:
            "- Give your name and booking details\n- Stay calm and offer proof of the booking\n- Ask what they can do for your group tonight\n- Negotiate the best option and decide",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    {
      slug: "asking-for-help-around-town",
      kind: "roleplay",
      title: "Asking for Help Around Town",
      tagline: "Ask for directions, find what you need in a shop and get help when something goes wrong.",
      description:
        "Life in a new city means asking for help all the time, from finding a street to finding the right aisle. This course is for learners who want to ask questions in shops and on the street and understand the answers, even when the help isn't quite what they need. In the first scenario you ask a local for walking directions in the city and check landmarks. In the second you're in a hardware store looking for something you don't know the English word for, so you describe it, answer questions and compare options. In the third, you've left your bag on a tram and need help from a staff member at a busy station, who is short on time, so you give clear details, ask what to do next and make sure you leave with a plan. You will practise directions, describing objects, giving detailed descriptions and asking good follow-up questions.",
      keywords: ["directions", "shopping", "describing things", "lost property", "getting help", "city"],
      whatYouGet: [
        "Asking for and checking walking directions with landmarks",
        "Describing something when you don't know its name",
        "Reporting lost property with clear details",
        "Follow-up questions to leave every conversation with a plan",
      ],
      audience: "Learners who want to ask for help around Melbourne and understand the answers.",
      bannerBrief: "A risograph print of a city laneway with a street sign and a pointing hand, terracotta and teal overprint on cream, grainy with slightly shifted layers.",
      scenarios: [
        {
          title: "How do I get to the library?",
          description:
            "You're on Flinders Street near the station and need to walk to the State Library. Ask a local for directions and check you've understood.",
          difficultyLevel: "beginner",
          character: {
            name: "Rosa Mendoza",
            role: "office worker on her lunch break in the city",
            goal: "You're walking to get lunch and happy to help. The library is about fifteen minutes' walk. Tell them to walk straight up Swanston Street, past the town hall, until they see a big lawn and a domed building on the right. It's on the corner of La Trobe Street. If asked, say the free city trams also go up Swanston Street and it's about three stops.",
            demeanor: "kind and clear, uses simple landmarks, points a lot, checks they're okay",
            endCondition: "the learner knows the route and landmarks, has checked their understanding and thanked her",
            voice: "sage",
          },
          learnerRole: "visitor asking for directions",
          taskCard:
            "- Politely stop someone and ask for directions\n- Ask how long it takes to walk\n- Repeat the directions back to check\n- Say thank you",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "I need the thing that... you know",
          description:
            "You're at Handyman Hardware in Moonee Ponds looking for something to stop your door slamming, but you don't know what it's called. Describe it and choose one.",
          difficultyLevel: "intermediate",
          character: {
            name: "Jarrah Thomas",
            role: "floor staff at a big suburban hardware store",
            goal: "You work in aisle 12 at Handyman Hardware. The customer needs a door stopper but may not know the word. Ask questions: does the door slam from wind or hit the wall? Is the floor wood or tiles? Options: a rubber wedge ($6), a wall-mounted spring stop ($9, needs a screwdriver), or a magnetic door holder ($24, holds it open). Recommend based on their answers.",
            demeanor: "laid-back and helpful, patient with descriptions, a bit of dry humour",
            endCondition: "the learner has described the problem, understood the options and chosen one",
            voice: "ash",
          },
          learnerRole: "customer in a hardware store",
          taskCard:
            "- Describe what you need without knowing its name\n- Answer questions about your door and floor\n- Compare the options and prices\n- Choose one and ask where to find it",
          learnerOpens: true,
          timeLimitMinutes: 6,
        },
        {
          title: "I left my bag on the tram",
          description:
            "You've just left your backpack on a tram and you're at a busy city station. Get help from a staff member who's in a hurry and leave with a clear plan.",
          difficultyLevel: "advanced",
          character: {
            name: "Charlotte Hughes",
            role: "station customer service staff member at a busy city station",
            goal: "You're at the information desk at peak hour with a queue. You want clear details fast: route number, direction, time, where they sat and what the bag looks like and contains. You can't stop the tram. You'll radio the depot only if the details are clear. Explain lost property goes to the central lost property office, open 8:30am to 4:30pm weekdays, and items usually arrive in 48 hours. Give a reference number, LP-4471.",
            demeanor: "brisk and efficient, a little impatient with vague answers, helpful when details are clear",
            openingLine: "Next, please. What can I do for you?",
            endCondition: "the learner has described the trip and the bag clearly, understood what happens next and has a reference number",
            voice: "shimmer",
          },
          learnerRole: "passenger who lost a bag",
          taskCard:
            "- Explain quickly what happened\n- Give the tram route, time and direction\n- Describe your bag and what's inside\n- Ask what happens next and get a reference number",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
  ],
};
