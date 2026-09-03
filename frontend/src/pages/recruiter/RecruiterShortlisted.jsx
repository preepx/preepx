import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Send,
  Star,
  Sparkles,
  Bot,
  Download,
  CheckSquare,
  Square,
  XCircle,
  FileCheck
} from "lucide-react";
import Swal from "sweetalert2";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { getShortlisted, sendAssessment, generateQuestions, bulkCandidateAction } from "@/services/recruiterAPI";
import { exportCandidatesToCSV } from "@/utils/exportCSV";
import Loader from "@/components/Loader";
import notify from "@/utils/notify";
import EmptyState from "@/components/recruiter/EmptyState";
import '@/styles/RecruiterLayout.css';

export default function RecruiterShortlisted() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const load = () =>
    getShortlisted()
      .then((data) => {
        setList(data || []);
        setSelectedIds([]);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleSend = async (app) => {
    const jobId = app.jobId?._id || app.jobId;
    const confirm = await Swal.fire({
      title: "Send Technical Assessment?",
      text: `Send assessment invitation to ${app.userId?.fullName || "candidate"}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "var(--primary, #6366f1)",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Send Assessment",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    setSending(app._id);
    try {
      const preview = await generateQuestions(jobId);
      await sendAssessment(jobId, app._id, { recruiterApproved: true, approvedQuestions: preview });
      notify.success("Assessment sent to candidate!");
      load();
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed to send assessment");
    } finally {
      setSending(null);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === list.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(list.map((a) => a._id));
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const executeBulkAction = async (action) => {
    if (selectedIds.length === 0) return;

    if (action === "reject") {
      const confirm = await Swal.fire({
        title: "Reject Selected Candidates?",
        text: `Are you sure you want to reject ${selectedIds.length} candidate(s)?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Yes, Reject",
      });
      if (!confirm.isConfirmed) return;
    }

    setBulkLoading(true);
    try {
      const res = await bulkCandidateAction({
        applicationIds: selectedIds,
        action,
      });
      notify.success(`Processed ${res.successCount} candidate(s)`);
      setSelectedIds([]);
      load();
    } catch (e) {
      notify.error(e.response?.data?.message || "Bulk action failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExportCSV = () => {
    const toExport = selectedIds.length
      ? list.filter((a) => selectedIds.includes(a._id))
      : list;
    exportCandidatesToCSV(toExport, `preepx_shortlisted_${new Date().toISOString().slice(0, 10)}.csv`);
    notify.success(`Exported ${toExport.length} shortlisted candidates`);
  };

  const isAllSelected = list.length > 0 && selectedIds.length === list.length;

  return (
    <RecruiterLayout title="Shortlisted Candidates">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <p className="rx-muted" style={{ margin: 0 }}>
          Shortlisted candidates are qualified for assessments and AI interviews.
        </p>

        {list.length > 0 && (
          <button type="button" className="rx-btn rx-btn-secondary" onClick={handleExportCSV}>
            <Download size={15} /> Export CSV {selectedIds.length > 0 ? `(${selectedIds.length})` : `(${list.length})`}
          </button>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : list.length === 0 ? (
        <div className="rx-card">
          <EmptyState
            icon={Star}
            title="No shortlisted candidates yet"
            description="Shortlist applicants from candidate profiles or Candidate Discovery to send assessments and AI interviews."
            actionLabel="Discover Candidates"
            actionTo="/recruiter/candidates"
          />
        </div>
      ) : (
        <div className="rx-card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="rx-table">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: "center" }}>
                  <div style={{ cursor: "pointer", display: "flex", justifyContent: "center" }} onClick={handleToggleSelectAll}>
                    {isAllSelected ? <CheckSquare size={18} color="var(--primary)" /> : <Square size={18} color="var(--text-muted)" />}
                  </div>
                </th>
                <th>Candidate</th>
                <th>Job Role</th>
                <th>Match Score</th>
                <th>Assessment</th>
                <th>AI Interview</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => {
                const isSelected = selectedIds.includes(a._id);

                return (
                  <tr key={a._id} style={{ background: isSelected ? "color-mix(in srgb, var(--primary) 4%, transparent)" : undefined }}>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ cursor: "pointer", display: "flex", justifyContent: "center" }} onClick={() => handleToggleSelectOne(a._id)}>
                        {isSelected ? <CheckSquare size={18} color="var(--primary)" /> : <Square size={18} color="var(--text-muted)" />}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: "var(--text)" }}>{a.userId?.fullName || "Candidate"}</strong>
                      <div className="rx-muted" style={{ fontSize: 12 }}>{a.userId?.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.jobId?.title}</div>
                      <div className="rx-muted" style={{ fontSize: 12 }}>{a.jobId?.role}</div>
                    </td>
                    <td>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "var(--primary)" }}>{a.matchScore}%</span>
                        <span className="rx-badge rx-badge-blue" style={{ fontSize: 10 }}>
                          <Sparkles size={10} /> Match
                        </span>
                      </div>
                    </td>
                    <td>
                      {a.assessmentId?.overallScore != null ? (
                        <span className="rx-badge rx-badge-green" style={{ fontSize: 11 }}>
                          <FileCheck size={12} /> {a.assessmentId.overallScore}%
                        </span>
                      ) : a.assessmentId ? (
                        <span className="rx-badge rx-badge-amber" style={{ fontSize: 11 }}>Sent</span>
                      ) : (
                        <span className="rx-badge rx-badge-gray" style={{ fontSize: 11 }}>Not Sent</span>
                      )}
                    </td>
                    <td>
                      {a.aiInterviewScore > 0 ? (
                        <span className="rx-badge rx-badge-blue" style={{ fontSize: 11 }}>
                          <Bot size={12} /> {a.aiInterviewScore}%
                        </span>
                      ) : (
                        <span className="rx-badge rx-badge-gray" style={{ fontSize: 11 }}>Pending</span>
                      )}
                    </td>
                    <td>
                      <div className="rx-table-actions">
                        <Link to={`/recruiter/candidates/${a._id}`} className="rx-btn rx-btn-secondary rx-btn-sm">
                          Profile
                        </Link>
                        {!a.assessmentId && (
                          <button
                            type="button"
                            className="rx-btn rx-btn-primary rx-btn-sm"
                            disabled={sending === a._id}
                            onClick={() => handleSend(a)}
                          >
                            <Send size={13} /> {sending === a._id ? "..." : "Send Test"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk Action Dock */}
      {selectedIds.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.15)",
            borderRadius: 100,
            padding: "8px 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            zIndex: 1000,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, paddingRight: 8, borderRight: "1px solid var(--border)" }}>
            {selectedIds.length} selected
          </span>
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
