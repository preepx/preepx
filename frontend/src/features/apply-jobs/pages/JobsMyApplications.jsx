import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Search,
  Building2,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Filter,
  Grid,
  List,
  Bookmark,
  CircleDot,
  ArrowRight,
  Check,
  Circle,
  Bot,
  FileCheck
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SidebarApplicationAnalytics from "../components/SidebarApplicationAnalytics";
import SidebarImproveProfile from "../components/SidebarImproveProfile";
import { getProfile } from "@/services/userAPI";
import { getMyApplications, getApplicationStats } from "../services/candidateJobsAPI";
import { calcCompletion } from "../utils/jobHelpers";
import Loader from "@/components/Loader";
import '../styles/JobsMyApplications.css';
import '../styles/ApplyJobsDashboard.css';

export default function JobsMyApplications() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [profileData, setProfileData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      getMyApplications().catch(() => []),
      getApplicationStats().catch(() => null),
      getProfile().catch(() => null),
    ]).then(([apps, stats, prof]) => {
      setApplications(apps || []);
      setAnalytics(stats);
      setProfileData(prof);
      setLoading(false);
    });
  }, []);

  const completion = calcCompletion(profileData);

  const filterApplications = () => {
    let list = applications;

    if (activeTab === "Shortlisted") {
      list = list.filter((a) => a.status === "shortlisted");
    } else if (activeTab === "Assessment") {
      list = list.filter((a) => ["assessment_sent", "assessment_in_progress", "assessment_completed"].includes(a.status));
    } else if (activeTab === "AI Interview") {
      list = list.filter((a) => ["ai_interview", "interview"].includes(a.status));
    } else if (activeTab === "Offered") {
      list = list.filter((a) => ["offered", "hired"].includes(a.status));
    } else if (activeTab === "Rejected") {
      list = list.filter((a) => a.status === "rejected");
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.jobId?.title?.toLowerCase().includes(q) ||
          a.jobId?.role?.toLowerCase().includes(q) ||
          a.recruiterId?.companyName?.toLowerCase().includes(q)
      );
    }

    return list;
  };

  const filteredApps = filterApplications();

  const handleStartAIInterview = (app) => {
    const interview = app.aiInterviewId;
    navigate("/interview-mode", {
      state: {
        interviewId: interview?._id || interview,
        jobTitle: app.jobId?.title || "Role Interview",
        jobTopic: app.jobId?.role || "Technical",
        questions: interview?.questions || [],
      },
    });
  };

  return (
    <div className="jma-page-wrapper">
      {/* HERO BANNER (FULL WIDTH) */}
      <section className="jma-hero" style={{ marginBottom: 24 }}>
        <div className="jma-hero-left">
          <div className="jma-hero-icon"><Briefcase size={24} /></div>
          <div className="jma-hero-text">
            <div className="jma-kicker">Pipeline · Live Status</div>
            <h1>My Applications</h1>
            <p>Track every stage — applied, assessment, AI interview, offer</p>
          </div>
        </div>
        <div className="jma-hero-stats">
          <div className="jma-hstat">
            <span className="jma-hstat-val">{applications.length}</span>
            <span className="jma-hstat-lbl">Total Applied</span>
          </div>
          <div className="jma-hstat-div" />
          <div className="jma-hstat">
            <span className="jma-hstat-val" style={{ color: "#3b82f6" }}>
              {applications.filter((a) => ["assessment_sent", "assessment_in_progress", "ai_interview"].includes(a.status)).length}
            </span>
            <span className="jma-hstat-lbl">In Action</span>
          </div>
          <div className="jma-hstat-div" />
          <div className="jma-hstat">
            <span className="jma-hstat-val" style={{ color: '#10b981' }}>
              {applications.filter((a) => ["shortlisted", "offered", "hired"].includes(a.status)).length}
            </span>
            <span className="jma-hstat-lbl">Shortlisted / Offers</span>
          </div>
        </div>
      </section>

      <div className="jma-root">
        {/* LEFT COLUMN */}
        <div className="jma-left-col">
          {/* TOOLBAR */}
          <div className="jma-toolbar-top">
            <div className="jma-tabs">
              {[
                { name: "All", color: "var(--text)" }, 
                { name: "Shortlisted", color: "#10b981" }, 
                { name: "Assessment", color: "#f59e0b" }, 
                { name: "AI Interview", color: "#8b5cf6" }, 
                { name: "Offered", color: "#10b981" }, 
                { name: "Rejected", color: "#ef4444" }
              ].map((t) => {
                let count = 0;
                if (t.name === "All") count = applications.length;
                else if (t.name === "Shortlisted") count = applications.filter((a) => a.status === "shortlisted").length;
                else if (t.name === "Assessment") count = applications.filter((a) => ["assessment_sent", "assessment_in_progress", "assessment_completed"].includes(a.status)).length;
                else if (t.name === "AI Interview") count = applications.filter((a) => ["ai_interview", "interview"].includes(a.status)).length;
                else if (t.name === "Offered") count = applications.filter((a) => ["offered", "hired"].includes(a.status)).length;
                else if (t.name === "Rejected") count = applications.filter((a) => a.status === "rejected").length;

                return (
                  <button
                    key={t.name}
                    className={`jma-tab ${activeTab === t.name ? 'active' : ''}`}
                    onClick={() => setActiveTab(t.name)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {t.name}
                    <span 
                      style={{ 
                        background: activeTab === t.name ? 'rgba(255,255,255,0.2)' : 'var(--bg)', 
                        color: activeTab === t.name ? '#fff' : t.color,
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        fontWeight: '700'
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="jma-toolbar-bottom">
            <div className="jma-search-bar" style={{ flex: 1 }}>
              <Search size={18} color="#64748b" />
              <input
                placeholder="Search by job title, company, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : filteredApps.length === 0 ? (
            <div className="jma-sidebar-card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
              No applications in this category. Browse open jobs to apply!
              <div style={{ marginTop: 16 }}>
                <Link to="/apply-jobs/browse" className="jma-card-cta jma-cta-solid" style={{ display: "inline-flex", width: "auto" }}>
                  Browse Jobs
                </Link>
              </div>
            </div>
          ) : (
            /* JOB CARDS */
            <div className="jma-grid">
              {filteredApps.map((a) => {
                const job = a.jobId || {};
                const isTestPending = ["assessment_sent", "assessment_in_progress"].includes(a.status);
                const isAIInterviewReady = a.status === "ai_interview" && a.aiInterviewId;

                return (
                  <article key={a._id} className="jma-card">
                    <div className="jma-card-header">
                      <div className="jma-card-top-left">
                        <div className="jma-card-logo">
                          <Building2 size={24} color="#6366f1" />
                        </div>
                        <div className="jma-card-info">
                          <h3 className="jma-card-title">{job.title || "Job Position"}</h3>
                          <p className="jma-card-company"><Building2 size={10} /> {a.recruiterId?.companyName || "Company"}</p>
                          <p className="jma-card-location"><MapPin size={10} /> {job.location || "Remote"}</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <span className={`jma-status-badge ${a.status}`}>
                        <CheckCircle2 size={10} />
                        {(a.status || "applied").replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>

                    <div className="jma-match-sec">
                      <div className="jma-match-header">
                        <span>Match Score</span>
                        <span style={{ color: '#10b981', fontWeight: 800 }}>{a.matchScore || 0}%</span>
                      </div>
                      <div className="jma-match-bar">
                        <div className="jma-match-fill" style={{ width: `${a.matchScore || 0}%`, background: '#10b981' }} />
                      </div>
                    </div>

                    {/* CTAs */}
                    <div style={{ marginTop: 16 }}>
                      {isAIInterviewReady ? (
                        <button
                          type="button"
                          className="jma-card-cta jma-cta-solid"
                          style={{ background: "#8b5cf6", borderColor: "#7c3aed" }}
                          onClick={() => handleStartAIInterview(a)}
                        >
                          <Bot size={14} /> Start AI Interview <ArrowRight size={12} />
                        </button>
                      ) : isTestPending && a.assessmentId ? (
                        <Link
                          to={`/assessment/${a.assessmentId._id || a.assessmentId}`}
                          className="jma-card-cta jma-cta-solid"
                          style={{ background: "#f59e0b", borderColor: "#d97706" }}
                        >
                          <FileCheck size={14} /> Take Assessment <ArrowRight size={12} />
                        </Link>
                      ) : (
                        <Link to={`/apply-jobs/browse`} className="jma-card-cta jma-cta-outline">
                          View Job Details <ArrowRight size={12} />
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="jma-sidebar">
          {analytics && <SidebarApplicationAnalytics stats={analytics} />}
          <SidebarImproveProfile completion={completion} />
        </aside>
      </div>
    </div>
  );
}
