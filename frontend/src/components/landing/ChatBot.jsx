import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  X, Send, Bot, RefreshCw, Sparkles,
  Mic, Code2, FileText, Target, BookOpen, Building2, Trophy, IndianRupee,
  ClipboardList, BarChart2, Zap, Phone, Briefcase
} from "lucide-react";
import "@/styles/landing/ChatBot.css";

const BOT_NAME = "PreepX AI Concierge";
const BOT_TAGLINE = "Interview Prep Assistant";
const BOT_VERSION = "v1.0 Agent";

// ── QUICK CHIPS BY MODE ──
const CANDIDATE_CHIPS = [
  { label: "Apply for Jobs", icon: <Briefcase size={14} /> },
  { label: "Take Assessments", icon: <ClipboardList size={14} /> },
  { label: "Mock Interview", icon: <Mic size={14} /> },
  { label: "Coding Hub", icon: <Code2 size={14} /> },
  { label: "ATS Score", icon: <FileText size={14} /> },
  { label: "Objective Exam", icon: <Target size={14} /> },
  { label: "BTech Notes", icon: <BookOpen size={14} /> },
  { label: "Company Prep", icon: <Building2 size={14} /> },
  { label: "Leaderboard", icon: <Trophy size={14} /> },
  { label: "Pricing", icon: <IndianRupee size={14} /> },
];

const RECRUITER_CHIPS = [
  { label: "Post a Job", icon: <Briefcase size={14} /> },
  { label: "AI Resume Screening", icon: <FileText size={14} /> },
  { label: "Hiring Platform", icon: <Building2 size={14} /> },
  { label: "Custom Assessments", icon: <ClipboardList size={14} /> },
  { label: "AI Candidate Scoring", icon: <Bot size={14} /> },
  { label: "Schedule Interviews", icon: <Mic size={14} /> },
  { label: "Hiring Pipeline", icon: <BarChart2 size={14} /> },
  { label: "Recruiter Pricing", icon: <IndianRupee size={14} /> },
  { label: "Fast-Track Hiring", icon: <Zap size={14} /> },
  { label: "Contact Sales", icon: <Phone size={14} /> },
];

