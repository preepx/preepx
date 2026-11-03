import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Calendar, Video, CheckCircle2, Clock, Check, X, XCircle, Filter } from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { getInterviews, getJobs, getApplications, updateInterview, movePipeline } from "@/services/recruiterAPI";
import DashboardSkeleton from "@/components/recruiter/DashboardSkeleton";
import notify from "@/utils/notify";
import '@/styles/RecruiterLayout.css';

export default function RecruiterInterviews() {
  const [activeTab, setActiveTab] = useState("manual"); // default to "manual" or "ai"
  const [manualInterviews, setManualInterviews] = useState([]);
  const [aiApplications, setAiApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSection, setFilterSection] = useState("all"); // "all" | "scheduled" | "hire" | "not_hire"
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [intList, jobsList] = await Promise.all([
          getInterviews().catch(() => []),
          getJobs().catch(() => []),
        ]);
        setManualInterviews(intList || []);

        const aiApps = [];
        for (const job of (jobsList || []).slice(0, 20)) {
          const apps = await getApplications(job._id);
          apps
            .filter((a) => a.status === "ai_interview" || a.aiInterviewId || a.aiInterviewScore > 0)
            .forEach((a) => aiApps.push({ ...a, jobTitle: job.title }));
        }
        setAiApplications(aiApps);
      } catch (e) {
        notify.error("Failed to load interviews");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getDecision = (interview) => {
    const fb = (interview.recruiterFeedback || "").toLowerCase().trim();
    if (fb === "hire" || fb === "hired") return "Hire";
    if (fb === "not hire" || fb === "not_hire" || fb === "not hired" || fb === "rejected") return "Not Hire";
    return null;
  };

  const handleDecision = async (interview, decision) => {
    const currentDecision = getDecision(interview);
    const newDecision = currentDecision === decision ? "" : decision;
    const appId = interview.applicationId?._id || interview.applicationId;

    setUpdatingId(interview._id);
    try {
      // 1. Update the interview document directly in backend
      await updateInterview(interview._id, {
        recruiterFeedback: newDecision,
      });

      // 2. Move candidate pipeline if application exists
      if (appId && newDecision) {
        const targetStage = newDecision === "Hire" ? "hired" : "rejected";
        await movePipeline(appId, targetStage, `Interview decision: ${newDecision}`).catch((err) => {
          console.warn("Could not transition application pipeline:", err);
        });
      }

      // 3. Update local state reactively
      setManualInterviews((prev) =>
        prev.map((item) =>
          item._id === interview._id
            ? { ...item, recruiterFeedback: newDecision }
            : item
        )
      );

      if (newDecision === "Hire") {
        notify.success("Candidate marked as Hired");
      } else if (newDecision === "Not Hire") {
        notify.success("Candidate marked as Not Hired");
      } else {
        notify.info("Interview decision reset");
      }
    } catch (err) {
      notify.error(err.response?.data?.message || "Failed to update decision");
    } finally {
      setUpdatingId(null);
    }
  };

  const totalManual = manualInterviews.length;
  const hiredCount = manualInterviews.filter((i) => getDecision(i) === "Hire").length;
  const notHiredCount = manualInterviews.filter((i) => getDecision(i) === "Not Hire").length;
  const scheduledCount = manualInterviews.filter((i) => !getDecision(i)).length;

  const displayedInterviews = manualInterviews.filter((i) => {
    const dec = getDecision(i);
    if (filterSection === "scheduled") return !dec;
    if (filterSection === "hire") return dec === "Hire";
    if (filterSection === "not_hire") return dec === "Not Hire";
    return true; // "all"
  });

  return (
    <RecruiterLayout title="Interviews">
      {/* Tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
        <button
          type="button"
          className={`rx-btn ${activeTab === "ai" ? "rx-btn-primary" : "rx-btn-secondary"}`}
          onClick={() => setActiveTab("ai")}
        >
          <Bot size={16} /> AI Interviews ({aiApplications.length})
        </button>
        <button
          type="button"
          className={`rx-btn ${activeTab === "manual" ? "rx-btn-primary" : "rx-btn-secondary"}`}
          onClick={() => setActiveTab("manual")}
        >
          <Calendar size={16} /> Manual Round Interviews ({manualInterviews.length})
        </button>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : activeTab === "ai" ? (
        /* AI Interviews List */
        aiApplications.length === 0 ? (
          <div className="rx-card rx-empty">
            No AI Interviews sent yet. Shortlist candidates from Candidate Discovery and click "Send AI Interview".
          </div>
        ) : (
          <div className="rx-card" style={{ padding: 0, overflowX: "auto" }}>
            <table className="rx-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job</th>
                  <th>AI Score</th>
                  <th>AI Recommendation</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {aiApplications.map((app) => {
                  const rep = app.aiInterviewReport || {};
                  const user = app.userId || {};

                  return (
                    <tr key={app._id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{user.fullName || "Candidate"}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{user.email}</div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{app.jobTitle}</td>
                      <td>
                        {app.aiInterviewScore > 0 ? (
                          <span style={{ fontSize: 14, fontWeight: 800, color: "#8b5cf6" }}>
                            {app.aiInterviewScore}%
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>In Progress</span>
                        )}
                      </td>
                      <td>
                        {rep.recommendation && rep.recommendation !== "Pending" ? (
                          <span
                            className="rx-badge"
                            style={{
                              background: rep.recommendation === "Strong Hire" ? "#ecfdf5" : rep.recommendation === "Hire" ? "#eff6ff" : "#fef2f2",
                              color: rep.recommendation === "Strong Hire" ? "#059669" : rep.recommendation === "Hire" ? "#2563eb" : "#dc2626",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {rep.recommendation}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Pending Completion</span>
                        )}
                      </td>
                      <td>
                        <span className="rx-badge rx-badge-blue" style={{ textTransform: "capitalize", fontSize: 11 }}>
                          {(app.status || "").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td>
                        <Link to={`/recruiter/candidates/${app._id}`} className="rx-btn rx-btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>
                          View Report
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Manual Round Interviews */
        manualInterviews.length === 0 ? (
          <div className="rx-card rx-empty">
            No manual interviews scheduled. You can schedule an optional human round from any candidate's profile or AI report.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Status Sub-Filters Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                padding: "10px 16px",
                background: "var(--card-bg, #ffffff)",
                borderRadius: 10,
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Filter size={14} style={{ color: "var(--primary)" }} /> Status:
                </span>
                <button
                  type="button"
                  className={`rx-decision-filter-btn ${filterSection === "all" ? "active" : ""}`}
                  onClick={() => setFilterSection("all")}
                >
                  All ({totalManual})
                </button>
                <button
                  type="button"
                  className={`rx-decision-filter-btn ${filterSection === "scheduled" ? "active" : ""}`}
                  onClick={() => setFilterSection("scheduled")}
                >
                  <Clock size={13} /> Scheduled ({scheduledCount})
                </button>
                <button
                  type="button"
                  className={`rx-decision-filter-btn rx-filter-hire ${filterSection === "hire" ? "active" : ""}`}
                  onClick={() => setFilterSection("hire")}
                >
                  <CheckCircle2 size={13} /> Hire ({hiredCount})
                </button>
                <button
                  type="button"
                  className={`rx-decision-filter-btn rx-filter-nothire ${filterSection === "not_hire" ? "active" : ""}`}
                  onClick={() => setFilterSection("not_hire")}
                >
                  <XCircle size={13} /> Not Hire ({notHiredCount})
                </button>
              </div>

              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                Showing {displayedInterviews.length} of {totalManual} interviews
              </div>
            </div>

            {displayedInterviews.length === 0 ? (
              <div className="rx-card rx-empty" style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{ margin: "0 0 12px 0", color: "var(--text-muted)" }}>
                  No candidates found in <strong>{filterSection === "hire" ? "Hire" : filterSection === "not_hire" ? "Not Hire" : filterSection === "scheduled" ? "Scheduled" : "this"}</strong> section.
                </p>
                <button
                  type="button"
                  className="rx-btn rx-btn-secondary"
                  style={{ fontSize: 12, padding: "6px 14px" }}
                  onClick={() => setFilterSection("all")}
                >
                  View All Interviews
                </button>
              </div>
            ) : (
              displayedInterviews.map((i) => {
                const decision = getDecision(i);
                return (
                  <div
                    key={i._id}
                    className="rx-card"
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}
                  >
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{i.jobId?.title || "Interview"}</div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0" }}>
                        Candidate: <strong>{i.userId?.fullName}</strong> ({i.userId?.email})
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                        <Clock size={13} /> {new Date(i.scheduledAt).toLocaleString()} · Type: {i.interviewType || "video"}
                      </div>
                      {i.notes && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, fontStyle: "italic" }}>Note: {i.notes}</div>}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      {/* Hire / Not Hire decision section (on the left side of SCHEDULED) */}
                      <div className="rx-interview-decision">
                        <button
                          type="button"
                          onClick={() => handleDecision(i, "Hire")}
                          disabled={updatingId === i._id}
                          className={`rx-decision-btn rx-decision-hire ${decision === "Hire" ? "active" : ""}`}
                          title={decision === "Hire" ? "Marked as Hired (Click to reset)" : "Mark candidate as Hire"}
                        >
                          <Check size={13} strokeWidth={2.5} />
                          <span>{decision === "Hire" ? "Hired" : "Hire"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(i, "Not Hire")}
                          disabled={updatingId === i._id}
                          className={`rx-decision-btn rx-decision-nothire ${decision === "Not Hire" ? "active" : ""}`}
                          title={decision === "Not Hire" ? "Marked as Not Hired (Click to reset)" : "Mark candidate as Not Hire"}
                        >
                          <X size={13} strokeWidth={2.5} />
                          <span>{decision === "Not Hire" ? "Not Hired" : "Not Hire"}</span>
                        </button>
                      </div>

                      <span className="rx-badge rx-badge-blue" style={{ fontSize: 11 }}>
                        {i.status}
                      </span>
                      {i.meetingLink && (
                        <a
                          href={i.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="rx-btn rx-btn-primary"
                          style={{ fontSize: 12, padding: "6px 14px" }}
                        >
                          <Video size={14} /> Join Call
                        </a>
                      )}
                      {i.applicationId && (
                        <Link
                          to={`/recruiter/candidates/${i.applicationId._id || i.applicationId}`}
                          className="rx-btn rx-btn-secondary"
                          style={{ fontSize: 12, padding: "6px 14px" }}
                        >
                          View Profile
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )
      )}
    </RecruiterLayout>
  );
}
