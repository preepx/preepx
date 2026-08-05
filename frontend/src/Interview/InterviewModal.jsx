import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Briefcase, Code, Gauge, Layers, Hash } from "lucide-react";
import { fetchInterviewQuestions } from "../services/interviewAPI";
import { toast } from "react-toastify";
import { showAppError } from "../utils/appAlert";
import "./InterviewModal.css";

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Analyst", "DevOps Engineer", "Product Manager",
];

const InterviewModal = ({ onClose, onSuccess }) => {
  const [jobTitle, setJobTitle] = useState("");
  const [jobTopic, setJobTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [interviewType, setInterviewType] = useState("mixed");
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStart = async () => {
    if (!jobTitle.trim() || !jobTopic.trim()) {
      showAppError("Please fill in job title and topic before starting.", "Missing fields");
      return;
    }
    setLoading(true);
    try {
      const data = await fetchInterviewQuestions(jobTitle, jobTopic, {
        difficulty, interviewType, questionCount,
      });
      if (!data.questions?.length) {
        showAppError("We couldn't generate questions. Please try again.", "Generation failed");
        return;
      }
      if (onSuccess) onSuccess();
      toast.success(`${data.questions.length} questions generated!`);
      navigate("/start-interview", {
        state: {
          jobTitle, jobTopic, questions: data.questions,
          interviewId: data.interviewId, difficulty, interviewType,
        },
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Error generating questions. Check your login & API key.";
      if (errorMsg.toLowerCase().includes("insufficient coins") || errorMsg.toLowerCase().includes("recharge")) {
        showAppError(errorMsg, "Insufficient Coins", {
          label: "Add Coins",
          onClick: () => {
            navigate("/wallet");
          }
        });
      } else {
        showAppError(errorMsg, "Interview setup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h2 style={{ margin: 0 }}>Configure Interview</h2>
              <div style={{ padding: '6px 14px', background: 'linear-gradient(145deg, rgba(234, 179, 8, 0.15), rgba(217, 119, 6, 0.05))', border: '1px solid rgba(234, 179, 8, 0.3)', boxShadow: '0 4px 15px rgba(234, 179, 8, 0.1)', color: '#fbbf24', borderRadius: '24px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px' }}>
                5 <span style={{ fontSize: '16px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>🪙</span> per session
              </div>
            </div>
            <p style={{ marginTop: '4px' }}>Customize your practice session</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="role-chips">
            {ROLES.map((r) => (
              <button
                key={r}
                className={`role-chip ${jobTitle === r ? "active" : ""}`}
                onClick={() => setJobTitle(r)}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="modal-field">
            <label><Briefcase size={16} /> Job Title</label>
            <input
              type="text"
              placeholder="e.g. Frontend Developer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
          <div className="modal-field">
            <label><Code size={16} /> Skills & Topics</label>
            <textarea
              placeholder="e.g. React, JavaScript, System Design"
              value={jobTopic}
              onChange={(e) => setJobTopic(e.target.value)}
              rows={2}
            />
          </div>

          <div className="modal-options">
            <div className="option-group">
              <label><Gauge size={14} /> Difficulty</label>
              <div className="option-btns">
                {["easy", "medium", "hard"].map((d) => (
                  <button key={d} className={`opt-btn ${difficulty === d ? "active" : ""}`} onClick={() => setDifficulty(d)}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-group">
              <label><Hash size={14} /> Questions: {questionCount}</label>
              <input
                type="range" min="10" max="15" value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="range-input"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn start" onClick={handleStart} disabled={loading}>
            {loading ? "Generating..." : `Generate ${questionCount} Questions`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewModal;
