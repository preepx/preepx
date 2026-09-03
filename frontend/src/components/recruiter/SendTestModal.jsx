import React, { useState, useEffect } from "react";
import { generateQuestions, sendAssessment } from "@/services/recruiterAPI";
import notify from "@/utils/notify";
import { X } from "lucide-react";

export default function SendTestModal({
  isOpen,
  onClose,
  targetApp,
  targetJobId,
  jobs,
  onSuccess,
}) {
  const [selectedJobId, setSelectedJobId] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (jobs?.find((j) => j._id === targetJobId)) {
        setSelectedJobId(targetJobId);
      } else if (jobs && jobs.length > 0) {
        setSelectedJobId(jobs[0]._id);
      }
    }
  }, [isOpen, targetJobId, jobs]);

  if (!isOpen || !targetApp) return null;

  const handleSend = async () => {
    if (!selectedJobId) {
      notify.error("Please select a role/assessment template.");
      return;
    }

    setSending(true);
    try {
      const preview = await generateQuestions(selectedJobId);
      await sendAssessment(targetJobId, targetApp._id, {
        recruiterApproved: true,
        approvedQuestions: preview,
      });

      notify.success("Assessment sent to candidate!");
      onSuccess?.();
      onClose();
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed to send assessment");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rx-modal-overlay" onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="rx-modal" onClick={(e) => e.stopPropagation()} style={{ background: "var(--surface)", padding: 24, borderRadius: 12, width: "100%", maxWidth: 450, border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: "var(--text)" }}>Send Assessment Test</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
          You are sending an assessment to <strong>{targetApp.userId?.fullName || "the candidate"}</strong>. 
          Please select which role's assessment questions you want to send.
        </p>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Select Role / Assessment Template</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="rx-premium-input"
            style={{ width: "100%", padding: "10px 12px" }}
          >
            {jobs?.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} ({job.role})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button type="button" className="rx-btn rx-btn-secondary" onClick={onClose} disabled={sending}>
            Cancel
          </button>
          <button type="button" className="rx-btn rx-btn-primary" onClick={handleSend} disabled={sending}>
            {sending ? "Sending..." : "Send Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}
