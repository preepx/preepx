import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, Search, ClipboardCheck, User, LogOut,
  Bell, ChevronDown, Building2, Bookmark, BellRing, Video, FileText,
  Settings, Moon, MessageSquare, Menu, X
} from "lucide-react";
import API from "@/utils/api";
import { getMyApplications } from "../services/candidateJobsAPI";
import { getMyAssessments } from "@/services/assessmentAPI";
import NotificationModal from "@/components/NotificationModal";
import Footer from "@/components/Footer";
import '../styles/JobsLayout.css';

const NAV_MAIN = [
  { to: "/apply-jobs", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/apply-jobs/browse", icon: Search, label: "Browse Jobs" },
  { to: "/apply-jobs/assessments", icon: ClipboardCheck, label: "Assessments", badge: "New", badgePill: true },
  { to: "/apply-jobs/saved", icon: Bookmark, label: "Saved Jobs" },
];

const NAV_APPS = [
  { to: "/apply-jobs/my-applications", icon: Briefcase, label: "My Applications", badgeKey: "applications" },
  { to: "/apply-jobs/interviews", icon: Video, label: "Interviews" },
  { to: "/apply-jobs/tests", icon: FileText, label: "Tests" },
];

const NAV_ACCOUNT = [
  { to: "/apply-jobs/profile", icon: User, label: "Profile" },
  { to: "/apply-jobs/settings", icon: Settings, label: "Settings" },
];

function JobsLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [assessmentBadge, setAssessmentBadge] = useState(0);
  const [applicationBadge, setApplicationBadge] = useState(0);
  const [searchVal, setSearchVal] = useState("");
  const [showServicesMenu, setShowServicesMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const safeGetUser = () => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  };
  const user = safeGetUser();
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
      setApplicationBadge(n || 4);
    }).catch(() => { setApplicationBadge(4); });

    API.get("/users/notifications").then((res) =>
      setNotifications([...(res.data || [])].reverse())
    ).catch(() => { });
  }, [location.pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isActive = (to, exact) => {
    if (exact || to === "/apply-jobs") return location.pathname === to;
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const renderGroup = (items) => (
    <div className="jl-nav-group">
      {items.map(({ to, icon: Icon, label, badge, badgePill, badgeKey, exact }) => {
        const dynBadge = badgeKey === "applications" ? applicationBadge : 0;
        return (
          <Link
            key={to}
            to={to}
            className={`jl-nav-item ${isActive(to, exact) ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={17} />
            <span>{label}</span>
            {badgePill && <span className="jl-badge-pill">New</span>}
            {dynBadge > 0 && <span className="jl-badge-circle">{dynBadge}</span>}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="jl-root">
      {/* ── TOP NAVBAR ── */}
      <header className="jl-topbar">
        {/* Left: logo */}
        <div className="jl-topbar-left">
          <button className="jl-ham-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/apply-jobs" className="jl-logo-link">
            <img src="/preepx_logo.png" alt="PreepX" className="jl-logo" />
          </Link>
        </div>

        {/* Center: Nav links + search */}
        <div className="jl-topbar-center">
          <nav className="jl-top-links">
            <Link to="/apply-jobs/browse" className="jl-tlink">
              Jobs <span className="jl-tbadge">2</span>
            </Link>
            <Link to="/apply-jobs/companies" className="jl-tlink">
              Companies
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
                    {/* Column 1 */}
                    <div className="jl-mega-col">
                      <div className="jl-mega-section">
                        <h4>ATS & Resume</h4>
                        <Link to="/apply-jobs/resume">Resume Builder</Link>
                        <Link to="/ats-score">ATS Score Checker</Link>
                        <Link to="/apply-jobs/profile">Optimize Profile</Link>
                      </div>
                      <div className="jl-mega-section">
                        <h4>Career Resources</h4>
                        <Link to="/btech-notes">BTech Notes</Link>
                        <Link to="/100-days-challenge">100 Days Challenge</Link>
                      </div>
                    </div>

                    {/* Column 2 */}
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

                    {/* Column 3 */}
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
              onKeyDown={e => { if (e.key === "Enter" && searchVal) navigate(`/apply-jobs/browse?q=${encodeURIComponent(searchVal)}`); }}
              placeholder="Search jobs here"
            />
            <button onClick={() => { if (searchVal) navigate(`/apply-jobs/browse?q=${encodeURIComponent(searchVal)}`); }}>
              <Search size={15} />
            </button>
          </div>
        </div>

        {/* Right: icons + user */}
        <div className="jl-topbar-right">
          <button className="jl-tb-icon-btn" title="Dark mode"><Moon size={19} /></button>
          <button className="jl-tb-icon-btn jl-tb-notif" onClick={() => setShowNotifications(true)}>
            <Bell size={19} />
            {unreadCount > 0 && <span className="jl-tb-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </button>
          <button className="jl-tb-icon-btn"><MessageSquare size={19} /></button>
          <Link to="/apply-jobs/profile" className="jl-user-chip">
            <img src={avatar} alt="avatar" />
            <div>
              <strong>{user.fullName || "Candidate"}</strong>
              <span>Job Seeker</span>
            </div>
            <ChevronDown size={14} />
          </Link>
        </div>
      </header>

      <div className="jl-body">
        {/* ── SIDEBAR ── */}
        <aside className={`jl-sidebar ${mobileOpen ? "open" : ""}`}>
          <div className="jl-sb-scroll">
            <div className="jl-nav-section">
              <span className="jl-nav-label">MAIN</span>
              {renderGroup(NAV_MAIN)}
            </div>

            <div className="jl-nav-section">
              <span className="jl-nav-label">APPLICATIONS</span>
              {renderGroup(NAV_APPS)}
            </div>

            <div className="jl-nav-section">
              <span className="jl-nav-label">ACCOUNT</span>
              {renderGroup(NAV_ACCOUNT)}
              <button className="jl-nav-item jl-logout-btn" onClick={handleLogout}>
                <LogOut size={17} /><span>Logout</span>
              </button>
            </div>

          </div>
        </aside>

        {mobileOpen && <div className="jl-overlay" onClick={() => setMobileOpen(false)} />}

        {/* ── PAGE CONTENT ── */}
        <main className="jl-main">
          {children}
        </main>
      </div>

      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifs={notifications}
        setNotifs={setNotifications}
      />

      <Footer />
    </div>
  );
}

export default JobsLayout;
