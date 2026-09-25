import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus, Upload, Clock, Trophy, Lightbulb, ChevronRight,
  Search, Trash2, Target, Flame, Award, LayoutDashboard,
} from "lucide-react";
import { getDashboard, syncUserToStorage } from "@/services/userAPI";
import { deleteInterview, getInterviewById } from "@/services/interviewAPI";
import { uploadResume } from "@/services/resumeAPI";
import notify from '@/utils/notify';
import { showAppError } from "@/utils/appAlert";
import InterviewModal from "./InterviewModal";
import WelcomeModal from "@/components/WelcomeModal";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import '@/styles/InterviewPage.css';

const InterviewPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

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
      notify.success("Resume analyzed! Starting interview...");
      navigate("/interview-setup", {
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
      notify.success("Interview deleted");
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
      {showWelcome && (
        <WelcomeModal
          userName={user.fullName?.split(" ")[0] || "there"}
          onClose={() => setShowWelcome(false)}
        />
      )}

      <div className="dashboard-header banner-header">
        <div className="banner-content">
          <h1 className="banner-welcome">Welcome Back!</h1>
          <p className="banner-stats">
            Level {stats.level || 1} . {stats.points || 0} Points . {stats.streak || 0} Days Streak
          </p>
          <h2 className="banner-subtitle">
            Ready to Nail Your Next<br />
            <span className="banner-highlight">Interview with AI?</span>
          </h2>
          <div className="header-actions">
            <button className="action-btn primary banner-btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} /> Start Your Interviews
            </button>
            <label className="action-btn secondary banner-btn-secondary">
              <Upload size={18} />
              {uploading ? "Uploading..." : "Upload Resume"}
              <input type="file" accept=".pdf" hidden onChange={handleResumeUpload} disabled={uploading} />
            </label>
          </div>
        </div>
        <div className="banner-image-wrapper">
          <img src="/dsbanner/mockinterview.png" alt="Mock Interview" className="banner-img" />
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div>
            <img src="/dsbanner/total Sessions.svg" alt="Total Sessions" style={{ width: 28, height: 28 }} />
          </div>
          <div><span className="stat-num">{stats.totalSessions}</span><span className="stat-lbl">Total Sessions</span></div>
        </div>
        <div className="stat-card">
          <div>
            <img src="/dsbanner/Completed.svg" alt="Completed" style={{ width: 28, height: 28 }} />
          </div>
          <div><span className="stat-num">{stats.completed}</span><span className="stat-lbl">Completed</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Target size={20} /></div>
          <div><span className="stat-num">{stats.avgScore}%</span><span className="stat-lbl">Avg Score</span></div>
        </div>
        <div className="stat-card">
          <div>
            <img src="/dsbanner/Badges.svg" alt="Badges" style={{ width: 28, height: 28 }} />
          </div>
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
            <div className="interview-table-container">
              <table className="interviews-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Role</th>
                    <th>Date</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((intv, index) => {
                      const scorePerc = intv.maxScore > 0 ? Math.round((intv.totalScore / intv.maxScore) * 100) : 0;
                      return (
                        <tr key={intv._id}>
                          <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td>
                            <span className="role-title">{intv.jobTitle}</span>
                          </td>
                          <td>{formatDate(intv.createdAt)}</td>
                          <td>
                            {intv.status === "completed" && intv.maxScore > 0 ? (
                              <div className="circular-score">
                                <svg viewBox="0 0 36 36" className="circular-chart green">
                                  <path className="circle-bg"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                  <path className="circle"
                                    strokeDasharray={`${scorePerc}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                  <text x="18" y="20.35" className="percentage">{scorePerc}%</text>
                                </svg>
                              </div>
                            ) : (
                              <span className="no-score">-</span>
                            )}
                          </td>
                          <td>
                            <span className={`status-pill ${intv.status}`}>
                              {intv.status === "completed" ? "Completed" : "Pending"}
                            </span>
                          </td>
                          <td>
                            <button
                              className="action-view-btn"
                              onClick={async () => {
                                if (intv.status === "completed") {
                                  try {
                                    const fullIntv = await getInterviewById(intv._id);
                                    navigate("/feedback", {
                                      state: { interview: fullIntv, jobTitle: fullIntv.jobTitle, jobTopic: fullIntv.jobTopic }
                                    });
                                  } catch (err) {
                                    console.error("Failed to fetch:", err);
                                    navigate("/feedback", { state: { interview: intv } });
                                  }
                                } else {
                                  navigate("/interview-setup", {
                                    state: { jobTitle: intv.jobTitle, jobTopic: intv.jobTopic, questions: intv.questions, interviewId: intv._id },
                                  });
                                }
                              }}
                            >
                              <LayoutDashboard size={14} /> View
                            </button>
                            <button className="action-delete-btn" onClick={(e) => handleDelete(e, intv._id)}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
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

          <div className="panel quick-start-panel">
            <h2>Quick Actions</h2>
            <button className="action-btn primary full" style={{ justifyContent: 'flex-start', paddingLeft: '24px' }} onClick={() => setShowModal(true)}>
              <span style={{ width: 24, display: 'flex', justifyContent: 'center' }}><Plus size={18} /></span> New Interview
            </button>
            <button
              className="action-btn primary full"
              style={{ background: '#8b5cf6', border: 'none', marginTop: '8px', marginBottom: '8px', justifyContent: 'flex-start', paddingLeft: '24px' }}
              onClick={() => navigate("/objective-exam")}
            >
              <span style={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                <img src="/sidebar/objectiveexamicon.svg" alt="Objective Exam" style={{ width: 18, height: 18, filter: 'brightness(0) invert(1)' }} />
              </span> Objective Exam
            </button>
            <button className="action-btn secondary full" style={{ justifyContent: 'flex-start', paddingLeft: '24px', marginBottom: '8px' }} onClick={() => navigate("/analytics")}>
              <span style={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                <img src="/sidebar/anyltics.svg" alt="Analytics" style={{ width: 18, height: 18, objectFit: 'contain', opacity: 0.7 }} />
              </span> View Analytics
            </button>
            <button className="action-btn secondary full" style={{ justifyContent: 'flex-start', paddingLeft: '24px', marginBottom: '8px' }} onClick={() => navigate("/leaderboard")}>
              <span style={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                <img src="/sidebar/leaderboard.svg" alt="Leaderboard" style={{ width: 18, height: 18, objectFit: 'contain', opacity: 0.7 }} />
              </span> Leaderboard
            </button>
            <button className="action-btn secondary full" style={{ justifyContent: 'flex-start', paddingLeft: '24px' }} onClick={() => navigate("/achievements")}>
              <span style={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                <img src="/sidebar/myrewards.svg" alt="Achievements" style={{ width: 18, height: 18, objectFit: 'contain', opacity: 0.7 }} />
              </span> Achievements
            </button>
          </div>
          <div className="panel tips-panel">
            <div className="panel-header"><Lightbulb size={18} /><h2>Pro Tips</h2></div>
            <ul className="tips-list">
              <li>Use the STAR method for behavioral questions</li>
              <li>Try different difficulty levels to challenge yourself</li>
              <li>Check Analytics to track weekly improvement</li>
              <li>Earn badges by maintaining your practice streak</li>
            </ul>
          </div>
        </div>
      </div>

      {showModal && <InterviewModal onClose={() => setShowModal(false)} onSuccess={loadDashboard} />}
    </div>
  );
};

export default InterviewPage;
