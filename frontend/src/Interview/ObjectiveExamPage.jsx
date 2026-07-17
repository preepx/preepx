import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus, Clock, Trophy, Target, Search, Trash2,
  ChevronRight, Zap, BookOpen, BarChart3, Award, Flame,
} from "lucide-react";
import { getMcqDashboard, deleteMcqResult } from "../services/mcqAPI";
import { syncUserToStorage } from "../services/userAPI";
import { toast } from "react-toastify";
import { showAppError } from "../utils/appAlert";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import "./InterviewPage.css";

const ObjectiveExamPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const location = useLocation();

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      const data = await getMcqDashboard();
      setDashboard(data);
      if (data.user) {
        syncUserToStorage(data.user);
        window.dispatchEvent(new Event("user-updated"));
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to load exam data";
      if (err.response?.status === 401) {
        navigate("/auth");
        return;
      }
      setError(msg);
      showAppError(msg, "Failed to load objective exams");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    loadDashboard();
  }, [location.key, loadDashboard]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this exam record?")) return;
    try {
      await deleteMcqResult(id);
      toast.success("Exam deleted");
      loadDashboard();
    } catch {
      showAppError("Could not delete this exam.", "Delete failed");
    }
  };

  const user = dashboard?.user || JSON.parse(localStorage.getItem("user") || "{}");
  const mcqStats = dashboard?.mcqStats || { totalExams: 0, avgAccuracy: 0, bestScore: 0, totalQuestions: 0 };
  const mcqResults = dashboard?.mcqResults || [];
  const globalStats = dashboard?.stats || {};

  const filtered = mcqResults.filter((exam) => {
    const matchSearch = exam.topic?.toLowerCase().includes(search.toLowerCase());
    // Filter can be extended if we have status for exams, currently all are completed
    const matchFilter = filter === "all" || true; 
    return matchSearch && matchFilter;
  });

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const getAccuracy = (exam) =>
    exam.totalQuestions ? Math.round((exam.score / exam.totalQuestions) * 100) : 0;

  if (loading) return <Loader />;

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
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user.fullName?.split(" ")[0] || "there"}</h1>
          <p>
            Level {globalStats.level || 1} · {globalStats.points || 0} points
            {globalStats.streak > 0 ? ` · 🔥 ${globalStats.streak} day streak` : " · Start your streak!"}
          </p>
        </div>
        <div className="header-actions">
          <button className="action-btn primary" onClick={() => navigate("/objective-exam/take")}>
            <Plus size={18} /> New Exam
          </button>
          <button className="action-btn secondary" onClick={() => navigate("/interview")}>
            Mock Interviews
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon blue"><BookOpen size={20} /></div>
          <div><span className="stat-num">{mcqStats.totalExams}</span><span className="stat-lbl">Total Exams</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Target size={20} /></div>
          <div><span className="stat-num">{mcqStats.avgAccuracy}%</span><span className="stat-lbl">Avg Score</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Trophy size={20} /></div>
          <div><span className="stat-num">{mcqStats.bestScore}%</span><span className="stat-lbl">Best Score</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Zap size={20} /></div>
          <div><span className="stat-num">{mcqStats.totalQuestions}</span><span className="stat-lbl">Questions</span></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel interviews-panel">
          <div className="panel-header">
            <h2>Exam History</h2>
            <div className="panel-tools">
              <div className="search-box">
                <Search size={16} />
                <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
                <option value="all">All</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="interview-list">
              {filtered.map((exam) => {
                const accuracy = getAccuracy(exam);
                return (
                  <div
                    key={exam._id}
                    className="interview-item"
                    onClick={() => navigate(`/objective-exam/result/${exam._id}`)}
                  >
                    <div className="interview-info">
                      <h3>{exam.topic}</h3>
                      <p>
                        {exam.score}/{exam.totalQuestions} correct · {exam.totalQuestions} MCQs
                      </p>
                      <span className="interview-date">{formatDate(exam.createdAt)}</span>
                    </div>
                    <div className="interview-meta">
                      <span className="status-badge completed">Done</span>
                      <span className="score-badge">{accuracy}%</span>
                      <button className="delete-btn" onClick={(e) => handleDelete(e, exam._id)}>
                        <Trash2 size={16} />
                      </button>
                      <ChevronRight size={18} className="chevron" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Trophy}
              title={search || filter !== "all" ? "No matches found" : "No exams yet"}
              desc={search || filter !== "all"
                ? "Try changing your search or filter."
                : "Take your first objective exam to track scores and review answers."}
              actionLabel={!search && filter === "all" ? "Start First Exam" : undefined}
              onAction={!search && filter === "all" ? () => navigate("/objective-exam/take") : undefined}
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
                    <span className="act-role">
                      {a.type === "mcq" ? "📝 " : ""}{a.role}
                      {a.type === "mcq" && <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 6 }}>MCQ</span>}
                    </span>
                    <span className="act-score">{a.maxScore ? Math.round((a.score / a.maxScore) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="panel quick-start-panel">
            <h2>Quick Actions</h2>
            <button className="action-btn primary full" onClick={() => navigate("/objective-exam/take")}>
              <Plus size={18} /> New Objective Exam
            </button>
            <button 
              className="action-btn primary full" 
              style={{ background: '#8b5cf6', border: 'none', marginTop: '8px', marginBottom: '8px' }} 
              onClick={() => navigate("/interview")}
            >
              ⚡ AI Interview
            </button>
            <button className="action-btn secondary full" onClick={() => navigate("/analytics")}>View Analytics</button>
            <button className="action-btn secondary full" onClick={() => navigate("/leaderboard")}>Leaderboard</button>
            <button className="action-btn secondary full" onClick={() => navigate("/achievements")}>Achievements</button>
          </div>
          <div className="panel tips-panel">
            <div className="panel-header"><Award size={18} /><h2>Pro Tips</h2></div>
            <ul className="tips-list">
              <li>5 points per correct answer</li>
              <li>+20 bonus if accuracy ≥ 80%</li>
              <li>+50 bonus for a perfect score</li>
              <li>Points count toward leaderboard rank</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectiveExamPage;

