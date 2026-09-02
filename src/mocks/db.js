/**
 * In-memory seed data.
 *
 * IMPORTANT — the permission catalog and role definitions below are
 * transcribed INDEPENDENTLY from `api-contracts/05-rbac.md`. They deliberately
 * do NOT import from `src/app/features/auth/permissions.js`.
 *
 * That duplication is the point: the mock is a test oracle, and an oracle that
 * imports the thing it's checking can't catch a mistake in it. If the client's
 * catalog and this one disagree, that's a real bug surfacing.
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

import * as extra from "./seedExtra.js";

/** Every permission in 05-rbac.md's master table. */
export const PERMISSION_CATALOG = [
  { name: "batch:read", description: "View batches and their published content/membership" },
  { name: "batch:manage", description: "Create/update/archive batches; publish content; manage members" },
  { name: "enrollment:review", description: "List, approve, reject enrollment requests" },
  { name: "course:read", description: "View the course tree (units, chapters)" },
  { name: "course:author", description: "Create/update/reorder/publish/archive courses" },
  { name: "test:read", description: "View tests/quizzes and their questions (admin shape)" },
  { name: "test:author", description: "Create/update tests, questions, options; publish/archive" },
  { name: "test:view_results", description: "View attempts, scores, and test analytics" },
  { name: "announcement:read", description: "View announcements (admin view)" },
  { name: "announcement:manage", description: "Create/update/delete announcements" },
  { name: "learner:read", description: "View learner accounts, profiles, and analytics" },
  { name: "learner:suspend", description: "Suspend / reactivate learner accounts" },
  { name: "analytics:view", description: "View platform- and batch-level analytics" },
];

const ALL = PERMISSION_CATALOG.map((p) => p.name);

/** Seeded roles, exactly as tabled in 05-rbac.md. */
const SEED_ROLES = [
  {
    id: "role-mentor",
    name: "mentor",
    description: "Full staff powers",
    permissions: [...ALL],
    isSystem: true,
  },
  {
    id: "role-co-mentor",
    name: "co_mentor",
    description: "Mentor without batch management or learner suspension",
    permissions: [
      "batch:read",
      "enrollment:review",
      "course:author",
      "test:author",
      "test:view_results",
      "announcement:manage",
      "learner:read",
      "analytics:view",
    ],
    isSystem: true,
  },
  {
    id: "role-viewer",
    name: "viewer",
    description: "Read-only",
    permissions: [
      "batch:read",
      "course:read",
      "test:read",
      "announcement:read",
      "learner:read",
      "test:view_results",
      "analytics:view",
    ],
    isSystem: true,
  },
];

/** Every seeded account uses this password. */
export const SEED_PASSWORD = "password123";

const SEED_ACCOUNTS = [
  {
    id: "sa-0000-0000-0000-000000000001",
    type: "super_admin",
    email: "ops@licgrow.test",
    username: "ops",
    fullName: "Root Operator",
    status: "active",
    roleId: null,
  },
  {
    id: "ad-0000-0000-0000-000000000001",
    type: "staff_admin",
    email: "mentor@licgrow.test",
    username: "mentor",
    fullName: "Amit Rao",
    status: "active",
    roleId: "role-mentor",
  },
  {
    id: "ad-0000-0000-0000-000000000002",
    type: "staff_admin",
    email: "co@licgrow.test",
    username: "comentor",
    fullName: "Neha Iyer",
    status: "active",
    roleId: "role-co-mentor",
  },
  {
    id: "ad-0000-0000-0000-000000000003",
    type: "staff_admin",
    email: "viewer@licgrow.test",
    username: "viewer",
    fullName: "Sunil Bose",
    status: "active",
    roleId: "role-viewer",
  },
  {
    id: "ln-0000-0000-0000-000000000001",
    type: "learner",
    email: "priya@example.com",
    username: "priya",
    fullName: "Priya Sharma",
    phone: "+919812345678",
    status: "active",
    roleId: null,
    // complete profile — can enroll
    profile: {
      licAgentCode: "LIC-4471",
      dob: "1996-03-14",
      city: "Pune",
      experienceYears: 2,
    },
  },
  {
    // deliberately INCOMPLETE profile, so 422 PROFILE_INCOMPLETE is reachable
    id: "ln-0000-0000-0000-000000000003",
    type: "learner",
    email: "newbie@example.com",
    username: "newbie",
    fullName: "Arjun Newcomer",
    phone: null,
    status: "active",
    roleId: null,
    profile: { licAgentCode: null, dob: null, city: null, experienceYears: null },
  },
  {
    // exercises 403 ACCOUNT_SUSPENDED (conventions §1)
    id: "ln-0000-0000-0000-000000000002",
    type: "learner",
    email: "suspended@example.com",
    username: "suspended",
    fullName: "Ravi Suspended",
    phone: null,
    status: "suspended",
    roleId: null,
    profile: { licAgentCode: null, dob: null, city: null, experienceYears: null },
  },
];

