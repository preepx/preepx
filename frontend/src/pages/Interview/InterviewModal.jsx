import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X, Briefcase, Tag, BarChart2, List, Check,
  Smile, Meh, Rocket, Target, TrendingUp, ShieldCheck, Info
} from "lucide-react";
import { fetchInterviewQuestions } from "@/services/interviewAPI";
import notify from "@/utils/notify";
import { showAppError } from "@/utils/appAlert";
import '@/styles/InterviewModal.css';

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Analyst", "DevOps Engineer", "Product Manager",
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

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleStart = async () => {
    if (!jobTitle.trim()) {
      showAppError("Please specify a Job Title before starting.", "Missing fields");
      return;
    }

    // Automatically add whatever is currently typed in the input box
    let finalSkills = [...skills];
    if (skillInput.trim() && !finalSkills.includes(skillInput.trim())) {
      finalSkills.push(skillInput.trim());
    }

    const jobTopic = finalSkills.join(", ");
    if (!jobTopic.trim()) {
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
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error generating questions. Check your login & API key.";
      if (errorMsg.toLowerCase().includes("insufficient") || errorMsg.toLowerCase().includes("recharge")) {
        showAppError(errorMsg, "Insufficient Balance", {
          label: "Add Money",
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
    <div className="im2-overlay" onClick={onClose}>
      <div className="im2-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="im2-header">
          <div className="im2-header-left">
            <div className="im2-title-row" style={{ alignItems: 'center', gap: '0px' }}>
              <img src="/logo.png" alt="Logo" style={{ height: '56px', width: 'auto', objectFit: 'contain', marginRight: '-8px' }} />
              <h2 style={{ fontSize: '22px', lineHeight: '28px', margin: 0 }}>Create Interview Session</h2>
              <div className="im2-coin-badge" style={{ marginLeft: '8px' }}>
                ₹5 per session
              </div>
            </div>
            <p>Set up your practice session and get interview-ready.</p>
          </div>
          <button className="im2-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Roles */}
        <div style={{ padding: '16px 32px 0', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
          Quick select popular roles:
        </div>
        <div className="im2-roles">
          {ROLES.map((r) => (
            <button
              key={r}
              className={`im2-role-chip ${jobTitle === r ? "active" : ""}`}
              onClick={() => setJobTitle(r)}
            >
              {jobTitle === r && <Check size={14} className="im2-check" />}
              {r}
            </button>
          ))}
        </div>

        <div className="im2-body">
          {/* Job Title Section */}
          <div className="im2-section">
            <div className="im2-section-left">
              <div className="im2-icon-circle purple-light">
                <Briefcase size={18} color="#6366f1" />
              </div>
              <div className="im2-section-info">
                <h3>Job Title</h3>
                <p>Enter any role or job title you want to practice for</p>
              </div>
            </div>
            <div className="im2-section-right">
              <div className="im2-input-wrapper">
                <input
                  type="text"
                  placeholder="Type anything, e.g. UI/UX Designer, Software Engineer..."
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              <div className="im2-input-hint">
                You can enter any job role or title <Info size={12} />
              </div>
            </div>
          </div>

          {/* Skills & Topics Section */}
          <div className="im2-section">
            <div className="im2-section-left">
              <div className="im2-icon-circle green-light">
                <Tag size={18} color="#22c55e" />
              </div>
              <div className="im2-section-info">
                <h3>Skills & Topics</h3>
                <p>Add skills or topics you want to focus on</p>
              </div>
            </div>
            <div className="im2-section-right">
              <div className="im2-input-wrapper">
                <input
                  type="text"
                  placeholder="Type and press Enter to add (e.g. JavaScript, System Design, SQL)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                />
              </div>
              <div className="im2-skills-list">
                {skills.map(s => (
                  <div key={s} className="im2-skill-badge">
                    {s} <X size={12} onClick={() => removeSkill(s)} className="im2-skill-remove" />
                  </div>
                ))}
                {skills.length > 0 && <button className="im2-add-more">+ Add more</button>}
              </div>
            </div>
          </div>

          {/* Difficulty Section */}
          <div className="im2-section">
            <div className="im2-section-left">
              <div className="im2-icon-circle blue-light">
                <BarChart2 size={18} color="#3b82f6" />
              </div>
              <div className="im2-section-info">
                <h3>Difficulty Level</h3>
                <p>Choose the challenge level for your interview</p>
              </div>
            </div>
            <div className="im2-section-right im2-cards-row">
              <div className={`im2-diff-card ${difficulty === 'easy' ? 'active' : ''}`} onClick={() => setDifficulty('easy')}>
                <div className="im2-radio">{difficulty === 'easy' && <div className="im2-radio-inner" />}</div>
                <div className="im2-diff-icon green-bg"><Smile size={20} color="#16a34a" /></div>
                <div>
                  <h4>Easy</h4>
                  <p>Basic concepts & fundamentals</p>
                </div>
              </div>
              <div className={`im2-diff-card ${difficulty === 'medium' ? 'active' : ''}`} onClick={() => setDifficulty('medium')}>
                <div className="im2-radio">{difficulty === 'medium' && <div className="im2-radio-inner" />}</div>
                <div className="im2-diff-icon yellow-bg"><Meh size={20} color="#d97706" /></div>
                <div>
                  <h4>Medium</h4>
                  <p>Intermediate concepts & problem solving</p>
                </div>
              </div>
              <div className={`im2-diff-card ${difficulty === 'hard' ? 'active' : ''}`} onClick={() => setDifficulty('hard')}>
                <div className="im2-radio">{difficulty === 'hard' && <div className="im2-radio-inner" />}</div>
                <div className="im2-diff-icon red-bg"><Rocket size={20} color="#dc2626" /></div>
                <div>
                  <h4>Hard</h4>
                  <p>Advanced concepts & system design</p>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="im2-section">
            <div className="im2-section-left">
              <div className="im2-icon-circle purple-light">
                <List size={18} color="#a855f7" />
              </div>
              <div className="im2-section-info">
                <h3>Number of Questions</h3>
                <p>Select how many questions you want in this session</p>
              </div>
            </div>
            <div className="im2-section-right">
              <div className="im2-segmented-control">
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
        </div>

        {/* Footer */}
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
