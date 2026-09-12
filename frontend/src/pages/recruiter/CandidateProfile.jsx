import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Send, Star, XCircle, Calendar, Sparkles, FileText, ExternalLink,
  Github, Linkedin, Briefcase, MapPin, Bot, Award, CheckCircle2,
  AlertTriangle, ChevronDown, ChevronUp, Plus, Trash2,
  ArrowLeft, TrendingUp, Zap, Shield, Clock, BarChart3, MessageSquare
} from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import {
  getCandidateProfile, getJobs, sendAssessment, shortlistCandidate,
  rejectCandidate, scheduleInterview, generateQuestions,
  generateInterviewQuestions, sendAIInterview, getAIInterviewReport, movePipeline
} from "@/services/recruiterAPI";
import { getAssetUrl } from "@/utils/assetUrl";
import DashboardSkeleton from "@/components/recruiter/DashboardSkeleton";
import notify from "@/utils/notify";
import '@/styles/RecruiterLayout.css';

const CAN_SHORTLIST = ["applied", "matched", "assessment_completed"];
const CAN_SEND_ASSESSMENT = ["shortlisted"];
const CAN_SEND_AI_INTERVIEW = ["shortlisted", "assessment_completed"];

function ProgressBar({ value = 0, color = "var(--primary)" }) {
  return (
    <div style={{ height: 8, background: "var(--bg)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${value}%`, background: color, borderRadius: 99,
        transition: "width 1.2s cubic-bezier(.4,0,.2,1)",
        boxShadow: `0 0 8px ${color}50`
      }} />
    </div>
  );
}

