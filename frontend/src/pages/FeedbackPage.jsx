import React, { useState, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Home,
  ChevronRight,
  Share2,
  Download,
  RotateCcw,
  Check,
  X,
  BarChart2,
  Sparkles,
  ArrowLeft,
  Briefcase,
  User,
  MessageSquare,
  Trophy,
  Award,
  Clock,
} from "lucide-react";
import {
  FaJava,
  FaPython,
  FaJs,
  FaReact,
  FaNodeJs,
  FaDatabase,
  FaDocker,
  FaAws,
  FaLaptopCode,
  FaCode,
  FaMobileScreen,
} from "react-icons/fa6";
import {
  SiTypescript,
  SiMongodb,
  SiPostgresql,
  SiCplusplus,
} from "react-icons/si";
import notify from "@/utils/notify";
import "@/styles/FeedbackPage.css";

/**
 * Returns matching icon for interview job title or tech stack.
 * Defaults to Briefcase or tech icon with fallback.
 */
function getInterviewIcon(title, topic) {
  const combined = `${title || ""} ${topic || ""}`.toLowerCase();

  if (combined.includes("react")) {
    return {
      node: <FaReact size={26} className="text-[#0891b2]" />,
      bg: "#ecfeff",
      border: "#cffafe",
    };
  }
  if (combined.includes("java") && !combined.includes("javascript")) {
    return {
      node: <FaJava size={26} className="text-[#dc2626]" />,
      bg: "#fff1f2",
      border: "#ffe4e6",
    };
  }
  if (combined.includes("python")) {
    return {
      node: <FaPython size={26} className="text-[#2563eb]" />,
      bg: "#eff6ff",
      border: "#dbeafe",
    };
  }
  if (combined.includes("javascript") || combined.includes(" js ")) {
    return {
      node: <FaJs size={26} className="text-[#ca8a04]" />,
      bg: "#fefce8",
      border: "#fef08a",
    };
  }
  if (combined.includes("typescript") || combined.includes(" ts ")) {
    return {
      node: <SiTypescript size={24} className="text-[#2563eb]" />,
      bg: "#eff6ff",
      border: "#dbeafe",
    };
  }
  if (combined.includes("node")) {
    return {
      node: <FaNodeJs size={26} className="text-[#16a34a]" />,
      bg: "#f0fdf4",
      border: "#dcfce7",
    };
  }
  if (combined.includes("full stack") || combined.includes("fullstack")) {
    return {
      node: <FaLaptopCode size={24} className="text-[#4f46e5]" />,
      bg: "#eef2ff",
      border: "#e0e7ff",
    };
  }
  if (combined.includes("frontend") || combined.includes("front-end")) {
    return {
      node: <FaCode size={24} className="text-[#0284c7]" />,
      bg: "#f0f9ff",
      border: "#e0f2fe",
    };
  }
  if (combined.includes("backend") || combined.includes("database") || combined.includes("sql")) {
    return {
      node: <FaDatabase size={24} className="text-[#059669]" />,
      bg: "#ecfdf5",
      border: "#d1fae5",
    };
  }
  if (combined.includes("mongo")) {
    return {
      node: <SiMongodb size={24} className="text-[#059669]" />,
      bg: "#ecfdf5",
      border: "#d1fae5",
    };
  }
  if (combined.includes("postgre")) {
    return {
      node: <SiPostgresql size={24} className="text-[#0284c7]" />,
      bg: "#f0f9ff",
      border: "#e0f2fe",
    };
  }
  if (combined.includes("c++") || combined.includes("cpp")) {
    return {
      node: <SiCplusplus size={24} className="text-[#0284c7]" />,
      bg: "#f0f9ff",
      border: "#e0f2fe",
    };
  }
  if (combined.includes("docker")) {
    return {
      node: <FaDocker size={24} className="text-[#0284c7]" />,
      bg: "#f0f9ff",
      border: "#e0f2fe",
    };
  }
  if (combined.includes("aws") || combined.includes("cloud")) {
    return {
      node: <FaAws size={24} className="text-[#d97706]" />,
      bg: "#fffbeb",
      border: "#fef3c7",
    };
  }
  if (combined.includes("mobile") || combined.includes("android") || combined.includes("ios") || combined.includes("flutter")) {
    return {
      node: <FaMobileScreen size={24} className="text-[#7c3aed]" />,
      bg: "#f3e8ff",
      border: "#ede9fe",
    };
  }

  // Default fallback icon
  return {
    node: <Briefcase size={24} className="text-[#2563eb]" />,
    bg: "#eff6ff",
    border: "#dbeafe",
  };
}