const seedTests = () => [
  {
    id: "test-0001",
    kind: "test",
    unitId: null,
    title: "IC-38 Full Length — Set 1",
    description: "Covers the full syllabus. 60 minutes.",
    durationMinutes: 60,
    totalMarks: 3,
    passingMarks: 2,
    maxAttempts: 2,
    cooldownMinutes: 0,
    shuffleQuestions: false,
    availableFrom: null,
    availableUntil: null,
    leaderboardEnabled: true,
    reviewPolicy: "after_close",
    status: "published",
    updatedAt: "2026-08-20T09:15:00Z",
  },
  {
    id: "test-0002",
    kind: "test",
    unitId: null,
    title: "Principles of Insurance — Practice",
    description: "Warm-up set.",
    durationMinutes: null,
    totalMarks: 2,
    passingMarks: 1,
    maxAttempts: null,
    cooldownMinutes: 0,
    shuffleQuestions: true,
    availableFrom: null,
    availableUntil: null,
    leaderboardEnabled: false,
    reviewPolicy: "after_close",
    status: "draft",
    updatedAt: "2026-08-25T14:02:00Z",
  },
  {
    /*
     * A UNIT QUIZ — the join between 08-course.md and 09-test.md. It is an
     * ordinary test with kind:"quiz" and a unitId; the course tree surfaces it
     * as a reference. Deleting unit-0001 must clear this unitId WITHOUT
     * deleting the test (08 §9).
     */
    id: "test-0004",
    kind: "quiz",
    unitId: "unit-0001",
    title: "Unit 1 — Quick Check",
    description: null,
    durationMinutes: null,
    totalMarks: 0,
    passingMarks: 0,
    maxAttempts: null,
    cooldownMinutes: 0,
    shuffleQuestions: false,
    availableFrom: null,
    availableUntil: null,
    leaderboardEnabled: false,
    reviewPolicy: "immediate",
    status: "draft",
    updatedAt: "2026-08-19T12:00:00Z",
  },
  {
    id: "test-0003",
    kind: "test",
    unitId: null,
    title: "Retired — Old Syllabus Mock",
    description: null,
    durationMinutes: 45,
    totalMarks: 0,
    passingMarks: 0,
    maxAttempts: 1,
    cooldownMinutes: 0,
    shuffleQuestions: false,
    availableFrom: null,
    availableUntil: null,
    leaderboardEnabled: false,
    reviewPolicy: "after_close",
    status: "archived",
    updatedAt: "2026-06-01T08:00:00Z",
  },

  // ── archived sets, fully translated (5 questions each) ───────────────────
  ...[
    {
      id: "test-0005",
      title: "IC-38 Mock — 2024 Syllabus",
      description: "Retired after the 2025 syllabus revision.",
      updatedAt: "2026-04-12T09:00:00Z",
    },
    {
      id: "test-0006",
      title: "Life Insurance Fundamentals — Retired Set",
      description: "Superseded by the current fundamentals paper.",
      updatedAt: "2026-03-28T09:00:00Z",
    },
    {
      id: "test-0007",
      title: "IRDAI Regulations — Archived Practice",
      description: "Regulatory content withdrawn pending an update.",
      updatedAt: "2026-02-15T09:00:00Z",
    },
  ].map((meta) => ({
    ...meta,
    kind: "test",
    unitId: null,
    durationMinutes: 30,
    totalMarks: 10, // 5 questions x 2 marks
    passingMarks: 5,
    maxAttempts: 2,
    cooldownMinutes: 0,
    shuffleQuestions: false,
    availableFrom: null,
    availableUntil: null,
    leaderboardEnabled: false,
    reviewPolicy: "after_close",
    status: "archived",
  })),
];

/**
 * Courses — 08-course.md. Note there is no thumbnail/instructor/duration:
 * the contract's course is a video curriculum tree, and every chapter carries
 * its own YouTube link.
 */
const seedCourses = () => [
  {
    id: "course-0001",
    title: "Life Insurance Basics",
    description: "Foundation material for the IC-38 certification.",
    examTarget: "IC-38",
    status: "published",
    updatedAt: "2026-08-18T10:00:00Z",
    units: [
      {
        id: "unit-0001",
        title: "Introduction",
        sequence: 1,
        chapters: [
          {
            id: "chap-0001",
            title: "What is Life Insurance",
            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            description: "The principle of pooled risk.",
            sequence: 1,
          },
          {
            id: "chap-0002",
            title: "Why People Buy Cover",
            youtubeUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
            description: null,
            sequence: 2,
          },
        ],
      },
      {
        id: "unit-0002",
        title: "Policy Types",
        sequence: 2,
        chapters: [
          {
            id: "chap-0003",
            title: "Term vs Endowment",
            youtubeUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
            description: null,
            sequence: 1,
          },
        ],
      },
    ],
  },
  {
    // one unit, zero chapters — publishing this must fail with EMPTY_COURSE
    id: "course-0002",
    title: "Advanced Products",
    description: "ULIPs, annuities and riders.",
    examTarget: "IC-38",
    status: "draft",
    updatedAt: "2026-08-26T11:30:00Z",
    units: [
      { id: "unit-0003", title: "Unit Linked Plans", sequence: 1, chapters: [] },
    ],
  },
  {
    id: "course-0003",
    title: "Retired — 2024 Syllabus",
    description: null,
    examTarget: "IC-38",
    status: "archived",
    updatedAt: "2026-05-02T08:00:00Z",
    units: [],
  },
];

