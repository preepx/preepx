import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Bot, Sparkles } from "lucide-react";
import "@/styles/UserGuide.css";
import { ALL_FAQS } from "@/data/faqs";


export default function HelpCenter() {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    document.title = "Help Center | PreepX";
    window.scrollTo(0, 0);
  }, []);

  const handleAIHelpClick = () => {
    window.dispatchEvent(new Event('open-chatbot'));
  };

  return (
    <div className="user-guide-page">
      <header className="guide-hero" style={{ paddingBottom: '60px' }}>
        <h1>How can we help?</h1>
        <p className="guide-hero-sub">
          Find answers, FAQs and helpful information about using PreepX.
        </p>
      </header>

      <div className="guide-container" style={{ maxWidth: '800px', paddingBottom: '80px' }}>
        <main className="guide-content">

          {/* AI Bot Section */}
          <section className="guide-section-block" style={{ marginTop: '20px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '8px' }}>Need Quick Help?</h2>
            <p style={{ color: 'var(--hpw-text-muted)', marginBottom: '32px' }}>Ask the PreepX AI Help Bot for quick answers to basic questions about the platform.</p>

            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              {/* Bot icon styled like the FAB */}
              <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #166534, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(22,163,74,0.3)' }}>
                  <Bot size={28} color="#fff" strokeWidth={2} />
                </div>
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#1d1d1d', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={12} color="#facc15" />
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>AI Help Bot</h3>
                <p style={{ color: 'var(--hpw-text-muted)', fontSize: '14px' }}>Get instant help with common PreepX questions, features and basic troubleshooting.</p>
              </div>

              <button
                onClick={handleAIHelpClick}
                style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
              >
                Ask PreepX AI
              </button>
            </div>
          </section>

          {/* FAQs */}
          <section className="guide-section-block" style={{ marginTop: '60px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>Frequently Asked Questions</h2>
            <div>
              {ALL_FAQS.map((faq, i) => (
                <div key={i} style={{ borderBottom: '1px solid var(--hpw-border)', padding: '16px 0' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: '100%', background: 'none', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '8px 0', color: 'var(--hpw-text)', fontSize: '16px', fontWeight: '600', textAlign: 'left', gap: '16px' }}
                  >
                    {faq.q}
                    {openFaq === i ? <ChevronUp size={18} style={{ flexShrink: 0 }} /> : <ChevronDown size={18} style={{ flexShrink: 0 }} />}
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '12px 0 8px', color: 'var(--hpw-text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Still need help */}
          <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid var(--hpw-border-light)', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '12px' }}>Still need help?</h3>
            <p style={{ color: 'var(--hpw-text-muted)', marginBottom: '12px' }}>Our support team is here for you.</p>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@preepx.in"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0284c7', fontWeight: '600', textDecoration: 'none', fontSize: '15px' }}
            >
              contact@preepx.in
            </a>
          </div>

        </main>
      </div>
    </div>
  );
}
