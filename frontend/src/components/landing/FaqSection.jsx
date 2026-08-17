import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import "@/styles/landing/FaqCtaLanding.css";

function FaqSection() {
  const [openMap, setOpenMap] = useState({ 0: true, 1: true });
  const [activeCategory, setActiveCategory] = useState("all");

  const faqs = [
    {
      category: "candidate",
      q: "What is PreePX and how does it help me get hired?",
      a: "PreePX is an intelligent talent ecosystem that helps candidates practice real-time AI mock interviews, take objective assessments, earn verifiable certificates, and get discovered by top tech recruiters looking for proven skills.",
    },
    {
      category: "candidate",
      q: "How does the AI mock interview evaluation work?",
      a: "Our Groq-powered AI listens to your spoken answers in real-time, evaluates technical accuracy, completeness, and clarity against industry rubrics, and delivers instant actionable feedback and score breakdowns.",
    },
    {
      category: "recruiter",
      q: "How do recruiters use PreePX to hire faster?",
      a: "Recruiters create custom skill-based assessments, evaluate candidate code and responses with AI analytics, shortlist proven talent with confidence, and conduct seamless automated interviews.",
    },
    {
      category: "candidate",
      q: "What roles and tech stacks can I practice for?",
      a: "You can practice for any role including Frontend, Backend, Full Stack, Data Science, DevOps, Mobile, and Product Management across stacks like React, Node.js, Python, Java, AWS, and more.",
    },
    {
      category: "recruiter",
      q: "Can we customize assessment questions and rubrics?",
      a: "Yes! You can specify your exact job descriptions, required technical skills, and difficulty levels. The AI dynamically crafts tailored questions and grading rubrics.",
    },
    {
      category: "general",
      q: "Are PreePX certificates verifiable?",
      a: "Yes! Every certificate issued by PreePX includes a unique verifiable credential ID that can be shared on LinkedIn, added to your resume, and verified by partner recruiters.",
    },
    {
      category: "general",
      q: "Is candidate audio and video data kept secure and private?",
      a: "Absolutely. Webcam feeds are processed locally for proctoring/feedback and are never stored or sold. Audio transcription and analytics comply strictly with enterprise-grade data privacy standards.",
    },
    {
      category: "candidate",
      q: "Are detailed interview notes and performance tips provided?",
      a: "Yes! After every mock session, you receive comprehensive question-by-question scoring, model sample answers, and personalized strengths & weaknesses reports.",
    },
  ];

  const filteredFaqs =
    activeCategory === "all"
      ? faqs
      : faqs.filter((f) => f.category === activeCategory || f.category === "general");

  const toggleFaq = (idx) => {
    setOpenMap((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <section className="prepx-faq section">
      <div className="section-header faq-header">
        <h2 className="prepx-faq-title">
          Frequently Asked <span className="gradient-text-blue">Questions</span>
        </h2>
        <p className="faq-subtitle">
          Everything you need to know about the PreePX platform and how it works for candidates and recruiters.
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
