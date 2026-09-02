/**
 * Demo volume — enough of every entity that each screen renders something
 * real, rather than an empty state.
 *
 * Kept separate from db.js on purpose. db.js holds the MINIMAL fixtures the
 * test suites pin their assertions to (priya, batch-0001, test-0001…); this
 * file adds breadth on top. If demo data ever has to go, one import goes with
 * it and the fixtures are untouched.
 *
 * The attempts below are NOT hardcoded scores. Each one carries a real
 * `answers` map of real option ids, and is scored by the same
 * `db.scoreAttempt()` the application uses — so every derived figure
 * (dashboards, leaderboards, score distributions, question performance) is
 * arithmetically consistent with the answers a learner supposedly gave.
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
const minutesAgo = (n) => new Date(Date.now() - n * 60 * 1000).toISOString();

// ── learners ───────────────────────────────────────────────────────────────

/**
 * Five more learners with distinct performance profiles, so charts have shape
 * and the leaderboard has a real ranking rather than a single row.
 */
export const EXTRA_LEARNERS = [
  {
    id: "ln-0000-0000-0000-000000000004",
    fullName: "Rahul Verma",
    email: "rahul@example.com",
    username: "rahulv",
    phone: "+919812300004",
    profile: { licAgentCode: "LIC-5521", dob: "1992-07-19", city: "Mumbai", experienceYears: 6 },
    /** fraction of questions answered correctly — drives generated attempts */
    ability: 0.95,
  },
  {
    id: "ln-0000-0000-0000-000000000005",
    fullName: "Sneha Patil",
    email: "sneha@example.com",
    username: "snehap",
    phone: "+919812300005",
    profile: { licAgentCode: "LIC-6108", dob: "1997-11-02", city: "Nashik", experienceYears: 3 },
    ability: 0.7,
  },
  {
    id: "ln-0000-0000-0000-000000000006",
    fullName: "Karan Mehta",
    email: "karan@example.com",
    username: "karanm",
    phone: "+919812300006",
    profile: { licAgentCode: "LIC-7734", dob: "1999-04-25", city: "Surat", experienceYears: 1 },
    ability: 0.35,
  },
  {
    id: "ln-0000-0000-0000-000000000007",
    fullName: "Divya Nair",
    email: "divya@example.com",
    username: "divyan",
    phone: "+919812300007",
    profile: { licAgentCode: "LIC-8890", dob: "1995-09-08", city: "Kochi", experienceYears: 4 },
    ability: 0, // enrollment still pending — never attempted anything
  },
  {
    id: "ln-0000-0000-0000-000000000008",
    fullName: "Imran Shaikh",
    email: "imran@example.com",
    username: "imrans",
    phone: "+919812300008",
    profile: { licAgentCode: "LIC-9042", dob: "1993-01-30", city: "Pune", experienceYears: 5 },
    ability: 0, // enrollment was rejected
  },
];

export const extraAccounts = () =>
  EXTRA_LEARNERS.map(({ ability, ...account }) => ({
    ...account,
    type: "learner",
    status: "active",
    roleId: null,
    createdAt: daysAgo(40),
  }));

/** A second staff-admin so the governance list is not a single row. */
export const extraStaff = () => [
  {
    id: "ad-0000-0000-0000-000000000004",
    type: "staff_admin",
    email: "deactivated@licgrow.test",
    username: "exmentor",
    fullName: "Former Mentor",
    status: "inactive",
    roleId: "role-viewer",
    createdAt: daysAgo(120),
  },
];

// ── batches ────────────────────────────────────────────────────────────────

/** A finished cohort, so the archived filter and batch analytics have data. */
export const extraBatches = () => [
  {
    id: "batch-0003",
    name: "IC-38 — Apr 2026 Cohort",
    description: "Completed cohort, retained for records.",
    status: "archived",
    enrollmentOpen: false,
    startDate: "2026-04-01",
    endDate: "2026-07-01",
    createdBy: "ad-0000-0000-0000-000000000001",
    createdAt: daysAgo(150),
  },
];

