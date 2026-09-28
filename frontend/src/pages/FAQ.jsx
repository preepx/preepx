import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import "@/styles/UserGuide.css";
import { ALL_FAQS } from "@/data/faqs";

const CATEGORIES = [
  { key: "all", label: "All Questions" },
  { key: "candidate", label: "For Candidates" },
  { key: "recruiter", label: "For Recruiters" },
  { key: "general", label: "General" },
];

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    document.title = "FAQ | PreepX";
    window.scrollTo(0, 0);
  }, []);

  const filtered =
    activeCategory === "all"
      ? ALL_FAQS
      : ALL_FAQS.filter((f) => f.category === activeCategory);

  return (
    <div className="user-guide-page">
      <header className="guide-hero" style={{ paddingBottom: "60px" }}>
        <h1>Frequently Asked Questions</h1>
        <p className="guide-hero-sub">
          Everything you need to know about PreepX — for candidates and recruiters.
        </p>
      </header>

      <div className="guide-container" style={{ maxWidth: "860px", paddingBottom: "80px" }}>
        <main className="guide-content">

          {/* Category Tabs */}
          <div style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            marginBottom: "36px",
            marginTop: "28px",
            background: "var(--hpw-card-bg)",
            border: "1px solid var(--hpw-border)",
            borderRadius: "12px",
            padding: "5px",
            width: "fit-content",
          }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => { setActiveCategory(cat.key); setOpenFaq(null); }}
                style={{
                  padding: "7px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: activeCategory === cat.key
                    ? "linear-gradient(135deg, #0ea5e9, #6366f1)"
                    : "transparent",
                  color: activeCategory === cat.key ? "#fff" : "var(--hpw-text-muted)",
                  fontWeight: activeCategory === cat.key ? "700" : "500",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: activeCategory === cat.key ? "0 2px 10px rgba(99,102,241,0.35)" : "none",
                  whiteSpace: "nowrap",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ count */}
          <p style={{ fontSize: "13px", color: "var(--hpw-text-muted)", marginBottom: "24px" }}>
            Showing {filtered.length} question{filtered.length !== 1 ? "s" : ""}
          </p>

          {/* Accordion */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  style={{
                    background: "var(--hpw-card-bg)",
                    border: isOpen
                      ? "1px solid #0284c7"
                      : "1px solid var(--hpw-border)",
                    borderRadius: "12px",
                    padding: "18px 22px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isOpen ? "0 4px 20px rgba(2,132,199,0.1)" : "none",
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                  }}>
                    <span style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: isOpen ? "#0284c7" : "var(--hpw-text)",
                      lineHeight: "1.5",
                      transition: "color 0.2s",
                    }}>
                      {faq.q}
                    </span>
                    <span style={{
                      flexShrink: 0,
                      color: isOpen ? "#0284c7" : "var(--hpw-text-muted)",
                      transition: "color 0.2s",
                    }}>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </div>

                  {isOpen && (
                    <div style={{
                      marginTop: "14px",
                      paddingTop: "14px",
                      borderTop: "1px solid var(--hpw-border-light)",
                      color: "var(--hpw-text-muted)",
                      fontSize: "14px",
                      lineHeight: "1.7",
                    }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Support CTA */}
          <div style={{
            marginTop: "64px",
            padding: "36px 32px",
            background: "var(--hpw-card-bg)",
            border: "1px solid var(--hpw-border)",
            borderRadius: "16px",
            textAlign: "center",
          }}>
            <h3 style={{ marginBottom: "10px", fontSize: "18px" }}>Still have a question?</h3>
            <p style={{ color: "var(--hpw-text-muted)", marginBottom: "16px", fontSize: "14px" }}>
              Our support team is here to help with any questions not covered above.
            </p>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@preepx.in"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0284c7", fontWeight: "600", textDecoration: "none", fontSize: "15px" }}
            >
              contact@preepx.in
            </a>
          </div>

        </main>
      </div>
    </div>
  );
}
