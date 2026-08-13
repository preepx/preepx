import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardCheck, PlayCircle, CheckCircle2, Clock, Building2,
  AlertCircle, Sparkles, Trophy, Timer, Star
} from "lucide-react";
import { getMyAssessments } from "../../services/assessmentAPI";
import Loader from "../../components/Loader";
import "./JobsAssessments.css";

const STATUS_CONFIG = {
  pending:     { label: "Pending",      color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  icon: Clock },
  in_progress: { label: "In Progress",  color: "#6366f1", bg: "rgba(99,102,241,0.1)",  icon: Timer },
  mcq_done:    { label: "Coding Round", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  icon: Sparkles },
  completed:   { label: "Completed",    color: "#10b981", bg: "rgba(16,185,129,0.1)",   icon: CheckCircle2 },
};

export default function JobsAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getMyAssessments()
      .then((d) => setAssessments(d || []))
      .finally(() => setLoading(false));
  }, []);

  const pending = assessments.filter((a) => a.status !== "completed");
  const completed = assessments.filter((a) => a.status === "completed");
  const displayed = filter === "pending" ? pending : filter === "completed" ? completed : assessments;

  if (loading) return <Loader />;

  return (
    <div className="jas-page">
      {/* Hero Banner */}
      <div className="jas-hero">
        <div className="jas-hero-inner">
          <div className="jas-hero-icon">
            <ClipboardCheck size={28} />
          </div>
          <div>
            <h1>Job Assessments</h1>
            <p>Skill tests sent by recruiters — complete them to move forward in the hiring process</p>
          </div>
        </div>
        <div className="jas-hero-stats">
          <div className="jas-hstat">
            <span className="jas-hstat-val">{assessments.length}</span>
            <span className="jas-hstat-lbl">Total</span>
          </div>
          <div className="jas-hstat-div" />
          <div className="jas-hstat">
            <span className="jas-hstat-val" style={{ color: "#f59e0b" }}>{pending.length}</span>
            <span className="jas-hstat-lbl">Pending</span>
          </div>
          <div className="jas-hstat-div" />
          <div className="jas-hstat">
            <span className="jas-hstat-val" style={{ color: "#10b981" }}>{completed.length}</span>
            <span className="jas-hstat-lbl">Completed</span>
          </div>
        </div>
      </div>

      {/* Pending Alert */}
      {pending.length > 0 && (
        <div className="jas-alert">
          <AlertCircle size={18} />
          <span>
            You have <strong>{pending.length}</strong> pending assessment{pending.length > 1 ? "s" : ""}.
            Complete them quickly to improve your chances!
          </span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="jas-tabs">
        {[
          { key: "all", label: `All (${assessments.length})` },
          { key: "pending", label: `Pending (${pending.length})` },
          { key: "completed", label: `Completed (${completed.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`jas-tab ${filter === key ? "jas-tab--active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {displayed.length === 0 ? (
        <div className="jas-empty">
          <ClipboardCheck size={52} />
          <h3>No assessments {filter !== "all" ? `(${filter})` : ""}</h3>
          <p>
            {assessments.length === 0
              ? "Complete your profile and apply to jobs. Recruiters will send you skill assessments when they shortlist you."
              : "No assessments in this category."}
          </p>
          {assessments.length === 0 && (
            <Link to="/apply-jobs/browse" className="jas-browse-btn">
              Browse Jobs
            </Link>
          )}
        </div>
      ) : (
        <div className="jas-list">
          {displayed.map((a) => {
            const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            const canStart = a.status !== "completed";
            return (
              <div key={a._id} className="jas-card">
                <div className="jas-card-left">
                  <div className="jas-card-icon">
                    <ClipboardCheck size={24} />
                  </div>
                </div>

                <div className="jas-card-body">
                  <div className="jas-card-top">
                    <div>
                      <h3 className="jas-job-title">{a.jobTitle || "Job Assessment"}</h3>
                      <div className="jas-job-meta">
                        <Building2 size={13} />
                        <span>{a.jobRole || "Role"}</span>
                        {a.companyName && (
                          <>
                            <span className="jas-dot">·</span>
                            <span>{a.companyName}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="jas-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                      <StatusIcon size={14} />
                      {cfg.label}
                    </div>
                  </div>

                  {/* Progress bar for in-progress */}
                  {a.status === "in_progress" && (
                    <div className="jas-progress-wrap">
                      <div className="jas-progress-bar">
                        <div className="jas-progress-fill" style={{ width: "40%" }} />
                      </div>
                      <span className="jas-progress-label">MCQ in progress</span>
                    </div>
                  )}
                  {a.status === "mcq_done" && (
                    <div className="jas-progress-wrap">
                      <div className="jas-progress-bar">
                        <div className="jas-progress-fill" style={{ width: "70%" }} />
                      </div>
                      <span className="jas-progress-label">Coding round remaining</span>
                    </div>
                  )}

                  {/* Completed Score */}
                  {a.status === "completed" && (
                    <div className="jas-scores">
                      <div className="jas-score-item">
                        <Trophy size={14} />
                        <span>Overall: <strong>{a.overallScore ?? "--"}%</strong></span>
                      </div>
                      <div className="jas-score-item">
                        <Star size={14} />
                        <span>MCQ: <strong>{a.mcqScore ?? "--"}%</strong></span>
                      </div>
                      <div className="jas-score-item">
                        <Sparkles size={14} />
                        <span>Coding: <strong>{a.codingScore ?? "--"}%</strong></span>
                      </div>
                    </div>
                  )}

                  <div className="jas-card-actions">
                    {canStart ? (
                      <Link to={`/assessment/${a._id}`} className="jas-start-btn">
                        <PlayCircle size={16} />
                        {a.status === "pending" ? "Start Assessment" : "Continue"}
                      </Link>
                    ) : (
                      <div className="jas-done-label">
                        <CheckCircle2 size={16} />
                        Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
