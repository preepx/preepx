import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Bot, Sparkles, Mail, X, Send, AlertTriangle, Loader2 } from "lucide-react";
import API from "@/utils/api";
import notify from "@/utils/notify";
import { getStoredUser } from "@/utils/authUtils";
import "@/styles/UserGuide.css";
import "@/styles/landing/ChatBot.css";
import { ALL_FAQS } from "@/data/faqs";

export default function HelpCenter() {
  const [openFaq, setOpenFaq] = useState(null);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [submittingQuery, setSubmittingQuery] = useState(false);
  const [queryError, setQueryError] = useState("");
  const [queryForm, setQueryForm] = useState({
    name: "",
    email: "",
    subject: "Query for PreepX Support",
    message: "",
  });

  useEffect(() => {
    document.title = "Help Center | PreepX";
    window.scrollTo(0, 0);
  }, []);

  const handleAIHelpClick = () => {
    window.dispatchEvent(new Event("open-chatbot"));
  };

  const handleOpenQueryModal = () => {
    const user = getStoredUser() || {};
    setQueryForm({
      name: user.fullName || user.name || "",
      email: user.email || "",
      subject: "Query for PreepX Support",
      message: "",
    });
    setQueryError("");
    setShowQueryModal(true);
  };

  const handleSendQuery = async (e) => {
    if (e) e.preventDefault();
    setQueryError("");

    if (!queryForm.name.trim()) {
      setQueryError("Please enter your name.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!queryForm.email.trim() || !emailRegex.test(queryForm.email.trim())) {
      setQueryError("Please enter a valid email address.");
      return;
    }
    if (!queryForm.message.trim()) {
      setQueryError("Please enter your query or issue.");
      return;
    }

    setSubmittingQuery(true);
    try {
      const res = await API.post("/feedback", {
        name: queryForm.name.trim(),
        email: queryForm.email.trim(),
        subject: queryForm.subject.trim() || "Query for PreepX Support",
        message: queryForm.message.trim(),
        source: "help_center_support",
      });

      if (res.data?.success) {
        notify.success("Query sent successfully! Our team will contact you shortly.");
        setShowQueryModal(false);
        setQueryForm({ name: "", email: "", subject: "", message: "" });
      } else {
        const errorMsg = res.data?.message || "Failed to send query.";
        setQueryError(errorMsg);
        notify.error(errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to send query. Please try again.";
      setQueryError(errorMsg);
      notify.error(errorMsg);
    } finally {
      setSubmittingQuery(false);
    }
  };

  return (
    <div className="user-guide-page">
      <header className="guide-hero" style={{ paddingBottom: "60px" }}>
        <h1>How can we help?</h1>
        <p className="guide-hero-sub">
          Find answers, FAQs and helpful information about using PreepX.
        </p>
      </header>

      <div className="guide-container" style={{ maxWidth: "800px", paddingBottom: "80px" }}>
        <main className="guide-content">
          {/* AI Bot & Support Section */}
          <section className="guide-section-block" style={{ marginTop: "20px", textAlign: "center" }}>
            <h2 style={{ marginBottom: "8px" }}>Need Quick Help?</h2>
            <p style={{ color: "var(--hpw-text-muted)", marginBottom: "32px" }}>
              Ask the PreepX AI Help Bot for quick answers or contact our team directly.
            </p>

            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
              {/* Bot icon styled with signature corner AI FAB gradient */}
              <div style={{ position: "relative", width: "64px", height: "64px" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "linear-gradient(90deg, #3d5eff 0%, #6017c7 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 24px rgba(61, 94, 255, 0.4), 0 2px 8px rgba(96, 23, 199, 0.2)",
                  }}
                >
                  <Bot size={30} color="#fff" strokeWidth={2} />
                </div>
                <span
                  style={{
                    position: "absolute",
                    top: "-3px",
                    right: "-3px",
                    background: "#1e293b",
                    borderRadius: "50%",
                    width: "22px",
                    height: "22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #ffffff",
                  }}
                >
                  <Sparkles size={12} color="#facc15" />
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>AI Help Bot</h3>
                <p style={{ color: "var(--hpw-text-muted)", fontSize: "14px" }}>
                  Get instant help with common PreepX questions, features and basic troubleshooting.
                </p>
              </div>

              {/* Action Buttons: Ask PreepX AI & Contact Us */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={handleAIHelpClick}
                  style={{
                    background: "linear-gradient(90deg, #3d5eff 0%, #6017c7 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "11px 24px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 8px rgba(61, 94, 255, 0.3)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(90deg, #2b4be6 0%, #4c0fa6 100%)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(90deg, #3d5eff 0%, #6017c7 100%)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <Bot size={16} />
                  <span>Ask PreepX AI</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenQueryModal}
                  style={{
                    background: "#ffffff",
                    color: "#475569",
                    border: "1.5px solid #cbd5e1",
                    padding: "10px 22px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.borderColor = "#94a3b8";
                    e.currentTarget.style.color = "#0f172a";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.borderColor = "#cbd5e1";
                    e.currentTarget.style.color = "#475569";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <Mail size={16} style={{ color: "#6366f1" }} />
                  <span>Contact Us</span>
                </button>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="guide-section-block" style={{ marginTop: "60px" }}>
            <h2 style={{ textAlign: "center", marginBottom: "32px" }}>Frequently Asked Questions</h2>
            <div>
              {ALL_FAQS.map((faq, i) => (
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
                    {openFaq === i ? (
                      <ChevronUp size={18} style={{ flexShrink: 0 }} />
                    ) : (
                      <ChevronDown size={18} style={{ flexShrink: 0 }} />
                    )}
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: "12px 0 8px", color: "var(--hpw-text-muted)", fontSize: "15px", lineHeight: "1.6" }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Support / Query Modal */}
      {showQueryModal && (
        <div
          className="chatbot-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submittingQuery) {
              setShowQueryModal(false);
            }
          }}
        >
          <div className="chatbot-modal-card" role="dialog" aria-modal="true" aria-labelledby="hc-query-modal-title">
            {/* Header */}
            <div className="chatbot-modal-header">
              <div className="chatbot-modal-header-content">
                <div className="chatbot-modal-header-icon">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 id="hc-query-modal-title" className="chatbot-modal-title">Contact PreepX Support</h3>
                  <p className="chatbot-modal-subtitle">
                    Have a query AI couldn't solve? Write to our team directly.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="chatbot-modal-close"
                onClick={() => !submittingQuery && setShowQueryModal(false)}
                disabled={submittingQuery}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendQuery}>
              <div className="chatbot-modal-body">
                {/* Support Team Info Badge */}
                <div className="chatbot-modal-info-pill">
                  <span className="chatbot-modal-info-dot" />
                  <span>Direct message to <strong>PreepX Support Team</strong></span>
                </div>

                {queryError && (
                  <div className="chatbot-modal-error-alert">
                    <AlertTriangle size={15} />
                    <span>{queryError}</span>
                  </div>
                )}

                {/* Name */}
                <div className="chatbot-modal-form-group">
                  <label className="chatbot-modal-label">
                    Your Name <span className="chatbot-modal-label-req">*</span>
                  </label>
                  <input
                    type="text"
                    className="chatbot-modal-input"
                    value={queryForm.name}
                    onChange={(e) =>
                      setQueryForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter your name"
                    required
                    disabled={submittingQuery}
                  />
                </div>

                {/* Email */}
                <div className="chatbot-modal-form-group">
                  <label className="chatbot-modal-label">
                    Your Email Address <span className="chatbot-modal-label-req">*</span>
                  </label>
                  <input
                    type="email"
                    className="chatbot-modal-input"
                    value={queryForm.email}
                    onChange={(e) =>
                      setQueryForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="name@example.com"
                    required
                    disabled={submittingQuery}
                  />
                </div>

                {/* Subject */}
                <div className="chatbot-modal-form-group">
                  <label className="chatbot-modal-label">
                    Subject <span className="chatbot-modal-label-req">*</span>
                  </label>
                  <input
                    type="text"
                    className="chatbot-modal-input"
                    value={queryForm.subject}
                    onChange={(e) =>
                      setQueryForm((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    placeholder="Brief summary of your query"
                    required
                    disabled={submittingQuery}
                  />
                </div>

                {/* Message */}
                <div className="chatbot-modal-form-group">
                  <label className="chatbot-modal-label">
                    Your Query / Message <span className="chatbot-modal-label-req">*</span>
                  </label>
                  <textarea
                    rows={4}
                    className="chatbot-modal-textarea"
                    value={queryForm.message}
                    onChange={(e) =>
                      setQueryForm((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Tell us what you need help with or what AI couldn't resolve..."
                    required
                    disabled={submittingQuery}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="chatbot-modal-footer">
                <button
                  type="button"
                  className="chatbot-modal-btn-cancel"
                  onClick={() => setShowQueryModal(false)}
                  disabled={submittingQuery}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="chatbot-modal-btn-submit"
                  disabled={submittingQuery}
                >
                  {submittingQuery ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send Query</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
