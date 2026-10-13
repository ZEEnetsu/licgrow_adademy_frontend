/**
 * Copy for the landing story.
 *
 * Every pair is `{ hi, en }`, resolved with `t()` from useLang. Wherever the
 * client's reference build (src/pages/site/index.html → src/content/generated)
 * already says something, the text here is copied from it verbatim, Hindi
 * included — only the chapter labels, annotations and a few button captions
 * are new, and those are written in both languages.
 *
 * Long-form detail (tables, charts, every accordion) is deliberately left on
 * the deep pages: /why-lic, /be-your-own-boss, /explore-india, /benefits,
 * /procedure, /bima-sakhi and /career. The landing tells the story and links.
 */

export const PHONE = { display: '9973055291', tel: 'tel:+919973055291' };
export const PHONE_2 = { display: '8825361848', tel: 'tel:+918825361848' };
export const EMAIL = 'lic.rohitlal@gmail.com';

export const COMMON = {
  callNow: { hi: 'अभी कॉल करें', en: 'Call now' },
  bookOrientation: { hi: 'करियर ओरिएंटेशन बुक करें', en: 'Book a career orientation' },
  illustrationOnly: { hi: 'केवल उदाहरण', en: 'Illustration only' },
  conditions: { hi: '*शर्तें लागू', en: '*Conditions apply' },
  effort: {
    hi: 'आपकी कमाई आपकी मेहनत और आपके द्वारा लाए गए बिज़नेस पर निर्भर करती है।',
    en: 'Your earnings depend on your effort and the business you bring.',
  },
  illustrationNote: {
    hi: 'केवल उदाहरण। वास्तविक कमीशन प्लान, अवधि, भरे गए प्रीमियम और LIC के लागू नियमों पर निर्भर करता है। आपकी कमाई आपकी मेहनत पर निर्भर है।',
    en: 'Illustration only. Actual commission depends on the plan, the term, the premium paid and the LIC rules in force. Your earnings depend on your effort.',
  },
};

/** Chapter ids, in scroll order — drives the chapter rail and the anchors. */
export const CHAPTERS = [
  { id: 'start', label: { hi: 'शुरुआत', en: 'Start' } },
  { id: 'boss', label: { hi: 'BOSS', en: 'BOSS' } },
  { id: 'dreams', label: { hi: 'सपने', en: 'Dreams' } },
  { id: 'opportunity', label: { hi: 'मौक़ा', en: 'Opportunity' } },
  { id: 'why-now', label: { hi: 'अभी क्यों', en: 'Why now' } },
  { id: 'market', label: { hi: 'बाज़ार', en: 'Market' } },
  { id: 'who', label: { hi: 'किसके लिए', en: 'Who it’s for' } },
  { id: 'paths', label: { hi: 'रास्ते', en: 'Paths' } },
  { id: 'goal', label: { hi: 'लक्ष्य', en: 'The goal' } },
  { id: 'join', label: { hi: 'कैसे जुड़ें', en: 'How to join' } },
  { id: 'explore', label: { hi: 'भारत घूमें', en: 'Explore India' } },
  { id: 'message', label: { hi: 'संदेश', en: 'Message' } },
  { id: 'faq', label: { hi: 'सवाल-जवाब', en: 'FAQ' } },
  { id: 'talk', label: { hi: 'बात करें', en: 'Talk to Rohit' } },
];

/* ── 0 · hero ──────────────────────────────────────────────────────────── */

export const HERO = {
  eyebrow: { hi: 'LIC एजेंसी · रोहित लाल के साथ', en: 'LIC Agency · with Rohit Lal' },
  title: {
    hi: 'क्या आप अपने BOSS ख़ुद बनना चाहते हैं?',
    en: 'Do you want to be your BOSS?',
  },
  lede: {
    hi: 'भरोसेमंद नाम के साथ, अपना ख़ुद का बिज़नेस। समय आप तय करें, रफ़्तार आपकी मेहनत तय करे।',
    en: 'Your own business, under a trusted name. You set the hours. Your effort sets the pace.',
  },
  cta: { hi: 'LIC एजेंट बनिए', en: 'Join as an LIC Agent' },
  note: { hi: 'न पूँजी, न उम्र की ऊपरी सीमा।', en: 'No capital. No upper age limit.' },
  facts: [
    { hi: '18+ उम्र', en: 'Age 18+' },
    { hi: '12वीं पास', en: '12th pass' },
    { hi: 'पुरुष और महिलाएँ', en: 'Men & women' },
  ],
  tabs: [
    { id: 'goal', label: { hi: 'लक्ष्य', en: 'The goal' } },
    { id: 'plan', label: { hi: 'योजना', en: 'The plan' } },
    { id: 'path', label: { hi: 'रास्ता', en: 'The path' } },
    { id: 'ladder', label: { hi: 'क्लब', en: 'The ladder' } },
  ],
  chips: [
    { hi: 'पूँजी की ज़रूरत नहीं', en: 'No capital needed' },
    { hi: 'रॉयल्टी आय', en: 'Royalty income' },
  ],
  card: {
    name: { hi: 'रोहित लाल', en: 'Rohit Lal' },
    role: { hi: 'डेवलपमेंट ऑफिसर, LIC', en: 'Development Officer, LIC' },
    goalLabel: { hi: 'हर एजेंट के लिए लक्ष्य', en: 'Goal for every agent' },
    goalValue: '₹1,00,000',
    goalUnit: { hi: 'प्रति माह', en: 'a month' },
    goalWhen: { hi: 'साल 3 के अंत तक', en: 'by the end of year 3' },
    apply: { hi: 'आवेदन करें', en: 'Apply' },
  },
};

