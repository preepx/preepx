import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "@/styles/UserGuide.css";

const ROLES = [
  {
    title: "Frontend Developer",
    desc: "Focus on HTML, CSS, JavaScript fundamentals, React/Vue/Angular concepts, browser rendering, accessibility, performance and responsive design.",
  },
  {
    title: "Backend Developer",
    desc: "Focus on server-side languages, REST APIs, authentication, databases, system architecture, caching, error handling and deployment.",
  },
  {
    title: "Full Stack Developer",
    desc: "Focus on frontend fundamentals, backend APIs, authentication, databases, system design basics, debugging and project architecture.",
  },
  {
    title: "Software Engineer",
    desc: "Focus on data structures, algorithms, system design, object-oriented programming, design patterns, code quality and problem-solving.",
  },
  {
    title: "Data Analyst",
    desc: "Focus on SQL, data analysis, spreadsheet tools, data visualization, Python/R basics, statistics and communication of findings.",
  },
  {
    title: "Java Developer",
    desc: "Focus on Java fundamentals, OOP, collections, multithreading, Spring framework, REST APIs, JPA/Hibernate and design patterns.",
  },
  {
    title: "MERN Stack Developer",
    desc: "Focus on JavaScript, React, Next.js, Node.js, Express/NestJS, REST APIs, authentication, MongoDB and deployment workflows.",
  },
  {
    title: "Fresher / Graduate",
    desc: "Focus on core CS fundamentals, data structures, algorithms, basic SQL, communication, projects and explaining your academic work clearly.",
  },
];

const MISTAKES = [
  "Memorizing answers word-for-word instead of understanding the concept",
  "Not being able to explain your own resume, projects or technical decisions",
  "Giving extremely long answers when a concise response is expected",
  "Claiming skills you cannot explain or demonstrate",
  "Not researching the role or understanding the job description",
  "Ignoring communication and only focusing on technical answers",
  "Focusing only on coding and ignoring fundamentals such as databases, APIs or system design",
  "Not practicing aloud and only reading interview questions",
  "Getting completely stuck after one difficult question and losing confidence",
  "Not asking any questions at the end of the interview",
];

const QUICK_TIPS = [
  "Know your resume and be ready to explain every item on it",
  "Understand the role before the interview",
  "Practice speaking answers aloud, not just reading them",
  "Revise core fundamentals relevant to your role",
  "Use real project examples to support your answers",
  "Explain your thinking and reasoning, not just the final answer",
  "Do not claim skills you cannot explain",
  "Practice how you would answer follow-up questions",
  "Learn from AI feedback and identify areas to improve",
  "Keep practicing regularly, not just before interviews",
];

const BEFORE_CHECKLIST = [
  "Review the job description carefully",
  "Review your resume and be ready to explain every point",
  "Revise important concepts relevant to the role",
  "Check your internet connection and device",
  "Keep your environment ready and free from distractions",
  "Join the interview a few minutes early",
];

const DURING_CHECKLIST = [
  "Listen carefully to each question before answering",
  "Communicate clearly and stay calm",
  "Think before responding to complex questions",
  "Explain your approach and reasoning",
  "Stay composed when facing a difficult or unfamiliar question",
];

const AFTER_CHECKLIST = [
  "Note the questions you found difficult",
  "Review your answers and identify gaps",
  "Identify topics you need to revise",
  "Continue practicing before your next interview",
];