// ── courses ────────────────────────────────────────────────────────────────

/** A second publishable course, so "My courses" shows more than one card. */
export const extraCourses = () => [
  {
    id: "course-0004",
    title: "Claims, Underwriting & Servicing",
    description: "How a policy behaves after it is sold.",
    examTarget: "IC-38",
    status: "published",
    updatedAt: daysAgo(12),
    units: [
      {
        id: "unit-0010",
        title: "Underwriting Basics",
        sequence: 1,
        chapters: [
          {
            id: "chap-0010",
            title: "What Underwriters Look For",
            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            description: "Risk classification in plain terms.",
            sequence: 1,
          },
          {
            id: "chap-0011",
            title: "Medical vs Non-Medical Cases",
            youtubeUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
            description: null,
            sequence: 2,
          },
        ],
      },
      {
        id: "unit-0011",
        title: "The Claims Process",
        sequence: 2,
        chapters: [
          {
            id: "chap-0012",
            title: "Death Claims End to End",
            youtubeUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
            description: "Documentation, timelines and common rejections.",
            sequence: 1,
          },
          {
            id: "chap-0013",
            title: "Maturity and Survival Benefits",
            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            description: null,
            sequence: 2,
          },
        ],
      },
    ],
  },
];

/** A third unit on the existing course, so its tree is not uniformly shallow. */
export const extraUnitForCourse1 = () => ({
  id: "unit-0012",
  title: "Regulatory Framework",
  sequence: 3,
  chapters: [
    {
      id: "chap-0014",
      title: "IRDAI and the Agent",
      youtubeUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
      description: "Where an agent sits in the regulatory picture.",
      sequence: 1,
    },
  ],
});

// ── tests ──────────────────────────────────────────────────────────────────

/**
 * A CLOSED test. Its window has passed, so it exercises two things nothing
 * else does: the leaderboard opening (10 §7) and `after_close` review actually
 * revealing answers (10 §3).
 */
export const extraTests = () => [
  {
    id: "test-0008",
    kind: "test",
    unitId: null,
    title: "IC-38 Full Length — Set 2 (closed)",
    description: "Window has closed; results and leaderboard are open.",
    durationMinutes: 45,
    totalMarks: 0, // recomputed from questions on seed
    passingMarks: 6,
    maxAttempts: 2,
    cooldownMinutes: 0,
    shuffleQuestions: false,
    availableFrom: daysAgo(30),
    availableUntil: daysAgo(2),
    leaderboardEnabled: true,
    reviewPolicy: "after_close",
    status: "published",
    updatedAt: daysAgo(3),
  },
];

const bilingual = (en, hi) => ({ en, hi });

/**
 * Questions, built the same way as the archived sets: ids derived from
 * position so a mistyped `correctOptionId` is impossible.
 */
export function buildQuestions(testId, specs, startSequence = 1) {
  return specs.map((spec, index) => {
    const options = spec.options.map((text, i) => ({
      id: `${testId}-q${startSequence + index}-o${i + 1}`,
      text,
    }));

    return {
      id: `${testId}-q${startSequence + index}`,
      testId,
      sequence: startSequence + index,
      marks: spec.marks ?? 2,
      statement: spec.statement,
      explanation: spec.explanation ?? null,
      options,
      correctOptionId: options[spec.correctIndex].id,
    };
  });
}

