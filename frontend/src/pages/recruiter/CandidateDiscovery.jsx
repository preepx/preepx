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
  FileCheck
} from "lucide-react";
import Swal from "sweetalert2";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { discoverCandidates, getJobs, bulkCandidateAction } from "@/services/recruiterAPI";
import { exportCandidatesToCSV } from "@/utils/exportCSV";
import Loader from "@/components/Loader";
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

  let jobId = searchParams.get("jobId") || "";
  if (jobId === "undefined" || jobId === "null") jobId = "";

  useEffect(() => {
    getJobs().then((j) => {
      setJobs(j || []);
      setJobsFetched(true);
      if (!jobId && j && j[0]) setSearchParams({ jobId: j[0]._id });
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
            onChange={(e) => setSearchParams({ jobId: e.target.value })}
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
        <Loader />
      ) : candidates.length === 0 ? (
        <div className="rx-card rx-empty">
          No candidates found for this job. Publish the job to attract applicants or run auto-matching.
        </div>
      ) : (
        <div className="rx-card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="rx-table">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: "center" }}>
                  <div className="rx-table-bulk-checkbox" onClick={handleToggleSelectAll}>
                    {isAllSelected ? <CheckSquare size={18} color="var(--primary)" /> : <Square size={18} color="var(--text-muted)" />}
                  </div>
                </th>
                <th>Candidate</th>
                <th>Match Score</th>
                <th>Key Skills</th>
                <th>Assessment</th>
                <th>AI Interview</th>
                <th>Stage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => {
                const isSelected = selectedIds.includes(c._id);
                const user = c.user || c.userId || {};

                return (
                  <tr key={c._id} style={{ background: isSelected ? "color-mix(in srgb, var(--primary) 4%, transparent)" : undefined }}>
                    <td style={{ textAlign: "center" }}>
                      <div className="rx-table-bulk-checkbox" onClick={() => handleToggleSelectOne(c._id)}>
                        {isSelected ? <CheckSquare size={18} color="var(--primary)" /> : <Square size={18} color="var(--text-muted)" />}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--text)" }}>{user.fullName || "Candidate"}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{user.email || "No email"}</div>
                      {user.preferredRole && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{user.preferredRole}</div>}
                    </td>
                    <td>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--primary)" }}>{c.matchScore}%</span>
                        <span className="rx-badge rx-badge-blue" style={{ fontSize: 10 }}>
                          <Sparkles size={10} /> Match
                        </span>
                      </div>
                    </td>
                    <td style={{ maxWidth: 220 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {(c.matchedSkills || []).slice(0, 3).map((s, idx) => (
                          <span key={idx} style={{ fontSize: 11, background: "var(--bg)", border: "1px solid var(--border)", padding: "2px 6px", borderRadius: 4 }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {c.assessmentId?.overallScore != null ? (
                        <span className="rx-badge rx-badge-green" style={{ fontSize: 11 }}>
                          <FileCheck size={12} /> {c.assessmentId.overallScore}%
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td>
                      {c.aiInterviewScore > 0 ? (
                        <span className="rx-badge rx-badge-blue" style={{ fontSize: 11 }}>
                          <Bot size={12} /> {c.aiInterviewScore}%
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className="rx-badge rx-badge-gray" style={{ textTransform: "capitalize", fontSize: 11 }}>
                        {(c.status || "matched").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link to={`/recruiter/candidates/${c._id}`} className="rx-btn rx-btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>
                        View Profile
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
