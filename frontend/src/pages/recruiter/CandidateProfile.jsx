import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Send, Star, XCircle, Calendar, Sparkles, FileText, ExternalLink, Github, Linkedin, Briefcase, MapPin } from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import {
  getCandidateProfile, sendAssessment, shortlistCandidate, rejectCandidate, scheduleInterview, generateQuestions
} from "@/services/recruiterAPI";
import { getAssetUrl } from "@/utils/assetUrl";
import Loader from "@/components/Loader";
import notify from "@/utils/notify";
import '@/styles/RecruiterLayout.css';

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
      <style>{`
        .cp-container { max-width: 1100px; margin: 0 auto; padding-bottom: 80px; }
        .cp-back { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: var(--text-muted); text-decoration: none; margin-bottom: 24px; transition: color 0.2s; }
        .cp-back:hover { color: var(--primary); }
        
        .cp-header { background: var(--surface); border-radius: 24px; border: 1px solid var(--border); overflow: hidden; margin-bottom: 24px; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.02); }
        .cp-cover { height: 120px; background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 15%, transparent), color-mix(in srgb, var(--primary) 4%, transparent)); position: relative; }
        .cp-badge-top { position: absolute; top: 20px; right: 24px; background: #fff; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; color: var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 6px; }
        
        .cp-header-content { padding: 0 32px 32px 32px; display: flex; justify-content: space-between; align-items: flex-end; margin-top: -40px; flex-wrap: wrap; gap: 24px; }
        .cp-avatar { width: 96px; height: 96px; border-radius: 24px; background: #fff; border: 4px solid var(--surface); display: flex; justify-content: center; align-items: center; font-size: 36px; font-weight: 800; color: var(--primary); box-shadow: 0 8px 24px rgba(0,0,0,0.08); z-index: 2; position: relative; }
        .cp-title { font-size: 28px; font-weight: 800; color: var(--text); margin: 16px 0 6px 0; letter-spacing: -0.5px; }
        .cp-subtitle { display: flex; align-items: center; gap: 16px; color: var(--text-muted); font-size: 15px; font-weight: 500; }
        .cp-subtitle-item { display: flex; align-items: center; gap: 6px; }
        
        .cp-score-block { text-align: right; }
        .cp-score-val { font-size: 48px; font-weight: 900; color: var(--primary); line-height: 1; letter-spacing: -2px; }
        .cp-score-label { font-size: 13px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px; margin-top: 4px; }

        .cp-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
        @media (min-width: 900px) { .cp-grid { grid-template-columns: 2fr 1fr; } }
        
        .cp-card { background: var(--surface); border-radius: 24px; padding: 32px; border: 1px solid var(--border); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.02); }
        .cp-card-title { font-size: 18px; font-weight: 700; color: var(--text); margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px; }
        .cp-bio { font-size: 16px; line-height: 1.8; color: color-mix(in srgb, var(--text) 80%, transparent); margin: 0; }
        
        .cp-pill { padding: 8px 16px; border-radius: 12px; font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; }
        .cp-pill-green { background: color-mix(in srgb, #10b981 10%, transparent); color: #059669; border: 1px solid color-mix(in srgb, #10b981 20%, transparent); }
        .cp-pill-red { background: var(--bg); color: var(--text-muted); border: 1px dashed var(--border); }
        
        .cp-ai-box { background: linear-gradient(145deg, color-mix(in srgb, var(--primary) 8%, transparent), color-mix(in srgb, var(--primary) 2%, transparent)); border-radius: 16px; padding: 24px; border: 1px solid color-mix(in srgb, var(--primary) 10%, transparent); margin-top: 24px; position: relative; overflow: hidden; }
        .cp-ai-box::before { content: ""; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--primary); }
        
        .cp-progress-row { margin-bottom: 16px; }
        .cp-progress-header { display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
        .cp-progress-bar { height: 8px; background: var(--bg); border-radius: 4px; overflow: hidden; border: 1px solid var(--border); }
        .cp-progress-fill { height: 100%; background: var(--primary); border-radius: 4px; transition: width 1s ease-out; }
        
        .cp-actions-dock { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); background: color-mix(in srgb, var(--surface) 85%, transparent); backdrop-filter: blur(16px); padding: 12px 24px; border-radius: 100px; border: 1px solid color-mix(in srgb, var(--border) 50%, transparent); box-shadow: 0 20px 40px rgba(0,0,0,0.1); display: flex; gap: 12px; z-index: 100; transition: all 0.3s; }
        .cp-btn { padding: 12px 24px; border-radius: 100px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: transform 0.2s, box-shadow 0.2s; }
        .cp-btn:hover { transform: translateY(-2px); }
        .cp-btn-primary { background: var(--primary); color: #fff; box-shadow: 0 8px 16px color-mix(in srgb, var(--primary) 30%, transparent); }
        .cp-btn-success { background: #10b981; color: #fff; box-shadow: 0 8px 16px rgba(16,185,129,0.3); }
        .cp-btn-ghost { background: var(--bg); color: var(--text); border: 1px solid var(--border); }
        .cp-btn-danger { background: transparent; color: var(--danger); border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent); }
      `}</style>

      <div className="cp-container">
        <Link to="/recruiter/candidates" className="cp-back"><span style={{ fontSize: 18 }}>←</span> Back to Candidates</Link>

        {/* Premium Header */}
        <div className="cp-header">
          <div className="cp-cover">
            <div className="cp-badge-top">
              <Sparkles size={14} /> {application.source === "candidate_applied" ? "Applied Candidate" : "Auto-Matched"}
            </div>
          </div>
          <div className="cp-header-content">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div className="cp-avatar">{candidate.fullName?.[0]}</div>
              <h1 className="cp-title">{candidate.fullName}</h1>
              <div className="cp-subtitle">
                <span className="cp-subtitle-item"><Briefcase size={16} /> {candidate.preferredRole || candidate.education || "Role not specified"}</span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span className="cp-subtitle-item"><MapPin size={16} /> {candidate.location || "Remote"}</span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span className="cp-subtitle-item">{candidate.experienceYears ?? "0"} yrs exp</span>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                {candidate.github && <a href={candidate.github} target="_blank" rel="noreferrer" className="cp-btn cp-btn-ghost" style={{ padding: "8px 16px", borderRadius: 12 }}><Github size={16} /> GitHub</a>}
                {candidate.linkedin && <a href={candidate.linkedin} target="_blank" rel="noreferrer" className="cp-btn cp-btn-ghost" style={{ padding: "8px 16px", borderRadius: 12 }}><Linkedin size={16} /> LinkedIn</a>}
              </div>
            </div>

            <div className="cp-score-block">
              <div className="cp-score-val">{match.score}<span style={{ fontSize: 24, opacity: 0.7 }}>%</span></div>
              <div className="cp-score-label">Overall Match</div>
            </div>
          </div>
        </div>

        <div className="cp-grid">
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            <div className="cp-card">
              <h3 className="cp-card-title">About Candidate</h3>
              <p className="cp-bio">{candidate.bio || "No summary provided by the candidate."}</p>

              <div className="cp-ai-box">
                <h4 style={{ margin: "0 0 12px 0", fontSize: 16, color: "var(--primary)", display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={18} /> PreepX AI Recommendation</h4>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "var(--text)" }}>{match.explanation}</p>
              </div>
            </div>

            <div className="cp-card">
              <h3 className="cp-card-title">Skills Analysis</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {(match.matchedSkills || []).map((s) => (
                  <span key={s} className="cp-pill cp-pill-green">✓ {s}</span>
                ))}
                {(match.missingSkills || []).map((s) => (
                  <span key={s} className="cp-pill cp-pill-red">✕ {s}</span>
                ))}
              </div>
            </div>

            <div className="cp-card">
              <h3 className="cp-card-title"><FileText size={20} color="var(--primary)" /> Candidate Resume</h3>
              {resumeUrl ? (
                <div>
                  <a href={resumeUrl} target="_blank" rel="noreferrer" className="cp-btn cp-btn-ghost" style={{ display: "inline-flex", marginBottom: 20 }}>
                    <ExternalLink size={18} /> Open {candidate.resumeFileName || "Resume PDF"}
                  </a>
                  <div style={{ padding: 8, background: "var(--bg)", borderRadius: 16, border: "1px solid var(--border)" }}>
                    <iframe title="Candidate Resume" src={resumeUrl} style={{ width: "100%", height: 700, border: "none", borderRadius: 10, background: "#fff" }} />
                  </div>
                </div>
              ) : (
                <div style={{ padding: 60, textAlign: "center", background: "var(--bg)", borderRadius: 16, border: "1px dashed var(--border)" }}>
                  <FileText size={48} color="var(--border)" style={{ marginBottom: 16 }} />
                  <p style={{ margin: 0, fontSize: 16, color: "var(--text-muted)" }}>No resume uploaded.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            <div className="cp-card" style={{ position: "sticky", top: 24 }}>
              <h3 className="cp-card-title">Detailed Breakdown</h3>
              
              <div className="cp-progress-row">
                <div className="cp-progress-header"><span>Skills Match</span><span>{application.skillsScore ?? 0}%</span></div>
                <div className="cp-progress-bar"><div className="cp-progress-fill" style={{ width: `${application.skillsScore ?? 0}%` }}></div></div>
              </div>
              <div className="cp-progress-row">
                <div className="cp-progress-header"><span>Experience</span><span>{application.experienceScore ?? 0}%</span></div>
                <div className="cp-progress-bar"><div className="cp-progress-fill" style={{ width: `${application.experienceScore ?? 0}%` }}></div></div>
              </div>
              <div className="cp-progress-row">
                <div className="cp-progress-header"><span>Profile Strength</span><span>{application.profileScore ?? 0}%</span></div>
                <div className="cp-progress-bar"><div className="cp-progress-fill" style={{ width: `${application.profileScore ?? 0}%` }}></div></div>
              </div>
              <div className="cp-progress-row">
                <div className="cp-progress-header"><span>PrepEx Score</span><span>{application.performanceScore ?? 0}%</span></div>
                <div className="cp-progress-bar"><div className="cp-progress-fill" style={{ width: `${application.performanceScore ?? 0}%` }}></div></div>
              </div>

              <hr style={{ border: "none", borderTop: "1px dashed var(--border)", margin: "24px 0" }} />
              
              <div className="cp-progress-row">
                <div className="cp-progress-header"><span>Technical Assessment</span><span>{scores.assessment ?? 0}%</span></div>
                <div className="cp-progress-bar"><div className="cp-progress-fill" style={{ width: `${scores.assessment ?? 0}%`, background: scores.assessment ? "var(--primary)" : "var(--border)" }}></div></div>
              </div>
              <div className="cp-progress-row" style={{ marginBottom: 0 }}>
                <div className="cp-progress-header"><span>AI Interview</span><span>{scores.aiInterview ?? 0}%</span></div>
                <div className="cp-progress-bar"><div className="cp-progress-fill" style={{ width: `${scores.aiInterview ?? 0}%`, background: scores.aiInterview ? "var(--primary)" : "var(--border)" }}></div></div>
              </div>

              <div style={{ marginTop: 32, padding: 20, background: "var(--bg)", borderRadius: 16, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Applied For</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>{job?.title}</div>
                <div style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500, marginBottom: 12 }}>{job?.role}</div>
                <span className="cp-pill cp-pill-red" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}>STATUS: {status.toUpperCase()}</span>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Floating Action Dock */}
      <div className="cp-actions-dock">
        {CAN_SHORTLIST.includes(status) && (
          <button type="button" className="cp-btn cp-btn-success" onClick={() => shortlistCandidate(applicationId).then(() => { notify.success("Shortlisted"); load(); })}>
            <Star size={18} /> Shortlist
          </button>
        )}
        {CAN_SEND_ASSESSMENT.includes(status) && !application.assessmentId && (
          <button type="button" className="cp-btn cp-btn-primary" onClick={handleSendAssessment}>
            <Send size={18} /> Send Assessment
          </button>
        )}
        {status === "shortlisted" && application.assessmentId && (
          <div className="cp-btn cp-btn-ghost" style={{ cursor: "default", color: "#d97706", borderColor: "#fcd34d", background: "#fffbeb" }}>
            Assessment Sent
          </div>
        )}
        <button type="button" className="cp-btn cp-btn-ghost" onClick={() => setShowSchedule(true)}>
          <Calendar size={18} /> Schedule
        </button>
        {status !== "rejected" && status !== "hired" && (
          <button type="button" className="cp-btn cp-btn-danger" onClick={() => rejectCandidate(applicationId).then(() => { notify.success("Rejected"); load(); })}>
            <XCircle size={18} /> Reject
          </button>
        )}
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
