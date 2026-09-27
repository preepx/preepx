import React, { useState } from "react";
import { HOW_PREEPX_WORKS_FAQS } from "@/data/faqs";

export { HOW_PREEPX_WORKS_FAQS as DEFAULT_HOW_PREEPX_WORKS_FAQS };

export default function FaqAccordion({
  id = "faq",
  items,
}) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const list = items && items.length > 0 ? items : HOW_PREEPX_WORKS_FAQS;

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
