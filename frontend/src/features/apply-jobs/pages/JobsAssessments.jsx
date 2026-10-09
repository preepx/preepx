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
// Extended tech mapping
const techMap = [
  { keys: ['react', 'frontend', 'front-end', 'mern'], icon: 'react/react-original.svg', bg: '#e0f2fe' },
  { keys: ['node', 'backend', 'back-end', 'express'], icon: 'nodejs/nodejs-original.svg', bg: '#dcfce3' },
  { keys: ['java', 'spring'], icon: 'java/java-original.svg', bg: '#fce7f3' },
  { keys: ['python', 'django', 'flask'], icon: 'python/python-original.svg', bg: '#fef3c7' },
  { keys: ['js', 'javascript'], icon: 'javascript/javascript-original.svg', bg: '#fef08a' },
  { keys: ['angular'], icon: 'angularjs/angularjs-original.svg', bg: '#fee2e2' },
  { keys: ['vue'], icon: 'vuejs/vuejs-original.svg', bg: '#dcfce3' },
  { keys: ['php', 'laravel'], icon: 'php/php-original.svg', bg: '#e0e7ff' },
  { keys: ['go', 'golang'], icon: 'go/go-original.svg', bg: '#e0f2fe' },
  { keys: ['ruby', 'rails'], icon: 'ruby/ruby-original.svg', bg: '#fee2e2' },
  { keys: ['c++', 'cpp'], icon: 'cplusplus/cplusplus-original.svg', bg: '#e0e7ff' },
  { keys: ['c#', '.net'], icon: 'csharp/csharp-original.svg', bg: '#f3e8ff' },
  { keys: ['sql', 'database', 'data'], icon: 'mysql/mysql-original.svg', bg: '#e0f2fe' },
  { keys: ['aws', 'cloud', 'devops'], icon: 'amazonwebservices/amazonwebservices-original-wordmark.svg', bg: '#fef3c7' },
  { keys: ['docker'], icon: 'docker/docker-original.svg', bg: '#e0f2fe' },
  { keys: ['android', 'mobile'], icon: 'android/android-original.svg', bg: '#dcfce3' },
  { keys: ['ios', 'swift'], icon: 'swift/swift-original.svg', bg: '#ffedd5' },
  { keys: ['figma', 'ui', 'ux', 'design'], icon: 'figma/figma-original.svg', bg: '#f3e8ff' },
  { keys: ['tester', 'qa', 'testing', 'selenium'], icon: 'selenium/selenium-original.svg', bg: '#f3e8ff' },
];

const getTechIcon = (title) => {
  const t = title.toLowerCase();
  
  for (const tech of techMap) {
    if (tech.keys.some(k => t.includes(k))) {
      return { 
        img: `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${tech.icon}`, 
        bg: tech.bg 
      };
    }
  }

  // Dynamic fallback using ui-avatars to create an initial-based logo for ANY unknown role
  return { 
    img: `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=random&color=fff&size=64&bold=true`, 
    bg: '#f8fafc'
  };
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
            <ClipboardCheck size={22} />
          </div>
          <div className="jas-hero-text">
            <h1>Skill Assessments</h1>
            <p>Take recruiter-style tests, track your progress and improve your skills.</p>
          </div>
        </div>

        <div className="jas-hero-stats">
          <div className="jas-hstat-card" style={{ background: '#f0f9ff', borderColor: '#e0f2fe' }}>
            <div className="jas-hstat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <ClipboardCheck size={24} />
            </div>
            <div className="jas-hstat-info">
              <span className="jas-hstat-val">{assessments.length}</span>
              <span className="jas-hstat-lbl">Total Assessments</span>
            </div>
          </div>
          <div className="jas-hstat-card" style={{ background: '#fffbeb', borderColor: '#fef3c7' }}>
            <div className="jas-hstat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Clock size={24} />
            </div>
            <div className="jas-hstat-info">
              <span className="jas-hstat-val">{pending.length}</span>
              <span className="jas-hstat-lbl">Pending</span>
            </div>
          </div>
          <div className="jas-hstat-card" style={{ background: '#f0fdf4', borderColor: '#dcfce3' }}>
            <div className="jas-hstat-icon" style={{ background: '#dcfce3', color: '#166534' }}>
              <CheckCircle2 size={24} />
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
                    {techIcon.img ? (
                      <img src={techIcon.img} alt={a.jobTitle} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                    ) : (
                      techIcon.text
                    )}
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