export default function FeedbackPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // 'all' | 'passed' | 'needs_work'

  // Cache state in sessionStorage so refreshing the feedback page doesn't wipe results
  const interviewData = useMemo(() => {
    if (state && (state.answers?.length || state.interview?.answers?.length)) {
      try {
        sessionStorage.setItem("preepx_last_interview_feedback", JSON.stringify(state));
      } catch (e) {
        // ignore
      }
      return state;
    }
    try {
      const stored = sessionStorage.getItem("preepx_last_interview_feedback");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return state || {};
  }, [state]);

  const {
    answers = [],
    jobTitle = "Interview",
    jobTopic = "",
    totalScore,
    maxScore,
    correctCount,
    pointsEarned = 0,
    newBadges = [],
    duration = 0,
    interview,
  } = interviewData;

  const results = interview?.answers || answers;
  const total = results.length;
  const correct = correctCount ?? results.filter((a) => a.correct).length;
  const incorrect = Math.max(0, total - correct);
  const score = totalScore ?? results.reduce((s, a) => s + (a.score || 0), 0);
  const max = (maxScore ?? total * 10) || 1;
  const percentage = max > 0 ? Math.round((score / max) * 100) : 0;

  const getGrade = () => {
    if (percentage >= 80) return { label: "Excellent", color: "#10b981" };
    if (percentage >= 60) return { label: "Good", color: "#3b82f6" };
    if (percentage >= 40) return { label: "Fair", color: "#f59e0b" };
    return { label: "Needs Practice", color: "#ef4444" };
  };

  const grade = getGrade();
  const iconInfo = useMemo(() => getInterviewIcon(jobTitle, jobTopic), [jobTitle, jobTopic]);

  // Questions with original order index & normalized status
  const questionsWithMeta = useMemo(() => {
    return results.map((item, idx) => ({
      ...item,
      originalIndex: idx + 1,
      isPassed: Boolean(item.correct || (item.score != null && item.score >= 6)),
    }));
  }, [results]);

  // Filtered list
  const filteredQuestions = useMemo(() => {
    if (filter === "passed") {
      return questionsWithMeta.filter((q) => q.isPassed);
    }
    if (filter === "needs_work") {
      return questionsWithMeta.filter((q) => !q.isPassed);
    }
    return questionsWithMeta;
  }, [questionsWithMeta, filter]);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `${jobTitle} Interview Result - PreepX`,
      text: `I scored ${score}/${max} (${percentage}%) on my ${jobTitle} Interview on PreepX!`,
      url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          // fallback
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      notify.success("Interview result link copied to clipboard!");
    } catch {
      notify.info("Please copy the URL from your address bar.");
    }
  };

  const handleDownloadReport = () => {
    window.print();
  };

  const handlePracticeAgain = () => {
    navigate("/interview");
  };

  if (!results.length) {
    return (
      <div className="ifp-page-wrap">
        <div className="ifp-container">
          <div className="ifp-empty-state">
            <div className="ifp-empty-icon">
              <MessageSquare size={36} />
            </div>
            <h2 className="ifp-empty-title">No interview results to show</h2>
            <p className="ifp-empty-desc">
              Complete an interview session to see your detailed performance breakdown and AI evaluation.
            </p>
            <button
              type="button"
              onClick={() => navigate("/interview")}
              className="ifp-btn-primary"
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ifp-page-wrap">
      <div className="ifp-container">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="ifp-breadcrumb print:hidden">
          <Link to="/interview">
            <Home size={14} />
          </Link>
          <ChevronRight size={12} className="ifp-breadcrumb-sep" />
          <Link to="/interview">
            Mock Interview
          </Link>
          <ChevronRight size={12} className="ifp-breadcrumb-sep" />
          <span className="ifp-breadcrumb-current">Result</span>
        </nav>

        {/* Header Row: Title & Action Buttons */}
        <div className="ifp-header-row">
          <div className="ifp-header-left">
            <div className="ifp-header-icon">
              <Briefcase size={22} />
            </div>
            <div>
              <h1 className="ifp-header-title">Interview Results</h1>
              <p className="ifp-header-sub">
                {jobTitle} {jobTopic ? `· ${jobTopic}` : "· Technical Interview"}
              </p>
            </div>
          </div>

          <div className="ifp-header-actions print:hidden">
            <button
              type="button"
              onClick={handleShare}
              className="ifp-btn-secondary"
            >
              <Share2 size={16} className="text-blue-600" />
              <span>Share Result</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadReport}
              className="ifp-btn-secondary"
            >
              <Download size={16} className="text-blue-600" />
              <span>Download Report</span>
            </button>

            <button
              type="button"
              onClick={handlePracticeAgain}
              className="ifp-btn-primary"
            >
              <RotateCcw size={16} />
              <span>Practice Again</span>
            </button>
          </div>
        </div>

        {/* XP / Points alert if earned */}
        {pointsEarned > 0 && (
          <div className="ifp-xp-alert print:hidden">
            <span style={{ fontSize: "18px" }}>🏆</span>
            <span>
              Congratulations! You earned <strong>+{pointsEarned} XP</strong> from this interview session!
            </span>
          </div>
        )}

        {/* New Badges Banner if unlocked */}
        {newBadges?.length > 0 && (
          <div className="ifp-badges-alert print:hidden">
            <div className="ifp-badges-header">
              <Award size={18} className="text-amber-500" />
              <span className="ifp-badges-title">New Badges Unlocked!</span>
            </div>
            <div className="ifp-badges-list">
              {newBadges.map((b) => (
                <span key={b} className="ifp-badge-pill">
                  {b.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Performance Score Banner Card — 1:1 Match to the modern reference mockup */}
        <div className="ifp-banner-card">
          
          {/* Section 1: Role / Topic */}
          <div className="ifp-topic-section">
            <div
              className="ifp-topic-icon-circle"
              style={{ backgroundColor: iconInfo.bg }}
            >
              {iconInfo.node}
            </div>
            <div className="ifp-topic-info">
              <h2 className="ifp-topic-title" title={jobTitle}>
                {jobTitle}
              </h2>
              <p className="ifp-topic-sub">
                {jobTopic || "Mock Interview"}
              </p>
            </div>
          </div>

          <div className="ifp-divider" />

          {/* Section 2: Final Score */}
          <div className="ifp-score-section">
            <div className="ifp-stat-label">FINAL SCORE</div>
            <div className="ifp-score-nums">
              <span className={`ifp-score-big ${score === 0 ? "zero" : ""}`}>
                {score}
              </span>
              <span className="ifp-score-denom">/{max}</span>
            </div>
          </div>

          <div className="ifp-divider" />

          {/* Section 3: Accuracy / Performance with Progress Bar */}
          <div className="ifp-accuracy-section">
            <div className="ifp-accuracy-num">{percentage}%</div>
            <div className="ifp-accuracy-sub">{grade.label}</div>
            <div className="ifp-progress-track">
              <div
                className="ifp-progress-fill"
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
              />
            </div>
          </div>

          <div className="ifp-divider" />

          {/* Section 4: Stat Items with Circular Icons and Mini Dividers */}
          <div className="ifp-stats-group">
            
            {/* Correct / Passed */}
            <div className="ifp-stat-item">
              <div className="ifp-stat-circle correct">
                <Check size={16} strokeWidth={2.8} />
              </div>
              <div className="ifp-stat-text">
                <span className="ifp-stat-val correct">{correct}</span>
                <span className="ifp-stat-name">Passed</span>
              </div>
            </div>

            {/* Incorrect / Needs Practice */}
            <div className="ifp-stat-item">
              <div className="ifp-stat-circle incorrect">
                <X size={16} strokeWidth={2.8} />
              </div>
              <div className="ifp-stat-text">
                <span className="ifp-stat-val incorrect">{incorrect}</span>
                <span className="ifp-stat-name">Needs Work</span>
              </div>
            </div>

            <div className="ifp-mini-divider" />

            {/* Overall Accuracy */}
            <div className="ifp-stat-item">
              <div className="ifp-stat-circle accuracy">
                <BarChart2 size={16} strokeWidth={2.4} />
              </div>
              <div className="ifp-stat-text">
                <span className="ifp-stat-val accuracy">{percentage}%</span>
                <span className="ifp-stat-name">Accuracy</span>
              </div>
            </div>

            <div className="ifp-mini-divider" />

            {/* Questions / XP */}
            <div className="ifp-stat-item">
              <div className="ifp-stat-circle warnings">
                {duration > 0 ? (
                  <Clock size={16} strokeWidth={2.4} />
                ) : (
                  <Trophy size={16} strokeWidth={2.4} />
                )}
              </div>
              <div className="ifp-stat-text">
                <span className="ifp-stat-val warnings">
                  {duration > 0
                    ? `${Math.floor(duration / 60)}m`
                    : total}
                </span>
                <span className="ifp-stat-name">
                  {duration > 0 ? "Duration" : "Questions"}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Question Breakdown Header Row — Outside the box sitting directly on background */}
        <div className="ifp-review-header-row">
          <div className="ifp-review-header-left">
            <div className="ifp-review-icon">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="ifp-review-title">Question Breakdown</h2>
              <p className="ifp-review-sub">{total} questions with AI evaluation & feedback</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="ifp-filters">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`ifp-filter-btn ${filter === "all" ? "active-all" : ""}`}
            >
              All Questions ({total})
            </button>

            <button
              type="button"
              onClick={() => setFilter("passed")}
              className={`ifp-filter-btn ${filter === "passed" ? "active-correct" : ""}`}
            >
              <span className="ifp-filter-dot correct">
                <Check size={10} strokeWidth={3} />
              </span>
              <span>Passed ({correct})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilter("needs_work")}
              className={`ifp-filter-btn ${filter === "needs_work" ? "active-incorrect" : ""}`}
            >
              <span className="ifp-filter-dot incorrect">
                <X size={10} strokeWidth={3} />
              </span>
              <span>Needs Work ({incorrect})</span>
            </button>
          </div>
        </div>

        {/* Question Cards List */}
        {filteredQuestions.length === 0 ? (
          <div className="ifp-empty-state">
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
          <div className="ifp-questions-list">
            {filteredQuestions.map((qa) => {
              const isPassed = qa.isPassed;
              const hasScore = qa.score != null;

              return (
                <article
                  key={qa.originalIndex}
                  className="ifp-question-card"
                >
                  {/* Question Header */}
                  <div className="ifp-question-header">
                    <div className="ifp-qh-left">
                      <div
                        className={`ifp-q-number ${isPassed ? "correct" : "incorrect"}`}
                      >
                        Q{qa.originalIndex}
                      </div>
                      <h3 className="ifp-q-text">
                        {qa.question}
                      </h3>
                    </div>

                    <div className="ifp-qh-right">
                      {hasScore ? (
                        <div className={`ifp-score-pill ${isPassed ? "pass" : "fail"}`}>
                          <span>{qa.score}/10</span>
                        </div>
                      ) : (
                        <div className={`ifp-status-pill ${isPassed ? "pass" : "fail"}`}>
                          {isPassed ? "Passed" : "Needs Work"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Answer Container */}
                  <div className="ifp-user-answer-box">
                    <div className="ifp-ua-label">
                      <User size={13} />
                      <span>YOUR ANSWER</span>
                    </div>
                    <div className="ifp-ua-text">
                      {qa.userAnswer || qa.answer || "No response recorded."}
                    </div>
                  </div>

                  {/* AI Feedback / Evaluation Box */}
                  {qa.feedback && (
                    <div className="ifp-feedback-box">
                      <Sparkles size={18} className="ifp-expl-icon" />
                      <div className="ifp-feedback-content">
                        <div className="ifp-expl-title">AI FEEDBACK & EVALUATION</div>
                        <p className="ifp-expl-text">
                          {qa.feedback}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Ideal Answer if provided */}
                  {qa.idealAnswer && (
                    <div className="ifp-ideal-box">
                      <div className="ifp-ideal-title">IDEAL ANSWER / KEY POINTS:</div>
                      <p className="ifp-ideal-text">{qa.idealAnswer}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom CTA for Quick Navigation */}
        <div className="ifp-bottom-actions print:hidden">
          <button
            type="button"
            onClick={() => navigate("/interview")}
            className="ifp-btn-secondary"
            style={{ padding: "12px 24px", fontSize: "14px" }}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          <button
            type="button"
            onClick={handlePracticeAgain}
            className="ifp-btn-primary"
            style={{ padding: "12px 28px", fontSize: "14px" }}
          >
            <RotateCcw size={16} />
            <span>Practice Another Interview</span>
          </button>
        </div>

      </div>
    </div>
  );
}
