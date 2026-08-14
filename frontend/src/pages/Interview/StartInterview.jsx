import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Briefcase, BookOpen, HelpCircle, Play, ArrowLeft } from "lucide-react";
import '@/styles/startinterview.css';

const StartInterview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobTitle, jobTopic, questions, fromResume, interviewId } = location.state || {};

  if (!questions?.length) {
    return (
      <div className="start-screen">
        <div className="start-card">
          <h2>No interview data found</h2>
          <p>Please start a new interview from the dashboard.</p>
          <button className="start-btn" onClick={() => navigate("/interview")}>
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="start-screen">
      <div className="start-card">
        <div className="start-badge">
          {fromResume ? "Resume-Based Interview" : "Mock Interview"}
        </div>
        <h2 className="start-title">
          {fromResume ? "Resume Analyzed Successfully" : "You're All Set!"}
        </h2>
        <p className="start-subtitle">
          {fromResume
            ? "We've generated questions based on your resume skills. Take a deep breath and give it your best."
            : "This practice session will help you build confidence. Answer naturally — the AI is listening."}
        </p>

        <div className="start-info-grid">
          <div className="start-info-item">
            <Briefcase size={20} />
            <div>
              <span className="info-label">Role</span>
              <span className="info-value">{jobTitle}</span>
            </div>
          </div>
          <div className="start-info-item">
            <BookOpen size={20} />
            <div>
              <span className="info-label">Topic</span>
              <span className="info-value">{jobTopic}</span>
            </div>
          </div>
          <div className="start-info-item">
            <HelpCircle size={20} />
            <div>
              <span className="info-label">Questions</span>
              <span className="info-value">{questions.length} questions</span>
            </div>
          </div>
        </div>

        <div className="start-tips">
          <p>💡 Make sure your microphone and camera are enabled</p>
          <p>💡 Speak clearly and take your time with each answer</p>
        </div>

        <div className="start-actions">
          <button className="start-btn-back" onClick={() => navigate("/interview")}>
            <ArrowLeft size={18} /> Back
          </button>
          <button
            className="start-btn"
            onClick={() =>
              navigate("/interview-mode", {
                state: { jobTitle, jobTopic, questions, interviewId, fromResume },
              })
            }
          >
            <Play size={18} /> Begin Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartInterview;