/** Three more on test-0001, taking it from 2 questions to 5. */
export const extraQuestionsForTest1 = () =>
  buildQuestions(
    "test-0001",
    [
      {
        statement: bilingual(
          "Which document is the evidence of an insurance contract?",
          "बीमा अनुबंध का प्रमाण कौन सा दस्तावेज़ है?",
        ),
        explanation: bilingual(
          "The policy document evidences the contract.",
          "पॉलिसी दस्तावेज़ अनुबंध का प्रमाण है।",
        ),
        options: [
          bilingual("The proposal form", "प्रस्ताव फॉर्म"),
          bilingual("The policy document", "पॉलिसी दस्तावेज़"),
          bilingual("The premium receipt", "प्रीमियम रसीद"),
          bilingual("The agent's visiting card", "एजेंट का विजिटिंग कार्ड"),
        ],
        correctIndex: 1,
      },
      {
        statement: bilingual(
          "What is the grace period commonly allowed for annual premiums?",
          "वार्षिक प्रीमियम के लिए सामान्यतः कितनी अनुग्रह अवधि दी जाती है?",
        ),
        explanation: bilingual(
          "Thirty days is standard for yearly modes.",
          "वार्षिक मोड के लिए तीस दिन मानक है।",
        ),
        options: [
          bilingual("7 days", "7 दिन"),
          bilingual("15 days", "15 दिन"),
          bilingual("30 days", "30 दिन"),
          bilingual("90 days", "90 दिन"),
        ],
        correctIndex: 2,
      },
      {
        statement: bilingual(
          "Who bears the risk in a unit linked insurance plan?",
          "यूनिट लिंक्ड बीमा योजना में जोखिम कौन वहन करता है?",
        ),
        explanation: bilingual(
          "Investment risk sits with the policyholder in a ULIP.",
          "ULIP में निवेश जोखिम पॉलिसीधारक पर होता है।",
        ),
        options: [
          bilingual("The insurer alone", "केवल बीमाकर्ता"),
          bilingual("The policyholder", "पॉलिसीधारक"),
          bilingual("IRDAI", "आईआरडीएआई"),
          bilingual("The agent", "एजेंट"),
        ],
        correctIndex: 1,
      },
    ],
    3, // continues after the two already seeded
  );

/** The unit quiz gets real content so it can be published and attempted. */
export const extraQuestionsForQuiz = () =>
  buildQuestions("test-0004", [
    {
      marks: 1,
      statement: bilingual(
        "Life insurance primarily transfers which risk?",
        "जीवन बीमा मुख्य रूप से कौन सा जोखिम हस्तांतरित करता है?",
      ),
      explanation: bilingual(
        "The financial consequence of premature death.",
        "असामयिक मृत्यु का वित्तीय परिणाम।",
      ),
      options: [
        bilingual("Market risk", "बाजार जोखिम"),
        bilingual("Financial loss from early death", "जल्दी मृत्यु से वित्तीय हानि"),
        bilingual("Interest rate risk", "ब्याज दर जोखिम"),
      ],
      correctIndex: 1,
    },
    {
      marks: 1,
      statement: bilingual(
        "Who is the proposer in a life insurance contract?",
        "जीवन बीमा अनुबंध में प्रस्तावक कौन होता है?",
      ),
      explanation: bilingual(
        "The person who applies for and pays for the policy.",
        "वह व्यक्ति जो पॉलिसी के लिए आवेदन करता और भुगतान करता है।",
      ),
      options: [
        bilingual("The person applying for the policy", "पॉलिसी के लिए आवेदन करने वाला"),
        bilingual("The nominee", "नामांकित व्यक्ति"),
        bilingual("The underwriter", "अंडरराइटर"),
      ],
      correctIndex: 0,
    },
    {
      marks: 1,
      statement: bilingual(
        "What does a survival benefit pay out on?",
        "उत्तरजीविता लाभ किस पर देय होता है?",
      ),
      explanation: bilingual(
        "It is paid while the life assured is still living.",
        "यह बीमित व्यक्ति के जीवित रहते हुए दिया जाता है।",
      ),
      options: [
        bilingual("Death of the life assured", "बीमित की मृत्यु"),
        bilingual("The life assured surviving a set period", "बीमित का निर्धारित अवधि तक जीवित रहना"),
        bilingual("Policy lapse", "पॉलिसी व्यपगत होना"),
      ],
      correctIndex: 1,
    },
  ]);

