import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  LayoutDashboard, Briefcase, Users, ClipboardCheck, Star, Video,
  GitBranch, BarChart3, CreditCard, Building2, Settings, LogOut,
  Menu, X, Search, Bell, ChevronDown, Moon, Sun, PanelLeftClose, PanelLeft, BadgeCheck,
  AlertTriangle, CheckCircle, User
} from "lucide-react";
import { getRecruiterNotifications, markRecruiterNotificationRead, markAllRecruiterNotificationsRead, getJobs, discoverCandidates } from "@/services/recruiterAPI";
import notify from "@/utils/notify";
import { getOnboarding } from "@/services/recruiterAPI";
import { useTheme } from "@/hooks/useTheme";
import { getStoredUser, clearAuth } from "@/utils/authUtils";
import '@/styles/RecruiterLayout.css';

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
      { to: "/recruiter/pipeline", icon: GitBranch, label: "Applications" },
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
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [companyStatus, setCompanyStatus] = useState("VERIFIED");
  const [user, setUser] = useState(() => getStoredUser() || {});

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [allJobs, setAllJobs] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    getJobs().then(setAllJobs).catch(() => { });
    discoverCandidates({}).then(setAllCandidates).catch(() => { });
  }, []);

  const filteredJobs = allJobs.filter(j => j.title?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCandidates = allCandidates.filter(c =>
    c.candidate?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.candidate?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadNotifications = () => {
    getRecruiterNotifications().then(setNotifications).catch(() => { });
  };

  const handleLogout = () => {
    clearAuth();
    notify.success("Signed out successfully");
    window.location.href = "/auth/recruiter";
  };

  useEffect(() => {
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
      }).catch(() => { });
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

  return (
    <>
      <div className={`rx-root ${collapsed ? "collapsed" : ""}`}>
        <aside className={`rx-sidebar ${mobileOpen ? "open" : ""}`}>
          <div className="rx-sidebar-top" style={{ padding: '8px 8px 16px', marginBottom: '12px' }}>
            <Link to="/recruiter-dashboard" className="rx-brand" style={{ display: 'flex', alignItems: 'center' }}>
              {collapsed ? (
                <img src="/logo.png" alt="PreepX" style={{ height: '32px', objectFit: 'contain', marginLeft: '4px' }} />
              ) : (
                <img src="/preepx_logo.png" alt="PreepX" className="brand-logo-img" style={{ height: '100px', objectFit: 'contain', margin: '-28px 0 -28px 10px' }} />
              )}
            </Link>
            <button type="button" className="rx-icon-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
              <Menu size={20} />
            </button>
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
            <button type="button" className="rx-nav-item rx-logout" onClick={handleLogout} title="Logout">
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
              <div className="rx-search" style={{ position: 'relative' }}>
                <Search size={16} />
                <input
                  placeholder="Search candidates, jobs..."
                  aria-label="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                />
                {searchFocused && searchQuery && (
                  <div className="rx-notif-panel" style={{ top: 'calc(100% + 8px)', left: 0, right: 'auto', width: '320px', paddingBottom: '8px' }}>
                    <ul className="rx-notif-list">
                      <li style={{ padding: '8px 16px 4px', background: 'transparent', cursor: 'default' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Jobs</span>
                      </li>
                      {filteredJobs.slice(0, 3).map(j => (
                        <li key={j._id} onClick={() => navigate(`/recruiter/jobs`)} style={{ cursor: 'pointer', alignItems: 'center' }}>
                          <Briefcase size={14} style={{ color: 'var(--primary)' }} />
                          <div>
                            <strong>{j.title}</strong>
                            <p>{j.location || j.type || "Job"}</p>
                          </div>
                        </li>
                      ))}
                      {filteredJobs.length === 0 && <li style={{ padding: '4px 16px', fontSize: '13px', background: 'transparent' }} className="rx-muted">No jobs found</li>}

                      <li style={{ padding: '12px 16px 4px', background: 'transparent', cursor: 'default' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Candidates</span>
                      </li>
                      {filteredCandidates.slice(0, 4).map(c => (
                        <li key={c._id} onClick={() => navigate(`/recruiter/candidates`)} style={{ cursor: 'pointer', alignItems: 'center' }}>
                          <User size={14} style={{ color: 'var(--primary)' }} />
                          <div>
                            <strong>{c.candidate?.fullName || c.fullName || "Candidate"}</strong>
                            <p>{c.candidate?.email || c.email || "No email"}</p>
                          </div>
                        </li>
                      ))}
                      {filteredCandidates.length === 0 && <li style={{ padding: '4px 16px', fontSize: '13px', background: 'transparent' }} className="rx-muted">No candidates found</li>}
                    </ul>
                  </div>
                )}
              </div>
              <button type="button" className="rx-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button type="button" className="rx-icon-btn rx-notif-btn" aria-label="Notifications" onClick={() => setShowNotifs(!showNotifs)}>
                <Bell size={18} />
                {unreadCount > 0 && <span className="rx-notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
              </button>
              {showNotifs && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setShowNotifs(false)} />
                  <div className="rx-notif-panel" style={{ zIndex: 200 }}>
                    <div className="rx-notif-head">
                      <strong>Notifications</strong>
                      {unreadCount > 0 && (
                        <button type="button" className="rx-notif-mark" onClick={() => markAllRecruiterNotificationsRead().then(loadNotifications)}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="rx-muted" style={{ padding: 16, fontSize: 13, minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        No notifications yet
                      </div>
                    ) : (
                      <ul className="rx-notif-list">
                        {notifications.map((n) => (
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
                </>
              )}
              <div className="rx-profile" role="button" tabIndex={0} onClick={() => navigate('/recruiter/company')} style={{ cursor: 'pointer' }}>
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
    </>
  );
}
