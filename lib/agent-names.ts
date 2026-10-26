/**
 * Per-language names for AI characters (D-045), shared by Convex (grading, migration)
 * and the UI (practice room, admin editor). Keep framework-free.
 *
 * A character can have a name for each practice language. When the session is held in
 * that language (the pair's non-English side), the character uses it, and every mention
 * of the authored name in the scenario's text is swapped too, so prompts, briefing and
 * grading agree. English-only sessions and languages without a name keep the authored one.
 */

export type LocalizedName = { language: string; name: string };

export type Gender = "female" | "male";

type NamedAgent = { name?: string; role?: string; voice?: string; localizedNames?: LocalizedName[] };

const FEMALE_VOICES = new Set(["marin", "coral", "sage", "shimmer"]);
const MALE_VOICES = new Set(["cedar", "ash", "ballad", "verse", "echo"]);

/** The character's gender as their voice presents it; null for neutral voices. */
export function genderForVoice(voice: string | undefined): Gender | null {
  const key = (voice ?? "").trim().toLowerCase();
  if (FEMALE_VOICES.has(key)) return "female";
  if (MALE_VOICES.has(key)) return "male";
  return null;
}

const sameLanguage = (a: string | undefined, b: string | undefined) =>
  Boolean(a && b && a.trim().toLowerCase() === b.trim().toLowerCase());

export function isEnglishLanguage(language: string | undefined) {
  return sameLanguage(language, "English");
}

/** The name this character uses in a session held in `language`. */
export function nameForLanguage(agent: NamedAgent, language: string | undefined) {
  const localized = agent.localizedNames?.find((entry) => sameLanguage(entry.language, language))?.name.trim();
  return localized || agent.name || agent.role || "";
}

const LETTER = "\\p{L}\\p{M}";

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceWord(text: string, from: string, to: string) {
  if (!from || from === to) return text;
  return text.replace(new RegExp(`(?<![${LETTER}])${escapeRegExp(from)}(?![${LETTER}])`, "gu"), to);
}

type Swap = { from: string; to: string };

/**
 * Full name first, then given and family names on their own ("Ana", "Ms Torres"),
 * skipping any part that also belongs to another character's name.
 */
function swapsFor(authored: string, localized: string, protectedParts: Set<string>): Swap[] {
  const swaps: Swap[] = [{ from: authored, to: localized }];
  const fromParts = authored.split(/\s+/).filter(Boolean);
  const toParts = localized.split(/\s+/).filter(Boolean);
  if (fromParts.length >= 2 && toParts.length >= 2) {
    const pairs: Array<[string, string]> = [
      [fromParts[0], toParts[0]],
      [fromParts[fromParts.length - 1], toParts[toParts.length - 1]],
    ];
    for (const [from, to] of pairs) {
      if (from.length >= 2 && !protectedParts.has(from.toLowerCase())) swaps.push({ from, to });
    }
  }
  return swaps;
}

/** Keys whose values are identifiers or settings, never prose. */
const NON_PROSE_KEYS = new Set([
  "id",
  "moduleId",
  "voice",
  "avatarImageUrl",
  "avatarStorageId",
  "language",
  "sourceLanguage",
  "targetLanguage",
  "practiceType",
  "openingSpeaker",
  "localizedNames",
  "_id",
  "_creationTime",
]);

function mapProse(value: unknown, swap: (text: string) => string): unknown {
  if (typeof value === "string") return swap(value);
  if (Array.isArray(value)) return value.map((item) => mapProse(item, swap));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, NON_PROSE_KEYS.has(key) ? item : mapProse(item, swap)]),
    );
  }
  return value;
}

/**
 * The scenario as it should play in a session held in `language`: characters with a
 * name for that language take it, and the authored names in the text follow.
 */
