import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trophy, CheckCircle, XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import '@/styles/FeedbackPage.css';

const FeedbackPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    answers = [],
    jobTitle = "Interview",
    jobTopic = "",
    totalScore,
    maxScore,
    correctCount,
    pointsEarned,
    newBadges,
    duration,
    interview,
  } = state || {};

  const results = interview?.answers || answers;
  const correct = correctCount ?? results.filter((a) => a.correct).length;
  const total = results.length;
  const score = totalScore ?? results.reduce((s, a) => s + (a.score || 0), 0);
  const max = maxScore ?? total * 10;
  const percentage = max > 0 ? Math.round((score / max) * 100) : 0;

  const getGrade = () => {
    if (percentage >= 80) return { label: "Excellent", color: "#10b981" };
    if (percentage >= 60) return { label: "Good", color: "#3b82f6" };
    if (percentage >= 40) return { label: "Fair", color: "#f59e0b" };
    return { label: "Needs Practice", color: "#ef4444" };
  };

  const grade = getGrade();

  if (!results.length) {
    return (
      <div className="feedback-page">
        <div className="feedback-empty">
          <h2>No results to show</h2>
          <button onClick={() => navigate("/interview")}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <div className="feedback-header">
        <button className="back-link" onClick={() => navigate("/interview")}>
          <ArrowLeft size={18} /> Dashboard
        </button>
        <h1>Interview Results</h1>
        <p>{jobTitle} · {jobTopic}</p>
      </div>

      <div className="score-overview">
        <div className="score-ring" style={{ "--pct": percentage, "--color": grade.color }}>
          <div className="score-ring-inner">
            <span className="score-pct">{percentage}%</span>
            <span className="score-grade">{grade.label}</span>
          </div>
        </div>

        <div className="score-stats">
          <div className="score-stat">
            <Trophy size={20} />
            <div>
              <span className="stat-val">{score}/{max}</span>
              <span className="stat-lbl">Total Score</span>
            </div>
          </div>
          <div className="score-stat">
            <CheckCircle size={20} />
            <div>
              <span className="stat-val">{correct}/{total}</span>
              <span className="stat-lbl">Correct Answers</span>
            </div>
          </div>
          {pointsEarned > 0 && (
            <div className="score-stat">
              <Trophy size={20} />
              <div>
                <span className="stat-val">+{pointsEarned}</span>
                <span className="stat-lbl">Points Earned</span>
              </div>
            </div>
          )}
          {duration > 0 && (
            <div className="score-stat">
              <Trophy size={20} />
              <div>
                <span className="stat-val">{Math.floor(duration / 60)}m {duration % 60}s</span>
                <span className="stat-lbl">Duration</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {newBadges?.length > 0 && (
        <div className="new-badges-banner">
          <h3>🎉 New Badges Unlocked!</h3>
          <div className="new-badges-list">
            {newBadges.map((b) => (
              <span key={b} className="new-badge-chip">{b.replace(/_/g, " ")}</span>
            ))}
          </div>
        </div>
      )}

      <div className="answers-review">
        <h2>Question Breakdown</h2>
        {results.map((a, i) => (
          <div key={i} className={`review-card ${a.correct ? "correct" : "incorrect"}`}>
            <div className="review-header">
              <span className="q-num">Q{i + 1}</span>
              {a.correct ? (
                <CheckCircle size={18} className="icon-correct" />
              ) : (
                <XCircle size={18} className="icon-incorrect" />
              )}
              {a.score != null && <span className="q-score">{a.score}/10</span>}
            </div>
            <p className="q-text">{a.question}</p>
            <div className="a-text">
              <strong>Your answer:</strong> {a.userAnswer || a.answer || "—"}
            </div>
            {a.feedback && (
              <div className="q-feedback">
                <strong>AI Feedback:</strong> {a.feedback}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="feedback-actions">
        <button className="btn-secondary" onClick={() => navigate("/interview")}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <button className="btn-primary" onClick={() => navigate("/interview")}>
          <RotateCcw size={18} /> Practice Again
        </button>
      </div>
    </div>
  );
};

export default FeedbackPage;
