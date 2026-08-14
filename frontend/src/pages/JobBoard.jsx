import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, Sparkles, Search, Building2, ChevronRight } from "lucide-react";
import { getPublishedJobs, applyToJob } from "@/services/candidateJobsAPI";
import DashboardSkeleton from "@/components/recruiter/DashboardSkeleton";
import EmptyState from "@/components/recruiter/EmptyState";
import notify from "@/utils/notify";
import '@/styles/JobBoard.css'; // Keep for overrides
import '@/styles/ApplyJobsDashboard.css'; // Reuse premium styles

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

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="rx-dashboard">
      <div className="rx-section-head" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "var(--text)" }}>Apply to Jobs</h1>
          <p style={{ color: "var(--text-light)", marginTop: 4 }}>Browse open roles matched to your skills.</p>
        </div>
        <Link to="/apply-jobs" className="rx-link-action">
          Job Dashboard <ChevronRight size={14} />
        </Link>
      </div>

      <div className="aj-tabs-premium">
        <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All Jobs</button>
        <button type="button" className={filter === "match" ? "active" : ""} onClick={() => setFilter("match")}>Best Match</button>
      </div>

      <div className="rx-card" style={{ marginBottom: 24, display: "flex", gap: 12, alignItems: "center", padding: "12px 16px" }}>
        <Search size={18} style={{ color: "var(--text-light)" }} />
        <input
          type="text"
          placeholder="Search by title, role, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: "none", background: "transparent", outline: "none", flex: 1, fontSize: 14, color: "var(--text)" }}
        />
      </div>

      <section className="aj-jobs-grid">
        {displayedJobs.length === 0 ? (
          <div className="rx-card" style={{ gridColumn: "1 / -1" }}>
            <EmptyState
              icon={Briefcase}
              title={filter === "match" ? "No strong matches yet" : "No open jobs right now"}
              description={filter === "match" ? "Add skills on Profile or upload your resume to improve matching." : "Check back soon — recruiters are posting new roles."}
              actionLabel={filter === "match" ? "Complete Profile" : null}
              actionTo={filter === "match" ? "/apply-jobs/profile" : null}
            />
          </div>
        ) : (
          displayedJobs.map((job) => (
            <article key={job._id} className="aj-job-card-premium">
              <div className="aj-job-card-head">
                <h3>{job.title}</h3>
                {job.matchScore != null && (
                  <span className={`aj-match-ring ${job.matchScore >= 70 ? "high" : job.matchScore >= 45 ? "mid" : "low"}`}>
                    {job.matchScore}%
                  </span>
                )}
              </div>
              <p className="aj-job-co"><Building2 size={13} /> {job.companyName}</p>
              <p className="aj-job-role">{job.role}</p>
              <p className="aj-job-meta">
                <MapPin size={12} /> {job.location || "Remote"} 
                <span style={{ margin: "0 6px" }}>·</span>
                {job.experienceMin ?? 0}–{job.experienceMax ?? 5} yrs
              </p>
              <p style={{ fontSize: 13, color: "var(--text-light)", marginTop: 8, flex: 1 }}>
                {(job.description || "").slice(0, 100)}{(job.description || "").length > 100 ? "…" : ""}
              </p>
              
              <div className="aj-job-skills">
                {(job.matchedSkills?.length ? job.matchedSkills : (job.requiredSkills || job.skills || [])).slice(0, 4).map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              
              {job.applied ? (
                <button type="button" className="rx-btn" style={{ marginTop: "auto", background: "var(--border-color)", color: "var(--text-light)", cursor: "not-allowed" }} disabled>
                  Applied ✓
                </button>
              ) : (
                <button
                  type="button"
                  className="rx-btn rx-btn-primary"
                  style={{ marginTop: "auto" }}
                  disabled={applying === job._id}
                  onClick={() => handleApply(job._id)}
                >
                  <Sparkles size={14} />
                  {applying === job._id ? "Applying..." : "Apply Now"} <ChevronRight size={14} />
                </button>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  );
}
