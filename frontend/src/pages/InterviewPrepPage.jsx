import React, { useState } from "react";
import { MessageSquareQuote, CheckCircle, ChevronDown, ChevronUp, Sparkles, BookOpen, Clock, Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import "@/styles/PlatformPages.css";

const BEHAVIORAL_QUESTIONS = [
  {
    id: "star-1",
    question: "Tell me about a time you faced a serious technical disagreement with a team member.",
    competency: "Conflict Resolution & Collaboration",
    situation: "During our migration to a microservices architecture, a senior peer wanted gRPC while I advocated for GraphQL for our mobile-first clients.",
    task: "We needed to reach alignment within 48 hours to prevent blocking the release cycle of our customer-facing app.",
    action: "I arranged a benchmark session where we created a 1-day proof of concept for both protocols, measuring serialization latency and payload size on 3G connections. We documented the trade-offs objectively without emotional bias.",
    result: "We discovered GraphQL reduced mobile payload over-fetching by 42% on high-latency mobile networks. The team agreed on GraphQL for client-facing gateways and gRPC for inter-service communication, shipping on schedule with zero friction."
  },
  {
    id: "star-2",
    question: "Describe a production outage or critical bug you caused or resolved under pressure.",
    competency: "Crisis Management & Accountability",
    situation: "On Black Friday, our payment processing microservice experienced connection pool exhaustion, dropping 18% of checkout requests.",
    task: "I was on-call lead and had to restore service stability within 15 minutes while millions of dollars were at risk.",
    action: "I activated the emergency incident bridge, examined datadog trace logs, and identified an unindexed database query during cart checkout that was locking connection threads. I immediately triggered a rolling restart with read-replica fallback, applied an emergency index migration, and scaled replica pods.",
    result: "Service error rates dropped back to 0.01% within 11 minutes. Afterwards, I authored a blameless post-mortem and added automated slow-query threshold alerts and circuit breakers to prevent future recurrences."
  },
  {
    id: "star-3",
    question: "How do you handle ambiguous requirements or sudden scope changes from stakeholders?",
    competency: "Adaptability & Product Thinking",
    situation: "Two weeks before launching a core analytics dashboard, the VP of Product requested support for real-time telemetry instead of batch processing.",
    task: "I needed to evaluate technical feasibility, manage team bandwidth, and propose a viable compromise that satisfied business goals without burning out the team.",
    action: "I broke the feature down into P0 (near real-time 1-minute caching via Redis) vs P1 (true sub-second WebSocket streaming). I walked the VP through the infrastructure cost and delivery timeline trade-offs.",
    result: "We delivered the P0 near real-time solution by the original launch date, which met 95% of user requirements, while scheduling true streaming for the next quarter's roadmap."
  }
];

const TECHNICAL_FLASHCARDS = [
  {
    category: "JavaScript & Frontend",
    q: "Explain Event Loop, Microtasks, and Macrotasks in Node.js and Browser.",
    a: "The Call Stack executes synchronous code. When async operations complete, Microtasks (Promise.then, queueMicrotask, MutationObserver) have higher priority and drain completely before the next Macrotask (setTimeout, setInterval, setImmediate, I/O) is processed."
  },
  {
    category: "Backend & Databases",
    q: "What is Database Normalization vs Denormalization, and when do you choose which?",
    a: "Normalization (1NF, 2NF, 3NF) eliminates data redundancy and anomalies, ideal for write-heavy OLTP systems with strict ACID requirements. Denormalization stores duplicate data to optimize read performance and avoid costly multi-table JOINs, common in read-heavy analytics (OLAP) and distributed NoSQL databases."
  },
  {
    category: "Security & Web",
    q: "How do you prevent SQL Injection, XSS, and CSRF attacks?",
    a: "SQL Injection: Use parameterized queries/prepared statements (never string concatenation). XSS: Sanitize inputs, encode outputs, enforce Content Security Policy (CSP), and use modern frameworks that auto-escape (React). CSRF: Use SameSite=Strict cookies, anti-CSRF synchronizer tokens, and verify Origin/Referer headers."
  },
  {
    category: "Algorithms & DS",
    q: "When would you prefer QuickSort over MergeSort in practice?",
    a: "QuickSort has O(1) auxiliary space complexity (in-place) and better CPU cache locality due to contiguous array partitions. MergeSort requires O(N) additional memory, but provides guaranteed O(N log N) worst-case time and stability (preserves order of equal keys), making it ideal for linked lists or external sorting."
  }
];

export default function InterviewPrepPage() {
  const [activeTab, setActiveTab] = useState("behavioral");
  const [expandedCard, setExpandedCard] = useState(null);

  // STAR Story Interactive Builder State
  const [userStory, setUserStory] = useState({
    situation: "",
    task: "",
    action: "",
    result: ""
  });
  const [savedStories, setSavedStories] = useState([]);

  const handleSaveStory = (e) => {
    e.preventDefault();
    if (!userStory.situation || !userStory.action) return;
    setSavedStories([userStory, ...savedStories]);
    setUserStory({ situation: "", task: "", action: "", result: "" });
  };

  return (
    <div className="platform-page">
      {/* Hero Header */}
      <div className="platform-hero">
        <span className="platform-hero-badge">
          <MessageSquareQuote size={14} /> Practice Track · Interview Prep
        </span>
        <h1>Interview Prep Hub</h1>
        <p>
          Master technical questions, craft high-impact behavioral STAR stories,
          and practice high-frequency interview scenarios with proven rubrics.
        </p>
      </div>

      {/* Tabs */}
      <div className="platform-filter-bar">
        <button
          type="button"
          className={`platform-tab-btn ${activeTab === "behavioral" ? "active" : ""}`}
          onClick={() => setActiveTab("behavioral")}
        >
          <Target size={16} /> Behavioral & STAR Stories
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${activeTab === "technical" ? "active" : ""}`}
          onClick={() => setActiveTab("technical")}
        >
          <BookOpen size={16} /> Core Tech Q&A Flashcards
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${activeTab === "cheatsheet" ? "active" : ""}`}
          onClick={() => setActiveTab("cheatsheet")}
        >
          <Clock size={16} /> 24-Hour Interview Cheat Sheet
        </button>
      </div>

      {/* TAB 1: Behavioral & STAR */}
      {activeTab === "behavioral" && (
        <div>
          {/* STAR Builder Section */}
          <div className="platform-card" style={{ marginBottom: "28px", border: "1.5px solid rgba(99, 102, 241, 0.3)" }}>
            <div className="platform-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="platform-card-icon">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Interactive STAR Story Builder</h3>
                  <p style={{ margin: 0, fontSize: "12.5px" }}>Structure your project experiences into winning interview answers</p>
                </div>
              </div>
              <span className="platform-tag primary">STAR Rubric</span>
            </div>

            <form onSubmit={handleSaveStory}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "12px" }}>
                <div className="platform-form-group">
                  <label>1. Situation (Context & Challenge):</label>
                  <textarea
                    rows={2}
                    placeholder="Where were you working and what was the problem?"
                    value={userStory.situation}
                    onChange={(e) => setUserStory({ ...userStory, situation: e.target.value })}
                  />
                </div>
                <div className="platform-form-group">
                  <label>2. Task (Your Direct Responsibility):</label>
                  <textarea
                    rows={2}
                    placeholder="What did you specifically need to achieve?"
                    value={userStory.task}
                    onChange={(e) => setUserStory({ ...userStory, task: e.target.value })}
                  />
                </div>
                <div className="platform-form-group">
                  <label>3. Action (Steps & Decisions YOU Took):</label>
                  <textarea
                    rows={2}
                    placeholder="What technical steps, communication, or code did you implement?"
                    value={userStory.action}
                    onChange={(e) => setUserStory({ ...userStory, action: e.target.value })}
                  />
                </div>
                <div className="platform-form-group">
                  <label>4. Result (Metrics & Business Outcome):</label>
                  <textarea
                    rows={2}
                    placeholder="Include tangible metrics (e.g., reduced latency by 35%, saved $20k/yr)"
                    value={userStory.result}
                    onChange={(e) => setUserStory({ ...userStory, result: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="submit" className="platform-btn-primary">
                  Save STAR Story
                </button>
              </div>
            </form>
          </div>

          {/* Model Behavioral Questions */}
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>
            High-Impact Behavioral Questions & Model STAR Responses
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {BEHAVIORAL_QUESTIONS.map((bq, idx) => (
              <div key={bq.id} className="platform-card">
                <div className="platform-card-header">
                  <span className="platform-tag primary">{bq.competency}</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Question #{idx + 1}</span>
                </div>
                <h3 style={{ fontSize: "17px", margin: "0 0 14px", color: "var(--text)" }}>"{bq.question}"</h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                  <div style={{ padding: "12px", background: "var(--bg)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <strong style={{ color: "#6366f1", fontSize: "12px", textTransform: "uppercase" }}>Situation:</strong>
                    <p style={{ margin: "4px 0 0", fontSize: "13px" }}>{bq.situation}</p>
                  </div>
                  <div style={{ padding: "12px", background: "var(--bg)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <strong style={{ color: "#f59e0b", fontSize: "12px", textTransform: "uppercase" }}>Task:</strong>
                    <p style={{ margin: "4px 0 0", fontSize: "13px" }}>{bq.task}</p>
                  </div>
                  <div style={{ padding: "12px", background: "var(--bg)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <strong style={{ color: "#3b82f6", fontSize: "12px", textTransform: "uppercase" }}>Action:</strong>
                    <p style={{ margin: "4px 0 0", fontSize: "13px" }}>{bq.action}</p>
                  </div>
                  <div style={{ padding: "12px", background: "var(--bg)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <strong style={{ color: "#10b981", fontSize: "12px", textTransform: "uppercase" }}>Result:</strong>
                    <p style={{ margin: "4px 0 0", fontSize: "13px" }}>{bq.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Technical Flashcards */}
      {activeTab === "technical" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
            High-Frequency Technical Concepts & Quick Explanations
          </h2>
          {TECHNICAL_FLASHCARDS.map((fc, i) => {
            const isExpanded = expandedCard === i;
            return (
              <div
                key={i}
                className="platform-card"
                style={{ cursor: "pointer" }}
                onClick={() => setExpandedCard(isExpanded ? null : i)}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="platform-tag primary">{fc.category}</span>
                    <h3 style={{ margin: 0, fontSize: "15.5px" }}>{fc.q}</h3>
                  </div>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {isExpanded && (
                  <div style={{
                    marginTop: "14px",
                    paddingTop: "14px",
                    borderTop: "1px solid var(--border)",
                    fontSize: "14px",
                    color: "var(--text-muted)",
                    lineHeight: 1.6
                  }}>
                    {fc.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: Cheat Sheet */}
      {activeTab === "cheatsheet" && (
        <div className="platform-grid-2">
          <div className="platform-card">
            <div className="platform-card-header">
              <span className="platform-tag primary">24 Hours Before</span>
            </div>
            <h3>Pre-Interview Checklist</h3>
            <ul style={{ paddingLeft: "20px", fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.8 }}>
              <li>Test webcam, microphone, lighting, and internet connection.</li>
              <li>Review the job description and note 3 reasons why your skills match.</li>
              <li>Re-read your resume—be ready to explain every single project and technology listed.</li>
              <li>Prepare 4 thoughtful questions for the interviewer regarding team culture & roadmap.</li>
              <li>Get at least 7-8 hours of sleep. A rested brain codes 3x faster than a fatigued one.</li>
            </ul>
          </div>

          <div className="platform-card">
            <div className="platform-card-header">
              <span className="platform-tag success">During The Interview</span>
            </div>
            <h3>Communication Gold Rules</h3>
            <ul style={{ paddingLeft: "20px", fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.8 }}>
              <li><strong>Think Aloud:</strong> Never write code in silence for 5 minutes. Explain your train of thought.</li>
              <li><strong>Clarify Constraints:</strong> Ask about input size, null values, duplicates, and edge cases before coding.</li>
              <li><strong>Propose Brute Force First:</strong> Mention naive O(N²) solution, then optimize to O(N log N) or O(N).</li>
              <li><strong>Dry Run:</strong> Trace through your code manually with a small sample input before stating you are done.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

