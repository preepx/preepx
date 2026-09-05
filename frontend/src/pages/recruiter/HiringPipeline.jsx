import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Sparkles,
  Search,
  CheckCircle2,
  FileCheck,
  Bot
} from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { getJobs, getPipeline, movePipeline } from "@/services/recruiterAPI";
import DashboardSkeleton from "@/components/recruiter/DashboardSkeleton";
import notify from "@/utils/notify";
import SendTestModal from "@/components/recruiter/SendTestModal";
import '@/styles/RecruiterLayout.css';

export default function HiringPipeline() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [pipeline, setPipeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingAppId, setUpdatingAppId] = useState(null);
  const [search, setSearch] = useState("");
  const [jobsFetched, setJobsFetched] = useState(false);
  const [sendTestApp, setSendTestApp] = useState(null);

  let jobId = searchParams.get("jobId") || "";
  if (jobId === "undefined" || jobId === "null") jobId = "";

  useEffect(() => {
    getJobs().then((j) => {
      setJobs(j || []);
      setJobsFetched(true);
      if (!jobId && j && j[0]) setSearchParams({ jobId: j[0]._id });
    });
  }, []);

  const loadPipeline = (jid) => {
    if (!jid) return;
    setLoading(true);
    getPipeline(jid)
      .then((data) => setPipeline(data))
      .catch((e) => notify.error(e.response?.data?.message || "Failed to load pipeline"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!jobId) {
      if (jobsFetched && jobs.length === 0) setLoading(false);
      return;
    }
    loadPipeline(jobId);
  }, [jobId, jobsFetched]);

  const handleMove = async (appId, targetStage, currentStage) => {
    if (targetStage === currentStage) return;

    const previousPipeline = JSON.parse(JSON.stringify(pipeline));
    setUpdatingAppId(appId);

    try {
      const newStages = { ...pipeline.stages };
      let movedItem = null;

      for (const st in newStages) {
        const idx = (newStages[st] || []).findIndex((a) => a._id === appId);
        if (idx !== -1) {
          movedItem = { ...newStages[st][idx], status: targetStage };
          newStages[st] = newStages[st].filter((a) => a._id !== appId);
          break;
        }
      }

      if (movedItem) {
        if (!newStages[targetStage]) newStages[targetStage] = [];
        newStages[targetStage].unshift(movedItem);
        setPipeline({ ...pipeline, stages: newStages });
      }

      await movePipeline(appId, targetStage);
      notify.success(`Moved candidate to ${targetStage.replace(/_/g, " ")}`);
    } catch (e) {
      setPipeline(previousPipeline);
      notify.error(e.response?.data?.message || "Cannot move candidate to this stage");
    } finally {
      setUpdatingAppId(null);
    }
  };

  const filterApps = (apps = []) => {
    if (!search.trim()) return apps;
    const q = search.toLowerCase();
    return apps.filter(
      (a) =>
        a.userId?.fullName?.toLowerCase().includes(q) ||
        a.userId?.email?.toLowerCase().includes(q) ||
        a.matchedSkills?.some((s) => s.toLowerCase().includes(q))
    );
  };

  const allApps = pipeline ? [
    ...(pipeline.stages.applied || []),
    ...(pipeline.stages.shortlisted || []),
    ...(pipeline.stages.assessment_sent || []),
    ...(pipeline.stages.ai_interview || []),
    ...(pipeline.stages.interview || []),
    ...(pipeline.stages.offered || [])
  ] : [];

  return (
    <RecruiterLayout title="Applications">
      <style>{`
        .rx-tag-pill {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>

      <div className="rx-section-head" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", width: "100%" }}>
          <select
            value={jobId}
            onChange={(e) => setSearchParams({ jobId: e.target.value })}
            className="rx-premium-input"
            style={{ width: "auto", minWidth: 260 }}
          >
            <option value="">Select a Job</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title} ({j.role})
              </option>
            ))}
          </select>

          <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              placeholder="Search candidate name or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rx-premium-input"
              style={{ width: "100%", paddingLeft: 36 }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : !pipeline ? (
        <div className="rx-card rx-empty">Please select a job to view applications.</div>
      ) : (
        <div className="rx-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="rx-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Match Score</th>
                <th>Assessment</th>
                <th>AI Interview</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filterApps(allApps).map((app) => (
                <tr key={app._id} style={{ opacity: updatingAppId === app._id ? 0.5 : 1 }}>
                  <td>
                    <strong style={{ fontSize: 14, color: "var(--text)", display: "block" }}>
                      {app.userId?.fullName || "Candidate"}
                    </strong>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                      <span className={`rx-badge ${app.status === 'applied' ? 'rx-badge-blue' : app.status === 'shortlisted' ? 'rx-badge-amber' : 'rx-badge-green'}`} style={{ fontSize: 10 }}>
                        {app.status.replace("_", " ").toUpperCase()}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {app.userId?.email || "No email"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="rx-tag-pill" style={{ background: "color-mix(in srgb, var(--primary) 10%, transparent)", color: "var(--primary)", border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)" }}>
                      <Sparkles size={12} /> {app.matchScore}%
                    </span>
                  </td>
                  <td>
                    {app.assessmentId?.overallScore != null ? (
                      <span className="rx-tag-pill" style={{ background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}>
                        <FileCheck size={12} /> {app.assessmentId.overallScore}%
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: 12 }}>N/A</span>
                    )}
                  </td>
                  <td>
                    {app.aiInterviewScore > 0 ? (
                      <span className="rx-tag-pill" style={{ background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe" }}>
                        <Bot size={12} /> {app.aiInterviewScore}%
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: 12 }}>N/A</span>
                    )}
                  </td>
                  <td style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <Link to={`/recruiter/candidates/${app._id}`} className="rx-btn rx-btn-secondary" style={{ fontSize: 12, padding: "6px 12px", height: "auto" }}>
                      Profile
                    </Link>
                    
                    {app.status === "applied" && (
                      <button type="button" className="rx-btn rx-btn-primary" style={{ fontSize: 12, padding: "6px 12px", height: "auto" }} onClick={() => handleMove(app._id, "shortlisted", app.status)}>
                        Shortlist
                      </button>
                    )}

                    {app.status === "shortlisted" && (
                      <button type="button" className="rx-btn rx-btn-primary" style={{ fontSize: 12, padding: "6px 12px", height: "auto" }} onClick={() => setSendTestApp(app)}>
                        Send Test
                      </button>
                    )}

                    <button type="button" className="rx-btn rx-btn-ghost" style={{ fontSize: 12, padding: "6px 12px", height: "auto", color: "var(--error)" }} onClick={() => handleMove(app._id, "rejected", app.status)}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {filterApps(allApps).length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    No candidates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <SendTestModal
        isOpen={!!sendTestApp}
        onClose={() => setSendTestApp(null)}
        targetApp={sendTestApp}
        targetJobId={jobId}
        jobs={jobs}
        onSuccess={() => loadPipeline(jobId)}
      />
    </RecruiterLayout>
  );
}