const seedQuestions = () => [
  {
    id: "q-0001",
    testId: "test-0001",
    sequence: 1,
    marks: 1,
    statement: {
      en: "Which of these is a feature of a term plan?",
      hi: "इनमें से कौन सा टर्म प्लान की विशेषता है?",
    },
    explanation: { en: "Term plans provide pure risk cover.", hi: "टर्म प्लान शुद्ध जोखिम कवर देते हैं।" },
    options: [
      { id: "o-0001", text: { en: "Maturity benefit", hi: "मैच्योरिटी लाभ" } },
      { id: "o-0002", text: { en: "Pure risk cover", hi: "शुद्ध जोखिम कवर" } },
      { id: "o-0003", text: { en: "Guaranteed bonus", hi: "गारंटीड बोनस" } },
      { id: "o-0004", text: { en: "Loyalty addition", hi: "लॉयल्टी एडिशन" } },
    ],
    correctOptionId: "o-0002",
  },
  {
    id: "q-0002",
    testId: "test-0001",
    sequence: 2,
    marks: 2,
    statement: {
      en: "IRDAI regulates which sector?",
      hi: "IRDAI किस क्षेत्र को नियंत्रित करता है?",
    },
    explanation: null,
    options: [
      { id: "o-0005", text: { en: "Insurance", hi: "बीमा" } },
      { id: "o-0006", text: { en: "Banking", hi: "बैंकिंग" } },
      { id: "o-0007", text: { en: "Capital markets", hi: "पूंजी बाजार" } },
    ],
    correctOptionId: "o-0005",
  },
  {
    // deliberately missing `hi` — publishing test-0002 must fail with
    // 422 TEST_NOT_PUBLISHABLE until this is translated (09-test.md §6)
    id: "q-0003",
    testId: "test-0002",
    sequence: 1,
    marks: 2,
    statement: { en: "What does 'utmost good faith' require?" },
    explanation: null,
    options: [
      { id: "o-0008", text: { en: "Full disclosure of material facts" } },
      { id: "o-0009", text: { en: "A medical exam" } },
    ],
    correctOptionId: "o-0008",
  },

  ...archivedQuestions(),
];

/**
 * The three archived sets, 5 fully-translated questions each.
 *
 * Built rather than hand-written: 15 questions x 4 options means 75 ids, and
 * a single mistyped `correctOptionId` would silently score every attempt
 * wrong. Deriving the ids from position removes that whole class of error.
 */
