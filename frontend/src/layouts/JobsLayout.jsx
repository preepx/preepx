import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, Search, ClipboardCheck, User, LogOut,
  Menu, X, Bell, ChevronDown, Moon, Sun, PanelLeftClose, PanelLeft,
  ChevronLeft, Star, CheckCircle, AlertCircle, Clock,
} from "lucide-react";
import API from "../utils/api";
import { getMyApplications } from "../services/candidateJobsAPI";
import { getMyAssessments } from "../services/assessmentAPI";
import { io } from "socket.io-client";
import "./RecruiterLayout.css";
import "./JobsLayout.css";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ to: "/apply-jobs", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    label: "Jobs",
    items: [
      { to: "/apply-jobs/browse", icon: Search, label: "Browse Jobs" },
      { to: "/apply-jobs/my-applications", icon: Briefcase, label: "My Applications", badgeKey: "applications" },
      { to: "/apply-jobs/assessments", icon: ClipboardCheck, label: "Assessments", badgeKey: "assessments" },
    ],
  },
  {
    label: "Account",
    items: [{ to: "/apply-jobs/profile", icon: User, label: "Job Profile" }],
  },
];

const PAGE_TITLES = {
  "/apply-jobs": "Dashboard",
  "/apply-jobs/browse": "Browse Jobs",
  "/apply-jobs/my-applications": "My Applications",
  "/apply-jobs/assessments": "Assessments",
  "/apply-jobs/profile": "Job Profile",
};

