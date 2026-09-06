import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Send,
  Star,
  XCircle,
  Calendar,
  Sparkles,
  FileText,
  ExternalLink,
  Github,
  Linkedin,
  Briefcase,
  MapPin,
  Bot,
  Award,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  HelpCircle
} from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import {
  getCandidateProfile,
  getJobs,
  sendAssessment,
  shortlistCandidate,
  rejectCandidate,
  scheduleInterview,
  generateQuestions,
  generateInterviewQuestions,
  sendAIInterview,
  getAIInterviewReport,
  movePipeline
} from "@/services/recruiterAPI";
import { getAssetUrl } from "@/utils/assetUrl";
import DashboardSkeleton from "@/components/recruiter/DashboardSkeleton";
import notify from "@/utils/notify";
import '@/styles/RecruiterLayout.css';

const CAN_SHORTLIST = ["applied", "matched", "assessment_completed"];
const CAN_SEND_ASSESSMENT = ["shortlisted"];
const CAN_SEND_AI_INTERVIEW = ["shortlisted", "assessment_completed"];

export default function CandidateProfile() {
  const { applicationId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobsList, setJobsList] = useState([]);
  const [selectedAssessmentJobId, setSelectedAssessmentJobId] = useState("");

  // Manual Interview Modal
  const [showSchedule, setShowSchedule] = useState(false);
  const [schedule, setSchedule] = useState({
    scheduledAt: "",
    meetingLink: "",
    notes: "",
    interviewType: "video",
  });

  // AI Interview Report State
  const [aiReportData, setAiReportData] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);

  // Send AI Interview Modal State
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [sendingAssessment, setSendingAssessment] = useState(false);
  const [aiConfig, setAiConfig] = useState({
    difficulty: "medium",
    count: 10,
    interviewType: "technical",
  });
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [sendingAI, setSendingAI] = useState(false);
  const [newManualQ, setNewManualQ] = useState("");
  const [showResumeModal, setShowResumeModal] = useState(false);

  const load = async () => {
    try {
      const [res, jList] = await Promise.all([
        getCandidateProfile(applicationId),
        getJobs().catch(() => []) // Fallback for jobs failure
      ]);

      setData(res);
      setJobsList(jList || []);
      const appliedJobId = res.application.jobId._id || res.application.jobId;
      setSelectedAssessmentJobId(appliedJobId);

      if (res?.application?.aiInterviewId || res?.application?.aiInterviewScore > 0 || res?.application?.status === "ai_interview") {
        getAIInterviewReport(applicationId)
          .then((rep) => setAiReportData(rep))
          .catch(() => setAiReportData(null));
      }
    } catch (e) {
      notify.error("Failed to load candidate profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [applicationId]);

  const handleConfirmSendAssessment = async () => {
    setSendingAssessment(true);
    try {
      const appliedJobId = data.application.jobId._id || data.application.jobId;
      const templateJobId = selectedAssessmentJobId || appliedJobId;

      const selectedJob = jobsList.find(j => j._id === templateJobId);
      let preview;
      if (selectedJob && selectedJob.assessmentConfig?.useCustomQuestions) {
        preview = {
          mcqQuestions: selectedJob.assessmentConfig.customMcqQuestions || [],
          codingQuestions: selectedJob.assessmentConfig.customCodingQuestions || []
        };
      } else {
        preview = await generateQuestions(templateJobId);
      }

      await sendAssessment(appliedJobId, applicationId, { recruiterApproved: true, approvedQuestions: preview });
      notify.success("Assessment sent to candidate successfully!");
      setShowAssessmentModal(false);
      load();
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed to send assessment");
    } finally {
      setSendingAssessment(false);
    }
  };

  const handleOpenAIModal = async () => {
    setShowAIModal(true);
    if (interviewQuestions.length === 0) {
      handleGenerateAIQuestions();
    }
  };

  const handleGenerateAIQuestions = async () => {
    setGeneratingQuestions(true);
    try {
      const jobId = data.application.jobId._id || data.application.jobId;
      const qs = await generateInterviewQuestions(jobId, aiConfig);
      setInterviewQuestions(qs || []);
      notify.success(`Generated ${qs?.length || 0} questions for interview`);
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed to generate questions");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleAddManualQuestion = () => {
    if (!newManualQ.trim()) return;
    setInterviewQuestions([
      ...interviewQuestions,
      { question: newManualQ.trim(), expectedPoints: "", difficulty: aiConfig.difficulty },
    ]);
    setNewManualQ("");
  };

  const handleDeleteQuestion = (idx) => {
    setInterviewQuestions(interviewQuestions.filter((_, i) => i !== idx));
  };

  const handleSendAIInterviewSubmit = async () => {
    if (interviewQuestions.length === 0) {
      notify.warn("Please add or generate at least one question");
      return;
    }
    setSendingAI(true);
    try {
      const jobId = data.application.jobId._id || data.application.jobId;
      await sendAIInterview(jobId, applicationId, {
        questions: interviewQuestions.map((q) => q.question),
        difficulty: aiConfig.difficulty,
        interviewType: aiConfig.interviewType,
      });
      notify.success("AI Interview invitation sent to candidate!");
      setShowAIModal(false);
      load();
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed to send AI interview");
    } finally {
      setSendingAI(false);
    }
  };

  const handleSchedule = async () => {
    try {
      await scheduleInterview({ applicationId, ...schedule });
      notify.success("Manual interview scheduled with candidate");
      setShowSchedule(false);
      load();
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed to schedule interview");
    }
  };

  const handleDecisionMove = async (targetStage) => {
    try {
      await movePipeline(applicationId, targetStage, "Recruiter decision from AI Interview Report");
      notify.success(`Candidate stage updated to ${targetStage.toUpperCase()}`);
      load();
    } catch (e) {
      notify.error(e.response?.data?.message || "Cannot advance stage");
    }
  };

  if (loading) return <RecruiterLayout title="Candidate"><DashboardSkeleton /></RecruiterLayout>;
  if (!data) return <RecruiterLayout title="Candidate"><p>Candidate not found</p></RecruiterLayout>;

  const { candidate, match, scores, application, job } = data;
  const resumeUrl = getAssetUrl(candidate.resumeUrl);
  const status = application.status;
  const report = aiReportData?.report || application.aiInterviewReport;

  const selectedJobObj = jobsList.find(j => j._id === selectedAssessmentJobId) || job;

  return (
    <RecruiterLayout title="Candidate Profile">
      <style>{`
        .cp-container { width: 100%; box-sizing: border-box; padding-bottom: 100px; }
        .cp-back { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: var(--text-muted); text-decoration: none; margin-bottom: 24px; transition: color 0.2s; }
        .cp-back:hover { color: var(--primary); }
        
        .cp-header { background: var(--surface); border-radius: 24px; border: 1px solid var(--border); overflow: hidden; margin-bottom: 24px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04); }
        .cp-cover { height: 120px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.04)); position: relative; }
        .cp-badge-top { position: absolute; top: 16px; right: 20px; background: var(--surface); padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; color: var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 6px; border: 1px solid var(--border); z-index: 5; }
        
        .cp-header-content { padding: 0 32px 32px 32px; display: flex; justify-content: space-between; align-items: flex-end; margin-top: -48px; flex-wrap: wrap; gap: 24px; position: relative; z-index: 10; }
        .cp-avatar { width: 96px; height: 96px; border-radius: 24px; background: var(--surface); border: 4px solid var(--surface); display: flex; justify-content: center; align-items: center; font-size: 36px; font-weight: 800; color: var(--primary); box-shadow: 0 8px 24px rgba(0,0,0,0.08); z-index: 2; position: relative; flex-shrink: 0; }
        .cp-title { font-size: 28px; font-weight: 800; color: var(--text); margin: 16px 0 6px 0; letter-spacing: -0.5px; text-align: left; }
        .cp-subtitle { display: flex; align-items: center; gap: 16px; color: var(--text-muted); font-size: 14px; font-weight: 500; flex-wrap: wrap; text-align: left; }
        .cp-subtitle-item { display: flex; align-items: center; gap: 6px; }
        
        .cp-score-block { text-align: right; flex-shrink: 0; margin-left: auto; }
        .cp-score-val { font-size: 48px; font-weight: 900; color: var(--primary); line-height: 1; letter-spacing: -2px; display: flex; align-items: baseline; justify-content: flex-end; gap: 2px; }
        .cp-score-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; margin-top: 6px; }

        .cp-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
        @media (min-width: 1024px) { .cp-grid { grid-template-columns: 2fr 1fr; } }
        
        .cp-card { background: var(--surface); border-radius: 20px; padding: 24px; border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); }
        .cp-card-title { font-size: 17px; font-weight: 700; color: var(--text); margin: 0 0 18px 0; display: flex; align-items: center; gap: 10px; }

        /* Floating dock — pinned to bottom-center of the page (full page, not viewport) */
        .cp-actions-dock {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(calc(-50% + 130px));
          background: color-mix(in srgb, var(--surface) 95%, transparent);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 10px 18px;
          border-radius: 100px;
          border: 1px solid var(--border);
          box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06);
          display: flex;
          gap: 8px;
          z-index: 99;
          align-items: center;
          flex-wrap: wrap;
        }
        .rx-root.collapsed .cp-actions-dock {
          transform: translateX(calc(-50% + 36px));
        }
        @media (max-width: 768px) {
          .cp-actions-dock {
            transform: translateX(-50%);
            bottom: 12px;
            padding: 8px 12px;
            gap: 6px;
            max-width: calc(100vw - 24px);
          }
        }

        .cp-btn { padding: 9px 18px; border-radius: 100px; font-size: 13px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; gap: 7px; transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s; white-space: nowrap; }
        .cp-btn:hover { transform: translateY(-1px); opacity: 0.92; }
        .cp-btn-primary { background: var(--primary); color: #fff; box-shadow: 0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent); }
        .cp-btn-success { background: #10b981; color: #fff; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
        .cp-btn-purple { background: #8b5cf6; color: #fff; box-shadow: 0 4px 12px rgba(139,92,246,0.3); }
        .cp-btn-ghost { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
        .cp-btn-danger { background: color-mix(in srgb, var(--danger) 10%, transparent); color: var(--danger); border: 1px solid color-mix(in srgb, var(--danger) 25%, transparent); }
      `}</style>

      <div className="cp-container">
        <Link to="/recruiter/candidates" className="cp-back">
          <span style={{ fontSize: 18 }}>←</span> Back to Candidates
        </Link>

        {/* Header */}
        <div className="cp-header">
          <div className="cp-cover">
            <div className="cp-badge-top">
              <Sparkles size={14} /> {application.source === "candidate_applied" ? "Applied Candidate" : "Auto-Matched"}
            </div>
          </div>
          <div className="cp-header-content">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", flex: 1, minWidth: 300 }}>
              <div className="cp-avatar">{candidate.fullName?.[0] || "C"}</div>
              <h1 className="cp-title">{candidate.fullName}</h1>
              <div className="cp-subtitle">
                <span className="cp-subtitle-item">
                  <Briefcase size={16} /> {candidate.preferredRole || candidate.education || "Software Engineer"}
                </span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span className="cp-subtitle-item">
                  <MapPin size={16} /> {candidate.location || "Remote"}
                </span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span className="cp-subtitle-item">{candidate.experienceYears ?? "0"} yrs experience</span>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                {candidate.github && (
                  <a href={candidate.github} target="_blank" rel="noreferrer" className="cp-btn cp-btn-ghost" style={{ padding: "6px 14px" }}>
                    <Github size={15} /> GitHub
                  </a>
                )}
                {candidate.linkedin && (
                  <a href={candidate.linkedin} target="_blank" rel="noreferrer" className="cp-btn cp-btn-ghost" style={{ padding: "6px 14px" }}>
                    <Linkedin size={15} /> LinkedIn
                  </a>
                )}
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

            {/* AI INTERVIEW REPORT CARD (if completed or has scores) */}
            {report && (report.overallScore > 0 || report.recommendation !== "Pending") && (
              <div className="cp-card" style={{ border: "2px solid color-mix(in srgb, #8b5cf6 40%, var(--border))", background: "var(--surface)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <h3 className="cp-card-title" style={{ color: "#7c3aed", marginBottom: 4 }}>
                      <Bot size={22} /> AI Interview Report
                    </h3>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      Conducted in real-time by PreepX AI Interviewer
                    </span>
                  </div>
                  <span
                    className="rx-badge"
                    style={{
                      background: report.recommendation === "Strong Hire" ? "#ecfdf5" : report.recommendation === "Hire" ? "#eff6ff" : "#fef2f2",
                      color: report.recommendation === "Strong Hire" ? "#059669" : report.recommendation === "Hire" ? "#2563eb" : "#dc2626",
                      border: `1px solid ${report.recommendation === "Strong Hire" ? "#a7f3d0" : "#bfdbfe"}`,
                      fontSize: 13,
                      fontWeight: 800,
                      padding: "6px 14px",
                    }}
                  >
                    Recommendation: {report.recommendation}
                  </span>
                </div>

                {/* 4-Metric Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                  <div style={{ background: "var(--bg)", padding: 12, borderRadius: 12, textAlign: "center", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>TECHNICAL</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#6366f1" }}>{report.technicalScore || 0}%</div>
                  </div>
                  <div style={{ background: "var(--bg)", padding: 12, borderRadius: 12, textAlign: "center", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>PROBLEM SOLVING</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#8b5cf6" }}>{report.problemSolvingScore || 0}%</div>
                  </div>
                  <div style={{ background: "var(--bg)", padding: 12, borderRadius: 12, textAlign: "center", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>COMMUNICATION</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#06b6d4" }}>{report.communicationScore || 0}%</div>
                  </div>
                  <div style={{ background: "var(--bg)", padding: 12, borderRadius: 12, textAlign: "center", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>OVERALL</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#10b981" }}>{report.overallScore || 0}%</div>
                  </div>
                </div>

                {/* Summary */}
                <div style={{ background: "var(--bg)", padding: 16, borderRadius: 12, marginBottom: 16, border: "1px solid var(--border)" }}>
                  <strong style={{ fontSize: 13, color: "var(--text)", display: "block", marginBottom: 6 }}>Executive AI Summary:</strong>
                  <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{report.summary}</p>
                </div>

                {/* Strengths & Weaknesses */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div style={{ background: "#f0fdf4", padding: 14, borderRadius: 12, border: "1px solid #bbf7d0" }}>
                    <strong style={{ fontSize: 13, color: "#166534", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <CheckCircle2 size={16} /> Key Strengths
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#15803d" }}>
                      {(report.strengths || []).map((st, i) => <li key={i}>{st}</li>)}
                    </ul>
                  </div>

                  <div style={{ background: "#fff1f2", padding: 14, borderRadius: 12, border: "1px solid #fecdd3" }}>
                    <strong style={{ fontSize: 13, color: "#9f1239", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <AlertTriangle size={16} /> Areas to Improve
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#be123c" }}>
                      {(report.weaknesses || []).map((wk, i) => <li key={i}>{wk}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Recruiter Decision Dock right under AI Report */}
                <div style={{ background: "color-mix(in srgb, var(--primary) 6%, transparent)", padding: 16, borderRadius: 14, border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <strong style={{ fontSize: 14, color: "var(--text)" }}>Recruiter Next Step:</strong>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Hire/Offer directly or schedule an optional human verification round.</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" className="cp-btn cp-btn-success" onClick={() => handleDecisionMove("offered")}>
                      <Award size={15} /> Offer Job
                    </button>
                    <button type="button" className="cp-btn cp-btn-ghost" onClick={() => setShowSchedule(true)}>
                      <Calendar size={15} /> Optional Manual Round
                    </button>
                    <button type="button" className="cp-btn cp-btn-danger" onClick={() => rejectCandidate(applicationId).then(() => { notify.success("Candidate rejected"); load(); })}>
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                </div>

                {/* Expandable Transcript */}
                {aiReportData?.transcript?.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0 }}
                      onClick={() => setShowTranscript(!showTranscript)}
                    >
                      {showTranscript ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {showTranscript ? "Hide Full Q&A Transcript" : `View Full Q&A Transcript (${aiReportData.transcript.length} questions)`}
                    </button>

                    {showTranscript && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                        {aiReportData.transcript.map((item, idx) => (
                          <div key={idx} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 4 }}>
                              Q{idx + 1}: {item.question}
                            </div>
                            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>
                              <strong>Answer:</strong> {item.userAnswer || "No verbal response provided"}
                            </div>
                            <div style={{ fontSize: 12, color: "#6366f1", fontStyle: "italic" }}>
                              Score: {item.score}/10 — {item.feedback}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* About & Match */}
            <div className="cp-card">
              <h3 className="cp-card-title">About Candidate</h3>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text)" }}>{candidate.bio || "No bio provided."}</p>

              <div style={{ background: "color-mix(in srgb, var(--primary) 8%, transparent)", borderRadius: 16, padding: 20, border: "1px solid color-mix(in srgb, var(--primary) 15%, transparent)", marginTop: 20 }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: 15, color: "var(--primary)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Sparkles size={16} /> PreepX AI Match Analysis
                </h4>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--text)" }}>{match.explanation || "Candidate matches key technical criteria."}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="cp-card">
              <h3 className="cp-card-title">Skills Analysis</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {(match.matchedSkills || []).map((s) => (
                  <span key={s} style={{ background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0", padding: "6px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
                    ✓ {s}
                  </span>
                ))}
                {(match.missingSkills || []).map((s) => (
                  <span key={s} style={{ background: "var(--bg)", color: "var(--text-muted)", border: "1px dashed var(--border)", padding: "6px 14px", borderRadius: 10, fontSize: 13 }}>
                    ✕ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Resume */}
            <div className="cp-card">
              <h3 className="cp-card-title"><FileText size={18} color="var(--primary)" /> Candidate Resume</h3>
              {resumeUrl ? (
                <div>
                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="cp-btn cp-btn-primary"
                      onClick={() => setShowResumeModal(true)}
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      <FileText size={16} /> View Resume
                    </button>
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="cp-btn cp-btn-ghost"
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      <ExternalLink size={16} /> Open in New Tab
                    </a>
                  </div>

                  {/* Preview thumbnail */}
                  <div
                    style={{
                      background: "var(--bg)",
                      borderRadius: 16,
                      border: "1px solid var(--border)",
                      padding: 32,
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    onClick={() => setShowResumeModal(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setShowResumeModal(true)}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--primary) 12%, transparent)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ width: 64, height: 80, margin: "0 auto 16px", background: "color-mix(in srgb, var(--primary) 10%, transparent)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid color-mix(in srgb, var(--primary) 20%, transparent)" }}>
                      <FileText size={32} color="var(--primary)" />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                      {candidate.resumeFileName || "Resume.pdf"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Click to view full resume</div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 40, textAlign: "center", background: "var(--bg)", borderRadius: 16, border: "1px dashed var(--border)", color: "var(--text-muted)" }}>
                  <FileText size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
                  <div style={{ fontWeight: 600 }}>No resume uploaded</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>Candidate hasn't uploaded a resume yet.</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="cp-card" style={{ position: "sticky", top: 24 }}>
              <h3 className="cp-card-title">Score Breakdown</h3>

              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  <span>Skills Match</span><span>{application.skillsScore ?? 0}%</span>
                </div>
                <div style={{ height: 6, background: "var(--bg)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${application.skillsScore ?? 0}%`, height: "100%", background: "var(--primary)" }} />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  <span>Experience</span><span>{application.experienceScore ?? 0}%</span>
                </div>
                <div style={{ height: 6, background: "var(--bg)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${application.experienceScore ?? 0}%`, height: "100%", background: "var(--primary)" }} />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  <span>Technical Assessment</span><span>{scores.assessment ?? 0}%</span>
                </div>
                <div style={{ height: 6, background: "var(--bg)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${scores.assessment ?? 0}%`, height: "100%", background: "#10b981" }} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  <span>AI Interview</span><span>{application.aiInterviewScore || scores.aiInterview || 0}%</span>
                </div>
                <div style={{ height: 6, background: "var(--bg)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${application.aiInterviewScore || scores.aiInterview || 0}%`, height: "100%", background: "#8b5cf6" }} />
                </div>
              </div>

              <div style={{ padding: 16, background: "var(--bg)", borderRadius: 14, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Applied Job</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>{job?.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>{job?.role}</div>
                <span className="rx-badge rx-badge-blue" style={{ textTransform: "capitalize", fontSize: 11 }}>
                  Stage: {status.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Dock */}
      <div className="cp-actions-dock">
        {CAN_SHORTLIST.includes(status) && (
          <button type="button" className="cp-btn cp-btn-success" onClick={() => shortlistCandidate(applicationId).then(() => { notify.success("Candidate shortlisted"); load(); })}>
            <Star size={16} /> Shortlist
          </button>
        )}

        {CAN_SEND_ASSESSMENT.includes(status) && !application.assessmentId && (
          <button type="button" className="cp-btn cp-btn-primary" onClick={() => setShowAssessmentModal(true)}>
            <Send size={16} /> Send Assessment
          </button>
        )}

        {CAN_SEND_AI_INTERVIEW.includes(status) && (
          <button type="button" className="cp-btn cp-btn-purple" onClick={handleOpenAIModal}>
            <Bot size={16} /> Send AI Interview
          </button>
        )}

        <button type="button" className="cp-btn cp-btn-ghost" onClick={() => setShowSchedule(true)}>
          <Calendar size={16} /> Schedule Manual
        </button>

        {status !== "rejected" && status !== "hired" && (
          <button type="button" className="cp-btn cp-btn-danger" onClick={() => rejectCandidate(applicationId).then(() => { notify.success("Candidate rejected"); load(); })}>
            <XCircle size={16} /> Reject
          </button>
        )}
      </div>

      {/* ─── Resume Viewer Modal ─── */}
      {showResumeModal && resumeUrl && (
        <div
          className="rx-modal-overlay"
          onClick={() => setShowResumeModal(false)}
          style={{ zIndex: 300, padding: 0, alignItems: "stretch" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: 900,
              height: "100vh",
              background: "var(--surface)",
              borderRadius: 0,
              overflow: "hidden",
              margin: "0 auto",
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface)",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FileText size={20} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
                    {candidate.resumeFileName || "Resume.pdf"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{candidate.fullName}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="cp-btn cp-btn-ghost"
                  style={{ padding: "7px 14px" }}
                >
                  <ExternalLink size={15} /> Open in New Tab
                </a>
                <button
                  type="button"
                  className="cp-btn cp-btn-ghost"
                  onClick={() => setShowResumeModal(false)}
                  style={{ padding: "7px 14px" }}
                >
                  <XCircle size={15} /> Close
                </button>
              </div>
            </div>

            {/* PDF Viewer - Google Docs viewer works for both Cloudinary and local URLs */}
            <iframe
              title="Resume Viewer"
              src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(resumeUrl)}`}
              style={{
                flex: 1,
                width: "100%",
                border: "none",
                background: "#f8f8f8",
                minHeight: 0,
              }}
            />
          </div>
        </div>
      )}

      {/* AI Interview Question Configuration Modal */}
      {showAIModal && (
        <div className="rx-modal-overlay" onClick={() => setShowAIModal(false)}>
          <div className="rx-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <Bot size={20} color="#8b5cf6" /> Configure AI Interview
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                  PreepX AI conducts this interview live with the candidate.
                </p>
              </div>
              <button type="button" className="rx-btn rx-btn-secondary" onClick={() => setShowAIModal(false)}>
                Close
              </button>
            </div>

            <div style={{ marginTop: 16 }}>
              {/* Question Generation Options */}
              <div style={{ background: "var(--background)", padding: 14, borderRadius: 12, marginBottom: 16 }}>
                <strong style={{ fontSize: 13, display: "block", marginBottom: 10 }}>AI Question Generator Settings:</strong>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>Difficulty</label>
                    <select
                      value={aiConfig.difficulty}
                      onChange={(e) => setAiConfig({ ...aiConfig, difficulty: e.target.value })}
                      className="rx-premium-input"
                      style={{ padding: "4px 8px", fontSize: 12 }}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>Question Count</label>
                    <select
                      value={aiConfig.count}
                      onChange={(e) => setAiConfig({ ...aiConfig, count: Number(e.target.value) })}
                      className="rx-premium-input"
                      style={{ padding: "4px 8px", fontSize: 12 }}
                    >
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={15}>15 Questions</option>
                    </select>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      className="rx-btn rx-btn-secondary"
                      disabled={generatingQuestions}
                      onClick={handleGenerateAIQuestions}
                      style={{ fontSize: 12 }}
                    >
                      <Sparkles size={14} /> {generatingQuestions ? "Generating..." : "Regenerate AI Questions"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Add Manual Question */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                  value={newManualQ}
                  onChange={(e) => setNewManualQ(e.target.value)}
                  placeholder="Or type a custom interview question to add..."
                  className="rx-premium-input"
                  style={{ flex: 1, fontSize: 13 }}
                  onKeyDown={(e) => e.key === "Enter" && handleAddManualQuestion()}
                />
                <button type="button" className="rx-btn rx-btn-secondary" onClick={handleAddManualQuestion}>
                  <Plus size={16} /> Add
                </button>
              </div>

              {/* Question Review List */}
              <h4 style={{ margin: "0 0 10px 0", fontSize: 14 }}>
                Review Interview Questions ({interviewQuestions.length}):
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto", paddingRight: 4 }}>
                {interviewQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "10px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 13, color: "var(--text)" }}>
                      <strong>{idx + 1}.</strong> {q.question}
                    </span>
                    <button
                      type="button"
                      className="rx-btn rx-btn-danger"
                      style={{ padding: "3px 6px" }}
                      onClick={() => handleDeleteQuestion(idx)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                <button type="button" className="rx-btn rx-btn-secondary" onClick={() => setShowAIModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="rx-btn cp-btn-purple"
                  disabled={sendingAI || interviewQuestions.length === 0}
                  onClick={handleSendAIInterviewSubmit}
                >
                  <Bot size={16} /> {sendingAI ? "Sending Invitation..." : "Send AI Interview"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Interview Schedule Modal */}
      {showSchedule && (
        <div className="rx-modal-overlay" onClick={() => setShowSchedule(false)}>
          <div className="rx-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <h3>Schedule Manual Interview</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 16px 0" }}>
              Optional human evaluation round for technical or leadership verification.
            </p>
            <div className="rx-form">
              <div>
                <label>Interview Round / Type</label>
                <select
                  value={schedule.interviewType}
                  onChange={(e) => setSchedule({ ...schedule, interviewType: e.target.value })}
                  className="rx-premium-input"
                >
                  <option value="video">Technical Video Call</option>
                  <option value="phone">Phone Screening</option>
                  <option value="in_person">In-Person Final Round</option>
                </select>
              </div>
              <div>
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  value={schedule.scheduledAt}
                  onChange={(e) => setSchedule({ ...schedule, scheduledAt: e.target.value })}
                />
              </div>
              <div>
                <label>Meeting Link (Google Meet / Zoom)</label>
                <input
                  value={schedule.meetingLink}
                  onChange={(e) => setSchedule({ ...schedule, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/..."
                />
              </div>
              <div>
                <label>Preparation Notes for Candidate</label>
                <textarea
                  rows={3}
                  value={schedule.notes}
                  onChange={(e) => setSchedule({ ...schedule, notes: e.target.value })}
                  placeholder="e.g. System design discussion regarding payment gateway architecture."
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button type="button" className="rx-btn rx-btn-secondary" onClick={() => setShowSchedule(false)}>
                  Cancel
                </button>
                <button type="button" className="rx-btn rx-btn-primary" onClick={handleSchedule}>
                  Schedule Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Send Assessment Popup Modal */}
      {showAssessmentModal && (
        <div className="rx-modal-overlay" onClick={() => setShowAssessmentModal(false)}>
          <div className="rx-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, borderRadius: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Send size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, color: "var(--text)" }}>Send Technical Assessment</h3>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Confirm assessment invitation for candidate</span>
                </div>
              </div>
              <button type="button" className="rx-btn rx-btn-secondary" style={{ padding: "4px 8px" }} onClick={() => setShowAssessmentModal(false)}>
                ✕
              </button>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 13, marginBottom: 12 }}>
                  Candidate: <strong>{candidate.fullName}</strong> ({candidate.email})
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>
                  SELECT ASSESSMENT TO SEND:
                </div>
                <select
                  value={selectedAssessmentJobId}
                  onChange={(e) => setSelectedAssessmentJobId(e.target.value)}
                  className="rx-premium-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: 13 }}
                >
                  {jobsList.map(j => (
                    <option key={j._id} value={j._id}>
                      {j.title} ({j.role}) {j._id === (job?._id || job) ? "(Applied Job)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>TEST FORMAT</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--primary)", marginTop: 2 }}>
                    {selectedJobObj?.assessmentConfig?.includeCoding === false || selectedJobObj?.assessmentConfig?.codingCount === 0
                      ? `${selectedJobObj?.assessmentConfig?.mcqCount || 20} MCQ (Objective Only)`
                      : `${selectedJobObj?.assessmentConfig?.mcqCount || 20} MCQ + ${selectedJobObj?.assessmentConfig?.codingCount || 2} Coding`}
                  </div>
                </div>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>TIME LIMIT</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#10b981", marginTop: 2 }}>
                    {selectedJobObj?.assessmentConfig?.durationMinutes || 60} Minutes
                  </div>
                </div>
              </div>

              <div style={{ background: "color-mix(in srgb, #3b82f6 10%, transparent)", border: "1px solid color-mix(in srgb, #3b82f6 20%, transparent)", borderRadius: 10, padding: 12, fontSize: 13, color: "var(--text)", lineHeight: 1.5, marginBottom: 20 }}>
                💡 An invitation with test instructions and link will be automatically delivered to the candidate's dashboard and email.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  className="rx-btn rx-btn-secondary"
                  disabled={sendingAssessment}
                  onClick={() => setShowAssessmentModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rx-btn rx-btn-primary"
                  disabled={sendingAssessment}
                  onClick={handleConfirmSendAssessment}
                >
                  <Send size={15} /> {sendingAssessment ? "Sending Test..." : "Send Assessment Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RecruiterLayout>
  );
}