/** Five for the closed test, so its leaderboard and histogram mean something. */
export const extraQuestionsForTest8 = () =>
  buildQuestions("test-0008", [
    {
      statement: bilingual(
        "What is 'insurable interest'?",
        "'बीमा योग्य हित' क्या है?",
      ),
      explanation: bilingual(
        "A financial stake in the continued life of the insured.",
        "बीमित के जीवित रहने में वित्तीय हित।",
      ),
      options: [
        bilingual("Interest earned on the premium", "प्रीमियम पर अर्जित ब्याज"),
        bilingual("A financial stake in the insured's life", "बीमित के जीवन में वित्तीय हित"),
        bilingual("The agent's commission", "एजेंट का कमीशन"),
        bilingual("The bonus rate", "बोनस दर"),
      ],
      correctIndex: 1,
    },
    {
      statement: bilingual(
        "When must insurable interest exist in a life policy?",
        "जीवन पॉलिसी में बीमा योग्य हित कब होना चाहिए?",
      ),
      explanation: bilingual(
        "At the time the contract is taken out.",
        "अनुबंध लेते समय।",
      ),
      options: [
        bilingual("Only at the time of claim", "केवल दावे के समय"),
        bilingual("At inception of the policy", "पॉलिसी के आरंभ में"),
        bilingual("Every renewal", "हर नवीनीकरण पर"),
        bilingual("It is never required", "यह कभी आवश्यक नहीं"),
      ],
      correctIndex: 1,
    },
    {
      statement: bilingual(
        "What is a paid-up policy?",
        "पेड-अप पॉलिसी क्या है?",
      ),
      explanation: bilingual(
        "Cover continues at a reduced sum assured after premiums stop.",
        "प्रीमियम रुकने के बाद घटी हुई बीमित राशि पर कवर जारी रहता है।",
      ),
      options: [
        bilingual("A policy with all premiums paid in advance", "सभी प्रीमियम अग्रिम भुगतान वाली पॉलिसी"),
        bilingual("A lapsed policy continuing at a reduced sum assured", "घटी बीमित राशि पर जारी व्यपगत पॉलिसी"),
        bilingual("A cancelled policy", "रद्द की गई पॉलिसी"),
        bilingual("A policy with no nominee", "बिना नामांकित की पॉलिसी"),
      ],
      correctIndex: 1,
    },
    {
      statement: bilingual(
        "What does 'surrender value' mean?",
        "'समर्पण मूल्य' का क्या अर्थ है?",
      ),
      explanation: bilingual(
        "The amount payable if the policy is terminated early.",
        "पॉलिसी जल्दी समाप्त करने पर देय राशि।",
      ),
      options: [
        bilingual("The total premium paid", "कुल भुगतान किया गया प्रीमियम"),
        bilingual("The amount payable on early termination", "जल्दी समाप्ति पर देय राशि"),
        bilingual("The death benefit", "मृत्यु लाभ"),
        bilingual("The annual bonus", "वार्षिक बोनस"),
      ],
      correctIndex: 1,
    },
    {
      statement: bilingual(
        "Which of these is NOT a duty of an insurance agent?",
        "इनमें से कौन बीमा एजेंट का कर्तव्य नहीं है?",
      ),
      explanation: bilingual(
        "Settling claims is the insurer's function, not the agent's.",
        "दावों का निपटान बीमाकर्ता का कार्य है, एजेंट का नहीं।",
      ),
      options: [
        bilingual("Explaining product features honestly", "उत्पाद की विशेषताएँ ईमानदारी से समझाना"),
        bilingual("Helping complete the proposal form", "प्रस्ताव फॉर्म भरने में मदद करना"),
        bilingual("Deciding and settling claims", "दावों का निर्णय और निपटान करना"),
        bilingual("Servicing the policyholder", "पॉलिसीधारक की सेवा करना"),
      ],
      correctIndex: 2,
    },
  ]);