export function localizeScenarioNames<T extends { aiAgentA: NamedAgent; aiAgentB?: NamedAgent }>(
  scenario: T,
  language: string | undefined,
): T {
  if (!language || isEnglishLanguage(language)) return scenario;

  const agents = [scenario.aiAgentA, scenario.aiAgentB].filter((agent): agent is NamedAgent => Boolean(agent));
  const renamed = agents
    .map((agent) => ({ agent, authored: agent.name?.trim() ?? "", localized: nameForLanguage(agent, language).trim() }))
    .filter(({ authored, localized }) => authored && localized && authored !== localized);
  if (renamed.length === 0) return scenario;

  const swaps = renamed.flatMap(({ agent, authored, localized }) => {
    const others = agents.filter((other) => other !== agent);
    const protectedParts = new Set(
      others.flatMap((other) => [other.name ?? "", nameForLanguage(other, language)]).flatMap((name) => name.toLowerCase().split(/\s+/)),
    );
    return swapsFor(authored, localized, protectedParts);
  });
  // Placeholders stop a name that's swapped in from being swapped again.
  const swap = (text: string) => {
    let out = text;
    swaps.forEach(({ from }, index) => {
      out = replaceWord(out, from, `\u0000${index}\u0000`);
    });
    return out.replace(/\u0000(\d+)\u0000/g, (_, index: string) => swaps[Number(index)].to);
  };

  return mapProse(scenario, swap) as T;
}

// ---- Name bank ------------------------------------------------------------------------
// Common, everyday given + family names for each practice language, as someone from that
// community living in Australia would introduce themselves (given name first, romanised).
// Family names take the feminine form where the language has one (Greek, Russian).

