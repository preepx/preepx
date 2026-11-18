import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Home,
  ChevronRight,
  FileText,
  Share2,
  Download,
  RotateCcw,
  Check,
  X,
  BarChart2,
  AlertTriangle,
  Sparkles,
  MessageSquare,
  Send,
  Loader2,
} from "lucide-react";
import API from "@/utils/api";
import {
  FaJava,
  FaPython,
  FaJs,
  FaReact,
  FaNodeJs,
  FaHtml5,
  FaCss3Alt,
  FaDatabase,
  FaDocker,
  FaAws,
  FaGolang,
  FaRust,
  FaPhp,
  FaGitAlt,
} from "react-icons/fa6";
import {
  SiTypescript,
  SiMongodb,
  SiPostgresql,
  SiMysql,
  SiKubernetes,
  SiSpringboot,
  SiCplusplus,
  SiLinux,
} from "react-icons/si";
import notify from "@/utils/notify";
import "@/styles/ObjectiveExamResult.css";

const OPTION_LETTERS = ["A", "B", "C", "D"];

/**
 * Returns matching icon for a given topic or subject.
 * If not available, returns the first capital letter as requested.
 */
function getTopicIcon(topic) {
  const t = (topic || "").toLowerCase().trim();

  if (t.includes("java") && !t.includes("javascript")) {
    return {
      node: <FaJava size={28} className="text-[#dc2626]" />,
      bg: "#fff1f2",
      border: "#ffe4e6",
    };
  }
  if (t.includes("python")) {
    return {
      node: <FaPython size={28} className="text-[#2563eb]" />,
      bg: "#eff6ff",
      border: "#dbeafe",
    };
  }
  if (t.includes("javascript") || t === "js") {
    return {
      node: <FaJs size={28} className="text-[#ca8a04]" />,
      bg: "#fefce8",
      border: "#fef08a",
    };
  }
  if (t.includes("typescript") || t === "ts") {
    return {
      node: <SiTypescript size={26} className="text-[#2563eb]" />,
      bg: "#eff6ff",
      border: "#dbeafe",
    };
  }
  if (t.includes("react")) {
    return {
      node: <FaReact size={28} className="text-[#0891b2]" />,
      bg: "#ecfeff",
      border: "#cffafe",
    };
  }
  if (t.includes("node")) {
    return {
      node: <FaNodeJs size={28} className="text-[#16a34a]" />,
      bg: "#f0fdf4",
      border: "#dcfce7",
    };
  }
  if (t.includes("c++") || t.includes("cpp")) {
    return {
      node: <SiCplusplus size={26} className="text-[#0284c7]" />,
      bg: "#f0f9ff",
      border: "#e0f2fe",
    };
  }
  if (t.includes("html")) {
    return {
      node: <FaHtml5 size={28} className="text-[#ea580c]" />,
      bg: "#fff7ed",
      border: "#ffedd5",
    };
  }
  if (t.includes("css")) {
    return {
      node: <FaCss3Alt size={28} className="text-[#2563eb]" />,
      bg: "#eff6ff",
      border: "#dbeafe",
    };
  }
  if (t.includes("docker")) {
    return {
      node: <FaDocker size={28} className="text-[#0284c7]" />,
      bg: "#f0f9ff",
      border: "#e0f2fe",
    };
  }
  if (t.includes("kubernetes")) {
    return {
      node: <SiKubernetes size={26} className="text-[#2563eb]" />,
      bg: "#eff6ff",
      border: "#dbeafe",
    };
  }
  if (t.includes("aws")) {
    return {
      node: <FaAws size={28} className="text-[#d97706]" />,
      bg: "#fffbeb",
      border: "#fef3c7",
    };
  }
  if (t.includes("mongo")) {
    return {
      node: <SiMongodb size={26} className="text-[#059669]" />,
      bg: "#ecfdf5",
      border: "#d1fae5",
    };
  }
  if (t.includes("postgre")) {
    return {
      node: <SiPostgresql size={26} className="text-[#0284c7]" />,
      bg: "#f0f9ff",
      border: "#e0f2fe",
    };
  }
  if (t.includes("mysql")) {
    return {
      node: <SiMysql size={26} className="text-[#0284c7]" />,
      bg: "#f0f9ff",
      border: "#e0f2fe",
    };
  }
  if (t.includes("sql") || t.includes("dbms") || t.includes("database")) {
    return {
      node: <FaDatabase size={24} className="text-[#6366f1]" />,
      bg: "#eef2ff",
      border: "#e0e7ff",
    };
  }
  if (t.includes("git")) {
    return {
      node: <FaGitAlt size={28} className="text-[#e11d48]" />,
      bg: "#fff1f2",
      border: "#ffe4e6",
    };
  }
  if (t.includes("linux")) {
    return {
      node: <SiLinux size={26} className="text-[#d97706]" />,
      bg: "#fffbeb",
      border: "#fef3c7",
    };
  }
  if (t.includes("go") || t.includes("golang")) {
    return {
      node: <FaGolang size={28} className="text-[#00add8]" />,
      bg: "#ecfeff",
      border: "#cffafe",
    };
  }
  if (t.includes("rust")) {
    return {
      node: <FaRust size={28} className="text-[#ea580c]" />,
      bg: "#fff7ed",
      border: "#ffedd5",
    };
  }
  if (t.includes("php")) {
    return {
      node: <FaPhp size={28} className="text-[#6366f1]" />,
      bg: "#eef2ff",
      border: "#e0e7ff",
    };
  }
  if (t.includes("spring")) {
    return {
      node: <SiSpringboot size={26} className="text-[#059669]" />,
      bg: "#ecfdf5",
      border: "#d1fae5",
    };
  }

  // Fallback: First capital letter of topic
  const letter = (topic || "E").trim().charAt(0).toUpperCase();
  return {
    node: <span style={{ fontSize: "22px", fontWeight: "900", color: "#e11d48" }}>{letter}</span>,
    bg: "#fff1f2",
    border: "#ffe4e6",
  };
}