// ── membership and enrollment ──────────────────────────────────────────────

export const extraMembers = () => [
  { batchId: "batch-0001", learnerId: "ln-0000-0000-0000-000000000004", isActive: true, joinedAt: daysAgo(35) },
  { batchId: "batch-0001", learnerId: "ln-0000-0000-0000-000000000005", isActive: true, joinedAt: daysAgo(33) },
  { batchId: "batch-0001", learnerId: "ln-0000-0000-0000-000000000006", isActive: true, joinedAt: daysAgo(30) },
  // a revoked member, so the roster shows both states
  { batchId: "batch-0001", learnerId: "ln-0000-0000-0000-000000000008", isActive: false, joinedAt: daysAgo(28) },
  // the archived cohort
  { batchId: "batch-0003", learnerId: "ln-0000-0000-0000-000000000004", isActive: true, joinedAt: daysAgo(140) },
];

/**
 * All three states, because the review queue defaults to `pending` and would
 * otherwise open on an empty list.
 */
export const extraEnrollments = () => [
  { id: "enr-0002", learnerId: "ln-0000-0000-0000-000000000004", batchId: "batch-0001", status: "approved",
    motivation: "Switching careers into insurance advisory.",
    applicantSnapshot: { licAgentCode: "LIC-5521", city: "Mumbai", experienceYears: 6 },
    submittedAt: daysAgo(36), reviewedAt: daysAgo(35), reviewedBy: "ad-0000-0000-0000-000000000001", reviewNote: null },
  { id: "enr-0003", learnerId: "ln-0000-0000-0000-000000000005", batchId: "batch-0001", status: "approved",
    motivation: "Preparing for the IC-38 exam this quarter.",
    applicantSnapshot: { licAgentCode: "LIC-6108", city: "Nashik", experienceYears: 3 },
    submittedAt: daysAgo(34), reviewedAt: daysAgo(33), reviewedBy: "ad-0000-0000-0000-000000000001", reviewNote: null },
  { id: "enr-0004", learnerId: "ln-0000-0000-0000-000000000006", batchId: "batch-0001", status: "approved",
    motivation: null,
    applicantSnapshot: { licAgentCode: "LIC-7734", city: "Surat", experienceYears: 1 },
    submittedAt: daysAgo(31), reviewedAt: daysAgo(30), reviewedBy: "ad-0000-0000-0000-000000000002", reviewNote: null },
  { id: "enr-0005", learnerId: "ln-0000-0000-0000-000000000007", batchId: "batch-0001", status: "pending",
    motivation: "I want to complete the certification before the next exam window.",
    applicantSnapshot: { licAgentCode: "LIC-8890", city: "Kochi", experienceYears: 4 },
    submittedAt: daysAgo(2), reviewedAt: null, reviewedBy: null, reviewNote: null },
  { id: "enr-0006", learnerId: "ln-0000-0000-0000-000000000003", batchId: "batch-0001", status: "pending",
    motivation: "Keen to start as soon as possible.",
    applicantSnapshot: { licAgentCode: null, city: null, experienceYears: null },
    submittedAt: daysAgo(1), reviewedAt: null, reviewedBy: null, reviewNote: null },
  { id: "enr-0007", learnerId: "ln-0000-0000-0000-000000000008", batchId: "batch-0001", status: "rejected",
    motivation: "Interested.",
    applicantSnapshot: { licAgentCode: "LIC-9042", city: "Pune", experienceYears: 5 },
    submittedAt: daysAgo(20), reviewedAt: daysAgo(19), reviewedBy: "ad-0000-0000-0000-000000000001",
    reviewNote: "Please add more detail about your goals and re-apply." },
];

export const extraBatchLinks = () => ({
  courses: [
    { batchId: "batch-0001", courseId: "course-0004", publishedAt: daysAgo(12) },
    { batchId: "batch-0003", courseId: "course-0001", publishedAt: daysAgo(140) },
  ],
  tests: [
    { batchId: "batch-0001", testId: "test-0008", publishedAt: daysAgo(30) },
  ],
});

