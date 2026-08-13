import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Send, Star, XCircle, Calendar, Sparkles, FileText, ExternalLink, Github, Linkedin } from "lucide-react";
import RecruiterLayout from "../../layouts/RecruiterLayout";
import {
  getCandidateProfile, sendAssessment, shortlistCandidate, rejectCandidate, scheduleInterview, generateQuestions
} from "../../services/recruiterAPI";
import { getAssetUrl } from "../../utils/assetUrl";
import Loader from "../../components/Loader";
import notify from "../../utils/notify";
import "../../layouts/RecruiterLayout.css";

const CAN_SHORTLIST = ["applied", "matched", "assessment_completed"];
const CAN_SEND_ASSESSMENT = ["shortlisted"];

export default function CandidateProfile() {
  const { applicationId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [schedule, setSchedule] = useState({ scheduledAt: "", meetingLink: "", notes: "" });

  const load = () => getCandidateProfile(applicationId).then(setData).finally(() => setLoading(false));
  useEffect(() => { load(); }, [applicationId]);

  const handleSendAssessment = async () => {
    try {
      const jobId = data.application.jobId._id || data.application.jobId;
      const preview = await generateQuestions(jobId);
      if (!window.confirm("Send assessment with AI-generated questions (20 MCQ + 2 coding)?")) return;
      await sendAssessment(jobId, applicationId, { recruiterApproved: true, approvedQuestions: preview });
      notify.success("Assessment sent!");
      load();
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed");
    }
  };

  const handleSchedule = async () => {
    try {
      await scheduleInterview({ applicationId, ...schedule, interviewType: "video" });
      notify.success("Interview scheduled");
      setShowSchedule(false);
      load();
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed");
    }
  };

  if (loading) return <RecruiterLayout title="Candidate"><Loader /></RecruiterLayout>;
  if (!data) return <RecruiterLayout title="Candidate"><p>Not found</p></RecruiterLayout>;

  const { candidate, match, scores, application, job } = data;
  const resumeUrl = getAssetUrl(candidate.resumeUrl);
  const status = application.status;

  return (
    <RecruiterLayout title="Candidate Profile">
      <Link to="/recruiter/candidates" className="rx-muted" style={{ textDecoration: "none", fontSize: 14 }}>← Back to Candidates</Link>

      <div className="rx-candidate-profile-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginTop: 16 }}>
        <div className="rx-card">
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div className="rx-profile-avatar" style={{ width: 56, height: 56, fontSize: 20 }}>{candidate.fullName?.[0]}</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h2 style={{ margin: 0 }}>{candidate.fullName}</h2>
              <p className="rx-muted" style={{ margin: "4px 0" }}>{candidate.preferredRole || candidate.education} · {candidate.location || "—"}</p>
              <p className="rx-muted" style={{ margin: 0, fontSize: 13 }}>{candidate.experienceYears ?? "—"} years experience · {candidate.email}</p>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                {candidate.github && <a href={candidate.github} target="_blank" rel="noreferrer" className="rx-link-action"><Github size={14} /> GitHub</a>}
                {candidate.linkedin && <a href={candidate.linkedin} target="_blank" rel="noreferrer" className="rx-link-action"><Linkedin size={14} /> LinkedIn</a>}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="rx-match-score">{match.score}%</div>
              <span className="rx-badge rx-badge-blue"><Sparkles size={12} /> Job Match</span>
              <div style={{ marginTop: 6 }}>
                <span className={`rx-badge ${application.source === "candidate_applied" ? "rx-badge-green" : "rx-badge-gray"}`}>
                  {application.source === "candidate_applied" ? "Applied" : "Auto-matched"}
                </span>
              </div>
            </div>
          </div>

          <p style={{ marginTop: 16, lineHeight: 1.6 }}>{candidate.bio || "No bio provided."}</p>

          <h3>Skills Match</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {(match.matchedSkills || []).map((s) => <span key={s} className="rx-badge rx-badge-green">{s}</span>)}
            {(match.missingSkills || []).map((s) => <span key={s} className="rx-badge rx-badge-red">{s} (missing)</span>)}
          </div>

          <p style={{ fontSize: 14, padding: 12, borderRadius: 10, background: "var(--bg)", border: "1px solid var(--border)" }}>
            <strong>Why this candidate:</strong> {match.explanation}
          </p>

          {resumeUrl ? (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}><FileText size={18} /> Resume</h3>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <a href={resumeUrl} target="_blank" rel="noreferrer" className="rx-btn rx-btn-secondary">
                  <ExternalLink size={14} /> Open Resume ({candidate.resumeFileName || "PDF"})
                </a>
              </div>
              <iframe
                title="Candidate Resume"
                src={resumeUrl}
                style={{ width: "100%", height: 420, border: "1px solid var(--border)", borderRadius: 10, background: "var(--bg)" }}
              />
            </div>
          ) : (
            <p className="rx-muted" style={{ marginTop: 16, fontSize: 13 }}>No resume uploaded by candidate.</p>
          )}

          <div className="rx-actions">
            {CAN_SHORTLIST.includes(status) && (
              <button type="button" className="rx-btn rx-btn-success" onClick={() => shortlistCandidate(applicationId).then(() => { notify.success("Shortlisted"); load(); })}>
                <Star size={16} /> Shortlist
              </button>
            )}
            {CAN_SEND_ASSESSMENT.includes(status) && !application.assessmentId && (
              <button type="button" className="rx-btn rx-btn-primary" onClick={handleSendAssessment}><Send size={16} /> Send Assessment</button>
            )}
            {status === "shortlisted" && application.assessmentId && (
              <span className="rx-badge rx-badge-amber">Assessment already sent</span>
            )}
            <button type="button" className="rx-btn rx-btn-ghost" onClick={() => setShowSchedule(true)}><Calendar size={16} /> Schedule Interview</button>
            {status !== "rejected" && status !== "hired" && (
              <button type="button" className="rx-btn rx-btn-danger" onClick={() => rejectCandidate(applicationId).then(() => { notify.success("Rejected"); load(); })}><XCircle size={16} /> Reject</button>
            )}
          </div>
        </div>

        <div>
          <div className="rx-card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginTop: 0 }}>Match Breakdown</h3>
            <p>Skills: <strong>{application.skillsScore ?? "—"}%</strong></p>
            <p>Experience: <strong>{application.experienceScore ?? "—"}%</strong></p>
            <p>Profile: <strong>{application.profileScore ?? "—"}%</strong></p>
            <p>PrepEx Score: <strong>{application.performanceScore ?? "—"}%</strong></p>
            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "12px 0" }} />
            <p>Assessment: <strong>{scores.assessment ?? "—"}%</strong></p>
            <p>AI Interview: <strong>{scores.aiInterview ?? "—"}%</strong></p>
          </div>
          <div className="rx-card">
            <h3 style={{ marginTop: 0 }}>Job</h3>
            <p><strong>{job?.title}</strong></p>
            <p className="rx-muted" style={{ fontSize: 13 }}>{job?.role}</p>
            <span className="rx-badge rx-badge-gray">{status}</span>
          </div>
        </div>
      </div>

      {showSchedule && (
        <div className="rx-modal-overlay" onClick={() => setShowSchedule(false)}>
          <div className="rx-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Schedule Interview</h3>
            <div className="rx-form">
              <div><label>Date & Time</label><input type="datetime-local" value={schedule.scheduledAt} onChange={(e) => setSchedule({ ...schedule, scheduledAt: e.target.value })} /></div>
              <div><label>Meeting Link</label><input value={schedule.meetingLink} onChange={(e) => setSchedule({ ...schedule, meetingLink: e.target.value })} /></div>
              <div><label>Notes</label><textarea rows={2} value={schedule.notes} onChange={(e) => setSchedule({ ...schedule, notes: e.target.value })} /></div>
              <button type="button" className="rx-btn rx-btn-primary" onClick={handleSchedule}>Schedule</button>
            </div>
          </div>
        </div>
      )}
    </RecruiterLayout>
  );
}
