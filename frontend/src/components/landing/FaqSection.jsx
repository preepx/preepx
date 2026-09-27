import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import "@/styles/landing/FaqCtaLanding.css";
import { LANDING_FAQS } from "@/data/faqs";

function FaqSection() {
  const [openMap, setOpenMap] = useState({ 0: true, 1: true });
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredFaqs =
    activeCategory === "all"
      ? LANDING_FAQS
      : LANDING_FAQS.filter((f) => f.category === activeCategory || f.category === "general");

  const toggleFaq = (idx) => {
    setOpenMap((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <section id="faq" className="prepx-faq section">
      <div className="section-header faq-header">
        <h2 className="prepx-faq-title">
          Frequently Asked <span className="gradient-text-blue">Questions</span>
        </h2>
        <p className="faq-subtitle">
          Everything you need to know about the PreepX platform and how it works for candidates and recruiters.
        </p>

        {/* Category Filters */}
        <div className="faq-filter-tabs">
          <button
            className={`faq-tab-btn ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            All Questions
          </button>
          <button
            className={`faq-tab-btn ${activeCategory === "candidate" ? "active" : ""}`}
            onClick={() => setActiveCategory("candidate")}
          >
            For Candidates
          </button>
          <button
            className={`faq-tab-btn ${activeCategory === "recruiter" ? "active" : ""}`}
            onClick={() => setActiveCategory("recruiter")}
          >
            For Recruiters
          </button>
        </div>
      </div>

      {/* 2-Column Grid Accordion List */}
      <div className="faq-accordion-container-2col">
        <div className="faq-grid-2col">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = !!openMap[idx];
            return (
              <div
                key={idx}
                className={`faq-card-item ${isOpen ? "open" : ""}`}
                onClick={() => toggleFaq(idx)}
              >
                <div className="faq-question-row">
                  <span className="faq-q-text">{faq.q}</span>
                  <div className="faq-chevron-wrap">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
                {isOpen && (
                  <div className="faq-answer-wrap">
                    <p className="faq-a-text">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