export const extraAnnouncements = () => [
  {
    id: "ann-0004",
    scope: "batch",
    batchId: "batch-0001",
    title: "Set 2 results are out",
    body: "The window for Full Length Set 2 has closed. Scores, answer review and the leaderboard are now available.",
    isPinned: false,
    publishedAt: daysAgo(2),
    expiresAt: null,
    createdBy: "ad-0000-0000-0000-000000000001",
  },
  {
    id: "ann-0005",
    scope: "batch",
    batchId: "batch-0001",
    title: "New course: Claims & Underwriting",
    body: "Four new video chapters have been added to your batch.",
    isPinned: false,
    publishedAt: daysAgo(12),
    expiresAt: null,
    createdBy: "ad-0000-0000-0000-000000000002",
  },
];

// ── generated activity ─────────────────────────────────────────────────────

/**
 * Deterministic per (learner, question) choice.
 *
 * A learner with ability 0.7 gets ~70% right, but ALWAYS the same 70% — a
 * dashboard whose numbers shuffle on every reload is worse than useless when
 * you are trying to check whether a component renders correctly.
 */
function answersFor(questions, learnerId, ability, salt) {
  const answers = {};

  questions.forEach((question, index) => {
    // cheap stable hash of learner + question + salt
    let hash = salt * 31 + index;
    for (const char of learnerId) hash = (hash * 31 + char.charCodeAt(0)) | 0;
    const roll = Math.abs(hash % 100) / 100;

    if (roll < ability) {
      answers[question.id] = question.correctOptionId;
    } else {
      const wrong = question.options.filter((o) => o.id !== question.correctOptionId);
      // pick a stable wrong option, so distractor analytics have a shape
      answers[question.id] = wrong[Math.abs(hash) % wrong.length].id;
    }
  });

  return answers;
}

/**
 * Attempts across the seeded learners.
 *
 * Scored by the caller with `db.scoreAttempt`, never hardcoded — so the
 * percentages on every screen genuinely follow from the answers stored here.
 */
export function generateAttempts(db) {
  const attempts = [];
  let counter = 0;

  const PLAN = [
    // learnerId suffix, testId, attempt count, ability, days ago of the first
    { learner: "ln-0000-0000-0000-000000000001", test: "test-0001", count: 2, ability: 0.8, from: 9 },
    // deliberately mid-range, so the primary demo account shows a MIX of
    // score tones rather than a wall of green
    { learner: "ln-0000-0000-0000-000000000001", test: "test-0008", count: 1, ability: 0.55, from: 5 },
    { learner: "ln-0000-0000-0000-000000000004", test: "test-0001", count: 1, ability: 0.95, from: 8 },
    { learner: "ln-0000-0000-0000-000000000004", test: "test-0008", count: 2, ability: 0.95, from: 6 },
    { learner: "ln-0000-0000-0000-000000000005", test: "test-0001", count: 2, ability: 0.65, from: 7 },
    { learner: "ln-0000-0000-0000-000000000005", test: "test-0008", count: 1, ability: 0.7, from: 4 },
    { learner: "ln-0000-0000-0000-000000000006", test: "test-0001", count: 1, ability: 0.35, from: 6 },
    { learner: "ln-0000-0000-0000-000000000006", test: "test-0008", count: 2, ability: 0.4, from: 5 },
    // the unit quiz, reached through its course
    { learner: "ln-0000-0000-0000-000000000001", test: "test-0004", count: 1, ability: 1, from: 3 },
    { learner: "ln-0000-0000-0000-000000000005", test: "test-0004", count: 1, ability: 0.67, from: 3 },
  ];

  for (const row of PLAN) {
    const questions = db.questionsFor(row.test);
    if (!questions.length) continue;

    for (let n = 0; n < row.count; n += 1) {
      counter += 1;
      // later attempts are a little stronger, which is what makes the trend
      // line on the learner dashboard move
      const ability = Math.min(1, row.ability + n * 0.12);
      const startedAt = daysAgo(row.from - n);

      const attempt = {
        id: `att-seed-${counter}`,
        testId: row.test,
        learnerId: row.learner,
        attemptNumber: n + 1,
        status: "submitted",
        questionOrder: questions.map((q) => q.id),
        answers: answersFor(questions, row.learner, ability, counter),
        contentLang: "en",
        startedAt,
        expiresAt: null,
        submittedAt: new Date(
          new Date(startedAt).getTime() + (18 + counter % 12) * 60 * 1000,
        ).toISOString(),
        score: null,
        totalMarks: null,
        percentage: null,
        passed: null,
      };

      db.scoreAttempt(attempt);
      attempts.push(attempt);
    }
  }

  // one live attempt, so "resume" and the in_progress state are reachable
  const liveQuestions = db.questionsFor("test-0001");
  if (liveQuestions.length) {
    attempts.push({
      id: "att-seed-live",
      testId: "test-0001",
      learnerId: "ln-0000-0000-0000-000000000006",
      attemptNumber: 2,
      status: "in_progress",
      questionOrder: liveQuestions.map((q) => q.id),
      answers: { [liveQuestions[0].id]: liveQuestions[0].correctOptionId },
      contentLang: "en",
      startedAt: minutesAgo(10),
      // generous window so it does not time out mid-demo
      expiresAt: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
      submittedAt: null,
      score: null,
      totalMarks: null,
      percentage: null,
      passed: null,
    });
  }

  return attempts;
}