function JobNotificationItem({ n, onRead, onDelete }) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const draggedRef = useRef(false);

  const handleStart = (clientX) => {
    startXRef.current = clientX;
    setIsDragging(true);
    draggedRef.current = false;
  };
  const handleMove = (clientX) => {
    if (!isDragging) return;
    const diff = clientX - startXRef.current;
    setTranslateX(diff);
    if (Math.abs(diff) > 10) draggedRef.current = true;
  };
  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(translateX) > 60) {
      onDelete(n.id || n._id);
    } else {
      setTranslateX(0);
    }
  };

  const handleClick = (e) => {
    if (draggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (!n.read) onRead(n.id || n._id);
  };

  return (
    <li
      className={n.read ? "" : "unread"}
      onClick={handleClick}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      style={{
        transform: `translateX(${translateX}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease',
        opacity: Math.abs(translateX) > 60 ? 0 : 1,
        cursor: 'pointer'
      }}
    >
      <span>
        {n.type === "shortlisted" ? <Star size={14} /> :
          n.type === "assessment" ? <ClipboardCheck size={14} /> :
            n.type === "rejected" ? <AlertCircle size={14} /> :
              <CheckCircle size={14} />}
      </span>
      <div>
        <strong>{n.title || "Update"}</strong>
        <p>{n.message?.length > 60 ? n.message.substring(0, 60) + "..." : n.message}</p>
        <span className="rx-muted" style={{ fontSize: 11 }}>
          <Clock size={11} style={{ verticalAlign: -2, marginRight: 4 }} />
          {n.time || new Date(n.createdAt || Date.now()).toLocaleDateString()}
        </span>
      </div>
    </li>
  );
}

function JobsLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.dataset.theme === "dark");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [assessmentBadge, setAssessmentBadge] = useState(0);
  const [applicationBadge, setApplicationBadge] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const safeGetUser = () => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  };
  const user = safeGetUser();
  const avatar = user.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "U")}&background=6366f1&color=fff`;

  const pageTitle = PAGE_TITLES[location.pathname] || "Apply Jobs";

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "dark";
    document.documentElement.dataset.theme = theme;
    setIsDark(theme === "dark");
  }, []);

  useEffect(() => {
    getMyAssessments()
      .then((data) => {
        const pending = (data || []).filter((a) => a.status !== "completed").length;
        setAssessmentBadge(pending);
      })
      .catch(() => { });

    getMyApplications()
      .then((data) => {
        const shortlisted = (data || []).filter((a) =>
          ["shortlisted", "assessment_sent", "offered", "hired", "selected"].includes(a.status)
        ).length;
        setApplicationBadge(shortlisted);
      })
      .catch(() => { });

    API.get("/users/notifications")
      .then((res) => setNotifications([...(res.data || [])].reverse()))
      .catch(() => { });
  }, [location.pathname]);

  useEffect(() => {
    const handleNewNotif = (e) => {
      if (e.detail) {
        setNotifications(prev => [e.detail, ...prev]);
      }
    };
    window.addEventListener('newNotification', handleNewNotif);
    return () => window.removeEventListener('newNotification', handleNewNotif);
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    const SOCKET_URL = API.defaults?.baseURL ? API.defaults.baseURL.replace('/api', '') : 'http://localhost:4000';
    const socket = io(SOCKET_URL);
    
    const handleConnect = () => {
      socket.emit('join_room', user._id);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on('connect', handleConnect);
    }

    socket.on('global_notification', (data) => {
      window.dispatchEvent(new CustomEvent('newNotification', { detail: data }));
    });

    return () => socket.disconnect();
  }, [user?._id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isActive = (to) => {
    if (to === "/apply-jobs") return location.pathname === to;
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  const getBadge = (badgeKey) => {
    if (badgeKey === "assessments") return assessmentBadge;
    if (badgeKey === "applications") return applicationBadge;
    return 0;
  };

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    setIsDark(!isDark);
  };

  const handleRead = async (id) => {
    try {
      setNotifications(prev => prev.map(n => (n.id === id || n._id === id) ? { ...n, read: true } : n));
      await API.put(`/users/notifications/${id}/read`);
    } catch { }
  };

  const handleDelete = async (id) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== id && n._id !== id));
      await API.delete(`/users/notifications/${id}`);
    } catch { }
  };

  const markAllRead = async () => {
    try {
      await API.put("/users/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/apply-jobs/browse${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`);
  };

  return (
    <div className={`rx-root ${collapsed ? "collapsed" : ""}`}>
      <aside className={`rx-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="rx-sidebar-top">
          <Link to="/apply-jobs" className="rx-brand">
            <span className="rx-brand-dot" />
            {!collapsed && <span>Apply Jobs</span>}
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
              {items.map(({ to, icon: Icon, label: itemLabel, badgeKey }) => {
                const badge = getBadge(badgeKey);
                return (
                  <Link
                    key={to}
                    to={to}
                    title={collapsed ? itemLabel : undefined}
                    className={`rx-nav-item ${isActive(to) ? "active" : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon size={18} />
                    {!collapsed && <span>{itemLabel}</span>}
                    {!collapsed && badge > 0 && <span className="jl-nav-badge">{badge}</span>}
                    {isActive(to) && <span className="rx-nav-indicator" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="rx-nav-bottom">
          <Link to="/user-dashboard" className="rx-nav-item" title="Back to App">
            <ChevronLeft size={18} />
            {!collapsed && <span>Back to App</span>}
          </Link>
          <button type="button" className="rx-nav-item rx-logout" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="rx-sidebar-overlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />}

      <div className="rx-main">
        <header className="rx-header">
          <button type="button" className="rx-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          {collapsed && (
            <button type="button" className="rx-icon-btn" onClick={() => setCollapsed(false)} aria-label="Expand sidebar">
              <PanelLeft size={18} />
            </button>
          )}
          <h1 className="rx-page-title">{pageTitle}</h1>
          <form className="rx-search" onSubmit={handleSearch}>
            <Search size={16} />
            <input
              placeholder="Search jobs, companies..."
              aria-label="Search jobs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <button type="button" className="rx-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            className="rx-icon-btn rx-notif-btn"
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="rx-notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </button>
          {showNotifications && (
            <div className="rx-notif-panel">
              <div className="rx-notif-head">
                <strong>Notifications</strong>
                {unreadCount > 0 && (
                  <button type="button" className="rx-notif-mark" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <p className="rx-muted" style={{ padding: 16, fontSize: 13 }}>No notifications yet</p>
              ) : (
                <ul className="rx-notif-list">
                  {notifications.slice(0, 5).map((n, i) => (
                    <JobNotificationItem 
                      key={n.id || n._id || i} 
                      n={n} 
                      onRead={handleRead} 
                      onDelete={handleDelete} 
                    />
                  ))}
                </ul>
              )}
            </div>
          )}
          <Link to="/apply-jobs/profile" className="rx-profile">
            <img src={avatar} alt="" className="rx-profile-avatar-img" />
            <div className="rx-profile-text">
              <strong>{user.fullName || "Candidate"}</strong>
              <span>Job Profile</span>
            </div>
            <ChevronDown size={16} className="rx-profile-chevron" />
          </Link>
        </header>
        <main className="rx-content">{children}</main>
      </div>
    </div>
  );
}

export default JobsLayout;