/* ── 1 · BOSS ──────────────────────────────────────────────────────────── */

export const BOSS = {
  eyebrow: { hi: 'BOSS का मतलब', en: 'What BOSS stands for' },
  rows: [
    { letter: 'B', rest: 'usiness' },
    { letter: 'O', rest: 'wnership' },
    { letter: 'S', rest: 'elf' },
    { letter: 'S', rest: 'ufficiency' },
  ],
  meaning: {
    hi: 'यानी — अपना बिज़नेस, अपना मालिकाना हक़, अपने दम पर आत्मनिर्भरता।',
    en: 'Your own business, your own ownership, standing on your own feet.',
  },
  quote: {
    hi: '“अगर आप अपना सपना नहीं बनाएँगे, तो कोई और आपको अपना सपना बनाने के लिए नौकरी पर रख लेगा।”',
    en: '“If you don’t build your dream, someone else will hire you to help them build theirs.”',
  },
  band: {
    hi: 'मैं एक उद्यमी हूँ। मैं अपना साम्राज्य बना रहा हूँ। मैं अपनी क़िस्मत का मालिक हूँ।',
    en: 'I am an entrepreneur. I am building my empire. I am the master of my destiny.',
  },
};

/* ── 2 · dreams ────────────────────────────────────────────────────────── */

export const DREAMS = {
  eyebrow: { hi: 'अगर आपके सपने हैं…', en: 'If you have dreams…' },
  prompt: {
    hi: 'एक पल के लिए आँखें बंद कीजिए। आपके और आपके परिवार के लिए अच्छी ज़िंदगी कैसी दिखती है?',
    en: 'Close your eyes for a moment. What does a good life look like for you and your family?',
  },
  items: [
    { icon: 'house', art: 'bungalow', tone: 'peach', text: { hi: 'एक बंगला', en: 'A bungalow' } },
    { icon: 'car', art: 'car', tone: 'mint', text: { hi: 'एक कार', en: 'A car' } },
    { icon: 'office', art: 'office', tone: 'sand', text: { hi: 'आपका अपना ऑफिस', en: 'Your own office' } },
    { icon: 'globe', art: 'trips', tone: 'plum', text: { hi: 'परिवार के साथ विदेश यात्राएँ', en: 'Foreign trips with your family' } },
    { icon: 'sun', art: 'retired', tone: 'sage', text: { hi: 'रिटायरमेंट के बाद शानदार ज़िंदगी', en: 'A great retired life' } },
    { icon: 'coins', art: 'money', tone: 'ember', text: { hi: '…और हाथ में भरपूर पैसा', en: '…with plenty of money' } },
  ],
};

/* ── 3 · opportunity ───────────────────────────────────────────────────── */

export const OPPORTUNITY = {
  eyebrow: { hi: 'यही है असली मौक़ा', en: 'Here is THE opportunity' },
  title: {
    hi: 'LIC एजेंसी — एक ऐसा पेशा जिसकी कोई सीमा नहीं',
    en: 'LIC agency — a profession with no limits',
  },
  lines: [
    {
      hi: 'आप कितना कमा सकते हैं, इसकी कोई ऊपरी सीमा नहीं — सीमा आपकी मेहनत तय करती है।',
      en: 'There is no upper limit on what you can earn — your effort sets the ceiling.',
    },
    {
      hi: 'नौकरी में आपकी तरक्की कोई और तय करता है। यहाँ उसे वे परिवार तय करते हैं, जिनकी आप सेवा करते हैं।',
      en: 'In a job, someone else decides your raise. Here, the number of families you serve decides it.',
    },
  ],
  dreamsLabel: { hi: 'सपने, जिनके लिए LIC एजेंट मेहनत करते हैं', en: 'Dreams LIC agents work towards' },
  dreams: [
    { hi: 'असीमित आय', en: 'Unlimited income' },
    { hi: 'अंतरराष्ट्रीय पहचान', en: 'International status' },
    { hi: 'दोपहिया या चारपहिया वाहन', en: 'A two-wheeler or four-wheeler' },
    { hi: 'काम से संतोष', en: 'Job satisfaction' },
    { hi: 'सपनों का घर', en: 'Your dream house' },
    { hi: 'ऐसी पेंशन, जो अगली पीढ़ी तक पहुँचे', en: 'A pension that reaches the next generation' },
    { hi: 'सपनों का ऑफिस', en: 'Your dream office' },
    { hi: 'देश की सेवा', en: 'Helping the nation' },
    { hi: 'समाज में सम्मान', en: 'Status in society' },
    { hi: 'सुकून भरी ज़िंदगी', en: 'A peaceful life' },
  ],
  givesLabel: { hi: 'यह पेशा आपको क्या देता है', en: 'What this profession gives you' },
  gives: [
    { hi: 'अपना समय, अपनी मर्ज़ी', en: 'Your own timings' },
    { hi: 'असीमित आय', en: 'Unlimited income' },
    { hi: 'कोई ऊपरी सीमा नहीं', en: 'No ceiling' },
    { hi: 'समाज में रुतबा', en: 'Social status' },
    { hi: 'कोई सरहद नहीं', en: 'No boundaries' },
    { hi: 'एक सच्चा पेशेवर', en: 'A true professional' },
    { hi: 'जनसंपर्क', en: 'Public relations' },
    { hi: 'काम का सच्चा संतोष', en: 'Real job satisfaction' },
    { hi: '100% व्हाइट मनी', en: '100% white money' },
  ],
  noCapital: {
    title: { hi: 'कोई पूँजी नहीं चाहिए — बस आप', en: 'No capital required — just you' },
    body: {
      hi: 'बस चाहिए एक मुस्कान, दो मीठे बोल, थोड़ी भाग-दौड़ और कमाने की सच्ची लगन।',
      en: 'All you need is a smile, a few good words, a little physical work and a strong thirst for earning.',
    },
  },
};