function archivedQuestions() {
  const build = (testId, specs) =>
    specs.map((spec, index) => {
      const options = spec.options.map((text, i) => ({
        id: `${testId}-q${index + 1}-o${i + 1}`,
        text,
      }));

      return {
        id: `${testId}-q${index + 1}`,
        testId,
        sequence: index + 1,
        marks: 2,
        statement: spec.statement,
        explanation: spec.explanation ?? null,
        options,
        correctOptionId: options[spec.correctIndex].id,
      };
    });

  return [
    ...build("test-0005", [
      {
        statement: {
          en: "What is the primary purpose of life insurance?",
          hi: "जीवन बीमा का प्राथमिक उद्देश्य क्या है?",
        },
        explanation: {
          en: "Life insurance exists to protect dependants financially, not to create wealth.",
          hi: "जीवन बीमा आश्रितों को वित्तीय सुरक्षा देने के लिए है, धन सृजन के लिए नहीं।",
        },
        options: [
          { en: "Wealth creation", hi: "धन सृजन" },
          { en: "Financial protection against death", hi: "मृत्यु के विरुद्ध वित्तीय सुरक्षा" },
          { en: "Tax saving", hi: "कर बचत" },
          { en: "Guaranteed returns", hi: "गारंटीड रिटर्न" },
        ],
        correctIndex: 1,
      },
      {
        statement: {
          en: "Which body regulates the insurance sector in India?",
          hi: "भारत में बीमा क्षेत्र को कौन सी संस्था नियंत्रित करती है?",
        },
        explanation: {
          en: "IRDAI is the statutory regulator for insurance in India.",
          hi: "IRDAI भारत में बीमा का वैधानिक नियामक है।",
        },
        options: [
          { en: "SEBI", hi: "सेबी" },
          { en: "RBI", hi: "आरबीआई" },
          { en: "IRDAI", hi: "आईआरडीएआई" },
          { en: "AMFI", hi: "एएमएफआई" },
        ],
        correctIndex: 2,
      },
      {
        statement: {
          en: "What does the term 'premium' refer to?",
          hi: "'प्रीमियम' शब्द किसे संदर्भित करता है?",
        },
        explanation: {
          en: "The premium is the consideration paid to keep the policy in force.",
          hi: "प्रीमियम वह राशि है जो पॉलिसी को चालू रखने के लिए दी जाती है।",
        },
        options: [
          { en: "The sum assured", hi: "बीमित राशि" },
          { en: "The amount paid to keep the policy in force", hi: "पॉलिसी को चालू रखने के लिए दी जाने वाली राशि" },
          { en: "The maturity benefit", hi: "परिपक्वता लाभ" },
          { en: "The agent's commission", hi: "एजेंट का कमीशन" },
        ],
        correctIndex: 1,
      },
      {
        statement: {
          en: "What is the standard free-look period for a life insurance policy?",
          hi: "जीवन बीमा पॉलिसी के लिए मानक फ्री-लुक अवधि क्या है?",
        },
        explanation: {
          en: "The policyholder may return the policy within 15 days of receipt.",
          hi: "पॉलिसीधारक प्राप्ति के 15 दिनों के भीतर पॉलिसी लौटा सकता है।",
        },
        options: [
          { en: "7 days", hi: "7 दिन" },
          { en: "15 days", hi: "15 दिन" },
          { en: "30 days", hi: "30 दिन" },
          { en: "45 days", hi: "45 दिन" },
        ],
        correctIndex: 1,
      },
      {
        statement: {
          en: "What does the principle of 'utmost good faith' require?",
          hi: "'परम सद्भावना' का सिद्धांत क्या अपेक्षा करता है?",
        },
        explanation: {
          en: "Both parties must disclose all material facts honestly.",
          hi: "दोनों पक्षों को सभी महत्वपूर्ण तथ्य ईमानदारी से बताने चाहिए।",
        },
        options: [
          { en: "The insurer must pay every claim", hi: "बीमाकर्ता को हर दावा चुकाना चाहिए" },
          { en: "Full disclosure of all material facts", hi: "सभी महत्वपूर्ण तथ्यों का पूर्ण प्रकटीकरण" },
          { en: "The agent must meet a sales target", hi: "एजेंट को बिक्री लक्ष्य पूरा करना चाहिए" },
          { en: "The nominee must be a relative", hi: "नामांकित व्यक्ति रिश्तेदार होना चाहिए" },
        ],
        correctIndex: 1,
      },
    ]),

    ...build("test-0006", [
      {
        statement: {
          en: "What does a term plan primarily provide?",
          hi: "टर्म प्लान मुख्य रूप से क्या प्रदान करता है?",
        },
        explanation: {
          en: "A term plan is pure risk cover with no maturity value.",
          hi: "टर्म प्लान शुद्ध जोखिम कवर है, इसमें परिपक्वता मूल्य नहीं होता।",
        },
        options: [
          { en: "Maturity benefit", hi: "परिपक्वता लाभ" },
          { en: "Pure risk cover", hi: "शुद्ध जोखिम कवर" },
          { en: "Guaranteed bonus", hi: "गारंटीड बोनस" },
          { en: "Loyalty addition", hi: "लॉयल्टी एडिशन" },
        ],
        correctIndex: 1,
      },
      {
        statement: {
          en: "What is meant by 'sum assured'?",
          hi: "'बीमित राशि' से क्या तात्पर्य है?",
        },
        explanation: {
          en: "It is the guaranteed amount payable when the insured event occurs.",
          hi: "यह वह गारंटीड राशि है जो बीमित घटना होने पर देय होती है।",
        },
        options: [
          { en: "The annual premium", hi: "वार्षिक प्रीमियम" },
          { en: "The guaranteed amount payable on the insured event", hi: "बीमित घटना पर देय गारंटीड राशि" },
          { en: "The surrender value", hi: "समर्पण मूल्य" },
          { en: "The accrued bonus", hi: "अर्जित बोनस" },
        ],
        correctIndex: 1,
      },
      {
        statement: {
          en: "Who is a nominee under a life insurance policy?",
          hi: "जीवन बीमा पॉलिसी में नामांकित व्यक्ति कौन होता है?",
        },
        explanation: {
          en: "The nominee receives the benefit on the death of the life assured.",
          hi: "बीमित व्यक्ति की मृत्यु पर नामांकित व्यक्ति को लाभ मिलता है।",
        },
        options: [
          { en: "The person who pays the premium", hi: "वह व्यक्ति जो प्रीमियम भरता है" },
          { en: "The person who receives the benefit on death of the insured", hi: "बीमित की मृत्यु पर लाभ पाने वाला व्यक्ति" },
          { en: "The insurance agent", hi: "बीमा एजेंट" },
          { en: "The insurance company", hi: "बीमा कंपनी" },
        ],
        correctIndex: 1,
      },
      {
        statement: {
          en: "What is a rider in an insurance policy?",
          hi: "बीमा पॉलिसी में राइडर क्या होता है?",
        },
        explanation: {
          en: "A rider is an optional add-on benefit attached to a base policy.",
          hi: "राइडर एक वैकल्पिक अतिरिक्त लाभ है जो मूल पॉलिसी के साथ जुड़ता है।",
        },
        options: [
          { en: "An add-on benefit attached to a base policy", hi: "मूल पॉलिसी से जुड़ा अतिरिक्त लाभ" },
          { en: "A category of agent", hi: "एजेंट की एक श्रेणी" },
          { en: "A type of claim form", hi: "दावा फॉर्म का एक प्रकार" },
          { en: "A regulatory authority", hi: "एक नियामक प्राधिकरण" },
        ],
        correctIndex: 0,
      },
      {
        statement: {
          en: "What happens if a premium is not paid within the grace period?",
          hi: "यदि अनुग्रह अवधि के भीतर प्रीमियम नहीं भरा जाता तो क्या होता है?",
        },
        explanation: {
          en: "The policy lapses and cover ceases until it is revived.",
          hi: "पॉलिसी व्यपगत हो जाती है और पुनर्जीवित होने तक कवर समाप्त रहता है।",
        },
        options: [
          { en: "The policy continues unchanged", hi: "पॉलिसी बिना बदलाव के चलती रहती है" },
          { en: "The policy lapses", hi: "पॉलिसी व्यपगत हो जाती है" },
          { en: "The sum assured doubles", hi: "बीमित राशि दोगुनी हो जाती है" },
          { en: "The insurer pays the premium", hi: "बीमाकर्ता प्रीमियम भर देता है" },
        ],
        correctIndex: 1,
      },
    ]),

    ...build("test-0007", [
      {
        statement: {
          en: "What is the minimum age to become an insurance agent in India?",
          hi: "भारत में बीमा एजेंट बनने की न्यूनतम आयु क्या है?",
        },
        explanation: {
          en: "An applicant must have completed 18 years of age.",
          hi: "आवेदक की आयु 18 वर्ष पूरी होनी चाहिए।",
        },
        options: [
          { en: "16 years", hi: "16 वर्ष" },
          { en: "18 years", hi: "18 वर्ष" },
          { en: "21 years", hi: "21 वर्ष" },
          { en: "25 years", hi: "25 वर्ष" },
        ],
        correctIndex: 1,
      },
      {
        statement: {
          en: "For how long is an agency licence typically valid?",
          hi: "एजेंसी लाइसेंस आमतौर पर कितने समय के लिए वैध होता है?",
        },
        explanation: {
          en: "Agency licences are ordinarily issued for three years.",
          hi: "एजेंसी लाइसेंस सामान्यतः तीन वर्ष के लिए जारी किया जाता है।",
        },
        options: [
          { en: "1 year", hi: "1 वर्ष" },
          { en: "3 years", hi: "3 वर्ष" },
          { en: "5 years", hi: "5 वर्ष" },
          { en: "Lifetime", hi: "आजीवन" },
        ],
        correctIndex: 1,
      },
      {
        statement: {
          en: "What is meant by 'mis-selling'?",
          hi: "'मिस-सेलिंग' से क्या तात्पर्य है?",
        },
        explanation: {
          en: "Selling a product by misrepresenting its features or suitability.",
          hi: "उत्पाद की विशेषताओं या उपयुक्तता को गलत बताकर बेचना।",
        },
        options: [
          { en: "Selling at a discounted premium", hi: "रियायती प्रीमियम पर बेचना" },
          { en: "Selling a product by misrepresenting its features", hi: "उत्पाद की विशेषताएँ गलत बताकर बेचना" },
          { en: "Selling through an online portal", hi: "ऑनलाइन पोर्टल के माध्यम से बेचना" },
          { en: "Selling to an existing customer", hi: "मौजूदा ग्राहक को बेचना" },
        ],
        correctIndex: 1,
      },
      {
        statement: {
          en: "Which document sets out the terms of the insurance contract?",
          hi: "बीमा अनुबंध की शर्तें किस दस्तावेज़ में निर्धारित होती हैं?",
        },
        explanation: {
          en: "The policy document is the contract between insurer and insured.",
          hi: "पॉलिसी दस्तावेज़ बीमाकर्ता और बीमित के बीच का अनुबंध है।",
        },
        options: [
          { en: "The proposal form", hi: "प्रस्ताव फॉर्म" },
          { en: "The policy document", hi: "पॉलिसी दस्तावेज़" },
          { en: "The premium receipt", hi: "प्रीमियम रसीद" },
          { en: "The claim form", hi: "दावा फॉर्म" },
        ],
        correctIndex: 1,
      },
      {
        statement: {
          en: "What is the purpose of a grievance redressal mechanism?",
          hi: "शिकायत निवारण तंत्र का उद्देश्य क्या है?",
        },
        explanation: {
          en: "It gives policyholders a defined route to resolve complaints.",
          hi: "यह पॉलिसीधारकों को शिकायतें सुलझाने का निर्धारित रास्ता देता है।",
        },
        options: [
          { en: "To increase policy sales", hi: "पॉलिसी बिक्री बढ़ाना" },
          { en: "To resolve policyholder complaints", hi: "पॉलिसीधारकों की शिकायतें सुलझाना" },
          { en: "To train new agents", hi: "नए एजेंटों को प्रशिक्षित करना" },
          { en: "To set premium rates", hi: "प्रीमियम दरें तय करना" },
        ],
        correctIndex: 1,
      },
    ]),
  ];
}