/**
 * Robust check if user answer matches correct answer
 */
function checkIsCorrect(qa) {
  if (!qa) return false;
  const user = (qa.userAnswer ?? "").toString().trim().toLowerCase();
  const corr = (qa.correctAnswer ?? "").toString().trim().toLowerCase();
  if (user && user === corr) return true;

  // If correctAnswer is "Option A" or "A"
  const corrMatch = corr.match(/^(?:option\s+)?([a-d])$/i);
  if (corrMatch && Array.isArray(qa.options)) {
    const idx = corrMatch[1].toLowerCase().charCodeAt(0) - 97;
    if (idx >= 0 && idx < qa.options.length) {
      if (user === (qa.options[idx] || "").toString().trim().toLowerCase()) {
        return true;
      }
    }
  }

  // If userAnswer is "Option A" or "A"
  const userMatch = user.match(/^(?:option\s+)?([a-d])$/i);
  if (userMatch && Array.isArray(qa.options)) {
    const idx = userMatch[1].toLowerCase().charCodeAt(0) - 97;
    if (idx >= 0 && idx < qa.options.length) {
      if (corr === (qa.options[idx] || "").toString().trim().toLowerCase()) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if a specific option string is the correct answer
 */
function isOptionCorrect(opt, qa, idx) {
  const optStr = (opt ?? "").toString().trim().toLowerCase();
  const corr = (qa.correctAnswer ?? "").toString().trim().toLowerCase();
  if (optStr === corr) return true;

  const letterMatch = corr.match(/^(?:option\s+)?([a-d])$/i);
  if (letterMatch) {
    const targetIdx = letterMatch[1].toLowerCase().charCodeAt(0) - 97;
    if (targetIdx === idx) return true;
  }
  return false;
}

/**
 * Check if a specific option string was selected by user
 */
function isOptionSelected(opt, qa, idx) {
  const optStr = (opt ?? "").toString().trim().toLowerCase();
  const user = (qa.userAnswer ?? "").toString().trim().toLowerCase();
  if (!user) return false;
  if (optStr === user) return true;

  const letterMatch = user.match(/^(?:option\s+)?([a-d])$/i);
  if (letterMatch) {
    const targetIdx = letterMatch[1].toLowerCase().charCodeAt(0) - 97;
    if (targetIdx === idx) return true;
  }
  return false;
}

export default function ObjectiveExamResult({
  topic = "Java",
  results,
  warnings = 0,
  pointsEarned = 0,
}) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // 'all' | 'correct' | 'incorrect'

  const score = results?.score ?? 0;
  const questionsAndAnswers = results?.questionsAndAnswers ?? [];
  const totalQuestions = results?.totalQuestions || questionsAndAnswers.length || 1;
  const accuracy = Math.round((score / totalQuestions) * 100);
  const incorrectCount = Math.max(0, totalQuestions - score);
  const correctCount = score;

  const formattedTopic = useMemo(() => {
    if (!topic) return "General";
    return topic.charAt(0).toUpperCase() + topic.slice(1);
  }, [topic]);

  const iconInfo = useMemo(() => getTopicIcon(topic), [topic]);

  const questionsWithMeta = useMemo(() => {
    return questionsAndAnswers.map((qa, idx) => ({
      ...qa,
      originalIndex: idx + 1,
      isCorrect: checkIsCorrect(qa),
    }));
  }, [questionsAndAnswers]);

  const filteredQuestions = useMemo(() => {
    if (filter === "correct") {
      return questionsWithMeta.filter((q) => q.isCorrect);
    }
    if (filter === "incorrect") {
      return questionsWithMeta.filter((q) => !q.isCorrect);
    }
    return questionsWithMeta;
  }, [questionsWithMeta, filter]);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `${formattedTopic} Objective Exam Result - PreepX`,
      text: `I scored ${score}/${totalQuestions} (${accuracy}%) on the ${formattedTopic} Exam on PreepX!`,
      url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          // fallback to clipboard
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      notify.success("Exam result link copied to clipboard!");
    } catch {
      notify.info("Please copy the URL from your address bar.");
    }
  };

  const handleDownloadReport = () => {
    window.print();
  };

  const handlePracticeAgain = () => {
    navigate("/objective-exam");
  };

  /* ── Feedback Modal State & Handlers ── */
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const handleOpenFeedback = () => {
    let localUser = {};
    try {
      localUser = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      localUser = {};
    }
    const prefillName = localUser.name || localUser.fullName || "";
    const prefillEmail = localUser.email || "";

    setFeedbackForm({
      name: prefillName,
      email: prefillEmail,
      subject: `Feedback on ${formattedTopic} Objective Exam`,
      message: "",
    });
    setFeedbackError("");
    setShowFeedbackModal(true);
  };

  const handleSendFeedback = async (e) => {
    if (e) e.preventDefault();
    setFeedbackError("");

    if (!feedbackForm.name.trim()) {
      setFeedbackError("Please enter your name.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!feedbackForm.email.trim() || !emailRegex.test(feedbackForm.email.trim())) {
      setFeedbackError("Please enter a valid email address.");
      return;
    }
    if (!feedbackForm.message.trim()) {
      setFeedbackError("Please enter your feedback message.");
      return;
    }

    setSubmittingFeedback(true);
    try {
      const res = await API.post("/feedback", {
        name: feedbackForm.name.trim(),
        email: feedbackForm.email.trim(),
        subject: feedbackForm.subject.trim() || `Feedback on ${formattedTopic} Objective Exam`,
        message: feedbackForm.message.trim(),
        examTopic: formattedTopic,
        score: `${score}/${totalQuestions}`,
        accuracy: `${accuracy}%`,
        examId: results?._id || "",
      });

      if (res.data?.success) {
        notify.success("Thank you! Your feedback has been sent to our team.");
        setShowFeedbackModal(false);
        setFeedbackForm({ name: "", email: "", subject: "", message: "" });
      } else {
        const errorMsg = res.data?.message || "Failed to send feedback.";
        setFeedbackError(errorMsg);
        notify.error(errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to send feedback. Please try again.";
      setFeedbackError(errorMsg);
      notify.error(errorMsg);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="oer-page-wrap">
      <div className="oer-container">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="oer-breadcrumb print:hidden">
          <Link to="/objective-exam">
            <Home size={14} />
          </Link>
          <ChevronRight size={12} className="oer-breadcrumb-sep" />
          <Link to="/objective-exam">
            Objective Exam
          </Link>
          <ChevronRight size={12} className="oer-breadcrumb-sep" />
          <span className="oer-breadcrumb-current">Result</span>
        </nav>

        {/* Header Row: Title & Action Buttons */}
        <div className="oer-header-row">
          <div className="oer-header-left">
            <div className="oer-header-icon">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="oer-header-title">Objective Exam Result</h1>
              <p className="oer-header-sub">Review your score and answers.</p>
            </div>
          </div>

          <div className="oer-header-actions print:hidden">
            <button
              type="button"
              onClick={handleShare}
              className="oer-btn-secondary"
            >
              <Share2 size={16} className="text-blue-600" />
              <span>Share Result</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadReport}
              className="oer-btn-secondary"
            >
              <Download size={16} className="text-blue-600" />
              <span>Download Report</span>
            </button>

            <button
              type="button"
              onClick={handleOpenFeedback}
              className="oer-btn-secondary"
            >
              <MessageSquare size={16} className="text-blue-600" />
              <span>Feedback</span>
            </button>

            <button
              type="button"
              onClick={handlePracticeAgain}
              className="oer-btn-primary"
            >
              <RotateCcw size={16} />
              <span>Practice Again</span>
            </button>
          </div>
        </div>

        {/* XP / Points alert if earned */}
        {pointsEarned > 0 && (
          <div className="oer-xp-alert print:hidden">
            <span style={{ fontSize: "18px" }}>🏆</span>
            <span>
              Congratulations! You earned <strong>+{pointsEarned} XP</strong> from this exam session!
            </span>
          </div>
        )}

        {/* Performance Banner Card — Exact 1:1 match to media_1793188042051_a5ba2ad7.png */}
        <div className="oer-banner-card">
          
          {/* Section 1: Subject / Language */}
          <div className="oer-topic-section">
            <div
              className="oer-topic-icon-circle"
              style={{ backgroundColor: iconInfo.bg }}
            >
              {iconInfo.node}
            </div>
            <div>
              <h2 className="oer-topic-title">{formattedTopic}</h2>
              <p className="oer-topic-sub">Objective Exam</p>
            </div>
          </div>

          <div className="oer-divider" />

          {/* Section 2: Final Score */}
          <div className="oer-score-section">
            <div className="oer-stat-label">FINAL SCORE</div>
            <div className="oer-score-nums">
              <span className={`oer-score-big ${score === 0 ? "zero" : ""}`}>{score}</span>
              <span className="oer-score-denom">/{totalQuestions}</span>
            </div>
          </div>

          <div className="oer-divider" />

          {/* Section 3: Accuracy with Progress Bar */}
          <div className="oer-accuracy-section">
            <div className="oer-accuracy-num">{accuracy}%</div>
            <div className="oer-accuracy-sub">Accuracy</div>
            <div className="oer-progress-track">
              <div
                className="oer-progress-fill"
                style={{ width: `${Math.min(100, Math.max(0, accuracy))}%` }}
              />
            </div>
          </div>

          <div className="oer-divider" />

          {/* Section 4: Stat Items with Circular Icons and Mini Dividers */}
          <div className="oer-stats-group">
            
            {/* Correct */}
            <div className="oer-stat-item">
              <div className="oer-stat-circle correct">
                <Check size={16} strokeWidth={2.8} />
              </div>
              <div className="oer-stat-text">
                <span className="oer-stat-val correct">{correctCount}</span>
                <span className="oer-stat-name">Correct</span>
              </div>
            </div>

            {/* Incorrect */}
            <div className="oer-stat-item">
              <div className="oer-stat-circle incorrect">
                <X size={16} strokeWidth={2.8} />
              </div>
              <div className="oer-stat-text">
                <span className="oer-stat-val incorrect">{incorrectCount}</span>
                <span className="oer-stat-name">Incorrect</span>
              </div>
            </div>

            <div className="oer-mini-divider" />

            {/* Accuracy */}
            <div className="oer-stat-item">
              <div className="oer-stat-circle accuracy">
                <BarChart2 size={16} strokeWidth={2.4} />
              </div>
              <div className="oer-stat-text">
                <span className="oer-stat-val accuracy">{accuracy}%</span>
                <span className="oer-stat-name">Accuracy</span>
              </div>
            </div>

            <div className="oer-mini-divider" />

            {/* Warnings */}
            <div className="oer-stat-item">
              <div className="oer-stat-circle warnings">
                <AlertTriangle size={16} strokeWidth={2.4} />
              </div>
              <div className="oer-stat-text">
                <span className="oer-stat-val warnings">{warnings}</span>
                <span className="oer-stat-name">Warnings</span>
              </div>
            </div>

          </div>
        </div>

        {/* Answer Review Section Header Row — Outside the box, exactly matching reference design */}
        <div className="oer-review-header-row">
          <div className="oer-review-header-left">
            <div className="oer-review-icon">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="oer-review-title">Answer Review</h2>
              <p className="oer-review-sub">{totalQuestions} questions with AI explanations</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="oer-filters">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`oer-filter-btn ${filter === "all" ? "active-all" : ""}`}
            >
              All Questions ({totalQuestions})
            </button>

            <button
              type="button"
              onClick={() => setFilter("correct")}
              className={`oer-filter-btn ${filter === "correct" ? "active-correct" : ""}`}
            >
              <span className="oer-filter-dot correct">
                <Check size={10} strokeWidth={3} />
              </span>
              <span>Correct ({correctCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilter("incorrect")}
              className={`oer-filter-btn ${filter === "incorrect" ? "active-incorrect" : ""}`}
            >
              <span className="oer-filter-dot incorrect">
                <X size={10} strokeWidth={3} />
              </span>
              <span>Incorrect ({incorrectCount})</span>
            </button>
          </div>
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="oer-empty-state">
            <p style={{ fontSize: "15px", color: "#64748b", margin: 0 }}>
              No questions found for the selected filter.
            </p>
            <button
              type="button"
              onClick={() => setFilter("all")}
              style={{
                marginTop: "12px",
                background: "transparent",
                border: "none",
                color: "#2563eb",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Show all questions
            </button>
          </div>
        ) : (
          <div className="oer-questions-list">
            {filteredQuestions.map((qa) => {
              const isCorrect = qa.isCorrect;

              return (
                <article
                  key={qa.originalIndex}
                  className="oer-question-card"
                >
                  {/* Question Header */}
                  <div className="oer-question-header">
                    <div
                      className={`oer-q-number ${isCorrect ? "correct" : "incorrect"}`}
                    >
                      {qa.originalIndex}
                    </div>
                    <h3 className="oer-q-text">
                      {qa.question}
                    </h3>
                  </div>

                  {/* Options List */}
                  <div className="oer-options-list">
                    {(qa.options || []).map((opt, idx) => {
                      const optIsCorrect = isOptionCorrect(opt, qa, idx);
                      const optIsUser = isOptionSelected(opt, qa, idx);

                      let rowCls = "oer-opt-neutral";
                      if (optIsCorrect) {
                        rowCls = "oer-opt-correct";
                      } else if (optIsUser && !optIsCorrect) {
                        rowCls = "oer-opt-incorrect";
                      }

                      return (
                        <div
                          key={idx}
                          className={`oer-option-row ${rowCls}`}
                        >
                          <div className="oer-opt-left">
                            <span className="oer-letter-box">
                              {OPTION_LETTERS[idx] || idx + 1}
                            </span>
                            <span className="oer-opt-text">
                              {opt}
                            </span>
                          </div>

                          {/* Status Badge & Icon */}
                          {(optIsCorrect || (optIsUser && !optIsCorrect)) && (
                            <div className="oer-opt-badge-group">
                              {optIsCorrect && (
                                <>
                                  <div className="oer-status-circle correct">
                                    <Check size={13} strokeWidth={3} />
                                  </div>
                                  <span className="oer-status-badge correct">
                                    Correct Answer
                                  </span>
                                </>
                              )}

                              {optIsUser && !optIsCorrect && (
                                <>
                                  <div className="oer-status-circle incorrect">
                                    <X size={13} strokeWidth={3} />
                                  </div>
                                  <span className="oer-status-badge incorrect">
                                    Your Answer
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Explanation Box */}
                  <div className="oer-explanation-box">
                    <Sparkles size={18} className="oer-expl-icon" />
                    <div>
                      <div className="oer-expl-title">AI EXPLANATION</div>
                      <p className="oer-expl-text">
                        {qa.explanation || "No explanation provided for this question."}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom CTA for Mobile / Quick Navigation */}
        <div className="oer-bottom-actions print:hidden">
          <button
            type="button"
            onClick={handlePracticeAgain}
            className="oer-btn-primary"
            style={{ padding: "12px 28px", fontSize: "14px" }}
          >
            <RotateCcw size={16} />
            <span>Practice Another Exam</span>
          </button>
        </div>

      </div>

      {/* Feedback Dialog / Modal */}
      {showFeedbackModal && (
        <div
          className="oer-modal-overlay print:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submittingFeedback) {
              setShowFeedbackModal(false);
            }
          }}
        >
          <div className="oer-modal-card" role="dialog" aria-modal="true" aria-labelledby="oer-feedback-dialog-title">
            {/* Modal Header */}
            <div className="oer-modal-header">
              <div className="oer-modal-header-content">
                <div className="oer-modal-header-icon">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 id="oer-feedback-dialog-title" className="oer-modal-title">Share Your Feedback</h3>
                  <p className="oer-modal-subtitle">
                    Help us improve questions, explanations, or your exam experience.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="oer-modal-close"
                onClick={() => !submittingFeedback && setShowFeedbackModal(false)}
                disabled={submittingFeedback}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSendFeedback}>
              <div className="oer-modal-body">
                {/* Exam Context Pill */}
                <div className="oer-modal-meta-pill">
                  <span>Topic: <strong>{formattedTopic}</strong></span>
                  <span>Score: <strong>{score}/{totalQuestions} ({accuracy}%)</strong></span>
                </div>

                {feedbackError && (
                  <div className="oer-modal-error-alert">
                    <AlertTriangle size={16} />
                    <span>{feedbackError}</span>
                  </div>
                )}

                {/* Candidate Name */}
                <div className="oer-modal-form-group">
                  <label className="oer-modal-label">
                    Candidate Name <span className="oer-modal-label-req">*</span>
                  </label>
                  <input
                    type="text"
                    className="oer-modal-input"
                    value={feedbackForm.name}
                    onChange={(e) =>
                      setFeedbackForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter your full name"
                    required
                    disabled={submittingFeedback}
                  />
                </div>

                {/* Candidate Email */}
                <div className="oer-modal-form-group">
                  <label className="oer-modal-label">
                    Candidate Email <span className="oer-modal-label-req">*</span>
                  </label>
                  <input
                    type="email"
                    className="oer-modal-input"
                    value={feedbackForm.email}
                    onChange={(e) =>
                      setFeedbackForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Enter your email address"
                    required
                    disabled={submittingFeedback}
                  />
                </div>

                {/* Subject */}
                <div className="oer-modal-form-group">
                  <label className="oer-modal-label">
                    Subject <span className="oer-modal-label-req">*</span>
                  </label>
                  <input
                    type="text"
                    className="oer-modal-input"
                    value={feedbackForm.subject}
                    onChange={(e) =>
                      setFeedbackForm((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    placeholder="e.g., Feedback on questions or explanation"
                    required
                    disabled={submittingFeedback}
                  />
                </div>

                {/* Feedback Message */}
                <div className="oer-modal-form-group">
                  <label className="oer-modal-label">
                    Your Feedback <span className="oer-modal-label-req">*</span>
                  </label>
                  <textarea
                    rows={4}
                    className="oer-modal-textarea"
                    value={feedbackForm.message}
                    onChange={(e) =>
                      setFeedbackForm((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="What did you like? Were there any incorrect questions or suggestions? Write your feedback here..."
                    required
                    disabled={submittingFeedback}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="oer-modal-footer">
                <button
                  type="button"
                  className="oer-modal-btn-cancel"
                  onClick={() => setShowFeedbackModal(false)}
                  disabled={submittingFeedback}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="oer-modal-btn-submit"
                  disabled={submittingFeedback}
                >
                  {submittingFeedback ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Send Feedback</span>
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
