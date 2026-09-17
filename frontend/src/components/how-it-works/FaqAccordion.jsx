import React, { useState } from "react";

export const DEFAULT_HOW_PREEPX_WORKS_FAQS = [
  {
    q: "What is PreepX?",
    a: "PreepX is an integrated AI-powered interview preparation and talent placement platform. It allows candidates to practice realistic voice-based mock interviews, solve coding assessments, and track progress, while providing recruiters with verified evaluation tools to source, screen, and hire qualified technical talent.",
  },
  {
    q: "Is PreepX only for students?",
    a: "No. While students and freshers use PreepX extensively to prepare for campus placements and first jobs, working professionals actively use PreepX to transition roles, prepare for senior technical rounds, and practice system design interviews.",
  },
  {
    q: "What can I practice on PreepX?",
    a: "You can practice full conversational AI mock interviews (both technical and HR/behavioral), objective multiple-choice exams covering CS fundamentals, live algorithmic coding problems in an integrated IDE, and subject-specific interview revision notes.",
  },
  {
    q: "Does PreepX provide interview feedback?",
    a: "Yes. After completing every mock interview session, PreepX generates a comprehensive evaluation scorecard. This covers communication pacing, technical correctness, answer completeness, specific areas for improvement, and overall benchmark ratings.",
  },
  {
    q: "Can recruiters use PreepX?",
    a: "Yes. PreepX provides an end-to-end recruiter suite where hiring teams can create custom assessments, invite candidates, review automated evaluations and transcripts, shortlist top talent, and manage the technical hiring pipeline.",
  },
  {
    q: "Can I find jobs on PreepX?",
    a: "Yes. PreepX includes a dedicated job discovery portal where verified candidates can explore open tech opportunities posted by partner organizations and apply directly with their validated performance scores.",
  },
  {
    q: "Can I track my preparation?",
    a: "Yes. Candidates have access to an analytics dashboard that logs all completed interviews, assessment scores, coding activity, performance trends, streak milestones, and earned XP over time.",
  },
];

export default function FaqAccordion({
  id = "faq",
  items = DEFAULT_HOW_PREEPX_WORKS_FAQS,
}) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const list = items && items.length > 0 ? items : DEFAULT_HOW_PREEPX_WORKS_FAQS;

  return (
    <section id={id} className="hpw-simple-section">
      <h2 className="hpw-section-heading">
        <span className="hpw-heading-icon-badge">
          <img src="/landing/hugeicons_message-programming.svg" alt="" className="hpw-heading-icon" />
        </span>
        Frequently Asked Questions
      </h2>
      <p className="hpw-lead-text">
        Common questions about PreepX features, practice tools, and account workflows.
      </p>

      <div className="hpw-faq-container">
        {list.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="hpw-faq-card">
              <button
                type="button"
                className="hpw-faq-btn"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
              >
                <span>{faq.q || faq.question}</span>
                <span style={{ fontSize: "18px", color: "#0284c7" }}>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className="hpw-faq-ans">
                  <p style={{ margin: 0 }}>{faq.a || faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