/* ── 4 · why now ───────────────────────────────────────────────────────── */

const SRC_FIELD = {
  hi: 'स्रोत: LIC फ़ील्ड ट्रेनिंग सामग्री, 2023-24 के आँकड़े।',
  en: 'Source: LIC field training material, 2023-24 data.',
};

export const WHY_NOW = {
  eyebrow: { hi: 'अभी क्यों?', en: 'Why now?' },
  title: { hi: 'चार आँकड़ों में पूरी बात', en: 'Four numbers that explain it' },
  hint: { hi: 'आगे स्क्रॉल कीजिए', en: 'Keep scrolling' },
  stats: [
    {
      value: 83,
      suffix: '%',
      tone: 'ink',
      body: {
        hi: 'भारत में जीवन बीमा का सुरक्षा अंतर (प्रोटेक्शन गैप)। परिवारों को जितने बीमा की ज़रूरत है, उसका ज़्यादातर हिस्सा अभी है ही नहीं — यहीं सलाहकार काम आता है।',
        en: 'India’s life-insurance protection gap. Most of the cover families need is still missing — that gap is where an advisor helps.',
      },
      source: SRC_FIELD,
      link: { to: '/why-lic', label: { hi: 'यह क्यों मायने रखता है →', en: 'Why this matters →' } },
    },
    {
      prefix: '₹',
      value: 1197438,
      unit: { hi: 'करोड़', en: 'crore' },
      tone: 'peach',
      body: {
        hi: 'वित्त वर्ष 2024-25 में भारत के पूरे बीमा उद्योग का कुल प्रीमियम। अकेले LIC का लगभग ₹4.88 लाख करोड़ — बाकी हर बीमा कंपनी से बहुत आगे।',
        en: 'Combined premium of India’s insurance industry in FY 2024-25. LIC alone: about ₹4.88 lakh crore — far ahead of every other insurer.',
      },
      source: { hi: 'स्रोत: IRDAI वार्षिक रिपोर्ट 2024-25।', en: 'Source: IRDAI Annual Report 2024-25.' },
      link: { to: '/why-lic', label: { hi: 'बाज़ार देखें →', en: 'See the market →' } },
    },
    {
      value: 14,
      unit: { hi: 'लाख', en: 'lakh' },
      tone: 'mint',
      body: {
        hi: 'LIC के लगभग इतने ही सलाहकार हैं — 140 करोड़ लोगों के देश के लिए। यह बहुत कम है।',
        en: 'That is about how many LIC advisors there are — for a nation of 140 crore people. Not nearly enough.',
      },
      source: SRC_FIELD,
      link: { to: '/why-lic', label: { hi: 'आपके लिए जगह क्यों है →', en: 'Why there’s room for you →' } },
    },
    {
      lead: { hi: 'अधिकतम', en: 'Up to' },
      prefix: '₹',
      value: 7000,
      unit: { hi: 'प्रति माह', en: '/month' },
      tone: 'white',
      body: {
        hi: 'महिलाओं के लिए बीमा सखी स्टाइपेंड, साल 1 में — आपके कमीशन के साथ, LIC के मासिक नियमों के अनुसार।',
        en: 'Bima Sakhi stipend for women in year 1 — paid along with your commission, as per LIC’s monthly norms.',
      },
      source: {
        hi: 'स्रोत: LIC सर्कुलर CO/Mktg./ZD/A/35/2024, दिनांक 28.11.2024।',
        en: 'Source: LIC Circular CO/Mktg./ZD/A/35/2024 dated 28.11.2024.',
      },
      link: { to: '/bima-sakhi', label: { hi: 'स्टाइपेंड कैसे मिलता है →', en: 'How the stipend works →' } },
    },
  ],
};

/* ── 5 · market ────────────────────────────────────────────────────────── */

