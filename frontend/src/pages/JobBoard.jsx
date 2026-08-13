import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, Sparkles, Search, Building2 } from "lucide-react";
import { getPublishedJobs, applyToJob } from "../services/candidateJobsAPI";
import Loader from "../components/Loader";
import notify from "../utils/notify";
import "./JobBoard.css";

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [applying, setApplying] = useState(null);
  const [filter, setFilter] = useState("all");

  const load = () => {
    setLoading(true);
    getPublishedJobs({ search })
      .then((d) => setJobs(d.jobs || []))
      .catch(() => notify.error("Could not load jobs"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const displayedJobs = useMemo(() => {
    const list = [...jobs];
    if (filter === "match") {
      return list
        .filter((j) => !j.applied && (j.matchScore ?? 0) >= 35)
        .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    }
    return list.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  }, [jobs, filter]);

  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      const res = await applyToJob(jobId);
      notify.success(res.message || "Application submitted!");
      setJobs((prev) => prev.map((j) => (j._id === jobId ? { ...j, applied: true } : j)));
    } catch (e) {
      notify.error(e.response?.data?.message || "Apply failed");
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="jb-page">
      <div className="jb-header">
        <div>
          <h1><Briefcase size={24} /> Apply to Jobs</h1>
          <p>Browse open roles matched to your skills. Recruiters see your profile, match % and resume when you apply.</p>
        </div>
        <Link to="/apply-jobs" className="jb-link">Job Dashboard →</Link>
      </div>

      <div className="jb-toolbar">
        <div className="jb-search">
          <Search size={16} />
          <input
            placeholder="Search by title, role, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="jb-filters">
          <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All Jobs</button>
          <button type="button" className={filter === "match" ? "active" : ""} onClick={() => setFilter("match")}>Best Match</button>
        </div>
      </div>

      {loading ? <Loader /> : displayedJobs.length === 0 ? (
        <div className="jb-empty">
          <Briefcase size={40} />
          <h3>{filter === "match" ? "No strong matches yet" : "No open jobs right now"}</h3>
          <p>
            {filter === "match"
              ? "Add skills on Profile or upload your resume to improve matching."
              : "Check back soon — recruiters are posting new roles."}
          </p>
          {filter === "match" && (
            <Link to="/profile" className="jb-apply-btn" style={{ display: "inline-flex", width: "auto", marginTop: 16, padding: "10px 20px", textDecoration: "none" }}>
              Complete Profile
            </Link>
          )}
        </div>
      ) : (
        <div className="jb-grid">
          {displayedJobs.map((job) => (
            <article key={job._id} className="jb-card">
              <div className="jb-card-top">
                <h2>{job.title}</h2>
                <div className="jb-card-badges">
                  {job.matchScore != null && (
                    <span className={`jb-match-badge ${job.matchScore >= 70 ? "high" : job.matchScore >= 45 ? "mid" : "low"}`}>
                      {job.matchScore}% match
                    </span>
                  )}
                  <span className="jb-badge">{job.employmentType?.replace("_", " ") || "Full time"}</span>
                </div>
              </div>
              <p className="jb-company"><Building2 size={14} /> {job.companyName}</p>
              <p className="jb-role">{job.role}</p>
              <div className="jb-meta">
                <span><MapPin size={13} /> {job.location || "Remote"}</span>
                <span>{job.experienceMin ?? 0}–{job.experienceMax ?? 5} yrs</span>
              </div>
              <p className="jb-desc">{(job.description || "").slice(0, 140)}{(job.description || "").length > 140 ? "…" : ""}</p>
              <div className="jb-skills">
                {(job.matchedSkills?.length ? job.matchedSkills : (job.requiredSkills || job.skills || [])).slice(0, 4).map((s) => (
                  <span key={s} className={job.matchedSkills?.includes(s) ? "matched" : ""}>{s}</span>
                ))}
              </div>
              {job.applied ? (
                <button type="button" className="jb-apply-btn applied" disabled>Applied ✓</button>
              ) : (
                <button
                  type="button"
                  className="jb-apply-btn"
                  disabled={applying === job._id}
                  onClick={() => handleApply(job._id)}
                >
                  <Sparkles size={16} />
                  {applying === job._id ? "Applying..." : "Apply Now"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
