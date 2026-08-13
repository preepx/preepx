import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  LayoutDashboard, Briefcase, Users, ClipboardCheck, Star, Video,
  GitBranch, BarChart3, CreditCard, Building2, Settings, LogOut,
  Menu, X, Search, Bell, ChevronDown, Moon, Sun, PanelLeftClose, PanelLeft, BadgeCheck,
  AlertTriangle, CheckCircle
} from "lucide-react";
import { getRecruiterNotifications, markRecruiterNotificationRead, markAllRecruiterNotificationsRead } from "../services/recruiterAPI";
import notify from "../utils/notify";
import { getOnboarding } from "../services/recruiterAPI";
import "./RecruiterLayout.css";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:4000";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ to: "/recruiter-dashboard", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    label: "Hiring",
    items: [
      { to: "/recruiter/jobs", icon: Briefcase, label: "Jobs" },
      { to: "/recruiter/candidates", icon: Users, label: "Candidates" },
      { to: "/recruiter/assessments", icon: ClipboardCheck, label: "Assessments" },
      { to: "/recruiter/shortlisted", icon: Star, label: "Shortlisted" },
      { to: "/recruiter/interviews", icon: Video, label: "Interviews" },
      { to: "/recruiter/pipeline", icon: GitBranch, label: "Pipeline" },
    ],
  },
  {
    label: "Insights",
    items: [{ to: "/recruiter/analytics", icon: BarChart3, label: "Analytics" }],
  },
  {
    label: "Account",
    items: [
      { to: "/recruiter/billing", icon: CreditCard, label: "Billing" },
      { to: "/recruiter/company", icon: Building2, label: "Company Profile" },
      { to: "/recruiter/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export default function RecruiterLayout({ children, title = "Dashboard" }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.dataset.theme === "dark");
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [companyStatus, setCompanyStatus] = useState(null);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
  const location = useLocation();
  const navigate = useNavigate();

  const loadNotifications = () => {
    getRecruiterNotifications().then(setNotifications).catch(() => { });
  };

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "dark";
    document.documentElement.dataset.theme = theme;
    setIsDark(theme === "dark");
    loadNotifications();

    const fetchStatus = () => {
      getOnboarding().then((data) => {
        const isVerified = data.recruiter?.isVerified ?? (data.company?.verificationStatus === "VERIFIED");
        if (data.company) {
          setCompanyStatus(data.company.verificationStatus);
        }
        setUser(prevUser => {
          if (prevUser.isVerified !== isVerified) {
            const updatedUser = { ...prevUser, isVerified };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            return updatedUser;
          }
          return prevUser;
        });
      }).catch(() => {});
    };

    fetchStatus();
    window.addEventListener("company_profile_updated", fetchStatus);
    
    return () => {
      window.removeEventListener("company_profile_updated", fetchStatus);
    };
  }, []);

  useEffect(() => {
    if (!user._id) return;
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    const join = () => socket.emit("join_recruiter_room", user._id);
    if (socket.connected) join();
    else socket.on("connect", join);

    socket.on("recruiter_notification", (data) => {
      setNotifications((prev) => [data, ...prev].slice(0, 50));
      notify.info(data.message || data.title);
      // Automatically refresh onboarding status to hide/show banner in real-time
      window.dispatchEvent(new Event("company_profile_updated"));
    });

    return () => socket.disconnect();
  }, [user._id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isActive = (to) =>
    location.pathname === to || (to !== "/recruiter-dashboard" && location.pathname.startsWith(to));

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    setIsDark(!isDark);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/recruiter");
  };

  return (
    <div className={`rx-root ${collapsed ? "collapsed" : ""}`}>
      <aside className={`rx-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="rx-sidebar-top">
          <Link to="/recruiter-dashboard" className="rx-brand">
            <span className="rx-brand-dot" />
            {!collapsed && <span>PreepX</span>}
          </Link>
          {!collapsed && (
            <button type="button" className="rx-icon-btn" onClick={() => setCollapsed(true)} aria-label="Collapse sidebar">
              <PanelLeftClose size={18} />
            </button>
          )}
        </div>



        <nav className="rx-nav">
          {NAV_SECTIONS.map(({ label, items }) => (
            <div key={label} className="rx-nav-section">
              {!collapsed && <span className="rx-nav-label">{label}</span>}
              {items.map(({ to, icon: Icon, label: itemLabel }) => (
                <Link
                  key={to}
                  to={to}
                  title={collapsed ? itemLabel : undefined}
                  className={`rx-nav-item ${isActive(to) ? "active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={18} />
                  {!collapsed && <span>{itemLabel}</span>}
                  {isActive(to) && <span className="rx-nav-indicator" />}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="rx-nav-bottom">
          <button type="button" className="rx-nav-item rx-logout" onClick={logout} title="Logout">
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="rx-sidebar-overlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />}

      <div className="rx-main">
        <div style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', flexDirection: 'column' }}>
          <header className="rx-header" style={{ position: 'static', zIndex: 'auto' }}>
          <button type="button" className="rx-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          {collapsed && (
            <button type="button" className="rx-icon-btn" onClick={() => setCollapsed(false)} aria-label="Expand sidebar">
              <PanelLeft size={18} />
            </button>
          )}
          <h1 className="rx-page-title">{title}</h1>
          <div className="rx-search">
            <Search size={16} />
            <input placeholder="Search candidates, jobs..." aria-label="Search" />
          </div>
          <button type="button" className="rx-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button type="button" className="rx-icon-btn rx-notif-btn" aria-label="Notifications" onClick={() => setShowNotifs(!showNotifs)}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="rx-notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </button>
          {showNotifs && (
            <div className="rx-notif-panel">
              <div className="rx-notif-head">
                <strong>Notifications</strong>
                {unreadCount > 0 && (
                  <button type="button" className="rx-notif-mark" onClick={() => markAllRecruiterNotificationsRead().then(loadNotifications)}>
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <p className="rx-muted" style={{ padding: 16, fontSize: 13 }}>No notifications yet</p>
              ) : (
                <ul className="rx-notif-list">
                  {notifications.slice(0, 8).map((n) => (
                    <li key={n.id} className={n.read ? "" : "unread"} onClick={() => markRecruiterNotificationRead(n.id).then(loadNotifications)}>
                      <span>{n.icon || "🔔"}</span>
                      <div>
                        <strong>{n.title}</strong>
                        <p>{n.message}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="rx-profile" role="button" tabIndex={0}>
            <div className="rx-profile-avatar">{user.fullName?.[0] || "R"}</div>
            <div className="rx-profile-text">
              <strong>{user.fullName || "Recruiter"}</strong>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {user.designation || user.companyName || "Recruiter"}
                <BadgeCheck
                  size={14}
                  color={user.isVerified ? "#10b981" : "#6b7280"}
                  title={user.isVerified ? "Verified Company" : "Unverified Company"}
                />
              </span>
            </div>
            <ChevronDown size={16} className="rx-profile-chevron" />
          </div>
          </header>
          {!user.isVerified && (
            <div style={{
              background: 'var(--bg)',
              color: companyStatus === 'PENDING' ? '#22c55e' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 28px', marginBottom: '-16px'
            }}>
            {companyStatus === 'PENDING' ? <CheckCircle size={18} style={{ flexShrink: 0 }} /> : <AlertTriangle size={18} style={{ flexShrink: 0 }} />}
            <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {companyStatus === 'PENDING' ? (
                  <><strong>Profile Submitted:</strong> Thanks for completing the profile, waiting for approval by admin.</>
                ) : (
                  <><strong>Verification Required:</strong> Complete your company profile to get verified. Once approved, you can post jobs and access all features.</>
                )}
              </span>
              {companyStatus !== 'PENDING' && (
                <Link to="/recruiter/company" style={{
                  color: '#f59e0b', fontWeight: '600', textDecoration: 'underline', whiteSpace: 'nowrap', marginLeft: '8px'
                }}>
                  Complete Profile →
                </Link>
              )}
            </div>
          </div>
          )}
        </div>
        <main className="rx-content">{children}</main>
      </div>
    </div>
  );
}
