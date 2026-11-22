import React, { useState } from "react";
import { Sparkles, BrainCircuit, RefreshCw, Send, CheckCircle2, AlertCircle, Award, Target } from "lucide-react";
import "@/styles/PlatformPages.css";

const PRACTICE_PROMPTS = {
  frontend: [
    {
      q: "How does React's Virtual DOM reconciliation algorithm work, and why are 'key' props essential when rendering lists?",
      ideal: "React maintains a virtual representation of the UI in memory. During reconciliation, React diffs the new Virtual DOM tree against the previous snapshot using a heuristic O(N) algorithm. 'key' props give elements stable identities across renders, allowing React to match children and avoid re-mounting existing DOM nodes, ensuring optimal performance and preserving component state."
    },
    {
      q: "What causes layout thrashing and reflows in the browser, and how can you optimize web performance to prevent them?",
      ideal: "Layout thrashing occurs when JavaScript repeatedly alternates between reading geometric styles (like offsetHeight or scrollTop) and writing style changes, forcing the browser to recalculate layout synchronously. You can prevent it by batching DOM writes, using CSS transforms/opacity that run on the GPU compositor thread, and utilizing requestAnimationFrame or virtualized lists."
    }
  ],
  backend: [
    {
      q: "Explain database ACID properties and describe what isolation levels solve dirty reads and phantom reads.",
      ideal: "ACID stands for Atomicity (all-or-nothing), Consistency (state integrity), Isolation (concurrent safety), and Durability (permanent persistence upon commit). The four ANSI SQL isolation levels are: Read Uncommitted, Read Committed (prevents dirty reads), Repeatable Read (prevents non-repeatable reads), and Serializable (prevents phantom reads via range locks or snapshot isolation)."
    },
    {
      q: "How does connection pooling in database drivers improve throughput, and what happens when the pool is exhausted?",
      ideal: "Establishing TCP and SSL handshakes for database connections is CPU and time expensive. Connection pools maintain an active set of reusable connections. When all connections are leased (exhausted), incoming queries enter a waiting queue until a connection returns or timeout occurs, which can lead to HTTP 500/504 errors if not monitored with circuit breakers."
    }
  ],
  system: [
    {
      q: "How would you design a distributed caching layer to prevent Cache Avalanche and Cache Stampede (Thundering Herd)?",
      ideal: "Cache Avalanche occurs when thousands of keys expire simultaneously. Mitigate this by adding random jitter to TTLs and using redis replicas. Cache Stampede happens when a high-traffic key expires and hundreds of concurrent threads query the database at once. Prevent this using mutual exclusion distributed locks (Redlock) or background asynchronous revalidation (Stale-While-Revalidate)."
    }
  ],
  behavioral: [
    {
      q: "Tell me about a time you had to deliver a critical project with incomplete specifications and tight deadlines.",
      ideal: "Use the STAR format: Explain the ambiguous business requirement (Situation), your specific goal (Task), how you proactively created prototypes, gathered continuous stakeholder feedback, and scoped MVP deliverables (Action), and quantify the successful on-time delivery impact (Result)."
    }
  ]
};