/**
 * Batches — 06-batch.md. `status` and `enrollmentOpen` are independent, with
 * three interacting rules (see the handlers).
 */
const seedBatches = () => [
  {
    id: "batch-0001",
    name: "IC-38 — Aug 2026 Cohort",
    description: "Primary cohort for the August intake.",
    status: "active",
    enrollmentOpen: true,
    startDate: "2026-08-15",
    endDate: "2026-11-15",
    createdBy: "ad-0000-0000-0000-000000000001",
    createdAt: "2026-08-01T09:00:00Z",
  },
  {
    id: "batch-0002",
    name: "IC-38 — Nov 2026 Cohort",
    description: "Not yet open.",
    status: "draft",
    enrollmentOpen: false,
    startDate: "2026-11-01",
    endDate: "2027-02-01",
    createdBy: "ad-0000-0000-0000-000000000001",
    createdAt: "2026-08-20T09:00:00Z",
  },
];

/** batch ──< batch_courses >── course */
const seedBatchCourses = () => [
  {
    batchId: "batch-0001",
    courseId: "course-0001",
    publishedAt: "2026-08-02T10:00:00Z",
  },
];

/** batch ──< batch_tests >── test. Only kind:"test" — quizzes ride their course. */
const seedBatchTests = () => [
  {
    batchId: "batch-0001",
    testId: "test-0001",
    publishedAt: "2026-08-02T10:05:00Z",
  },
];

