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
        <div style={{ display: "flex", gap: 16, flex: 1, alignItems: "center", marginBottom: 24 }}>
          <select 
            value={jobId} 
            onChange={(e) => setSearchParams({ jobId: e.target.value })} 
            className="rx-premium-input"
            style={{ width: "auto", minWidth: 200 }}
          >
            <option value="">Select job</option>
            {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
          </select>
          <input 
            placeholder="Search name, skill, role..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="rx-premium-input"
            style={{ flex: 1, maxWidth: 400 }} 
          />
        </div>
      </div>

      {loading ? <Loader /> : candidates.length === 0 ? (
        <div className="rx-card rx-empty">No candidates for this job yet. Publish the job and wait for applications, or run auto-match.</div>
      ) : (
        <div className="rx-card" style={{ padding: 0, overflow: "hidden" }}>
          <style>{`
            .rx-table-compact th { padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
            .rx-table-compact td { padding: 8px 12px; font-size: 13px; }
            .rx-match-score-compact { font-size: 14px; font-weight: 700; color: var(--primary); display: inline-flex; align-items: center; gap: 4px; }
            .rx-badge-compact { padding: 2px 6px; font-size: 11px; }
            .rx-btn-compact { padding: 4px 10px; font-size: 12px; }
          `}</style>
          <table className="rx-table rx-table-compact">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Role</th>
                <th>Match</th>
                <th>Skills</th>
                <th>Source</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.user?.fullName || c.userId?.fullName}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{c.user?.email || c.userId?.email}</div>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.user?.preferredRole || c.userId?.degree || "—"}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="rx-match-score-compact">{c.matchScore}%</span>
                      <span className="rx-badge rx-badge-blue rx-badge-compact"><Sparkles size={10} /> {c.matchLabel}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>{(c.matchedSkills || []).slice(0, 3).join(", ") || "—"}</td>
                  <td><span className={`rx-badge rx-badge-compact ${c.source === "candidate_applied" ? "rx-badge-green" : "rx-badge-gray"}`}>{c.source === "candidate_applied" ? "Applied" : "Matched"}</span></td>
                  <td><span className="rx-badge rx-badge-gray rx-badge-compact">{c.status}</span></td>
                  <td style={{ textAlign: 'right' }}><Link to={`/recruiter/candidates/${c._id}`} className="rx-btn rx-btn-secondary rx-btn-compact">View Profile</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </RecruiterLayout>
  );
}
