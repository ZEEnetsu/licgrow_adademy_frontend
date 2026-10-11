/**
 * Copy for /apply, verbatim from the reference apply section
 * (src/pages/site/index.html, `<section id="apply">`), both languages.
 * The session agenda is the reference's procedure section (PROC).
 */

export const APPLY = {
  eyebrow: { hi: 'आवेदन / संपर्क', en: 'Apply / Contact' },
  title: {
    hi: 'और जानना चाहते हैं? करियर ओरिएंटेशन सेशन में जुड़िए।',
    en: 'Interested to know more? Join a career orientation session.',
  },
  learnLead: { hi: 'सेशन में आप जानेंगे:', en: 'In the session, you’ll find out:' },
  learn: [
    { hi: 'एक वित्तीय सलाहकार असल में क्या करता है', en: 'what a financial advisor really does' },
    { hi: 'सफल होने के लिए कौन-से हुनर चाहिए', en: 'what skills you need to succeed' },
    { hi: 'ट्रेनिंग कैसे होती है', en: 'how the training works' },
    { hi: 'शुरुआती चुनौतियाँ क्या हैं', en: 'what the early challenges are' },
    { hi: 'क्या यह करियर आपके लिए सही है', en: 'whether this career suits you' },
  ],
  register: { hi: 'रजिस्टर करें', en: 'Register' },

  session: {
    title: { hi: 'करियर ओरिएंटेशन सेशन (60–90 मिनट)', en: 'The career orientation session (60–90 minutes)' },
    items: [
      { hi: 'वित्तीय साक्षरता', en: 'Financial literacy' },
      { hi: 'वित्तीय सलाहकार की भूमिका', en: 'The role of a financial advisor' },
      {
        hi: 'करियर से अपेक्षाएँ — ज़िम्मेदारियाँ, ज़रूरी हुनर, सीखने का तरीक़ा, और असली चुनौतियाँ',
        en: 'Career expectations — responsibilities, skills needed, how learning works, and the real challenges',
      },
      { hi: 'आपके सवाल, जवाब के साथ', en: 'Your questions, answered' },
      { hi: 'अगले क़दम — सिर्फ़ उनके लिए, जिनकी रुचि है', en: 'Next steps — only for those who are interested' },
    ],
  },

  form: {
    title: { hi: 'करियर ओरिएंटेशन सेशन के लिए रजिस्टर करें', en: 'Register for a career orientation session' },
    name: { hi: 'नाम', en: 'Name' },
    namePh: { hi: 'आपका पूरा नाम', en: 'Your full name' },
    mobile: { hi: 'मोबाइल', en: 'Mobile' },
    mobilePh: { hi: '10 अंकों का मोबाइल नंबर', en: '10-digit mobile number' },
    email: { hi: 'ईमेल', en: 'Email' },
    emailPh: { hi: 'you@example.com', en: 'you@example.com' },
    city: { hi: 'शहर', en: 'City' },
    cityPh: { hi: 'आपका शहर या क़स्बा', en: 'Your town or city' },
    org: { hi: 'कॉलेज / बिज़नेस', en: 'College / Business' },
    orgPh: { hi: 'जहाँ आप पढ़ते या काम करते हैं', en: 'Where you study or work' },
    topicsLegend: { hi: 'मैं किस बारे में और जानना चाहता/चाहती हूँ?', en: 'What do I want to know more about?' },
    topics: [
      { value: 'financial-planning', label: { hi: 'फ़ाइनेंशियल प्लानिंग', en: 'Financial planning' } },
      { value: 'financial-literacy', label: { hi: 'वित्तीय साक्षरता', en: 'Financial literacy' } },
      { value: 'advisory-career', label: { hi: 'वित्तीय सलाहकार का करियर', en: 'A financial advisory career' } },
      { value: 'entrepreneurship', label: { hi: 'उद्यमिता', en: 'Entrepreneurship' } },
      { value: 'personal-development', label: { hi: 'व्यक्तित्व विकास', en: 'Personal development' } },
    ],
    interestLegend: { hi: 'मेरी रुचि है:', en: 'I am interested in:' },
    interests: [
      { value: 'agency', icon: 'briefcase', label: { hi: 'नियमित LIC एजेंसी', en: 'Regular LIC agency' } },
      { value: 'bima-sakhi', icon: 'users', label: { hi: 'बीमा सखी (महिलाओं के लिए)', en: 'Bima Sakhi (for women)' } },
      { value: 'not-sure', icon: 'sparkle', label: { hi: 'अभी तय नहीं', en: 'Not sure yet' } },
    ],
    consent: {
      hi: 'मैं सहमति देता/देती हूँ कि रोहित लाल मुझसे फ़ोन या WhatsApp पर संपर्क करें।',
      en: 'I agree to be contacted by Rohit Lal on phone or WhatsApp.',
    },
    submit: { hi: 'आवेदन करें', en: 'Apply now' },
    draft: {
      hi: '* ज़रूरी। ड्राफ़्ट फ़ॉर्म: आपकी जानकारी अभी कहीं नहीं भेजी जाती।',
      en: '* Required. Draft form: your details are not sent anywhere yet.',
    },
    thanks: { hi: 'धन्यवाद! रोहित जल्द ही आपसे संपर्क करेंगे।', en: 'Thank you! Rohit will get in touch with you soon.' },
    thanksNote: { hi: '(ड्राफ़्ट प्रीव्यू: कुछ भी भेजा नहीं गया है।)', en: '(Draft preview: nothing has been sent.)' },
    again: { hi: 'एक और फ़ॉर्म भरें', en: 'Fill in another' },
  },

  callback: {
    title: { hi: 'समय कम है? कॉल बैक का अनुरोध कीजिए', en: 'Short on time? Request a call back' },
    namePh: { hi: 'आपका नाम', en: 'Your name' },
    submit: { hi: 'मुझे कॉल बैक करें', en: 'Call me back' },
    thanks: { hi: 'धन्यवाद! रोहित आपको वापस कॉल करेंगे।', en: 'Thank you! Rohit will call you back.' },
  },

  next: {
    title: { hi: 'रजिस्टर करने के बाद क्या होता है', en: 'What happens after you register' },
    body: {
      hi: 'रजिस्टर करने के बाद रोहित आपसे संपर्क करेंगे और अगले करियर ओरिएंटेशन सेशन की जानकारी देंगे — बिक्री या भर्ती का कोई दबाव नहीं। आधिकारिक प्रक्रिया की जानकारी तभी, जब आपकी रुचि हो।',
      en: 'After you register, Rohit will get in touch with details of the next career orientation session — with no sales or recruitment pressure. Details of the official process come only if you are interested.',
    },
    talkTitle: {
      hi: 'हमारी व्यक्तिगत बातचीत — हम किन बातों पर बात करेंगे',
      en: 'Our personal discussion — what we’ll talk about',
    },
    talk: [
      { hi: 'आपका सबसे बड़ा सपना', en: 'your biggest dream' },
      { hi: 'आप अपने परिवार के लिए क्या करना चाहते हैं', en: 'what you want to do for your family' },
      { hi: 'पिछले एक साल में आपने क्या सीखा', en: 'what you learned in the last year' },
      { hi: 'अपने मौजूदा करियर में आपको सबसे अच्छा क्या लगता है', en: 'what you like most in your current career' },
      { hi: 'आप इस क्षेत्र के बारे में क्यों जानना चाहते हैं', en: 'why you want to know about this field' },
    ],
    listen: { hi: 'हम ज़्यादा सुनेंगे और कम बोलेंगे।', en: 'We’ll listen more and talk less.' },
  },

  rate: {
    title: { hi: 'ख़ुद को रेटिंग दीजिए', en: 'Rate yourself' },
    intro: {
      hi: 'हर गुण पर ख़ुद को 1 से 5 तक रेटिंग दीजिए। यह बातचीत का एक ज़रिया है, कोई परीक्षा नहीं — और आपके जवाब आपकी स्क्रीन पर ही रहेंगे।',
      en: 'Rate yourself from 1 to 5 on each quality. This is a discussion tool, not an exam — and your answers stay on your screen.',
    },
    qualities: [
      { hi: 'सीखने की इच्छा', en: 'Willingness to learn' },
      { hi: 'ईमानदारी', en: 'Honesty' },
      { hi: 'बातचीत का हुनर', en: 'Communication skills' },
      { hi: 'अनुशासन', en: 'Discipline' },
      { hi: 'धैर्य', en: 'Patience' },
      { hi: 'लोगों से जुड़ने में रुचि', en: 'Interest in connecting with people' },
      { hi: 'ज़िम्मेदारी', en: 'Responsibility' },
      { hi: 'समय का प्रबंधन', en: 'Time management' },
    ],
    total: { hi: 'आपका कुल (40 में से)', en: 'Your total (out of 40)' },
    lookTitle: { hi: 'हम क्या देखते हैं', en: 'What we look for' },
    look: [
      { hi: 'सीखने की जिज्ञासा', en: 'Curiosity to learn' },
      { hi: 'लंबे समय की सोच', en: 'Long-term thinking' },
      { hi: 'लोगों की मदद करने की इच्छा', en: 'A wish to help people' },
      { hi: 'ईमानदार काम में रुचि', en: 'Interest in ethical work' },
      { hi: 'धैर्य', en: 'Patience' },
    ],
    realistic: {
      hi: 'अगर आप सिर्फ़ जल्दी पैसा, कम मेहनत या तुरंत सफलता ढूँढ रहे हैं, तो पहले हम वास्तविक उम्मीदों पर बात कर लें।',
      en: 'If you’re looking only for quick money, little effort or instant success, let’s first talk about realistic expectations.',
    },
  },

  promise: {
    title: { hi: 'आपसे मेरा वादा', en: 'My promise to you' },
    items: [
      { hi: 'मैं आपको सही और संतुलित जानकारी दूँगा।', en: 'I will give you correct, balanced information.' },
      { hi: 'ट्रेनिंग के लिए आपको सही दिशा दिखाऊँगा।', en: 'I will show you the right direction for your training.' },
      { hi: 'आपके सवालों का ईमानदारी से जवाब दूँगा।', en: 'I will answer your questions honestly.' },
      { hi: 'आपका जोश बनाए रखने में मदद करूँगा।', en: 'I will help keep your enthusiasm up.' },
      { hi: 'ईमानदार काम पर ज़ोर दूँगा।', en: 'I will insist on ethical work.' },
      { hi: 'हर प्रतिभागी का सम्मान करूँगा।', en: 'I will respect every participant.' },
      {
        hi: 'कभी भ्रामक वादे या कमाई के बढ़ा-चढ़ाकर दावे नहीं करूँगा।',
        en: 'I will never make misleading promises or unrealistic income claims.',
      },
      {
        hi: 'कभी दबाव नहीं डालूँगा, न आपके फ़ैसले में जल्दबाज़ी कराऊँगा।',
        en: 'I will never pressure you or rush your decision.',
      },
      {
        hi: 'आपकी इजाज़त से ही संपर्क करूँगा — कम और काम के संदेशों के साथ।',
        en: 'I will contact you only with your permission, with few and useful messages.',
      },
      {
        hi: 'अगर आपकी रुचि न हो, तो आपके फ़ैसले का सम्मान करूँगा।',
        en: 'I will respect your decision if you’re not interested.',
      },
    ],
    band: { hi: 'पहले रिश्ता · फिर मार्गदर्शन · फिर फ़ैसला।', en: 'Relationship first · Guidance second · Decision third.' },
    by: { hi: '— रोहित लाल', en: '— Rohit Lal' },
  },

  closing: {
    hi: 'सेमिनार ध्यान खींचता है। फ़ॉलो-अप भरोसा बनाता है। भरोसा मौक़े बनाता है।',
    en: 'Seminar gets attention. Follow-up builds trust. Trust creates opportunity.',
  },
};