export const MARKET = {
  eyebrow: { hi: 'बाज़ार इंतज़ार कर रहा है', en: 'The market is waiting' },
  statement: {
    hi: 'सिर्फ़ 10% एजेंट पेशेवर तरीक़े से काम करते हैं — और 70% बिज़नेस वही लाते हैं।',
    en: 'Only 10% of agents work as professionals — and they bring 70% of the business.',
  },
  body: {
    hi: 'LIC के सिर्फ़ लगभग 14 लाख सलाहकार हैं — बीमा योग्य आबादी के लिए यह काफ़ी नहीं। एजेंसी फ़ोर्स के सिर्फ़ 10% लोग पेशेवर तरीक़े से काम करते हैं, और कुल बिज़नेस का 70% वही लाते हैं। हम आपको उसी टॉप ग्रुप तक पहुँचने में मदद करते हैं।',
    en: 'There are only about 14 lakh LIC advisors — not enough for the insurable population. Only 10% of the agency force works as professionals, and they bring 70% of the total business. That top group is where we help you aim.',
  },
  agents: { hi: 'एजेंट', en: 'of agents' },
  business: { hi: 'बिज़नेस', en: 'of the business' },
  togetherLabel: { hi: 'सब कुछ एक साथ देखिए', en: 'Put it all together' },
  together: [
    { hi: 'दुनिया की सबसे कम बीमित आबादी में से एक', en: 'One of the least-insured populations in the world' },
    { hi: 'बहुत कम पेशेवर एजेंट', en: 'Very few professional agents' },
    { hi: 'बहुत बड़ा सुरक्षा अंतर', en: 'A huge protection gap' },
    { hi: 'युवा, कामकाजी आबादी', en: 'A young, working population' },
    { hi: 'ऊँची निजी बचत', en: 'High personal savings' },
    { hi: 'बढ़ता मध्यम और उच्च-आय वर्ग', en: 'A growing middle and higher-income class' },
    { hi: 'बढ़ती बीमा जागरूकता', en: 'Rising insurance awareness' },
    { hi: 'LIC का मज़बूत ब्रांड', en: 'A strong LIC brand' },
  ],
  togetherClose: {
    hi: 'ये सब मिलकर एक पेशेवर LIC सलाहकार के रूप में करियर बनाने का ज़बरदस्त मौक़ा बनाते हैं।',
    en: 'Together, they make a tremendous opportunity to build your career as a professional LIC advisor.',
  },
  guarantee: {
    title: { hi: 'देश का साथ', en: 'Backed by the nation' },
    body: {
      hi: 'Sovereign Guarantee (सरकार की ज़मानत): LIC अधिनियम, 1956 की धारा 37 के तहत, निगम की सभी पॉलिसियों की बीमा राशि (सम एश्योर्ड) — घोषित बोनस सहित — के नकद भुगतान की ज़िम्मेदारी केंद्र सरकार की है। यानी जब आप LIC पॉलिसी बेचते हैं, तो उसके पीछे भारत सरकार खड़ी होती है।',
      en: 'Sovereign guarantee: under Section 37 of the LIC Act, 1956, the sums assured by all policies issued by the Corporation, including bonuses declared, are guaranteed as to payment in cash by the Central Government. When you sell an LIC policy, the Government of India stands behind it.',
    },
    source: {
      hi: 'संदर्भ: जीवन बीमा निगम अधिनियम, 1956, धारा 37।',
      en: 'Reference: Life Insurance Corporation Act, 1956, Section 37.',
    },
  },
  ready: { hi: 'बाज़ार तैयार है। क्या आप तैयार हैं?', en: 'The market is ready. Are you?' },
  more: { hi: 'बाज़ार की पूरी तस्वीर देखें', en: 'Read the full market case' },
};

/* ── 6 · who it is for ─────────────────────────────────────────────────── */

export const WHO = {
  eyebrow: { hi: 'यह किसके लिए है?', en: 'Who is this for?' },
  title: { hi: 'पुरुष और महिलाएँ — ज़िंदगी के हर पड़ाव पर', en: 'Men and women — at every stage of life' },
  lede: {
    hi: 'फ़ायदे, क्लब, करियर का रास्ता और रोहित का लक्ष्य — पुरुषों और महिलाओं के लिए एक जैसे हैं। नीचे अपनी शुरुआत का रास्ता चुनिए।',
    en: 'Benefits, clubs, career path and Rohit’s goal are the same for men and women. Find your starting point below.',
  },
  people: [
    {
      icon: 'cap',
      art: 'student',
      tone: 'mint',
      title: { hi: 'छात्र और पहली नौकरी वाले', en: 'Students and first-jobbers' },
      body: {
        hi: 'जल्दी शुरुआत कीजिए और ऐसे हुनर सीखिए, जो ज़िंदगी भर काम आएँ।',
        en: 'Start early and build skills that stay with you for life.',
      },
      link: { to: '/career#genz', label: { hi: 'Gen-Z का रास्ता →', en: 'The Gen-Z path →' } },
    },
    {
      icon: 'users',
      art: 'homemaker',
      tone: 'peach',
      title: { hi: 'गृहिणियाँ', en: 'Homemakers' },
      body: {
        hi: 'परिवार की दिनचर्या के हिसाब से काम कीजिए। महिलाएँ बीमा सखी के रूप में भी जुड़ सकती हैं — वही एजेंसी, पहले तीन साल स्टाइपेंड के साथ।',
        en: 'Work around your family’s day. Women can also join as a Bima Sakhi — the same agency, with a stipend for the first three years.',
      },
      link: { to: '/bima-sakhi', label: { hi: 'बीमा सखी →', en: 'Bima Sakhi →' } },
    },
    {
      icon: 'briefcase',
      art: 'working',
      tone: 'sand',
      title: { hi: 'नौकरीपेशा लोग', en: 'Working people' },
      body: {
        hi: 'यह एक समानांतर पेशा है — आप इसे अपने मौजूदा काम के साथ-साथ शुरू कर सकते हैं।',
        en: 'It is a parallel profession — you can start alongside your current work.',
      },
      link: { to: '/benefits', label: { hi: 'कमाई और फ़ायदे देखें →', en: 'What you earn and get →' } },
    },
    {
      icon: 'store',
      art: 'business',
      tone: 'sage',
      title: { hi: 'छोटे व्यापारी', en: 'Small-business owners' },
      body: {
        hi: 'एक दूसरा बिज़नेस जोड़िए, जिसे शुरू करने के लिए पूँजी नहीं चाहिए।',
        en: 'Add a second business that needs no capital to start.',
      },
      link: { to: '/be-your-own-boss', label: { hi: 'अपने बॉस ख़ुद बनिए →', en: 'Be your own boss →' } },
    },
    {
      icon: 'heart',
      art: 'retiree',
      tone: 'plum',
      title: { hi: 'रिटायर लोग — दिल से जवान', en: 'Retirees — young at heart' },
      body: {
        hi: 'नियमित एजेंसी में उम्र की कोई ऊपरी सीमा नहीं है। दूसरी पारी के लिए तैयार हैं?',
        en: 'The regular agency has no upper age limit. Ready for a second innings?',
      },
      link: { to: '/procedure', label: { hi: 'कैसे जुड़ें →', en: 'How to join →' } },
    },
  ],
};

