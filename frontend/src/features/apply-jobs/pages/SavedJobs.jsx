import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Bookmark, Briefcase, Globe, Search, Building2, MapPin,
  Clock, Sparkles, CheckCircle2, CheckCircle, ExternalLink,
  Eye, X, ArrowRight, Loader2
} from "lucide-react";
import {
  getSavedJobs, toggleSaveJob, applyToJob, getMyApplications
} from "../services/candidateJobsAPI";
import EmptyState from "@/components/recruiter/EmptyState";
import Loader from "@/components/Loader";
import notify from "@/utils/notify";
import JobLogo from "../components/JobLogo";
import { jobCompany, formatSalary, workModeLabel, empType, timeAgo } from "../utils/jobHelpers";
import '../styles/JobsAssessments.css';

export default function SavedJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [savedData, appsData] = await Promise.all([
        getSavedJobs().catch(() => []),
        getMyApplications().catch(() => [])
      ]);
      setJobs(savedData || []);
      if (appsData && appsData.length > 0) {
        setAppliedIds(appsData.map((app) => app.jobId?._id || app.jobId));
      }
    } catch (e) {
      notify.error("Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (jobId, e) => {
    e?.stopPropagation();
    try {
      const res = await toggleSaveJob(jobId);
      if (!res.saved) {
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
        notify.success("Removed from saved jobs");

        // Sync with localStorage for any dashboard listeners
        try {
          let ls = JSON.parse(localStorage.getItem("ajd_saved") || "[]");
          ls = ls.filter((x) => x !== jobId);
          localStorage.setItem("ajd_saved", JSON.stringify(ls));
        } catch (err) {}
      }
    } catch (err) {
      notify.error("Failed to update saved job");
    }
  };

  const handleApply = async (jobId) => {
    try {
      setApplying(jobId);
      await applyToJob(jobId);
      notify.success("Application submitted successfully!");
      setAppliedIds((prev) => [...prev, jobId]);
    } catch (err) {
      notify.error(err.response?.data?.message || "Failed to submit application");
    } finally {
      setApplying(null);
    }
  };

  // Metric counts for hero & tabs
  const fullTimeJobs = jobs.filter(
    (j) => (j.employmentType || "").toLowerCase().includes("full")
  );
  const remoteJobs = jobs.filter((j) => {
    const wm = (j.workMode || "").toLowerCase();
    const loc = (j.location || "").toLowerCase();
    return wm === "remote" || loc.includes("remote") || wm === "hybrid" || loc.includes("hybrid");
  });
  const internshipJobs = jobs.filter(
    (j) => (j.employmentType || "").toLowerCase().includes("intern")
  );

  // Filtering
  const filtered = jobs.filter((job) => {
    if (filter === "full_time") {
      if (!(job.employmentType || "").toLowerCase().includes("full")) return false;
    } else if (filter === "remote") {
      const wm = (job.workMode || "").toLowerCase();
      const loc = (job.location || "").toLowerCase();
      if (!wm.includes("remote") && !loc.includes("remote") && !wm.includes("hybrid") && !loc.includes("hybrid")) {
        return false;
      }
    } else if (filter === "internship") {
      if (!(job.employmentType || "").toLowerCase().includes("intern")) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const title = (job.title || "").toLowerCase();
      const comp = (jobCompany(job) || "").toLowerCase();
      const role = (job.role || "").toLowerCase();
      const loc = (job.location || "").toLowerCase();
      const skills = (job.skills || []).join(" ").toLowerCase();
      if (!title.includes(q) && !comp.includes(q) && !role.includes(q) && !loc.includes(q) && !skills.includes(q)) {
        return false;
      }
    }

    return true;
  });

  if (loading) return <Loader />;

  return (
    <div className="jas-root">
      {/* ── HERO BANNER (Layout identical to JobsAssessments) ── */}
      <section className="jas-hero">
        <div className="jas-hero-left">
          <div className="jas-hero-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Bookmark size={22} fill="currentColor" />
          </div>
          <div className="jas-hero-text">
            <h1>Saved Jobs</h1>
            <p>Keep track of jobs you're interested in, compare opportunities, and apply when ready.</p>
          </div>
        </div>

        <div className="jas-hero-stats">
          <div className="jas-hstat-card" style={{ background: '#f0f9ff', borderColor: '#e0f2fe' }}>
            <div className="jas-hstat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Bookmark size={24} />
            </div>
            <div className="jas-hstat-info">
              <span className="jas-hstat-val">{jobs.length}</span>
              <span className="jas-hstat-lbl">Total Saved</span>
            </div>
          </div>
          <div className="jas-hstat-card" style={{ background: '#fffbeb', borderColor: '#fef3c7' }}>
            <div className="jas-hstat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Briefcase size={24} />
            </div>
            <div className="jas-hstat-info">
              <span className="jas-hstat-val">{fullTimeJobs.length}</span>
              <span className="jas-hstat-lbl">Full-Time</span>
            </div>
          </div>
          <div className="jas-hstat-card" style={{ background: '#f0fdf4', borderColor: '#dcfce3' }}>
            <div className="jas-hstat-icon" style={{ background: '#dcfce3', color: '#166534' }}>
              <Globe size={24} />
            </div>
            <div className="jas-hstat-info">
              <span className="jas-hstat-val">{remoteJobs.length}</span>
              <span className="jas-hstat-lbl">Remote / Hybrid</span>
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
            All ({jobs.length})
          </button>
          <button
            className={`jas-tab ${filter === "full_time" ? "active" : ""}`}
            onClick={() => setFilter("full_time")}
          >
            Full-time ({fullTimeJobs.length})
          </button>
          <button
            className={`jas-tab ${filter === "remote" ? "active" : ""}`}
            onClick={() => setFilter("remote")}
          >
            Remote ({remoteJobs.length})
          </button>
          {internshipJobs.length > 0 && (
            <button
              className={`jas-tab ${filter === "internship" ? "active" : ""}`}
              onClick={() => setFilter("internship")}
            >
              Internship ({internshipJobs.length})
            </button>
          )}
        </div>

        <div className="jas-filters-right">
          <div className="jas-search-box">
            <Search size={16} color="#94a3b8" />
            <input
              placeholder="Search saved jobs, skills, or companies..."
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
            icon={Bookmark}
            title={jobs.length === 0 ? "No saved jobs yet" : "No matching jobs found"}
            description={
              jobs.length === 0
                ? "When you find roles you're interested in on the job board, bookmark them to apply anytime."
                : "No saved roles match your current search or tab filters."
            }
            actionLabel={jobs.length === 0 ? "Browse Jobs" : "Clear Filters"}
            actionTo={jobs.length === 0 ? "/apply-jobs/browse" : null}
            onAction={jobs.length === 0 ? null : () => { setFilter("all"); setSearch(""); }}
          />
        ) : (
          filtered.map((job) => {
            const isApplied = appliedIds.includes(job._id);
            const compName = jobCompany(job);
            const isRemote = (job.workMode || "").toLowerCase() === "remote" ||
              (job.location || "").toLowerCase().includes("remote");

            return (
              <article
                key={job._id}
                className="jas-card"
                onClick={() => setSelectedJob(job)}
                style={{ cursor: 'pointer' }}
              >
                {/* TOP */}
                <div className="jas-card-top">
                  <div
                    className="jas-card-icon-box"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', overflow: 'hidden' }}
                  >
                    <JobLogo job={job} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                  </div>
                  <div className="jas-status-wrap">
                    <span
                      className="jas-status-pill"
                      style={{
                        background: isRemote ? '#dcfce3' : '#e0f2fe',
                        color: isRemote ? '#059669' : '#0284c7'
                      }}
                    >
                      {workModeLabel(job)}
                    </span>
                    <button
                      className="jas-menu-btn"
                      title="Remove from saved"
                      onClick={(e) => handleToggleSave(job._id, e)}
                      style={{ color: '#f59e0b', cursor: 'pointer' }}
                    >
                      <Bookmark size={18} fill="#f59e0b" />
                    </button>
                  </div>
                </div>

                {/* BODY */}
                <div className="jas-card-body">
                  <h3 className="jas-job-title" title={job.title}>
                    {job.title}
                  </h3>
                  <p className="jas-job-role" title={compName}>
                    <Building2 size={12} style={{ flexShrink: 0 }} /> {compName}
                  </p>
                  <p className="jas-job-co" title={job.location || "Remote"}>
                    <MapPin size={12} style={{ flexShrink: 0 }} /> {job.location || "Remote"}
                  </p>
                </div>

                {/* DYNAMIC MIDDLE CONTENT */}
                <div className="jas-scores">
                  <div className="jas-score-col">
                    <span className="jas-score-lbl">
                      <Briefcase size={12} color="#6366f1" /> Exp
                    </span>
                    <span className="jas-score-val" title={(job.experienceMin > 0 || job.experienceMax > 0) ? `${job.experienceMin}-${job.experienceMax} Yrs` : "Fresher"}>
                      {(job.experienceMin > 0 || job.experienceMax > 0)
                        ? `${job.experienceMin}-${job.experienceMax}Y`
                        : "Fresher"}
                    </span>
                  </div>
                  <div className="jas-score-col">
                    <span className="jas-score-lbl">
                      <Clock size={12} color="#d97706" /> Posted
                    </span>
                    <span className="jas-score-val" title={timeAgo(job.createdAt)}>
                      {timeAgo(job.createdAt)}
                    </span>
                  </div>
                  <div className="jas-score-col">
                    <span className="jas-score-lbl">
                      <Sparkles size={12} color="#10b981" /> Salary
                    </span>
                    <span className="jas-score-val" title={formatSalary(job)}>
                      {job.salaryMin > 0 || job.salaryMax > 0
                        ? `₹${job.salaryMin}-${job.salaryMax}L`
                        : "Best"}
                    </span>
                  </div>
                </div>

                {/* FOOTER CTA */}
                <div className="jas-card-footer">
                  {isApplied ? (
                    <span
                      className="jas-action-btn jas-btn-result"
                      style={{ cursor: 'default' }}
                    >
                      <CheckCircle2 size={16} /> Applied
                    </span>
                  ) : job.isThirdParty ? (
                    <a
                      href={job.applyLink}
                      target="_blank"
                      rel="noreferrer"
                      className="jas-action-btn jas-btn-continue"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Apply <ExternalLink size={16} />
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="jas-action-btn jas-btn-continue"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(job._id);
                      }}
                      disabled={applying === job._id}
                    >
                      {applying === job._id ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Applying...
                        </>
                      ) : (
                        <>
                          Apply Now <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* ── JOB DETAILS MODAL ── */}
      {selectedJob && createPortal(
        <div
          className="jas-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedJob(null);
          }}
        >
          <div className="jas-modal-card">
            <div className="jas-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className="jas-card-logo-box" style={{ width: '48px', height: '48px' }}>
                  <JobLogo job={selectedJob} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700 }}>
                    {selectedJob.title}
                  </h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={14} /> {jobCompany(selectedJob)}
                    <span>•</span>
                    <MapPin size={14} /> {selectedJob.location || "Remote"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="jas-modal-body">
              {/* Pills / overview */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span className="jas-status-pill" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                  {empType(selectedJob)}
                </span>
                <span className="jas-status-pill" style={{ background: '#dcfce3', color: '#059669' }}>
                  {workModeLabel(selectedJob)}
                </span>
                <span className="jas-status-pill" style={{ background: '#fef3c7', color: '#d97706' }}>
                  {formatSalary(selectedJob)}
                </span>
                {(selectedJob.experienceMin > 0 || selectedJob.experienceMax > 0) && (
                  <span className="jas-status-pill" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                    Exp: {selectedJob.experienceMin} - {selectedJob.experienceMax} Yrs
                  </span>
                )}
              </div>

              {/* Skills if any */}
              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 8px' }}>Required Skills</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedJob.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          fontSize: '12px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontWeight: 500
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Description */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 8px' }}>Job Description</h4>
                <div style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {selectedJob.description || "No description provided for this job."}
                </div>
              </div>
            </div>

            <div className="jas-modal-footer">
              <button
                onClick={() => setSelectedJob(null)}
                className="jas-view-btn-outline"
              >
                Close
              </button>
              {appliedIds.includes(selectedJob._id) ? (
                <span className="jas-action-btn" style={{ background: '#dcfce3', color: '#059669', width: 'auto', padding: '8px 18px', cursor: 'default' }}>
                  <CheckCircle2 size={16} /> Applied
                </span>
              ) : selectedJob.isThirdParty ? (
                <a
                  href={selectedJob.applyLink}
                  target="_blank"
                  rel="noreferrer"
                  className="jas-action-btn jas-btn-continue"
                  style={{ width: 'auto', padding: '8px 20px' }}
                >
                  Apply on Company Site <ExternalLink size={15} />
                </a>
              ) : (
                <button
                  className="jas-action-btn jas-btn-continue"
                  style={{ width: 'auto', padding: '8px 20px' }}
                  disabled={applying === selectedJob._id}
                  onClick={() => handleApply(selectedJob._id)}
                >
                  {applying === selectedJob._id ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Applying...
                    </>
                  ) : (
                    "Apply Now"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
