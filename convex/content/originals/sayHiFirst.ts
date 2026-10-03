import type { OriginalCreator } from "./types";

export const sayHiFirst: OriginalCreator = {
  handle: "say-hi-first",
  displayName: "Say Hi First",
  tagline: "Friendly, low-stakes practice for the conversations that make your palms sweat: saying hi, asking, declining and connecting.",
  bio: "Say Hi First is a XINGO Original studio for anyone who rehearses a conversation in the shower and then freezes when it counts. We build warm, realistic role-plays set around Sydney and beyond: chatting to a stranger in a bookshop, asking for a number without making it weird, saying no to a favour, turning a work friend into a real friend, and walking into an interview or a networking night with something to say. Our characters are kind but real. Sometimes they're busy, sometimes they say no, and you practise handling that with grace. Everything is built on respect and consent, never tricks or scripts. Say hi, listen well, and let people choose.",
  location: "Sydney, NSW",
  accent: "#E11D48",
  visualStyle:
    "Y2K glossy sticker art: shiny, bubbly die-cut stickers with chrome highlights and soft drop shadows in rose pink and lilac, scattered with playful four-point sparkles on a clean white background.",
  logoBrief: "A glossy rose-pink speech-bubble sticker reading \"hi!\" in chunky bubble letters, with a chrome rim and two lilac sparkles.",
  avatarBrief: "A round, shiny sticker of a waving hand in rose pink with a chrome highlight on a lilac circle, finished with tiny sparkles.",
  courses: [
    // 1. Meet-cutes
    {
      slug: "meet-cutes-start-a-conversation",
      kind: "roleplay",
      title: "Rizz Practice: Your Meet-Cute Starts Here",
      tagline: "Say hi in a bookshop, a dog park or a gym, keep it light, and know when to let the moment go.",
      description:
        "This course is for anyone who sees someone interesting in everyday life and wishes they knew how to start a friendly conversation without it feeling forced. You practise opening with something you share in the moment, asking easy follow-up questions, reading whether the other person wants to keep talking, and wrapping up warmly either way. The goal is a pleasant exchange, not a result. In the beginner scenario you chat with a relaxed browser in a bookshop who is happy to talk about novels. In the intermediate scenario you meet a dog owner at a park whose puppy keeps interrupting, so you have to stay easygoing and follow the flow. In the advanced scenario you approach someone at the gym who is mid-workout and wearing headphones; they are polite but short on time, and you practise reading the signals, keeping it brief and stepping back gracefully. By the end you have reliable openers, natural follow-ups and the confidence to say hi first without needing it to go anywhere.",
      keywords: ["small talk", "starting a conversation", "meeting people", "confidence", "social skills", "reading cues"],
      whatYouGet: [
        "Openers based on what's happening around you, not rehearsed lines",
        "Follow-up questions that keep a chat flowing naturally",
        "Practice reading interest and noticing when someone is busy",
        "Warm ways to wrap up a conversation, whatever happens",
      ],
      audience: "Adults who want to feel comfortable starting friendly conversations with strangers in everyday places.",
      bannerBrief: "Three glossy stickers of a stack of books, a happy dog with a ball and a dumbbell, linked by rose-pink speech bubbles and lilac sparkles.",
      scenarios: [
        {
          title: "The poetry shelf at Chapter & Verse Books",
          description:
            "You're browsing the poetry shelf at a small bookshop in Newtown, and the person beside you has just picked up a book you loved. Start a friendly chat about it.",
          difficultyLevel: "beginner",
          character: {
            name: "Priya Raman",
            role: "regular customer browsing at Chapter & Verse Books in Newtown",
            goal:
              "You're on a slow Saturday browse and happy to chat. You're holding \"Salt Water Hours\", a poetry collection, and wondering if it's worth $29.95. You love talking about books and will ask the learner what they're reading lately and whether they recommend anything. If asked, you mention you're a primary school teacher and that you come here most weekends. Keep it friendly and light; if the learner is warm, you're glad to keep talking a little longer.",
            demeanor: "relaxed, warm and chatty, speaks slowly, laughs easily",
            endCondition: "the learner has started the chat, swapped at least one book recommendation and wrapped up warmly",
            voice: "coral",
          },
          learnerRole: "fellow book lover browsing the shop",
          taskCard:
            "- Open with a comment or question about the book they're holding\n- Share a book you've enjoyed and ask what they like to read\n- Ask at least one follow-up question about their answer\n- Wrap up warmly, e.g. \"Enjoy the book!\"",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "A runaway puppy at Camperdown dog park",
          description:
            "You're at the dog park and a playful puppy has just stolen your tennis ball. Chat with the owner, keep it easygoing while the puppy keeps interrupting, and see where the conversation goes.",
          difficultyLevel: "intermediate",
          character: {
            name: "Tom Gallagher",
            role: "dog owner at Camperdown Memorial Rest Park",
            goal:
              "You're here with Biscuit, your five-month-old kelpie cross, who has just grabbed the learner's tennis ball. You apologise and are happy to chat, but Biscuit keeps distracting you, so you break off mid-sentence now and then (\"Biscuit, drop it!\"). You'll talk about puppy training, the best local walks and the weekly puppy meet-up on Sunday at 8am. If asked, you reveal you moved from Ballarat six months ago and don't know many people yet. Respond well to a relaxed, patient approach.",
            demeanor: "friendly, a bit flustered, easily distracted by his dog, self-deprecating humour",
            openingLine: "Oh no, sorry! Biscuit, give it back! Mate, I'm so sorry, she's got your ball.",
            endCondition: "the learner has chatted easily despite the interruptions, found something in common and said a friendly goodbye",
            voice: "cedar",
          },
          learnerRole: "regular at the dog park",
          taskCard:
            "- Put the owner at ease about the stolen ball\n- Find something you have in common (dogs, the area, weekends)\n- Pick the conversation back up after each interruption\n- End on a friendly note, maybe mentioning you might see them around",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "Between sets at the gym",
          description:
            "You're at your local gym and want to say hi to someone you often see there. They're mid-workout with headphones on, so you'll need to read the room, keep it brief and respect their time.",
          difficultyLevel: "advanced",
          character: {
            name: "Mei Zhou",
            role: "regular gym-goer mid-workout at Fit Lane Gym, Parramatta",
            goal:
              "You're halfway through a timed leg session and have about 90 seconds of rest between sets. You take one headphone out and are polite, but short. If the learner keeps it brief and respectful, you warm up slightly and mention you're training for a 10 km fun run in March. If they keep you talking past your rest, say clearly but kindly that you need to get back to it. If they ask to chat later, you say maybe, you're usually here at 6am. Never feel obliged to say more.",
            demeanor: "polite, focused, brief answers, slightly guarded at first, never rude",
            endCondition: "the learner has said hi, noticed the cues, kept it short and stepped back gracefully, or the rest break is over",
            voice: "sage",
          },
          learnerRole: "fellow regular at the gym",
          taskCard:
            "- Get their attention politely and check it's an OK moment\n- Say hi with a short, relevant comment or question\n- Notice signals that they're busy and keep it brief\n- Step back gracefully and let them get back to their workout",
          learnerOpens: true,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 2. Asking for a number
    {
      slug: "asking-for-a-number-respectfully",
      kind: "roleplay",
      title: "Shoot Your Shot: Ask for Their Number (No Cringe)",
      tagline: "Ask clearly, make it easy to say no, and accept a yes, a maybe or a no with grace.",
      description:
        "This course is for adults who have hit it off with someone and want to see them again, but freeze when it's time to ask. You practise asking in a clear, low-pressure way that gives the other person an easy out, then responding well to whatever they say. A yes is great, a maybe is fine, and a no is a complete answer. In the beginner scenario you've had a fun chat at a pottery class and the other person happily says yes. In the intermediate scenario the person isn't sure and suggests seeing how things go at next week's class, so you practise accepting a maybe without pushing. In the advanced scenario you ask someone at your climbing gym, and they kindly say no; you'll still see them every week, so you practise accepting the answer gracefully, keeping things friendly and making sure there's no awkwardness. You'll leave with simple, respectful ways to ask and the calm to hear any answer.",
      keywords: ["asking someone out", "dating", "consent", "respect", "confidence", "handling rejection"],
      whatYouGet: [
        "Clear, low-pressure ways to ask for a number or to catch up",
        "Phrases that make it easy for the other person to say no",
        "Practice accepting yes, maybe and no gracefully",
        "Ways to keep things friendly after a no",
      ],
      audience: "Adults who want to ask someone for their number or a catch-up in a respectful, confident way.",
      bannerBrief: "A glossy rose-pink phone sticker with a heart-shaped speech bubble and a lilac \"yes / no / maybe\" sticker trio, surrounded by sparkles.",
      scenarios: [
        {
          title: "After pottery class at Clay Days Studio",
          description:
            "You're packing up after a Thursday night pottery class where you and a classmate laughed all evening. Ask if they'd like to swap numbers and grab a drink sometime.",
          difficultyLevel: "beginner",
          character: {
            name: "Daniel Nguyen",
            role: "classmate at a Thursday night pottery class",
            goal:
              "You've enjoyed chatting with the learner all night, especially when both your bowls collapsed on the wheel. You're interested in seeing them again and will say yes if asked clearly. You suggest the wine bar on King Street or a coffee on Saturday. If asked, you share that you work in IT support and started pottery to get off screens. Respond warmly; if the learner seems nervous, help them out with a smile and an easy reply.",
            demeanor: "warm, easygoing, a little shy himself, responds kindly",
            endCondition: "the learner has asked clearly, you've agreed and swapped numbers, and you've loosely suggested when to catch up",
            voice: "ash",
          },
          learnerRole: "pottery classmate",
          taskCard:
            "- Mention something fun from the class to ease in\n- Ask clearly if they'd like to swap numbers or get a drink sometime\n- Suggest a simple, low-key plan\n- Say goodbye warmly",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "A maybe at the community garden",
          description:
            "You're at the Saturday working bee at a community garden and have been chatting with someone for weeks. When you ask for their number, they're not sure yet, and you need to accept that without pushing.",
          difficultyLevel: "intermediate",
          character: {
            name: "Sofia Russo",
            role: "fellow volunteer at Marrickville Community Garden",
            goal:
              "You like the learner and enjoy your chats about tomatoes and compost, but you only got out of a long relationship four months ago and aren't sure you're ready. When asked for your number, you hesitate and say you'd prefer to keep things as they are for now and see each other at the working bee next Saturday at 9am. If the learner accepts gracefully, you're relieved and friendly. If they push or ask why repeatedly, you become quieter and firmer. Only reveal the breakup if they ask gently.",
            demeanor: "kind, a bit hesitant, honest, gets quieter if pressured",
            endCondition: "the learner has asked, heard your maybe, accepted it without pressure and kept the conversation friendly",
            voice: "shimmer",
          },
          learnerRole: "community garden volunteer",
          taskCard:
            "- Ask for their number in a clear, relaxed way\n- Listen to their answer and accept it without pressure\n- Reassure them it's no problem\n- Keep chatting about something else so it doesn't feel awkward",
          learnerOpens: true,
          timeLimitMinutes: 6,
        },
        {
          title: "A kind no at the climbing gym",
          description:
            "You're at your weekly bouldering session and finally ask a fellow climber if they'd like to get dinner. They say no kindly, and since you'll see them every week, you need to accept it and keep things comfortable.",
          difficultyLevel: "advanced",
          character: {
            name: "Kirra Walker",
            role: "regular climber at Boulder Box, Alexandria",
            goal:
              "You've climbed alongside the learner every Tuesday for months and like them as a climbing buddy, but you're not interested in dating them. When asked out, say no kindly and clearly: \"That's really sweet, but I'm not looking for that.\" If they accept gracefully, you're relieved and happily keep chatting about the new purple route on the overhang wall. If they ask \"why not?\" or try again, stay calm and repeat your answer, a little more firmly. You only mention you're seeing someone if asked respectfully.",
            demeanor: "friendly, direct, calm, not apologetic for her answer",
            endCondition: "the learner has accepted your no without pressure and moved the chat back to a friendly, normal topic",
            voice: "marin",
          },
          learnerRole: "regular climber at the gym",
          taskCard:
            "- Ask them out clearly and give them an easy way to say no\n- Accept their answer without asking why or trying again\n- Thank them for being honest and reassure them it's fine\n- Steer back to a normal topic, like climbing, so things stay comfortable",
          learnerOpens: true,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 3. Saying no
    {
      slug: "saying-no-politely",
      kind: "roleplay",
      title: "The Art of the Nice \"No\"",
      tagline: "Decline an invitation, a favour or a date clearly and kindly, without over-explaining or giving in.",
      description:
        "This course is for people who say yes when they mean no, then regret it. You practise turning down invitations, favours and being asked out in a way that is clear, kind and short, and holding your answer when someone pushes. You'll learn to thank the person, give a simple reason only if you want to, and offer an alternative only when you genuinely mean it. In the beginner scenario a friendly colleague invites you to Friday drinks and takes your no in their stride. In the intermediate scenario a friend asks you to help them move house and borrow your car, and gently pushes when you decline, so you practise staying firm while offering something smaller you're happy to do. In the advanced scenario a nice acquaintance asks you out, and when you say no they suggest \"maybe another time\", so you practise being clear rather than leaving false hope. You'll finish with calm, ready-to-use phrases for saying no without guilt.",
      keywords: ["saying no", "declining", "boundaries", "assertiveness", "politeness", "confidence"],
      whatYouGet: [
        "Short, kind ways to decline invitations, favours and dates",
        "Practice holding your answer when someone pushes back",
        "How to offer an alternative only when you mean it",
        "Confidence to be clear instead of vague",
      ],
      audience: "Adults who find it hard to say no and want to decline clearly while staying kind.",
      bannerBrief: "A glossy lilac \"no thanks\" speech-bubble sticker beside a rose-pink hand making a gentle stop gesture, with chrome highlights and sparkles.",
      scenarios: [
        {
          title: "Friday drinks at the office",
          description:
            "You're packing up on Friday afternoon when a colleague invites you to after-work drinks. You'd rather go home tonight, so decline politely and keep things friendly.",
          difficultyLevel: "beginner",
          character: {
            name: "Ben Carter",
            role: "friendly colleague at Harbourline Insurance",
            goal:
              "You're organising after-work drinks at The Anchor Hotel around the corner from 5:30pm. You invite the learner warmly. If they say no, you accept easily (\"No worries at all!\") and might ask if they've got plans for the weekend. If they give a reason, you don't question it. You mention there's a team lunch next Thursday too, in case they'd prefer that. Keep it relaxed and positive.",
            demeanor: "cheerful, easygoing, upbeat, never pushy",
            openingLine: "Hey! A few of us are heading to The Anchor at half five for a drink. You keen?",
            endCondition: "the learner has declined clearly and kindly, and you've both ended on a friendly note",
            voice: "ballad",
          },
          learnerRole: "office colleague",
          taskCard:
            "- Thank them for the invitation\n- Say no clearly and briefly\n- Give a short reason only if you want to\n- Keep it friendly, e.g. wish them a good night",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "The moving-house favour",
          description:
            "You're on the phone with a good friend who asks you to spend Saturday helping them move house and lend them your car. You can't do the whole day, so decline the big ask and offer only what you're truly happy to give.",
          difficultyLevel: "intermediate",
          character: {
            name: "Leilani Fonoti",
            role: "close friend moving from Blacktown to Penrith",
            goal:
              "You're moving this Saturday and need help from 7am until late, plus you want to borrow the learner's car because the van hire is $180. When they decline, you push gently: \"Are you sure? It'd really help.\" and \"Just the car then?\" If they hold firm and offer something smaller, like helping for an hour on Sunday or dropping off dinner, you accept gratefully. If asked, you admit you left it late and feel stressed. You're not angry, just a bit disappointed at first.",
            demeanor: "warm, stressed, talks fast, a little guilt-trippy at first but fair",
            openingLine: "Hey, so huge favour. Any chance you could help me move on Saturday? And could I borrow your car?",
            endCondition: "the learner has declined the full-day help and the car clearly, held firm when you pushed, and you've agreed on any smaller help they offered",
            voice: "coral",
          },
          learnerRole: "close friend",
          taskCard:
            "- Show you care about their move\n- Say no to the full day and lending your car\n- Hold your answer politely when they push\n- Offer a smaller kind of help only if you genuinely want to",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "Being asked out after book club",
          description:
            "You're leaving your monthly book club when a nice member asks you out to dinner. You're not interested, and you need to say no clearly, kindly and without leaving false hope.",
          difficultyLevel: "advanced",
          character: {
            name: "Rafael Santos",
            role: "member of the Glebe Library monthly book club",
            goal:
              "You like the learner and ask them to dinner at a new Filipino-Spanish place called Casa Isla this Friday. If they say no vaguely, you suggest \"maybe another time then?\" or \"what about just a coffee?\" If they say no clearly, you accept it, though you're a little embarrassed, and say you hope book club won't be weird. If asked, you say you'd rather stay friends than lose the club. You never get angry and you respect a clear answer immediately.",
            demeanor: "gentle, hopeful, slightly nervous, respectful once the answer is clear",
            openingLine: "Hey, before you go, I was wondering if you'd like to get dinner with me this Friday?",
            endCondition: "the learner has said no clearly, not left false hope, and reassured you things will be fine at book club",
            voice: "verse",
          },
          learnerRole: "book club member",
          taskCard:
            "- Thank them for asking\n- Say no clearly, without \"maybe\" or \"another time\"\n- Hold your answer kindly if they suggest a smaller plan\n- Reassure them you'd like book club to stay comfortable",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 4. Making friends
    {
      slug: "making-friends-as-an-adult",
      kind: "roleplay",
      title: "Making Friends After 25 Is Hard. Let's Practise",
      tagline: "Turn a friendly face into an actual friend, and find your way into a new group.",
      description:
        "This course is for adults who have plenty of acquaintances but not many friends, or who are new to a city and starting from scratch. You practise moving from small talk to a real plan, suggesting simple ways to hang out, and joining a group that already knows each other. In the beginner scenario a friendly colleague you chat with in the kitchen is open to lunch, so you practise making the first suggestion. In the intermediate scenario your neighbour is keen but has a new baby and very little free time, so you practise suggesting something low-key that fits their life. In the advanced scenario you show up to a bushwalking club where everyone already knows each other and the organiser is busy, so you practise introducing yourself, asking good questions and finding a way in without waiting to be invited. You'll leave with easy invitations, follow-up habits and the confidence to take the first step.",
      keywords: ["making friends", "friendship", "social life", "new to the city", "invitations", "joining a group"],
      whatYouGet: [
        "Simple ways to suggest a first catch-up",
        "Practice adapting plans to someone's busy life",
        "Confident introductions when joining an established group",
        "Habits for following up so friendships grow",
      ],
      audience: "Adults who want to turn acquaintances into friends or build a social circle in a new place.",
      bannerBrief: "Two glossy rose-pink coffee-cup stickers clinking beside a lilac hiking-boot sticker, with chrome shine and scattered sparkles.",
      scenarios: [
        {
          title: "From the office kitchen to lunch",
          description:
            "You're making a coffee in the office kitchen with a colleague you always chat with. Suggest grabbing lunch together this week.",
          difficultyLevel: "beginner",
          character: {
            name: "Grace Kim",
            role: "colleague in the marketing team at Southbank Health Fund",
            goal:
              "You always enjoy your kitchen chats with the learner and would happily get lunch. You love the dumpling place on Flinders Lane called Golden Steam, where lunch is about $16. You suggest Wednesday or Thursday at 12:30pm. If asked, you share that you've only been in Melbourne a year and are still finding your feet socially, so you're glad they asked. Keep it relaxed and encouraging.",
            demeanor: "bright, friendly, speaks clearly, easy to talk to",
            endCondition: "the learner has suggested lunch and you've agreed on a day, time and place",
            voice: "sage",
          },
          learnerRole: "colleague",
          taskCard:
            "- Start with some easy small talk\n- Suggest getting lunch together\n- Agree on a day, time and place\n- Say you're looking forward to it",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "The neighbour with a newborn",
          description:
            "You're chatting over the fence with your friendly neighbour and want to become proper friends. They're keen but exhausted with a new baby, so suggest something that actually fits their life.",
          difficultyLevel: "intermediate",
          character: {
            name: "Arjun Mehta",
            role: "next-door neighbour and new dad in Coburg",
            goal:
              "You like the learner and would love a friend nearby, but your daughter Anaya is eight weeks old and you're exhausted. If they suggest a night out or dinner, say honestly that you can't do evenings right now. If they suggest something low-key, like a walk with the pram to Coburg Lake on a weekend morning or a coffee on your front step, you're delighted. If asked, you mention you used to play social cricket and miss it. Appreciate patience and flexibility.",
            demeanor: "friendly, tired, honest, a bit apologetic, lights up when talking about his baby",
            openingLine: "Hey! Sorry I look like a zombie. Anaya had us up at two, three and five.",
            endCondition: "the learner has suggested a plan that fits your situation and you've agreed on when",
            voice: "cedar",
          },
          learnerRole: "neighbour",
          taskCard:
            "- Show interest in how they're going\n- Suggest catching up properly\n- Adapt your idea when they say evenings are too hard\n- Agree on a simple, specific plan",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "First walk with the Blue Gum Bushwalkers",
          description:
            "You're at the meeting point for your first walk with a bushwalking club where everyone already knows each other. Introduce yourself to the busy organiser and find a way to fit in.",
          difficultyLevel: "advanced",
          character: {
            name: "Tahlia Morgan",
            role: "volunteer organiser of the Blue Gum Bushwalkers club",
            goal:
              "You're ticking off names for today's 12 km walk from Wentworth Falls, answering questions and checking boots. You're friendly but distracted and give quick answers. If the learner introduces themselves clearly and asks good questions, you warm up, explain the club costs $40 a year, and mention the social dinner after the walk on the last Saturday of each month. If asked who to walk with, suggest Gus, who's also new-ish. You won't offer this unless asked.",
            demeanor: "brisk, cheerful, multitasking, warms up to confident newcomers",
            endCondition: "the learner has introduced themselves, asked how to get involved and found out about the social side of the club",
            voice: "shimmer",
          },
          learnerRole: "first-time club member",
          taskCard:
            "- Introduce yourself to the organiser despite how busy they are\n- Ask practical questions about the walk and the club\n- Ask how new members usually get to know people\n- Find a way to join in socially, not just on the walk",
          learnerOpens: true,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 5. Reconnecting
    {
      slug: "reconnecting-with-an-old-friend",
      kind: "roleplay",
      title: "\"Hey, Long Time!\" Reconnect With an Old Friend",
      tagline: "Pick up where you left off, make a plan that sticks, and repair a friendship that drifted.",
      description:
        "This course is for anyone who misses someone they lost touch with but feels awkward reaching out after so long. You practise warm openers, honest catch-ups, making a plan that actually happens, and apologising when you've let a friendship slide. In the beginner scenario you bump into an old uni friend at a weekend market and both of you are thrilled, so you practise catching up and swapping details. In the intermediate scenario you call an old school friend after five years; they're happy to hear from you but their calendar is packed, so you practise finding a time that works rather than leaving it at \"we should catch up\". In the advanced scenario you reach out to a friend whose wedding you missed, and they're still a bit hurt, so you practise apologising sincerely, listening without getting defensive and asking if you can start again. You'll leave with the words to reach out first and make it count.",
      keywords: ["reconnecting", "old friends", "friendship", "apologising", "catching up", "making plans"],
      whatYouGet: [
        "Warm ways to open after months or years of silence",
        "Practice turning \"we should catch up\" into a real plan",
        "A simple structure for a sincere apology",
        "Confidence to listen when someone is hurt",
      ],
      audience: "Adults who want to reach out to an old friend and rebuild the connection.",
      bannerBrief: "A glossy rose-pink sticker of two hands linking pinkies, beside a lilac retro phone sticker and chrome sparkles.",
      scenarios: [
        {
          title: "Bumping into an old uni friend at the markets",
          description:
            "You're at the Saturday farmers' market when you spot a friend from uni you haven't seen in three years. Say hi, catch up and swap details.",
          difficultyLevel: "beginner",
          character: {
            name: "Chloe Papadopoulos",
            role: "old uni friend shopping at the Redfern Saturday farmers' market",
            goal:
              "You're thrilled to see the learner. You studied together at uni and lost touch after graduating. You now work as a physiotherapist in Marrickville and have a rescue greyhound called Pip. You ask what they've been up to and where they live now. You'd love to catch up properly and suggest brunch at Little Fig Cafe some weekend. If asked, you mention you still see a couple of your old classmates.",
            demeanor: "excited, warm, chatty, speaks clearly and slowly",
            endCondition: "the learner has caught up with you, swapped details and agreed to meet up again",
            voice: "marin",
          },
          learnerRole: "old uni friend",
          taskCard:
            "- Say hi and remind them how you know each other\n- Ask what they've been up to and share your news\n- Suggest catching up properly\n- Swap details before you say goodbye",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "The call after five years",
          description:
            "You're calling an old school friend you haven't spoken to in five years. They're happy to hear from you, but busy, so you need to turn \"we should catch up\" into an actual date.",
          difficultyLevel: "intermediate",
          character: {
            name: "Marcus Lee",
            role: "old school friend, now an electrician in Wollongong",
            goal:
              "You're surprised and genuinely pleased the learner called. You've been flat out with work, coaching your son's under-10s soccer on Saturdays and renovating your kitchen. When they suggest catching up, you say \"definitely, we should!\" but stay vague. Only if they offer specific options do you check your calendar: you're free Sunday the 19th after 2pm or any weeknight after 7. If asked, you share you got married two years ago to Jess. You'd drive up to Sydney if needed.",
            demeanor: "friendly, relaxed, a bit scattered and vague about dates",
            openingLine: "No way! Is that really you? It's been ages! How are you?",
            endCondition: "the learner has caught up with you and pinned down a specific date, time and place to meet",
            voice: "ash",
          },
          learnerRole: "old school friend calling out of the blue",
          taskCard:
            "- Explain why you're calling and that you've missed them\n- Catch up on each other's lives\n- Move from \"we should catch up\" to specific options\n- Confirm a date, time and place before you hang up",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "Repairing things after a missed wedding",
          description:
            "You're meeting a close friend for coffee for the first time since you missed their wedding last year without much explanation. Apologise sincerely, listen, and ask if you can rebuild the friendship.",
          difficultyLevel: "advanced",
          character: {
            name: "Liam O'Connor",
            role: "former close friend, married last year in the Hunter Valley",
            goal:
              "You agreed to this coffee, but you're still hurt. The learner pulled out of your wedding a week before with a short text and then went quiet for months. You want a real apology, not excuses. If they over-explain or get defensive, you go quiet and say \"right\". If they apologise sincerely, take responsibility and ask about the wedding, you soften and share that it rained but was beautiful. You'll agree to try again only if they suggest something concrete.",
            demeanor: "reserved, hurt, short sentences at first, softens slowly when he feels heard",
            openingLine: "Hey. Thanks for getting in touch. I'll be honest, I wasn't sure I wanted to come.",
            endCondition: "the learner has apologised sincerely, listened to how you felt and you've agreed on a next step for the friendship, or they've become defensive twice",
            voice: "ballad",
          },
          learnerRole: "friend who missed the wedding",
          taskCard:
            "- Apologise sincerely without making excuses\n- Listen to how they felt and acknowledge it\n- Ask about the wedding and their life now\n- Suggest a concrete next step to rebuild the friendship",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 6. Networking
    {
      slug: "networking-events-without-the-dread",
      kind: "roleplay",
      title: "Networking Without Wanting to Disappear",
      tagline: "Walk up, introduce yourself, say what you do in a sentence, and follow up without being pushy.",
      description:
        "This course is for job seekers, career changers and anyone who dreads walking into a room full of strangers with name tags. You practise introducing yourself, explaining what you do in a sentence or two, asking good questions and following up respectfully. In the beginner scenario a friendly event host welcomes you and makes conversation easy, so you practise your introduction and short pitch. In the intermediate scenario you meet a senior professional who has only a few minutes and keeps glancing at their phone, so you practise being concise and asking for one clear follow-up. In the advanced scenario a hiring manager tells you plainly there are no roles at their company, so you practise accepting that, asking for advice or an introduction instead, and leaving a good impression. By the end you'll have a clear self-introduction, better questions and a calm way to handle a no at a networking event.",
      keywords: ["networking", "careers", "self-introduction", "elevator pitch", "professional skills", "follow-up"],
      whatYouGet: [
        "A short, natural way to explain what you do",
        "Questions that get people talking about their work",
        "Practice asking for a follow-up without pressure",
        "How to handle \"we're not hiring\" with grace",
      ],
      audience: "Job seekers and professionals who want to feel more confident at networking events.",
      bannerBrief: "A glossy rose-pink name-tag sticker reading \"hi, I'm...\" beside lilac business-card and handshake stickers, with chrome glints and sparkles.",
      scenarios: [
        {
          title: "Welcome at the Design Meetup",
          description:
            "You've just arrived alone at a monthly design and tech meetup in Surry Hills. The host comes over to welcome you, so introduce yourself and explain what you do.",
          difficultyLevel: "beginner",
          character: {
            name: "Hannah Brooks",
            role: "volunteer host of the Surry Hills Design & Tech Meetup",
            goal:
              "You welcome newcomers and help them feel comfortable. You ask the learner's name, what they do and what brought them here. Tonight's talk is on accessible web design at 7pm and pizza is free. If they mention what kind of work they want, you offer to introduce them to someone, like Jordan, a UX designer at a local agency. If asked, you share you've run the meetup for three years and work as a product designer.",
            demeanor: "welcoming, upbeat, patient, asks easy questions",
            openingLine: "Hi! First time here? I'm Hannah, I help run these nights. Welcome!",
            endCondition: "the learner has introduced themselves, said what they do and what they're looking for, and you've offered an introduction",
            voice: "coral",
          },
          learnerRole: "first-time attendee at a meetup",
          taskCard:
            "- Introduce yourself with your name and what you do\n- Say what brought you to the event\n- Ask the host a question about the meetup or their work\n- Accept or ask for an introduction to someone",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "Five minutes with a busy engineering lead",
          description:
            "You're at an industry mixer and have a chance to talk with a senior engineering lead who clearly has little time. Introduce yourself concisely and ask for one useful follow-up.",
          difficultyLevel: "intermediate",
          character: {
            name: "Vikram Iyer",
            role: "engineering lead at Coastline Software",
            goal:
              "You're polite but have a dinner booking in ten minutes and keep glancing at your phone. If the learner rambles, you say \"sorry, I've only got a minute\". If they're clear and concise about who they are and what they want, you engage, mention Coastline runs a graduate program opening in February, and offer your email for one quick question. If asked about your career, you share you started on a help desk in Adelaide.",
            demeanor: "courteous, distracted, brisk, rewards clarity",
            openingLine: "Hi, I've only got a few minutes, sorry. What do you do?",
            endCondition: "the learner has introduced themselves concisely and either asked for a specific follow-up or let you go politely",
            voice: "verse",
          },
          learnerRole: "professional at an industry mixer",
          taskCard:
            "- Introduce yourself and what you do in two or three sentences\n- Ask one focused question about their work or company\n- Ask for one specific follow-up, like an email or a quick chat\n- Thank them and let them go on time",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "\"We're not hiring\" at the careers expo",
          description:
            "You're at a careers expo talking to a hiring manager at a company you'd love to work for. They tell you there are no roles open, so handle it gracefully and ask for something useful instead.",
          difficultyLevel: "advanced",
          character: {
            name: "Yasmin Haddad",
            role: "hiring manager at Northwind Creative Studio",
            goal:
              "You're tired after a long day at the stand and tell the learner directly that Northwind isn't hiring this year. If they push for a job or hand you a résumé to pass on, say firmly that you can't. If they accept that and ask for advice, which skills you value, or whether you know other studios hiring, you become helpful: you value portfolio case studies over certificates, and you mention Harbour & Pine is growing. You'll offer to connect them only if they've been respectful and specific.",
            demeanor: "frank, tired, a little sceptical, warms up to people who listen",
            openingLine: "Hi there. Just so you know, we're not actually hiring at the moment.",
            endCondition: "the learner has accepted that there's no role, asked for advice or an introduction, and thanked you",
            voice: "sage",
          },
          learnerRole: "job seeker at a careers expo",
          taskCard:
            "- Accept that there are no roles without pushing\n- Introduce yourself and your interest in their field\n- Ask for advice, feedback or a contact instead\n- Thank them and leave a positive impression",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 7. Job interviews
    {
      slug: "job-interview-confidence",
      kind: "roleplay",
      title: "Nail \"Tell Me About Yourself\" (Without Cringing)",
      tagline: "Answer common questions clearly, explain gaps honestly and handle tough follow-ups calmly.",
      description:
        "This course is for anyone preparing for a job interview in Australia, whether it's your first casual job or a step up in your career. You practise introducing yourself, answering common questions with real examples, asking the interviewer good questions and staying calm when things get tricky. In the beginner scenario a friendly cafe owner interviews you for a casual barista role with simple, predictable questions. In the intermediate scenario a library team leader asks behavioural questions and then asks about a gap in your work history, so you practise explaining it honestly and briefly. In the advanced scenario a panel lead questions whether you have enough experience and pushes back on your pay expectations, so you practise backing yourself with examples and negotiating respectfully. You'll leave with structured answers, confident questions and a calmer approach to tough moments.",
      keywords: ["job interview", "employment", "careers", "behavioural questions", "salary", "confidence"],
      whatYouGet: [
        "Practice with common Australian interview questions",
        "A simple way to answer with a real example",
        "Calm, honest ways to explain a gap in your résumé",
        "Confidence to discuss pay and push back respectfully",
      ],
      audience: "Job seekers preparing for interviews in Australia, from casual roles to professional positions.",
      bannerBrief: "A glossy rose-pink briefcase sticker with a chrome clasp beside a lilac thumbs-up sticker and a shiny star, framed by sparkles.",
      scenarios: [
        {
          title: "Barista interview at Bean There Cafe",
          description:
            "You're interviewing for a casual barista job at a busy suburban cafe. Answer the owner's questions about your experience and availability, and ask one question of your own.",
          difficultyLevel: "beginner",
          character: {
            name: "Peter Wong",
            role: "owner of Bean There Cafe in Chatswood",
            goal:
              "You need a casual barista for weekday mornings from 6:30am to 11am, about 15 hours a week. You ask the learner to tell you about themselves, whether they've made coffee before, how they handle a rush and what days they can work. You don't mind if they're inexperienced, as you train people. If asked, you share pay is award rate plus free coffee and lunch on shift. Be encouraging and clear.",
            demeanor: "friendly, patient, speaks clearly, practical",
            openingLine: "Thanks for coming in! Have a seat. So, tell me a bit about yourself.",
            endCondition: "the learner has answered your questions about experience and availability and asked at least one question",
            voice: "cedar",
          },
          learnerRole: "candidate for a casual barista job",
          taskCard:
            "- Introduce yourself briefly\n- Describe any customer service or coffee experience\n- Say clearly which days and times you can work\n- Ask at least one question about the job",
          learnerOpens: false,
          timeLimitMinutes: 5,
        },
        {
          title: "Library officer interview and the career gap",
          description:
            "You're interviewing for a customer service role at a council library. You'll answer behavioural questions and be asked about a two-year gap in your work history.",
          difficultyLevel: "intermediate",
          character: {
            name: "Fatima Rahimi",
            role: "team leader at Riverside Council Library",
            goal:
              "You're hiring a library customer service officer, part-time, 22.8 hours a week. Ask the learner about a time they handled a difficult customer and how they'd help someone who can't use the computers. Then note the two-year gap on their résumé and ask about it. If they're honest and brief, you're satisfied and move on. If vague, ask once more. If asked, you share the team is friendly and the role includes running a weekly conversation group.",
            demeanor: "professional, kind, structured, asks follow-up questions",
            openingLine: "Welcome, and thanks for applying. Let's start with a time you dealt with a difficult customer.",
            endCondition: "the learner has answered both behavioural questions with examples, explained the gap clearly and asked a question",
            voice: "shimmer",
          },
          learnerRole: "candidate for a library customer service role",
          taskCard:
            "- Answer behavioural questions with a specific example\n- Explain the gap in your work history honestly and briefly\n- Link your experience to helping library visitors\n- Ask a thoughtful question about the role or team",
          learnerOpens: false,
          timeLimitMinutes: 7,
        },
        {
          title: "Panel pushback for a project coordinator role",
          description:
            "You're in the final interview for a project coordinator job. The panel lead doubts your experience and pushes back on your salary expectations, so back yourself calmly and negotiate respectfully.",
          difficultyLevel: "advanced",
          character: {
            name: "Nathan Kowalski",
            role: "operations manager leading the interview panel at Greenfield Logistics",
            goal:
              "You're interviewing for a project coordinator role paying $78,000 to $85,000 plus super. You say the learner hasn't formally coordinated projects before and ask why you should take a chance on them. When they name a salary, push back: \"That's at the top of our range for someone without direct experience.\" If they give solid examples and stay calm, you concede that $82,000 with a review at six months is possible. If they get flustered, you stay neutral.",
            demeanor: "direct, sceptical, poker-faced, fair if challenged with evidence",
            openingLine: "Thanks for coming back in. I'll be upfront: my concern is your lack of direct project experience.",
            endCondition: "the learner has answered your doubts with examples, discussed pay and either reached a figure or agreed on next steps",
            voice: "ash",
          },
          learnerRole: "final-round candidate for a project coordinator job",
          taskCard:
            "- Respond to doubts about your experience with specific examples\n- State your salary expectations clearly\n- Negotiate respectfully when they push back\n- Close by confirming next steps",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 8. Party small talk
    {
      slug: "small-talk-at-a-party",
      kind: "roleplay",
      title: "Party Small Talk: Survive the Kitchen Chat",
      tagline: "Chat with people you don't know, keep a quiet conversation going, and exit gracefully when you need to.",
      description:
        "This course is for anyone who arrives at a party, knows only the host and heads straight for the snacks. You practise introducing yourself, finding common ground, asking open questions, keeping the conversation balanced and leaving a chat politely. In the beginner scenario you meet a friendly guest in the kitchen who loves to talk, so you practise easy openers and follow-ups. In the intermediate scenario you meet a quiet guest on the balcony who gives short answers, so you practise open questions and patience until you find a topic they light up about. In the advanced scenario you get stuck with a guest who dominates the conversation and says something you disagree with, so you practise disagreeing lightly, changing the subject and excusing yourself without being rude. By the end you'll be more relaxed at parties, better at drawing people out and confident about moving on from a conversation.",
      keywords: ["small talk", "parties", "social skills", "conversation", "open questions", "leaving a conversation"],
      whatYouGet: [
        "Easy openers for parties where you only know the host",
        "Open questions that help quiet people talk",
        "Polite ways to disagree and change the subject",
        "Graceful exit lines for any conversation",
      ],
      audience: "Adults who want to feel more comfortable chatting with strangers at parties and gatherings.",
      bannerBrief: "Glossy rose-pink party balloon and lilac drink-glass stickers with chrome highlights, surrounded by confetti-like sparkles.",
      scenarios: [
        {
          title: "Kitchen chat at a housewarming",
          description:
            "You're at a friend's housewarming in Brunswick and only know the host. Start a chat with the friendly guest cutting up a cheese platter in the kitchen.",
          difficultyLevel: "beginner",
          character: {
            name: "Ruby Fernandes",
            role: "guest at a housewarming party, helping in the kitchen",
            goal:
              "You're the host's cousin and you're happily arranging a cheese platter. You chat easily, ask how the learner knows the host and what they do. You love talking about your weekend netball team and a recent trip to Tasmania. If asked, you recommend the brie you brought from a market in Fitzroy. Keep things light and friendly, and give the learner plenty of chances to share about themselves.",
            demeanor: "bubbly, open, chatty, speaks at an easy pace",
            endCondition: "the learner has introduced themselves, chatted about a couple of topics and asked you follow-up questions",
            voice: "marin",
          },
          learnerRole: "guest at the housewarming",
          taskCard:
            "- Introduce yourself and offer to help\n- Ask how they know the host\n- Find a topic you can both talk about\n- Ask at least two follow-up questions",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "The quiet guest on the balcony",
          description:
            "You've stepped out onto the balcony at a birthday party, and another guest is standing there alone. They give short answers, so keep the conversation going with open questions until you find common ground.",
          difficultyLevel: "intermediate",
          character: {
            name: "Sam Tupou",
            role: "quiet guest at a 30th birthday party in Liverpool",
            goal:
              "You came because the birthday girl is your workmate, but you don't know anyone and you're a bit shy. Give one- or two-word answers to closed questions. If the learner asks open questions, especially about weekends or hobbies, you open up: you coach an under-12s rugby league team in Campbelltown and love fishing off the rocks at Kurnell. Once you're talking about those, you're warm and funny. If asked, you admit you find parties hard.",
            demeanor: "shy, softly spoken, short answers at first, warm once comfortable",
            endCondition: "the learner has drawn you into a real conversation about something you care about",
            voice: "ballad",
          },
          learnerRole: "guest at the birthday party",
          taskCard:
            "- Say hi and introduce yourself\n- Use open questions (what, how, tell me about) to get them talking\n- Notice what they're interested in and follow it\n- Share something about yourself so it's a two-way chat",
          learnerOpens: true,
          timeLimitMinutes: 6,
        },
        {
          title: "Stuck with the strong opinions",
          description:
            "You're at a dinner party and a guest has been talking at you for ten minutes, then says something you disagree with. Disagree lightly, change the subject and excuse yourself politely.",
          difficultyLevel: "advanced",
          character: {
            name: "Isabella Conti",
            role: "outspoken guest at a dinner party in Leichhardt",
            goal:
              "You're confident and love an audience. You tell the learner that people who rent are \"just wasting money\" and that anyone can buy a house if they skip takeaway coffee. You talk a lot and interrupt. If they disagree respectfully, you argue back once, then shrug and say \"fair enough\". If they change the subject, you happily follow, especially to travel or food. If they excuse themselves politely, you don't mind. You're opinionated, never nasty.",
            demeanor: "loud, confident, talks over people, good-humoured underneath",
            openingLine: "Honestly, renting is just throwing money away. Anyone can buy if they stop buying coffee.",
            endCondition: "the learner has disagreed respectfully, changed the subject and politely excused themselves from the conversation",
            voice: "coral",
          },
          learnerRole: "guest at the dinner party",
          taskCard:
            "- Share a different view calmly and respectfully\n- Avoid getting drawn into an argument\n- Change the subject to something lighter\n- Excuse yourself politely, e.g. to get a drink or say hi to the host",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 9. First date
    {
      slug: "first-date-conversation",
      kind: "roleplay",
      title: "First Date Glow-Up: Keep the Convo Flowing",
      tagline: "Keep a first date relaxed and two-way, handle a hiccup together, and end the night on your terms.",
      description:
        "This course is for adults who are dating and want first dates to feel less like a job interview and more like a real conversation. You practise asking interesting questions, sharing about yourself, handling an awkward moment and being honest about what you want at the end of the night. In the beginner scenario you meet someone for coffee and they're easy to talk to, so you practise balanced back-and-forth. In the intermediate scenario the restaurant has lost your booking and your date is nervous, so you practise solving the problem together and keeping the mood light. In the advanced scenario your date suggests kicking on somewhere else late at night when you'd like to head home, so you practise saying what you want clearly, respecting their feelings and being honest about whether you'd like a second date. You'll finish with better questions and the confidence to set the pace.",
      keywords: ["dating", "first date", "conversation", "consent", "honesty", "confidence"],
      whatYouGet: [
        "Questions that go beyond \"so, what do you do?\"",
        "Practice keeping a conversation balanced and two-way",
        "Calm ways to handle awkward moments together",
        "Clear, kind ways to end a date on your own terms",
      ],
      audience: "Adults who are dating and want first dates to feel more natural and comfortable.",
      bannerBrief: "Two glossy rose-pink coffee-cup stickers with a lilac heart-shaped steam swirl, chrome highlights and soft sparkles.",
      scenarios: [
        {
          title: "Coffee date at Little Moon Cafe",
          description:
            "You're on a first coffee date with someone you met through friends. Keep the conversation relaxed and two-way, and find out a bit about each other.",
          difficultyLevel: "beginner",
          character: {
            name: "Ethan Brown",
            role: "first date, met through mutual friends",
            goal:
              "You're glad to be here and keen to get to know the learner. You work as a landscape gardener in the Inner West, love camping at Jervis Bay and are learning to cook Thai food. You ask the learner about their work, weekends and favourite food. If they ask good questions, you share more, like the time your tent flooded at Jervis Bay. You enjoy yourself and would happily see them again.",
            demeanor: "easygoing, warm, curious, a bit goofy",
            endCondition: "the learner has had a balanced chat, asked and answered questions, and the date is wrapping up warmly",
            voice: "verse",
          },
          learnerRole: "person on a first coffee date",
          taskCard:
            "- Greet them and break the ice\n- Ask open questions about their life and interests\n- Share things about yourself too\n- Wrap up warmly and say whether you'd like to meet again",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "The lost booking at Trattoria Sole",
          description:
            "You've arrived for a dinner date and the restaurant has lost your booking. Your date is nervous, so sort out a plan together and keep the conversation flowing.",
          difficultyLevel: "intermediate",
          character: {
            name: "Ana Reyes",
            role: "first date, met on a dating app",
            goal:
              "You're nervous and were looking forward to Trattoria Sole. When the booking falls through, you say \"oh no, what should we do?\" and wait for the learner to suggest options. You're open to the Thai place two doors down or a walk to the night markets. If asked, you mention you're a pharmacy assistant, grew up in Blacktown, and love karaoke. Once you've decided on a plan, you relax and become funny and chatty.",
            demeanor: "nervous at first, apologetic, gets funny and chatty once relaxed",
            openingLine: "So they've got nothing under your name? Oh no. This is so awkward.",
            endCondition: "the learner has suggested a new plan you agree on, eased the nerves and kept a good conversation going",
            voice: "sage",
          },
          learnerRole: "person on a first dinner date",
          taskCard:
            "- Stay calm and keep the mood light\n- Suggest a couple of options and decide together\n- Put your date at ease\n- Get a relaxed conversation going",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "Ending the night on your terms",
          description:
            "It's 10:30pm and your date suggests kicking on to a bar across town, but you'd like to head home. Say so clearly and kindly, and be honest about whether you'd like a second date.",
          difficultyLevel: "advanced",
          character: {
            name: "Kai Anderson",
            role: "first date, met at a friend's barbecue",
            goal:
              "You've had a great night and suggest heading to Neon Pelican, a bar in Darlinghurst. If the learner says no, you check once: \"Are you sure? Just one drink?\" If they're clear, you accept it straight away and offer to walk them to the station or wait for their ride. Then you ask honestly if they'd like to see you again. Respect whatever they say. If they're unsure, you appreciate honesty more than a polite yes.",
            demeanor: "charming, upbeat, a little hopeful, respectful as soon as a no is clear",
            openingLine: "This has been so fun. Want to kick on? There's a great bar in Darlinghurst.",
            endCondition: "the learner has declined clearly, you've accepted it, and they've honestly said whether they'd like a second date",
            voice: "cedar",
          },
          learnerRole: "person ending a first date",
          taskCard:
            "- Thank them for a nice evening\n- Say clearly that you'd like to head home\n- Hold your answer kindly if they ask again\n- Be honest about whether you'd like a second date",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
    // 10. Boundaries
    {
      slug: "setting-boundaries-with-friends",
      kind: "roleplay",
      title: "Boundaries Without the Drama",
      tagline: "Tell a friend what's not working, clearly and kindly, and keep the friendship strong.",
      description:
        "This course is for anyone who loves a friend but finds something they do hard to live with. You practise naming the problem calmly, saying what you need, listening to their side and holding your boundary when they push back. In the beginner scenario a friend keeps calling late at night, and when you raise it they take it well, so you practise saying it simply. In the intermediate scenario a friend who often borrows money asks for $200, so you practise saying no and setting a clear rule for the future while they act a little hurt. In the advanced scenario a friend keeps making jokes about your accent in front of others and gets defensive when you raise it, so you practise staying calm, explaining the impact and not backing down. You'll finish with simple language for hard conversations that protect both you and the friendship.",
      keywords: ["boundaries", "friendship", "difficult conversations", "assertiveness", "saying no", "respect"],
      whatYouGet: [
        "A simple way to say what's bothering you and what you need",
        "Practice listening without giving up your boundary",
        "Calm responses when a friend gets defensive",
        "Ways to reassure a friend that you value them",
      ],
      audience: "Adults who want to set clear boundaries with friends without damaging the friendship.",
      bannerBrief: "A glossy rose-pink heart sticker inside a lilac chrome circle outline, with a small \"me + you\" sticker and soft sparkles.",
      scenarios: [
        {
          title: "Late-night phone calls",
          description:
            "You're having a coffee with a close friend who often calls you after 11pm on work nights. Let them know kindly that you need earlier calls.",
          difficultyLevel: "beginner",
          character: {
            name: "Zara Ahmed",
            role: "close friend who works late shifts as a nurse",
            goal:
              "You finish nursing shifts at 10:30pm and often call the learner on your drive home because you want to unwind. You had no idea it was a problem. When they raise it, you're surprised but understanding: \"Oh, I'm so sorry, why didn't you say?\" You suggest texting first or calling on your days off, usually Monday and Tuesday. If asked, you share you've been lonely since your housemate moved out.",
            demeanor: "warm, understanding, a bit surprised, easygoing",
            endCondition: "the learner has explained the problem kindly, said what they need and you've agreed on a new arrangement",
            voice: "shimmer",
          },
          learnerRole: "close friend",
          taskCard:
            "- Say you value your chats\n- Explain kindly that late calls are hard for you\n- Say what you'd prefer instead\n- Agree on a new arrangement together",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "The $200 loan",
          description:
            "You're on the phone with a friend who has borrowed money from you several times and hasn't paid it all back. Now they're asking for $200, so say no and set a clear boundary for the future.",
          difficultyLevel: "intermediate",
          character: {
            name: "Luca Bianchi",
            role: "longtime friend who often runs short of money",
            goal:
              "You need $200 for your car rego, due Friday. You still owe the learner $120 from previous loans but you've half forgotten. When they say no, you act a bit hurt: \"Wow, I thought we were mates.\" If they mention the $120, you're embarrassed and promise to pay it back soon. If they set a clear boundary kindly, you accept it and say you'll ask your brother. If asked, you admit work hours were cut.",
            demeanor: "charming, sheepish, slightly guilt-trippy, accepts a calm boundary",
            openingLine: "Hey, I hate to ask, but could you lend me $200 till next payday? It's for my rego.",
            endCondition: "the learner has said no, set a clear boundary about lending money and you've accepted it",
            voice: "ash",
          },
          learnerRole: "friend being asked for a loan",
          taskCard:
            "- Say no to the loan clearly\n- Mention the money still owed, calmly\n- Set a clear boundary about lending money in future\n- Show you still care about them and the friendship",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "\"It's just a joke\"",
          description:
            "You're catching up one-on-one with a friend who keeps joking about your accent in front of others. Tell them it hurts, and hold your boundary when they get defensive.",
          difficultyLevel: "advanced",
          character: {
            name: "Olivia Tran",
            role: "friend from your weekly trivia team",
            goal:
              "You often imitate the learner's accent at trivia nights at The Red Fox Hotel, thinking it's affectionate. When they raise it, you get defensive: \"It's just a joke, don't be so sensitive.\" and \"Everyone laughs.\" If they stay calm and explain how it makes them feel, you go quiet, then admit your own family's accent was mocked at school. You apologise and agree to stop only if they hold their boundary clearly without attacking you.",
            demeanor: "confident, joking, defensive when challenged, eventually reflective",
            endCondition: "the learner has explained the impact, held their boundary through your defensiveness and you've agreed to stop",
            voice: "marin",
          },
          learnerRole: "friend on the trivia team",
          taskCard:
            "- Explain the specific behaviour that bothers you\n- Describe how it makes you feel\n- Stay calm and hold your boundary if they get defensive\n- Say clearly what you'd like to happen from now on\n- Show you value the friendship",
          learnerOpens: true,
          timeLimitMinutes: 8,
        },
      ],
    },
  ],
};
