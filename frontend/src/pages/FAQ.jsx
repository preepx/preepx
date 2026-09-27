import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import "@/styles/UserGuide.css";
import "@/styles/landing/FaqCtaLanding.css";
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
          Everything you need to know about PreepX for candidates and recruiters.
        </p>
      </header>

      <div className="guide-container" style={{ maxWidth: "800px", paddingBottom: "80px" }}>
        <main className="guide-content">

          {/* Category Tabs — same style as homepage FAQ */}
          <div className="faq-filter-tabs" style={{ marginBottom: "40px", marginTop: "20px" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                className={`faq-tab-btn ${activeCategory === cat.key ? "active" : ""}`}
                onClick={() => { setActiveCategory(cat.key); setOpenFaq(null); }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Accordion */}
          <div>
            {filtered.map((faq, i) => (
              <div key={i} style={{ borderBottom: "1px solid var(--hpw-border)", padding: "16px 0" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "8px 0",
                    color: "var(--hpw-text)",
                    fontSize: "16px",
                    fontWeight: "600",
                    textAlign: "left",
                    gap: "16px",
                  }}
                >
                  {faq.q}
                  {openFaq === i
                    ? <ChevronUp size={18} style={{ flexShrink: 0 }} />
                    : <ChevronDown size={18} style={{ flexShrink: 0 }} />}
                </button>
                {openFaq === i && (
                  <div style={{ padding: "12px 0 8px", color: "var(--hpw-text-muted)", fontSize: "15px", lineHeight: "1.6" }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Support CTA */}
          <div style={{ marginTop: "60px", paddingTop: "40px", borderTop: "1px solid var(--hpw-border-light)", textAlign: "center" }}>
            <h3 style={{ marginBottom: "12px" }}>Still have a question?</h3>
            <p style={{ color: "var(--hpw-text-muted)", marginBottom: "12px" }}>Our support team is here to help.</p>
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
