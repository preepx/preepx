import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  PlusCircle,
  Search,
  Sparkles,
  CheckCircle,
  FileText,
  Eye,
  Pencil,
  Trash2,
  Users,
  MapPin,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { getJobs, changeJobStatus, deleteJob, getBilling } from "@/services/recruiterAPI";
import DashboardSkeleton from "@/components/recruiter/DashboardSkeleton";
import notify from "@/utils/notify";
import "@/styles/RecruiterLayout.css";
import "@/styles/RecruiterDashboard.css";

const STATUS_BADGE = {
  draft: "rx-badge-gray",
  published: "rx-badge-green",
  open: "rx-badge-green",
  paused: "rx-badge-amber",
  closed: "rx-badge-red",
  archived: "rx-badge-gray",
};

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const load = () => {
    getJobs()
      .then(setJobs)
      .finally(() => setLoading(false));
    getBilling()
      .then((d) => setUsage(d.usage))
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await changeJobStatus(id, status);
      notify.success(`Job marked as ${status}`);
      load();
    } catch (e) {
      if (!e.response) {
        notify.error("Network error — could not reach server. Refresh and try again.");
        return;
      }
      notify.error(e.response?.data?.message || `Failed to update job status`);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the job "${title}"?`)) return;
    try {
      await deleteJob(id);
      notify.success("Job deleted successfully");
      load();
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed to delete job");
    }
  };

  const publishedCount = jobs.filter((j) => ["published", "open"].includes(j.status)).length;
  const draftCount = jobs.filter((j) => j.status === "draft").length;
  const pausedCount = jobs.filter((j) => ["paused", "closed"].includes(j.status)).length;

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !search.trim() ||
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.role?.toLowerCase().includes(search.toLowerCase()) ||
      job.department?.toLowerCase().includes(search.toLowerCase()) ||
      job.location?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "published" && ["published", "open"].includes(job.status)) ||
      (filter === "draft" && job.status === "draft") ||
      (filter === "paused" && ["paused", "closed"].includes(job.status));

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <RecruiterLayout title="Jobs">
        <DashboardSkeleton />
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout title="Jobs">
      <div className="rx-jobs-container">
        {/* Header Row */}
        <div className="rx-jobs-header">
          <div>
            <h1 className="rx-jobs-title">My Jobs</h1>
            <p className="rx-jobs-subtitle">
              Manage your job openings, track candidate pipelines, and publish new roles.
            </p>
          </div>
          <Link to="/recruiter/jobs/new" className="rx-btn rx-btn-primary rx-post-job-btn">
            <PlusCircle size={16} /> Create Job
          </Link>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="rx-jobs-stats-grid">
          <div className="rx-job-stat-card">
            <div className="rx-job-stat-icon rx-job-stat-icon--total">
              <Briefcase size={18} />
            </div>
            <div className="rx-job-stat-body">
              <span className="rx-job-stat-val">{jobs.length}</span>
              <span className="rx-job-stat-lbl">Total Jobs</span>
            </div>
          </div>

          <div className="rx-job-stat-card">
            <div className="rx-job-stat-icon rx-job-stat-icon--active">
              <CheckCircle size={18} />
            </div>
            <div className="rx-job-stat-body">
              <span className="rx-job-stat-val">{publishedCount}</span>
              <span className="rx-job-stat-lbl">Active & Published</span>
            </div>
          </div>

          <div className="rx-job-stat-card">
            <div className="rx-job-stat-icon rx-job-stat-icon--draft">
              <FileText size={18} />
            </div>
            <div className="rx-job-stat-body">
              <span className="rx-job-stat-val">{draftCount}</span>
              <span className="rx-job-stat-lbl">Draft Jobs</span>
            </div>
          </div>

          <div className="rx-job-stat-card">
            <div className="rx-job-stat-icon rx-job-stat-icon--quota">
              <Sparkles size={18} />
            </div>
            <div className="rx-job-stat-body">
              <span className="rx-job-stat-val">
                {usage?.jobPostsThisMonth || 0}
                <span className="rx-job-stat-max">
                  {usage?.jobPostsLimit < 0 ? " / ∞" : ` / ${usage?.jobPostsLimit || 0}`}
                </span>
              </span>
              <span className="rx-job-stat-lbl">Monthly Posts</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="rx-jobs-controls-card">
          <div className="rx-jobs-search-wrap">
            <Search size={16} className="rx-search-icon" />
            <input
              type="text"
              className="rx-jobs-search-input"
              placeholder="Search jobs by title, role, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="rx-jobs-filter-tabs">
            <button
              type="button"
              className={`rx-filter-tab ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({jobs.length})
            </button>
            <button
              type="button"
              className={`rx-filter-tab ${filter === "published" ? "active" : ""}`}
              onClick={() => setFilter("published")}
            >
              Published ({publishedCount})
            </button>
            <button
              type="button"
              className={`rx-filter-tab ${filter === "draft" ? "active" : ""}`}
              onClick={() => setFilter("draft")}
            >
              Drafts ({draftCount})
            </button>
            <button
              type="button"
              className={`rx-filter-tab ${filter === "paused" ? "active" : ""}`}
              onClick={() => setFilter("paused")}
            >
              Paused ({pausedCount})
            </button>
          </div>
        </div>

        {/* Content: Empty State or Jobs Table */}
        {filteredJobs.length === 0 ? (
          <div className="rx-jobs-empty-card">
            <div className="rx-jobs-empty-circle">
              <Briefcase size={24} strokeWidth={1.8} />
            </div>
            <h3 className="rx-jobs-empty-title">
              {jobs.length === 0 ? "You Haven't Posted Any Jobs Yet" : "No Matching Jobs Found"}
            </h3>
            <p className="rx-jobs-empty-desc">
              {jobs.length === 0
                ? "Create your first job opening and let PreepX find and match qualified candidates with AI."
                : "Try adjusting your search query or switching filters to see other job listings."}
            </p>
            {jobs.length === 0 ? (
              <Link to="/recruiter/jobs/new" className="rx-btn rx-btn-primary rx-btn-lg">
                <PlusCircle size={16} /> Create Job
              </Link>
            ) : (
              <button
                type="button"
                className="rx-btn rx-btn-secondary"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="rx-card rx-jobs-table-card">
            <div className="rx-jobs-table-wrap">
              <table className="rx-table rx-jobs-list-table">
                <thead>
                  <tr>
                    <th>Job Role & Title</th>
                    <th>Location / Mode</th>
                    <th>Status</th>
                    <th>Candidates</th>
                    <th>Shortlisted</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job._id}>
                      <td>
                        <Link to={`/recruiter/jobs/${job._id}`} className="rx-table-job-link">
                          {job.title}
                        </Link>
                        <span className="rx-table-job-sub">
                          {job.role} {job.department ? `· ${job.department}` : ""}
                        </span>
                      </td>
                      <td>
                        <span className="rx-location-chip">
                          <MapPin size={13} /> {job.location || job.workMode || "Remote"}
                        </span>
                      </td>
                      <td>
                        <span className={`rx-badge ${STATUS_BADGE[job.status] || "rx-badge-gray"}`}>
                          {job.status}
                        </span>
                      </td>
                      <td>
                        <span className="rx-count-chip">
                          <Users size={13} /> {job.candidateCount || 0}
                        </span>
                      </td>
                      <td>
                        <span className="rx-count-chip rx-count-chip--shortlisted">
                          {job.shortlistedCount || 0}
                        </span>
                      </td>
                      <td>
                        <div className="rx-table-action-btns">
                          {job.status === "draft" && (
                            <button
                              type="button"
                              className="rx-btn rx-btn-sm rx-btn-secondary"
                              onClick={() => handleStatusChange(job._id, "published")}
                              title="Publish Job"
                            >
                              <PlayCircle size={14} /> Publish
                            </button>
                          )}
                          {["published", "open"].includes(job.status) && (
                            <button
                              type="button"
                              className="rx-btn rx-btn-sm rx-btn-secondary"
                              onClick={() => handleStatusChange(job._id, "paused")}
                              title="Pause Job"
                            >
                              <PauseCircle size={14} /> Pause
                            </button>
                          )}
                          <Link
                            to={`/recruiter/jobs/${job._id}`}
                            className="rx-btn-icon"
                            title="View Job Details"
                          >
                            <Eye size={15} />
                          </Link>
                          <Link
                            to={`/recruiter/jobs/${job._id}/edit`}
                            className="rx-btn-icon"
                            title="Edit Job"
                          >
                            <Pencil size={15} />
                          </Link>
                          <button
                            type="button"
                            className="rx-btn-icon rx-btn-icon--danger"
                            onClick={() => handleDelete(job._id, job.title)}
                            title="Delete Job"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </RecruiterLayout>
  );
}
