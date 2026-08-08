import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BarChart3, Trophy, Award, Settings, User,
  LogOut, Menu, X, BookOpen, Moon, Sun, Zap, Wallet, ClipboardCheck, Video, Code, FileText
} from "lucide-react";
import notify from '../utils/notify';
import { getProfile, getDashboard, syncUserToStorage, claimXpReward } from "../services/userAPI";
import { REWARDS_DATA, calculateProgress } from "../utils/rewardsUtils";
import { useWallet } from "../features/wallet/hooks/useWallet";
import WalletBadge from "../features/wallet/components/WalletBadge";
import Footer from "../components/Footer";
import "./AppLayout.css";

const NAV_ITEMS = [
  { to: "/user-dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/interview", icon: Video, label: "Mock Interview" },
  { to: "/coding-practice", icon: Code, label: "Code Practice", isNew: true },
  { to: "/objective-exam", icon: ClipboardCheck, label: "Objective Exam" },
  { to: "/ats-score", icon: FileText, label: "ATS Score", isNew: true },
  { to: "/btech-notes", icon: BookOpen, label: "Btech Notes", isFree: true },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/wallet", icon: Wallet, label: "Wallet" },
  { to: "/rewards", icon: Zap, label: "My Rewards" },
  { to: "/achievements", icon: Award, label: "Redeem XP" },
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

  const checkAndClaimRewards = async (currentUser, currentDash) => {
    if (!currentUser || !currentDash) return;
    const claimedRewards = currentUser.xpRewardsClaimed || [];
    let updated = false;
    let newXp = currentUser.points || 0;
    let newLevel = currentUser.level || 1;
    let newClaims = [];

    for (const reward of REWARDS_DATA) {
      if (claimedRewards.includes(reward.id)) continue;
      
      const currentProgress = calculateProgress(reward.id, currentUser, currentDash);
      if (currentProgress >= reward.target) {
        try {
          const res = await claimXpReward(reward.id, reward.xp);
          notify.success(`🎉 Reward Unlocked: ${reward.title}! +${reward.xp} XP`);
          newClaims.push(reward.id);
          newXp = res.totalPoints;
          newLevel = res.level;
          updated = true;
        } catch (err) {
          console.error("Failed to claim reward:", reward.id, err);
        }
      }
    }

    if (updated) {
      const allClaims = [...claimedRewards, ...newClaims];
      const updatedUser = { ...currentUser, points: newXp, level: newLevel, xpRewardsClaimed: allClaims };
      setUser(updatedUser);
      syncUserToStorage(updatedUser);
      window.dispatchEvent(new Event("user-updated"));
    }
  };

  const refreshUser = () => {
    Promise.all([getProfile(), getDashboard().catch(() => null)])
      .then(([u, dash]) => { 
        setUser(u); 
        syncUserToStorage(u); 
        if (dash) {
          checkAndClaimRewards(u, dash);
        }
      })
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

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    notify.success("Signed out successfully");
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
                <img src="/preepx_logo.png" alt="PreepX" className="brand-logo-img" style={{ height: "100px", objectFit: "contain", margin: "-28px 0 -28px 10px" }} />
              )}
            </Link>
            <button className="sidebar-toggle desktop-only" onClick={() => setCollapsed(!collapsed)}><Menu size={18} /></button>
            <button className="sidebar-toggle mobile-only" onClick={() => setMobileOpen(false)}><X size={18} /></button>
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map(({ to, icon: Icon, label, isFree, isNew }) => (
              <Link key={to} to={to} className={`sidebar-link ${location.pathname === to || (to !== "/interview" && location.pathname.startsWith(to)) ? "active" : ""}`} onClick={() => setMobileOpen(false)} title={label}>
                <Icon size={20} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <>
                    <span className="sidebar-link-label">{label}</span>
                    {isFree && <span className="nav-free-badge">Free</span>}
                    {isNew && <span className="nav-new-badge">New</span>}
                  </>
                )}
              </Link>
            ))}
          </nav>

          <div className="sidebar-bottom" style={{ padding: collapsed ? "12px 8px" : "12px 16px" }}>
            <div className={`sidebar-bottom-actions ${collapsed ? "collapsed" : ""}`}>
              <Link to="/profile" className="sidebar-profile-link" title="Profile">
                <img src={avatar} alt="Profile" />
              </Link>
              
              <button className="sidebar-action-btn" onClick={toggleTheme} title={isDark ? "Light Mode" : "Dark Mode"}>
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button className="sidebar-action-btn danger" onClick={handleLogout} title="Sign Out">
                <LogOut size={20} />
              </button>
            </div>
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
                <span className="points-badge" style={{ display: 'flex', alignItems: 'center', gap: '0px' }}><img src="/logo.png" alt="XP" style={{ width: '32px', height: '32px', margin: '-8px -6px -8px -8px', objectFit: 'contain' }} />{user.points || 0}<span className="badge-text" style={{ marginLeft: '2px' }}>XP</span></span>
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



