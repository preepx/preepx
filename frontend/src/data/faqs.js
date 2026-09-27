// Central FAQ data used across the entire PreepX platform.
// Import from this file wherever FAQs are needed — do NOT duplicate them inline.

export const ALL_FAQS = [
  {
    category: "general",
    q: "What is PreepX?",
    a: "PreepX is an AI-powered career and hiring platform that helps candidates prepare for interviews through AI mock interviews, assessments, and coding practice, while enabling recruiters to evaluate talent and manage hiring workflows.",
  },
  {
    category: "candidate",
    q: "Who can use PreepX?",
    a: "PreepX is built for both candidates — students, freshers, and working professionals — looking to prepare for jobs and improve their skills, and recruiters/companies looking to assess and hire top talent.",
  },
  {
    category: "candidate",
    q: "How does the AI mock interview work?",
    a: "Our AI agent acts as a real interviewer. It asks you questions, listens to your responses, generates intelligent follow-up questions, and provides detailed feedback on your performance including scores, strengths, and areas for improvement.",
  },
  {
    category: "candidate",
    q: "What is PreepX and how does it help me get hired?",
    a: "PreepX is an intelligent talent ecosystem that helps candidates practice real-time AI mock interviews, take objective assessments, earn verifiable certificates, and get discovered by top tech recruiters looking for proven skills.",
  },
  {
    category: "candidate",
    q: "Can I practise technical and HR interviews?",
    a: "Yes, PreepX supports a wide variety of interview types, including Technical, HR, Behavioral, and System Design interviews.",
  },
  {
    category: "candidate",
    q: "What roles and tech stacks can I practice for?",
    a: "You can practice for any role including Frontend, Backend, Full Stack, Data Science, DevOps, Mobile, and Product Management across stacks like React, Node.js, Python, Java, AWS, and more.",
  },
  {
    category: "candidate",
    q: "Can I take objective assessments?",
    a: "Yes, you can take multiple-choice and objective assessments to test your knowledge on specific topics and compare your scores on the leaderboard.",
  },
  {
    category: "candidate",
    q: "Can I practise coding?",
    a: "Yes, we have an integrated coding environment where you can solve problems in multiple languages and test your code against robust test cases.",
  },
  {
    category: "candidate",
    q: "Can I track my performance?",
    a: "Absolutely. Your dashboard provides detailed analytics, progress charts, performance tracking over time, interview scores, assessment scores, coding activity, and earned XP.",
  },
  {
    category: "candidate",
    q: "Are detailed interview notes and performance tips provided?",
    a: "Yes. After every mock session you receive comprehensive question-by-question scoring, model sample answers, and personalised strengths and weaknesses reports.",
  },
  {
    category: "candidate",
    q: "Can I find jobs on PreepX?",
    a: "Yes. Once you have built your profile and demonstrated your skills through assessments and interviews, you can apply for jobs directly through the PreepX job portal.",
  },
  {
    category: "general",
    q: "Are PreepX certificates verifiable?",
    a: "Yes. Every certificate issued by PreepX includes a unique verifiable credential ID that can be shared on LinkedIn, added to your resume, and verified by partner recruiters.",
  },
  {
    category: "general",
    q: "Is candidate audio and video data kept secure and private?",
    a: "Yes. Webcam feeds are processed locally for proctoring and feedback and are never stored or sold. Audio transcription and analytics comply with enterprise-grade data privacy standards. Read our Security page for full details.",
  },
  {
    category: "recruiter",
    q: "Can recruiters use PreepX?",
    a: "Yes. PreepX provides an end-to-end recruiter suite where hiring teams can create custom assessments, invite candidates, review automated evaluations and transcripts, shortlist top talent, and manage the technical hiring pipeline.",
  },
  {
    category: "recruiter",
    q: "How do recruiters use PreepX to hire faster?",
    a: "Recruiters create custom skill-based assessments, evaluate candidate code and responses with AI analytics, shortlist proven talent with confidence, and conduct seamless automated interviews.",
  },
  {
    category: "recruiter",
    q: "Can we customise assessment questions and rubrics?",
    a: "Yes. You can specify your exact job descriptions, required technical skills, and difficulty levels. The AI dynamically crafts tailored questions and grading rubrics.",
  },
  {
    category: "general",
    q: "How do PreepX coins work?",
    a: "Coins are the PreepX virtual currency used to unlock premium mock interviews, advanced assessments, and detailed AI feedback. You can earn coins through platform activity or purchase them.",
  },
  {
    category: "general",
    q: "How can I contact support?",
    a: "You can contact our support team at contact@preepx.in for any account, payment, technical or general queries.",
  },
];

// Filtered subsets for components that only need specific categories
export const CANDIDATE_FAQS = ALL_FAQS.filter(
  (f) => f.category === "candidate" || f.category === "general"
);

export const RECRUITER_FAQS = ALL_FAQS.filter(
  (f) => f.category === "recruiter" || f.category === "general"
);

// The subset used on the HowPreepXWorks page (keep interface compatibility)
export const HOW_PREEPX_WORKS_FAQS = [
  ALL_FAQS.find((f) => f.q === "What is PreepX?"),
  ALL_FAQS.find((f) => f.q === "Who can use PreepX?"),
  ALL_FAQS.find((f) => f.q === "Can I practise technical and HR interviews?"),
  ALL_FAQS.find((f) => f.q === "Can I practise coding?"),
  ALL_FAQS.find((f) => f.q === "Can I track my performance?"),
  ALL_FAQS.find((f) => f.q === "Can recruiters use PreepX?"),
  ALL_FAQS.find((f) => f.q === "Can I find jobs on PreepX?"),
];

// The original 8 FAQs shown on the homepage landing FaqSection
export const LANDING_FAQS = [
  ALL_FAQS.find((f) => f.q === "What is PreepX and how does it help me get hired?"),
  ALL_FAQS.find((f) => f.q === "How does the AI mock interview work?"),
  ALL_FAQS.find((f) => f.q === "How do recruiters use PreepX to hire faster?"),
  ALL_FAQS.find((f) => f.q === "What roles and tech stacks can I practice for?"),
  ALL_FAQS.find((f) => f.q === "Can we customise assessment questions and rubrics?"),
  ALL_FAQS.find((f) => f.q === "Are PreepX certificates verifiable?"),
  ALL_FAQS.find((f) => f.q === "Is candidate audio and video data kept secure and private?"),
  ALL_FAQS.find((f) => f.q === "Are detailed interview notes and performance tips provided?"),
].filter(Boolean);