// ── COMPLETE KNOWLEDGE BASE ──
const KB = {
  greeting: `Welcome to **PreepX AI Concierge**! 🤖✨\n\nI'm here to help you with everything about PreepX — India's smartest interview prep platform.\n\nYou can ask me about:\n💼 Apply for Jobs • 📋 Assessments\n🎤 Mock Interviews • 💻 Coding Hub • 📄 ATS Score\n🏆 Leaderboard • 📚 BTech Notes • 🏢 Company Prep\n🎯 Objective Exams • 💰 Pricing • 🎁 Rewards & XP\n\nWhat would you like to know?`,

  jobs: `💼 **Apply for Jobs**\n\nFind your dream role directly on PreepX!\n\n**Features:**\n• Browse open positions from top startups and MNCs\n• 1-click apply using your PreepX profile\n• Track your application status in real-time\n• Get direct invites from recruiters based on your Leaderboard rank\n\n**Tip:** Keep your ATS Resume Score high to get shortlisted faster!\n\n➡️ **View Jobs:** /jobs`,

  assessments: `📋 **Candidate Assessments**\n\nProve your skills to recruiters through customized tests!\n\n**How it works:**\n• Recruiters send you Assessment links when you apply\n• Tests can include Coding, MCQ, or Video answers\n• AI evaluates and scores your performance\n• Pass the assessment to move directly to the interview round\n\n**Why it's great:**\n• Skip the resume queue\n• Stand out based entirely on your actual skills\n\n➡️ **View Pending Assessments:** /dashboard`,

  mock: `🎤 **AI Mock Interview**\n\nPreepX's flagship feature — practice just like real interviews!\n\n**How it works:**\n• Groq-powered AI evaluates your voice in real-time\n• Technical accuracy, completeness, and clarity are checked\n• Receive a **detailed performance report** after every session\n• Question-by-question scoring + model sample answers\n• Personalized **strengths & weaknesses report**\n\n**You can practice:**\n• Frontend, Backend, Full Stack, Data Science\n• DevOps, Mobile, Product Management\n• React, Node.js, Python, Java, AWS and more\n\n**Features:**\n• Camera-based proctoring (data is not stored)\n• Role & company-specific questions\n• Verified certificates upon completion\n• Streaks & XP rewards\n\n➡️ **Get started:** /interview`,

  coding: `💻 **Coding Hub — 100 Days Challenge**\n\nBuild structured DSA practice and coding consistency!\n\n**Features:**\n• **Daily coding problems** — Easy, Medium, Hard\n• **Company-wise question banks** — Google, Amazon, Microsoft, etc.\n• **100 Days Challenge** — Streak tracking for consistency\n• **Leaderboard** — Compete with thousands of students\n• Earn **XP Coins** for every problem solved\n• **Verified certificates** after challenge completion\n\n**Topics covered:**\n• Arrays, Strings, Linked Lists\n• Trees, Graphs, Dynamic Programming\n• Binary Search, Sorting, Hashing\n• System Design basics\n\n**Bonus:** Company-wise interview questions (Top 50 companies)\n\n➡️ **Start coding:** /100-days-challenge`,

  ats: `📄 **ATS Resume Score Checker**\n\nATS = Applicant Tracking System — used by recruiters to filter resumes!\n\n**PreepX ATS Features:**\n• Upload your resume and get an **instant ATS score**\n• AI highlights missing keywords\n• **Tailored suggestions** to improve your score\n• Match your resume against Job Descriptions\n• Format and structure improvement tips\n\n**Why it matters:**\n• 75% of resumes are rejected by ATS filters\n• The right keywords increase shortlisting by 3x\n• Top companies (TCS, Infosys, Google, etc.) all use ATS\n\n**Included in:** 7-Day (₹79) and 1-Month (₹299) plans\n\n➡️ **Check your resume:** /ats-score`,

  pricing: `💰 **PreepX Pricing Plans**\n\n━━━ **FOR CANDIDATES** ━━━\n\n📅 **7 Days — ₹79** ~~₹99~~\n• Unlimited AI Mock Interviews\n• Unlimited Objective Exams\n• Unlimited ATS Resume Scans\n• Top Companies Preparation\n\n🔥 **1 Month — ₹299** ~~₹349~~ *(Most Popular)*\n• Everything in 7 Days\n• Full Coding Hub access\n• Performance Analytics\n• Verified Certificates\n\n━━━ **FOR RECRUITERS** ━━━\n\n🏢 **Starter — ₹1,999/mo**\n• 5 Job Posts/month\n• AI Candidate Scoring\n• Basic Hiring Pipeline\n\n⭐ **Growth — ₹3,999/mo** *(Best Value)*\n• 20 Job Posts/month\n• Advanced AI Insights\n• Automated Screening\n\n🏗️ **Enterprise — Custom Pricing**\n• Unlimited posts, SSO, API access\n• Dedicated Account Manager\n\n**Available for FREE:**\n• BTech Notes (100% free)\n• Basic Dashboard\n• Earn XP Coins\n\n➡️ **Subscribe:** /wallet`,

  leaderboard: `🏆 **Leaderboard & Rewards**\n\nCompete on PreepX and reach the top!\n\n**How to earn XP:**\n• 🎤 Complete Mock Interviews → Earn XP\n• 💻 Solve coding problems → Earn XP\n• 📅 Maintain daily streak → Bonus XP\n• 🎯 Take Objective exams → Earn XP\n• 🔥 100 Days Challenge → Massive XP reward\n\n**Leaderboard Types:**\n• Weekly Rankings\n• All-Time Rankings\n• College/Region wise rankings\n\n**Rewards & Benefits:**\n• Top performers are **directly contacted by recruiters**\n• Redeem XP coins for **premium features**\n• Exclusive badges and verified achievements\n• Convert XP to **Wallet balance**\n\n**Achievement System:**\n• Streak badges (7, 30, 100 days)\n• Interview completion milestones\n• Coding challenge rewards\n\n➡️ **View Leaderboard:** /leaderboard`,

  notes: `📚 **BTech Notes — 100% FREE!**\n\nOur most popular free feature!\n\n**What you get:**\n• Complete CS subject notes — organized semester-wise\n• Exam-ready quick revision material\n• PDF download support\n• Offline access\n\n**Subjects covered:**\n• Data Structures & Algorithms\n• Operating Systems\n• Database Management Systems (DBMS)\n• Computer Networks\n• Software Engineering\n• Theory of Computation\n• Computer Organization & Architecture\n• Compiler Design\n• And many more!\n\n**Best part:** Register and get **instant access** — no payment required!\n\n➡️ **Access Notes:** /btech-notes`,

  company: `🏢 **Company-Wise Preparation**\n\nTargeted preparation for top companies!\n\n**Available Companies:**\n• Google, Amazon, Microsoft\n• TCS, Infosys, Wipro\n• Flipkart, Swiggy, Zomato\n• Paytm, PhonePe, Razorpay\n• And 40+ more top companies!\n\n**What you get per company:**\n• Company-specific interview questions bank\n• Commonly asked DSA problems\n• HR & behavioral question sets\n• Interview experience roundups\n• Difficulty-wise segregated questions\n\n**Features:**\n• Questions tagged by rounds (Technical, HR, System Design)\n• Real interview experiences from placed candidates\n• Company-wise coding challenges\n\n➡️ **Start Company Prep:** /company-prep`,

  mcq: `🎯 **Objective Exam (MCQ)**\n\nTest your knowledge and earn certificates!\n\n**Features:**\n• Subject-wise MCQ tests\n• Timed examinations with proctoring\n• Auto-evaluated results\n• **Detailed answer explanations** after submission\n• Attempt history & score tracking\n\n**Available Subjects:**\n• Computer Science fundamentals\n• DSA & Algorithms\n• Web Technologies\n• Database & SQL\n• Aptitude & Reasoning\n• Core CS subjects\n\n**On Completion:**\n• Instant score card\n• Percentage & grade display\n• **Downloadable certificate** (verified with unique ID)\n• XP coins reward\n• Performance analytics\n\n➡️ **Take an Exam:** /objective-exam`,

  wallet: `💳 **Wallet & XP Coins System**\n\nPreepX's unique reward economy!\n\n**How to earn XP Coins:**\n• Complete mock interviews\n• Solve coding problems\n• Maintain daily login streak\n• Bonus coins from referrals\n• Achievement milestones\n\n**How to use XP Coins:**\n• Unlock premium features\n• Redeem for subscription plans\n• Special rewards and badges\n• Exclusive content access\n\n**Wallet Features:**\n• Real-time balance tracking\n• Transaction history\n• Purchase coin packages\n• Referral bonus tracking\n\n➡️ **View Wallet:** /wallet`,

  certificate: `🏅 **Verified Certificates**\n\nIndustry-recognized proof of your skills!\n\n**Certificate Types:**\n• Mock Interview Completion Certificate\n• 100 Days Coding Challenge Certificate\n• Objective Exam Score Certificate\n• Subject Mastery Certificate\n\n**Features:**\n• **Unique verifiable credential ID** — Add it to your LinkedIn\n• QR code-based verification\n• **Recruiter-verified** on PreepX platform\n• PDF download available\n• Mention it directly on your resume\n\n**Who accepts it:**\n• 500+ partner recruiters on PreepX\n• LinkedIn profile enhancement\n• Portfolio showcase\n\nCertificates are available for the 100 Days Challenge and Objective Exams! 🎉`,

  recruiter: `🏢 **PreepX Hiring Platform — For Recruiters**\n\nAI-powered end-to-end recruitment ecosystem!\n\n**Core Features:**\n• Create custom skill-based assessments\n• AI candidate scoring and automated ranking\n• Automated resume screening pipeline\n• Side-by-side candidate comparison tools\n• Proctored video interview integration\n• Real-time hiring analytics dashboard\n\n**How it works (4 Steps):**\n1️⃣ Upload your job description\n2️⃣ AI automatically generates a tailored assessment\n3️⃣ Candidates apply and take the AI-proctored test\n4️⃣ Shortlist top talent from the ranked leaderboard\n\n**Why PreepX for Hiring:**\n• ⚡ 3x faster time-to-hire\n• 🤖 Bias-free AI evaluation\n• ✅ Verified skill certificates\n• 🔒 Enterprise-grade data privacy\n• 📊 Deep hiring analytics\n\n➡️ **Start Hiring:** /auth?role=recruiter`,

  recruiterAssessments: `📋 **Custom Assessments for Recruiters**\n\nDesign assessments tailored to your needs!\n\n**Customization Options:**\n• Auto-generate questions from job descriptions\n• Manual question bank creation\n• Set difficulty levels (Easy/Medium/Hard)\n• Configure time limits\n• Proctoring settings (camera, screen, AI detection)\n\n**Assessment Types:**\n• 💻 Coding challenges (50+ languages)\n• 📝 MCQ / Theory tests\n• 🎤 Video/Voice interview rounds\n• 📊 Case study assignments\n• 🧠 Aptitude & logical reasoning\n\n**AI Grading:**\n• Auto-evaluated code submissions\n• Plagiarism detection\n• Time-taken analysis\n• Percentile ranking\n\n➡️ **Create Assessment:** /auth?role=recruiter`,

  recruiterScoring: `🤖 **AI Candidate Scoring**\n\nBias-free intelligent candidate evaluation!\n\n**AI Scores candidates on:**\n• Technical knowledge accuracy\n• Code quality & efficiency\n• Communication clarity (voice interviews)\n• Problem-solving approach\n• Time management\n\n**Smart Features:**\n• **Auto-ranking** — Automatically sorts the best candidates\n• **Skill heat maps** — Visual display of strong/weak areas\n• **Percentile scores** — Compare with the global pool\n• **Red flag detection** — Malpractice alerts\n• **Structured feedback** — Detailed evaluation reports\n\n**Output:**\n• Ranked candidate leaderboard\n• Individual score breakdowns\n• Downloadable evaluation PDFs\n• One-click shortlisting\n\nFully automated — no manual evaluation required! 🎯`,

  recruiterJobs: `💼 **Post a Job**\n\nReach thousands of skilled candidates instantly!\n\n**Features:**\n• AI-assisted Job Description generation\n• One-click multi-platform posting\n• Set custom knockout questions\n• Automated initial screening\n• Direct access to PreepX's ranked talent pool\n\n➡️ **Post your first job:** /auth?role=recruiter`,

  recruiterScreening: `📄 **AI Resume Screening**\n\nFilter thousands of resumes in seconds!\n\n**How it works:**\n• Upload a batch of candidate resumes\n• AI parses and matches them against your Job Description\n• Get an instant Match Percentage for every candidate\n• Highlights missing skills and exact matches\n• Completely eliminates manual screening fatigue\n\n➡️ **Try Resume Parsing:** /auth?role=recruiter`,

  recruiterScheduling: `📅 **Schedule Interviews**\n\nBuilt-in seamless interview scheduling!\n\n**Features:**\n• Sync with Google Calendar / Outlook\n• Automated email invites to shortlisted candidates\n• Automated reminders and follow-ups\n• Built-in video conferencing tool\n• Shared interviewer notes and scorecards\n\n➡️ **Start Scheduling:** /auth?role=recruiter`,

  recruiterPipeline: `📊 **Hiring Pipeline Management**\n\nAll candidates in one place — organized and trackable!\n\n**Pipeline Stages:**\n• 📥 Applied → 🔍 Screening → 💻 Assessment → 🎤 Interview → ✅ Shortlisted → 🤝 Hired\n\n**Features:**\n• Drag-and-drop candidate management\n• Stage-wise candidate counts\n• Bulk actions (move/reject/shortlist)\n• Automated email notifications to candidates\n• Interview scheduling integration\n• Notes & feedback per candidate\n\n**Collaboration:**\n• Team member access & roles\n• Shared evaluation notes\n• Approval workflows\n• Activity logs & audit trail\n\n**Analytics:**\n• Funnel conversion rates\n• Average time-per-stage\n• Source tracking\n• Offer acceptance rates\n\n➡️ **Setup Pipeline:** /auth?role=recruiter`,

  recruiterPricing: `💰 **Recruiter Pricing Plans**\n\n━━━ **RECRUITER PLANS** ━━━\n\n🏢 **Starter — ₹1,999/month**\n*For Small Teams*\n• Up to **5 Job Posts/month**\n• AI Candidate Scoring\n• Basic Hiring Pipeline\n• Email Support\n\n⭐ **Growth — ₹3,999/month** *(Best Value)*\n*For Growing Teams*\n• Up to **20 Job Posts/month**\n• Advanced AI Insights\n• Automated Screening\n• Priority Support\n• Team collaboration tools\n\n🏗️ **Enterprise — Custom Pricing**\n*For Large Organizations*\n• Unlimited Job Posts\n• Custom API Integrations\n• Dedicated Account Manager\n• SSO & Team Access Control\n• 24/7 Priority Support\n• White-label options\n\n**All plans include:**\n• AI Candidate Scoring\n• Custom Assessments\n• Hiring Pipeline\n• Candidate Comparison\n\n📞 **Contact us:** support@preepx.com\n➡️ **Start Free Trial:** /auth?role=recruiter`,

  recruiterFastTrack: `⚡ **Fast-Track Hiring with PreepX**\n\nTraditional hiring takes weeks — with PreepX, it takes days!\n\n**Traditional Hiring:**\n❌ Manual resume screening — days\n❌ Phone screening rounds — 1 week\n❌ Assignment evaluation — days\n❌ Final interviews — 1 week\n⏱️ **Total: 3-6 weeks**\n\n**PreepX Fast-Track:**\n✅ AI auto-screening — **minutes**\n✅ Proctored assessment — **1-2 days**\n✅ AI evaluation & ranking — **instant**\n✅ Shortlist top candidates — **same day**\n⚡ **Total: 2-5 days**\n\n**Result:**\n• 3x faster time-to-hire\n• 60% reduction in screening costs\n• Higher quality candidates\n• Zero manual evaluation bias\n\n➡️ **Start Hiring:** /auth?role=recruiter`,

  recruiterAPI: `🔗 **API & Integrations**\n\nIntegrate PreepX seamlessly with your existing HR stack!\n\n**Available Integrations:**\n• 📧 **Email**: Gmail, Outlook\n• 📅 **Calendar**: Google Calendar, Calendly\n• 💼 **ATS**: Greenhouse, Lever, Workday\n• 💬 **Communication**: Slack, Teams\n• 📊 **Analytics**: Custom dashboards\n\n**PreepX REST API:**\n• Candidate data export\n• Assessment results webhook\n• Job posting automation\n• Custom scoring endpoints\n• Bulk candidate management\n\n**Enterprise Features:**\n• SSO (Single Sign-On) support\n• Custom branding / white-label\n• Dedicated API rate limits\n• SLA guarantee\n• On-premise deployment option\n\n**Available in:** Enterprise Plan only\n📞 **Contact:** enterprise@preepx.com`,

  contactSales: `📞 **Contact PreepX Sales Team**\n\nHave specific requirements? Let's talk!\n\n**For Recruiters:**\n📧 Email: support@preepx.com\n💼 LinkedIn: PreepX Technologies\n\n**Enterprise Enquiries:**\n📧 enterprise@preepx.com\n\n**What we can help with:**\n• Custom pricing for large teams\n• Enterprise plan demo\n• API integration support\n• Bulk candidate hiring setup\n• Partnership opportunities\n• White-label solutions\n\n**Response Time:**\n• Email: Within 24 hours\n• Enterprise: Within 4 hours\n\n➡️ **Or start directly:** /auth?role=recruiter\n\nWe will help you find the best solution! 🤝`,

  security: `🔒 **Privacy & Security**\n\nPreepX Data Privacy Policies:\n\n• **Camera data:** Local processing for interview proctoring — **never stored or sold**\n• **Audio transcription:** Complies with Enterprise-grade data privacy standards\n• **Resume data:** Securely stored, strictly for ATS analysis\n• **HTTPS** encrypted data transmission\n• No third-party data sharing\n\nYour data is 100% safe! ✅`,

  howToStart: `🚀 **How to Get Started with PreepX?**\n\n**Step 1:** Register\n• Go to /auth\n• Sign up using Email or Google\n• Free account is activated instantly\n\n**Step 2:** Explore Free Features\n• BTech Notes — available immediately\n• Dashboard — progress tracking\n• Basic features — no payment needed\n\n**Step 3:** Start Practicing\n• Mock Interview → /interview\n• Coding Hub → /100-days-challenge\n• Objective Exam → /objective-exam\n\n**Step 4:** Upgrade for Unlimited Access\n• 7 Days = ₹79\n• 1 Month = ₹299 (recommended!)\n\n**Step 5:** Get Hired!\n• Rank up on the Leaderboard\n• Earn certificates\n• Get discovered by recruiters 🎯`,

  analytics: `📊 **Performance Analytics**\n\nTrack your progress intelligently!\n\n**Available on the Dashboard:**\n• Interview performance trends\n• Subject-wise strength analysis\n• Coding problem solving stats\n• Daily/Weekly/Monthly progress\n• XP earning history\n• Streak tracking\n\n**Interview Analytics:**\n• Technical score breakdown\n• Communication score\n• Confidence metrics\n• Improvement areas highlighted\n• Comparison with top performers\n\n**Coding Analytics:**\n• Problems solved count\n• Topic-wise mastery\n• Time complexity awareness\n• Contest rankings\n\n➡️ **View Analytics:** /analytics`,

  default: `🤔 I didn't quite catch that, but here is how I can help you:\n\n🎤 **Mock Interview** — AI-powered practice\n💻 **Coding Hub** — 100 Days DSA challenge\n📄 **ATS Score** — Resume optimization\n📚 **BTech Notes** — Free study material\n💰 **Pricing** — ₹79 / ₹299 plans\n🏢 **Company Prep** — Google, Amazon, etc.\n🎯 **Objective Exam** — MCQ with certificates\n🏆 **Leaderboard** — XP & rewards\n💳 **Wallet** — Coins & subscriptions\n🔒 **Security** — Privacy policy\n🚀 **How to Start** — Getting started guide\n\nAsk me about any specific topic, and I'll provide full details!`,
};

