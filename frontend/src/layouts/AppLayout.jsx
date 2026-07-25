import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BarChart3, Trophy, Award, Settings, User,
  LogOut, Menu, X, BookOpen, Moon, Sun, Zap, Wallet, ClipboardCheck, Video,
} from "lucide-react";
import { toast } from "react-toastify";
import { getProfile, syncUserToStorage } from "../services/userAPI";
import { useWallet } from "../features/wallet/hooks/useWallet";
import WalletBadge from "../features/wallet/components/WalletBadge";
import Footer from "../components/Footer";
import "./AppLayout.css";

const NAV_ITEMS = [
  { to: "/user-dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/interview", icon: Video, label: "Mock Interview" },
  { to: "/objective-exam", icon: ClipboardCheck, label: "Objective Exam", isFree: true },
  { to: "/achievements", icon: Award, label: "Achievements" },
  { to: "/btech-notes", icon: BookOpen, label: "Btech Notes", isFree: true },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { to: "/wallet", icon: Wallet, label: "Wallet" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(document.documentElement.dataset.theme === "dark");
  const { balance } = useWallet();

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
    const next = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    setIsDark(!isDark);
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
    <>
      <div className={`app-layout ${collapsed ? "collapsed" : ""}`}>
        <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
          <div className="sidebar-top">
            <Link to="/interview" className="sidebar-brand">
              {collapsed ? (
                <img src="/logo.png" alt="PreepX" style={{ height: '32px', objectFit: 'contain', marginLeft: '4px' }} />
              ) : (
                <img src="/headername1.png" alt="PreepX" style={{ height: '70px', transform: 'scale(1.4)', transformOrigin: 'left center', objectFit: 'contain', marginLeft: '8px' }} />
              )}
            </Link>
            <button className="sidebar-toggle desktop-only" onClick={() => setCollapsed(!collapsed)}><Menu size={18} /></button>
            <button className="sidebar-toggle mobile-only" onClick={() => setMobileOpen(false)}><X size={18} /></button>
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map(({ to, icon: Icon, label, isFree }) => (
              <Link key={to} to={to} className={`sidebar-link ${location.pathname === to || (to !== "/interview" && location.pathname.startsWith(to)) ? "active" : ""}`} onClick={() => setMobileOpen(false)} title={label}>
                <Icon size={20} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <>
                    <span className="sidebar-link-label">{label}</span>
                    {isFree && <span className="nav-free-badge">Free</span>}
                  </>
                )}
              </Link>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <button className="sidebar-link" onClick={toggleTheme}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
              {!collapsed && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
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
                  <p className="su-meta">Lvl {user.level || 1} · {user.points || 0} XP</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

        <div className="app-content">
          {!location.pathname.includes("/pdf") && (
            <header className="topbar">
              <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
  
              <div className="topbar-center">
                <WalletBadge />
              </div>
  
              <div className="topbar-right">
                {user.streak > 0 && <span className="streak-badge">🔥 {user.streak}<span className="badge-text"> day streak</span></span>}
                <span className="level-badge"><span className="badge-text">Level </span>{user.level || 1}</span>
                <span className="points-badge" style={{ display: 'flex', alignItems: 'center', gap: '0px' }}><img src="/logo.png" alt="XP" style={{width: '32px', height: '32px', margin: '-8px -6px -8px -8px', objectFit: 'contain'}} />{user.points || 0}<span className="badge-text" style={{ marginLeft: '2px' }}>XP</span></span>
              </div>
            </header>
          )}
          <div className="page-content">{children}</div>
        </div>
      </div>
      {!location.pathname.includes("/pdf") && <Footer />}
    </>
  );
}

export default AppLayout;



