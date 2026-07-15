import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus, Clock, Trophy, Target, Search, Trash2,
  ChevronRight, Zap, BookOpen, BarChart3, Award,
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

  const filtered = mcqResults.filter((exam) =>
    exam.topic?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

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
          <h1>Objective Exams</h1>
          <p>
            Level {globalStats.level || 1} · {globalStats.points || 0} points
            {globalStats.streak > 0 ? ` · 🔥 ${globalStats.streak} day streak` : ""}
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
          <div><span className="stat-num">{mcqStats.totalExams}</span><span className="stat-lbl">Exams Taken</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Target size={20} /></div>
          <div><span className="stat-num">{mcqStats.avgAccuracy}%</span><span className="stat-lbl">Avg Accuracy</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Trophy size={20} /></div>
          <div><span className="stat-num">{mcqStats.bestScore}%</span><span className="stat-lbl">Best Score</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Zap size={20} /></div>
          <div><span className="stat-num">{mcqStats.totalQuestions}</span><span className="stat-lbl">Questions Attempted</span></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel interviews-panel">
          <div className="panel-header">
            <h2>Exam History</h2>
            <div className="panel-tools">
              <div className="search-box">
                <Search size={16} />
                <input placeholder="Search by topic..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
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
              title={search ? "No matches found" : "No exams yet"}
              desc={search
                ? "Try a different search term."
                : "Take your first objective exam to track scores and review answers."}
              actionLabel={!search ? "Start First Exam" : undefined}
              onAction={!search ? () => navigate("/objective-exam/take") : undefined}
            />
          )}
        </div>

        <div className="side-panels">
          <div className="panel quick-start-panel">
            <h2>Quick Actions</h2>
            <button className="action-btn primary full" onClick={() => navigate("/objective-exam/take")}>
              <Plus size={18} /> New Objective Exam
            </button>
            <button className="action-btn secondary full" onClick={() => navigate("/leaderboard")}>
              View Leaderboard
            </button>
            <button className="action-btn secondary full" onClick={() => navigate("/analytics")}>
              <BarChart3 size={16} /> Analytics
            </button>
            <button className="action-btn secondary full" onClick={() => navigate("/interview")}>
              <Clock size={16} /> Mock Interviews
            </button>
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