/** A few unread notifications, so the bell badge is not permanently zero. */
export function generateNotifications(db) {
  const rows = [];
  let counter = 0;

  const push = (recipientId, type, title, body, entityType, entityId, ageDays, isRead) => {
    counter += 1;
    rows.push({
      id: `ntf-seed-${counter}`,
      recipientId,
      type,
      title,
      body,
      relatedEntityType: entityType,
      relatedEntityId: entityId,
      isRead,
      readAt: isRead ? daysAgo(ageDays - 0.5) : null,
      createdAt: daysAgo(ageDays),
    });
  };

  // learners
  for (const learnerId of [
    "ln-0000-0000-0000-000000000001",
    "ln-0000-0000-0000-000000000004",
    "ln-0000-0000-0000-000000000005",
  ]) {
    push(learnerId, "ANNOUNCEMENT_POSTED", "Set 2 results are out",
      "Scores, answer review and the leaderboard are now available.",
      "announcement", "ann-0004", 2, false);
    push(learnerId, "COURSE_PUBLISHED", "New course available",
      '"Claims, Underwriting & Servicing" was added to your batch.',
      "course", "course-0004", 12, true);
  }

  push("ln-0000-0000-0000-000000000001", "ENROLLMENT_APPROVED", "You're in!",
    "Your enrollment for IC-38 — Aug 2026 Cohort was approved.",
    "batch", "batch-0001", 26, true);

  push("ln-0000-0000-0000-000000000008", "ENROLLMENT_REJECTED", "Enrollment not approved",
    "Your enrollment for IC-38 — Aug 2026 Cohort was not approved.",
    "enrollment", "enr-0007", 19, false);

  // reviewers get the two pending requests
  for (const adminId of [
    "ad-0000-0000-0000-000000000001",
    "ad-0000-0000-0000-000000000002",
  ]) {
    push(adminId, "ENROLLMENT_REQUESTED", "New enrollment request",
      "Divya Nair requested to join IC-38 — Aug 2026 Cohort.",
      "enrollment", "enr-0005", 2, false);
    push(adminId, "ENROLLMENT_REQUESTED", "New enrollment request",
      "Arjun Newcomer requested to join IC-38 — Aug 2026 Cohort.",
      "enrollment", "enr-0006", 1, false);
  }

  return rows;
}
