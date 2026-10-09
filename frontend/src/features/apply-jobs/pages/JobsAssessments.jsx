import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardCheck, Clock, CheckCircle2,
  Search, ChevronDown, Filter, SlidersHorizontal,
  MoreVertical, Building2, Trophy, Star, Sparkles, PlayCircle, BarChart2
} from "lucide-react";
import { getMyAssessments } from "@/services/assessmentAPI";
import Loader from "@/components/Loader";
import EmptyState from "@/components/recruiter/EmptyState";
import '../styles/JobsAssessments.css';

// Mock function to return an icon component and color based on title (or fallback)
const getTechIcon = (title) => {
  const t = title.toLowerCase();
  if (t.includes('java ') || t === 'java') return { text: '☕', bg: '#fce7f3', color: '#db2777' };
  if (t.includes('js') || t.includes('javascript')) return { text: 'JS', bg: '#fef08a', color: '#854d0e' };
  if (t.includes('react')) return { text: '⚛️', bg: '#e0f2fe', color: '#0284c7' };
  if (t.includes('python')) return { text: '🐍', bg: '#fef3c7', color: '#d97706' };
  if (t.includes('node')) return { text: '🟩', bg: '#dcfce3', color: '#166534' };
  if (t.includes('software tester')) return { text: '📋', bg: '#f3e8ff', color: '#9333ea' };
  if (t.includes('full stack') || t.includes('developer')) return { text: '💻', bg: '#e2e8f0', color: '#475569' };
  return { text: '🚀', bg: '#ede9fe', color: '#7c3aed' };
};

