import React, { useEffect, useState } from "react";
import { getJobs, getApplications } from "@/services/recruiterAPI";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import Loader from "@/components/Loader";
import { Link } from "react-router-dom";
import '@/styles/RecruiterLayout.css';

export default function RecruiterAssessments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const jobs = await getJobs();
        const all = [];
        for (const job of jobs.slice(0, 20)) {
          const apps = await getApplications(job._id);
          apps.filter((a) => a.assessmentId || ["assessment_sent", "assessment_in_progress", "assessment_completed"].includes(a.status))
            .forEach((a) => all.push({ ...a, jobTitle: job.title }));
        }
        setRows(all);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <RecruiterLayout title="Assessments">
      {loading ? <Loader /> : rows.length === 0 ? (
        <div className="rx-card rx-empty">No assessments sent yet. Send from a candidate profile.</div>
      ) : (
        <div className="rx-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="rx-table">
            <thead><tr><th>Candidate</th><th>Job</th><th>Status</th><th>Score</th><th></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td>{r.userId?.fullName}</td>
                  <td>{r.jobTitle}</td>
                  <td><span className="rx-badge rx-badge-gray">{r.status}</span></td>
                  <td>{r.assessmentId?.overallScore != null ? `${r.assessmentId.overallScore}%` : "—"}</td>
                  <td><Link to={`/recruiter/candidates/${r._id}`} className="rx-btn rx-btn-secondary">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </RecruiterLayout>
  );
}
