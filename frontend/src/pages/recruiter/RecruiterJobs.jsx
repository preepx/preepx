import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { getJobs, changeJobStatus, deleteJob, getBilling } from "@/services/recruiterAPI";
import DashboardSkeleton from "@/components/recruiter/DashboardSkeleton";
import EmptyState from "@/components/recruiter/EmptyState";
import { Briefcase } from "lucide-react";
import notify from "@/utils/notify";
import '@/styles/RecruiterLayout.css';

const STATUS_BADGE = {
  draft: "rx-badge-gray", published: "rx-badge-green", open: "rx-badge-green",
  paused: "rx-badge-amber", closed: "rx-badge-red", archived: "rx-badge-gray",
};

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState(null);

  const load = () => {
    getJobs().then(setJobs).finally(() => setLoading(false));
    getBilling().then((d) => setUsage(d.usage)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const handlePublish = async (id) => {
    try {
      await changeJobStatus(id, "published");
      notify.success("Job published");
      load();
    } catch (e) {
      if (!e.response) {
        notify.error("Network error — could not reach server. Refresh and try again.");
        return;
      }
      notify.error(e.response?.data?.message || "Failed to publish job");
    }
  };

  if (loading) return <RecruiterLayout title="Jobs"><DashboardSkeleton /></RecruiterLayout>;

  return (
    <RecruiterLayout title="Jobs">
      <div className="rx-section-head">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h2 style={{ margin: 0, color: "var(--text)" }}>My Jobs</h2>
          <span className="rx-badge rx-badge-blue" style={{ fontSize: "14px", padding: "4px 10px" }}>
            {jobs.length} Uploaded
          </span>
        </div>
        <Link to="/recruiter/jobs/new" className="rx-btn rx-btn-primary"><PlusCircle size={16} /> Post Job</Link>
      </div>
      {usage && (
        <div className="rx-card" style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14 }}>
            Job posts this month: <strong>{usage.jobPostsThisMonth || 0}</strong>
            {usage.jobPostsLimit < 0 ? " / Unlimited" : ` / ${usage.jobPostsLimit || 0}`}
          </span>
          <Link to="/recruiter/billing" className="rx-btn rx-btn-ghost">Manage plan</Link>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="rx-card">
          <EmptyState
            icon={Briefcase}
            title="No jobs posted yet"
            description="Create your first job and let PreepX find the best candidates for you."
            actionLabel="Create Job"
            actionTo="/recruiter/jobs/new"
          />
        </div>
      ) : (
        <div className="rx-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="rx-table">
            <thead><tr><th>Job</th><th>Status</th><th>Candidates</th><th>Shortlisted</th><th>Actions</th></tr></thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id}>
                  <td><Link to={`/recruiter/jobs/${job._id}`} style={{ fontWeight: 600, color: "inherit" }}>{job.title}</Link><br /><span style={{ fontSize: 12, color: "#64748b" }}>{job.role}</span></td>
                  <td><span className={`rx-badge ${STATUS_BADGE[job.status] || "rx-badge-gray"}`}>{job.status}</span></td>
                  <td>{job.candidateCount || 0}</td>
                  <td>{job.shortlistedCount || 0}</td>
                  <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {job.status === "draft" && <button type="button" className="rx-btn rx-btn-secondary" onClick={() => handlePublish(job._id)}>Publish</button>}
                    {job.status === "published" && <button type="button" className="rx-btn rx-btn-ghost" onClick={() => changeJobStatus(job._id, "paused").then(load)}>Pause</button>}
                    <Link to={`/recruiter/jobs/${job._id}/edit`} className="rx-btn rx-btn-ghost">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </RecruiterLayout>
  );
}