/**
 * batch ──< batch_members >── learner.
 *
 * SEEDED ON PURPOSE. 06 §10: "Members are added only via enrollment approval —
 * there is no direct 'add member' API in v1." So nothing in Phase 4 can create
 * one; Phase 5 (07-enrollment.md) wires the real path onto these same records.
 */
const seedBatchMembers = () => [
  {
    batchId: "batch-0001",
    learnerId: "ln-0000-0000-0000-000000000001",
    isActive: true,
    joinedAt: "2026-08-05T08:30:00Z",
  },
];

/** Enrollment requests — enough to drive `myEnrollmentStatus` on 06 §12. */
const seedEnrollments = () => [
  {
    id: "enr-0001",
    learnerId: "ln-0000-0000-0000-000000000001",
    batchId: "batch-0001",
    status: "approved",
    submittedAt: "2026-08-04T12:00:00Z",
    reviewedAt: "2026-08-05T08:30:00Z",
    reviewNote: null,
  },
];

/** A couple of announcements so the learner arena is not empty on first run. */
const seedAnnouncements = () => [
  {
    id: "ann-0001",
    scope: "batch",
    batchId: "batch-0001",
    title: "Batch starts Monday",
    body: "Live sessions begin at 7pm. Please complete your profile before then.",
    isPinned: true,
    publishedAt: "2026-08-10T06:00:00Z",
    expiresAt: null,
    createdBy: "ad-0000-0000-0000-000000000001",
  },
  {
    id: "ann-0002",
    scope: "global",
    batchId: null,
    title: "Platform maintenance this weekend",
    body: "The platform will be briefly unavailable on Sunday morning.",
    isPinned: false,
    publishedAt: "2026-08-22T09:00:00Z",
    expiresAt: null,
    createdBy: "ad-0000-0000-0000-000000000001",
  },
  {
    // already expired — must be invisible to learners, visible to admins
    id: "ann-0003",
    scope: "global",
    batchId: null,
    title: "Old notice (expired)",
    body: "This should never appear in a learner feed.",
    isPinned: false,
    publishedAt: "2026-06-01T09:00:00Z",
    expiresAt: "2026-07-01T09:00:00Z",
    createdBy: "ad-0000-0000-0000-000000000001",
  },
];

/*
 * Demo volume lives in seedExtra.js and is merged in below. The fixtures above
 * are what the test suites pin to; everything imported here is breadth so the
 * screens render something real.
 */