/* ── 7 · four paths ────────────────────────────────────────────────────── */

export const PATHS = {
  eyebrow: { hi: 'चार रास्ते', en: 'Four ways in' },
  title: {
    hi: 'LIC एजेंसी — आपके और आपके परिवार के लिए ज़िंदगी भर की आय',
    en: 'LIC Agency — lifelong income for you and your family',
  },
  lede: {
    hi: 'चार रास्ते। वह चुनिए, जो आपके सबसे क़रीब लगे।',
    en: 'Four ways in. Pick the one that sounds most like you.',
  },
  items: [
    {
      to: '/benefits',
      tone: 'ink',
      kicker: '01',
      title: { hi: 'LIC एजेंट बनिए', en: 'Become an LIC Agent' },
      body: {
        hi: 'न पूँजी की ज़रूरत, समय अपनी मर्ज़ी का, और ऐसी रिन्यूअल आय जो ज़िंदगी भर चल सकती है।',
        en: 'No capital, flexible hours, and renewal income that can last a lifetime.',
      },
    },
    {
      to: '/bima-sakhi',
      tone: 'peach',
      kicker: '02',
      title: { hi: 'बीमा सखी', en: 'Bima Sakhi' },
      body: {
        hi: 'नियमित LIC एजेंसी, और साथ में महिलाओं के लिए पहले तीन साल स्टाइपेंड।',
        en: 'The regular LIC agency, plus a stipend for women in the first three years.',
      },
    },
    {
      to: '/career#genz',
      tone: 'mint',
      kicker: '03',
      title: { hi: 'Gen-Z', en: 'Gen-Z' },
      body: {
        hi: 'आपका करियर। आपके ग्राहक। आपका ब्रांड। आपका बिज़नेस।',
        en: 'Your Career. Your Clients. Your Brand. Your Business.',
      },
    },
    {
      to: '#explore',
      tone: 'white',
      kicker: '04',
      title: { hi: 'कमाएँ और भारत घूमें', en: 'Earn & Explore India' },
      body: { hi: 'कमाओ भी… भारत को जियो भी!', en: 'Earn… and live India too!' },
    },
  ],
};

/* ── 8 · Rohit's goal ──────────────────────────────────────────────────── */

export const GOAL = {
  eyebrow: { hi: 'आपके लिए रोहित का लक्ष्य', en: 'Rohit’s goal for you' },
  headline: {
    hi: 'साल 3 के अंत तक ₹1 लाख प्रति माह',
    en: '₹1 lakh a month by the end of year 3',
  },
  sub: {
    hi: 'साफ़ एक्टिविटी योजना, ट्रेनिंग और व्यक्तिगत फ़ॉलो-अप के साथ।',
    en: 'With a clear activity plan, training and personal follow-up.',
  },
  quote: {
    hi: 'मेरा लक्ष्य साफ़ है — मेरे साथ जुड़ने वाला हर एजेंट तीसरे साल के अंत तक ₹1,00,000 प्रति माह कमाए। योजना, ट्रेनिंग और साथ मैं दूँगा; मेहनत — और नतीजा — आपका होगा।',
    en: 'My goal for every agent I recruit is simple: by the end of your third year, you should be earning ₹1,00,000 a month. I’ll give you the plan, the training and the follow-up. The effort — and the result — will be yours.',
  },
  by: { hi: '— रोहित लाल', en: '— Rohit Lal' },
  planLabel: {
    hi: 'योजना — हर एजेंट क्या करता है, कमाई चाहे जितनी हो',
    en: 'The plan — what every agent does, at any income level',
  },
  plan: [
    { hi: 'नियमित रूप से ट्रेनिंग सेशन में शामिल हों।', en: 'Attend training sessions regularly.' },
    { hi: 'कम से कम 100 लोगों की संभावित ग्राहकों की सूची बनाएँ।', en: 'Prepare a prospect list of at least 100 people.' },
    { hi: 'हर दिन कम से कम 4 संभावित ग्राहकों से मिलें।', en: 'Meet at least 4 prospects every day.' },
    { hi: 'रोज़ की एक्टिविटी रिपोर्ट और हफ़्ते का सारांश लिखें।', en: 'Write a daily activity report and a weekly summary.' },
    { hi: 'हर हफ़्ते की रिव्यू मीटिंग में शामिल हों।', en: 'Attend the weekly review meetings.' },
  ],
  chart: {
    title: { hi: 'मासिक आय, साल-दर-साल', en: 'Monthly income, year by year' },
    caption: {
      hi: '3 साल में ₹1,00,000 प्रति माह की अपेक्षित आय के लिए ज़रूरी प्रीमियम (इस्तेमाल की गई दरें: पहले साल 25%, रिन्यूअल 7.5%)',
      en: 'Premium required for an expected income of ₹1,00,000 a month within 3 years (rates used: 25% first year, 7.5% renewal)',
    },
    year: { hi: 'वर्ष', en: 'Year' },
    goalLine: { hi: 'लक्ष्य ₹1 लाख/माह', en: 'Goal ₹1 lakh/month' },
    // Monthly income row of the reference table (startup section).
    values: [50000, 90000, 137500, 192500, 255000],
  },
  more: { hi: 'पूरी योजना, साल-दर-साल देखें →', en: 'See the full plan, year by year →' },
};

