import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Users, Send, CheckCircle, XCircle, Sparkles, ChevronLeft, Star, FileText } from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import {
  getJob, getApplications, runAutoMatch, sendAssessment,
  shortlistCandidate, rejectCandidate, getAssessmentResult, generateQuestions
} from "@/services/recruiterAPI";
import Loader from "@/components/Loader";
import notify from "@/utils/notify";
import '@/styles/RecruiterLayout.css';

const STATUS_LABEL = {
  applied: "Applied",
  matched: "Matched",
  assessment_sent: "Assessment Sent",
  assessment_in_progress: "In Progress",
  assessment_completed: "Completed",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
};

const statusBadge = (status) => {
  if (status === "shortlisted") return "rx-badge-green";
  if (status === "applied") return "rx-badge-blue";
  if (status === "rejected") return "rx-badge-red";
  if (status?.includes("assessment")) return "rx-badge-amber";
  return "rx-badge-gray";
};

export default function RecruiterJobDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  const load = () => {
    Promise.all([getJob(jobId), getApplications(jobId)])
      .then(([j, a]) => { setJob(j); setApps(a); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [jobId]);

  const handleMatch = async () => {
    setMatching(true);
    try {
      const result = await runAutoMatch(jobId);
      notify.success(`Matched ${result.matched} candidates`);
      load();
    } catch (err) {
      notify.error(err.response?.data?.message || "Matching failed");
    } finally {
      setMatching(false);
    }
  };

  const handleSendAssessment = async (appId) => {
    try {
      const preview = await generateQuestions(jobId);
      if (!window.confirm("Send assessment with AI-generated questions (20 MCQ + 2 coding)?")) return;
      await sendAssessment(jobId, appId, { recruiterApproved: true, approvedQuestions: preview });
      notify.success("Assessment sent!");
      load();
    } catch (err) {
      notify.error(err.response?.data?.message || "Failed to send assessment");
    }
  };

  if (loading) return <RecruiterLayout title="Job Detail"><Loader /></RecruiterLayout>;
  if (!job) return <RecruiterLayout title="Job Detail"><p>Job not found</p></RecruiterLayout>;

  const applicants = apps.filter((a) => ["applied", "matched"].includes(a.status));
  const shortlisted = apps.filter((a) => a.status === "shortlisted");

  return (
    <RecruiterLayout title={job.title}>
      <Link to="/recruiter/jobs" className="rx-muted" style={{ display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none", marginBottom: 16, fontSize: 14 }}>
        <ChevronLeft size={16} /> Back to Jobs
      </Link>

      <div className="rx-page-header">
        <div>
          <h1>{job.title}</h1>
          <p className="rx-muted" style={{ margin: "4px 0 0" }}>{job.role} · {job.location} · {(job.requiredSkills || job.skills || []).join(", ")}</p>
        </div>
        <button type="button" className="rx-btn rx-btn-primary" onClick={handleMatch} disabled={matching}>
          <Sparkles size={16} /> {matching ? "Matching..." : "Auto-Match"}
        </button>
      </div>

      <div className="rx-stats" style={{ marginBottom: 24 }}>
        <div className="rx-stat"><Users size={18} style={{ color: "var(--primary)" }} /><h3>{apps.length}</h3><p>Total</p></div>
        <div className="rx-stat"><FileText size={18} style={{ color: "var(--accent)" }} /><h3>{applicants.length}</h3><p>Applicants</p></div>
        <div className="rx-stat"><Star size={18} style={{ color: "var(--success)" }} /><h3>{shortlisted.length}</h3><p>Shortlisted</p></div>
      </div>

      <h2 style={{ marginBottom: 12 }}>Applicants & Matches</h2>
      {applicants.length === 0 ? (
        <p className="rx-muted rx-card" style={{ padding: 24 }}>No applicants yet. Candidates can apply from the job board, or run auto-match.</p>
      ) : (
        applicants.map((app) => {
          const user = app.userId || {};
          return (
            <div key={app._id} className="rx-candidate-card">
              <div className="rx-candidate-header">
                <div>
                  <strong>{user.fullName || "Candidate"}</strong>
                  <span className={`rx-badge ${app.source === "candidate_applied" ? "rx-badge-green" : "rx-badge-gray"}`} style={{ marginLeft: 8 }}>
                    {app.source === "candidate_applied" ? "Applied" : "Matched"}
                  </span>
                  <p className="rx-muted" style={{ margin: "4px 0", fontSize: 13 }}>{user.email} · {user.degree || user.preferredRole || "—"}</p>
                  <p className="rx-muted" style={{ fontSize: 12 }}>Skills match {app.skillsScore}% · Experience {app.experienceScore}%</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="rx-match-score">{app.matchScore}%</div>
                  <span className={`rx-badge ${statusBadge(app.status)}`}>{STATUS_LABEL[app.status] || app.status}</span>
                </div>
              </div>
              <div className="rx-actions">
                <Link to={`/recruiter/candidates/${app._id}`} className="rx-btn rx-btn-secondary">View Profile & Resume</Link>
                <button type="button" className="rx-btn rx-btn-success" onClick={() => shortlistCandidate(app._id).then(() => { notify.success("Shortlisted"); load(); })}>
                  <Star size={14} /> Shortlist
                </button>
                <button type="button" className="rx-btn rx-btn-danger" onClick={() => rejectCandidate(app._id).then(() => { notify.success("Rejected"); load(); })}>
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
          );
        })
      )}

      {shortlisted.length > 0 && (
        <>
          <h2 style={{ margin: "32px 0 12px" }}>Shortlisted — Send Assessment</h2>
          {shortlisted.map((app) => {
            const user = app.userId || {};
            return (
              <div key={app._id} className="rx-candidate-card" style={{ borderColor: "color-mix(in srgb, var(--success) 30%, var(--border))" }}>
                <div className="rx-candidate-header">
                  <div>
                    <strong>{user.fullName || "Candidate"}</strong>
                    <p className="rx-muted" style={{ margin: "4px 0", fontSize: 13 }}>{user.email}</p>
                  </div>
                  <div className="rx-match-score">{app.matchScore}%</div>
                </div>
                <div className="rx-actions">
                  <Link to={`/recruiter/candidates/${app._id}`} className="rx-btn rx-btn-ghost">View Profile</Link>
                  {!app.assessmentId ? (
                    <button type="button" className="rx-btn rx-btn-primary" onClick={() => handleSendAssessment(app._id)}>
                      <Send size={14} /> Send Assessment
                    </button>
                  ) : (
                    <button type="button" className="rx-btn rx-btn-secondary" onClick={() => getAssessmentResult(app.assessmentId._id || app.assessmentId).then(setSelectedResult).catch(() => notify.error("Could not load result"))}>
                      View Results
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}

      {selectedResult && (
        <div className="rx-modal-overlay" onClick={() => setSelectedResult(null)}>
          <div className="rx-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Assessment — {selectedResult.userId?.fullName}</h3>
            <div style={{ display: "flex", gap: 16, margin: "16px 0" }}>
              <div>MCQ: <strong>{selectedResult.mcqScore}%</strong></div>
              <div>Coding: <strong>{selectedResult.codingScore}%</strong></div>
              <div>Overall: <strong>{selectedResult.overallScore}%</strong></div>
            </div>
            {selectedResult.aiFeedback && <p style={{ lineHeight: 1.6, fontSize: 14 }}>{selectedResult.aiFeedback}</p>}
            <button type="button" className="rx-btn rx-btn-ghost" style={{ marginTop: 16 }} onClick={() => setSelectedResult(null)}>Close</button>
          </div>
        </div>
      )}
    </RecruiterLayout>
  );
}