/** Mutable store. `reset()` restores the seed. */
export const db = {
  accounts: [],
  roles: [],
  tests: [],
  questions: [],
  courses: [],
  batches: [],
  batchCourses: [],
  batchTests: [],
  batchMembers: [],
  enrollments: [],
  /** 10-submission.md — one row per attempt, so score history is retained. */
  attempts: [],
  /** 11-announcement.md */
  announcements: [],
  /** 12-notification.md — system-generated; there is no create endpoint. */
  notifications: [],
  /** accountId -> password, for accounts that changed theirs. */
  passwords: {},

  /**
   * @param {{ demo?: boolean }} [options]
   *   `demo: false` loads ONLY the minimal fixtures — no extra learners,
   *   attempts, notifications or volume. Test suites use it so their
   *   assertions pin to a known fixed state; the app uses the default.
   */
  reset({ demo = true } = {}) {
    this.accounts = SEED_ACCOUNTS.map((a) => ({ ...a }));
    this.roles = SEED_ROLES.map((r) => ({ ...r, permissions: [...r.permissions] }));
    this.tests = seedTests();
    this.questions = seedQuestions().map((q) => ({
      ...q,
      options: q.options.map((o) => ({ ...o })),
    }));
    this.courses = seedCourses().map((course) => ({
      ...course,
      units: course.units.map((unit) => ({
        ...unit,
        chapters: unit.chapters.map((chapter) => ({ ...chapter })),
      })),
    }));
    this.batches = seedBatches().map((b) => ({ ...b }));
    this.batchCourses = seedBatchCourses().map((r) => ({ ...r }));
    this.batchTests = seedBatchTests().map((r) => ({ ...r }));
    this.batchMembers = seedBatchMembers().map((r) => ({ ...r }));
    this.enrollments = seedEnrollments().map((r) => ({ ...r }));
    this.announcements = seedAnnouncements().map((a) => ({ ...a }));
    this.passwords = {};

    this.attempts = [];
    this.notifications = [];

    // ── demo volume (seedExtra.js) ─────────────────────────────────────────
    if (!demo) return;

    this.accounts.push(...extra.extraAccounts(), ...extra.extraStaff());
    this.batches.push(...extra.extraBatches());
    this.courses.push(
      ...extra.extraCourses().map((course) => ({
        ...course,
        units: course.units.map((unit) => ({
          ...unit,
          chapters: unit.chapters.map((chapter) => ({ ...chapter })),
        })),
      })),
    );
    this.findCourse("course-0001")?.units.push(extra.extraUnitForCourse1());

    this.tests.push(...extra.extraTests());
    this.questions.push(
      ...extra.extraQuestionsForTest1(),
      ...extra.extraQuestionsForQuiz(),
      ...extra.extraQuestionsForTest8(),
    );

    // the unit quiz now has content, so it can be published like a real one
    const quiz = this.tests.find((t) => t.id === "test-0004");
    if (quiz) quiz.status = "published";

    const links = extra.extraBatchLinks();
    this.batchCourses.push(...links.courses);
    this.batchTests.push(...links.tests);
    this.batchMembers.push(...extra.extraMembers());
    this.enrollments.push(...extra.extraEnrollments());
    this.announcements.push(...extra.extraAnnouncements());

    // totalMarks is computed, never authored — keep every test honest
    for (const test of this.tests) this.recomputeTotalMarks(test.id);

    /*
     * Attempts are generated LAST: they carry real answers referencing real
     * option ids, and are scored by scoreAttempt, so every figure downstream
     * follows arithmetically from the data above rather than being asserted.
     */
    this.attempts = extra.generateAttempts(this);
    this.notifications = extra.generateNotifications(this);
  },

  findAccountByIdentifier(identifier) {
    const needle = String(identifier ?? "").toLowerCase();
    return this.accounts.find(
      (a) => a.email.toLowerCase() === needle || a.username.toLowerCase() === needle,
    );
  },

  findAccountById(id) {
    return this.accounts.find((a) => a.id === id);
  },

  roleById(roleId) {
    return this.roles.find((r) => r.id === roleId);
  },

  /** Permissions granted by an account's role. Learners/super-admins get []. */
  permissionsFor(account) {
    if (!account || account.type !== "staff_admin") return [];
    return this.roleById(account.roleId)?.permissions ?? [];
  },

  questionsFor(testId) {
    return this.questions
      .filter((q) => q.testId === testId)
      .sort((a, b) => a.sequence - b.sequence);
  },

  // ── course tree (08-course.md) ────────────────────────────────────────────

  findCourse(courseId) {
    return this.courses.find((c) => c.id === courseId);
  },

  findUnit(courseId, unitId) {
    return this.findCourse(courseId)?.units.find((u) => u.id === unitId);
  },

  findChapter(courseId, unitId, chapterId) {
    return this.findUnit(courseId, unitId)?.chapters.find(
      (c) => c.id === chapterId,
    );
  },

  /**
   * The quiz attached to a unit, or null.
   *
   * This is the join between the course and test modules: a quiz is an
   * ordinary test with `kind:"quiz"` and a `unitId`. The course tree only ever
   * surfaces a reference — never question content or answer keys (08 §15).
   */
  quizForUnit(unitId) {
    const quiz = this.tests.find(
      (t) => t.kind === "quiz" && t.unitId === unitId,
    );
    if (!quiz) return null;

    return {
      id: quiz.id,
      title: quiz.title,
      kind: quiz.kind,
      status: quiz.status,
      questionCount: this.questionsFor(quiz.id).length,
    };
  },

  // ── learners (02-learner.md) ──────────────────────────────────────────────

  /**
   * 02 §2: `isComplete` is true only when all four enrollment-required fields
   * are present. Computed server-side so the client never re-derives the rule.
   */
  profileOf(account) {
    const p = account?.profile ?? {};
    const required = ["licAgentCode", "dob", "city", "experienceYears"];
    const missing = required.filter(
      (field) => p[field] === null || p[field] === undefined || p[field] === "",
    );
    return { ...p, isComplete: missing.length === 0 };
  },

  missingProfileFields(account) {
    const p = account?.profile ?? {};
    return ["licAgentCode", "dob", "city", "experienceYears"].filter(
      (field) => p[field] === null || p[field] === undefined || p[field] === "",
    );
  },

  /** Per-account password, so change-password can be verified for real. */
  passwordFor(accountId) {
    return this.passwords[accountId] ?? SEED_PASSWORD;
  },

  setPassword(accountId, password) {
    this.passwords[accountId] = password;
  },

  // ── batches (06-batch.md) ─────────────────────────────────────────────────

  findBatch(batchId) {
    return this.batches.find((b) => b.id === batchId);
  },

  /** Courses published into a batch, as full course records. */
  coursesInBatch(batchId) {
    return this.batchCourses
      .filter((link) => link.batchId === batchId)
      .map((link) => this.findCourse(link.courseId))
      .filter(Boolean);
  },

  /** Tests published into a batch, as full test records. */
  testsInBatch(batchId) {
    return this.batchTests
      .filter((link) => link.batchId === batchId)
      .map((link) => this.tests.find((t) => t.id === link.testId))
      .filter(Boolean);
  },

  /** Active membership only — a revoked member (isActive:false) is not one. */
  isActiveMember(batchId, learnerId) {
    return this.batchMembers.some(
      (m) => m.batchId === batchId && m.learnerId === learnerId && m.isActive,
    );
  },

  activeBatchesFor(learnerId) {
    return this.batchMembers
      .filter((m) => m.learnerId === learnerId && m.isActive)
      .map((m) => this.findBatch(m.batchId))
      .filter(Boolean);
  },

  enrollmentFor(learnerId, batchId) {
    return this.enrollments.find(
      (e) => e.learnerId === learnerId && e.batchId === batchId,
    );
  },

  /** Batch counts, as returned inline on every batch payload (06 §1). */
  countsFor(batchId) {
    return {
      courses: this.batchCourses.filter((l) => l.batchId === batchId).length,
      tests: this.batchTests.filter((l) => l.batchId === batchId).length,
      members: this.batchMembers.filter(
        (m) => m.batchId === batchId && m.isActive,
      ).length,
    };
  },

  /**
   * Can this learner reach this test?
   *
   * 10-submission.md §1 makes the rule compound, and the two halves work
   * completely differently:
   *
   *   kind="test" → published DIRECTLY into a batch the learner is in
   *   kind="quiz" → NEVER linked to a batch. Reached indirectly through
   *                 quiz → unit → course → batch.
   *
   * Implementing the second half as a direct batch lookup would silently deny
   * every quiz, which is why it's centralised here rather than repeated per
   * endpoint.
   */
  canLearnerAccessTest(learnerId, testId) {
    const test = this.tests.find((t) => t.id === testId);
    if (!test) return false;

    if (test.kind === "test") {
      return this.batchTests.some(
        (link) =>
          link.testId === testId && this.isActiveMember(link.batchId, learnerId),
      );
    }

    // quiz: find the course owning its unit, then check that course's batches
    if (!test.unitId) return false; // orphaned quiz reaches nobody
    const course = this.courses.find((c) =>
      c.units.some((u) => u.id === test.unitId),
    );
    if (!course) return false;

    return this.batchCourses.some(
      (link) =>
        link.courseId === course.id &&
        this.isActiveMember(link.batchId, learnerId),
    );
  },

  // ── announcements (11-announcement.md) ────────────────────────────────────

  /**
   * What a learner may see: global announcements plus those for batches they
   * actively belong to, with expired ones excluded. Admins see everything,
   * which is why expiry is filtered here rather than at write time.
   */
  announcementsFor(learnerId, { batchId = null, now = Date.now() } = {}) {
    const myBatches = new Set(
      this.activeBatchesFor(learnerId).map((b) => b.id),
    );

    return this.announcements
      .filter((a) => {
        if (a.expiresAt && new Date(a.expiresAt).getTime() <= now) return false;
        if (a.scope === "global") return true;
        if (!myBatches.has(a.batchId)) return false;
        return batchId ? a.batchId === batchId : true;
      })
      // pinned first, then newest (11 §6)
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return String(b.publishedAt).localeCompare(String(a.publishedAt));
      });
  },

  // ── attempts (10-submission.md) ───────────────────────────────────────────

  attemptsFor(learnerId, testId) {
    return this.attempts
      .filter((a) => a.learnerId === learnerId && a.testId === testId)
      .sort((a, b) => b.attemptNumber - a.attemptNumber);
  },

  activeAttempt(learnerId, testId) {
    return this.attempts.find(
      (a) =>
        a.learnerId === learnerId &&
        a.testId === testId &&
        a.status === "in_progress",
    );
  },

  /**
   * Any attempt at all, by anyone — the guard 09 §4/§8/§11/§12 use for
   * TEST_HAS_ATTEMPTS. Once a learner has sat a test, its scoring surface is
   * frozen.
   */
  testHasAttempts(testId) {
    return this.attempts.some((a) => a.testId === testId);
  },

  /**
   * The timeout sweep, run lazily.
   *
   * The contract describes a scheduled job. A browser mock has no scheduler,
   * so expiry is evaluated on every read and write instead. The OBSERVABLE
   * behaviour is identical — an expired attempt is always already `timed_out`
   * by the time anything looks at it — which is what the client depends on.
   */
  sweepExpiredAttempts(now = Date.now()) {
    for (const attempt of this.attempts) {
      if (attempt.status !== "in_progress") continue;
      if (!attempt.expiresAt) continue; // untimed attempts never expire
      if (new Date(attempt.expiresAt).getTime() > now) continue;

      attempt.status = "timed_out";
      // still scored from whatever was saved (10 §"Timeout sweep")
      this.scoreAttempt(attempt);
    }
  },

  /** score = sum of marks for questions answered with the correct option. */
  scoreAttempt(attempt) {
    const questions = this.questionsFor(attempt.testId);
    const test = this.tests.find((t) => t.id === attempt.testId);

    let score = 0;
    for (const question of questions) {
      const chosen = attempt.answers?.[question.id];
      // no negative marking in v1
      if (chosen && chosen === question.correctOptionId) score += question.marks ?? 0;
    }

    const totalMarks = questions.reduce((sum, q) => sum + (q.marks ?? 0), 0);
    attempt.score = score;
    attempt.totalMarks = totalMarks;
    attempt.percentage = totalMarks ? Math.round((score / totalMarks) * 100) : 0;
    attempt.passed = score >= (test?.passingMarks ?? 0);
    return attempt;
  },

  /** Best percentage across a learner's terminal attempts, or null. */
  bestScorePct(learnerId, testId) {
    const scored = this.attemptsFor(learnerId, testId).filter(
      (a) => a.status !== "in_progress",
    );
    if (!scored.length) return null;
    return Math.max(...scored.map((a) => a.percentage ?? 0));
  },

  /** Renumber `sequence` 1..N after an insert, delete or reorder. */
  resequence(items) {
    items.forEach((item, index) => {
      item.sequence = index + 1;
    });
    return items;
  },

  /** `totalMarks` is computed, never author-set (09-test.md model table). */
  recomputeTotalMarks(testId) {
    const test = this.tests.find((t) => t.id === testId);
    if (!test) return;
    test.totalMarks = this.questionsFor(testId).reduce(
      (sum, q) => sum + (q.marks ?? 0),
      0,
    );
    test.updatedAt = new Date().toISOString();
  },
};

db.reset();

let sequence = 1000;
export const nextId = (prefix) => `${prefix}-${++sequence}`;