/* ── 9 · how you join ──────────────────────────────────────────────────── */

export const JOIN = {
  eyebrow: { hi: 'ब्योरों पर एक पहली नज़र', en: 'A first look at the details' },
  title: { hi: 'कैसे जुड़ें — संक्षेप में', en: 'How you join — in short' },
  steps: [
    { hi: 'आवेदन फ़ॉर्म भरें', en: 'Fill up the application form' },
    { hi: 'व्यक्तिगत इंटरव्यू', en: 'Personal interview' },
    { hi: 'एप्टीट्यूड टेस्ट', en: 'Aptitude test' },
    {
      hi: 'अनिवार्य प्री-लाइसेंसिंग ट्रेनिंग (IC-38) — आपके कोर्स के अनुसार, हमारे कस्टमाइज़्ड लर्निंग पोर्टल पर',
      en: 'Mandatory pre-licensing training (IC-38) as per your course — on our customised learning portal',
    },
    { hi: 'IRDAI परीक्षा पास करें', en: 'Pass the IRDAI examination' },
    { hi: 'LIC की ओर से नियुक्ति पत्र', en: 'Appointment letter issued by LIC of India' },
    { hi: 'इंडक्शन ट्रेनिंग पूरी करें', en: 'Complete induction training' },
  ],
  stepsMore: { hi: 'हर क़दम विस्तार से →', en: 'Every step explained →' },
  royalty: {
    title: { hi: 'जब-जब ग्राहक भरे, तब-तब कमाई', en: 'Earn every time your customer pays' },
    body: {
      hi: 'आपको प्रीमियम पर प्रतिशत के हिसाब से कमीशन मिलता है। यह सिर्फ़ एक बार नहीं मिलता। पॉलिसीधारक जब-जब किस्त भरता है, आपको फिर कमीशन मिलता है — पॉलिसी की पूरी अवधि तक। इसे ही रॉयल्टी आय कहते हैं।',
      en: 'You earn commission as a percentage of the premium. It is not paid just once. Every time the policyholder pays an instalment, you earn again — for the full term. That is royalty income.',
    },
    more: { hi: 'कमीशन कैसे मिलता है →', en: 'How commission works →' },
  },
  stipend: {
    title: { hi: 'बीमा सखी स्टाइपेंड — एक नज़र में', en: 'Bima Sakhi stipend at a glance' },
    rows: [
      { year: 1, amount: '₹7,000' },
      { year: 2, amount: '₹6,000' },
      { year: 3, amount: '₹5,000' },
    ],
    perMonth: { hi: 'प्रति माह', en: 'a month' },
    source: {
      hi: 'स्रोत: LIC सर्कुलर CO/Mktg./ZD/A/35/2024, दिनांक 28.11.2024। हर महीने के बिज़नेस नियम पूरे होने पर मिलता है।',
      en: 'Source: LIC Circular CO/Mktg./ZD/A/35/2024 dated 28.11.2024. Paid when monthly business norms are met.',
    },
    more: { hi: 'स्टाइपेंड के पूरे नियम →', en: 'Full stipend rules →' },
  },
  ladder: {
    title: { hi: 'क्लब की सीढ़ी चढ़िए', en: 'Climb the club ladder' },
    // bottom → top
    rungs: [
      'Distinguished Agents’ Club',
      'Branch Manager’s Club',
      'Divisional Manager’s Club',
      'Zonal Manager’s Club',
      'Chairman’s Club',
      'Galaxy Club',
      'Corporate Club',
      'Elite Club',
    ],
    source: {
      hi: 'एजेंट ट्रैक — नीचे से शुरुआत, ऊपर तक। स्रोत: LIC एजेंट भर्ती प्रस्तुति (आधिकारिक टेम्पलेट, 2026)।',
      en: 'Agent track, from entry (bottom) to top. Source: LIC agent recruitment presentation (official template, 2026).',
    },
    more: { hi: 'हर क्लब से क्या मिलता है →', en: 'What each club gives you →' },
  },
};

/* ── 10 · earn & explore India ─────────────────────────────────────────── */

