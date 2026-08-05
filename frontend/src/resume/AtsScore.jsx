import React, { useState } from "react";
import { Upload, FileText, CheckCircle, AlertTriangle, Lightbulb, Activity, ArrowRight, RefreshCw } from "lucide-react";
import { getAtsScore } from "../services/atsAPI";
import { toast } from "react-toastify";
import { showAppError } from "../utils/appAlert";
import "./AtsScore.css";

const AtsScore = () => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState(null);

  const processFile = async (file) => {
    if (!file) return;
    const validExts = [".pdf", ".png", ".jpg", ".jpeg"];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExts.includes(ext)) {
      showAppError("Unsupported file type. Please upload a PDF or Image (JPG/PNG).", "Invalid file type");
      return;
    }
    try {
      setUploading(true);
      setResult(null); // reset previous result
      const res = await getAtsScore(file);
      setResult(res);
      window.dispatchEvent(new Event("walletUpdated"));
      toast.success("Resume analyzed successfully!");
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
    if (score >= 80) return "var(--success, #10b981)";
    if (score >= 50) return "var(--warning, #f59e0b)";
    return "var(--danger, #ef4444)";
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return "Excellent! Your resume is highly optimized for ATS.";
    if (score >= 50) return "Good, but could be better. Needs some tweaks.";
    return "Needs significant improvement to pass ATS filters.";
  };

  return (
    <div className="ats-page">
      <div className="ats-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
          <h1 style={{ margin: 0 }}>ATS Resume Score</h1>
          <div style={{ padding: '6px 14px', background: 'linear-gradient(145deg, rgba(234, 179, 8, 0.15), rgba(217, 119, 6, 0.05))', border: '1px solid rgba(234, 179, 8, 0.3)', boxShadow: '0 4px 15px rgba(234, 179, 8, 0.1)', color: '#fbbf24', borderRadius: '24px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px' }}>
            1 <span style={{ fontSize: '16px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>🪙</span> per session
          </div>
        </div>
        <p style={{ marginTop: '8px' }}>Find out how well your resume matches Applicant Tracking Systems and get actionable feedback.</p>
      </div>

      {!result && (
        <div
          className={`drop-zone ats-drop ${dragOver ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="uploading-state">
              <Activity className="spinner-icon" size={48} />
              <h2>Analyzing your resume...</h2>
              <p>Evaluating keywords, formatting, and impact.</p>
            </div>
          ) : (
            <>
              <FileText size={48} className="drop-icon" />
              <h2>Drop your resume here</h2>
              <p>PDF or Image (JPG/PNG) · Max 10MB</p>
              <label className="drop-btn">
                <Upload size={18} />
                Browse Files
                <input type="file" accept=".pdf,image/png,image/jpeg" hidden onChange={handleUpload} disabled={uploading} />
              </label>
            </>
          )}
        </div>
      )}

      {result && (
        <div className="ats-results animate-fade-in">
          <div className="score-overview">
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
            <div className="score-text">
              <h2>{getScoreMessage(result.score)}</h2>
              <p>{result.summary}</p>
              <button className="reupload-btn" onClick={() => setResult(null)}>
                <RefreshCw size={16} /> Analyze Another Resume
              </button>
            </div>
          </div>

          <div className="feedback-grid">
            <div className="feedback-card improvements-card">
              <div className="card-header">
                <AlertTriangle className="icon-warning" size={24} />
                <h3>What to Improve</h3>
              </div>
              <ul className="feedback-list">
                {result.improvements?.map((item, idx) => (
                  <li key={idx}>
                    <ArrowRight size={16} className="bullet-icon warning-text" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {(!result.improvements || result.improvements.length === 0) && (
                <p className="empty-state">No major formatting or content issues found.</p>
              )}
            </div>

            <div className="feedback-card suggestions-card">
              <div className="card-header">
                <Lightbulb className="icon-success" size={24} />
                <h3>Actionable Suggestions</h3>
              </div>
              <ul className="feedback-list">
                {result.suggestions?.map((item, idx) => (
                  <li key={idx}>
                    <CheckCircle size={16} className="bullet-icon success-text" />
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