// ── INTENT MATCHING ──
function getResponse(input, mode) {
  const q = input.toLowerCase();

  // Greetings
  if (/^(hi|hello|hey|namaste|hii|helo|sup|yo)/.test(q)) {
    if (mode === "recruiter") {
      return `🏢 **Hello, Recruiter!** 👋\n\nI am the PreepX AI Concierge. I can assist you with:\n\n📋 **Custom Assessments**\n🤖 **AI Candidate Scoring**\n📊 **Hiring Pipeline**\n⚡ **Fast-Track Hiring**\n🔗 **API & Integrations**\n💰 **Recruiter Pricing**\n📞 **Contact Sales**\n\nHow can I help you streamline your hiring today?`;
    }
    return KB.greeting;
  }

  // Candidate Jobs & Assessments
  if (q.includes("job") || q.includes("apply") || q.includes("career") || q.includes("vacancy") || q.includes("placement")) return KB.jobs;
  if ((mode === "candidate" || mode === null) && (q.includes("assess") || q.includes("assignment") || q.includes("take test"))) return KB.assessments;

  // Mock Interview
  if (q.includes("mock") || q.includes("interview") || q.includes("voice") || q.includes("speak") || q.includes("practice interview") || q.includes("ai interview")) return KB.mock;

  // Coding Hub
  if (q.includes("cod") || q.includes("dsa") || q.includes("100 day") || q.includes("challenge") || q.includes("hub") || q.includes("leetcode") || q.includes("algorithm") || q.includes("data struct")) return KB.coding;

  // ATS
  if (q.includes("ats") || q.includes("resume") || q.includes("cv") || q.includes("applicant") || q.includes("tracking")) return KB.ats;

  // Pricing
  if (q.includes("pric") || q.includes("plan") || q.includes("cost") || q.includes("fee") || q.includes("pay") || q.includes("₹") || q.includes("rupee") || q.includes("subscribe") || q.includes("79") || q.includes("299")) return KB.pricing;

  // Leaderboard
  if (q.includes("leaderboard") || q.includes("rank") || q.includes("top") || q.includes("compete") || q.includes("xp") || q.includes("point") || q.includes("reward")) return KB.leaderboard;

  // BTech Notes
  if (q.includes("note") || q.includes("btech") || q.includes("study") || q.includes("subject") || q.includes("free note") || q.includes("pdf")) return KB.notes;

  // Company Prep
  if (q.includes("compan") || q.includes("google") || q.includes("amazon") || q.includes("microsoft") || q.includes("tcs") || q.includes("infosys") || q.includes("prep for")) return KB.company;

  // MCQ / Objective Exam
  if (q.includes("mcq") || q.includes("objective") || q.includes("exam") || q.includes("quiz") || q.includes("test") || q.includes("multiple choice")) return KB.mcq;

  // Wallet / XP
  if (q.includes("wallet") || q.includes("coin") || q.includes("earn") || q.includes("redeem") || q.includes("balance")) return KB.wallet;

  // Certificate
  if (q.includes("certif") || q.includes("badge") || q.includes("verif") || q.includes("credential") || q.includes("linkedin")) return KB.certificate;

  // Recruiter general
  if (q.includes("recruit") || q.includes("hire") || q.includes("hiring") || q.includes("employer") || q.includes("hiring platform")) return KB.recruiter;

  // Recruiter Assessments
  if (q.includes("custom assess") || q.includes("create test") || q.includes("assessment") || q.includes("question bank")) return KB.recruiterAssessments;

  // Recruiter AI Scoring
  if ((q.includes("ai") && q.includes("scor")) || q.includes("candidate scor") || q.includes("ranking") || q.includes("evaluat") || q.includes("grading")) return KB.recruiterScoring;

  // Recruiter Jobs & Screening
  if (mode === "recruiter" && (q.includes("job post") || q.includes("post a job") || q.includes("vacancy") || q.includes("create job"))) return KB.recruiterJobs;
  if (mode === "recruiter" && (q.includes("screen") || q.includes("parse") || q.includes("filter resume"))) return KB.recruiterScreening;
  if (mode === "recruiter" && (q.includes("schedul") || q.includes("calendar") || q.includes("invite"))) return KB.recruiterScheduling;

  // Recruiter Pipeline
  if (q.includes("pipeline") || q.includes("shortlist") || q.includes("applicant") || q.includes("funnel") || q.includes("stages")) return KB.recruiterPipeline;

  // Recruiter Pricing
  if ((q.includes("pric") || q.includes("plan") || q.includes("cost") || q.includes("₹") || q.includes("1999") || q.includes("3999")) && (q.includes("recruit") || q.includes("hire") || q.includes("team"))) return KB.recruiterPricing;

  // General Pricing
  if (q.includes("pric") || q.includes("plan") || q.includes("cost") || q.includes("fee") || q.includes("pay") || q.includes("₹") || q.includes("rupee") || q.includes("subscribe") || q.includes("79") || q.includes("299")) return KB.pricing;

  // Fast-track hiring
  if (q.includes("fast") || q.includes("quick hire") || q.includes("speed") || q.includes("fast-track") || q.includes("faster")) return KB.recruiterFastTrack;

  // API/Integrations
  if (q.includes("api") || q.includes("integrat") || q.includes("sso") || q.includes("webhook") || q.includes("connect") || q.includes("enterprise")) return KB.recruiterAPI;

  // Contact Sales
  if (q.includes("contact") || q.includes("sales") || q.includes("demo") || q.includes("email") || q.includes("support") || q.includes("talk")) return KB.contactSales;

  // Security/Privacy
  if (q.includes("secur") || q.includes("privac") || q.includes("safe") || q.includes("data") || q.includes("camera") || q.includes("audio")) return KB.security;

  // How to start
  if (q.includes("start") || q.includes("begin") || q.includes("kaise") || q.includes("how to") || q.includes("signup") || q.includes("register") || q.includes("new user")) return KB.howToStart;

  // Analytics
  if (q.includes("analytic") || q.includes("progress") || q.includes("performance") || q.includes("track") || q.includes("stat") || q.includes("dashboard")) return KB.analytics;

  if (mode === "recruiter") {
    return `🤔 I didn't quite catch that. Here is how I can help you with hiring:\n\n💼 **Post a Job** — Publish open roles\n📄 **AI Resume Screening** — Filter thousands of resumes\n📋 **Custom Assessments** — Tailored tests\n🤖 **AI Candidate Scoring** — Bias-free evaluation\n📅 **Schedule Interviews** — Automated invites\n📊 **Hiring Pipeline** — End-to-end tracking\n⚡ **Fast-Track Hiring** — Hire in days\n🔗 **API & Integrations** — Connect your tools\n💰 **Recruiter Pricing** — Subscription plans\n📞 **Contact Sales** — Get enterprise support\n\nAsk me about any of these topics!`;
  }
  return `🤔 I didn't quite catch that, but here is how I can help you:\n\n💼 **Jobs & Assessments** — Apply and prove your skills\n🎤 **Mock Interview** — AI-powered practice\n💻 **Coding Hub** — 100 Days DSA challenge\n📄 **ATS Score** — Resume optimization\n📚 **BTech Notes** — Free study material\n💰 **Pricing** — ₹79 / ₹299 plans\n🏢 **Company Prep** — Google, Amazon, etc.\n🎯 **Objective Exam** — MCQ with certificates\n🏆 **Leaderboard** — XP & rewards\n💳 **Wallet** — Coins & subscriptions\n\nAsk me about any specific topic, and I'll provide full details!`;
}