export default function CandidateProfile() {
  const { applicationId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobsList, setJobsList] = useState([]);
  const [selectedAssessmentJobId, setSelectedAssessmentJobId] = useState("");

  const [showSchedule, setShowSchedule] = useState(false);
  const [schedule, setSchedule] = useState({ scheduledAt: "", meetingLink: "", notes: "", interviewType: "video" });
  const [aiReportData, setAiReportData] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [sendingAssessment, setSendingAssessment] = useState(false);
  const [aiConfig, setAiConfig] = useState({ difficulty: "medium", count: 10, interviewType: "technical" });
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [sendingAI, setSendingAI] = useState(false);
  const [newManualQ, setNewManualQ] = useState("");
  const [showResumeModal, setShowResumeModal] = useState(false);

  const load = async () => {
    try {
      const [res, jList] = await Promise.all([
        getCandidateProfile(applicationId),
        getJobs().catch(() => [])
      ]);
      setData(res);
      setJobsList(jList || []);
      const appliedJobId = res.application.jobId._id || res.application.jobId;
      setSelectedAssessmentJobId(appliedJobId);
      if (res?.application?.aiInterviewId || res?.application?.aiInterviewScore > 0 || res?.application?.status === "ai_interview") {
        getAIInterviewReport(applicationId).then(r => setAiReportData(r)).catch(() => setAiReportData(null));
      }
    } catch {
      notify.error("Failed to load candidate profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [applicationId]);

  const handleConfirmSendAssessment = async () => {
    setSendingAssessment(true);
    try {
      const appliedJobId = data.application.jobId._id || data.application.jobId;
      const templateJobId = selectedAssessmentJobId || appliedJobId;
      const selectedJob = jobsList.find(j => j._id === templateJobId);
      let preview;
      if (selectedJob?.assessmentConfig?.useCustomQuestions) {
        preview = { mcqQuestions: selectedJob.assessmentConfig.customMcqQuestions || [], codingQuestions: selectedJob.assessmentConfig.customCodingQuestions || [] };
      } else { preview = await generateQuestions(templateJobId); }
      await sendAssessment(appliedJobId, applicationId, { recruiterApproved: true, approvedQuestions: preview });
      notify.success("Assessment sent successfully!");
      setShowAssessmentModal(false); load();
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed to send assessment");
    } finally { setSendingAssessment(false); }
  };

  const handleOpenAIModal = async () => {
    setShowAIModal(true);
    if (interviewQuestions.length === 0) handleGenerateAIQuestions();
  };

  const handleGenerateAIQuestions = async () => {
    setGeneratingQuestions(true);
    try {
      const jobId = data.application.jobId._id || data.application.jobId;
      const qs = await generateInterviewQuestions(jobId, aiConfig);
      setInterviewQuestions(qs || []);
      notify.success(`Generated ${qs?.length || 0} questions`);
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed to generate questions");
    } finally { setGeneratingQuestions(false); }
  };

  const handleAddManualQuestion = () => {
    if (!newManualQ.trim()) return;
    setInterviewQuestions([...interviewQuestions, { question: newManualQ.trim(), expectedPoints: "", difficulty: aiConfig.difficulty }]);
    setNewManualQ("");
  };

  const handleDeleteQuestion = idx => setInterviewQuestions(interviewQuestions.filter((_, i) => i !== idx));

  const handleSendAIInterviewSubmit = async () => {
    if (interviewQuestions.length === 0) { notify.warn("Add at least one question"); return; }
    setSendingAI(true);
    try {
      const jobId = data.application.jobId._id || data.application.jobId;
      await sendAIInterview(jobId, applicationId, { questions: interviewQuestions.map(q => q.question), difficulty: aiConfig.difficulty, interviewType: aiConfig.interviewType });
      notify.success("AI Interview invitation sent!");
      setShowAIModal(false); load();
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed to send AI interview");
    } finally { setSendingAI(false); }
  };

  const handleSchedule = async () => {
    try {
      await scheduleInterview({ applicationId, ...schedule });
      notify.success("Manual interview scheduled");
      setShowSchedule(false); load();
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed to schedule");
    }
  };

  const handleDecisionMove = async (targetStage) => {
    try {
      await movePipeline(applicationId, targetStage, "Recruiter decision from AI Interview Report");
      notify.success(`Stage updated to ${targetStage.toUpperCase()}`);
      load();
    } catch (e) {
      notify.error(e.response?.data?.message || "Cannot advance stage");
    }
  };

  if (loading) return <RecruiterLayout title="Candidate"><DashboardSkeleton /></RecruiterLayout>;
  if (!data) return <RecruiterLayout title="Candidate"><p style={{ padding: 40, color: "var(--text-muted)" }}>Candidate not found</p></RecruiterLayout>;

  const { candidate, match, scores, application, job, platformStats } = data;
  const resumeUrl = getAssetUrl(candidate.resumeUrl);
  const status = application.status;
  const report = aiReportData?.report || application.aiInterviewReport;
  const selectedJobObj = jobsList.find(j => j._id === selectedAssessmentJobId) || job;
  const pStats = platformStats || {};

  const sc = {
    applied: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    matched: { bg: "#f0fdf4", color: "#059669", border: "#a7f3d0" },
    shortlisted: { bg: "#fef3c7", color: "#d97706", border: "#fde68a" },
    assessment_completed: { bg: "#f0fdf4", color: "#059669", border: "#a7f3d0" },
    ai_interview: { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
    offered: { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
    hired: { bg: "#ecfdf5", color: "#065f46", border: "#6ee7b7" },
    rejected: { bg: "#fff1f2", color: "#be123c", border: "#fecdd3" },
  }[status] || { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" };

  const scoreRows = [
    { label: "Skills Match", icon: <TrendingUp size={12} color="#6366f1" />, val: application.skillsScore ?? 0, color: "#6366f1" },
    { label: "Experience", icon: <Briefcase size={12} color="#8b5cf6" />, val: application.experienceScore ?? 0, color: "#8b5cf6" },
    { label: "Assessment", icon: <Shield size={12} color="#10b981" />, val: scores.assessment ?? 0, color: "#10b981" },
    { label: "AI Interview", icon: <Bot size={12} color="#7c3aed" />, val: application.aiInterviewScore || scores.aiInterview || 0, color: "#7c3aed" },
  ];

  const aiMetrics = report ? [
    { label: "Technical", val: report.technicalScore || 0, color: "#6366f1" },
    { label: "Problem Solving", val: report.problemSolvingScore || 0, color: "#8b5cf6" },
    { label: "Communication", val: report.communicationScore || 0, color: "#06b6d4" },
    { label: "Overall", val: report.overallScore || 0, color: "#10b981" },
  ] : [];

  return (
    <RecruiterLayout title="Candidate Profile">
      <style>{`
        .cp-page { width: 100%; box-sizing: border-box; padding-bottom: 110px; }

        /* Back link */
        .cp-back { display:inline-flex; align-items:center; gap:8px; font-size:13px; font-weight:600; color:var(--text-muted); text-decoration:none; margin-bottom:20px; padding:8px 14px; border-radius:99px; background:var(--surface); border:1px solid var(--border); transition:all .2s; box-shadow:0 1px 4px rgba(0,0,0,.04); }
        .cp-back:hover { color:var(--primary); border-color:var(--primary); transform:translateX(-2px); }

        /* Hero */
        .cp-hero { background:var(--surface); border:1px solid var(--border); border-radius:24px; overflow:hidden; margin-bottom:24px; box-shadow:0 4px 32px rgba(0,0,0,.07); }
        .cp-hero-cover { height:140px; background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#06b6d4 100%); position:relative; overflow:hidden; }
        .cp-hero-cover::before { content:""; position:absolute; inset:0; background-image:radial-gradient(circle,rgba(255,255,255,.07) 1px,transparent 1px); background-size:28px 28px; }
        .cp-source-pill { position:absolute; top:18px; right:20px; background:rgba(255,255,255,.18); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); padding:6px 14px; border-radius:99px; font-size:12px; font-weight:700; color:#fff; display:flex; align-items:center; gap:6px; border:1px solid rgba(255,255,255,.28); }
        .cp-hero-body { padding:0 32px 28px; display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:20px; margin-top:-52px; position:relative; z-index:2; }
        @media(max-width:640px){ .cp-hero-body{padding:0 20px 24px; margin-top:-44px;} }

        .cp-avatar-wrap { position:relative; }
        .cp-avatar { width:100px; height:100px; border-radius:28px; background:linear-gradient(135deg,#4f46e5,#7c3aed); border:4px solid var(--surface); display:flex; align-items:center; justify-content:center; font-size:38px; font-weight:900; color:#fff; box-shadow:0 8px 32px rgba(79,70,229,.35); flex-shrink:0; }
        @media(max-width:640px){ .cp-avatar{width:80px; height:80px; font-size:28px; border-radius:22px;} }
        .cp-avatar-dot { position:absolute; bottom:-2px; right:-2px; width:22px; height:22px; border-radius:99px; border:3px solid var(--surface); display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:900; }

        .cp-hero-info { flex:1; min-width:220px; }
        .cp-hero-name { font-size:26px; font-weight:900; color:var(--text); letter-spacing:-.6px; margin:14px 0 8px; line-height:1.1; }
        @media(max-width:640px){ .cp-hero-name{font-size:20px; margin-top:12px;} }
        .cp-hero-meta { display:flex; flex-wrap:wrap; gap:8px; }
        .cp-meta-chip { display:flex; align-items:center; gap:5px; background:var(--bg); padding:4px 10px; border-radius:99px; border:1px solid var(--border); font-size:12px; color:var(--text-muted); font-weight:500; }
        .cp-social-links { display:flex; gap:8px; margin-top:14px; flex-wrap:wrap; }
        .cp-social-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:10px; font-size:12px; font-weight:700; border:1px solid var(--border); background:var(--surface); color:var(--text); cursor:pointer; text-decoration:none; transition:all .2s; font-family:inherit; }
        .cp-social-btn:hover { background:var(--bg); border-color:var(--primary); color:var(--primary); }

        /* Score widget */
        .cp-score-widget { background:linear-gradient(135deg,rgba(79,70,229,.09),rgba(124,58,237,.06)); border:1px solid rgba(79,70,229,.2); border-radius:20px; padding:20px 24px; text-align:center; flex-shrink:0; min-width:140px; }
        .cp-score-num { font-size:52px; font-weight:900; background:linear-gradient(135deg,#4f46e5,#7c3aed); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; line-height:1; letter-spacing:-3px; }
        .cp-score-pct { font-size:22px; letter-spacing:0; }
        .cp-score-lbl { font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.06em; margin-top:4px; }
        .cp-stage-pill { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:99px; font-size:11px; font-weight:700; margin-top:10px; text-transform:capitalize; border:1px solid; }

        /* Two-col layout */
        .cp-layout { display:grid; grid-template-columns:1fr; gap:20px; }
        @media(min-width:1024px){ .cp-layout{grid-template-columns:minmax(0,2fr) minmax(0,1fr);} }

        /* Cards */
        .cp-card { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:24px; box-shadow:0 2px 12px rgba(0,0,0,.04); }
        .cp-card-hd { font-size:15px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:10px; margin:0 0 18px; }
        .cp-card-hd-icon { width:32px; height:32px; border-radius:10px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }

        /* AI report */
        .cp-ai-card { background:var(--surface); border:2px solid rgba(124,58,237,.3); border-radius:20px; padding:24px; box-shadow:0 0 0 4px rgba(124,58,237,.05),0 4px 24px rgba(0,0,0,.06); position:relative; overflow:hidden; }
        .cp-ai-card::before { content:""; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#7c3aed,#4f46e5,#06b6d4); }

        /* Metrics grid */
        .cp-metrics-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:20px; }
        @media(max-width:600px){ .cp-metrics-grid{grid-template-columns:repeat(2,1fr);} }
        .cp-metric-box { background:var(--bg); border:1px solid var(--border); border-radius:14px; padding:14px 10px; text-align:center; transition:transform .2s,box-shadow .2s; }
        .cp-metric-box:hover { transform:translateY(-2px); box-shadow:0 4px 16px rgba(0,0,0,.08); }
        .cp-metric-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--text-muted); margin-bottom:6px; }
        .cp-metric-val { font-size:24px; font-weight:900; line-height:1; }

        /* S/W grid */
        .cp-sw-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; }
        @media(max-width:640px){ .cp-sw-grid{grid-template-columns:1fr;} }
        .cp-sw-box { padding:14px; border-radius:14px; border:1px solid; }
        .cp-sw-box ul { margin:0; padding-left:16px; display:flex; flex-direction:column; gap:4px; }
        .cp-sw-box li { font-size:13px; line-height:1.5; }
        .cp-sw-title { font-size:13px; font-weight:700; display:flex; align-items:center; gap:6px; margin-bottom:10px; }

        /* Decision bar */
        .cp-decision-bar { background:linear-gradient(135deg,rgba(79,70,229,.05),rgba(124,58,237,.03)); border:1px solid rgba(79,70,229,.15); border-radius:16px; padding:16px 20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
        .cp-decision-btns { display:flex; gap:8px; flex-wrap:wrap; }

        /* Transcript */
        .cp-transcript-item { background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:14px; transition:border-color .2s; }
        .cp-transcript-item:hover { border-color:var(--primary-light); }
        .cp-transcript-btn { background:none; border:1px solid var(--border); color:var(--primary); font-weight:700; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:99px; margin-top:16px; font-family:inherit; transition:all .2s; }
        .cp-transcript-btn:hover { background:rgba(79,70,229,.06); border-color:var(--primary); }

        /* Skills */
        .cp-skill-matched { background:#ecfdf5; color:#059669; border:1px solid #a7f3d0; padding:5px 11px; border-radius:8px; font-size:12px; font-weight:600; display:flex; align-items:center; gap:5px; }
        .cp-skill-missing { background:var(--bg); color:var(--text-muted); border:1px dashed var(--border); padding:5px 11px; border-radius:8px; font-size:12px; }

        /* Score rows */
        .cp-score-row { margin-bottom:16px; }
        .cp-score-row-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
        .cp-score-row-label { font-size:13px; font-weight:600; color:var(--text); display:flex; align-items:center; gap:6px; }
        .cp-score-row-val { font-size:13px; font-weight:800; }

        /* Job chip */
        .cp-job-chip { background:var(--bg); border:1px solid var(--border); border-radius:14px; padding:14px 16px; }
        .cp-job-chip-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--text-muted); margin-bottom:4px; }
        .cp-job-chip-title { font-size:15px; font-weight:800; color:var(--text); margin-bottom:2px; }
        .cp-job-chip-role { font-size:12px; color:var(--text-muted); margin-bottom:10px; }

        /* Match analysis box */
        .cp-match-box { background:linear-gradient(135deg,rgba(79,70,229,.07),rgba(6,182,212,.04)); border:1px solid rgba(79,70,229,.15); border-radius:16px; padding:18px; margin-top:18px; }
        .cp-match-box-title { font-size:14px; font-weight:800; color:var(--primary); display:flex; align-items:center; gap:8px; margin-bottom:8px; }

        /* Resume preview */
        .cp-resume-preview { background:var(--bg); border:2px dashed var(--border); border-radius:16px; padding:36px; text-align:center; cursor:pointer; transition:all .2s; }
        .cp-resume-preview:hover { border-color:var(--primary); background:rgba(79,70,229,.04); box-shadow:0 0 0 4px rgba(79,70,229,.08); }
        .cp-resume-icon { width:64px; height:80px; margin:0 auto 14px; background:linear-gradient(135deg,rgba(79,70,229,.1),rgba(124,58,237,.08)); border-radius:12px; display:flex; align-items:center; justify-content:center; border:2px solid rgba(79,70,229,.2); }

        /* Floating dock */
        .cp-dock { position:fixed; bottom:24px; left:50%; transform:translateX(calc(-50% + 130px)); background:color-mix(in srgb,var(--surface) 93%,transparent); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); padding:10px 16px; border-radius:99px; border:1px solid var(--border); box-shadow:0 8px 40px rgba(0,0,0,.18),0 2px 8px rgba(0,0,0,.08); display:flex; gap:8px; align-items:center; flex-wrap:wrap; z-index:99; }
        .rx-root.collapsed .cp-dock { transform:translateX(calc(-50% + 36px)); }
        @media(max-width:768px){ .cp-dock{transform:translateX(-50%) !important; bottom:12px; padding:8px 12px; gap:6px; max-width:calc(100vw - 24px);} }

        /* Buttons */
        .cp-btn { padding:9px 18px; border-radius:99px; font-size:13px; font-weight:700; border:none; cursor:pointer; display:flex; align-items:center; gap:7px; transition:all .2s; white-space:nowrap; font-family:inherit; }
        .cp-btn:hover { transform:translateY(-2px); }
        .cp-btn:active { transform:translateY(0); }
        .cp-btn-primary { background:var(--primary); color:#fff; box-shadow:0 4px 14px rgba(79,70,229,.35); }
        .cp-btn-primary:hover { box-shadow:0 6px 20px rgba(79,70,229,.45); }
        .cp-btn-success { background:#10b981; color:#fff; box-shadow:0 4px 14px rgba(16,185,129,.35); }
        .cp-btn-success:hover { box-shadow:0 6px 20px rgba(16,185,129,.45); }
        .cp-btn-purple { background:#7c3aed; color:#fff; box-shadow:0 4px 14px rgba(124,58,237,.35); }
        .cp-btn-purple:hover { box-shadow:0 6px 20px rgba(124,58,237,.45); }
        .cp-btn-ghost { background:var(--surface); color:var(--text); border:1px solid var(--border); }
        .cp-btn-ghost:hover { border-color:var(--primary); color:var(--primary); }
        .cp-btn-danger { background:rgba(239,68,68,.1); color:#ef4444; border:1px solid rgba(239,68,68,.25); }
        .cp-btn-danger:hover { background:rgba(239,68,68,.18); }

        /* Modals */
        .cp-modal-overlay { position:fixed; inset:0; background:rgba(15,23,42,.65); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:200; padding:24px; animation:cpFadeIn .2s ease; }
        .cp-modal { background:var(--surface); border:1px solid var(--border); border-radius:24px; padding:28px; width:100%; box-shadow:0 24px 80px rgba(0,0,0,.2); animation:cpSlideUp .25s cubic-bezier(.4,0,.2,1); position:relative; overflow:hidden; }
        .cp-modal::before { content:""; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--primary),#7c3aed,#06b6d4); }
        @keyframes cpFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes cpSlideUp { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

        /* Inputs */
        .cp-input { width:100%; padding:10px 14px; border-radius:12px; border:1.5px solid var(--border); background:var(--bg); color:var(--text); font-size:14px; font-family:inherit; transition:border-color .2s,box-shadow .2s; box-sizing:border-box; }
        .cp-input:focus { outline:none; border-color:var(--primary); box-shadow:0 0 0 3px rgba(79,70,229,.12); }
        .cp-select { appearance:none; cursor:pointer; }
        .cp-label { font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; display:block; }
      `}</style>

      <div className="cp-page">

        {/* Hero Header */}
        <div className="cp-hero">
          <div className="cp-hero-cover">
            <Link to="/recruiter/candidates" style={{ position: "absolute", top: 18, left: 20, display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.9)", textDecoration: "none", background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", padding: "6px 14px", borderRadius: 99, border: "1px solid rgba(255,255,255,.25)", transition: "background .2s" }}>
              <ArrowLeft size={14} /> Back to Candidates
            </Link>
            <div className="cp-source-pill">
              <Sparkles size={13} />
              {application.source === "candidate_applied" ? "Applied Candidate" : "Auto-Matched"}
            </div>
          </div>
          <div className="cp-hero-body">
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", flex: 1, minWidth: 260, alignItems: "flex-end" }}>
              <div className="cp-avatar-wrap">
                <div className="cp-avatar">{candidate.fullName?.[0] || "C"}</div>
                <div className="cp-avatar-dot" style={{ background: sc.bg, color: sc.color, border: `3px solid var(--surface)` }}>●</div>
              </div>
              <div className="cp-hero-info">
                <h1 className="cp-hero-name">{candidate.fullName}</h1>
                <div className="cp-hero-meta">
                  <span className="cp-meta-chip"><Briefcase size={12} /> {candidate.preferredRole || candidate.education || "Software Engineer"}</span>
                  <span className="cp-meta-chip"><MapPin size={12} /> {candidate.location || "Remote"}</span>
                  <span className="cp-meta-chip"><Clock size={12} /> {match.experienceYears ?? candidate.experienceYears ?? "0"} yrs exp</span>
                </div>
                <div className="cp-social-links">
                  {candidate.github && <a href={candidate.github} target="_blank" rel="noreferrer" className="cp-social-btn"><Github size={14} /> GitHub</a>}
                  {candidate.linkedin && <a href={candidate.linkedin} target="_blank" rel="noreferrer" className="cp-social-btn"><Linkedin size={14} /> LinkedIn</a>}
                  {resumeUrl && <button type="button" className="cp-social-btn" onClick={() => setShowResumeModal(true)}><FileText size={14} /> Resume</button>}
                </div>
              </div>
            </div>
            <div className="cp-score-widget">
              <div className="cp-score-num">{match.score}<span className="cp-score-pct">%</span></div>
              <div className="cp-score-lbl">Overall Match</div>
              <div className="cp-stage-pill" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>{status.replace(/_/g, " ")}</div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="cp-layout">
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* AI Interview Report */}
            {report && (report.overallScore > 0 || report.recommendation !== "Pending") && (
              <div className="cp-ai-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div className="cp-card-hd" style={{ color: "#7c3aed", marginBottom: 4 }}>
                      <div className="cp-card-hd-icon" style={{ background: "rgba(124,58,237,.12)" }}><Bot size={17} color="#7c3aed" /></div>
                      PreepX Report
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: -10 }}>
                      {report.interviewType ? `${report.interviewType.charAt(0).toUpperCase() + report.interviewType.slice(1)} Interview` : "AI Interview"}
                      {report.completedAt ? ` · ${new Date(report.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : ""}
                      {" · Evaluated by PreepX AI"}
                    </div>
                  </div>
                  <span style={{
                    padding: "7px 16px", borderRadius: 99, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 6,
                    background: report.recommendation === "Strong Hire" ? "#ecfdf5" : report.recommendation === "Hire" ? "#eff6ff" : "#fff1f2",
                    color: report.recommendation === "Strong Hire" ? "#059669" : report.recommendation === "Hire" ? "#2563eb" : "#dc2626",
                    border: `1px solid ${report.recommendation === "Strong Hire" ? "#a7f3d0" : report.recommendation === "Hire" ? "#bfdbfe" : "#fecdd3"}`,
                  }}>
                    <Shield size={13} /> {report.recommendation}
                  </span>
                </div>

                {/* Platform Stats — 3 chips */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
                  {[
                    { icon: <BarChart3 size={18} color="#6366f1" />, iconBg: "rgba(99,102,241,.15)", val: pStats.totalInterviews ?? 0, label: "Interviews" },
                    { icon: <Award size={18} color="#06b6d4" />, iconBg: "rgba(6,182,212,.15)", val: pStats.totalMcqExams ?? 0, label: "MCQ Exams" },
                    { icon: <TrendingUp size={18} color="#10b981" />, iconBg: "rgba(16,185,129,.15)", val: `${pStats.avgScore ?? 0}%`, label: "Avg Score" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius: 16, padding: "16px 14px", display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(99,102,241,.2)" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{s.val}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.55)", fontWeight: 600, marginTop: 3 }}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "var(--bg)", borderRadius: 14, padding: "14px 16px", marginBottom: 14, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>AI Executive Summary</div>
                  <p style={{ margin: 0, fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>{report.summary}</p>
                </div>

                <div className="cp-sw-grid">
                  <div className="cp-sw-box" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                    <div className="cp-sw-title" style={{ color: "#166534" }}><CheckCircle2 size={15} /> Key Strengths</div>
                    <ul>{(report.strengths || []).map((st, i) => <li key={i} style={{ color: "#15803d" }}>{st}</li>)}</ul>
                  </div>
                  <div className="cp-sw-box" style={{ background: "#fff1f2", borderColor: "#fecdd3" }}>
                    <div className="cp-sw-title" style={{ color: "#9f1239" }}><AlertTriangle size={15} /> Areas to Improve</div>
                    <ul>{(report.weaknesses || []).map((wk, i) => <li key={i} style={{ color: "#be123c" }}>{wk}</li>)}</ul>
                  </div>
                </div>

                <div className="cp-decision-bar">
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 2 }}>Recruiter Next Step</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Offer directly or schedule an optional human verification round.</div>
                  </div>
                  <div className="cp-decision-btns">
                    <button type="button" className="cp-btn cp-btn-success" onClick={() => handleDecisionMove("offered")}><Award size={14} /> Offer Job</button>
                    <button type="button" className="cp-btn cp-btn-ghost" onClick={() => setShowSchedule(true)}><Calendar size={14} /> Manual Round</button>
                    <button type="button" className="cp-btn cp-btn-danger" onClick={() => rejectCandidate(applicationId).then(() => { notify.success("Candidate rejected"); load(); })}><XCircle size={14} /> Reject</button>
                  </div>
                </div>

                {aiReportData?.transcript?.length > 0 && (
                  <div>
                    <button type="button" className="cp-transcript-btn" onClick={() => setShowTranscript(!showTranscript)}>
                      <MessageSquare size={15} />
                      {showTranscript ? "Hide Transcript" : `View Full Transcript (${aiReportData.transcript.length} Q&A)`}
                      {showTranscript ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {showTranscript && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                        {aiReportData.transcript.map((item, idx) => (
                          <div key={idx} className="cp-transcript-item">
                            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 6 }}>Q{idx + 1}: {item.question}</div>
                            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}><strong>Answer:</strong> {item.userAnswer || "No verbal response"}</div>
                            <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 700 }}>Score: {item.score}/10 — {item.feedback}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>


          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="cp-card" style={{ position: "sticky", top: 24 }}>
              <h3 className="cp-card-hd">
                <div className="cp-card-hd-icon" style={{ background: "rgba(79,70,229,.1)" }}><BarChart3 size={16} color="var(--primary)" /></div>
                Score Breakdown
              </h3>
              {scoreRows.map(item => (
                <div key={item.label} className="cp-score-row">
                  <div className="cp-score-row-top">
                    <span className="cp-score-row-label">{item.icon} {item.label}</span>
                    <span className="cp-score-row-val" style={{ color: item.color }}>{item.val}%</span>
                  </div>
                  <ProgressBar value={item.val} color={item.color} />
                </div>
              ))}
              <div style={{ height: 1, background: "var(--border)", margin: "20px 0" }} />
              <div className="cp-job-chip">
                <div className="cp-job-chip-label">Applied Position</div>
                <div className="cp-job-chip-title">{job?.title}</div>
                <div className="cp-job-chip-role">{job?.role}</div>
                <span className="rx-badge rx-badge-blue" style={{ textTransform: "capitalize", fontSize: 11 }}>{status.replace(/_/g, " ")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Full-width cards below the grid ── */}

        {/* About */}
        <div className="cp-card" style={{ marginTop: 20 }}>
          <h3 className="cp-card-hd">
            <div className="cp-card-hd-icon" style={{ background: "rgba(79,70,229,.1)" }}><Sparkles size={16} color="var(--primary)" /></div>
            About Candidate
          </h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text)", margin: 0 }}>{candidate.bio || "No bio provided."}</p>
          <div className="cp-match-box">
            <div className="cp-match-box-title"><Zap size={15} /> PreepX AI Match Analysis</div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "var(--text)" }}>{match.explanation || "Candidate matches key technical criteria for this role."}</p>
          </div>
        </div>

        {/* Skills */}
        <div className="cp-card" style={{ marginTop: 20 }}>
          <h3 className="cp-card-hd">
            <div className="cp-card-hd-icon" style={{ background: "rgba(16,185,129,.1)" }}><TrendingUp size={16} color="#10b981" /></div>
            Skills Analysis
          </h3>
          {(match.matchedSkills?.length > 0 || match.missingSkills?.length > 0) ? (
            <>
              {match.matchedSkills?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>✓ Matched ({match.matchedSkills.length})</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {match.matchedSkills.map(s => <span key={s} className="cp-skill-matched"><CheckCircle2 size={11} /> {s}</span>)}
                  </div>
                </div>
              )}
              {match.missingSkills?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>✕ Missing ({match.missingSkills.length})</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {match.missingSkills.map(s => <span key={s} className="cp-skill-missing">{s}</span>)}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", padding: "20px 0" }}>No skill data available</div>
          )}
        </div>

        {/* Resume */}
        <div className="cp-card" style={{ marginTop: 20 }}>
          <h3 className="cp-card-hd">
            <div className="cp-card-hd-icon" style={{ background: "rgba(79,70,229,.1)" }}><FileText size={16} color="var(--primary)" /></div>
            Resume
          </h3>
          {resumeUrl ? (
            <>
              <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                <button type="button" className="cp-btn cp-btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowResumeModal(true)}><FileText size={15} /> View Resume</button>
                <a href={resumeUrl} target="_blank" rel="noreferrer" className="cp-btn cp-btn-ghost" style={{ flex: 1, justifyContent: "center" }}><ExternalLink size={15} /> Open in Tab</a>
              </div>
              <div className="cp-resume-preview" onClick={() => setShowResumeModal(true)} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && setShowResumeModal(true)}>
                <div className="cp-resume-icon"><FileText size={30} color="var(--primary)" /></div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>{candidate.resumeFileName || "Resume.pdf"}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Click to preview fullscreen</div>
              </div>
            </>
          ) : (
            <div style={{ padding: 48, textAlign: "center", background: "var(--bg)", borderRadius: 14, border: "2px dashed var(--border)" }}>
              <FileText size={40} style={{ color: "var(--border)", marginBottom: 12 }} />
              <div style={{ fontWeight: 700, color: "var(--text-muted)" }}>No resume uploaded</div>
              <div style={{ fontSize: 13, marginTop: 4, color: "var(--text-muted)" }}>Candidate hasn't uploaded a resume yet.</div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Dock */}
      <div className="cp-dock">
        {CAN_SHORTLIST.includes(status) && (
          <button type="button" className="cp-btn cp-btn-success" onClick={() => shortlistCandidate(applicationId).then(() => { notify.success("Candidate shortlisted"); load(); })}><Star size={15} /> Shortlist</button>
        )}
        {CAN_SEND_ASSESSMENT.includes(status) && !application.assessmentId && (
          <button type="button" className="cp-btn cp-btn-primary" onClick={() => setShowAssessmentModal(true)}><Send size={15} /> Send Assessment</button>
        )}
        {CAN_SEND_AI_INTERVIEW.includes(status) && (
          <button type="button" className="cp-btn cp-btn-purple" onClick={handleOpenAIModal}><Bot size={15} /> Send AI Interview</button>
        )}
        <button type="button" className="cp-btn cp-btn-ghost" onClick={() => setShowSchedule(true)}><Calendar size={15} /> Schedule Manual</button>
        {status !== "rejected" && status !== "hired" && (
          <button type="button" className="cp-btn cp-btn-danger" onClick={() => rejectCandidate(applicationId).then(() => { notify.success("Candidate rejected"); load(); })}><XCircle size={15} /> Reject</button>
        )}
      </div>

      {/* Resume Modal */}
      {showResumeModal && resumeUrl && (
        <div className="cp-modal-overlay" onClick={() => setShowResumeModal(false)} style={{ padding: 0, alignItems: "stretch" }}>
          <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: 940, height: "100vh", background: "var(--surface)", overflow: "hidden", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(79,70,229,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={18} color="var(--primary)" /></div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text)" }}>{candidate.resumeFileName || "Resume.pdf"}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{candidate.fullName}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a href={resumeUrl} target="_blank" rel="noreferrer" className="cp-btn cp-btn-ghost" style={{ padding: "7px 14px" }}><ExternalLink size={14} /> Open Tab</a>
                <button type="button" className="cp-btn cp-btn-ghost" onClick={() => setShowResumeModal(false)} style={{ padding: "7px 14px" }}><XCircle size={14} /> Close</button>
              </div>
            </div>
            <iframe title="Resume Viewer" src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(resumeUrl)}`} style={{ flex: 1, width: "100%", border: "none", background: "#f8f8f8", minHeight: 0 }} />
          </div>
        </div>
      )}

      {/* AI Interview Modal */}
      {showAIModal && (
        <div className="cp-modal-overlay" onClick={() => setShowAIModal(false)}>
          <div className="cp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700, maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}><Bot size={20} color="#7c3aed" /> Configure AI Interview</h3>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>PreepX AI conducts this interview live with the candidate.</p>
              </div>
              <button type="button" className="cp-btn cp-btn-ghost" style={{ padding: "7px 14px", flexShrink: 0 }} onClick={() => setShowAIModal(false)}><XCircle size={14} /> Close</button>
            </div>
            <div style={{ background: "var(--bg)", borderRadius: 14, padding: 16, marginBottom: 16, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>AI Question Generator Settings</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <label className="cp-label">Difficulty</label>
                  <select value={aiConfig.difficulty} onChange={e => setAiConfig({ ...aiConfig, difficulty: e.target.value })} className="cp-input cp-select">
                    <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <label className="cp-label">Question Count</label>
                  <select value={aiConfig.count} onChange={e => setAiConfig({ ...aiConfig, count: Number(e.target.value) })} className="cp-input cp-select">
                    <option value={5}>5 Questions</option><option value={10}>10 Questions</option><option value={15}>15 Questions</option>
                  </select>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <button type="button" className="cp-btn cp-btn-ghost" disabled={generatingQuestions} onClick={handleGenerateAIQuestions}>
                    <Sparkles size={14} /> {generatingQuestions ? "Generating…" : "Regenerate"}
                  </button>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input value={newManualQ} onChange={e => setNewManualQ(e.target.value)} placeholder="Or type a custom interview question…" className="cp-input" style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && handleAddManualQuestion()} />
              <button type="button" className="cp-btn cp-btn-primary" onClick={handleAddManualQuestion}><Plus size={15} /> Add</button>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Review Questions ({interviewQuestions.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto", paddingRight: 4 }}>
              {interviewQuestions.map((q, idx) => (
                <div key={idx} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, color: "var(--text)" }}><strong>{idx + 1}.</strong> {q.question}</span>
                  <button type="button" className="cp-btn cp-btn-danger" style={{ padding: "4px 8px", flexShrink: 0 }} onClick={() => handleDeleteQuestion(idx)}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <button type="button" className="cp-btn cp-btn-ghost" onClick={() => setShowAIModal(false)}>Cancel</button>
              <button type="button" className="cp-btn cp-btn-purple" disabled={sendingAI || interviewQuestions.length === 0} onClick={handleSendAIInterviewSubmit}>
                <Bot size={15} /> {sendingAI ? "Sending…" : "Send AI Interview"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Manual Modal */}
      {showSchedule && (
        <div className="cp-modal-overlay" onClick={() => setShowSchedule(false)}>
          <div className="cp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}><Calendar size={20} color="var(--primary)" /> Schedule Manual Interview</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 20px" }}>Optional human evaluation round for technical or leadership verification.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="cp-label">Interview Type</label>
                <select value={schedule.interviewType} onChange={e => setSchedule({ ...schedule, interviewType: e.target.value })} className="cp-input cp-select">
                  <option value="video">Technical Video Call</option>
                  <option value="phone">Phone Screening</option>
                  <option value="in_person">In-Person Final Round</option>
                </select>
              </div>
              <div>
                <label className="cp-label">Date & Time</label>
                <input type="datetime-local" value={schedule.scheduledAt} onChange={e => setSchedule({ ...schedule, scheduledAt: e.target.value })} className="cp-input" />
              </div>
              <div>
                <label className="cp-label">Meeting Link</label>
                <input value={schedule.meetingLink} onChange={e => setSchedule({ ...schedule, meetingLink: e.target.value })} placeholder="https://meet.google.com/..." className="cp-input" />
              </div>
              <div>
                <label className="cp-label">Preparation Notes for Candidate</label>
                <textarea rows={3} value={schedule.notes} onChange={e => setSchedule({ ...schedule, notes: e.target.value })} placeholder="e.g. System design discussion..." className="cp-input" style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <button type="button" className="cp-btn cp-btn-ghost" onClick={() => setShowSchedule(false)}>Cancel</button>
                <button type="button" className="cp-btn cp-btn-primary" onClick={handleSchedule}><Calendar size={14} /> Schedule Interview</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Assessment Modal */}
      {showAssessmentModal && (
        <div className="cp-modal-overlay" onClick={() => setShowAssessmentModal(false)}>
          <div className="cp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(79,70,229,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><Send size={18} color="var(--primary)" /></div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "var(--text)" }}>Send Technical Assessment</h3>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Confirm assessment invitation for candidate</span>
                </div>
              </div>
              <button type="button" className="cp-btn cp-btn-ghost" style={{ padding: "5px 10px" }} onClick={() => setShowAssessmentModal(false)}><XCircle size={16} /></button>
            </div>
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, marginBottom: 12, color: "var(--text)" }}>Candidate: <strong>{candidate.fullName}</strong> <span style={{ color: "var(--text-muted)" }}>({candidate.email})</span></div>
              <label className="cp-label">Assessment Template</label>
              <select value={selectedAssessmentJobId} onChange={e => setSelectedAssessmentJobId(e.target.value)} className="cp-input cp-select">
                {jobsList.map(j => <option key={j._id} value={j._id}>{j.title} ({j.role}) {j._id === (job?._id || job) ? "← Applied" : ""}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", marginBottom: 4 }}>Format</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--primary)" }}>
                  {selectedJobObj?.assessmentConfig?.includeCoding === false || selectedJobObj?.assessmentConfig?.codingCount === 0
                    ? `${selectedJobObj?.assessmentConfig?.mcqCount || 20} MCQ Only`
                    : `${selectedJobObj?.assessmentConfig?.mcqCount || 20} MCQ + ${selectedJobObj?.assessmentConfig?.codingCount || 2} Coding`}
                </div>
              </div>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", marginBottom: 4 }}>Time Limit</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#10b981" }}>{selectedJobObj?.assessmentConfig?.durationMinutes || 60} Minutes</div>
              </div>
            </div>
            <div style={{ background: "rgba(59,130,246,.08)", border: "1px solid rgba(59,130,246,.2)", borderRadius: 12, padding: 12, fontSize: 13, color: "var(--text)", lineHeight: 1.5, marginBottom: 20 }}>
              💡 An invitation with test instructions will be automatically delivered to the candidate's dashboard and email.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" className="cp-btn cp-btn-ghost" disabled={sendingAssessment} onClick={() => setShowAssessmentModal(false)}>Cancel</button>
              <button type="button" className="cp-btn cp-btn-primary" disabled={sendingAssessment} onClick={handleConfirmSendAssessment}>
                <Send size={14} /> {sendingAssessment ? "Sending…" : "Send Assessment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </RecruiterLayout>
  );
}