export const EXPLORE = {
  eyebrow: { hi: 'कमाएँ और भारत घूमें', en: 'Earn & Explore India' },
  title: { hi: 'कमाओ भी… भारत को जियो भी!', en: 'Earn… and live India too!' },
  lede: {
    hi: 'एक ऐसा करियर, जो सिर्फ़ आय नहीं, अनुभवों से भरी ज़िंदगी देता है।',
    en: 'A career that gives you not just an income, but a life full of experiences.',
  },
  hero: {
    src: '/tourism2.jpg',
    alt: {
      hi: 'सूर्योदय के समय केदारनाथ मंदिर, पीछे बर्फ़ से ढकी हिमालय की चोटियाँ और सामने बहती पहाड़ी धारा',
      en: 'Kedarnath temple at sunrise, with snow-capped Himalayan peaks and a mountain stream in front',
    },
  },
  taglines: [
    { hi: 'कमाइए अपने शहर में।', en: 'Earn locally.' },
    { hi: 'घूमिए पूरे देश में।', en: 'Explore nationally.' },
    { hi: 'ज़िंदगी भरपूर जिएँ।', en: 'Live fully.' },
  ],
  band: {
    hi: 'कुछ करियर तनख़्वाह देते हैं। कुछ करियर ज़िंदगी देते हैं। सोच-समझकर चुनिए।',
    en: 'Some careers give you a salary. Some careers give you a life. Choose wisely.',
  },
  scriptLabel: { hi: 'ज़िंदगी की बनी-बनाई स्क्रिप्ट', en: 'The default life script' },
  script: [
    { hi: 'स्कूल', en: 'School' },
    { hi: 'कॉलेज', en: 'College' },
    { hi: 'नौकरी', en: 'Job' },
    { hi: 'तनख़्वाह', en: 'Salary' },
    { hi: 'EMI', en: 'EMI' },
    { hi: 'रिटायरमेंट', en: 'Retirement' },
    { hi: '“काश…”', en: '“If only…”' },
  ],
  scriptQuestion: {
    hi: 'क्या हमारी पूरी ज़िंदगी बस यही बनकर रह गई है? क्या हमने कभी अपने लिए ज़िंदगी डिज़ाइन की है?',
    en: 'Is this what our whole life has become? Have we ever designed a life for ourselves?',
  },
  design: {
    hi: 'ज़िंदगी यूँ ही मत बिताइए — उसे सोच-समझकर गढ़िए।',
    en: 'Don’t live by default. Live by design.',
  },
  designNote: {
    hi: 'अगर आप अपनी ज़िंदगी डिज़ाइन नहीं करेंगे, तो कोई और उसे आपके लिए डिज़ाइन कर देगा।',
    en: 'If you don’t design your life, someone else will design it for you.',
  },
  places: [
    {
      src: '/site-assets/ddl-varanasi-ganga-aarti.jpg',
      name: { hi: 'वाराणसी', en: 'Varanasi' },
      alt: {
        hi: 'वाराणसी के घाट पर पीतल के ऊँचे दीपों के साथ शाम की गंगा आरती करते पुजारी',
        en: 'Priests performing the evening Ganga aarti with tall brass lamps on the ghats of Varanasi',
      },
    },
    {
      src: '/site-assets/ddl-golden-temple.jpg',
      name: { hi: 'अमृतसर', en: 'Amritsar' },
      alt: {
        hi: 'नीले आसमान के नीचे अमृतसर का स्वर्ण मंदिर, पवित्र सरोवर में उसकी परछाईं',
        en: 'The Golden Temple in Amritsar reflected in its sacred pool under a blue sky',
      },
    },
    {
      src: '/site-assets/ddl-jagannath-puri.jpg',
      name: { hi: 'पुरी', en: 'Puri' },
      alt: {
        hi: 'पुरी का जगन्नाथ मंदिर, साफ़ आसमान में ऊँचे शिखर पर लहराता झंडा',
        en: 'The Jagannath temple in Puri, its tall spire topped with a flag against a clear sky',
      },
    },
    {
      src: '/site-assets/ddl-rann-of-kutch.jpg',
      name: { hi: 'कच्छ का रण', en: 'Rann of Kutch' },
      alt: {
        hi: 'कच्छ के रण के अंतहीन सफ़ेद नमक के मैदान पर सूर्यास्त',
        en: 'Sunset over the endless white salt desert of the Rann of Kutch',
      },
    },
  ],
  passport: {
    hi: 'तुम्हारा ऑफिस चार दीवारें नहीं होना चाहिए। तुम्हारा ऑफिस पूरा भारत होना चाहिए।',
    en: 'Your office shouldn’t become your prison. Your profession should become your passport.',
  },
  honest: {
    hi: 'मैं यह नहीं कह रहा कि कोई भी करियर आसान है। हर सफलता मेहनत माँगती है। यह आर्थिक आत्मनिर्भरता और समय की आज़ादी का रास्ता है — इसमें लगातार मेहनत लगती है, और यह बेफ़िक्र घूमने का कोई शॉर्टकट नहीं है।',
    en: 'I’m not saying any career is easy. Every success demands hard work. This is a path to financial independence and time freedom — it takes consistent effort, and it is not a shortcut to easy travel.',
  },
  more: { hi: 'पूरी कहानी पढ़ें →', en: 'Read the full story →' },
};

/* ── 11 · message ──────────────────────────────────────────────────────── */