export default function InterviewTips() {
  useEffect(() => {
    document.title = "Interview Tips & Preparation Guide | PreepX";
    // Set meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content =
      "Practical interview tips and preparation strategies for technical, HR and role-based interviews. Practice with AI mock interviews and improve your interview performance with PreepX.";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="user-guide-page">
      {/* HERO */}
      <header className="guide-hero" style={{ paddingBottom: "70px" }}>
        <h1 style={{ maxWidth: "720px", margin: "0 auto 20px" }}>
          Interview Tips That Help You Perform Better
        </h1>
        <p className="guide-hero-sub" style={{ maxWidth: "640px", margin: "0 auto 36px" }}>
          Preparing for an interview is not only about knowing the answers. You need to understand the role, communicate your knowledge clearly, practice real interview situations and learn from your mistakes. Use PreepX to practice interviews, improve your performance and prepare with more confidence.
        </p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/auth"
            style={{
              background: "#fff",
              color: "#0284c7",
              fontWeight: "700",
              fontSize: "15px",
              padding: "12px 30px",
              borderRadius: "10px",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            }}
          >
            Start AI Mock Interview
          </Link>
          <a
            href="#preparation-guide"
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              fontWeight: "600",
              fontSize: "15px",
              padding: "12px 30px",
              borderRadius: "10px",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            Explore Interview Tips
          </a>
        </div>
      </header>

      <div className="guide-container" style={{ maxWidth: "860px", paddingBottom: "80px" }}>
        <main className="guide-content">

          {/* SECTION 1 — PREPARATION GUIDE */}
          <section id="preparation-guide" className="guide-section-block">
            <h2>How to Prepare for an Interview</h2>
            <p style={{ color: "var(--hpw-text-muted)", marginBottom: "32px", fontSize: "15px", lineHeight: "1.7" }}>
              A strong interview preparation process should cover your resume, technical knowledge, communication, role-specific preparation and actual interview practice.
            </p>

            {/* Understand the Role */}
            <div className="guide-feature-card" style={{ padding: "28px", marginBottom: "16px" }}>
              <h3>Understand the Job Role</h3>
              <p style={{ color: "var(--hpw-text-muted)", marginBottom: "16px", lineHeight: "1.7" }}>
                Carefully read the job description and understand what the role requires before preparing your answers.
              </p>
              <ul className="guide-bullet-list">
                <li>Required technical skills and experience</li>
                <li>Core responsibilities of the role</li>
                <li>Tools, technologies and frameworks mentioned</li>
                <li>Communication and collaboration requirements</li>
                <li>Expected problem-solving skills and seniority level</li>
              </ul>
              <div style={{ marginTop: "16px", padding: "14px 18px", background: "var(--hpw-item-hover)", borderRadius: "8px", borderLeft: "3px solid #0284c7", fontSize: "14px", color: "var(--hpw-text-muted)", lineHeight: "1.6" }}>
                <strong style={{ color: "var(--hpw-text)" }}>Practical tip:</strong> Prepare examples from your own projects and previous experience that directly match what the role requires.
              </div>
            </div>

            {/* Resume */}
            <div className="guide-feature-card" style={{ padding: "28px", marginBottom: "16px" }}>
              <h3>Prepare Your Resume</h3>
              <p style={{ color: "var(--hpw-text-muted)", marginBottom: "16px", lineHeight: "1.7" }}>
                Keep your resume clear, relevant and up to date. Your interviewer may ask questions based directly on what is written in it.
              </p>
              <ul className="guide-bullet-list">
                <li>Use a resume relevant to the role you are applying for</li>
                <li>Highlight real projects and your specific contributions</li>
                <li>Mention measurable outcomes where possible</li>
                <li>Keep technical skills accurate and honest</li>
                <li>Be ready to explain every technology mentioned</li>
                <li>Do not add skills only because they appear in the job description</li>
              </ul>
              <div style={{ marginTop: "16px", padding: "14px 18px", background: "var(--hpw-item-hover)", borderRadius: "8px", borderLeft: "3px solid #0284c7", fontSize: "14px", color: "var(--hpw-text-muted)", lineHeight: "1.6" }}>
                Be prepared to explain your projects, responsibilities and the technical decisions you made. Interviewers often follow up on resume points.
              </div>
            </div>

            {/* Research */}
            <div className="guide-feature-card" style={{ padding: "28px", marginBottom: "16px" }}>
              <h3>Research the Company</h3>
              <p style={{ color: "var(--hpw-text-muted)", marginBottom: "16px", lineHeight: "1.7" }}>
                Understanding the company helps you answer questions with more context and shows genuine interest in the role.
              </p>
              <ul className="guide-bullet-list">
                <li>What the company does and the problems it solves</li>
                <li>Its main products or services</li>
                <li>The role and how it fits within the team</li>
                <li>Basic information about the industry</li>
                <li>Why you are interested in this particular opportunity</li>
              </ul>
              <p style={{ marginTop: "14px", color: "var(--hpw-text-muted)", fontSize: "14px" }}>
                Focus on understanding, not memorizing. Genuine knowledge of the company communicates more than rehearsed facts.
              </p>
            </div>

            {/* Technical */}
            <div className="guide-feature-card" style={{ padding: "28px", marginBottom: "16px" }}>
              <h3>Prepare for Technical Questions</h3>
              <p style={{ color: "var(--hpw-text-muted)", marginBottom: "16px", lineHeight: "1.7" }}>
                For technical roles, your preparation should cover both fundamentals and role-specific knowledge.
              </p>
              <ul className="guide-bullet-list">
                <li>Programming fundamentals and language-specific concepts</li>
                <li>Data structures and algorithms</li>
                <li>Database concepts and query writing</li>
                <li>APIs and integration patterns</li>
                <li>System design basics relevant to the seniority level</li>
                <li>Framework-specific concepts for your role</li>
                <li>Your own projects and the decisions behind them</li>
                <li>Debugging approaches and problem-solving methods</li>
              </ul>
              <p style={{ marginTop: "14px", color: "var(--hpw-text-muted)", fontSize: "14px" }}>
                For full-stack roles, examples include JavaScript, React, Next.js, Node.js, Express, REST APIs, authentication patterns, databases and deployment basics.
              </p>
            </div>

            {/* HR */}
            <div className="guide-feature-card" style={{ padding: "28px", marginBottom: "16px" }}>
              <h3>Prepare for HR Questions</h3>
              <p style={{ color: "var(--hpw-text-muted)", marginBottom: "16px", lineHeight: "1.7" }}>
                HR questions evaluate your communication, self-awareness and professional mindset. Answer honestly and use real examples.
              </p>
              <ul className="guide-bullet-list">
                <li>Tell me about yourself</li>
                <li>Why are you looking for a change?</li>
                <li>Why do you want to join this company?</li>
                <li>What are your strengths?</li>
                <li>What is one area you are currently improving?</li>
                <li>Tell me about a difficult situation you handled</li>
                <li>Where do you see yourself in the next few years?</li>
              </ul>
              <p style={{ marginTop: "14px", color: "var(--hpw-text-muted)", fontSize: "14px" }}>
                Use real experiences from your work or academic life. Memorized answers tend to sound rehearsed. Honest, structured responses communicate better.
              </p>
            </div>

            {/* Practice */}
            <div className="guide-feature-card" style={{ padding: "28px", marginBottom: "8px" }}>
              <h3>Practice Before the Real Interview</h3>
              <p style={{ color: "var(--hpw-text-muted)", marginBottom: "16px", lineHeight: "1.7" }}>
                Reading interview questions is very different from answering them in a real conversation. Practicing out loud is one of the most important steps in interview preparation.
              </p>
              <ul className="guide-bullet-list">
                <li>Speak your answers aloud, not just in your head</li>
                <li>Practice explaining technical concepts clearly</li>
                <li>Practice HR and behavioral questions with real examples</li>
                <li>Practice handling follow-up questions</li>
                <li>Record or review your own answers to identify areas to improve</li>
                <li>Take AI mock interviews to simulate the real interview environment</li>
                <li>Repeat practice regularly based on the feedback you receive</li>
              </ul>
              <div style={{ marginTop: "20px" }}>
                <Link
                  to="/auth"
                  style={{
                    display: "inline-flex",
                    padding: "10px 24px",
                    background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: "14px",
                    borderRadius: "8px",
                    textDecoration: "none",
                  }}
                >
                  Practice with PreepX AI Mock Interviews
                </Link>
              </div>
            </div>
          </section>

          {/* SECTION 2 — HOW TO ANSWER */}
          <section id="how-to-answer" className="guide-section-block">
            <h2>How to Answer Interview Questions Clearly</h2>
            <p style={{ color: "var(--hpw-text-muted)", marginBottom: "28px", lineHeight: "1.7" }}>
              A good interview answer should be clear, relevant, structured and based on real experience. Keep your answers concise.
            </p>

            <div className="guide-feature-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginBottom: "28px" }}>
              <div className="guide-feature-card" style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "14px" }}>For Behavioral Questions — STAR</h3>
                <ul className="guide-bullet-list">
                  <li><strong>Situation</strong> — Describe the context</li>
                  <li><strong>Task</strong> — Explain your responsibility</li>
                  <li><strong>Action</strong> — Describe what you did</li>
                  <li><strong>Result</strong> — Share the outcome</li>
                </ul>
                <p style={{ marginTop: "12px", fontSize: "13px", color: "var(--hpw-text-muted)" }}>Use this structure to keep behavioral answers focused and easy to follow.</p>
              </div>
              <div className="guide-feature-card" style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "14px" }}>For Technical Questions</h3>
                <ul className="guide-bullet-list">
                  <li>Make sure you understand the question first</li>
                  <li>Explain your approach before jumping to the answer</li>
                  <li>Think through the solution step by step</li>
                  <li>Mention trade-offs where relevant</li>
                  <li>Give the final answer clearly and concisely</li>
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION 3 — DURING */}
          <section id="during-interview" className="guide-section-block">
            <h2>What to Do During the Interview</h2>
            <div style={{ background: "var(--hpw-card-bg)", border: "1px solid var(--hpw-border)", borderRadius: "14px", padding: "28px 32px", marginBottom: "20px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  "Listen carefully before answering each question",
                  "Ask for clarification when a question is unclear",
                  "Think before you respond, especially for complex questions",
                  "Explain your reasoning, not just the final answer",
                  "Be honest when you do not know something",
                  "Avoid unnecessary jargon that may reduce clarity",
                  "Connect your answers to real projects where possible",
                  "Maintain professional and clear communication throughout",
                  "Ask relevant questions at the end of the interview",
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", fontSize: "15px", color: "var(--hpw-text)" }}>
                    <span style={{ color: "#0284c7", fontWeight: "700", fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ padding: "16px 20px", background: "var(--hpw-item-hover)", borderRadius: "10px", borderLeft: "3px solid #10b981", fontSize: "14px", color: "var(--hpw-text-muted)", lineHeight: "1.65" }}>
              <strong style={{ color: "var(--hpw-text)" }}>Note:</strong> You do not need to know everything. Interviewers also evaluate how you think, communicate and approach unfamiliar problems.
            </div>
          </section>

          {/* SECTION 4 — MISTAKES */}
          <section id="common-mistakes" className="guide-section-block">
            <h2>Common Interview Mistakes to Avoid</h2>
            <p style={{ color: "var(--hpw-text-muted)", marginBottom: "24px", lineHeight: "1.7" }}>
              Being aware of common mistakes helps you avoid them before and during the interview.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {MISTAKES.map((mistake, i) => (
                <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "14px 18px", background: "var(--hpw-card-bg)", border: "1px solid var(--hpw-border)", borderRadius: "10px" }}>
                  <span style={{ color: "var(--hpw-text-muted)", fontWeight: "600", fontSize: "13px", flexShrink: 0, marginTop: "2px" }}>{i + 1}.</span>
                  <p style={{ margin: 0, fontSize: "14px", color: "var(--hpw-text)", lineHeight: "1.6" }}>{mistake}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 5 — AI MOCK */}
          <section id="ai-mock-interview" className="guide-section-block">
            <div style={{ background: "var(--hpw-card-bg)", border: "1px solid var(--hpw-border)", borderRadius: "16px", padding: "40px 36px" }}>
              <h2 style={{ marginBottom: "16px" }}>Practice Before the Real Interview</h2>
              <p style={{ color: "var(--hpw-text-muted)", marginBottom: "24px", lineHeight: "1.7", fontSize: "15px" }}>
                One of the most effective ways to prepare is to simulate the interview environment before the actual interview.
              </p>
              <div className="guide-feature-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: "28px" }}>
                {[
                  "Practice technical interviews",
                  "Practice HR and behavioral interviews",
                  "Practice role-based interview questions",
                  "Answer AI-generated follow-up questions",
                  "Improve how you communicate your answers",
                  "Receive structured AI-powered feedback",
                  "Identify specific areas that need more preparation",
                  "Practice repeatedly before the actual interview",
                ].map((item, i) => (
                  <div key={i} style={{ padding: "14px 16px", background: "var(--hpw-item-hover)", borderRadius: "8px", border: "1px solid var(--hpw-border)", fontSize: "14px", color: "var(--hpw-text)" }}>
                    {item}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "13px", color: "var(--hpw-text-muted)", marginBottom: "24px" }}>
                AI feedback helps you understand how you are performing and what to improve. It is a preparation tool, not a replacement for a human interviewer.
              </p>
              <Link
                to="/auth"
                style={{
                  display: "inline-flex",
                  padding: "12px 32px",
                  background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "15px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.25)",
                }}
              >
                Start Your AI Mock Interview
              </Link>
            </div>
          </section>

          {/* SECTION 6 — BY ROLE */}
          <section id="by-role" className="guide-section-block">
            <h2>Prepare According to Your Role</h2>
            <p style={{ color: "var(--hpw-text-muted)", marginBottom: "28px", lineHeight: "1.7" }}>
              Interview preparation varies by role. Focus your preparation on what is most relevant to the position you are applying for.
            </p>
            <div className="guide-feature-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {ROLES.map((role, i) => (
                <div key={i} className="guide-feature-card" style={{ padding: "22px" }}>
                  <h3 style={{ fontSize: "15px", marginBottom: "10px" }}>{role.title}</h3>
                  <p style={{ fontSize: "13px", lineHeight: "1.65", color: "var(--hpw-text-muted)" }}>{role.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 7 — CHECKLIST */}
          <section id="interview-day-checklist" className="guide-section-block">
            <h2>Interview Day Checklist</h2>
            <div className="guide-feature-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {[
                { heading: "Before the Interview", items: BEFORE_CHECKLIST },
                { heading: "During the Interview", items: DURING_CHECKLIST },
                { heading: "After the Interview", items: AFTER_CHECKLIST },
              ].map((group, gi) => (
                <div key={gi} className="guide-feature-card" style={{ padding: "24px" }}>
                  <h3 style={{ fontSize: "15px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--hpw-border)" }}>{group.heading}</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                    {group.items.map((item, ii) => (
                      <li key={ii} style={{ display: "flex", gap: "10px", fontSize: "13px", color: "var(--hpw-text)", alignItems: "flex-start" }}>
                        <span style={{ color: "#0284c7", fontWeight: "700", flexShrink: 0 }}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 8 — QUICK TIPS */}
          <section id="quick-tips" className="guide-section-block">
            <h2>Quick Tips to Remember</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "10px" }}>
              {QUICK_TIPS.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", padding: "14px 18px", background: "var(--hpw-card-bg)", border: "1px solid var(--hpw-border)", borderRadius: "10px", alignItems: "flex-start" }}>
                  <span style={{ color: "#0284c7", fontWeight: "700", flexShrink: 0, fontSize: "13px", marginTop: "2px" }}>{String(i + 1).padStart(2, "0")}</span>
                  <p style={{ margin: 0, fontSize: "14px", color: "var(--hpw-text)", lineHeight: "1.55" }}>{tip}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 9 — FINAL CTA */}
          <section className="guide-section-block">
            <div style={{
              background: "linear-gradient(135deg, #0c1e3d 0%, #0e2a52 100%)",
              borderRadius: "18px",
              padding: "52px 40px",
              textAlign: "center",
            }}>
              <h2 style={{ color: "#fff", marginBottom: "16px", fontSize: "28px" }}>
                Prepare With Practice, Not Just Preparation
              </h2>
              <p style={{ color: "#bae6fd", marginBottom: "36px", fontSize: "15px", maxWidth: "520px", margin: "0 auto 36px", lineHeight: "1.7" }}>
                The best way to become comfortable with interviews is to experience them before the real interview. Practice technical, HR and role-based interviews with PreepX, receive feedback and track your preparation progress.
              </p>
              <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link
                  to="/auth"
                  style={{
                    background: "#fff",
                    color: "#0284c7",
                    fontWeight: "700",
                    fontSize: "15px",
                    padding: "12px 32px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                  }}
                >
                  Start AI Mock Interview
                </Link>
                <Link
                  to="/features"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: "15px",
                    padding: "12px 32px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  Explore PreepX
                </Link>
              </div>

              {/* Internal links */}
              <div style={{ marginTop: "36px", paddingTop: "28px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
                {[
                  { label: "Features", to: "/features" },
                  { label: "How PreepX Works", to: "/how-preepx-works" },
                  { label: "Help Center", to: "/help-center" },
                  { label: "Apply Jobs", to: "/apply-jobs/browse" },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    style={{ color: "#7dd3fc", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
