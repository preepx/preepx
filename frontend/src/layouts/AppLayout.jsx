import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BarChart3, Trophy, Award, Settings, User,
  LogOut, Menu, X, Upload, Moon, Sun, Zap,
} from "lucide-react";
import { toast } from "react-toastify";
import { getProfile, syncUserToStorage } from "../services/userAPI";
import "./AppLayout.css";

const NAV_ITEMS = [
  { to: "/interview", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/objective-exam", icon: Zap, label: "Objective Exam" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { to: "/achievements", icon: Award, label: "Achievements" },
  { to: "/resume-interview", icon: Upload, label: "Resume" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
  const location = useLocation();
  const navigate = useNavigate();
  const dark = document.documentElement.dataset.theme === "dark";

  const refreshUser = () => {
    getProfile()
      .then((u) => { setUser(u); syncUserToStorage(u); })
      .catch(() => { });
  };

  useEffect(() => {
    refreshUser();
    const handler = () => setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    window.addEventListener("user-updated", handler);
    return () => window.removeEventListener("user-updated", handler);
  }, [location.pathname]);

  const toggleTheme = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Signed out successfully");
    navigate("/");
  };

  const avatar = user.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "U")}&background=4f46e5&color=fff`;

  return (
    <div className={`app-layout ${collapsed ? "collapsed" : ""}`}>
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-top">
          <Link to="/interview" className="sidebar-brand">
            <div className="brand-dot" />
            {!collapsed && <span>PrepX</span>}
          </Link>
          <button className="sidebar-toggle desktop-only" onClick={() => setCollapsed(!collapsed)}><Menu size={18} /></button>
          <button className="sidebar-toggle mobile-only" onClick={() => setMobileOpen(false)}><X size={18} /></button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={`sidebar-link ${location.pathname === to || (to !== "/interview" && location.pathname.startsWith(to)) ? "active" : ""}`} onClick={() => setMobileOpen(false)} title={label}>
              <Icon size={20} />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="sidebar-link" onClick={toggleTheme}>
            {dark ? <Sun size={20} /> : <Moon size={20} />}
            {!collapsed && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
          </button>
          <button className="sidebar-link danger" onClick={handleLogout}>
            <LogOut size={20} />
            {!collapsed && <span>Sign Out</span>}
          </button>
          {!collapsed && (
            <div className="sidebar-user">
              <img src={avatar} alt="" />
              <div>
                <p className="su-name">{user.fullName || "User"}</p>
                <p className="su-meta">Lvl {user.level || 1} · {user.points || 0} pts</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <div className="app-content">
        <header className="topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
          <div className="topbar-right">
            {user.streak > 0 && <span className="streak-badge">🔥 {user.streak} day streak</span>}
            <span className="level-badge">Level {user.level || 1}</span>
            <span className="points-badge">{user.points || 0} pts</span>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}

export default AppLayout;
