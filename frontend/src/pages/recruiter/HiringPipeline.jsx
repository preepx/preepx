import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  FileCheck,
  Bot,
  Calendar,
  Award,
  XCircle,
  Clock,
  Briefcase
} from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { getJobs, getPipeline, movePipeline } from "@/services/recruiterAPI";
import Loader from "@/components/Loader";
import notify from "@/utils/notify";
import '@/styles/RecruiterLayout.css';

const STAGES = [
  { key: "matched", label: "Matched", icon: Sparkles, color: "#6366f1" },
  { key: "assessment_sent", label: "Assessment Sent", icon: Clock, color: "#f59e0b" },
  { key: "shortlisted", label: "Shortlisted", icon: CheckCircle2, color: "#10b981" },
  { key: "ai_interview", label: "AI Interview", icon: Bot, color: "#8b5cf6" },
  { key: "interview", label: "Manual Interview", icon: Calendar, color: "#3b82f6" },
  { key: "offered", label: "Offered", icon: Award, color: "#ec4899" },
  { key: "hired", label: "Hired", icon: CheckCircle2, color: "#059669" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "#ef4444" },
];

export default function HiringPipeline() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [pipeline, setPipeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingAppId, setUpdatingAppId] = useState(null);
  const [draggedApp, setDraggedApp] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [search, setSearch] = useState("");
  const [jobsFetched, setJobsFetched] = useState(false);

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

    // Optimistically update local pipeline UI
    const previousPipeline = JSON.parse(JSON.stringify(pipeline));
    setUpdatingAppId(appId);

    try {
      const newStages = { ...pipeline.stages };
      let movedItem = null;

      // Find and remove from current stage
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
      setDraggedApp(null);
      setDragOverStage(null);
    }
  };

  // HTML5 Drag & Drop Handlers
  const handleDragStart = (e, app, sourceStage) => {
    setDraggedApp({ ...app, sourceStage });
    e.dataTransfer.setData("application/json", JSON.stringify({ appId: app._id, sourceStage }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, stageKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStage !== stageKey) {
      setDragOverStage(stageKey);
    }
  };

  const handleDragLeave = (e, stageKey) => {
    if (dragOverStage === stageKey) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e, targetStageKey) => {
    e.preventDefault();
    setDragOverStage(null);
    if (!draggedApp) return;
    handleMove(draggedApp._id, targetStageKey, draggedApp.sourceStage || draggedApp.status);
    setDraggedApp(null);
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

  return (
    <RecruiterLayout title="Hiring Pipeline">
      <style>{`
        .rx-kanban-board {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 24px;
          min-height: calc(100vh - 220px);
          align-items: flex-start;
        }
        .rx-kanban-column {
          flex: 0 0 300px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          max-height: calc(100vh - 220px);
          transition: all 0.2s ease;
        }
        .rx-kanban-column.drag-over {
          border: 2px dashed var(--primary);
          background: color-mix(in srgb, var(--primary) 5%, var(--surface));
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
        }
        .rx-kanban-header {
          padding: 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .rx-kanban-body {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          flex: 1;
        }
        .rx-kanban-card {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          cursor: grab;
          user-select: none;
        }
        .rx-kanban-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
          border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
        }
        .rx-kanban-card.dragging {
          opacity: 0.4;
          cursor: grabbing;
        }
        .rx-kanban-card.updating {
          pointer-events: none;
          opacity: 0.6;
        }
        .rx-tag-pill {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>

      {/* Top Filter & Search Bar */}
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

          <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
            <span>💡 <em>Drag candidate cards between columns to update stages</em></span>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : !pipeline ? (
        <div className="rx-card rx-empty">Please select a job to view the hiring pipeline.</div>
      ) : (
        <div className="rx-kanban-board">
          {STAGES.map((col) => {
            const Icon = col.icon;
            const stageApps = filterApps(pipeline.stages[col.key] || []);

            return (
              <div
                key={col.key}
                className={`rx-kanban-column ${dragOverStage === col.key ? "drag-over" : ""}`}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={(e) => handleDragLeave(e, col.key)}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                {/* Column Header */}
                <div className="rx-kanban-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
                    <Icon size={16} style={{ color: col.color }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{col.label}</span>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      background: "var(--background)",
                      padding: "2px 8px",
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {stageApps.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="rx-kanban-body">
                  {stageApps.map((app) => {
                    const isDragging = draggedApp?._id === app._id;
                    const isUpdating = updatingAppId === app._id;

                    return (
                      <div
                        key={app._id}
                        className={`rx-kanban-card ${isDragging ? "dragging" : ""} ${isUpdating ? "updating" : ""}`}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, app, col.key)}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                          <div>
                            <strong style={{ fontSize: 14, color: "var(--text)", display: "block" }}>
                              {app.userId?.fullName || "Candidate"}
                            </strong>
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                              {app.userId?.email || "No email"}
                            </span>
                          </div>
                          <span
                            className="rx-tag-pill"
                            style={{
                              background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                              color: "var(--primary)",
                              border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)",
                            }}
                          >
                            <Sparkles size={10} /> {app.matchScore}%
                          </span>
                        </div>

                        {/* Scores row */}
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {app.assessmentId?.overallScore != null && (
                            <span className="rx-tag-pill" style={{ background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}>
                              <FileCheck size={10} /> Test: {app.assessmentId.overallScore}%
                            </span>
                          )}
                          {app.aiInterviewScore > 0 && (
                            <span className="rx-tag-pill" style={{ background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe" }}>
                              <Bot size={10} /> AI: {app.aiInterviewScore}%
                            </span>
                          )}
                        </div>

                        {/* Card Footer Actions */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                          <Link
                            to={`/recruiter/candidates/${app._id}`}
                            className="rx-btn rx-btn-secondary"
                            style={{ fontSize: 11, padding: "3px 8px", height: "auto" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Profile
                          </Link>

                          {/* Quick Advance Button */}
                          {STAGES.findIndex((s) => s.key === col.key) < STAGES.length - 2 && (
                            <button
                              type="button"
                              className="rx-btn rx-btn-primary"
                              style={{ fontSize: 11, padding: "3px 8px", height: "auto" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentIdx = STAGES.findIndex((s) => s.key === col.key);
                                handleMove(app._id, STAGES[currentIdx + 1].key, col.key);
                              }}
                            >
                              Next <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {stageApps.length === 0 && (
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px dashed var(--border)",
                        borderRadius: 12,
                        color: "var(--text-muted)",
                        fontSize: 12,
                        padding: "32px 16px",
                        textAlign: "center",
                      }}
                    >
                      <span>No candidates in {col.label.toLowerCase()}</span>
                      <span style={{ fontSize: 10, marginTop: 4, opacity: 0.6 }}>Drag cards here</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </RecruiterLayout>
  );
}