export default function JobsAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMyAssessments()
      .then((d) => setAssessments(d || []))
      .finally(() => setLoading(false));
  }, []);

  const pending = assessments.filter((a) => a.status !== "completed");
  const completed = assessments.filter((a) => a.status === "completed");
  
  const filtered = assessments.filter(a => {
    if (filter === "pending" && a.status === "completed") return false;
    if (filter === "completed" && a.status !== "completed") return false;
    if (search && !a.jobTitle?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <Loader />;

  return (
    <div className="jas-root">
      {/* ── HERO BANNER ── */}
      <section className="jas-hero">
        <div className="jas-hero-left">
          <div className="jas-hero-icon">
            <ClipboardCheck size={28} />
          </div>
          <div className="jas-hero-text">
            <h1>Skill Assessments</h1>
            <p>Take recruiter-style tests, track your progress and improve your skills.</p>
          </div>
        </div>

        <div className="jas-hero-stats">
          <div className="jas-hstat-card">
            <div className="jas-hstat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <ClipboardCheck size={20} />
            </div>
            <div className="jas-hstat-info">
              <span className="jas-hstat-val">{assessments.length}</span>
              <span className="jas-hstat-lbl">Total Assessments</span>
            </div>
          </div>
          <div className="jas-hstat-card">
            <div className="jas-hstat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Clock size={20} />
            </div>
            <div className="jas-hstat-info">
              <span className="jas-hstat-val">{pending.length}</span>
              <span className="jas-hstat-lbl">Pending</span>
            </div>
          </div>
          <div className="jas-hstat-card">
            <div className="jas-hstat-icon" style={{ background: '#dcfce3', color: '#166534' }}>
              <CheckCircle2 size={20} />
            </div>
            <div className="jas-hstat-info">
              <span className="jas-hstat-val">{completed.length}</span>
              <span className="jas-hstat-lbl">Completed</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTERS BAR ── */}
      <div className="jas-filters-bar">
        <div className="jas-tabs">
          <button
            className={`jas-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({assessments.length})
          </button>
          <button
            className={`jas-tab ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending ({pending.length})
          </button>
          <button
            className={`jas-tab ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed ({completed.length})
          </button>
        </div>
        <div className="jas-filters-right">
          <div className="jas-search-box">
            <Search size={16} color="#94a3b8" />
            <input 
              placeholder="Search assessments..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="jas-filter-dropdown">
            <Filter size={16} /> All Categories <ChevronDown size={14} />
          </div>
          <div className="jas-filter-dropdown">
            <CheckCircle2 size={16} /> All Status <ChevronDown size={14} />
          </div>
          <div className="jas-filter-dropdown">
            <SlidersHorizontal size={16} /> Newest First <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {/* ── CARDS GRID ── */}
      <div className="jas-grid">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="No assessments found"
            description="You don't have any assessments matching your filters."
          />
        ) : (
          filtered.map((a) => {
            const isCompleted = a.status === "completed";
            const isInProgress = a.status === "in_progress" || a.status === "mcq_done";
            
            const techIcon = getTechIcon(a.jobTitle || "");
            
            // Status pill styling
            let pillBg = "#fef3c7";
            let pillColor = "#d97706";
            let pillLabel = "Pending";
            
            if (isCompleted) {
              pillBg = "#dcfce3";
              pillColor = "#059669";
              pillLabel = "Completed";
            } else if (isInProgress) {
              pillBg = "#e0f2fe";
              pillColor = "#0284c7";
              pillLabel = "In Progress";
            }

            return (
              <article key={a._id} className="jas-card">
                {/* TOP */}
                <div className="jas-card-top">
                  <div 
                    className="jas-card-icon-box"
                    style={{ background: techIcon.bg, color: techIcon.color }}
                  >
                    {techIcon.text}
                  </div>
                  <div className="jas-status-wrap">
                    <span className="jas-status-pill" style={{ background: pillBg, color: pillColor }}>
                      {pillLabel}
                    </span>
                    <button className="jas-menu-btn">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>

                {/* BODY */}
                <div className="jas-card-body">
                  <h3 className="jas-job-title">{a.jobTitle || "Job Assessment"}</h3>
                  <p className="jas-job-role">{a.jobRole || "Software Engineer"}</p>
                  <p className="jas-job-co">
                    <Building2 size={14} /> {a.companyName || "Preepx"}
                  </p>
                </div>

                {/* DYNAMIC MIDDLE CONTENT */}
                {isCompleted ? (
                  <div className="jas-scores">
                    <div className="jas-score-col">
                      <span className="jas-score-lbl"><Trophy size={14} color="#eab308" /> Overall</span>
                      <span className="jas-score-val">{a.overallScore ?? "0"}%</span>
                    </div>
                    <div className="jas-score-col">
                      <span className="jas-score-lbl"><Star size={14} color="#8b5cf6" /> MCQ</span>
                      <span className="jas-score-val">{a.mcqScore ?? "0"}%</span>
                    </div>
                    <div className="jas-score-col">
                      <span className="jas-score-lbl"><Sparkles size={14} color="#10b981" /> Coding</span>
                      <span className="jas-score-val">{a.codingScore ?? "0"}%</span>
                    </div>
                  </div>
                ) : isInProgress ? (
                  <div className="jas-progress-wrap">
                    <div className="jas-progress-bar">
                      <div className="jas-progress-fill" style={{ width: "40%", background: "#3b82f6" }} />
                    </div>
                    <span className="jas-progress-lbl">MCQ in progress — 40% complete</span>
                  </div>
                ) : (
                  <div style={{ flex: 1 }} />
                )}

                {/* FOOTER CTA */}
                <div className="jas-card-footer">
                  {isCompleted ? (
                    <Link to={`/assessment/${a._id}/result`} className="jas-action-btn jas-btn-result">
                      <BarChart2 size={16} /> View Result
                    </Link>
                  ) : isInProgress ? (
                    <Link to={`/assessment/${a._id}`} className="jas-action-btn jas-btn-continue">
                      <PlayCircle size={16} /> Continue
                    </Link>
                  ) : (
                    <Link to={`/assessment/${a._id}`} className="jas-action-btn jas-btn-start">
                      <PlayCircle size={16} /> Start Assessment
                    </Link>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