export const NAME_BANK: Record<string, Record<Gender, string[]>> = {
  Arabic: {
    female: ["Layla Haddad", "Mariam Khalil", "Noor Saleh", "Rania Mansour", "Huda Nasser", "Samira Aziz", "Dalia Hamdan", "Yasmin Farah", "Amal Barakat", "Salma Youssef"],
    male: ["Omar Khalil", "Ahmad Haddad", "Karim Mansour", "Youssef Nasser", "Tariq Saleh", "Bilal Hamdan", "Khaled Farah", "Sami Barakat", "Hassan Aziz", "Mahmoud Darwish"],
  },
  Bangla: {
    female: ["Nusrat Rahman", "Farzana Akter", "Sharmin Islam", "Tahmina Begum", "Rumana Hossain", "Sabina Chowdhury", "Nasrin Ahmed", "Mitu Das", "Shirin Karim", "Ritu Saha"],
    male: ["Tanvir Hossain", "Rafiq Islam", "Shahid Rahman", "Kamal Uddin", "Arif Chowdhury", "Sumon Das", "Masud Karim", "Habib Ahmed", "Jamal Mia", "Rana Saha"],
  },
  Cantonese: {
    female: ["Ka-yan Chan", "Mei-ling Wong", "Wing-sze Lee", "Suk-fan Cheung", "Hoi-yan Lam", "Siu-wai Ho", "Man-yee Leung", "Yuk-ling Ng", "Pui-shan Tse", "Lai-ming Yip"],
    male: ["Chi-keung Wong", "Ka-ho Chan", "Wai-man Lee", "Kwok-wing Cheung", "Siu-ming Lam", "Chun-kit Ho", "Hon-wah Leung", "Tak-shing Ng", "Kin-fai Tse", "Yiu-wing Yip"],
  },
  Dari: {
    female: ["Fatima Ahmadi", "Zahra Karimi", "Maryam Rahimi", "Nargis Hakimi", "Shabnam Noori", "Parwana Sultani", "Freshta Haidari", "Mursal Wardak", "Laila Jalali", "Sima Popal"],
    male: ["Ahmad Karimi", "Mohammad Rahimi", "Abdul Hakimi", "Farid Ahmadi", "Jawad Noori", "Najib Sultani", "Hamid Haidari", "Wahid Wardak", "Rahim Jalali", "Zabihullah Popal"],
  },
  Filipino: {
    female: ["Maricel Santos", "Rowena Reyes", "Jocelyn Cruz", "Analyn Bautista", "Liza Garcia", "Cristina Mendoza", "Rosalie Villanueva", "Marites Ramos", "Joy Aquino", "Lorna Castillo"],
    male: ["Mark Bautista", "Jomar Santos", "Rodel Reyes", "Arnel Cruz", "Ramon Garcia", "Jun Mendoza", "Rommel Villanueva", "Noel Ramos", "Dennis Aquino", "Ricardo Castillo"],
  },
  French: {
    female: ["Camille Dubois", "Claire Martin", "Sophie Bernard", "Élodie Moreau", "Isabelle Laurent", "Nathalie Girard", "Juliette Lefebvre", "Amélie Fournier", "Céline Roux", "Margaux Petit"],
    male: ["Julien Lefebvre", "Thomas Moreau", "Nicolas Bernard", "Antoine Dubois", "Pierre Laurent", "Mathieu Girard", "Olivier Martin", "Sébastien Fournier", "Laurent Roux", "Guillaume Petit"],
  },
  German: {
    female: ["Katrin Müller", "Anna Schneider", "Julia Fischer", "Sabine Weber", "Laura Becker", "Claudia Hoffmann", "Lena Schulz", "Monika Wagner", "Stefanie Koch", "Petra Richter"],
    male: ["Stefan Schneider", "Thomas Müller", "Michael Fischer", "Andreas Weber", "Jan Becker", "Markus Hoffmann", "Tobias Schulz", "Klaus Wagner", "Felix Koch", "Jürgen Richter"],
  },
  Greek: {
    female: ["Eleni Papadopoulou", "Maria Georgiou", "Sofia Nikolaou", "Katerina Dimitriou", "Despina Konstantinou", "Vasiliki Ioannou", "Anna Christodoulou", "Georgia Papadaki", "Irene Antoniou", "Dimitra Vlachou"],
    male: ["Giorgos Papadopoulos", "Nikos Georgiou", "Kostas Nikolaou", "Dimitris Konstantinou", "Yannis Ioannou", "Christos Dimitriou", "Andreas Christodoulou", "Michalis Papadakis", "Stavros Antoniou", "Panagiotis Vlachos"],
  },
  Gujarati: {
    female: ["Hetal Patel", "Nisha Shah", "Komal Desai", "Bhavna Mehta", "Jignasha Joshi", "Rupal Trivedi", "Krupa Pandya", "Falguni Parikh", "Dipali Modi", "Mittal Chauhan"],
    male: ["Jignesh Shah", "Hitesh Patel", "Ketan Desai", "Nilesh Mehta", "Bhavesh Joshi", "Chirag Trivedi", "Paresh Pandya", "Mehul Parikh", "Rakesh Modi", "Kalpesh Chauhan"],
  },
  "Haitian Creole": {
    female: ["Mirlande Joseph", "Nadège Pierre", "Rose-Marie Jean", "Guerline Louis", "Fabienne Charles", "Wideline Baptiste", "Marie-Claude Étienne", "Sandra Augustin", "Ketly Dorsainvil", "Viviane Desir"],
    male: ["Jean-Claude Pierre", "Wilner Joseph", "Fritz Jean", "Jacques Louis", "Ronald Charles", "Emmanuel Baptiste", "Wilson Étienne", "Patrick Augustin", "Junior Dorsainvil", "Frantz Desir"],
  },
  Hindi: {
    female: ["Priya Sharma", "Neha Gupta", "Pooja Verma", "Anjali Singh", "Sunita Yadav", "Kavita Mishra", "Ritu Agarwal", "Meena Tiwari", "Shalini Saxena", "Deepa Chauhan"],
    male: ["Rahul Verma", "Amit Sharma", "Vikas Gupta", "Sanjay Singh", "Rajesh Yadav", "Manoj Mishra", "Anil Agarwal", "Deepak Tiwari", "Rohit Saxena", "Sunil Chauhan"],
  },
  Indonesian: {
    female: ["Dewi Lestari", "Siti Rahayu", "Rina Wulandari", "Ayu Puspitasari", "Fitri Handayani", "Indah Permata", "Wulan Sari", "Lestari Utami", "Ratna Kusuma", "Novi Anggraini"],
    male: ["Budi Santoso", "Agus Setiawan", "Hendra Wijaya", "Rizky Pratama", "Joko Susilo", "Andi Saputra", "Dedi Kurniawan", "Eko Prasetyo", "Bambang Hartono", "Arif Hidayat"],
  },
  Italian: {
    female: ["Giulia Rossi", "Francesca Bianchi", "Chiara Romano", "Sara Colombo", "Elena Ricci", "Valentina Marino", "Alessandra Greco", "Paola Conti", "Federica Esposito", "Martina Ferrari"],
    male: ["Marco Bianchi", "Luca Rossi", "Giuseppe Romano", "Alessandro Colombo", "Matteo Ricci", "Francesco Marino", "Davide Greco", "Stefano Conti", "Antonio Esposito", "Paolo Ferrari"],
  },
  Japanese: {
    female: ["Yuki Tanaka", "Aiko Suzuki", "Haruka Sato", "Megumi Takahashi", "Naomi Watanabe", "Emi Ito", "Sakura Yamamoto", "Mai Nakamura", "Keiko Kobayashi", "Yumi Kato"],
    male: ["Haruto Sato", "Takeshi Tanaka", "Kenji Suzuki", "Hiroshi Takahashi", "Daisuke Watanabe", "Yusuke Ito", "Shota Yamamoto", "Kazuki Nakamura", "Ryo Kobayashi", "Takumi Kato"],
  },
  Korean: {
    female: ["Ji-yeon Kim", "Min-ji Lee", "Seo-yeon Park", "Eun-ji Choi", "Hye-jin Jung", "Soo-jin Kang", "Ji-hye Cho", "Yoon-ah Yoon", "Da-eun Jang", "Hyun-joo Lim"],
    male: ["Min-jun Park", "Ji-hoon Kim", "Hyun-woo Lee", "Seung-ho Choi", "Dong-hyun Jung", "Jae-won Kang", "Sung-min Cho", "Tae-yang Yoon", "Woo-jin Jang", "Joon-young Lim"],
  },
  Malay: {
    female: ["Siti Aminah", "Nurul Huda", "Aisyah Rahman", "Farah Ismail", "Nor Azizah", "Zulaikha Hassan", "Salmah Yusof", "Hafizah Osman", "Aminah Ibrahim", "Liyana Abdullah"],
    male: ["Ahmad Faizal", "Mohd Hafiz", "Azman Ismail", "Hakim Rahman", "Zulkifli Hassan", "Faris Yusof", "Ikhwan Osman", "Amirul Ibrahim", "Syafiq Abdullah", "Razak Ahmad"],
  },
  Malayalam: {
    female: ["Anjali Nair", "Lakshmi Menon", "Divya Pillai", "Sreeja Kurup", "Anitha Varghese", "Reshma Thomas", "Bindu Joseph", "Smitha George", "Asha Krishnan", "Neethu Mathew"],
    male: ["Arun Menon", "Rajeev Nair", "Suresh Pillai", "Vinod Kurup", "Biju Varghese", "Jijo Thomas", "Shibu Joseph", "Anoop George", "Sanjay Krishnan", "Jobin Mathew"],
  },
  Mandarin: {
    female: ["Fang Wang", "Xiaoyan Zhang", "Xiaoling Liu", "Mei Chen", "Jing Yang", "Hui Zhao", "Yan Huang", "Lin Zhou", "Xue Wu", "Ying Xu"],
    male: ["Wei Zhang", "Jun Li", "Hao Wang", "Lei Liu", "Qiang Chen", "Bo Yang", "Ming Zhao", "Tao Huang", "Jian Zhou", "Yong Wu"],
  },
  Nepali: {
    female: ["Sita Gurung", "Sunita Shrestha", "Anita Thapa", "Gita Adhikari", "Puja Tamang", "Sarita Rai", "Kamala Magar", "Bimala Karki", "Rekha Poudel", "Sabina Bhandari"],
    male: ["Bikash Shrestha", "Ramesh Thapa", "Suman Gurung", "Hari Adhikari", "Dipesh Tamang", "Prakash Rai", "Kiran Magar", "Santosh Karki", "Anil Poudel", "Rajendra Bhandari"],
  },
  Persian: {
    female: ["Maryam Hosseini", "Fatemeh Mohammadi", "Zahra Rezaei", "Narges Karimi", "Leila Ahmadi", "Shirin Moradi", "Parisa Jafari", "Neda Hashemi", "Mina Sadeghi", "Roya Ebrahimi"],
    male: ["Reza Mohammadi", "Ali Hosseini", "Mehdi Rezaei", "Hossein Karimi", "Amir Ahmadi", "Saeed Moradi", "Hamid Jafari", "Babak Hashemi", "Mohsen Sadeghi", "Kaveh Ebrahimi"],
  },
  Portuguese: {
    female: ["Juliana Oliveira", "Ana Souza", "Fernanda Lima", "Camila Pereira", "Patrícia Costa", "Mariana Rodrigues", "Luciana Almeida", "Beatriz Carvalho", "Renata Ferreira", "Gabriela Ribeiro"],
    male: ["Rafael Santos", "João Oliveira", "Lucas Souza", "Bruno Lima", "Felipe Pereira", "Rodrigo Costa", "Thiago Rodrigues", "Marcelo Almeida", "Gustavo Carvalho", "Eduardo Ferreira"],
  },
  Punjabi: {
    female: ["Harpreet Kaur", "Manpreet Sandhu", "Simran Gill", "Jaspreet Dhillon", "Navneet Grewal", "Gurleen Sidhu", "Rajwinder Kaur", "Amandeep Brar", "Kiranjit Bains", "Sukhpreet Randhawa"],
    male: ["Gurpreet Singh", "Harjit Sandhu", "Jaspal Gill", "Manjit Dhillon", "Baljit Grewal", "Sukhwinder Sidhu", "Kulwant Singh", "Amrik Brar", "Paramjit Bains", "Rajinder Randhawa"],
  },
  Russian: {
    female: ["Olga Ivanova", "Natalia Smirnova", "Elena Kuznetsova", "Tatiana Popova", "Irina Sokolova", "Svetlana Volkova", "Anastasia Morozova", "Yulia Lebedeva", "Ekaterina Novikova", "Marina Fedorova"],
    male: ["Dmitry Petrov", "Sergei Ivanov", "Alexei Smirnov", "Andrei Kuznetsov", "Mikhail Popov", "Ivan Sokolov", "Nikolai Volkov", "Pavel Morozov", "Vladimir Lebedev", "Yuri Novikov"],
  },
  Sinhala: {
    female: ["Nimali Perera", "Dilini Fernando", "Chamari Silva", "Sanduni Jayasinghe", "Ishara Wickramasinghe", "Thilini Gunawardena", "Malani Bandara", "Hasini Dissanayake", "Nadeesha Rajapaksa", "Kumudu Herath"],
    male: ["Kasun Fernando", "Nuwan Perera", "Chaminda Silva", "Ruwan Jayasinghe", "Lahiru Wickramasinghe", "Tharindu Gunawardena", "Sampath Bandara", "Asanka Dissanayake", "Dinesh Rajapaksa", "Pradeep Herath"],
  },
  Spanish: {
    female: ["Lucía García", "Carmen Rodríguez", "María López", "Ana Martínez", "Rosa Sánchez", "Isabel Gómez", "Elena Torres", "Patricia Ramírez", "Marta Flores", "Sofía Herrera"],
    male: ["Javier Martínez", "Carlos García", "Miguel López", "José Rodríguez", "Luis Sánchez", "Jorge Gómez", "Diego Torres", "Sergio Ramírez", "Manuel Flores", "Pablo Herrera"],
  },
  Tamil: {
    female: ["Lakshmi Subramaniam", "Priya Rajan", "Kavitha Krishnan", "Meena Murugan", "Divya Shankar", "Anitha Raman", "Revathi Kumar", "Sangeetha Selvam", "Malathi Arumugam", "Vani Natarajan"],
    male: ["Karthik Rajan", "Senthil Kumar", "Arun Subramaniam", "Prakash Murugan", "Vijay Krishnan", "Ganesh Shankar", "Ramesh Raman", "Suresh Selvam", "Bala Arumugam", "Mohan Natarajan"],
  },
  Telugu: {
    female: ["Sravani Reddy", "Lakshmi Rao", "Swathi Naidu", "Padma Chowdary", "Bhavani Varma", "Sirisha Goud", "Haritha Prasad", "Anusha Raju", "Madhavi Babu", "Keerthi Murthy"],
    male: ["Venkatesh Rao", "Srinivas Reddy", "Ravi Naidu", "Suresh Chowdary", "Krishna Varma", "Naresh Goud", "Mahesh Prasad", "Prasad Raju", "Ramesh Babu", "Kiran Murthy"],
  },
  Thai: {
    female: ["Siriporn Chaiyaporn", "Nattaya Somboon", "Pornthip Wongsa", "Kanokwan Srisuk", "Malee Thongdee", "Wanida Boonmee", "Suda Rattanakul", "Ploy Saetang", "Jintana Kaewkla", "Arunee Phongsak"],
    male: ["Somchai Wongsakul", "Anan Somboon", "Prasert Chaiyaporn", "Niran Srisuk", "Wichai Thongdee", "Thanawat Boonmee", "Kittisak Rattanakul", "Surachai Saetang", "Chaiwat Kaewkla", "Narong Phongsak"],
  },
  Turkish: {
    female: ["Elif Yılmaz", "Ayşe Kaya", "Zeynep Demir", "Fatma Şahin", "Emine Çelik", "Merve Yıldız", "Hatice Aydın", "Esra Öztürk", "Selin Arslan", "Derya Doğan"],
    male: ["Mehmet Demir", "Mustafa Yılmaz", "Ahmet Kaya", "Ali Şahin", "Hüseyin Çelik", "Emre Yıldız", "Murat Aydın", "Burak Öztürk", "Kemal Arslan", "Serkan Doğan"],
  },
  Urdu: {
    female: ["Ayesha Khan", "Fatima Qureshi", "Sana Malik", "Hina Butt", "Nadia Siddiqui", "Rabia Chaudhry", "Saima Iqbal", "Amna Raza", "Mehwish Hussain", "Zainab Shaikh"],
    male: ["Imran Qureshi", "Ali Khan", "Bilal Malik", "Usman Butt", "Faisal Siddiqui", "Asif Chaudhry", "Kamran Iqbal", "Hamza Raza", "Tariq Hussain", "Adnan Shaikh"],
  },
  Vietnamese: {
    female: ["Lan Nguyen", "Thu Tran", "Hoa Le", "Mai Pham", "Linh Hoang", "Ngoc Vu", "Huong Dang", "Trang Bui", "Thao Do", "Phuong Ngo"],
    male: ["Minh Tran", "Duc Nguyen", "Tuan Le", "Hung Pham", "Quang Hoang", "Long Vu", "Thanh Dang", "Khoa Bui", "Nam Do", "Hieu Ngo"],
  },
};