function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/~~(.*?)~~/g, "<s>$1</s>")
    .replace(/━━━(.*?)━━━/g, '<div class="chat-divider">$1</div>')
    .replace(/➡️/g, "➡️")
    .replace(/\n/g, "<br/>");
}

const ROLE_GREETING = `Hello! 👋 I am the **PreepX AI Concierge**.\n\nI can help you with everything you need to know about PreepX.\n\nFirst, please tell me — **who are you?**`;

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(null); // null | "candidate" | "recruiter"
  const [showAllChips, setShowAllChips] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: ROLE_GREETING, id: 0, isRoleSelect: true },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [pulse, setPulse] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const selectRole = (selectedMode) => {
    setMode(selectedMode);
    setShowAllChips(false); // Reset chips expansion
    // Add user message
    const userLabel = selectedMode === "candidate"
      ? `<span style="display:inline-flex;align-items:center;gap:6px;"><img src="/landing/Vector.svg" alt="Candidate" style="width:14px;height:14px;margin-bottom:1px;" /> I'm a Candidate</span>`
      : `<span style="display:inline-flex;align-items:center;gap:6px;"><img src="/landing/fluent-mdl2_add-work.svg" alt="Recruiter" style="width:14px;height:14px;margin-bottom:1px;" /> I'm a Recruiter</span>`;
    const botReply = selectedMode === "candidate"
      ? `🎓 **Welcome, Candidate!**\n\nGreat choice! PreepX is India's smartest interview prep platform.\n\nYou can ask about these topics:\n\n💼 Apply for Jobs • 📋 Assessments\n🎤 Mock Interviews • 💻 Coding Hub\n📄 ATS Score • 🎯 Objective Exams\n📚 BTech Notes • 🏢 Company Prep\n🏆 Leaderboard • 💰 Pricing Plans\n\nClick the quick options below or simply type your question! 👇`
      : `🏢 **Welcome, Recruiter!**\n\nWelcome to PreepX — an AI-powered hiring platform!\n\nYou can ask about these topics:\n\n💼 Post a Job • 📄 AI Resume Screening\n📋 Custom Assessments • 🤖 AI Candidate Scoring\n📅 Schedule Interviews • 📊 Hiring Pipeline\n⚡ Fast-Track Hiring • 🔗 API & Integrations\n💰 Recruiter Pricing • 📞 Contact Sales\n\nClick the quick options below or simply type your question! 👇`;
    setMessages((prev) => [
      ...prev.map(m => ({ ...m, isRoleSelect: false })),
      { from: "user", text: userLabel, id: Date.now() },
      { from: "bot", text: botReply, id: Date.now() + 1 },
    ]);
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setPulse(false);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput("");
    setMessages((prev) => [...prev, { from: "user", text: trimmed, id: Date.now() }]);
    setTyping(true);
    setTimeout(() => {
      const res = getResponse(trimmed, mode);
      setTyping(false);
      setMessages((prev) => [...prev, { from: "bot", text: res, id: Date.now() + 1 }]);
    }, 800);
  };

  const handleReset = () => {
    setMode(null);
    setShowAllChips(false);
    setMessages([{ from: "bot", text: ROLE_GREETING, id: Date.now(), isRoleSelect: true }]);
  };

  const chatContent = (
    <>
      {/* FAB Button */}
      {!open && (
        <button
          className={`chatbot-fab ${pulse ? "chatbot-fab--pulse" : ""}`}
          onClick={() => setOpen(true)}
          aria-label="Open PreepX AI Assistant"
          title="Chat with PreepX AI"
        >
          <Bot size={26} color="#fff" strokeWidth={2} />
          <span className="chatbot-fab-sparkle">
            <Sparkles size={12} color="#facc15" />
          </span>
        </button>
      )}

      {/* Full-height Side Panel */}
      <div className={`chatbot-panel ${open ? "chatbot-panel--open" : ""}`}>

        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-icon">
            <Bot size={20} color="#fff" />
          </div>
          <div className="chatbot-header-info">
            <div className="chatbot-header-top-row">
              <span className="chatbot-header-name">{BOT_NAME}</span>
              <span className="chatbot-version-badge">{BOT_VERSION}</span>
            </div>
            <span className="chatbot-header-tag">
              <span className="chatbot-online-dot" />
              {BOT_TAGLINE}
            </span>
          </div>
          <div className="chatbot-header-actions">
            <button onClick={handleReset} title="Restart chat" className="chatbot-icon-btn">
              <RefreshCw size={15} />
            </button>
            <button onClick={() => setOpen(false)} title="Close" className="chatbot-icon-btn">
              <X size={16} />
            </button>
          </div>
        </div>



        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chatbot-msg chatbot-msg--${msg.from}`}>
              {msg.from === "bot" && (
                <div className="chatbot-bot-avatar">
                  <Bot size={14} color="#fff" />
                </div>
              )}
              <div className="chatbot-bubble-wrap">
                <div
                  className="chatbot-bubble"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
                />
                {/* Inline Role Select Buttons */}
                {msg.isRoleSelect && (
                  <div className="chatbot-role-btns">
                    <button
                      className="chatbot-role-btn chatbot-role-btn--candidate"
                      onClick={() => selectRole("candidate")}
                    >
                      <img src="/landing/Vector.svg" alt="Candidate" style={{ width: '15px', height: '15px', marginBottom: '1px' }} />
                      <span>I'm a Candidate</span>
                      <span style={{ marginLeft: '1px' }}>→</span>
                    </button>
                    <button
                      className="chatbot-role-btn chatbot-role-btn--recruiter"
                      onClick={() => selectRole("recruiter")}
                    >
                      <img src="/landing/fluent-mdl2_add-work.svg" alt="Recruiter" style={{ width: '15px', height: '15px', marginBottom: '1px' }} />
                      <span>I'm a Recruiter</span>
                      <span style={{ marginLeft: '1px' }}>→</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {typing && (
            <div className="chatbot-msg chatbot-msg--bot">
              <div className="chatbot-bot-avatar">
                <Bot size={14} color="#fff" />
              </div>
              <div className="chatbot-bubble chatbot-bubble--typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick Chips — only show after role selected */}
        {mode && (
          <div className="chatbot-chips">
            {(() => {
              const currentChips = mode === "recruiter" ? RECRUITER_CHIPS : CANDIDATE_CHIPS;
              const visibleChips = showAllChips ? currentChips : currentChips.slice(0, 5);
              return (
                <>
                  {visibleChips.map((c) => (
                    <button
                      key={c.label}
                      className={`chatbot-chip ${mode === "recruiter" ? "chatbot-chip--recruiter" : ""}`}
                      onClick={() => sendMessage(c.label)}
                    >
                      {c.icon}
                      {c.label}
                    </button>
                  ))}
                  {!showAllChips && currentChips.length > 5 && (
                    <button
                      className={`chatbot-chip chatbot-chip--more ${mode === "recruiter" ? "chatbot-chip--recruiter" : ""}`}
                      onClick={() => setShowAllChips(true)}
                    >
                      +{currentChips.length - 5} More
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Input */}
        <div className="chatbot-input-row">
          <input
            ref={inputRef}
            className="chatbot-input"
            placeholder="Ask about pricing, features, interview..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          />
          <button
            className="chatbot-send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {open && <div className="chatbot-overlay" onClick={() => setOpen(false)} />}
    </>
  );

  return ReactDOM.createPortal(chatContent, document.body);
}
