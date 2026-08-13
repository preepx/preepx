import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import RecruiterLayout from "../../layouts/RecruiterLayout";
import { discoverCandidates, getJobs } from "../../services/recruiterAPI";
import Loader from "../../components/Loader";
import "../../layouts/RecruiterLayout.css";

export default function CandidateDiscovery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const jobId = searchParams.get("jobId") || "";

  useEffect(() => {
    getJobs().then((j) => {
      setJobs(j);
      if (!jobId && j[0]) setSearchParams({ jobId: j[0]._id });
    });
  }, []);

  useEffect(() => {
    if (!jobId) { setLoading(false); return; }
    setLoading(true);
    discoverCandidates({ jobId, search, minScore: 0 })
      .then(setCandidates)
      .finally(() => setLoading(false));
  }, [jobId, search]);

  return (
    <RecruiterLayout title="Candidates">
      <div className="rx-section-head">
        <div style={{ display: "flex", gap: 12, flex: 1 }}>
          <select value={jobId} onChange={(e) => setSearchParams({ jobId: e.target.value })} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e8ecf4" }}>
            <option value="">Select job</option>
            {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
          </select>
          <input placeholder="Search name, skill, role..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 320, padding: "8px 12px", borderRadius: 10, border: "1px solid #e8ecf4" }} />
        </div>
      </div>

      {loading ? <Loader /> : candidates.length === 0 ? (
        <div className="rx-card rx-empty">No candidates for this job yet. Publish the job and wait for applications, or run auto-match.</div>
      ) : (
        <div className="rx-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="rx-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Role</th>
                <th>Match Score</th>
                <th>Skills</th>
                <th>Source</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.user?.fullName || c.userId?.fullName}</strong><br /><span style={{ fontSize: 12, color: "#64748b" }}>{c.user?.email || c.userId?.email}</span></td>
                  <td>{c.user?.preferredRole || c.userId?.degree || "—"}</td>
                  <td>
                    <span className="rx-match-score">{c.matchScore}%</span>
                    <br /><span className="rx-badge rx-badge-blue"><Sparkles size={10} /> {c.matchLabel}</span>
                  </td>
                  <td style={{ fontSize: 13 }}>{(c.matchedSkills || []).slice(0, 3).join(", ") || "—"}</td>
                  <td><span className={`rx-badge ${c.source === "candidate_applied" ? "rx-badge-green" : "rx-badge-gray"}`}>{c.source === "candidate_applied" ? "Applied" : "Matched"}</span></td>
                  <td><span className="rx-badge rx-badge-gray">{c.status}</span></td>
                  <td><Link to={`/recruiter/candidates/${c._id}`} className="rx-btn rx-btn-secondary">View Profile</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </RecruiterLayout>
  );
}
