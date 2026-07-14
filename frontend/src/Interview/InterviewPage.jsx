import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus, Upload, Clock, Trophy, Lightbulb, ChevronRight,
  Search, Trash2, Target, Flame, Award,
} from "lucide-react";
import { getDashboard, syncUserToStorage } from "../services/userAPI";
import { deleteInterview } from "../services/interviewAPI";
import { uploadResume } from "../services/resumeAPI";
import { toast } from "react-toastify";
import { showAppError } from "../utils/appAlert";
import InterviewModal from "./InterviewModal";
import WelcomeModal from "../components/WelcomeModal";
import EmptyState from "../components/EmptyState";
import "./InterviewPage.css";

const InterviewPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const location = useLocation();

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      const data = await getDashboard();
      setDashboard(data);
      syncUserToStorage(data.user);
      window.dispatchEvent(new Event("user-updated"));
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to load dashboard";
      if (err.response?.status === 401) {
        setError("Session expired. Redirecting to login...");
        navigate("/auth");
        return;
      }
      setError(msg);
      showAppError(
        msg === "Network Error" ? "Cannot reach server. Is backend running on port 4000?" : `Could not load data: ${msg}`,
        "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadDashboard();
  }, [location.key, loadDashboard]);

  useEffect(() => {
    if (!localStorage.getItem("welcomed")) {
      setShowWelcome(true);
      localStorage.setItem("welcomed", "1");
    }
  }, []);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) {
      showAppError("Only PDF files are supported. Please upload a .pdf resume.", "Invalid file type");
      return;
    }
    try {
      setUploading(true);
      const res = await uploadResume(file);
      toast.success("Resume analyzed! Starting interview...");
      navigate("/start-interview", {
        state: {
          jobTitle: "Resume-based Role",
          jobTopic: res.result || "Skills from Resume",
          questions: res.questions,
          interviewId: res.interviewId,
          fromResume: true,
        },
      });
    } catch (err) {
      showAppError(err.response?.data?.error || "Resume upload failed. Please try again.", "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this interview?")) return;
    try {
      await deleteInterview(id);
      toast.success("Interview deleted");
      loadDashboard();
    } catch {
      showAppError("Could not delete this interview. Please try again.", "Delete failed");
    }
  };

  const user = dashboard?.user || JSON.parse(localStorage.getItem("user") || "{}");
  const stats = dashboard?.stats || { totalSessions: 0, completed: 0, avgScore: 0, badges: 0 };
  const interviews = dashboard?.interviews || [];

  const filtered = interviews.filter((intv) => {
    const matchSearch =
      intv.jobTitle?.toLowerCase().includes(search.toLowerCase()) ||
      intv.jobTopic?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || intv.status === filter;
    return matchSearch && matchFilter;
  });

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (loading) return <div className="page-loading">Loading your dashboard...</div>;

  if (error) {
    return (
      <div className="dashboard-page">
        <EmptyState
          icon={Target}
          title="Connection Error"
          desc={error}
          actionLabel="Retry"
          onAction={() => { setLoading(true); loadDashboard(); }}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {showWelcome && (
        <WelcomeModal
          userName={user.fullName?.split(" ")[0] || "there"}
          onClose={() => setShowWelcome(false)}
        />
      )}

      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user.fullName?.split(" ")[0] || "there"}</h1>
          <p>
            Level {stats.level || 1} · {stats.points || 0} points
            {stats.streak > 0 ? ` · 🔥 ${stats.streak} day streak` : " · Start your streak!"}
          </p>
        </div>
        <div className="header-actions">
          <button className="action-btn primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Interview
          </button>
          <label className="action-btn secondary">
            <Upload size={18} />
            {uploading ? "Uploading..." : "Upload Resume"}
            <input type="file" accept=".pdf" hidden onChange={handleResumeUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon blue"><Clock size={20} /></div>
          <div><span className="stat-num">{stats.totalSessions}</span><span className="stat-lbl">Total Sessions</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Trophy size={20} /></div>
          <div><span className="stat-num">{stats.completed}</span><span className="stat-lbl">Completed</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Target size={20} /></div>
          <div><span className="stat-num">{stats.avgScore}%</span><span className="stat-lbl">Avg Score</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Award size={20} /></div>
          <div><span className="stat-num">{stats.badges}</span><span className="stat-lbl">Badges</span></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel interviews-panel">
          <div className="panel-header">
            <h2>Recent Interviews</h2>
            <div className="panel-tools">
              <div className="search-box">
                <Search size={16} />
                <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="interview-list">
              {filtered.map((intv) => (
                <div
                  key={intv._id}
                  className="interview-item"
                  onClick={() => {
                    if (intv.status === "completed") {
                      navigate("/feedback", { state: { interview: intv } });
                    } else {
                      navigate("/start-interview", {
                        state: {
                          jobTitle: intv.jobTitle, jobTopic: intv.jobTopic,
                          questions: intv.questions, interviewId: intv._id,
                        },
                      });
                    }
                  }}
                >
                  <div className="interview-info">
                    <h3>{intv.jobTitle}</h3>
                    <p>
                      {intv.jobTopic} · {intv.questions?.length || 0} Qs
                      {intv.difficulty && ` · ${intv.difficulty}`}
                      {intv.fromResume && " · Resume"}
                    </p>
                    <span className="interview-date">{formatDate(intv.createdAt)}</span>
                  </div>
                  <div className="interview-meta">
                    <span className={`status-badge ${intv.status}`}>
                      {intv.status === "completed" ? "Done" : "Pending"}
                    </span>
                    {intv.status === "completed" && intv.maxScore > 0 && (
                      <span className="score-badge">
                        {Math.round((intv.totalScore / intv.maxScore) * 100)}%
                      </span>
                    )}
                    <button className="delete-btn" onClick={(e) => handleDelete(e, intv._id)}>
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={18} className="chevron" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Trophy}
              title={search || filter !== "all" ? "No matches found" : "No interviews yet"}
              desc={search || filter !== "all"
                ? "Try changing your search or filter."
                : "Start your first AI mock interview to see your progress here."}
              actionLabel={!search && filter === "all" ? "Start Your First Interview" : undefined}
              onAction={!search && filter === "all" ? () => setShowModal(true) : undefined}
            />
          )}
        </div>

        <div className="side-panels">
          {dashboard?.recentActivity?.length > 0 && (
            <div className="panel activity-panel">
              <div className="panel-header"><Flame size={18} /><h2>Recent Activity</h2></div>
              <div className="activity-list">
                {dashboard.recentActivity.map((a, i) => (
                  <div key={i} className="activity-item">
                    <span className="act-role">{a.role}</span>
                    <span className="act-score">{a.maxScore ? Math.round((a.score / a.maxScore) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="panel tips-panel">
            <div className="panel-header"><Lightbulb size={18} /><h2>Pro Tips</h2></div>
            <ul className="tips-list">
              <li>Use the STAR method for behavioral questions</li>
              <li>Try different difficulty levels to challenge yourself</li>
              <li>Check Analytics to track weekly improvement</li>
              <li>Earn badges by maintaining your practice streak</li>
            </ul>
          </div>
          <div className="panel quick-start-panel">
            <h2>Quick Actions</h2>
            <button className="action-btn primary full" onClick={() => setShowModal(true)}>
              <Plus size={18} /> New Interview
            </button>
            <button 
              className="action-btn primary full" 
              style={{ background: '#8b5cf6', border: 'none', marginTop: '8px', marginBottom: '8px' }} 
              onClick={() => navigate("/objective-exam")}
            >
              ⚡ Objective Exam
            </button>
            <button className="action-btn secondary full" onClick={() => navigate("/analytics")}>View Analytics</button>
            <button className="action-btn secondary full" onClick={() => navigate("/leaderboard")}>Leaderboard</button>
            <button className="action-btn secondary full" onClick={() => navigate("/achievements")}>Achievements</button>
          </div>
        </div>
      </div>

      {showModal && <InterviewModal onClose={() => setShowModal(false)} onSuccess={loadDashboard} />}
    </div>
  );
};

export default InterviewPage;
