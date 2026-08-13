import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase, Search, ClipboardCheck, Bell, User, LogOut,
  ChevronLeft, LayoutDashboard, Star, FileText, Building2,
  X, CheckCircle, Clock, AlertCircle
} from "lucide-react";
import API from "../utils/api";
import { getMyApplications } from "../services/candidateJobsAPI";
import { getMyAssessments } from "../services/assessmentAPI";
import Footer from "../components/Footer";
import "./JobsLayout.css";

const JOBS_NAV = [
  { to: "/apply-jobs", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/apply-jobs/browse", icon: Search, label: "Browse Jobs" },
  { to: "/apply-jobs/my-applications", icon: Briefcase, label: "My Applications" },
  { to: "/apply-jobs/assessments", icon: ClipboardCheck, label: "Assessments" },
  { to: "/apply-jobs/profile", icon: User, label: "Job Profile" },
];

function JobsLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [assessmentBadge, setAssessmentBadge] = useState(0);
  const [applicationBadge, setApplicationBadge] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const safeGetUser = () => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  };
  const user = safeGetUser();
  const avatar = user.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "U")}&background=6366f1&color=fff`;

  useEffect(() => {
    // Fetch assessments to count pending
    getMyAssessments()
      .then((data) => {
        const pending = (data || []).filter((a) => a.status !== "completed").length;
        setAssessmentBadge(pending);
      })
      .catch(() => {});

    // Fetch applications to count shortlisted / new
    getMyApplications()
      .then((data) => {
        const shortlisted = (data || []).filter((a) =>
          ["shortlisted", "assessment_sent", "offered", "hired", "selected"].includes(a.status)
        ).length;
        setApplicationBadge(shortlisted);
      })
      .catch(() => {});

    // Fetch notifications
    API.get("/users/notifications")
      .then((res) => {
        const notifs = (res.data || []).slice(0, 15);
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.read).length);
      })
      .catch(() => {});
  }, [location.pathname]);

  const markAllRead = async () => {
    try {
      await API.put("/users/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname === item.to || location.pathname.startsWith(item.to + "/");
  };

  const getBadge = (to) => {
    if (to === "/apply-jobs/assessments") return assessmentBadge;
    if (to === "/apply-jobs/my-applications") return applicationBadge;
    return 0;
  };

  return (
    <div className="jl-page-wrapper">
      <div className="jl-root">
      {/* SIDEBAR */}
      <aside className={`jl-sidebar ${mobileNavOpen ? "jl-sidebar--open" : ""}`}>
        <div className="jl-sidebar-top">
          <Link to="/apply-jobs" className="jl-brand">
            <div className="jl-brand-icon">
              <Briefcase size={20} />
            </div>
            <div>
              <div className="jl-brand-name">JobsHub</div>
              <div className="jl-brand-sub">by PreepX</div>
            </div>
          </Link>
          <button className="jl-mobile-close" onClick={() => setMobileNavOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User Mini Card */}
        <div className="jl-user-card">
          <img src={avatar} alt="avatar" className="jl-user-avatar" />
          <div className="jl-user-info">
            <span className="jl-user-name">{user.fullName || "User"}</span>
            <span className="jl-user-role">{user.email || ""}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="jl-nav">
          {JOBS_NAV.map(({ to, icon: Icon, label }) => {
            const badge = getBadge(to);
            const active = isActive({ to, exact: to === "/apply-jobs" });
            return (
              <Link
                key={to}
                to={to}
                className={`jl-nav-link ${active ? "jl-nav-link--active" : ""}`}
                onClick={() => setMobileNavOpen(false)}
              >
                <Icon size={19} />
                <span>{label}</span>
                {badge > 0 && <span className="jl-nav-badge">{badge}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="jl-sidebar-footer">
          <Link to="/user-dashboard" className="jl-back-btn">
            <ChevronLeft size={16} />
            Back to App
          </Link>
          <button className="jl-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* OVERLAY for mobile */}
      {mobileNavOpen && (
        <div className="jl-overlay" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* MAIN CONTENT */}
      <div className="jl-main">
        {/* TOPBAR */}
        <header className="jl-topbar">
          <button className="jl-hamburger" onClick={() => setMobileNavOpen(true)}>
            <span /><span /><span />
          </button>

          <div className="jl-topbar-title">
            {JOBS_NAV.find((n) => isActive({ to: n.to, exact: n.to === "/apply-jobs" }))?.label || "Jobs"}
          </div>

          <div className="jl-topbar-right">
            {/* Notification Bell */}
            <div className="jl-notif-wrap">
              <button
                className="jl-notif-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="jl-notif-count">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="jl-notif-panel">
                  <div className="jl-notif-header">
                    <strong>Notifications</strong>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="jl-notif-read-all">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="jl-notif-list">
                    {notifications.length === 0 ? (
                      <div className="jl-notif-empty">
                        <Bell size={28} />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={i} className={`jl-notif-item ${!n.read ? "jl-notif-item--unread" : ""}`}>
                          <div className="jl-notif-icon">
                            {n.type === "shortlisted" ? <Star size={16} /> :
                              n.type === "assessment" ? <ClipboardCheck size={16} /> :
                                n.type === "rejected" ? <AlertCircle size={16} /> :
                                  <CheckCircle size={16} />}
                          </div>
                          <div className="jl-notif-body">
                            <div className="jl-notif-title">{n.title || "Update"}</div>
                            <div className="jl-notif-msg">{n.message}</div>
                            <div className="jl-notif-time">
                              <Clock size={11} />
                              {n.time || new Date(n.createdAt || Date.now()).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <Link to="/apply-jobs/profile" className="jl-topbar-avatar">
              <img src={avatar} alt="Profile" />
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="jl-page-content">
          <div className="jl-page-inner">
            {children}
          </div>
        </main>
      </div>
    </div>
    <Footer />
    </div>
  );
}

export default JobsLayout;
