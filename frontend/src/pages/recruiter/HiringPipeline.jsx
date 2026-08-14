import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { getJobs, getPipeline, movePipeline } from "@/services/recruiterAPI";
import Loader from "@/components/Loader";
import notify from "@/utils/notify";
import '@/styles/RecruiterLayout.css';

const STAGES = ["matched", "assessment_sent", "shortlisted", "ai_interview", "interview", "selected", "offered", "hired"];

export default function HiringPipeline() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [pipeline, setPipeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const jobId = searchParams.get("jobId") || "";

  useEffect(() => { getJobs().then((j) => { setJobs(j); if (!jobId && j[0]) setSearchParams({ jobId: j[0]._id }); }); }, []);
  useEffect(() => {
    if (!jobId) { setLoading(false); return; }
    setLoading(true);
    getPipeline(jobId).then(setPipeline).finally(() => setLoading(false));
  }, [jobId]);

  const handleMove = async (appId, status) => {
    try {
      await movePipeline(appId, status);
      notify.success("Candidate moved");
      getPipeline(jobId).then(setPipeline);
    } catch (e) {
      notify.error(e.response?.data?.message || "Invalid move");
    }
  };

  return (
    <RecruiterLayout title="Hiring Pipeline">
      <select value={jobId} onChange={(e) => setSearchParams({ jobId: e.target.value })} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e8ecf4", marginBottom: 20 }}>
        <option value="">Select job</option>
        {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
      </select>

      {loading ? <Loader /> : !pipeline ? (
        <div className="rx-empty">Select a job to view pipeline</div>
      ) : (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16 }}>
          {STAGES.map((stage) => (
            <div key={stage} style={{ minWidth: 220, background: "#fff", border: "1px solid #e8ecf4", borderRadius: 14, padding: 12 }}>
              <h4 style={{ margin: "0 0 12px", textTransform: "capitalize", fontSize: 13, color: "#64748b" }}>{stage.replace(/_/g, " ")}</h4>
              {(pipeline.stages[stage] || []).map((app) => (
                <div key={app._id} style={{ background: "#f8fafc", borderRadius: 10, padding: 10, marginBottom: 8, fontSize: 13 }}>
                  <strong>{app.userId?.fullName}</strong>
                  <p style={{ margin: "4px 0", color: "#64748b" }}>{app.matchScore}% match</p>
                  {STAGES.indexOf(stage) < STAGES.length - 1 && (
                    <button type="button" className="rx-btn rx-btn-ghost" style={{ fontSize: 11, padding: "4px 8px" }}
                      onClick={() => handleMove(app._id, STAGES[STAGES.indexOf(stage) + 1])}>
                      Move →
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </RecruiterLayout>
  );
}