export const MESSAGE = {
  eyebrow: { hi: 'रोहित लाल का संदेश', en: 'A message from Rohit Lal' },
  lead: {
    hi: 'यह नौकरी का विज्ञापन नहीं है। यह एक न्योता है — अपनी ज़िंदगी को एक नए नज़रिए से देखने का।',
    en: 'This is not a job advertisement. It is an invitation — to think about your life in a new way.',
  },
  paragraphs: [
    {
      hi: 'क्या भारत के युवा अगले दस सालों में सिर्फ़ अच्छी तनख़्वाह कमाएँगे… या एक शानदार ज़िंदगी भी जिएँगे? हम सब मेहनत करते हैं। लेकिन क्या अपने सपने जीने की योजना बनाने में भी उतनी ही मेहनत करते हैं?',
      en: 'Will India’s youth only earn a good salary in the next ten years… or also live a wonderful life? We all work hard. But do we work as hard at planning to live our dreams?',
    },
    {
      hi: 'क्या हमने कभी अपने माता-पिता से पूछा है — “आपकी कौन-सी यात्रा अब तक अधूरी है?”',
      en: 'Have we ever asked our parents, “Which journey of yours is still unfinished?”',
    },
    {
      hi: 'मैंने यह इसलिए नहीं लिखा कि किसी एक करियर को सबसे अच्छा साबित करूँ। मैंने यह इसलिए लिखा ताकि आप अपने लक्ष्य साफ़ कर सकें, सही सवाल पूछ सकें — और फिर वह रास्ता चुनें, जो आपके लिए सही हो।',
      en: 'I did not write this to prove that one career is the best. I wrote it so that you can clarify your goals, ask the right questions — and then choose the path that suits you.',
    },
    {
      hi: 'किसी भी करियर में सफलता का कोई शॉर्टकट नहीं होता। अगर आप सीखने को तैयार हैं, लोगों का भरोसा जीतने को तैयार हैं, और धैर्य व ईमानदारी से आगे बढ़ने को तैयार हैं — तो मौक़े खुलते चले जाते हैं।',
      en: 'There is no shortcut to success in any career. If you are ready to learn, ready to earn people’s trust, and ready to move ahead with patience and honesty, opportunities keep opening up.',
    },
  ],
  closing: {
    hi: 'कभी सिर्फ़ कमाई देखकर फ़ैसला न करें। ऐसा रास्ता चुनिए, जिसमें आपका व्यक्तित्व भी निखरे — और आपका योगदान भी बढ़े।',
    en: 'Never decide only on the basis of income. Choose a path where your personality grows — and so does your contribution.',
  },
  signature: { hi: 'रोहित लाल', en: 'Rohit Lal' },
  cite: {
    hi: 'डेवलपमेंट ऑफिसर, भारतीय जीवन बीमा निगम (LIC)',
    en: 'Development Officer, LIC of India',
  },
};

/* ── 12 · FAQ (questions and answers come from generated/faq.json) ───── */

export const FAQ = {
  eyebrow: { hi: 'सवाल-जवाब', en: 'FAQ' },
  title: { hi: 'आपके सवाल, पूरे जवाब के साथ', en: 'Your questions, fully answered' },
  lede: {
    hi: 'जवाब देखने के लिए सवाल पर टैप कीजिए। हर जवाब में पूरी जानकारी वाले पेज का लिंक है।',
    en: 'Tap a question to open the answer. Each answer links to the page with the full details.',
  },
  still: { hi: 'अब भी कोई सवाल है? रोहित को कॉल कीजिए।', en: 'Still have a question? Call Rohit.' },
};

/* ── 13 · closing ──────────────────────────────────────────────────────── */

export const CLOSING = {
  eyebrow: { hi: 'आइए, बात करते हैं', en: 'Let’s have a conversation' },
  title: {
    hi: 'मैं आपसे आज जुड़ने के लिए नहीं कह रहा। मैं बस इतना कह रहा हूँ — परखिए कि क्या आप इसे बना सकते हैं।',
    en: 'I’m not asking you to join today. I’m asking you to explore whether you are capable of building this.',
  },
  body: {
    hi: 'अगर आप मानते हैं कि भविष्य बनाया जाता है — उसका सिर्फ़ इंतज़ार नहीं किया जाता — तो आइए, बात करते हैं।',
    en: 'If you believe your future should be something you build — not something you simply wait for — let’s have a conversation.',
  },
  card: {
    kicker: { hi: 'आपके डेवलपमेंट ऑफिसर', en: 'Your Development Officer' },
    name: { hi: 'रोहित लाल', en: 'Rohit Lal' },
    creds: {
      hi: 'MBA (फ़ाइनेंस और फ़ाइनेंशियल प्लानिंग) · डेवलपमेंट ऑफिसर (SBA), भारतीय जीवन बीमा निगम (LIC)',
      en: 'MBA (Finance & Financial Planning) · Development Officer (SBA), Life Insurance Corporation of India',
    },
    area: {
      hi: 'ब्रांच क्षेत्र: लखीसराय; शेखपुरा (SO); सूरजगढ़ा (SO); बड़हिया (SO)',
      en: 'Branch area: Lakhisarai; Sheikhpura (SO); Surajgarha (SO); Barahiya (SO)',
    },
    promise: {
      hi: 'सही और संतुलित जानकारी; ईमानदार जवाब; कोई दबाव नहीं।',
      en: 'Correct, balanced information; honest answers; no pressure.',
    },
  },
};
