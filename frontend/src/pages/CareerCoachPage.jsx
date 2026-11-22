import React, { useState } from "react";
import { Bot, Send, Sparkles, User, Briefcase, TrendingUp, HelpCircle } from "lucide-react";
import "@/styles/PlatformPages.css";

const PRESET_PROMPTS = [
  "How should I negotiate between two competing job offers?",
  "What is the fastest roadmap to transition from service-based to product-based companies?",
  "How can I prepare for an SDE-2 / Senior promotion within 12 months?",
  "How to write a high-conversion cold message to tech recruiters on LinkedIn?"
];

const INITIAL_MESSAGES = [
  {
    sender: "bot",
    text: "Hello! I am your PreepX AI Career Coach. Whether you need strategies for salary negotiation, roadmap guidance to break into top tier tech companies, or resume optimization advice—ask me anything!"
  }
];

export default function CareerCoachPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = { sender: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = "";
      const lower = query.toLowerCase();

      if (lower.includes("negotiat") || lower.includes("offer")) {
        botResponse = `### 🎯 Strategy for Offer Negotiation:
1. **Never Give the First Number**: When asked about expectations, say: *"I am focused on finding the right cultural and technical fit, and I am confident we can align on competitive market compensation."*
2. **Leverage Competing Timelines**: Politely notify Company A that you are in final stages with Company B. This creates urgent executive sign-off pressure.
3. **Focus on Total Compensation**: If base salary has rigid HR bands, negotiate for a **Joining Bonus**, additional **RSUs/ESOPs**, or an accelerated **6-month performance appraisal** review.`;
      } else if (lower.includes("transition") || lower.includes("service") || lower.includes("product")) {
        botResponse = `### 🚀 Transitioning to Product Companies:
1. **Depth over Breadth in DSA**: Master 100 core LeetCode Mediums across 14 fundamental patterns (Sliding Window, Two Pointers, Trees, Graphs, DP).
2. **Build Proof of Competence**: Create one distributed systems project with metrics (e.g. Rate Limiter with Redis, real-time chat with WebSockets, or a high-concurrency queue with Kafka).
3. **Rewrite Your Resume**: Emphasize *impact metrics* (latency reduced, queries optimized, uptime percentage) rather than passive tasks.`;
      } else if (lower.includes("linkedin") || lower.includes("cold")) {
        botResponse = `### 📩 High-Conversion LinkedIn Outreach Template:
*"Hi [Name], I noticed you are leading engineering efforts at [Company] on [Team/Product]. I recently built a distributed caching simulator in Go/Node.js solving similar cache-invalidation challenges. I would love to learn what technical challenges your team is currently tackling, and see if my background in low-latency systems could add value. Thanks!"*
- **Keep it under 75 words**. Highlight relevance, not a plea for a job.`;
      } else {
        botResponse = `### 💡 Actionable Career Guidance:
1. **Focus on High-Leverage Skills**: In the current market, engineers who master **System Architecture**, **Clean Distributed Code**, and **AI Tooling / Embeddings** command top compensation percentiles.
2. **Interview Preparedness**: Practice at least 2 mock interviews every week under timed constraints. The ability to articulate trade-offs out loud is what separates SDE-1 from SDE-2/3.
3. **Targeted Networking**: Connect with Engineering Managers rather than general recruiters; technical leads have direct requisition headcount.`;
      }

      setIsTyping(false);
      setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
    }, 1000);
  };

  return (
    <div className="platform-page">
      {/* Hero Header */}
      <div className="platform-hero">
        <span className="platform-hero-badge">
          <Bot size={14} /> AI Career Coach
        </span>
        <h1>AI Career Mentorship & Advisory</h1>
        <p>
          24/7 personalized mentorship for salary negotiation, technical promotion strategies,
          and strategic career pivots.
        </p>
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
        {PRESET_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            className="platform-tab-btn"
            style={{ fontSize: "12.5px" }}
            onClick={() => handleSend(prompt)}
          >
            <Sparkles size={13} color="#6366f1" /> {prompt}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="platform-card" style={{ height: "550px", display: "flex", flexDirection: "column", padding: "0", overflow: "hidden" }}>
        
        {/* Messages Stream */}
        <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "12px",
                alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                maxWidth: "80%"
              }}
            >
              {m.sender === "bot" && (
                <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#6366f1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Bot size={18} />
                </div>
              )}
              <div style={{
                background: m.sender === "user" ? "#6366f1" : "var(--bg)",
                color: m.sender === "user" ? "#fff" : "var(--text)",
                padding: "14px 18px",
                borderRadius: "12px",
                border: m.sender === "user" ? "none" : "1px solid var(--border)",
                fontSize: "14px",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap"
              }}>
                {m.text}
              </div>
              {m.sender === "user" && (
                <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--border)", color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={{ display: "flex", gap: "12px", alignSelf: "flex-start" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#6366f1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={18} />
              </div>
              <div style={{ background: "var(--bg)", padding: "12px 18px", borderRadius: "12px", border: "1px solid var(--border)", fontSize: "13px", color: "var(--text-muted)" }}>
                PreepX Career Coach is thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", background: "var(--surface)", display: "flex", gap: "10px" }}>
          <input
            type="text"
            className="platform-search-input"
            placeholder="Ask your career coach anything (e.g., 'How do I ask for a 30% raise?')..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            type="button"
            className="platform-btn-primary"
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
          >
            <Send size={16} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}

