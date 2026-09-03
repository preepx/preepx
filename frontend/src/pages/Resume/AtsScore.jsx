import React, { useState } from "react";
import {
  Upload, FileText, CheckCircle, AlertTriangle, Lightbulb,
  Activity, ArrowRight, RefreshCw, ScanLine, Target,
  ShieldCheck, Briefcase, Zap
} from "lucide-react";
import { getAtsScore } from "@/services/atsAPI";
import notify from "@/utils/notify";
import { showAppError } from "@/utils/appAlert";
import '@/styles/AtsScore.css';

const ALLOWED_EXTS = [".pdf"];
const FILE_ACCEPT = ".pdf,application/pdf";
const FILE_TYPE_HINT = "PDF only · Max 10MB";
const FILE_TYPE_ERROR = "Invalid file type. Only PDF files are allowed.";

const SCAN_STEPS = [
  { icon: Upload, title: "Upload Resume", desc: "PDF format only · Max 10MB" },
  { icon: ScanLine, title: "AI ATS Scan", desc: "PreepX AI checks keywords, formatting, sections & impact" },
  { icon: Target, title: "Actionable Report", desc: "Get your score plus tips to stand out to recruiters" },
];

const SCAN_CHECKS = [
  { icon: Zap, label: "Keyword Match", desc: "Role-relevant skills & terms" },
  { icon: FileText, label: "Formatting", desc: "ATS-readable layout & structure" },
  { icon: ShieldCheck, label: "Sections", desc: "Contact, experience, education" },
  { icon: Briefcase, label: "Impact", desc: "Action verbs & measurable results" },
];

const AtsScore = () => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState(null);

  const processFile = async (file) => {
    if (!file) return;
    const validExts = ALLOWED_EXTS;
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExts.includes(ext)) {
      showAppError(FILE_TYPE_ERROR, "Invalid file type");
      return;
    }
    try {
      setUploading(true);
      setResult(null);
      const res = await getAtsScore(file);
      setResult(res);
      window.dispatchEvent(new Event("walletUpdated"));
      notify.success("Resume analyzed successfully!");
    } catch (err) {
      showAppError(err.response?.data?.error || "ATS scoring failed. Please try again.", "Analysis failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 50) return "Good";
    return "Needs Work";
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return "Your resume is highly optimized for ATS systems.";
    if (score >= 50) return "Solid foundation — a few tweaks can boost your score.";
    return "Your resume needs improvement to pass ATS filters.";
  };

  return (
    <div className="ats-page">
      <div className="ats-bg-glow ats-bg-glow-1" aria-hidden="true" />
      <div className="ats-bg-glow ats-bg-glow-2" aria-hidden="true" />

      <header className="ats-hero">
        <div className="ats-header-title">
          <h1>ATS Resume Score</h1>
          <div className="ats-coin-badge">
            <span className="ats-coin-icon">₹</span>
            ₹1 per scan
          </div>
        </div>

        <p className="ats-hero-desc">
          See how recruiters&apos; Applicant Tracking Systems read your resume — before you apply on
          {" "}<strong>PreepX Jobs</strong> or start a mock interview. Get instant, actionable feedback.
        </p>
      </header>

      {!result && (
        <>
          <div className="ats-steps">
            {SCAN_STEPS.map((step, i) => (
              <div key={step.title} className="ats-step-card">
                <span className="ats-step-num">{i + 1}</span>
                <div className="ats-step-icon">
                  <step.icon size={20} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>

          <div
            className={`ats-drop-zone ${dragOver ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="ats-uploading-state">
                <div className="ats-scan-ring">
                  <Activity className="ats-spinner-icon" size={32} />
                </div>
                <h2>Analyzing your resume…</h2>
                <p>PreepX AI is scanning keywords, formatting, sections & impact.</p>
                <div className="ats-scan-progress">
                  <div className="ats-scan-progress-bar" />
                </div>
              </div>
            ) : (
              <>
                <div className="ats-drop-icon-wrap">
                  <FileText size={36} />
                </div>
                <h2>Drop your resume here</h2>
                <p className="ats-drop-hint">{FILE_TYPE_HINT}</p>
                <label className="ats-browse-btn">
                  <Upload size={18} />
                  Browse Files
                  <input type="file" accept={FILE_ACCEPT} hidden onChange={handleUpload} disabled={uploading} />
                </label>
              </>
            )}
          </div>

          <div className="ats-checks">
            <p className="ats-checks-label">What PreepX scans</p>
            <div className="ats-checks-grid">
              {SCAN_CHECKS.map((check) => (
                <div key={check.label} className="ats-check-item">
                  <div className="ats-check-icon">
                    <check.icon size={16} />
                  </div>
                  <div>
                    <strong>{check.label}</strong>
                    <span>{check.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {result && (
        <div className="ats-results animate-fade-in">
          <div className="ats-score-card">
            <div className="ats-score-visual">
              <div className="score-circle-container">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path
                    className="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="circle"
                    strokeDasharray={`${result.score}, 100`}
                    style={{ stroke: getScoreColor(result.score) }}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">{result.score}%</text>
                </svg>
              </div>
              <span
                className="ats-score-badge"
                style={{ color: getScoreColor(result.score), borderColor: `${getScoreColor(result.score)}40` }}
              >
                {getScoreLabel(result.score)}
              </span>
            </div>

            <div className="ats-score-text">
              <h2>{getScoreMessage(result.score)}</h2>
              <p>{result.summary}</p>
              <button className="ats-reupload-btn" onClick={() => setResult(null)}>
                <RefreshCw size={16} />
                Scan Another Resume
              </button>
            </div>
          </div>

          <div className="ats-feedback-grid">
            <div className="ats-feedback-card ats-feedback-improve">
              <div className="ats-card-header">
                <div className="ats-card-icon ats-card-icon-warn">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3>What to Improve</h3>
                  <span>Fix these to boost your ATS score</span>
                </div>
              </div>
              <ul className="ats-feedback-list">
                {result.improvements?.map((item, idx) => (
                  <li key={idx}>
                    <ArrowRight size={15} className="ats-bullet-warn" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {(!result.improvements || result.improvements.length === 0) && (
                <p className="ats-empty-feedback">No major formatting or content issues found.</p>
              )}
            </div>

            <div className="ats-feedback-card ats-feedback-suggest">
              <div className="ats-card-header">
                <div className="ats-card-icon ats-card-icon-success">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h3>Actionable Suggestions</h3>
                  <span>Tips to get recruiter-ready on PreepX</span>
                </div>
              </div>
              <ul className="ats-feedback-list">
                {result.suggestions?.map((item, idx) => (
                  <li key={idx}>
                    <CheckCircle size={15} className="ats-bullet-success" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AtsScore;
