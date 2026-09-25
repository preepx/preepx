import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X, Briefcase, BarChart2, List, Check,
  Smile, Meh, Frown, Sparkles, UserCheck
} from "lucide-react";
import { fetchInterviewQuestions } from "@/services/interviewAPI";
import notify from "@/utils/notify";
import { showAppError } from "@/utils/appAlert";
import '@/styles/InterviewModal.css';

const ROLES = [
  "Frontend Developer", "Backend Developer", "Fullstack Developer",
  "Data Analyst", "Ui/Ux", "HR",
];

const InterviewModal = ({ onClose, onSuccess }) => {
  const [jobTitle, setJobTitle] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, []);

  const handleStart = async () => {
    if (!jobTitle.trim()) {
      showAppError("Please specify a Job Title before starting.", "Missing fields");
      return;
    }

    let finalSkills = [...skills];
    if (skillInput.trim() && !finalSkills.includes(skillInput.trim())) {
      finalSkills.push(skillInput.trim());
    }

    const jobTopic = finalSkills.length > 0 ? finalSkills.join(", ") : skillInput.trim();
    if (!jobTopic) {
      showAppError("Please add at least one skill or topic.", "Missing fields");
      return;
    }

    setLoading(true);
    try {
      const data = await fetchInterviewQuestions(jobTitle, jobTopic, {
        difficulty, interviewType: "mixed", questionCount,
      });
      if (!data.questions?.length) {
        showAppError("We couldn't generate questions. Please try again.", "Generation failed");
        return;
      }
      if (onSuccess) onSuccess();
      notify.success(`${data.questions.length} questions generated!`);
      navigate("/interview-setup", {
        state: {
          jobTitle, jobTopic, questions: data.questions,
          interviewId: data.interviewId, difficulty, interviewType: "mixed",
        },
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error generating questions.";
      if (errorMsg.toLowerCase().includes("insufficient") || errorMsg.toLowerCase().includes("recharge")) {
        showAppError(errorMsg, "Insufficient Balance", {
          label: "Add Money",
          onClick: () => navigate("/wallet")
        });
      } else {
        showAppError(errorMsg, "Interview setup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="im2-overlay" onClick={onClose}>
      <div className="im2-card" onClick={(e) => e.stopPropagation()}>
        <div className="im2-header">
          <div className="im2-header-left">
            <div className="im2-title-row">
              <img src="/sessrionlogo.svg" alt="Session Logo" style={{ height: '24px', objectFit: 'contain' }} />
              <h2 style={{
                background: 'linear-gradient(90deg, rgb(124, 58, 237) 0%, rgb(99, 102, 241))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                margin: 0
              }}>
                Create Interview Session
              </h2>
              <div className="im2-coin-badge">₹5 per session</div>
            </div>
          </div>
          <button className="im2-close" onClick={onClose}><X size={20} /></button>
        </div>

        <h3 className="im2-roles-title">Pick a Role to Get Started</h3>
        <div className="im2-roles">
          {ROLES.map((r) => (
            <button
              key={r}
              className={`im2-role-chip ${jobTitle === r ? "active" : ""}`}
              onClick={() => setJobTitle(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="im2-body">
          <div className="im2-section">
            <div className="im2-section-left">
              <img src="/dsbanner/job title.svg" alt="Job Title" style={{ width: 24, height: 24 }} />
              <h3>Job Title</h3>
            </div>
            <div className="im2-section-right">
              <div className="im2-input-wrapper">
                <input
                  type="text"
                  placeholder="Enter a role, e.g., UI/UX, HR..."
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="im2-section">
            <div className="im2-section-left">
              <img src="/dsbanner/skills&topics.svg" alt="Skills and Topics" style={{ width: 24, height: 24 }} />
              <h3>Skills & Topics</h3>
            </div>
            <div className="im2-section-right">
              <div className="im2-input-wrapper">
                <input
                  type="text"
                  placeholder="Enter a skill, e.g., Figma, HTML, CSS..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="im2-section">
            <div className="im2-section-left">
              <img src="/dsbanner/Difficulty Level.svg" alt="Difficulty Level" style={{ width: 24, height: 24 }} />
              <h3>Difficulty Level</h3>
            </div>
            <div className="im2-section-right im2-cards-row">
              <div className={`im2-diff-card ${difficulty === 'easy' ? 'active' : ''}`} onClick={() => setDifficulty('easy')}>
                <Smile size={18} color="#000" /> Easy
              </div>
              <div className={`im2-diff-card ${difficulty === 'medium' ? 'active' : ''}`} onClick={() => setDifficulty('medium')}>
                <Meh size={18} color="#000" /> Medium
              </div>
              <div className={`im2-diff-card ${difficulty === 'hard' ? 'active' : ''}`} onClick={() => setDifficulty('hard')}>
                <Frown size={18} color="#000" /> Hard
              </div>
            </div>
          </div>

          <div className="im2-section">
            <div className="im2-section-left">
              <img src="/dsbanner/Number of Questions.svg" alt="Number of Questions" style={{ width: 24, height: 24 }} />
              <h3>Number of Questions</h3>
            </div>
            <div className="im2-section-right im2-cards-row">
              {[3, 5, 10, 15, 20].map(num => (
                <button
                  key={num}
                  className={`im2-segment ${questionCount === num ? 'active' : ''}`}
                  onClick={() => setQuestionCount(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="im2-footer">
          <button className="im2-btn cancel" onClick={onClose}>Cancel</button>
          <button className="im2-btn start" onClick={handleStart} disabled={loading}>
            {loading ? "Generating..." : "Start Interview"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewModal;
