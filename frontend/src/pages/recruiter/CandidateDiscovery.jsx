import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  Download,
  CheckSquare,
  Square,
  Star,
  XCircle,
  Send,
  Bot,
  ArrowRight,
  Filter,
  CheckCircle2,
  FileCheck,
  Target,
  FileText,
  Video,
  Flag,
  Layers,
} from "lucide-react";
import Swal from "sweetalert2";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { discoverCandidates, getJobs, bulkCandidateAction } from "@/services/recruiterAPI";
import { exportCandidatesToCSV } from "@/utils/exportCSV";
import DashboardSkeleton from "@/components/recruiter/DashboardSkeleton";
import notify from "@/utils/notify";
import '@/styles/RecruiterLayout.css';

const STAGE_OPTIONS = [
  { value: "matched", label: "Matched" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "assessment_sent", label: "Assessment Sent" },
  { value: "ai_interview", label: "AI Interview" },
  { value: "interview", label: "Manual Interview" },
  { value: "offered", label: "Offered" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

const STAGE_LABELS = {
  applied: "Applied",
  matched: "Matched",
  shortlisted: "Shortlisted",
  assessment_sent: "Assessment Sent",
  assessment_in_progress: "Assessment In Progress",
  assessment_completed: "Assessment Completed",
  ai_interview: "AI Interview",
  interview: "Interview",
  selected: "Selected",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
};

export default function CandidateDiscovery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsFetched, setJobsFetched] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [targetStage, setTargetStage] = useState("");
  const [expandedSkills, setExpandedSkills] = useState({});

  const toggleSkills = (id) => {
    setExpandedSkills((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  let jobId = searchParams.get("jobId") || "";
  if (jobId === "undefined" || jobId === "null") jobId = "";

  useEffect(() => {
    getJobs().then((j) => {
      setJobs(j || []);
      setJobsFetched(true);
      if (!jobId && j && j.length > 0) {
        const saved = sessionStorage.getItem("lastRecruiterJobId");
        const matched = saved && j.find((x) => x._id === saved);
        const defaultJobId = matched ? matched._id : j[0]._id;
        setSearchParams({ jobId: defaultJobId });
      } else if (jobId) {
        sessionStorage.setItem("lastRecruiterJobId", jobId);
      }
    });
  }, []);

  const loadCandidates = (jid) => {
    if (!jid) return;
    setLoading(true);
    discoverCandidates({ jobId: jid, search, minScore: 0 })
      .then((data) => {
        setCandidates(data || []);
        setSelectedIds([]);
      })
      .catch((e) => notify.error(e.response?.data?.message || "Failed to load candidates"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!jobId) {
      if (jobsFetched && jobs.length === 0) setLoading(false);
      return;
    }
    loadCandidates(jobId);
  }, [jobId, search, jobsFetched]);

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map((c) => c._id));
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk action handler
  const executeBulkAction = async (action, extraData = {}) => {
    if (selectedIds.length === 0) {
      notify.warn("Please select at least one candidate");
      return;
    }

    if (action === "reject") {
      const confirm = await Swal.fire({
        title: "Reject Selected Candidates?",
        text: `Are you sure you want to reject ${selectedIds.length} candidate(s)?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Yes, Reject Candidates",
      });
      if (!confirm.isConfirmed) return;
    }

    setBulkLoading(true);
    try {
      const res = await bulkCandidateAction({
        applicationIds: selectedIds,
        action,
        ...extraData,
      });

      if (res.failCount > 0) {
        notify.info(`Processed: ${res.successCount} succeeded, ${res.failCount} skipped/failed`);
      } else {
        notify.success(`Successfully updated ${res.successCount} candidate(s)`);
      }
      setSelectedIds([]);
      loadCandidates(jobId);
    } catch (e) {
      notify.error(e.response?.data?.message || "Bulk action failed");
    } finally {
      setBulkLoading(false);
    }
  };

  // CSV Export Handler
  const handleExportCSV = (exportOnlySelected = false) => {
    const listToExport = exportOnlySelected
      ? candidates.filter((c) => selectedIds.includes(c._id))
      : candidates;

    if (!listToExport.length) {
      notify.warn("No candidates to export");
      return;
    }

    const currentJob = jobs.find((j) => j._id === jobId);
    const filename = `preepx_candidates_${(currentJob?.title || "all").replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    exportCandidatesToCSV(listToExport, filename);
    notify.success(`Exported ${listToExport.length} candidate(s) to CSV`);
  };

  const isAllSelected = candidates.length > 0 && selectedIds.length === candidates.length;

  return (
    <RecruiterLayout title="Candidates">
      <style>{`
        .rx-bulk-dock {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--surface);
          border: 1px solid var(--border);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
          border-radius: 100px;
          padding: 8px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 1000;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { transform: translate(-50%, 40px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .rx-table-bulk-checkbox {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      {/* Top Filter and Search Bar */}
      <div className="rx-section-head" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", width: "100%", alignItems: "center" }}>
          <select
            value={jobId}
            onChange={(e) => {
              const newJobId = e.target.value;
              setSearchParams(newJobId ? { jobId: newJobId } : {});
              if (newJobId) sessionStorage.setItem("lastRecruiterJobId", newJobId);
            }}
            className="rx-premium-input"
            style={{ width: "auto", minWidth: 220 }}
          >
            <option value="">Select Job</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title}
              </option>
            ))}
          </select>

          <input
            placeholder="Search candidate name, skill, education..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rx-premium-input"
            style={{ flex: 1, minWidth: 240, maxWidth: 400 }}
          />

          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            {selectedIds.length > 0 && (
              <button
                type="button"
                className="rx-btn rx-btn-secondary"
                onClick={() => handleExportCSV(true)}
                title="Export Selected Candidates"
              >
                <Download size={15} /> Export Selected ({selectedIds.length})
              </button>
            )}
            <button
              type="button"
              className="rx-btn rx-btn-secondary"
              onClick={() => handleExportCSV(false)}
              title="Export All Filtered Candidates"
            >
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : candidates.length === 0 ? (
        <div className="rx-card rx-empty">
          No candidates found for this job. Publish the job to attract applicants or run auto-matching.
        </div>
      ) : (
        <>
          {/* 1. TABLE VIEW (FOR LAPTOP & TABLET - Matches Image 2) */}
          <div className="rx-discovery-table-view">
            <div className="rx-card rx-candidate-table-card">
              <table className="rx-table rx-candidate-table">
                <thead>
                  <tr>
                    <th className="rx-col-check">
                      <div
                        className="rx-table-bulk-checkbox"
                        onClick={handleToggleSelectAll}
                        title={isAllSelected ? "Deselect All" : "Select All"}
                      >
                        {isAllSelected ? (
                          <CheckSquare size={17} color="#0f172a" strokeWidth={2.3} />
                        ) : (
                          <Square size={17} color="#94a3b8" strokeWidth={1.8} />
                        )}
                      </div>
                    </th>
                    <th className="rx-col-cand">Candidate</th>
                    <th className="rx-col-match">Match Score</th>
                    <th className="rx-col-skills">Key Skills</th>
                    <th className="rx-col-assess">Assessment</th>
                    <th className="rx-col-ai">AI Interview</th>
                    <th className="rx-col-stage">Stage</th>
                    <th className="rx-col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => {
                    const isSelected = selectedIds.includes(c._id);
                    const user = c.user || c.userId || {};
                    const headline =
                      user.preferredRole ||
                      [user.degree, user.college].filter(Boolean).join(" | ") ||
                      user.bio ||
                      "";

                    const hasAssessmentScore =
                      c.assessmentId?.overallScore != null ||
                      (c.assessmentScore != null && c.assessmentScore > 0);
                    const assessmentScoreVal =
                      c.assessmentId?.overallScore ?? c.assessmentScore;
                    const isAssessmentSent =
                      c.status === "assessment_sent" ||
                      c.status === "assessment_in_progress" ||
                      Boolean(c.assessmentId);

                    const hasAiScore = c.aiInterviewScore != null && c.aiInterviewScore > 0;
                    const stageLabel =
                      STAGE_LABELS[c.status] || (c.status || "Matched").replace(/_/g, " ");

                    const rawSkills =
                      c.matchedSkills && c.matchedSkills.length > 0
                        ? c.matchedSkills
                        : user.skills && user.skills.length > 0
                          ? user.skills
                          : [];

                    return (
                      <tr
                        key={c._id}
                        className={`rx-cand-tr ${isSelected ? "selected" : ""}`}
                        style={{
                          background: isSelected
                            ? "color-mix(in srgb, #2563eb 5%, transparent)"
                            : undefined,
                        }}
                      >
                        <td className="rx-col-check">
                          <div
                            className="rx-table-bulk-checkbox"
                            onClick={() => handleToggleSelectOne(c._id)}
                          >
                            {isSelected ? (
                              <CheckSquare size={17} color="#2563eb" strokeWidth={2.3} />
                            ) : (
                              <Square size={17} color="#94a3b8" strokeWidth={1.8} />
                            )}
                          </div>
                        </td>
                        <td className="rx-col-cand">
                          <div className="rx-cand-name">
                            {user.fullName || "Candidate"}
                          </div>
                          <div className="rx-cand-email">
                            {user.email || "No email"}
                          </div>
                          {headline && (
                            <div className="rx-cand-headline" title={headline}>
                              {headline}
                            </div>
                          )}
                        </td>
                        <td className="rx-col-match">
                          <div className="rx-match-wrap">
                            <span className="rx-match-score-val">
                              {c.matchScore || 0}%
                            </span>
                            <span className="rx-badge rx-badge-blue rx-match-badge">
                              <Sparkles size={10} /> Match
                            </span>
                          </div>
                        </td>
                        <td className="rx-col-skills">
                          <div className="rx-skills-chips-wrap">
                            {rawSkills.slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                className="rx-table-skill-chip"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="rx-col-assess">
                          {hasAssessmentScore ? (
                            <span className="rx-badge rx-badge-green">
                              <FileCheck size={11} /> {assessmentScoreVal}%
                            </span>
                          ) : isAssessmentSent ? (
                            <span className="rx-badge rx-badge-blue">
                              Sent
                            </span>
                          ) : (
                            <span className="rx-dash">—</span>
                          )}
                        </td>
                        <td className="rx-col-ai">
                          {hasAiScore ? (
                            <span className="rx-badge rx-badge-blue">
                              <Bot size={11} /> {c.aiInterviewScore}%
                            </span>
                          ) : (
                            <span className="rx-dash">—</span>
                          )}
                        </td>
                        <td className="rx-col-stage">
                          <span className="rx-badge rx-badge-gray rx-stage-badge">
                            {stageLabel}
                          </span>
                        </td>
                        <td className="rx-col-actions">
                          <Link
                            to={jobId ? `/recruiter/candidates/${c._id}?jobId=${jobId}` : `/recruiter/candidates/${c._id}`}
                            state={{ fromJobId: jobId }}
                            className="rx-btn rx-btn-secondary rx-table-action-btn"
                          >
                            View Profile
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. CARD VIEW (FOR MOBILE - Matches Image 3) */}
          <div className="rx-discovery-cards-view">
            <div className="rx-discovery-wrap">
              {/* Header Bar */}
              <div className="rx-discovery-header">
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    className="rx-table-bulk-checkbox"
                    onClick={handleToggleSelectAll}
                    title={isAllSelected ? "Deselect All" : "Select All"}
                  >
                    {isAllSelected ? (
                      <CheckSquare size={19} color="#0f172a" strokeWidth={2.3} />
                    ) : (
                      <Square size={19} color="#0f172a" strokeWidth={2} />
                    )}
                  </div>
                  <span className="rx-discovery-header-title">Candidate</span>
                </div>
                <span className="rx-discovery-header-title">Actions</span>
              </div>

              {/* Rows */}
              <div>
                {candidates.map((c) => {
                  const isSelected = selectedIds.includes(c._id);
                  const user = c.user || c.userId || {};
                  const headline =
                    user.preferredRole ||
                    [user.degree, user.college].filter(Boolean).join(" | ") ||
                    user.bio ||
                    "";

                  const assessmentLabel =
                    c.assessmentId?.overallScore != null
                      ? `${c.assessmentId.overallScore}%`
                      : c.assessmentScore != null && c.assessmentScore > 0
                        ? `${c.assessmentScore}%`
                        : c.status === "assessment_sent" || c.status === "assessment_in_progress" || c.assessmentId
                          ? "Sent"
                          : "—";

                  const hasAiScore = c.aiInterviewScore != null && c.aiInterviewScore > 0;
                  const stageLabel = STAGE_LABELS[c.status] || (c.status || "Matched").replace(/_/g, " ");

                  const rawSkills =
                    c.matchedSkills && c.matchedSkills.length > 0
                      ? c.matchedSkills
                      : user.skills && user.skills.length > 0
                        ? user.skills
                        : [];
                  const isExpanded = !!expandedSkills[c._id];
                  const visibleSkills = isExpanded ? rawSkills : rawSkills.slice(0, 3);
                  const hasMoreSkills = rawSkills.length > 3;

                  return (
                    <div
                      key={c._id}
                      className={`rx-discovery-row ${isSelected ? "selected" : ""}`}
                    >
                      <div className="rx-discovery-main">
                        <div
                          className="rx-table-bulk-checkbox"
                          onClick={() => handleToggleSelectOne(c._id)}
                          style={{ marginTop: 2 }}
                        >
                          {isSelected ? (
                            <CheckSquare size={19} color="#0f172a" strokeWidth={2.3} />
                          ) : (
                            <Square size={19} color="#94a3b8" strokeWidth={1.8} />
                          )}
                        </div>

                        <div className="rx-discovery-info">
                          <div className="rx-discovery-name">
                            {user.fullName || "Candidate"}
                          </div>
                          <div className="rx-discovery-email">
                            {user.email || "No email"}
                          </div>
                          {headline && (
                            <div className="rx-discovery-headline">
                              {headline}
                            </div>
                          )}

                          <div className="rx-discovery-badges">
                            <span className="rx-pill rx-pill-match">
                              <Target size={13} strokeWidth={2} color="#0f172a" />
                              <span>Match Score: {c.matchScore || 0}%</span>
                            </span>

                            <span className="rx-pill rx-pill-blue">
                              <FileText size={13} strokeWidth={2} color="#475569" />
                              <span>Assessment: {assessmentLabel}</span>
                            </span>

                            {hasAiScore ? (
                              <span className="rx-pill rx-pill-ai-score">
                                <Bot size={13} strokeWidth={2} color="#0f172a" />
                                <span>AI Interview: {c.aiInterviewScore}%</span>
                              </span>
                            ) : (
                              <span className="rx-pill rx-pill-blue">
                                <Video size={13} strokeWidth={2} color="#475569" />
                                <span>AI Interview: —</span>
                              </span>
                            )}

                            <span className="rx-pill rx-pill-blue">
                              <Flag size={13} strokeWidth={2} color="#475569" />
                              <span>Stage: {stageLabel}</span>
                            </span>
                          </div>

                          {rawSkills.length > 0 && (
                            <div className="rx-discovery-skills-row">
                              <span className="rx-skills-label">
                                <Layers size={13} color="#475569" strokeWidth={2} />
                                <span>Key Skills:</span>
                              </span>

                              {visibleSkills.map((s, idx) => (
                                <span key={idx} className="rx-discovery-skill-chip">
                                  {s}
                                </span>
                              ))}

                              {hasMoreSkills && (
                                <button
                                  type="button"
                                  className="rx-discovery-skill-more"
                                  onClick={() => toggleSkills(c._id)}
                                  title={isExpanded ? "Show less" : `Show ${rawSkills.length - 3} more skills`}
                                >
                                  {isExpanded ? "✕" : "..."}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rx-discovery-actions">
                        <Link
                          to={jobId ? `/recruiter/candidates/${c._id}?jobId=${jobId}` : `/recruiter/candidates/${c._id}`}
                          state={{ fromJobId: jobId }}
                          className="rx-btn-view-profile"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="rx-bulk-dock">
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", paddingRight: 8, borderRight: "1px solid var(--border)" }}>
            {selectedIds.length} selected
          </span>

          <button
            type="button"
            className="rx-btn rx-btn-primary"
            style={{ fontSize: 12, padding: "6px 14px" }}
            disabled={bulkLoading}
            onClick={() => executeBulkAction("shortlist")}
          >
            <Star size={14} /> Shortlist
          </button>

          <button
            type="button"
            className="rx-btn rx-btn-secondary"
            style={{ fontSize: 12, padding: "6px 14px" }}
            disabled={bulkLoading}
            onClick={() => executeBulkAction("send_assessment")}
          >
            <Send size={14} /> Send Assessment
          </button>

          <button
            type="button"
            className="rx-btn rx-btn-secondary"
            style={{ fontSize: 12, padding: "6px 14px" }}
            disabled={bulkLoading}
            onClick={() => executeBulkAction("send_ai_interview")}
          >
            <Bot size={14} /> Send AI Interview
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <select
              value={targetStage}
              onChange={(e) => setTargetStage(e.target.value)}
              className="rx-premium-input"
              style={{ fontSize: 12, padding: "5px 10px", width: "auto" }}
            >
              <option value="">Move Stage...</option>
              {STAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {targetStage && (
              <button
                type="button"
                className="rx-btn rx-btn-secondary"
                style={{ fontSize: 12, padding: "5px 10px" }}
                disabled={bulkLoading}
                onClick={() => {
                  executeBulkAction("move_stage", { stage: targetStage });
                  setTargetStage("");
                }}
              >
                Apply
              </button>
            )}
          </div>

          <button
            type="button"
            className="rx-btn rx-btn-danger"
            style={{ fontSize: 12, padding: "6px 14px" }}
            disabled={bulkLoading}
            onClick={() => executeBulkAction("reject")}
          >
            <XCircle size={14} /> Reject
          </button>

          <button
            type="button"
            style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}
            onClick={() => setSelectedIds([])}
          >
            Clear
          </button>
        </div>
      )}
    </RecruiterLayout>
  );
}