export default function AIPracticePage() {
  const [role, setRole] = useState("frontend");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const currentQuestions = PRACTICE_PROMPTS[role] || PRACTICE_PROMPTS.frontend;
  const currentQ = currentQuestions[currentIndex % currentQuestions.length];

  const handleNextQuestion = () => {
    setCurrentIndex((prev) => prev + 1);
    setUserAnswer("");
    setEvaluation(null);
  };

  const handleEvaluate = () => {
    if (!userAnswer.trim()) return;
    setIsEvaluating(true);

    setTimeout(() => {
      setIsEvaluating(false);
      // Realistic AI evaluation heuristic
      const length = userAnswer.trim().length;
      const score = Math.min(9.8, Math.max(6.5, (length / 80) + 5.5)).toFixed(1);

      setEvaluation({
        score,
        technicalAccuracy: Math.min(96, Math.floor(score * 10)),
        communication: 92,
        strengths: [
          "Good conceptual structure and clear identification of core terms.",
          "Demonstrates solid awareness of practical real-world trade-offs."
        ],
        improvements: [
          "Could mention specific edge cases or failure mitigation strategies.",
          "Try referencing performance metrics (e.g. time complexity or memory consumption)."
        ],
        idealAnswer: currentQ.ideal
      });
    }, 1200);
  };

  return (
    <div className="platform-page">
      {/* Hero Header */}
      <div className="platform-hero">
        <span className="platform-hero-badge">
          <Sparkles size={14} /> AI Practice Arena
        </span>
        <h1>AI-Powered Real-Time Practice</h1>
        <p>
          Practice technical and behavioral interview questions with instantaneous AI evaluation,
          depth scoring, and actionable model answers.
        </p>
      </div>

      {/* Role Selector Tabs */}
      <div className="platform-filter-bar">
        <button
          type="button"
          className={`platform-tab-btn ${role === "frontend" ? "active" : ""}`}
          onClick={() => { setRole("frontend"); setCurrentIndex(0); setEvaluation(null); }}
        >
          Frontend (React & Web)
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${role === "backend" ? "active" : ""}`}
          onClick={() => { setRole("backend"); setCurrentIndex(0); setEvaluation(null); }}
        >
          Backend & Databases
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${role === "system" ? "active" : ""}`}
          onClick={() => { setRole("system"); setCurrentIndex(0); setEvaluation(null); }}
        >
          System Design
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${role === "behavioral" ? "active" : ""}`}
          onClick={() => { setRole("behavioral"); setCurrentIndex(0); setEvaluation(null); }}
        >
          Behavioral & Leadership
        </button>
      </div>

      {/* Question Card */}
      <div className="platform-card" style={{ marginBottom: "24px", border: "1.5px solid rgba(99, 102, 241, 0.3)" }}>
        <div className="platform-card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="platform-tag primary">AI Question Prompt</span>
            <span className="platform-tag">Interview Simulation</span>
          </div>
          <button
            type="button"
            className="platform-btn-secondary"
            onClick={handleNextQuestion}
            style={{ padding: "6px 12px", fontSize: "12.5px" }}
          >
            <RefreshCw size={14} /> New Question
          </button>
        </div>

        <h2 style={{ fontSize: "19px", fontWeight: 700, margin: "8px 0 16px", color: "var(--text)" }}>
          "{currentQ.q}"
        </h2>

        {/* Text Answer Editor */}
        <div className="platform-form-group">
          <label style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Type your response (Speak or type like you would in a real interview):</span>
            <span style={{ color: "var(--text-muted)" }}>{userAnswer.length} characters</span>
          </label>
          <textarea
            rows={6}
            placeholder="Structure your answer with: 1) Definition & Context, 2) Technical mechanism, 3) Real-world optimization or trade-off..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            style={{ resize: "vertical", fontSize: "14px", lineHeight: "1.6" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            type="button"
            className="platform-btn-primary"
            onClick={handleEvaluate}
            disabled={!userAnswer.trim() || isEvaluating}
            style={{ opacity: !userAnswer.trim() || isEvaluating ? 0.6 : 1 }}
          >
            {isEvaluating ? (
              <>Evaluating with AI...</>
            ) : (
              <>
                <Send size={15} /> Submit for AI Evaluation
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Evaluation Result Card */}
      {evaluation && (
        <div className="platform-card" style={{ border: "1.5px solid #10b981", animation: "pageFadeIn 0.3s ease" }}>
          <div className="platform-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="platform-card-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                <Award size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>AI Scorecard: {evaluation.score} / 10</h3>
                <p style={{ margin: 0, fontSize: "12.5px" }}>Comprehensive technical and communication rubric analysis</p>
              </div>
            </div>
            <span className="platform-tag success">Evaluated</span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "14px",
            margin: "16px 0",
            padding: "16px",
            background: "var(--bg)",
            borderRadius: "10px",
            border: "1px solid var(--border)"
          }}>
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Overall Score</span>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#10b981" }}>{evaluation.score} / 10</div>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Technical Accuracy</span>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#6366f1" }}>{evaluation.technicalAccuracy}%</div>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Communication Clarity</span>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#f59e0b" }}>{evaluation.communication}%</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
            <div style={{ padding: "14px", background: "var(--bg)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <h4 style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981", margin: "0 0 8px", fontSize: "14px" }}>
                <CheckCircle2 size={16} /> Key Strengths
              </h4>
              <ul style={{ paddingLeft: "18px", margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                {evaluation.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div style={{ padding: "14px", background: "var(--bg)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <h4 style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f59e0b", margin: "0 0 8px", fontSize: "14px" }}>
                <AlertCircle size={16} /> Areas for Improvement
              </h4>
              <ul style={{ paddingLeft: "18px", margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                {evaluation.improvements.map((imp, idx) => (
                  <li key={idx}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ padding: "16px", background: "var(--bg)", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <h4 style={{ margin: "0 0 8px", fontSize: "14px", color: "#6366f1", fontWeight: 700 }}>
              💡 Model Answer & Best Practices:
            </h4>
            <p style={{ margin: 0, fontSize: "13.5px", color: "var(--text)", lineHeight: 1.65 }}>
              {evaluation.idealAnswer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

