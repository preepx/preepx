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
import PageTransitionLoader from "@/components/PageTransitionLoader";
import '../styles/JobsLayout.css';
import "@/styles/AppLayout.css";

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { to: "/apply-jobs", icon: LayoutDashboard, label: "Dashboard", exact: true },
      { to: "/apply-jobs/browse", icon: Search, label: "Browse Jobs" },
      { to: "/apply-jobs#ajd-events", icon: CalendarDays, label: "Events" },
    ]
  },
  {
    label: "APPLICATIONS",
    items: [
      { to: "/apply-jobs/assessments", icon: ClipboardCheck, label: "Assessments", badge: "New", badgePill: true },
      { to: "/apply-jobs/saved", icon: Bookmark, label: "Saved Jobs" },
      { to: "/apply-jobs/my-applications", icon: Briefcase, label: "My Applications", badgeKey: "applications" },
    ]
  },
  {
    label: "ACCOUNT",
    items: [
      { to: "/profile", icon: User, label: "Profile" },
      { to: "/apply-jobs/settings", icon: Settings, label: "Settings" },
    ]
  }
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
  const { theme } = useTheme();

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

  return (
    <div className={`jl-root app-layout ${collapsed ? "collapsed" : ""}`}>
      <div className="jl-body">
        {/* ── SIDEBAR (Left column, full height) ── */}
        <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
          <div className="sidebar-top">
            <Link to="/apply-jobs" className="sidebar-brand" onClick={() => setMobileOpen(false)}>
              {collapsed && !mobileOpen ? (
                <img src="/logo.png" alt="PreepX" style={{ height: "32px", objectFit: "contain", marginLeft: "4px" }} />
              ) : (
                <img src="/preepx_logo.png" alt="PreepX" className="brand-logo-img" style={{ height: "100px", objectFit: "contain", margin: "-28px 0 -28px 10px" }} />
              )}
            </Link>
            <button
              type="button"
              className="sidebar-toggle desktop-only"
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Toggle Sidebar"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <img src="/hemgor.svg" alt="Menu" style={{ width: 18, height: 18, display: 'block', margin: 'auto' }} />
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

          <nav className="sidebar-nav">
            {NAV_SECTIONS.map(({ label: sectionLabel, items }) => (
              <div key={sectionLabel || "top"} className="sidebar-section">
                {sectionLabel && (!collapsed || mobileOpen) && (
                  <span className="sidebar-section-label">{sectionLabel}</span>
                )}
                {items.map(({ to, icon: Icon, label, badge, badgePill, badgeKey, exact }) => {
                  const dynBadge = badgeKey === "applications" ? applicationBadge : 0;
                  const active = isActive(to, exact);
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`sidebar-link ${active ? "active" : ""}`}
                      onClick={() => setMobileOpen(false)}
                      title={label}
                    >
                      <Icon size={20} style={{ flexShrink: 0 }} />
                      {(!collapsed || mobileOpen) && (
                        <>
                          <span className="sidebar-link-label">{label}</span>
                          {badgePill && <span className="nav-new-badge" style={{ background: '#2563eb', color: '#fff', fontSize: '10px', padding: '2px 7px', borderRadius: '10px', marginLeft: 'auto' }}>New</span>}
                          {badge && !badgePill && <span className="nav-free-badge" style={{ marginLeft: 'auto' }}>{badge}</span>}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="sidebar-bottom">
            {(!collapsed || mobileOpen) ? (
              <div className="sidebar-bottom-row">
                <Link to="/" className="sidebar-bottom-btn" title="Back to Main Website" onClick={() => setMobileOpen(false)}>
                  <Globe size={20} />
                  <span>Website</span>
                </Link>
                <button type="button" className="sidebar-bottom-btn logout-btn" onClick={handleLogout} title="Sign Out">
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="sidebar-bottom-collapsed">
                <Link to="/" className="sidebar-action-btn" data-tooltip="Back to Main Website" onClick={() => setMobileOpen(false)}>
                  <Globe size={20} />
                </Link>
                <button type="button" className="sidebar-action-btn danger" onClick={handleLogout} data-tooltip="Sign Out">
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>
        </aside>

        {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

        {/* ── CONTENT AREA (Topbar + Page Content + Footer) ── */}
        <div className="jl-content-area app-content">
          {/* ── TOP NAVBAR ── */}
          <header className="jl-topbar">
            <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                className="mobile-menu-btn"
                onClick={() => setMobileOpen(true)}
                aria-label="Open Navigation Menu"
              >
                <img src="/hemgor.svg" alt="Menu" style={{ width: 18, height: 18, display: 'block', margin: 'auto' }} />
              </button>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', letterSpacing: '-0.3px' }}>Jobs</span>
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
              <button
                type="button"
                className="tb-icon-btn"
                onClick={() => setShowNotifications(true)}
                title="Notifications"
                style={{ position: 'relative' }}
              >
                <Bell size={24} color="var(--text)" />
                {unreadCount > 0 && (
                  <span className="tb-notif-dot">
                    {unreadCount}
                  </span>
                )}
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
            <PageTransitionLoader>
              {children}
            </PageTransitionLoader>
          </main>
        </div>
      </div>

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