export const NAME_BANK_LANGUAGES = Object.keys(NAME_BANK);

/**
 * Suggested names for a character in every bank language. `slot` picks a different
 * name for different characters (e.g. their position in the course), so a course
 * doesn't reuse one name. `keep` keeps the authored name in languages it already fits.
 */
export function suggestLocalizedNames(gender: Gender, slot: number, keep?: { name: string; languages: string[] }): LocalizedName[] {
  return NAME_BANK_LANGUAGES.map((language) => {
    if (keep && keep.languages.some((candidate) => sameLanguage(candidate, language))) {
      return { language, name: keep.name };
    }
    const names = NAME_BANK[language][gender];
    return { language, name: names[((slot % names.length) + names.length) % names.length] };
  });
}

/** Spanish given names already used by authored characters, so those keep their name in Spanish sessions. */
const HISPANIC_GIVEN_NAMES = new Set(
  [
    "ana", "carmen", "jorge", "miguel", "javier", "rosa", "lucia", "lucía", "daniel", "jose", "josé", "luis", "elena",
    "monica", "mónica", "diego", "patricia", "sergio", "mariana", "carlos", "sofia", "sofía", "rosita", "marta", "maria", "maría",
  ],
);

/** Authored given names that already belong to another bank language. */
const GIVEN_NAME_LANGUAGES: Record<string, string> = {
  wei: "Mandarin",
  ravi: "Hindi",
  hoang: "Vietnamese",
  farida: "Arabic",
  samir: "Arabic",
};

/** Languages an authored name already suits, so it's kept for sessions in them. */
export function languagesNameSuits(name: string): string[] {
  const given = name.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  if (HISPANIC_GIVEN_NAMES.has(given)) return ["Spanish"];
  return GIVEN_NAME_LANGUAGES[given] ? [GIVEN_NAME_LANGUAGES[given]] : [];
}
