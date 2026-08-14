import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Video, FileText, Trophy, BarChart3, Award, Flame, PlayCircle,
  Wallet, BookOpen, Target, TrendingUp, ChevronRight, Sparkles,
  ClipboardCheck, Zap, Code, Briefcase
} from "lucide-react";
import { getProfile, getAnalytics } from "@/services/userAPI";
import notify from "@/utils/notify";
import { useWallet } from "../features/wallet/hooks/useWallet";
import Loader from "@/components/Loader";
import '@/styles/UserDashboard.css';

const EXPLORE_LINKS = [
  { icon: Code, label: "Code Practice", desc: "Interactive coding challenges", path: "/coding-practice", color: "#ec4899", isNew: true },
  { icon: FileText, label: "ATS Score", desc: "Analyze your resume", path: "/ats-score", color: "#14b8a6", isNew: true },
  { icon: BookOpen, label: "Btech Notes", desc: "Study resources", path: "/btech-notes", color: "#3b82f6", free: true },
  { icon: Trophy, label: "Leaderboard", desc: "Global rankings", path: "/leaderboard", color: "#f59e0b" },
  { icon: BarChart3, label: "Analytics", desc: "Score trends & insights", path: "/analytics", color: "#06b6d4" },
  { icon: Wallet, label: "Wallet", desc: "Manage your coins", path: "/wallet", color: "#10b981" },
  { icon: Zap, label: "My Rewards", desc: "Level up with XP", path: "/rewards", color: "#f59e0b" },
  { icon: Award, label: "Redeem XP", desc: "Redeem XP for coins", path: "/achievements", color: "#8b5cf6" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function scorePct(entry) {
  if (!entry.maxScore) return 0;
  return Math.round((entry.score / entry.maxScore) * 100);
}

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { balance } = useWallet();

  const refreshData = () => {
    Promise.all([
      getProfile().catch(() => null),
      getAnalytics().catch(() => null),
    ]).then(([u, s]) => {
      if (u) {
        setUser(u);
        localStorage.setItem("user", JSON.stringify(u));
      }
      if (s) setStats(s);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    refreshData();

    const handleUserUpdate = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (updatedUser) setUser(updatedUser);
      getAnalytics().then((s) => setStats(s)).catch(() => { });
    };

    window.addEventListener("user-updated", handleUserUpdate);
    return () => window.removeEventListener("user-updated", handleUserUpdate);
  }, [navigate]);

  const lifetimePoints = user?.lifetimePoints ?? user?.points ?? 0;
  const levelProgress = lifetimePoints % 100;
  const pointsToNext = 100 - levelProgress;

  const recentActivity = useMemo(() => {
    if (!stats?.recentScores?.length) return [];
    return [...stats.recentScores].reverse().slice(0, 3);
  }, [stats]);

  const maxWeeklyCount = useMemo(() => {
    if (!stats?.weeklyData?.length) return 1;
    return Math.max(...stats.weeklyData.map((d) => d.count), 1);
  }, [stats]);

  if (loading) return <Loader />;

  const firstName = (user?.fullName || "User").split(" ")[0];
  const avatar = user.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "U")}&background=4f46e5&color=fff&size=128`;

  const totalInterviews = stats?.totalInterviews || user?.interviewsCompleted || 0;
  const totalMcq = stats?.totalMcqExams || 0;
  const streak = stats?.streak ?? user?.streak ?? 0;
  const badgesCount = user?.badges?.length || 0;
  const coins = balance ?? user?.coins ?? 0;
  const avgScore = stats?.avgScore ?? 0;

  return (
    <div className="ud-page">
      {/* HERO */}
      <section className="ud-hero">
        <div className="ud-hero-bg">
          <div className="ud-orb ud-orb-1" />
          <div className="ud-orb ud-orb-2" />
          <div className="ud-hero-grid" />
        </div>

        <div className="ud-hero-inner">
          <div className="ud-hero-left">
            <div className="ud-avatar-wrap">
              <img src={avatar} alt={firstName} className="ud-avatar" />
              {streak > 0 && (
                <span className="ud-avatar-streak" title={`${streak} day streak`}>
                  <Flame size={12} /> {streak}
                </span>
              )}
            </div>
            <div className="ud-hero-text">
              <span className="ud-greeting-badge">
                <Sparkles size={13} /> {getGreeting()}
              </span>
              <h1>Welcome back, <span className="ud-name">{firstName}</span></h1>
              <p>Ready to sharpen your skills? Pick up where you left off.</p>
            </div>
          </div>

          <div className="ud-level-panel">
            <div className="ud-level-ring">
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" className="ud-ring-bg" />
                <circle
                  cx="40" cy="40" r="34"
                  className="ud-ring-fill"
                  strokeDasharray={`${levelProgress * 2.136} 213.6`}
                />
              </svg>
              <div className="ud-level-center">
                <span className="ud-level-num">{user?.level || 1}</span>
                <span className="ud-level-lbl">Level</span>
              </div>
            </div>
            <div className="ud-level-info">
              <div className="ud-xp-row">
                <img src="/favicon.png" alt="XP" className="ud-px-icon" />
                <strong>{user?.points || 0}</strong>
                <span>XP available</span>
              </div>
              <div className="ud-xp-bar">
                <div className="ud-xp-fill" style={{ width: `${levelProgress}%` }} />
              </div>
              <p className="ud-xp-hint">{pointsToNext} XP to Level {(user?.level || 1) + 1}</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="ud-stats-row">
        <div className="ud-stat-card" style={{ "--accent": "#6366f1" }}>
          <div className="ud-stat-icon"><BarChart3 size={20} /></div>
          <div>
            <span className="ud-stat-val">{totalInterviews}</span>
            <span className="ud-stat-lbl">Interviews</span>
          </div>
        </div>
        <div className="ud-stat-card" style={{ "--accent": "#06b6d4" }}>
          <div className="ud-stat-icon"><ClipboardCheck size={20} /></div>
          <div>
            <span className="ud-stat-val">{totalMcq}</span>
            <span className="ud-stat-lbl">MCQ Exams</span>
          </div>
        </div>
        <div className="ud-stat-card" style={{ "--accent": "#10b981" }}>
          <div className="ud-stat-icon"><Target size={20} /></div>
          <div>
            <span className="ud-stat-val">{avgScore > 0 ? `${avgScore}%` : "—"}</span>
            <span className="ud-stat-lbl">Avg Score</span>
          </div>
        </div>
        <div className="ud-stat-card" style={{ "--accent": "#f59e0b" }}>
          <div className="ud-stat-icon"><span className="ud-coin-emoji">🪙</span></div>
          <div>
            <span className="ud-stat-val">{coins}</span>
            <span className="ud-stat-lbl">Coins · {badgesCount} badges</span>
          </div>
        </div>
      </section>

      {/* APPLY JOBS CTA */}
      <section className="ud-section">
        <button type="button" className="ud-apply-banner" onClick={() => navigate("/apply-jobs")}>
          <div className="ud-apply-banner-icon"><Briefcase size={28} /></div>
          <div className="ud-apply-banner-text">
            <h2>Apply Jobs</h2>
            <p>View matched roles, track applications, shortlists & assessments</p>
          </div>
          <ChevronRight size={24} className="ud-apply-banner-arrow" />
        </button>
      </section>

      {/* PRACTICE CTAs */}
      <section className="ud-section">
        <div className="ud-section-head">
          <h2>Continue Practicing</h2>
          <p>Your next session is one click away</p>
        </div>
        <div className="ud-practice-grid">
          <button type="button" className="ud-practice-card ud-practice-primary" onClick={() => navigate("/interview")}>
            <div className="ud-practice-glow" />
            <div className="ud-practice-icon"><Video size={26} /></div>
            <div className="ud-practice-body">
              <h3>Start Mock Interview</h3>
              <p>Live AI interview with webcam, voice & instant scoring</p>
              <span className="ud-practice-cta">Start now <ChevronRight size={16} /></span>
            </div>
            <PlayCircle size={28} className="ud-practice-play" />
          </button>

          <button type="button" className="ud-practice-card ud-practice-secondary" onClick={() => navigate("/objective-exam")}>
            <div className="ud-practice-glow" />
            <div className="ud-practice-icon"><FileText size={26} /></div>
            <div className="ud-practice-body">
              <h3>Objective Exam</h3>
              <p>Quick MCQ quizzes to test your technical knowledge</p>
              <span className="ud-practice-cta">Take quiz <ChevronRight size={16} /></span>
            </div>
          </button>
        </div>
      </section>

      {/* EXPLORE */}
      <section className="ud-section">
        <div className="ud-section-head">
          <h2>Explore Platform</h2>
          <p>Everything you need to ace your interviews</p>
        </div>
        <div className="ud-explore-grid">
          {EXPLORE_LINKS.map(({ icon: Icon, label, desc, path, color, free, isNew }) => (
            <button
              key={label}
              type="button"
              className="ud-explore-card"
              style={{ "--accent": color }}
              onClick={() => path && navigate(path)}
            >
              <div className="ud-explore-icon"><Icon size={22} /></div>
              <div>
                <h4>
                  {label}
                  {free && <span className="ud-free-pill">Free</span>}
                  {isNew && <span className="nav-new-badge" style={{ marginLeft: '6px' }}>New</span>}
                </h4>
                <p>{desc}</p>
              </div>
              <ChevronRight size={18} className="ud-explore-arrow" />
            </button>
          ))}
        </div>
      </section>

      {/* WEEKLY + RECENT */}
      <div className="ud-main-grid">
        <section className="ud-panel">
          <div className="ud-panel-head">
            <h3><TrendingUp size={18} /> Weekly Activity</h3>
            <Link to="/analytics">Full analytics →</Link>
          </div>
          {stats?.weeklyData?.length ? (
            <div className="ud-weekly-chart">
              {stats.weeklyData.map((d) => (
                <div key={d.day} className="ud-bar-col">
                  <div className="ud-bar-wrap">
                    <div
                      className="ud-bar-fill"
                      style={{ height: `${(d.count / maxWeeklyCount) * 100}%` }}
                      title={`${d.count} session${d.count !== 1 ? "s" : ""}`}
                    />
                  </div>
                  <span className="ud-bar-day">{d.day}</span>
                  {d.count > 0 && <span className="ud-bar-score">{d.avgScore}%</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="ud-panel-empty">
              <Zap size={32} />
              <p>Complete a session to unlock your weekly chart</p>
              <button type="button" onClick={() => navigate("/interview")}>Start Interview</button>
            </div>
          )}
        </section>

        <section className="ud-panel">
          <div className="ud-panel-head">
            <h3><BarChart3 size={18} /> Recent Activity</h3>
            <Link to="/analytics">View all →</Link>
          </div>
          {recentActivity.length > 0 ? (
            <ul className="ud-recent-list">
              {recentActivity.map((entry, idx) => {
                const pct = scorePct(entry);
                return (
                  <li key={`${entry.date}-${idx}`} className="ud-recent-item">
                    <div className="ud-recent-type">{entry.type === "mcq" ? "MCQ" : "Live"}</div>
                    <div className="ud-recent-info">
                      <strong>{entry.role || "Practice Session"}</strong>
                      <span>{new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </div>
                    <div className={`ud-recent-score ${pct >= 70 ? "good" : pct >= 40 ? "mid" : "low"}`}>
                      {pct}%
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="ud-panel-empty">
              <Video size={32} />
              <p>No sessions yet. Your journey starts here!</p>
              <button type="button" onClick={() => navigate("/interview")}>Start First Interview</button>
            </div>
          )}
        </section>
      </div>

      {/* LEADERBOARD CTA */}
      <section className="ud-banner">
        <div className="ud-banner-bg" />
        <div className="ud-banner-content">
          <div className="ud-banner-icon"><Trophy size={36} /></div>
          <div>
            <h3>Climb the Leaderboard</h3>
            <p>
              {streak > 0
                ? `You're on a ${streak}-day streak! Keep practicing to rise in the ranks.`
                : "Compete with candidates worldwide and earn exclusive rewards."}
            </p>
          </div>
        </div>
        <button type="button" className="ud-banner-btn" onClick={() => navigate("/leaderboard")}>
          View Rankings <ChevronRight size={18} />
        </button>
      </section>
    </div>
  );
}

export default UserDashboard;
