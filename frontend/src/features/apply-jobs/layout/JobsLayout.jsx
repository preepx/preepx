import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, Search, ClipboardCheck, User, LogOut,
  Bell, ChevronDown, Bookmark, Video, FileText,
  Settings, Moon, Sun, MessageSquare, Menu, X, CalendarDays, Zap, Globe
} from "lucide-react";
import API from "@/utils/api";
import { getMyApplications } from "../services/candidateJobsAPI";
import { getMyAssessments } from "@/services/assessmentAPI";
import { useTheme } from "@/hooks/useTheme";
import { getStoredUser, clearAuth } from "@/utils/authUtils";
import NotificationModal from "@/components/NotificationModal";
import Footer from "@/components/Footer";
import '../styles/JobsLayout.css';

const NAV_MAIN = [
  { to: "/apply-jobs", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/apply-jobs/browse", icon: Search, label: "Browse Jobs" },
  { to: "/apply-jobs#ajd-events", icon: CalendarDays, label: "Events" },
  { to: "/apply-jobs/assessments", icon: ClipboardCheck, label: "Assessments", badge: "New", badgePill: true },
  { to: "/apply-jobs/saved", icon: Bookmark, label: "Saved Jobs" },
];

const NAV_APPS = [
  { to: "/apply-jobs/my-applications", icon: Briefcase, label: "My Applications", badgeKey: "applications" },
];

const NAV_ACCOUNT = [
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/apply-jobs/settings", icon: Settings, label: "Settings" },
];

function JobsLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [assessmentBadge, setAssessmentBadge] = useState(0);
  const [applicationBadge, setApplicationBadge] = useState(0);
  const [searchVal, setSearchVal] = useState("");
  const [showServicesMenu, setShowServicesMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1100) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const user = getStoredUser() || {};
  const avatar = user.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "U")}&background=4f46e5&color=fff`;

  useEffect(() => {
    getMyAssessments().then((data) => {
      const pending = (data || []).filter((a) => a.status !== "completed").length;
      setAssessmentBadge(pending);
    }).catch(() => { });

    getMyApplications().then((data) => {
      const n = (data || []).filter((a) =>
        ["shortlisted", "assessment_sent", "offered", "hired", "selected"].includes(a.status)
      ).length;
      setApplicationBadge(n || 0);
    }).catch(() => { setApplicationBadge(0); });

    API.get("/users/notifications").then((res) =>
      setNotifications([...(res.data || [])].reverse())
    ).catch(() => { });
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isActive = (to, exact) => {
    if (exact || to === "/apply-jobs") return location.pathname === to;
    if (to.includes("?")) {
      return location.pathname + location.search === to;
    }
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  const renderGroup = (items) => (
    <div className="jl-nav-group">
      {items.map(({ to, icon: Icon, label, badge, badgePill, badgeKey, exact }) => {
        const dynBadge = badgeKey === "applications" ? applicationBadge : 0;
        const active = isActive(to, exact);
        return (
          <Link
            key={`${to}-${label}`}
            to={to}
            className={`jl-nav-item ${active ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            {active && <span className="jl-nav-indicator" />}
            <Icon size={20} style={{ flexShrink: 0 }} />
            <span className="jl-nav-text">{label}</span>
            {badgePill && <span className="jl-badge-pill">New</span>}
            {dynBadge > 0 && <span className="jl-badge-circle">{dynBadge}</span>}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className={`jl-root ${collapsed ? "collapsed" : ""}`}>
      <div className="jl-body">
        {/* ── SIDEBAR (Left column, full height) ── */}
        <aside className={`jl-sidebar ${mobileOpen ? "open" : ""} ${collapsed && !mobileOpen ? "collapsed" : ""}`}>
        <div className="sidebar-top">
          {(!collapsed || mobileOpen) && (
            <Link to="/apply-jobs" className="sidebar-brand" onClick={() => setMobileOpen(false)}>
              <img src="/preepx_logo.png" alt="PreepX" className="brand-logo-img" style={{ height: "100px", objectFit: "contain", margin: "-28px 0 -28px 10px" }} />
            </Link>
          )}
          <button
            type="button"
            className="sidebar-toggle desktop-only"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle Sidebar"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <div className="hamburger-box">
              <span className="ham-bar top-bar" />
              <span className="ham-bar mid-bar" />
              <span className="ham-bar bot-bar" />
            </div>
          </button>
          <button
            type="button"
            className="sidebar-close-btn mobile-only"
            onClick={() => setMobileOpen(false)}
            aria-label="Close Sidebar"
          >
            <X size={19} />
          </button>
        </div>

        <div className="jl-sb-scroll">
          <div className="jl-nav-section">
            {renderGroup(NAV_MAIN)}
          </div>

          <div className="jl-nav-section">
            {renderGroup(NAV_APPS)}
          </div>

          <div className="jl-nav-section">
            {renderGroup(NAV_ACCOUNT)}
          </div>
        </div>

        <div className="sidebar-bottom" style={{ padding: (collapsed && !mobileOpen) ? "12px 8px" : "12px 16px" }}>
          <div className={`sidebar-bottom-actions ${collapsed && !mobileOpen ? "collapsed" : ""}`}>
            <Link to="/" className="sidebar-action-btn" title="Back to Main Website" onClick={() => setMobileOpen(false)}>
              <Globe size={20} />
            </Link>

            <button className="sidebar-action-btn" onClick={toggleTheme} title={theme === "light" ? "Dark Mode" : "Light Mode"}>
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button className="sidebar-action-btn danger" onClick={handleLogout} title="Sign Out">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && <div className="jl-overlay" onClick={() => setMobileOpen(false)} />}

      {/* ── CONTENT AREA (Topbar + Page Content + Footer) ── */}
      <div className="jl-content-area">
        {/* ── TOP NAVBAR ── */}
        <header className="jl-topbar">
          <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <div className="hamburger-box">
                <span className="ham-bar top-bar" />
                <span className="ham-bar mid-bar" />
                <span className="ham-bar bot-bar" />
              </div>
            </button>
            <Link to="/apply-jobs" className="jl-mobile-logo-link" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/preepx_logo.png" alt="PreepX" className="jl-mobile-logo" />
            </Link>
          </div>

          {/* Center: Nav links + search */}
          <div className="jl-topbar-center">
            <nav className="jl-top-links">
              <Link to="/apply-jobs/browse" className="jl-tlink">
                Jobs <span className="jl-tbadge">Live</span>
              </Link>

              <Link to="/apply-jobs#ajd-events" className="jl-tlink">
                Events
              </Link>
              <div
                className="jl-mega-wrapper"
                onMouseEnter={() => setShowServicesMenu(true)}
                onMouseLeave={() => setShowServicesMenu(false)}
              >
                <div className="jl-tlink-services">
                  <span className="jl-tlink" style={{ cursor: 'pointer' }}>
                    Services <span className="jl-tbadge">1</span>
                  </span>

                  {/* Mega Menu Dropdown */}
                  {showServicesMenu && (
                    <div className="jl-mega-menu">
                      <div className="jl-mega-col">
                        <div className="jl-mega-section">
                          <h4>ATS & Resume</h4>
                          <Link to="/apply-jobs/resume">Resume Builder</Link>
                          <Link to="/ats-score">ATS Score Checker</Link>
                          <Link to="/profile">Optimize Profile</Link>
                        </div>
                        <div className="jl-mega-section">
                          <h4>Career Resources</h4>
                          <Link to="/btech-notes">Notes</Link>
                          <Link to="/100-days-challenge">100 Days Challenge</Link>
                        </div>
                      </div>

                      <div className="jl-mega-col">
                        <div className="jl-mega-section">
                          <h4>Interview Preparation</h4>
                          <Link to="/interview">AI Mock Interview</Link>
                          <Link to="/resume-interview">Resume Based Interview</Link>
                        </div>
                        <div className="jl-mega-section">
                          <h4>Assessments & Tests</h4>
                          <Link to="/objective-exam">Objective Exams</Link>
                          <Link to="/my-assessments">Coding Challenges</Link>
                        </div>
                      </div>

                      <div className="jl-mega-col">
                        <div className="jl-mega-section">
                          <h4>For Recruiters</h4>
                          <Link to="/auth/recruiter">Post a Job</Link>
                          <Link to="/auth/recruiter">Find Candidates</Link>
                        </div>
                        <div className="jl-mega-section">
                          <h4>Premium Benefits 🔴</h4>
                          <span className="jl-mega-promo">Upgrade to priority applicant to boost your chances by 3x.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </nav>

            <div className="jl-top-search">
              <input
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && searchVal) navigate(`/apply-jobs/browse?search=${encodeURIComponent(searchVal)}`); }}
                placeholder="Search jobs, skills, companies"
              />
              <button onClick={() => { if (searchVal) navigate(`/apply-jobs/browse?search=${encodeURIComponent(searchVal)}`); }}>
                <Search size={15} />
              </button>
            </div>
          </div>

          {/* Right: icons + user */}
          <div className="jl-topbar-right">
            <div className="jl-hiring-live" title="Live hiring activity">
              <Zap size={13} />
              <span className="jl-hiring-text">Hiring live</span>
            </div>
            <button className="jl-tb-icon-btn jl-tb-notif" onClick={() => setShowNotifications(true)}>
              <Bell size={19} />
              {unreadCount > 0 && <span className="jl-tb-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
            </button>
            <Link to="/profile" className="jl-user-chip">
              <img src={avatar} alt="avatar" />
              <div>
                <strong>{user.fullName || "Candidate"}</strong>
                <span>Job Seeker</span>
              </div>
              <ChevronDown size={14} />
            </Link>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="jl-main">
          {children}
        </main>
      </div>
    </div>

    {/* ── FULL WIDTH FOOTER REMOVED PER USER REQUEST ── */}

      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifs={notifications}
        setNotifs={setNotifications}
      />
    </div>
  );
}

export default JobsLayout;
