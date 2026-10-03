import type { OriginalCreator } from "./types";

export const bothSides: OriginalCreator = {
  handle: "both-sides",
  displayName: "Both Sides",
  tagline: "Community interpreting practice for the rooms where it matters: clinics, counters, police stations and planning meetings.",
  bio: "Both Sides is a XINGO Original studio for community interpreters and the people training to become one. We write the everyday sessions that fill an interpreter's week in Australia: a GP appointment in the suburbs, a busy emergency triage desk, a pharmacy counter, a housing office, a police witness statement, a legal aid intake, an employment appointment and a disability planning meeting. Every scenario puts a real-sounding professional on one side and a client on the other, and you carry the meaning both ways. Our last course steps outside the dialogue to practise briefings and professional boundaries, because knowing when to say no is part of the job too. Based in Canberra.",
  location: "Canberra, ACT",
  accent: "#0F766E",
  visualStyle:
    "Black-and-white editorial photography with a single teal accent: high-contrast documentary portraits and interiors, with one teal colour block or underline per image.",
  logoBrief:
    "The words \"Both Sides\" set in a bold black sans-serif on white, with a thin teal underline that splits into two equal halves beneath the type.",
  avatarBrief:
    "A high-contrast black-and-white close-up of two chairs facing each other across a small table, with a single teal square in the gap between them.",
  courses: [
    // ---- 1. GP consultation -------------------------------------------------
    {
      slug: "gp-consultation-interpreting",
      kind: "interpreting",
      title: "GP Consultation Interpreting",
      tagline: "Interpret everyday general practice appointments: symptoms, history, results and the hard conversations in between.",
      description:
        "This course is for community interpreters, students and bilingual health workers who want steady practice in the most common healthcare setting in Australia: the GP consultation. You interpret between a general practitioner and a patient, carrying symptoms, timelines, medical history and instructions accurately in both directions. The first scenario is a calm, predictable appointment about a lingering cough, where the doctor asks one question at a time and the patient answers plainly. The second is a results follow-up where the patient has misunderstood earlier instructions, so you need to render the correction faithfully without smoothing it over. The third is a longer appointment with emotional content and a request the doctor declines, testing your register, your composure and your ability to keep both voices intact when the conversation gets uncomfortable. Clinical details are kept general and invented for practice, so the focus stays on your interpreting.",
      keywords: ["medical interpreting", "gp appointment", "healthcare", "community interpreting", "symptoms", "patient history"],
      whatYouGet: [
        "Three GP consultations that step up from a routine visit to a sensitive, emotional appointment",
        "Practice with symptoms, timelines, test results and follow-up instructions",
        "Experience rendering a doctor's refusal clearly without softening or adding to it",
        "Realistic Australian clinic details: Medicare, referrals, pathology and bulk billing",
      ],
      audience: "Community interpreters, interpreting students and bilingual health staff preparing for medical assignments.",
      bannerBrief:
        "A black-and-white documentary shot of a GP's desk with a stethoscope and an empty patient chair, a teal block across the lower third.",
      scenarios: [
        {
          title: "A cough that won't go away",
          description:
            "You're interpreting at Northside Medical Centre for a patient who has had a cough for three weeks. The GP is friendly and asks one question at a time.",
          difficultyLevel: "beginner",
          character: {
            name: "Helen Papadopoulos",
            role: "GP at Northside Medical Centre in Coburg",
            goal: "You're seeing a new patient about a cough. You want to know when it started, whether it's dry or productive, any fever or shortness of breath, whether they smoke, and what medicines they already take. Ask one thing at a time. If they mention a sore chest only when asked, take it seriously and ask where it hurts. At the end, explain you'd like them to come back in a week if it isn't better, and that the practice bulk bills.",
            demeanor: "warm, unhurried, plain words, checks understanding with short questions",
            openingLine: "Hello, I'm Dr Papadopoulos. Come and have a seat. What's brought you in to see me today?",
            endCondition: "when the cough started, whether it's dry or productive, any fever or breathlessness, smoking status and current medicines",
            voice: "marin",
          },
          client: {
            name: "Adam Rahman",
            role: "new patient with a three-week cough",
            goal: "You're a warehouse worker who has had a cough for about three weeks. It started after a cold. It's worse at night and sometimes brings up a little phlegm. You don't smoke but your housemate does. You take nothing except a cough syrup from the supermarket. You only mention a slight ache in your chest if the doctor asks directly.",
            demeanor: "polite, a little shy, short answers, relaxes once he feels understood",
            voice: "ash",
          },
          timeLimitMinutes: 5,
        },
        {
          title: "Blood test results and a mix-up",
          description:
            "You're interpreting a follow-up where the GP explains blood test results and discovers the patient misunderstood the earlier instructions. Render the correction exactly as the doctor says it.",
          difficultyLevel: "intermediate",
          character: {
            name: "Rajesh Iyer",
            role: "GP at Wattle Grove Family Practice",
            goal: "You ordered fasting blood tests two weeks ago. The results show slightly high blood sugar, but you suspect the patient didn't fast. You want to confirm whether they ate before the test, explain the result in plain language, and arrange a repeat test. You find out, if you ask, that they've also stopped a regular tablet because they thought the test meant they should. Gently correct this and ask them to restart it as before.",
            demeanor: "calm, methodical, a bit formal, repeats key points once",
            openingLine: "Thanks for coming back. Your blood test results are in. Before I go through them, can I check: did you have anything to eat or drink that morning before the test?",
            endCondition: "whether the patient fasted before the test, which regular medicine they stopped and when, and their agreement to a repeat fasting test",
            voice: "cedar",
          },
          client: {
            name: "Lena Petrov",
            role: "patient back for blood test results",
            goal: "You're a part-time cleaner in your fifties. You had a cup of sweet tea and a biscuit before the test because you felt dizzy. You also stopped your blood pressure tablet a week ago because you thought the doctor told you to stop everything before the test. You're worried the high result means diabetes, and you ask whether you'll need injections.",
            demeanor: "worried, talks quickly when anxious, apologises a lot",
            voice: "shimmer",
          },
          timeLimitMinutes: 7,
        },
        {
          title: "Not sleeping, and a certificate the GP won't write",
          description:
            "You're interpreting a long appointment where a patient talks about stress and poor sleep, then asks for a medical certificate the GP declines to backdate. Keep the tone and the refusal intact.",
          difficultyLevel: "advanced",
          character: {
            name: "Fiona McAllister",
            role: "GP at Harbourside Health in Wollongong",
            goal: "You want to understand the patient's sleep, mood, appetite, work and supports, and whether they've had any thoughts of harming themselves, asked carefully. You'd like to offer a mental health care plan and a referral to a psychologist. The patient will ask for a certificate covering last week, which you can't backdate; explain you can only certify from today. Stay kind but firm. If they mention their boss threatening them, note it and suggest the workplace advice line.",
            demeanor: "gentle, direct when needed, comfortable with silence, never rushes the patient",
            openingLine: "It's good to see you again. Last time you mentioned you weren't sleeping well. How have things been since then?",
            endCondition: "how the patient is sleeping and eating, how work is going, who supports them, any thoughts of self-harm, and whether they accept a mental health care plan referral",
            voice: "coral",
          },
          client: {
            name: "Samir Haddad",
            role: "patient struggling with stress and sleep",
            goal: "You're a delivery driver working long shifts. You sleep three or four hours a night and feel on edge. You missed four days of work last week and your manager wants a certificate for those days, so you push hard for one and get upset when refused. You have no thoughts of self-harm, but you're tired and embarrassed to talk about feelings. You'll accept a psychologist referral if it costs little.",
            demeanor: "tense, defensive at first, raises his voice when refused, softens if treated with respect",
            voice: "verse",
          },
          timeLimitMinutes: 8,
        },
      ],
    },

    // ---- 2. Emergency triage ------------------------------------------------
    {
      slug: "emergency-triage-interpreting",
      kind: "interpreting",
      title: "Emergency Triage Interpreting",
      tagline: "Fast, accurate interpreting at the emergency department triage desk, where every detail changes the queue.",
      description:
        "Triage is short, fast and high stakes. This course is for interpreters who want to build speed and precision for hospital emergency departments, where a nurse has a few minutes to decide how urgent a case is. You interpret between a triage nurse and a patient or family member, carrying pain scores, onset times, allergies and warning signs without dropping anything. The first scenario is a parent bringing in a child with a fever, with a patient nurse working through a familiar checklist. The second involves an adult with abdominal pain whose timeline keeps shifting, so you must keep times and sequences straight and help the nurse clarify. The third is a crowded waiting room where a patient wants to leave, the nurse needs to reassess possible chest pain, and emotions run high. Clinical details are general and invented, so you can focus on accuracy, pace and staying calm.",
      keywords: ["emergency department", "triage", "hospital interpreting", "medical interpreting", "pain scale", "urgent care"],
      whatYouGet: [
        "Three triage conversations that build from a calm checklist to a tense waiting-room reassessment",
        "Practice with pain scores, onset times, allergies and warning signs under time pressure",
        "Experience keeping shifting timelines straight and supporting clarification",
        "A feel for the pace and register of an Australian emergency department",
      ],
      audience: "Interpreters and students preparing for hospital and on-call emergency department work.",
      bannerBrief:
        "A grainy black-and-white image of a hospital triage window at night, a teal strip glowing along the counter edge.",
      scenarios: [
        {
          title: "A feverish child at triage",
          description:
            "You're interpreting at the emergency department triage desk for a parent whose four-year-old has had a fever since yesterday. The nurse follows a clear checklist.",
          difficultyLevel: "beginner",
          character: {
            name: "Kylie Watson",
            role: "triage nurse at Riverside Public Hospital emergency department",
            goal: "You're triaging a four-year-old with a fever. You want to know when the fever started, the highest temperature measured, whether the child is drinking and has wet nappies or used the toilet, any rash, vomiting or unusual sleepiness, any medicines given and when, and any allergies. Ask one thing at a time. Tell the parent they'll wait in the children's area and to come straight back to the desk if the child gets floppy or a rash appears.",
            demeanor: "brisk but kind, simple questions, reassuring tone",
            openingLine: "Hi there, I'm Kylie, one of the nurses. I'm going to ask you a few quick questions about your little one. When did the fever start?",
            endCondition: "when the fever started, the highest temperature, fluids and toileting, any rash or vomiting, medicines given and the time, and allergies",
            voice: "sage",
          },
          client: {
            name: "Maria Costa",
            role: "parent of a four-year-old with a fever",
            goal: "You're the mother of a four-year-old boy. His fever started yesterday afternoon and reached 39.4 last night. You gave children's paracetamol at 6 this morning. He's drinking a bit of water but has eaten nothing and has done one wee today. No rash, no vomiting. He has no allergies. You're tired and want to know how long the wait will be.",
            demeanor: "tired, worried, cooperative, asks about waiting times",
            voice: "coral",
          },
          timeLimitMinutes: 5,
        },
        {
          title: "Stomach pain with a shifting timeline",
          description:
            "You're interpreting at triage for an adult with abdominal pain whose story about when it started keeps changing. Keep every time and sequence exact.",
          difficultyLevel: "intermediate",
          character: {
            name: "Tuan Nguyen",
            role: "clinical nurse at Westmead Valley Hospital emergency triage",
            goal: "You're triaging an adult with abdominal pain. You need where the pain is, when it started, whether it has moved, a score out of ten, any vomiting, fever or blood, when they last ate, and any allergies or regular medicines. The patient will give two different start times; politely point this out and ask which is right. If the pain moved to the lower right side, flag it as more urgent and say a doctor will see them soon.",
            demeanor: "focused, polite, repeats numbers back to confirm, slightly faster pace",
            openingLine: "Okay, I'm Tuan, the triage nurse. Can you show me where the pain is and tell me when it started?",
            endCondition: "the location of the pain and whether it moved, a confirmed start time, a pain score, any vomiting or fever, the time of the last meal, allergies and regular medicines",
            voice: "ash",
          },
          client: {
            name: "Joseph Mansour",
            role: "adult with abdominal pain at the emergency department",
            goal: "You're a 32-year-old chef. The pain began around your belly button last night after dinner, about 10 pm, but at first you say it started this morning because that's when it got bad. Now it's lower on the right side, seven out of ten. You vomited once. You last ate dinner last night. You're allergic to penicillin. You downplay the pain because you don't want to miss your shift.",
            demeanor: "stoic, minimises pain, a bit impatient, corrects himself when pressed",
            voice: "ballad",
          },
          timeLimitMinutes: 7,
        },
        {
          title: "A full waiting room and a patient who wants to go",
          description:
            "You're interpreting in a crowded emergency waiting room where a patient threatens to leave after a long wait. The nurse needs to reassess them for possible chest pain while managing their frustration.",
          difficultyLevel: "advanced",
          character: {
            name: "Grace Tupou",
            role: "senior triage nurse at Southbank General emergency department",
            goal: "A patient triaged three hours ago for indigestion wants to leave. You need to reassess: any chest pain, pressure or tightness, pain spreading to the arm, jaw or back, sweating, breathlessness, and heart history. Acknowledge the long wait honestly but don't promise a time. If they describe chest tightness, tell them clearly you're moving them up and they shouldn't leave. If they still insist, explain they'd need to sign a form acknowledging the risk.",
            demeanor: "steady under pressure, firm, empathetic but not apologetic, cuts through noise",
            openingLine: "I can see you're frustrated, and I'm sorry about the wait. Before you go anywhere, I need to check a few things again. Is the pain any different from when you came in?",
            endCondition: "any change in symptoms, whether there is chest tightness or pain spreading, sweating or breathlessness, heart history, and whether the patient agrees to stay",
            voice: "shimmer",
          },
          client: {
            name: "Elena Markovic",
            role: "patient who has waited three hours with upper stomach pain",
            goal: "You're 58 and came in with what you thought was bad indigestion. You've waited three hours and you need to pick up your grandson from school at 3.30. You're angry and say you'll just go to the chemist. If asked carefully, you admit there's now a tightness in your chest and your left arm feels heavy. You had high blood pressure years ago. You'll stay if someone calls your daughter.",
            demeanor: "irritated, loud, interrupts, frightened underneath, calms when taken seriously",
            voice: "sage",
          },
          timeLimitMinutes: 8,
        },
      ],
    },

    // ---- 3. Pharmacy counselling --------------------------------------------
    {
      slug: "pharmacy-counselling-interpreting",
      kind: "interpreting",
      title: "Pharmacy Counselling Interpreting",
      tagline: "Interpret medicine counselling at the pharmacy counter, from first scripts to tricky requests the pharmacist must decline.",
      description:
        "Pharmacists explain a lot in a few minutes: how and when to take a medicine, what to avoid, which side effects matter and when to come back. This course is for interpreters and students who want to practise that dense, instruction-heavy talk at an Australian community pharmacy. You interpret between a pharmacist and a customer, keeping instructions, warnings and questions exact. The first scenario is a friendly counselling session for a new prescription, where the pharmacist goes step by step. The second brings a complication: the customer is also taking a herbal product and a medicine brought from overseas, and the pharmacist has to check for problems. The third is a pressured exchange where the customer asks for a prescription-only medicine without a script and wants to share tablets with a relative, and the pharmacist must refuse clearly. All medicine details are general and invented, with no doses given as advice.",
      keywords: ["pharmacy", "medication counselling", "medical interpreting", "prescriptions", "side effects", "community interpreting"],
      whatYouGet: [
        "Three pharmacy counter conversations from a routine first script to a firm refusal",
        "Practice carrying instructions, warnings and timing without adding or dropping details",
        "Experience with interaction checks, label language and repeat prescriptions",
        "A chance to render a professional's refusal accurately while the customer pushes back",
      ],
      audience: "Interpreters, students and bilingual pharmacy staff who want practice with medicine counselling.",
      bannerBrief:
        "A black-and-white close-up of a pharmacy counter with paper bags and a printed label, one teal price-tag shape in the corner.",
      scenarios: [
        {
          title: "Picking up a first prescription",
          description:
            "You're interpreting at Greenvale Pharmacy as the pharmacist counsels a customer on a new prescription. The pharmacist explains each point slowly and checks understanding.",
          difficultyLevel: "beginner",
          character: {
            name: "Jason Lee",
            role: "pharmacist at Greenvale Pharmacy",
            goal: "You're handing over a first prescription for a blood pressure medicine. You want to check the customer's name and date of birth, ask if they take any other medicines or have allergies, explain to take it once a day at the same time as written on the label, mention dizziness when standing up as a common early side effect, and tell them the script has five repeats. The cost today is $7.70 with their concession card. Invite questions at the end.",
            demeanor: "friendly, patient, speaks slowly, uses the label to point things out",
            openingLine: "Hi, thanks for waiting. Can I just confirm your name and date of birth before I go through this new medicine with you?",
            endCondition: "the customer's name and date of birth, any other medicines and allergies, and confirmation they understand when to take it and what side effect to watch for",
            voice: "ballad",
          },
          client: {
            name: "Hana Yusuf",
            role: "customer collecting her first blood pressure prescription",
            goal: "You're a retired seamstress collecting a new prescription your GP wrote yesterday. Your date of birth is 14 March 1958. You take a vitamin D capsule and nothing else. You have no allergies. You ask whether to take it with food and whether you can stop when your blood pressure is better. You have a concession card in your purse.",
            demeanor: "gentle, careful, asks one question at a time, thanks people often",
            voice: "marin",
          },
          timeLimitMinutes: 5,
        },
        {
          title: "A herbal tea and a box from overseas",
          description:
            "You're interpreting while a pharmacist checks whether a customer's herbal product and a medicine bought overseas could clash with a new prescription. Keep product names and timings precise.",
          difficultyLevel: "intermediate",
          character: {
            name: "Priya Raman",
            role: "pharmacist at Sunnybank Plaza Pharmacy",
            goal: "You're dispensing a new cholesterol medicine. The customer mentions a herbal tea and a box of tablets bought overseas. You want to see or hear the names on the box, how often they take each one, and why. Explain you can't check the overseas tablets without the ingredients, and ask them to bring the box in or show a photo. Advise them not to start the new medicine with the tablets until you or the GP have checked. Offer to call the GP.",
            demeanor: "thorough, curious, warm, slows down when something sounds risky",
            openingLine: "Before I hand this over, do you take anything else at all? That includes vitamins, herbal teas or anything from overseas.",
            endCondition: "the names of the herbal tea and overseas tablets, how often each is taken and why, and the customer's agreement to bring the box in or let the pharmacist contact the GP",
            voice: "marin",
          },
          client: {
            name: "Victor Almeida",
            role: "customer starting a new cholesterol medicine",
            goal: "You're a taxi driver in your sixties. You drink a bitter herbal tea every evening for your liver, and you take two small white tablets a day from a box your cousin sent from overseas, for joint pain. You can't remember the name; the box is at home. You think herbal things are always safe and are mildly offended at the suggestion. You agree to send a photo of the box.",
            demeanor: "chatty, a bit proud, defensive about home remedies, cooperative once reassured",
            voice: "cedar",
          },
          timeLimitMinutes: 7,
        },
        {
          title: "No script, no tablets",
          description:
            "You're interpreting at the counter as a customer asks for a prescription-only medicine without a script and wants to share it with a relative. The pharmacist must refuse; render the refusal clearly and completely.",
          difficultyLevel: "advanced",
          character: {
            name: "Nick Kostas",
            role: "pharmacist in charge at Bayside Discount Pharmacy",
            goal: "A customer wants antibiotics without a prescription and asks to share their own prescribed tablets with a sick relative. You must say no to both: antibiotics need a prescription, and medicines prescribed for one person shouldn't be given to another. Ask what the relative's symptoms are; if they sound serious, recommend a GP or the after-hours clinic on Main Street, open until 10 pm. Offer something suitable over the counter for symptom relief. Stay polite but don't bend.",
            demeanor: "courteous, unflappable, firm, repeats the key point calmly",
            openingLine: "G'day. I understand you're after some antibiotics. Do you have a prescription from a doctor for those today?",
            endCondition: "whether the customer has a prescription, the relative's main symptoms and how long they've had them, and which option the customer will take: GP, after-hours clinic or over-the-counter relief",
            voice: "verse",
          },
          client: {
            name: "Amina Diallo",
            role: "customer seeking antibiotics for her sick brother",
            goal: "You're a university student. Your brother, who's staying with you, has had a sore throat and fever for two days and has no Medicare card yet. You have half a packet of antibiotics left from your own infection and want to give them to him, or buy more. You say back home you could just buy them. You insist, then ask if the after-hours clinic will see someone without Medicare.",
            demeanor: "persistent, frustrated, quick-witted, worried about her brother",
            voice: "coral",
          },
          timeLimitMinutes: 8,
        },
      ],
    },

    // ---- 4. Housing and tenancy ---------------------------------------------
    {
      slug: "housing-tenancy-interpreting",
      kind: "interpreting",
      title: "Housing and Tenancy Interpreting",
      tagline: "Interpret housing applications, repair disputes and rent arrears meetings with accuracy and calm.",
      description:
        "Housing appointments are full of dates, dollar amounts, household details and worry. This course is for community interpreters and students who want to practise with housing officers and tenancy workers in Australian community and social housing. You interpret between an officer and a tenant or applicant, keeping figures, timelines and feelings accurate. The first scenario is a straightforward intake for a social housing application, with a patient officer collecting household and income details. The second is a repairs meeting about mould and a broken heater, where the tenant's account and the property records don't match and you need to keep both versions clear. The third is a rent arrears meeting with real pressure: the tenant is behind, distressed and wants a promise the officer can't give, and the officer needs a payment plan agreed. Policies and amounts are invented for practice, not presented as real rules.",
      keywords: ["housing", "tenancy", "social housing", "community interpreting", "rent arrears", "repairs"],
      whatYouGet: [
        "Three housing conversations, from a calm application intake to a tense arrears meeting",
        "Practice with dates, rent amounts, household members and repair histories",
        "Experience keeping two conflicting accounts clear without taking sides",
        "Realistic Australian community housing language: bond, lease, arrears and payment plans",
      ],
      audience: "Interpreters and students who work, or want to work, with housing services and tenancy programs.",
      bannerBrief:
        "A black-and-white photo of a block of flats at dusk, one window glowing teal among the dark ones.",
      scenarios: [
        {
          title: "Applying for social housing",
          description:
            "You're interpreting at a housing office intake as an officer helps a family start a social housing application. The officer asks clear questions in a set order.",
          difficultyLevel: "beginner",
          character: {
            name: "Leanne Simpson",
            role: "housing officer at Hillside Community Housing",
            goal: "You're doing an initial interview for a social housing application. You need who lives in the household and their ages, where they live now and how much rent they pay, household income sources, any health or mobility needs that affect the type of home, and preferred suburbs. Explain that waiting times can be long and vary by area, and that you'll post a letter with a reference number. Keep it friendly and simple.",
            demeanor: "kind, patient, practical, explains each step before asking",
            openingLine: "Hi, I'm Leanne. Today we're just going to start your application. First, can you tell me who lives with you?",
            endCondition: "household members and their ages, current address and rent, income sources, any health or mobility needs, and preferred suburbs",
            voice: "coral",
          },
          client: {
            name: "Karim Saleh",
            role: "father applying for social housing",
            goal: "You're a father of three children aged 2, 7 and 11, living with your wife in a two-bedroom flat in Lakemba. Rent is $560 a week and it's too much. Your wife works part-time as a cleaner and you work casual shifts at a car wash. Your middle child has asthma, so you'd like a place without carpet. You'd like to stay near the children's school.",
            demeanor: "respectful, a little nervous, gives long answers, hopeful",
            voice: "ash",
          },
          timeLimitMinutes: 5,
        },
        {
          title: "Mould, a broken heater and no reply",
          description:
            "You're interpreting a repairs meeting where the tenant's account of reported problems doesn't match the housing provider's records. Keep both versions clear and accurate.",
          difficultyLevel: "intermediate",
          character: {
            name: "Marco Rossi",
            role: "tenancy officer at Eastgate Housing Association",
            goal: "A tenant says they reported mould and a broken heater months ago. Your system shows only one heater report, on 12 June, marked as fixed. You want to know when and how each problem was reported, who they spoke to, where the mould is, whether anyone's health is affected, and what's happened since. Don't argue; note the difference politely. Promise to book an inspection within ten working days and give the reference number EH-4471.",
            demeanor: "polite, a bit bureaucratic, reads from a screen, softens when he hears about health",
            openingLine: "Thanks for coming in. I've got your file up. Can you tell me what's going on at the property and when you first reported it?",
            endCondition: "what problems there are and where, when and how each was reported and to whom, any health effects, and a time when the tenant can be home for an inspection",
            voice: "cedar",
          },
          client: {
            name: "Rosa Mendes",
            role: "tenant with mould and a broken heater",
            goal: "You're a single mother of a baby. You rang about black mould in the bedroom in May and again in July, speaking to a man called Steve. The heater was fixed in June but broke again two weeks later. Your baby has had a cough for a month. You're upset that the records say it's fixed. You're home every weekday except Thursday.",
            demeanor: "frustrated, insistent, detailed about dates, close to tears about her baby",
            voice: "shimmer",
          },
          timeLimitMinutes: 7,
        },
        {
          title: "Behind on rent and asking for a promise",
          description:
            "You're interpreting a rent arrears meeting with a distressed tenant who wants a guarantee the officer can't give. The officer needs a payment plan agreed today.",
          difficultyLevel: "advanced",
          character: {
            name: "Joanne Kim",
            role: "senior tenancy manager at Westside Community Housing",
            goal: "The tenant is $1,840 behind in rent, about eight weeks. You want to know why, their current income, and what they can realistically pay each fortnight on top of normal rent. You'd like at least $60 a fortnight. The tenant will ask you to promise they won't be evicted; you can't promise that, only that keeping to a plan is the best way to stay housed. Mention the free financial counselling service. Be honest and steady.",
            demeanor: "direct, honest, compassionate, doesn't fill silences, won't make promises",
            openingLine: "Thanks for meeting with me. I want to be upfront: the rent account is $1,840 behind, which is about eight weeks. Can you tell me what's been happening?",
            endCondition: "the reason for the arrears, the tenant's current income, an agreed fortnightly repayment amount, and whether they'll accept a referral to financial counselling",
            voice: "sage",
          },
          client: {
            name: "Ali Hassan",
            role: "tenant eight weeks behind on rent",
            goal: "You're a forklift driver who lost your job three months ago and only found casual work last month, about $900 a fortnight. You sent money to family who needed an operation. You're ashamed and scared. You repeatedly ask the manager to promise you won't be evicted. At first you offer $20 a fortnight, then can go to $50, but no higher. You'll accept financial counselling.",
            demeanor: "anxious, pleading, sometimes angry, proud, repeats the same question",
            voice: "verse",
          },
          timeLimitMinutes: 8,
        },
      ],
    },

    // ---- 5. Government services counter -------------------------------------
    {
      slug: "government-services-counter",
      kind: "interpreting",
      title: "Government Services Counter",
      tagline: "Interpret at a government service centre: updates, paperwork mix-ups and payment problems at the counter.",
      description:
        "Government service counters run on reference numbers, document lists and deadlines. This course is for interpreters and students who want practice at a generic Australian government service centre, the kind that handles payments, identity and contact details. You interpret between a customer service officer and a client, carrying numbers, dates and document names accurately. The first scenario is a simple change of address and phone number, with a friendly officer working through security questions. The second is a document mix-up where the client's name is spelled differently across records, so you need to handle spellings and dates of birth carefully and help the officer clarify. The third is a payment that has been stopped, with a frustrated client, a deadline and a list of documents to supply, where the officer has limited power and must say so. All services, rules and amounts are generic and invented.",
      keywords: ["government services", "service centre", "community interpreting", "documents", "payments", "public service"],
      whatYouGet: [
        "Three counter conversations from a simple update to a stopped payment with a deadline",
        "Practice with reference numbers, spellings, dates and document names",
        "Experience interpreting security checks and identity questions",
        "Practice keeping your role clear when a client is angry with the system",
      ],
      audience: "Interpreters and students who want confidence with government service settings and paperwork-heavy talk.",
      bannerBrief:
        "A high-contrast black-and-white shot of a numbered queue ticket held in a hand, the ticket number printed in teal.",
      scenarios: [
        {
          title: "Updating an address and phone number",
          description:
            "You're interpreting at the Parramatta Service Centre counter as an officer helps a client update their contact details. It's a routine, friendly exchange.",
          difficultyLevel: "beginner",
          character: {
            name: "Ben Harris",
            role: "customer service officer at the Parramatta Service Centre",
            goal: "A client wants to update their address and phone number. You need to confirm identity with full name, date of birth and customer reference number, then get the new address with postcode, the date they moved, a new mobile number, and whether they want letters by post or online. Read back the address to check it. Tell them a confirmation letter will arrive within two weeks. Keep it light and friendly.",
            demeanor: "cheerful, chatty, efficient, reads details back slowly",
            openingLine: "Morning! What can I help you with today? And can I grab your full name and date of birth to start?",
            endCondition: "the client's full name, date of birth and reference number, new address with postcode, moving date, new mobile number and letter preference",
            voice: "ash",
          },
          client: {
            name: "Nina Sokolova",
            role: "client updating her contact details",
            goal: "You're a dental assistant who moved last Saturday, 6 September, from Granville to 22 Wren Street, Merrylands NSW 2160. Your new mobile is 0412 558 903. Your reference number is 304 118 772K. You'd prefer letters online because post goes missing. You ask whether you need to tell anyone else about the move.",
            demeanor: "organised, friendly, has her papers ready, speaks clearly",
            voice: "sage",
          },
          timeLimitMinutes: 5,
        },
        {
          title: "Two spellings of one name",
          description:
            "You're interpreting as an officer sorts out a record where the client's name and date of birth don't match their documents. Spell everything carefully and help the officer clarify.",
          difficultyLevel: "intermediate",
          character: {
            name: "Mei Zhang",
            role: "customer service officer at the Footscray Service Centre",
            goal: "A client's claim is on hold because the name on their record doesn't match their passport, and the date of birth has day and month swapped. You need the name spelled letter by letter exactly as on the passport, any other spellings they've used, the correct date of birth, and which documents they have today. Explain you can fix the date with the passport, but the name change needs a form, the NC-2, lodged with a certified copy.",
            demeanor: "precise, patient, a little formal, spells things back letter by letter",
            openingLine: "I can see your claim is on hold. It looks like the name on our record doesn't match your documents. Could you spell your name for me exactly as it is on your passport?",
            endCondition: "the name spelled exactly as on the passport, any other spellings used, the correct date of birth, and which identity documents the client has with them",
            voice: "shimmer",
          },
          client: {
            name: "Daniel Reyes",
            role: "client whose claim is on hold over a name mismatch",
            goal: "You're a labourer whose claim has been on hold for three weeks. Your passport says DANIEL JOSE REYES MORALES, but your record says Daniel Morales. Your birthday is 5 November 1990, not 11 May. You have your passport and a bank card today, not your visa letter. You're confused why it matters and ask how long the fix will take.",
            demeanor: "confused, mildly annoyed, cooperative, needs things explained twice",
            voice: "ballad",
          },
          timeLimitMinutes: 6,
        },
        {
          title: "A stopped payment and a deadline",
          description:
            "You're interpreting for a client whose payment has stopped because documents weren't supplied. The client is angry, and the officer has limited power and has to say so plainly.",
          difficultyLevel: "advanced",
          character: {
            name: "Hamish Grant",
            role: "senior service officer at the Logan Central Service Centre",
            goal: "A client's payment was stopped on 1 October because a request for payslips and a rental agreement wasn't answered. You need to know if they received the letter, what's changed in their work and housing, and which documents they can supply. Be honest: you can't restart the payment today, but if they upload the documents by 17 October, it can be reviewed and back-paid. If they ask you to make an exception, explain you can't, but they can request a review.",
            demeanor: "level-headed, firm, a bit weary, apologises once and then sticks to facts",
            openingLine: "I've looked at your record. Your payment was stopped on the first of October because we didn't receive some documents we asked for. Did you get a letter from us about that?",
            endCondition: "whether the client received the letter, changes to work and housing, which documents they can supply and by when, and whether they want to request a review",
            voice: "ballad",
          },
          client: {
            name: "Leila Ahmadi",
            role: "client whose payment has stopped",
            goal: "You're a single mother working a few casual shifts at a bakery. You never got a letter; you moved in August and think it went to the old address. You have three payslips on your phone but no rental agreement, because you rent a room from a friend. Rent is due Friday. You demand the officer fix it today and accuse the office of losing your mail.",
            demeanor: "angry, fast, interrupts, desperate about rent, calms slightly with clear steps",
            voice: "marin",
          },
          timeLimitMinutes: 8,
        },
      ],
    },

    // ---- 6. Police witness statement ----------------------------------------
    {
      slug: "police-witness-statement-interpreting",
      kind: "interpreting",
      title: "Police Witness Statement Interpreting",
      tagline: "Interpret witness statements for police: exact words, exact times and no guessing.",
      description:
        "Witness statements depend on precise detail: what was seen, from where, at what time, and in what order. This course is for interpreters and students who want practice interpreting for police taking statements from witnesses, never suspects, in non-accusatory settings. You interpret between a police officer and a member of the public who saw something happen, keeping descriptions, distances and sequences exact and preserving hesitation and uncertainty. The first scenario is a minor car crash at an intersection with a patient constable. The second is a shop theft where the witness's description of a person is detailed but muddled, and the officer pushes for clarity. The third is a late-night assault outside a bar, where the witness is frightened, unsure of parts of what they saw, and hesitant to sign a statement. The focus is accuracy, neutrality and rendering \"I'm not sure\" exactly as said.",
      keywords: ["police interpreting", "witness statement", "legal interpreting", "community interpreting", "descriptions", "accuracy"],
      whatYouGet: [
        "Three witness interviews, from a simple car crash to a frightened witness at night",
        "Practice with descriptions of people, vehicles, distances and the order of events",
        "Experience preserving uncertainty and hesitation without tidying it up",
        "Practice interpreting statement readbacks and questions about signing",
      ],
      audience: "Interpreters and students preparing for police and justice settings who want calm, non-confrontational practice.",
      bannerBrief:
        "A black-and-white photo of a quiet suburban intersection at dusk, with a teal line painted across the pedestrian crossing.",
      scenarios: [
        {
          title: "A bump at the intersection",
          description:
            "You're interpreting at the police station for a witness who saw a minor car crash. The constable is patient and asks one question at a time.",
          difficultyLevel: "beginner",
          character: {
            name: "Sophie Mitchell",
            role: "constable at Belconnen Police Station",
            goal: "You're taking a statement from a witness to a two-car crash on Tuesday at the corner of Banks Street and Hall Road. You need where the witness was standing, the time, which cars were involved and their colours, which way each was going, what colour the traffic lights were, and what happened after. Remind them it's fine to say they don't know. Get their name and phone number for contact. Thank them warmly.",
            demeanor: "patient, encouraging, unhurried, writes as she listens",
            openingLine: "Thanks for coming in. You're not in any trouble. I just want to hear what you saw on Tuesday. Where were you when it happened?",
            endCondition: "where the witness was standing, the time, both cars' colours and directions, the traffic light colour, what happened after, and the witness's name and phone number",
            voice: "marin",
          },
          client: {
            name: "Mateo Silva",
            role: "witness to a minor car crash",
            goal: "You're a gardener who was waiting at the bus stop on Banks Street at about 8.15 on Tuesday morning. A white van turned right and a small red hatchback coming straight through hit it. You think the light was green for the hatchback but aren't completely sure. Nobody was hurt; the drivers argued. Your name is Mateo Silva and your phone is 0433 271 650.",
            demeanor: "helpful, a little nervous in a police station, careful to be accurate",
            voice: "cedar",
          },
          timeLimitMinutes: 5,
        },
        {
          title: "What the shoplifter looked like",
          description:
            "You're interpreting while a senior constable takes a statement from a shop worker who saw a theft. The description is detailed but muddled, and the officer pushes for precision.",
          difficultyLevel: "intermediate",
          character: {
            name: "Ahmed Khalil",
            role: "senior constable at Dandenong Police Station",
            goal: "You're taking a statement about a theft of two phones from a shop in Lonsdale Arcade, Dandenong, on Saturday afternoon. You need the time, a description of the person (height, build, clothing, hair, anything distinctive), which way they went, and whether the witness would recognise them. The witness mixes up details, saying a grey hoodie then a black one; ask which is right. Never suggest answers. Ask whether CCTV footage exists.",
            demeanor: "methodical, neutral, polite, repeats details back for accuracy",
            openingLine: "I'd like to go through Saturday step by step. What time did you first notice this person in the shop?",
            endCondition: "the time, a description of the person's height, build, clothing and hair, which way they left, whether the witness could recognise them, and whether there's CCTV",
            voice: "verse",
          },
          client: {
            name: "Yasmin Farah",
            role: "shop assistant who witnessed a theft",
            goal: "You work at a phone accessories shop. On Saturday around 3.40 pm a young man, about your height, slim, with a hoodie and white sneakers, took two phones from the display and ran towards the car park. You first say grey hoodie, then remember it was black with a grey logo. He had a small scar on his chin. Your manager has the CCTV.",
            demeanor: "eager to help, talks quickly, corrects herself, a bit shaken",
            voice: "coral",
          },
          timeLimitMinutes: 7,
        },
        {
          title: "Late night, outside the bar",
          description:
            "You're interpreting for a frightened witness to an assault outside a bar. They're unsure about some details and hesitant to sign, so render their uncertainty exactly as they say it.",
          difficultyLevel: "advanced",
          character: {
            name: "Carmen Vella",
            role: "detective sergeant at Fortitude Valley Police Station",
            goal: "You're taking a statement from a witness to an assault outside the Red Lantern Bar at about 1 am on Sunday. You need where they were, lighting, distance, what started it, what each person did in order, what was said, and descriptions. Their account differs from what they told a constable on the night; ask about it gently. They'll worry about safety and court. Explain they can read the statement back before signing and that victim and witness support is available.",
            demeanor: "composed, gentle but exacting, never leading, gives the witness time",
            openingLine: "I know this is hard to talk about. Take your time. Let's start with where you were standing when you first noticed something happening.",
            endCondition: "the witness's position, lighting and distance, what started the incident, the order of events, words they heard, descriptions of those involved, and whether they're willing to sign",
            voice: "coral",
          },
          client: {
            name: "Ivan Horvat",
            role: "witness to an assault outside a bar",
            goal: "You're a kitchen hand who was waiting for a taxi about ten metres away. Two men argued; the taller one in a blue shirt pushed the other, who fell and hit his head. On the night you said it was a punch, but now you're not sure. The street light was flickering. You're scared because the tall man saw you. You ask if he'll find out your name.",
            demeanor: "frightened, hesitant, long pauses, says 'I think' often, wants reassurance",
            voice: "ash",
          },
          timeLimitMinutes: 8,
        },
      ],
    },

    // ---- 7. Legal aid intake ------------------------------------------------
    {
      slug: "legal-aid-intake-interpreting",
      kind: "interpreting",
      title: "Legal Aid Intake Interpreting",
      tagline: "Interpret legal aid intake interviews: eligibility checks, sensitive family matters and urgent court dates.",
      description:
        "Legal aid intake is where people first explain their problem to a lawyer or intake officer, often in a rush and under stress. This course is for interpreters and students who want practice with the language of legal services without needing to know the law. You interpret between an intake officer or lawyer and a client, carrying dates, documents and personal circumstances exactly, and leaving the legal judgement to the professional. The first scenario is a straightforward eligibility check for help with unpaid fines. The second is a family law intake after a separation, with sensitive questions about children and safety. The third is an urgent matter with a court date next week, missing documents and a client who wants the lawyer to promise a result. Everything is generic and invented: no real legal advice, only realistic professional talk to interpret.",
      keywords: ["legal interpreting", "legal aid", "intake interview", "family law", "court", "community interpreting"],
      whatYouGet: [
        "Three legal intake interviews that move from eligibility checks to an urgent court matter",
        "Practice with dates, documents, income details and sensitive family information",
        "Experience interpreting a professional's careful limits on what they can promise",
        "Practice staying neutral when a client asks you, not the lawyer, what to do",
      ],
      audience: "Interpreters and students preparing for legal services, community legal centres and court-related work.",
      bannerBrief:
        "A black-and-white image of a stack of manila folders on a plain desk, one folder tab coloured teal.",
      scenarios: [
        {
          title: "Unpaid fines and an eligibility check",
          description:
            "You're interpreting at Southside Legal Aid as an intake officer checks whether a client can get help with unpaid fines. The questions are routine and friendly.",
          difficultyLevel: "beginner",
          character: {
            name: "Tom Fraser",
            role: "intake officer at Southside Legal Aid",
            goal: "You're doing an eligibility check. You need what the fines are for and roughly how many, the total amount owed, any letters with deadlines, the client's income and whether they get a government payment, and who lives with them. Explain you're not a lawyer, that a solicitor will review the file, and that you'll call within five working days. Ask them to bring all the fine letters to the next appointment.",
            demeanor: "relaxed, friendly, uses plain words, explains why each question matters",
            openingLine: "Hi, I'm Tom. I'm going to ask some questions so we can see whether we can help. Can you tell me a bit about these fines?",
            endCondition: "what the fines are for and how many, the total owed, any deadlines in letters, the client's income source, and who lives in the household",
            voice: "cedar",
          },
          client: {
            name: "Fatima Noor",
            role: "client seeking help with unpaid fines",
            goal: "You're a mother of two who has about six fines, mostly parking and one for an expired registration, totalling around $1,900. A letter said your licence could be suspended after 30 October. You receive a government parenting payment and do some home childcare. You live with your two children. You brought two letters; the rest are at home.",
            demeanor: "embarrassed, polite, speaks softly, relieved to be helped",
            voice: "shimmer",
          },
          timeLimitMinutes: 5,
        },
        {
          title: "After the separation",
          description:
            "You're interpreting a family law intake where a client describes a recent separation and arrangements for the children. Questions about safety are asked carefully; keep the client's words and tone exact.",
          difficultyLevel: "intermediate",
          character: {
            name: "Anjali Sharma",
            role: "family law intake solicitor at Northern Community Legal Centre",
            goal: "You're doing a first intake after a separation. You need the date of separation, the children's names and ages, where the children live now and how often they see the other parent, whether there are any court orders, and whether the client or children feel safe. Ask about safety gently and once. Don't give advice today; explain a lawyer will contact them and, if there are safety concerns, give the 24-hour support line number.",
            demeanor: "calm, careful, compassionate, measured pace, never pushes",
            openingLine: "Thank you for coming in. Everything you tell me is confidential. Can we start with when you and your partner separated?",
            endCondition: "the separation date, the children's names and ages, current living and contact arrangements, any existing court orders, and whether the client and children feel safe",
            voice: "sage",
          },
          client: {
            name: "Musa Ibrahim",
            role: "father seeking help after a separation",
            goal: "You're a bus driver who separated from your wife on 3 August. Your children, Zara, 9, and Yusuf, 6, live with their mother; you see them every second weekend but she has started cancelling. There are no court orders. You feel safe, but mention your ex-partner's new boyfriend shouted at the children once. You ask the interpreter privately what you should do.",
            demeanor: "sad, controlled, careful with words, sometimes long pauses",
            voice: "verse",
          },
          timeLimitMinutes: 7,
        },
        {
          title: "Court next week and missing papers",
          description:
            "You're interpreting for a client with a court date next week, missing documents and a demand for a guaranteed outcome. The solicitor must set limits; render them faithfully.",
          difficultyLevel: "advanced",
          character: {
            name: "Paul Nikolaidis",
            role: "duty solicitor at Central Legal Aid",
            goal: "A client has a tribunal hearing next Wednesday about a debt claim from a former landlord for $4,300 in damage. You need the hearing date and time, what the landlord is claiming, what the client disputes, what evidence they have (photos, receipts, the entry condition report), and what's missing. The client will ask you to promise they'll win; you can't. Explain you may be able to seek an adjournment if documents are missing, but it's the tribunal's decision.",
            demeanor: "quick, sharp, honest, slightly impatient, warms up when the client gives clear facts",
            openingLine: "We don't have much time, so I'll be direct. Your hearing is next Wednesday. Tell me what the landlord says you owe and why.",
            endCondition: "the hearing date and time, the amount claimed and why, what the client disputes, what evidence they have and what is missing, and whether they want an adjournment sought",
            voice: "ash",
          },
          client: {
            name: "Sofia Ruiz",
            role: "former tenant facing a tribunal claim",
            goal: "You're a nurse's aide. Your old landlord claims $4,300 for carpet and wall damage. The carpet was already stained when you moved in, and you have photos on your old phone, which is broken. You have the bond receipt but lost the condition report. The hearing is Wednesday at 10 am. You keep asking the solicitor to promise you'll win and get upset by the answer.",
            demeanor: "anxious, emotional, talks over people, determined, sometimes blames herself",
            voice: "sage",
          },
          timeLimitMinutes: 8,
        },
      ],
    },

    // ---- 8. Employment services ---------------------------------------------
    {
      slug: "employment-services-interpreting",
      kind: "interpreting",
      title: "Employment Services Interpreting",
      tagline: "Interpret job plans, qualifications talks and tough attendance conversations at an employment provider.",
      description:
        "Employment service appointments mix paperwork, ambition and frustration. This course is for interpreters and students who want practice with job-seeker appointments at an Australian employment services provider. You interpret between an employment consultant and a job seeker, carrying work history, qualifications, availability and obligations accurately. The first scenario is a first appointment to build a job plan, with a consultant asking about experience and goals. The second is a conversation about qualifications earned overseas, where the job seeker feels pushed toward unrelated work and you need to keep their frustration and the consultant's options both clear. The third is a pressured meeting about missed appointments, where the job seeker explains caring duties and the consultant has to explain consequences without being able to waive them. Rules and programs are generic and invented, not presented as current policy.",
      keywords: ["employment services", "job seeker", "job plan", "qualifications", "community interpreting", "career"],
      whatYouGet: [
        "Three employment appointments, from a first job plan to a tense attendance meeting",
        "Practice with work histories, qualifications, dates and weekly availability",
        "Experience rendering frustration and professional limits without softening either",
        "Plain Australian employment vocabulary: resume, TAFE, job plan and recognition of skills",
      ],
      audience: "Interpreters and students who want practice with employment and training services.",
      bannerBrief:
        "A black-and-white portrait of a person holding a printed resume in a waiting room, a teal folder on their lap.",
      scenarios: [
        {
          title: "First appointment and a job plan",
          description:
            "You're interpreting at Pathways Employment as a consultant meets a new job seeker to start a job plan. The consultant is upbeat and asks simple questions.",
          difficultyLevel: "beginner",
          character: {
            name: "Rachel Tan",
            role: "employment consultant at Pathways Employment in Blacktown",
            goal: "You're meeting a new job seeker. You want their work history, highest education, what kind of work they want, which days and hours they're available, whether they have a driver's licence or car, and whether they'd like help with a resume or a short course. Suggest a free forklift or barista course at the local TAFE if it fits. Book the next appointment for Tuesday the 14th at 10 am.",
            demeanor: "upbeat, encouraging, friendly small talk, simple questions",
            openingLine: "Welcome! I'm Rachel, and I'll be your consultant. Let's start easy: what kind of work have you done before?",
            endCondition: "the job seeker's work history, education, the type of work wanted, available days and hours, licence or car, and interest in a resume or short course",
            voice: "shimmer",
          },
          client: {
            name: "Tariq Aziz",
            role: "new job seeker at his first appointment",
            goal: "You're 24. You've worked in a family shop and done some warehouse packing. You finished high school. You'd like warehouse or delivery work. You can work any day except Friday afternoons. You have a learner licence, not a full one. You'd love help with a resume and are interested in a forklift course. Tuesday the 14th suits you.",
            demeanor: "keen, polite, a bit unsure of himself, answers simply",
            voice: "ballad",
          },
          timeLimitMinutes: 5,
        },
        {
          title: "An engineer told to try retail",
          description:
            "You're interpreting as a job seeker with overseas engineering qualifications pushes back on being sent to unrelated jobs. Keep both the frustration and the consultant's options clear.",
          difficultyLevel: "intermediate",
          character: {
            name: "Liam O'Connor",
            role: "employment consultant at Horizon Job Services",
            goal: "You've suggested retail jobs, but the job seeker says they're a civil engineer. You want details of their degree, years of experience, whether they've started having qualifications assessed, and their English test status if relevant to the job. Explain options: a skills assessment, a bridging course at a local university, volunteer or paid work in a related field such as drafting. You still need them to apply for four jobs a fortnight, which can include engineering-related roles.",
            demeanor: "well-meaning, a bit scripted, open to correction, keen to help once he understands",
            openingLine: "Last time we talked about some retail roles. I get the sense you're not happy with that. Can you tell me more about your background?",
            endCondition: "the job seeker's degree, years of experience, whether a skills assessment has started, which related roles they'd accept, and agreement on job applications",
            voice: "ballad",
          },
          client: {
            name: "Irina Volkova",
            role: "job seeker with overseas engineering qualifications",
            goal: "You're a civil engineer with a five-year degree and eleven years designing roads and bridges overseas. You arrived eight months ago. You haven't started a skills assessment because you don't know how and it costs money. You feel insulted by the retail suggestions. You'd accept drafting or site assistant roles. You'll agree to applications if some can be in engineering.",
            demeanor: "articulate, proud, sharp, frustrated, warms when respected",
            voice: "marin",
          },
          timeLimitMinutes: 7,
        },
        {
          title: "Missed appointments and caring at home",
          description:
            "You're interpreting a tense meeting about missed appointments. The job seeker explains caring duties, and the consultant must explain consequences they can't waive.",
          difficultyLevel: "advanced",
          character: {
            name: "Jasmine Walker",
            role: "senior employment consultant at Pathways Employment in Penrith",
            goal: "The job seeker missed three appointments in a row. You need the reasons and dates, who they care for and how many hours a week, whether there's a medical certificate or carer paperwork, and what times they can attend. Explain clearly that missed appointments can affect their payment and that you can't just remove them, but changed circumstances can be reported and phone appointments may be possible. Stay respectful; don't threaten.",
            demeanor: "straight-talking, warm underneath, practical, won't promise what she can't deliver",
            openingLine: "I'm glad you came in today. I need to talk about the three appointments that were missed. Can you tell me what's been happening?",
            endCondition: "the reasons for the missed appointments, who the job seeker cares for and how many hours, what paperwork exists, and the times they can attend or take phone appointments",
            voice: "marin",
          },
          client: {
            name: "Kofi Mensah",
            role: "job seeker caring for his elderly mother",
            goal: "You're 45 and care for your mother, who had a stroke in July, about 30 hours a week. You missed appointments on 2, 9 and 16 September because she had hospital appointments. You have hospital letters but no carer paperwork. You're angry because you got a warning letter. You can only attend after 1 pm, or by phone. You ask if your payment will stop.",
            demeanor: "frustrated, exhausted, dignified, short tempered at first",
            voice: "cedar",
          },
          timeLimitMinutes: 8,
        },
      ],
    },

    // ---- 9. Disability support planning -------------------------------------
    {
      slug: "disability-support-planning-interpreting",
      kind: "interpreting",
      title: "Disability Support Planning Interpreting",
      tagline: "Interpret disability support planning meetings: goals, daily life, carers' views and complaints about services.",
      description:
        "Disability support planning meetings are long, personal and full of specific details about daily life. This course is for interpreters and students who want practice with planners, coordinators and support workers in the Australian disability support system. You interpret between the professional and a participant or family member, carrying goals, routines and concerns in the participant's own words. The first scenario is a first planning conversation focused on goals and a typical week. The second is a plan review where the participant and their carer don't fully agree, and you must keep each person's voice distinct. The third is a difficult meeting about changing providers and a worrying incident with a support worker, where safety, complaints and next steps all need careful rendering. Program terms and funding details are kept generic and invented, so the focus stays on accurate, respectful interpreting.",
      keywords: ["disability support", "planning meeting", "community interpreting", "carers", "support coordination", "goals"],
      whatYouGet: [
        "Three planning meetings from first goals to a complaint about a support worker",
        "Practice with routines, goals, support hours and provider names",
        "Experience interpreting for more than one family voice without blending them",
        "Practice rendering safety concerns and complaints accurately and calmly",
      ],
      audience: "Interpreters and students preparing for disability services and planning meetings.",
      bannerBrief:
        "A black-and-white documentary photo of a kitchen table with a planner and two mugs, a teal sticky note on the open page.",
      scenarios: [
        {
          title: "Goals and an ordinary week",
          description:
            "You're interpreting at a first planning conversation where a coordinator asks about a participant's goals and daily routine. The pace is relaxed and the questions are open.",
          difficultyLevel: "beginner",
          character: {
            name: "Andrew Pham",
            role: "local area coordinator at Inner West Disability Connect",
            goal: "You're meeting a new participant who has low vision. You want to understand an ordinary week, what they can do independently, where they need help, who helps now, and two goals for the next year. Ask about getting around, shopping and cooking. If they mention wanting to study, ask more. Explain the plan will be drafted and sent within three weeks.",
            demeanor: "relaxed, curious, kind, lets people talk",
            openingLine: "Thanks for having me. There's no right or wrong answer today. Could you tell me what a normal week looks like for you?",
            endCondition: "a description of a typical week, tasks done independently and with help, who helps now, and two goals for the next year",
            voice: "verse",
          },
          client: {
            name: "Layla Nasser",
            role: "participant with low vision",
            goal: "You're 29 with low vision since birth. You live with your sister, who drives you to shopping and appointments on Saturdays. You cook simple meals and use a magnifier and phone apps. You find buses hard at night. Your goals: travel independently to the city, and start a community services course at TAFE next year.",
            demeanor: "cheerful, independent, a bit tired of explaining her vision",
            voice: "coral",
          },
          timeLimitMinutes: 5,
        },
        {
          title: "Two views at the plan review",
          description:
            "You're interpreting a plan review where a participant and their carer give different accounts of what's working. Keep each person's words distinct; don't merge them.",
          difficultyLevel: "intermediate",
          character: {
            name: "Natalie Young",
            role: "disability planner at Riverbend Support Planning",
            goal: "You're reviewing a year-old plan for a young man with an intellectual disability. You want to know how the 10 hours a week of community access support were used, what went well, what didn't, and goals for next year. The participant and his mother disagree about a day program. Ask the participant directly first, then the carer, and note both views. Explain that the participant's goals guide the plan.",
            demeanor: "respectful, structured, makes sure the participant speaks for himself",
            openingLine: "It's been a year since your plan started. I'd like to hear from you first: what have you enjoyed doing with your support worker?",
            endCondition: "how support hours were used, one thing that went well and one that didn't, the participant's goal for next year, and the carer's view on the day program",
            voice: "coral",
          },
          client: {
            name: "Pedro Lopes",
            role: "participant attending his plan review",
            goal: "You're 22 with an intellectual disability. You love going to the gym and the footy with your support worker, Jake. You hate the day program because it's boring and full of older people. Your goal is a part-time job at a cafe. You get annoyed when people talk about you instead of to you, and say so.",
            demeanor: "friendly, direct, simple sentences, protests when talked over",
            voice: "ash",
          },
          timeLimitMinutes: 7,
        },
        {
          title: "A worrying support worker and a change of provider",
          description:
            "You're interpreting a meeting where a participant wants to change providers after a worrying incident with a support worker. Safety, complaint steps and choices all need careful, exact rendering.",
          difficultyLevel: "advanced",
          character: {
            name: "Ravi Menon",
            role: "support coordinator at Clearwater Coordination Services",
            goal: "The participant wants to leave Brightpath Care after an incident. You need what happened, the date, the worker's name, whether they were hurt or anything was taken, and whether they've told anyone. Treat it seriously; explain you must report safety concerns and ask for consent to lodge a complaint. Help pick a new provider; two have availability: Sunrise Supports and Coastal Care. Don't pressure; confirm what they want.",
            demeanor: "serious, calm, careful with words, explains each step and asks permission",
            openingLine: "You mentioned on the phone that something happened with one of your support workers. I'm here to listen. Can you tell me what happened?",
            endCondition: "what happened and when, the worker's name, any injury or missing items, consent to lodge a complaint, and which new provider the participant chooses",
            voice: "cedar",
          },
          client: {
            name: "Zainab Ali",
            role: "participant who uses a wheelchair",
            goal: "You're 41 and use a wheelchair. On Thursday 25 September, a worker called Craig was rough moving you into bed, shouted, and you later noticed $80 missing from your purse. You weren't hurt badly but have a bruise on your arm. You haven't told anyone, worried about losing support. You want a female worker and choose Sunrise Supports, but hesitate about a formal complaint.",
            demeanor: "quiet, shaken, hesitant, mistrustful, gains confidence when reassured",
            voice: "shimmer",
          },
          timeLimitMinutes: 8,
        },
      ],
    },

    // ---- 10. Roleplay: briefings and boundaries ------------------------------
    {
      slug: "interpreter-briefings-and-boundaries",
      kind: "roleplay",
      title: "Interpreter Briefings and Boundaries",
      tagline: "Practise the parts of the job outside the dialogue: briefings, boundaries and saying no politely.",
      description:
        "Good interpreting starts before the first sentence and includes the moments when someone asks you to step outside your role. This course is for community interpreters and students who want to practise the professional conversations around a session, not the interpreting itself. You play the interpreter. The first scenario is a short pre-session briefing with a social worker, where you introduce yourself, explain how you'll work, and ask what you need to know. The second is a client who catches you after an appointment and asks for advice, your phone number and a lift home. The third is a busy case manager who asks you to just summarise, to wait alone with the client, and to say whether the client is telling the truth. Each scenario tests clear, polite, firm language that protects everyone in the room, including you.",
      keywords: ["interpreter ethics", "professional boundaries", "pre-session briefing", "role clarity", "community interpreting"],
      whatYouGet: [
        "Three boundary conversations, from a routine briefing to pushback from a busy professional",
        "Practice explaining first-person interpreting, confidentiality and impartiality in plain words",
        "Ready-to-use ways to decline requests for advice, favours or summaries politely",
        "Confidence handling pressure without damaging the working relationship",
      ],
      audience: "Community interpreters and interpreting students who want practice with ethics and role boundaries.",
      bannerBrief:
        "A black-and-white portrait of an interpreter standing in a corridor between two closed doors, a teal line on the floor marking where they stand.",
      scenarios: [
        {
          title: "Briefing before the session",
          description:
            "You're the interpreter arriving for an appointment with a hospital social worker. Introduce yourself, explain how you'll work, and ask what you need to know before the client comes in.",
          difficultyLevel: "beginner",
          character: {
            name: "Megan Collins",
            role: "social worker at Lakeside Hospital",
            goal: "You're about to meet a client about discharge support after a hip operation, and an interpreter has just arrived. You're friendly and happy to be briefed. You'll mention the meeting is about 30 minutes, covers home help and transport, and the client's daughter may join. Ask how the interpreter likes to work. If they explain first-person interpreting and confidentiality, say that's great. Only share the client's name if asked.",
            demeanor: "friendly, open, a bit rushed, appreciates clear explanations",
            endCondition: "the learner has introduced themselves, explained first-person interpreting and confidentiality, and asked about the purpose and length of the meeting",
            voice: "sage",
          },
          learnerRole: "community interpreter booked for the session",
          taskCard:
            "- Introduce yourself and say you're the interpreter for this appointment\n- Explain you'll interpret everything in the first person and keep it confidential\n- Ask what the meeting is about, how long it will take and who will be there\n- Ask whether there are any terms or sensitive topics you should know about",
          learnerOpens: true,
          timeLimitMinutes: 5,
        },
        {
          title: "Advice, a phone number and a lift home",
          description:
            "The appointment is over and the client catches you in the corridor. They ask for advice, your number and a lift home; decline each request politely and point them to the right help.",
          difficultyLevel: "intermediate",
          character: {
            name: "Nadia Karim",
            role: "client who has just finished a housing appointment",
            goal: "You've just finished a housing appointment and you trust the interpreter more than the officer. You ask whether you should sign the new lease the officer mentioned. Then you ask for the interpreter's phone number so you can call when letters arrive. Finally you ask for a lift home to Fairfield because it's raining and the bus takes an hour. Push gently on each, saying 'you're like family'. Accept polite answers that point you to the officer or a service.",
            demeanor: "warm, grateful, persistent in a friendly way, slightly hurt by a no",
            endCondition: "the learner has declined to give advice, their phone number and a lift, and suggested where the client can get help instead",
            voice: "shimmer",
          },
          learnerRole: "community interpreter leaving the appointment",
          taskCard:
            "- Respond warmly but don't give advice about the lease\n- Suggest the client ask the housing officer or a tenancy service instead\n- Decline to give your personal phone number and explain how to book an interpreter\n- Decline the lift home politely without damaging the relationship",
          learnerOpens: false,
          timeLimitMinutes: 6,
        },
        {
          title: "\"Just give me the gist\"",
          description:
            "You're about to interpret a case review with a busy case manager who asks you to just summarise, to wait alone with the client, and to say whether the client is honest. Hold your boundaries without losing the relationship.",
          difficultyLevel: "advanced",
          character: {
            name: "Greg Thompson",
            role: "case manager at Metro Family Services",
            goal: "You're behind schedule with a 20-minute slot. You ask the interpreter to just give you the gist of what the client says. Next you say you need to step out for ten minutes and ask them to wait with the client and 'have a chat'. Then you ask whether, in their opinion, the client is telling the truth. Push back on each refusal once, saying it's how other interpreters do it. Accept clear, polite explanations.",
            demeanor: "harried, blunt, not unkind, used to getting his way, respects confidence",
            endCondition: "the learner has explained why they interpret everything, declined to stay alone with the client and declined to judge honesty, and the case manager agrees to proceed",
            voice: "ash",
          },
          learnerRole: "community interpreter at a case review",
          taskCard:
            "- Explain politely why you interpret everything said rather than summarising\n- Decline to stay alone with the client and suggest an alternative\n- Decline to give your opinion on whether the client is telling the truth\n- Keep it brief and professional so the session can start on time",
          learnerOpens: false,
          timeLimitMinutes: 8,
        },
      ],
    },
  ],
};
