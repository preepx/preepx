import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Bot, Clock, CheckCircle2,
  Search, MoreVertical, Building2, Trophy, Star, Sparkles, BarChart2,
  ArrowRight
} from "lucide-react";
import { getMyApplications } from "../services/candidateJobsAPI";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import '../styles/JobsAssessments.css';

// Tech mapping for devicons (same mapping as JobsAssessments)
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
  const t = (title || "").toLowerCase();

  for (const tech of techMap) {
    if (tech.keys.some(k => t.includes(k))) {
      return {
        img: `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${tech.icon}`,
        bg: tech.bg
      };
    }
  }

  return {
    img: `https://ui-avatars.com/api/?name=${encodeURIComponent(title || "AI")}&background=random&color=fff&size=64&bold=true`,
    bg: '#f8fafc'
  };
};

export default function JobsAiInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getMyApplications()
      .then((apps) => {
        const list = Array.isArray(apps) ? apps : [];
        const appInterviewList = list.filter((a) =>
          ["ai_interview", "interview"].includes(a.status) || a.aiInterviewId || (a.aiInterviewScore && a.aiInterviewScore > 0)
        ).map((a) => {
          const interviewDoc = typeof a.aiInterviewId === "object" ? a.aiInterviewId : null;
          const isCompleted = (a.aiInterviewScore && a.aiInterviewScore > 0) || interviewDoc?.status === "completed" || a.status === "hired" || a.status === "selected";
          const isAIInterviewReady = a.status === "ai_interview" && Boolean(a.aiInterviewId);
          return {
            id: a._id,
            applicationId: a._id,
            interviewId: interviewDoc?._id || a.aiInterviewId,
            isAIInterviewReady,
            jobTitle: a.jobId?.title || interviewDoc?.jobTitle || "AI Interview",
            jobRole: a.jobId?.role || interviewDoc?.jobTopic || "Technical Role",
            companyName: a.recruiterId?.companyName || "Preepx",
            location: a.jobId?.location || "Remote",
            status: isCompleted ? "completed" : "pending",
            score: a.aiInterviewScore || a.aiInterviewReport?.overallScore || interviewDoc?.totalScore || 0,
            matchScore: a.matchScore || 0,
            questionsCount: interviewDoc?.questions?.length || 10,
            interviewData: interviewDoc,
            application: a,
            createdAt: a.createdAt || interviewDoc?.createdAt || new Date().toISOString(),
            isFromApplication: true
          };
        });

        setInterviews(appInterviewList);
      })
      .catch(() => {
        setInterviews([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const pending = interviews.filter((i) => i.status !== "completed");
  const completed = interviews.filter((i) => i.status === "completed");

  const filtered = interviews.filter(item => {
    if (filter === "pending" && item.status === "completed") return false;
    if (filter === "completed" && item.status !== "completed") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = item.jobTitle?.toLowerCase().includes(q);
      const matchRole = item.jobRole?.toLowerCase().includes(q);
      const matchCompany = item.companyName?.toLowerCase().includes(q);
      if (!matchTitle && !matchRole && !matchCompany) return false;
    }
    return true;
  });

  const handleStartAIInterview = (item) => {
    if (item.isFromApplication && item.application) {
      const app = item.application;
      const interview = app.aiInterviewId;
      navigate("/interview-mode", {
        state: {
          interviewId: interview?._id || interview || item.interviewId,
          jobTitle: app.jobId?.title || item.jobTitle || "Role Interview",
          jobTopic: app.jobId?.role || item.jobRole || "Technical",
          questions: interview?.questions || item.interviewData?.questions || [],
        },
      });
    } else {
      navigate("/interview-mode", {
        state: {
          interviewId: item.interviewId,
          jobTitle: item.jobTitle,
          jobTopic: item.jobRole,
          questions: item.interviewData?.questions || [],
        },
      });
    }
  };

  const handleViewResult = (item) => {
    navigate("/feedback", {
      state: {
        interview: item.interviewData || {
          jobTitle: item.jobTitle,
          jobTopic: item.jobRole,
          totalScore: item.score,
          answers: item.interviewData?.answers || []
        },
        jobTitle: item.jobTitle,
        jobTopic: item.jobRole,
        totalScore: item.score
      }
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="jas-root">
      {/* ── HERO BANNER ── */}
      <section className="jas-hero">
        <div className="jas-hero-left">
          <div className="jas-hero-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Bot size={22} />
          </div>
          <div className="jas-hero-text">
            <h1>AI Interviews</h1>
            <p>Take recruiter AI interviews, answer live audio/text questions, and track your performance.</p>
          </div>
        </div>

        <div className="jas-hero-stats">
          <div className="jas-hstat-card" style={{ background: '#f0f9ff', borderColor: '#e0f2fe' }}>
            <div className="jas-hstat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Bot size={24} />
            </div>
            <div className="jas-hstat-info">
              <span className="jas-hstat-val">{interviews.length}</span>
              <span className="jas-hstat-lbl">Total Interviews</span>
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
            All ({interviews.length})
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
              placeholder="Search AI interviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── CARDS GRID OR EMPTY STATE ── */}
      {filtered.length === 0 ? (
        <div className="jas-empty-card">
          <EmptyState
            icon={Bot}
            title="No AI interviews found"
            description="You don't have any AI interviews matching your filters. When recruiters invite you to an AI interview, it will appear here."
          />
        </div>
      ) : (
        <div className="jas-grid">
          {filtered.map((item) => {
            const isCompleted = item.status === "completed";
            const techIcon = getTechIcon(item.jobTitle || "");

            // Status pill styling
            let pillBg = "#fef3c7";
            let pillColor = "#d97706";
            let pillLabel = "Pending";

            if (isCompleted) {
              pillBg = "#dcfce3";
              pillColor = "#059669";
              pillLabel = "Completed";
            }

            return (
              <article key={item.id} className="jas-card">
                {/* TOP */}
                <div className="jas-card-top">
                  <div
                    className="jas-card-icon-box"
                    style={{ background: techIcon.bg }}
                  >
                    {techIcon.img ? (
                      <img
                        src={techIcon.img}
                        alt={item.jobTitle}
                        style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                      />
                    ) : (
                      techIcon.text
                    )}
                  </div>
                  <div className="jas-status-wrap">
                    <span className="jas-status-pill" style={{ background: pillBg, color: pillColor }}>
                      {pillLabel}
                    </span>
                    <button className="jas-menu-btn" title="Options">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>

                {/* BODY */}
                <div className="jas-card-body">
                  <h3 className="jas-job-title">{item.jobTitle}</h3>
                  <p className="jas-job-role">{item.jobRole}</p>
                  <p className="jas-job-co">
                    <Building2 size={14} /> {item.companyName}
                  </p>
                </div>

                {/* SCORES OR STATS */}
                {isCompleted ? (
                  <div className="jas-scores">
                    <div className="jas-score-col">
                      <span className="jas-score-lbl"><Trophy size={14} color="#eab308" /> Overall</span>
                      <span className="jas-score-val">{item.score}%</span>
                    </div>
                    <div className="jas-score-col">
                      <span className="jas-score-lbl"><Star size={14} color="#8b5cf6" /> Match</span>
                      <span className="jas-score-val">{item.matchScore}%</span>
                    </div>
                    <div className="jas-score-col">
                      <span className="jas-score-lbl"><Sparkles size={14} color="#10b981" /> Questions</span>
                      <span className="jas-score-val">{item.questionsCount} Qs</span>
                    </div>
                  </div>
                ) : item.isAIInterviewReady ? (
                  <div className="jas-scores">
                    <div className="jas-score-col">
                      <span className="jas-score-lbl"><Star size={14} color="#8b5cf6" /> Match</span>
                      <span className="jas-score-val">{item.matchScore}%</span>
                    </div>
                    <div className="jas-score-col">
                      <span className="jas-score-lbl"><Sparkles size={14} color="#10b981" /> Questions</span>
                      <span className="jas-score-val">{item.questionsCount} Qs</span>
                    </div>
                    <div className="jas-score-col">
                      <span className="jas-score-lbl"><Clock size={14} color="#0284c7" /> Format</span>
                      <span className="jas-score-val">AI Voice</span>
                    </div>
                  </div>
                ) : (
                  <div className="jas-scores">
                    <div className="jas-score-col">
                      <span className="jas-score-lbl"><Star size={14} color="#8b5cf6" /> Match</span>
                      <span className="jas-score-val">{item.matchScore}%</span>
                    </div>
                    <div className="jas-score-col">
                      <span className="jas-score-lbl"><Clock size={14} color="#0284c7" /> Stage</span>
                      <span className="jas-score-val">Interview</span>
                    </div>
                    <div className="jas-score-col">
                      <span className="jas-score-lbl"><Sparkles size={14} color="#10b981" /> Mode</span>
                      <span className="jas-score-val">Scheduled</span>
                    </div>
                  </div>
                )}

                {/* FOOTER CTA */}
                <div className="jas-card-footer">
                  {isCompleted ? (
                    <button
                      type="button"
                      className="jas-action-btn jas-btn-result"
                      onClick={() => handleViewResult(item)}
                    >
                      <BarChart2 size={16} /> View Result
                    </button>
                  ) : item.isAIInterviewReady ? (
                    <button
                      type="button"
                      className="jas-action-btn"
                      style={{ background: "linear-gradient(90deg, #7c3aed 0%, #6366f1 100%)", color: "#ffffff" }}
                      onClick={() => handleStartAIInterview(item)}
                    >
                      <Bot size={16} /> Start AI Interview <ArrowRight size={14} />
                    </button>
                  ) : (
                    <Link
                      to="/apply-jobs/browse"
                      className="jas-action-btn"
                      style={{
                        background: "#ffffff",
                        border: "1px solid #cbd5e1",
                        color: "#334155"
                      }}
                    >
                      View Job Details <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}