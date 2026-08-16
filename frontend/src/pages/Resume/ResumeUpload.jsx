import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, CheckCircle, Sparkles, Brain, ListChecks } from "lucide-react";
import { uploadResume } from "@/services/resumeAPI";
import notify from "@/utils/notify";
import { showAppError } from "@/utils/appAlert";
import '@/styles/ResumeUpload.css';

const STEPS = [
  { icon: Upload, title: "Upload PDF", desc: "Upload your latest resume in PDF format" },
  { icon: Brain, title: "AI Analysis", desc: "Our AI extracts skills, experience & technologies" },
  { icon: ListChecks, title: "Custom Questions", desc: "Get personalized interview questions" },
];

const ResumeUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const navigate = useNavigate();

  const processFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith(".pdf")) {
      showAppError("Only PDF files are supported. Please upload a .pdf resume.", "Invalid file type");
      return;
    }
    try {
      setUploading(true);
      const res = await uploadResume(file);
      setLastResult(res);
      notify.success(`Found ${res.skills?.length || 0} skills — ${res.questions?.length} questions ready!`);
    } catch (err) {
      showAppError(err.response?.data?.error || "Resume upload failed. Please try again.", "Upload failed");
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

  const startInterview = () => {
    if (!lastResult) return;
    navigate("/interview-setup", {
      state: {
        jobTitle: "Resume-based Role",
        jobTopic: lastResult.result || "Skills from Resume",
        questions: lastResult.questions,
        interviewId: lastResult.interviewId,
        fromResume: true,
      },
    });
  };

  return (
    <div className="resume-page">
      <div className="page-header">
        <h1>Resume Analyzer</h1>
        <p>Upload your resume and get AI-powered skill-based interview questions</p>
      </div>

      <div className="resume-steps">
        {STEPS.map((s, i) => (
          <div key={s.title} className="resume-step">
            <div className="step-num">{i + 1}</div>
            <s.icon size={22} />
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>

      <div
        className={`drop-zone ${dragOver ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <FileText size={48} className="drop-icon" />
        <h2>{uploading ? "Analyzing your resume..." : "Drop your resume here"}</h2>
        <p>PDF format only · Max 10MB</p>
        <label className="drop-btn">
          <Upload size={18} />
          {uploading ? "Processing..." : "Browse Files"}
          <input type="file" accept=".pdf" hidden onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {lastResult && (
        <div className="resume-result">
          <div className="result-header">
            <CheckCircle size={20} className="result-check" />
            <h3>Analysis Complete</h3>
          </div>
          {lastResult.skills?.length > 0 && (
            <div className="skills-found">
              <h4>Skills Detected</h4>
              <div className="skill-chips">
                {lastResult.skills.map((s, i) => (
                  <span key={i} className="skill-chip">{s}</span>
                ))}
              </div>
            </div>
          )}
          <p className="result-summary">
            <Sparkles size={16} /> {lastResult.questions?.length || 0} personalized questions generated
          </p>
          <button className="start-resume-btn" onClick={startInterview}>
            Start Resume-Based Interview
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
