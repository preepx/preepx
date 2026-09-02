import React from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Flame, Bookmark } from "lucide-react";
import { jobCompany, empType, workModeLabel, formatSalary, timeAgo } from "../../utils/jobHelpers";

export default function FeaturedJobsSection({
  isSearchActive,
  isSearching,
  totalFound,
  viewAllLink,
  displayJobs = [],
  savedIds = [],
  toggleSave,
  handleApply,
  applying,
  onJobClick,
}) {
  return (
    <section className="ajd-card" id="ajd-jobs">
      <div className="ajd-card-head">
        <div>
          <h2>
            {isSearchActive
              ? isSearching
                ? "Searching…"
                : `Search results (${totalFound})`
              : "Featured openings"}
          </h2>
          <p className="ajd-card-kicker">Priority apply · verified employers</p>
        </div>
        <Link to={viewAllLink} className="ajd-view-link">
          View all jobs →
        </Link>
      </div>
      <div className="ajd-job-list">
        {isSearching ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="ajd-job-row" style={{ pointerEvents: "none" }}>
                <div className="ajd-jlogo ajd-skel-bg" style={{ border: "none" }} />
                <div className="ajd-jinfo">
                  <div className="ajd-skel-bg" style={{ height: "16px", width: "60%", borderRadius: "4px", marginBottom: "8px" }} />
                  <div className="ajd-skel-bg" style={{ height: "14px", width: "40%", borderRadius: "4px", marginBottom: "12px" }} />
                  <div className="ajd-tags">
                    <span className="ajd-tag ajd-skel-bg" style={{ width: "60px", border: "none", color: "transparent" }}>.</span>
                    <span className="ajd-tag ajd-skel-bg" style={{ width: "80px", border: "none", color: "transparent" }}>.</span>
                  </div>
                </div>
                <div className="ajd-jright">
                  <div className="ajd-skel-bg" style={{ height: "16px", width: "70px", borderRadius: "4px", marginBottom: "8px" }} />
                  <div className="ajd-skel-bg" style={{ height: "12px", width: "40px", borderRadius: "4px", alignSelf: "flex-end" }} />
                </div>
              </div>
            ))}
          </>
        ) : displayJobs.length === 0 ? (
          <p className="ajd-empty">No jobs found. Try a different skill or city.</p>
        ) : (
          displayJobs.map((job) => (
            <div
              key={job._id}
              className="ajd-job-row"
              onClick={() => onJobClick(job)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") onJobClick(job);
              }}
            >
              <div className="ajd-jlogo">
                {job.isThirdParty && job.externalCompanyLogo ? (
                  <img src={job.externalCompanyLogo} alt={jobCompany(job)} />
                ) : (
                  <span>{(jobCompany(job) || "C").charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="ajd-jinfo">
                <h4>
                  {job.title}
                  {job.isThirdParty && <BadgeCheck size={15} color="#2563eb" />}
                  {job.isHot && <span className="ajd-pill-hot"><Flame size={11} /> Hot</span>}
                  {(job.matchScore ?? 0) >= 50 && (
                    <span className="ajd-pill-match">{job.matchScore}% match</span>
                  )}
                </h4>
                <p>{jobCompany(job)} · {job.location || "Remote"}</p>
                <div className="ajd-tags">
                  <span className="ajd-tag ajd-tag--green">{empType(job)}</span>
                  <span className="ajd-tag ajd-tag--blue">{workModeLabel(job)}</span>
                  <span className="ajd-tag ajd-tag--amber">
                    {job.experienceMin > 0 || job.experienceMax > 0
                      ? `${job.experienceMin}–${job.experienceMax} yrs`
                      : "Fresher / Any"}
                  </span>
                </div>
              </div>
              <div className="ajd-jright">
                <strong>{formatSalary(job)}</strong>
                <span>{timeAgo(job.createdAt || job.postedAt)}</span>
                <div className="ajd-jactions">
                  <button
                    type="button"
                    className={`ajd-icon-btn ${savedIds.includes(job._id) ? "on" : ""}`}
                    onClick={(e) => toggleSave(job._id, e)}
                    aria-label="Save job"
                  >
                    <Bookmark size={14} fill={savedIds.includes(job._id) ? "currentColor" : "none"} />
                  </button>
                  <button
                    type="button"
                    className="ajd-apply-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(job);
                    }}
                    disabled={applying === job._id || job.applied}
                  >
                    {job.applied ? "Applied" : applying === job._id ? "Applying…" : "Easy apply"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="ajd-view-all-wrap">
        <Link to={viewAllLink} className="ajd-view-all-btn">
          Browse full job board →
        </Link>
      </div>
    </section>
  );
}
