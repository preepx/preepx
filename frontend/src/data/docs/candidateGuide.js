// ─────────────────────────────────────────────────────────────
// src/data/docs/candidateGuide.js
// Candidate-facing documentation content
// ─────────────────────────────────────────────────────────────

export const aiInterviewSteps = [
  {
    step: "01",
    title: "Open AI Mock Interview",
    desc: "Navigate to the AI Mock Interview section from your dashboard.",
  },
  {
    step: "02",
    title: "Select interview type",
    desc: "Choose Technical, HR & Behavioral, or a combined interview session.",
  },
  {
    step: "03",
    title: "Select your role",
    desc: "Pick your preparation category — Frontend, Backend, Full Stack, DevOps, or Data.",
  },
  {
    step: "04",
    title: "Review session information",
    desc: "Check the interview duration, question count, and instructions before starting.",
  },
  {
    step: "05",
    title: "Start the interview",
    desc: "Allow microphone access when prompted and begin your session.",
  },
  {
    step: "06",
    title: "Answer questions",
    desc: "Speak your answers clearly. The AI listens, evaluates your response, and asks follow-up questions.",
  },
  {
    step: "07",
    title: "Complete the session",
    desc: "Finish all questions or end the session when you are ready.",
  },
  {
    step: "08",
    title: "Review your feedback",
    desc: "Your scorecard is generated immediately after the session ends.",
  },
];

export const feedbackCategories = [
  {
    title: "Communication",
    desc: "Evaluates clarity, pacing, tone, and professional delivery of your spoken responses.",
  },
  {
    title: "Answer Quality",
    desc: "Measures structure, completeness, relevance, and depth of your answers.",
  },
  {
    title: "Technical Performance",
    desc: "Validates technical correctness, conceptual depth, and accuracy.",
  },
  {
    title: "Strengths",
    desc: "Areas where your performance was above average in the session.",
  },
  {
    title: "Areas for Improvement",
    desc: "Specific topics and skills that need further practice.",
  },
  {
    title: "Next Practice",
    desc: "Recommended interview types and topics for your next session.",
  },
];

export const examSteps = [
  { step: "01", title: "Open Exams", desc: "Go to the Exams section from your dashboard." },
  { step: "02", title: "Select an exam", desc: "Choose a topic-wise test, full-length mock, or company-specific paper." },
  { step: "03", title: "Review instructions", desc: "Check time limit, question count, and rules before proceeding." },
  { step: "04", title: "Start the exam", desc: "Click Start and begin answering questions within the time limit." },
  { step: "05", title: "Answer questions", desc: "Select your answers for each multiple-choice question." },
  { step: "06", title: "Submit", desc: "Submit your exam when you have answered all questions or the time ends." },
  { step: "07", title: "Review results", desc: "See your score, correct answers, and topic-wise breakdown immediately." },
];

export const codingSteps = [
  { step: "01", title: "Open Coding Hub", desc: "Navigate to the Coding section from your dashboard." },
  { step: "02", title: "Select a problem", desc: "Browse problems by difficulty or topic category." },
  { step: "03", title: "Read the problem", desc: "Understand the requirements, constraints, and sample inputs." },
  { step: "04", title: "Write your solution", desc: "Use the integrated browser IDE to write your code in your preferred language." },
  { step: "05", title: "Test your solution", desc: "Run your code against sample test cases to check correctness." },
  { step: "06", title: "Submit", desc: "Submit your solution to evaluate it against all test cases." },
  { step: "07", title: "Review result", desc: "See which test cases passed, execution time, and any edge-case failures." },
];

export const resumeAtsSteps = [
  { step: "01", title: "Open Resume & ATS", desc: "Go to the Resume section from your profile or dashboard." },
  { step: "02", title: "Upload or paste your resume", desc: "Provide your resume content for analysis." },
  { step: "03", title: "Review the analysis", desc: "See the areas highlighted by the ATS analysis tool." },
  { step: "04", title: "Identify improvements", desc: "Review the suggestions provided by the tool." },
  { step: "05", title: "Update your resume", desc: "Make targeted improvements based on the analysis." },
];

export const jobPortalSteps = [
  { step: "01", title: "Explore", desc: "Browse available tech job listings on the PreepX job portal." },
  { step: "02", title: "Search & filter", desc: "Filter by role, location, skills, or seniority level." },
  { step: "03", title: "Review listing", desc: "Read the job description, requirements, and company details." },
  { step: "04", title: "Apply", desc: "Submit your application with your PreepX profile and verified scores." },
  { step: "05", title: "Prepare", desc: "Use PreepX tools to prepare specifically for the company and role." },
  { step: "06", title: "Interview", desc: "Attend the interview with confidence backed by your preparation." },
];

export const dashboardSections = [
  { title: "AI Interviews", desc: "Access and start new AI mock interview sessions." },
  { title: "Exams", desc: "Browse and take objective MCQ assessments." },
  { title: "Coding", desc: "Open the coding practice hub." },
  { title: "Notes", desc: "Access interview notes and revision resources." },
  { title: "Resume", desc: "Upload and analyse your resume using the ATS tool." },
  { title: "Jobs", desc: "Explore the job portal and apply for opportunities." },
  { title: "Performance", desc: "View your analytics, scores, and progress over time." },
  { title: "XP & Achievements", desc: "Check your earned XP, streaks, badges, and leaderboard rank." },
  { title: "Rewards", desc: "View available rewards and how to redeem them." },
  { title: "Profile", desc: "Update your personal details, career goals, and settings." },
];

export const gamificationItems = [
  {
    title: "XP (Experience Points)",
    desc: "Earned by completing interviews, passing exams, solving coding problems, and maintaining daily streaks.",
  },
  {
    title: "Streaks",
    desc: "Consecutive days of activity on PreepX. Maintaining a streak gives bonus XP multipliers.",
  },
  {
    title: "Badges",
    desc: "Earned for reaching milestones such as completing your first interview, passing exams, or maintaining long streaks.",
  },
  {
    title: "Leaderboard",
    desc: "A ranking of candidates based on XP earned. Top performers gain increased visibility to recruiters.",
  },
  {
    title: "Rewards",
    desc: "Selected rewards may be available based on performance milestones. Check the Rewards section for current availability.",
  },
];

export const bestPractices = [
  {
    title: "Practise consistently",
    desc: "Regular short sessions build more confidence than infrequent long ones.",
  },
  {
    title: "Review your feedback",
    desc: "Read your scorecard after every session and identify one area to focus on next.",
  },
  {
    title: "Focus on weak areas",
    desc: "Use topic-wise exams to target subjects where your scores are lower.",
  },
  {
    title: "Try all interview types",
    desc: "Practice Technical, HR, and role-specific interviews for well-rounded preparation.",
  },
  {
    title: "Keep your profile updated",
    desc: "An updated profile helps recruiters find and shortlist you more accurately.",
  },
  {
    title: "Prepare before applying",
    desc: "Use AI mock interviews to specifically prepare for a company or role before applying.",
  },
];
