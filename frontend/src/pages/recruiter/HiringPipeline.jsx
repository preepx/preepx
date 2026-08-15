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
  const [jobsFetched, setJobsFetched] = useState(false);
  let jobId = searchParams.get("jobId") || "";
  if (jobId === "undefined" || jobId === "null") jobId = "";

  useEffect(() => {
    getJobs().then((j) => {
      setJobs(j);
      setJobsFetched(true);
      if (!jobId && j[0]) setSearchParams({ jobId: j[0]._id });
    });
  }, []);

  useEffect(() => {
    if (!jobId) {
      if (jobsFetched && jobs.length === 0) setLoading(false);
      return;
    }
    setLoading(true);
    getPipeline(jobId).then(setPipeline).finally(() => setLoading(false));
  }, [jobId, jobsFetched, jobs.length]);

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
      <div className="rx-section-head">
        <select 
          value={jobId} 
          onChange={(e) => setSearchParams({ jobId: e.target.value })} 
          className="rx-premium-input" 
          style={{ width: "auto", minWidth: 250, marginBottom: 20 }}
        >
          <option value="">Select job</option>
          {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
        </select>
      </div>

      {loading ? <Loader /> : !pipeline ? (
        <div className="rx-empty">Select a job to view pipeline</div>
      ) : (
        <>
        <style>{`
          .rx-pipeline-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            padding-bottom: 16px;
            min-height: 60vh;
          }
          @media (max-width: 900px) {
            .rx-pipeline-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (max-width: 600px) {
            .rx-pipeline-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
        <div className="rx-pipeline-grid">
          {STAGES.map((stage) => (
            <div key={stage} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, textTransform: "capitalize", fontSize: 14, fontWeight: 600, color: "var(--text-muted)" }}>{stage.replace(/_/g, " ")}</h4>
                <span style={{ fontSize: 12, background: "var(--background)", color: "var(--text-muted)", padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                  {(pipeline.stages[stage] || []).length}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {(pipeline.stages[stage] || []).map((app) => (
                  <div key={app._id} style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'grab' }}>
                    <strong style={{ fontSize: 14, color: "var(--text)" }}>{app.userId?.fullName || "Unknown Candidate"}</strong>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--surface)", padding: '2px 8px', borderRadius: 4 }}>
                        {app.matchScore}% Match
                      </span>
                      {STAGES.indexOf(stage) < STAGES.length - 1 && (
                        <button type="button" className="rx-btn rx-btn-secondary" style={{ fontSize: 11, padding: "4px 10px", height: 'auto', minHeight: 'unset' }}
                          onClick={() => handleMove(app._id, STAGES[STAGES.indexOf(stage) + 1])}>
                          Move &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {(pipeline.stages[stage] || []).length === 0 && (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>
                    Empty
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </RecruiterLayout>
  );
}
