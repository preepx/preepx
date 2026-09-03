import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Calendar, Video, CheckCircle2, Star, Clock, ExternalLink } from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { getInterviews, getJobs, getApplications } from "@/services/recruiterAPI";
import Loader from "@/components/Loader";
import notify from "@/utils/notify";
import '@/styles/RecruiterLayout.css';

export default function RecruiterInterviews() {
  const [activeTab, setActiveTab] = useState("ai"); // "ai" | "manual"
  const [manualInterviews, setManualInterviews] = useState([]);
  const [aiApplications, setAiApplications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <RecruiterLayout title="Interviews">
      {/* Tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
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
        <Loader />
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
            {manualInterviews.map((i) => (
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

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="rx-badge rx-badge-blue" style={{ fontSize: 11 }}>
                    {i.status}
                  </span>
                  {i.meetingLink && (
                    <a href={i.meetingLink} target="_blank" rel="noreferrer" className="rx-btn rx-btn-primary" style={{ fontSize: 12, padding: "6px 14px" }}>
                      <Video size={14} /> Join Call
                    </a>
                  )}
                  {i.applicationId && (
                    <Link to={`/recruiter/candidates/${i.applicationId._id || i.applicationId}`} className="rx-btn rx-btn-secondary" style={{ fontSize: 12, padding: "6px 14px" }}>
                      View Profile
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </RecruiterLayout>
  );
}
