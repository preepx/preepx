import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BarChart3, Trophy, Award, Settings, User,
  LogOut, Menu, X, BookOpen, Moon, Sun, Zap, Wallet, ClipboardCheck, Video, Code, FileText, Bell, Briefcase
} from "lucide-react";
import notify from "@/utils/notify";
import { getProfile, getDashboard, syncUserToStorage, claimXpReward } from "@/services/userAPI";
import NotificationModal from "@/components/NotificationModal";
import { getRewardsData, calculateProgress } from "@/utils/rewardsUtils";
import { useWallet } from "../features/wallet/hooks/useWallet";
import { io } from "socket.io-client";
import API from "@/utils/api";
import WalletBadge from "../features/wallet/components/WalletBadge";
import Footer from "@/components/Footer";
import '@/styles/AppLayout.css';

const NAV_ITEMS = [
  { to: "/user-dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/interview", icon: Video, label: "Mock Interview" },
  { to: "/100-days-challenge", icon: Trophy, label: "Coding Hub", isNew: true },
  { to: "/objective-exam", icon: ClipboardCheck, label: "Objective Exam" },
  { to: "/ats-score", icon: FileText, label: "ATS Score", isNew: true },
  { to: "/btech-notes", icon: BookOpen, label: "Btech Notes", isFree: true },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/wallet", icon: Wallet, label: "Wallet" },
  { to: "/rewards", icon: Zap, label: "My Rewards" },
  { to: "/achievements", icon: Award, label: "Redeem XP" },
  { to: "/profile", icon: User, label: "Profile" },
];

const initialNotifications = [
  {
    id: 'daily',
    title: 'Daily Reward',
    message: 'You have received your daily XP points!',
    time: 'Today',
    timestamp: Date.now() - 3600000,
    icon: '🎁',
    read: false
  },
  {
    id: 'referral',
    title: 'Referral Bonus',
    message: `You have received XP points from your successful referral(s)!`,
    time: 'Recently',
    timestamp: Date.now() - 86400000,
    icon: '👥',
    read: false
  }
];

function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const safeGetUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      localStorage.removeItem("user");
      return {};
    }
  };
  const [user, setUser] = useState(safeGetUser());
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(document.documentElement.dataset.theme === "dark");
  const { balance } = useWallet();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [notifs, setNotifs] = useState([]);

  const unreadCount = notifs.filter(n => !n.read).length;

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await API.get('/users/notifications');
        setNotifs([...(res.data || [])].reverse());
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    if (user && user._id) {
      fetchNotifs();
    }
  }, [user]);

  useEffect(() => {
    const handleNewNotif = (e) => {
      if (e.detail) {
        setNotifs(prev => [e.detail, ...prev]);
      }
    };
    window.addEventListener('newNotification', handleNewNotif);
    return () => window.removeEventListener('newNotification', handleNewNotif);
  }, []);

  const checkAndClaimRewards = async (currentUser, currentDash) => {
    if (!currentUser || !currentDash) return;
    const claimedRewards = currentUser.xpRewardsClaimed || [];
    let updated = false;
    let newXp = currentUser.points || 0;
    let newLevel = currentUser.level || 1;
    let newClaims = [];

    for (const reward of getRewardsData(currentUser)) {
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
        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (u && localUser && typeof u.points === 'number' && typeof localUser.points === 'number') {
          if (u.points > localUser.points) {
            // XP increased - backend will handle real notification via socket
          }
        }

        setUser(u);
        syncUserToStorage(u);
        window.dispatchEvent(new Event("user-updated"));
        window.dispatchEvent(new Event("walletUpdated"));

        if (dash) {
          checkAndClaimRewards(u, dash);
        }
      })
      .catch(() => { });
  };

  useEffect(() => {
    refreshUser();
    const handler = () => setUser(safeGetUser());
    window.addEventListener("user-updated", handler);
    return () => window.removeEventListener("user-updated", handler);
  }, [location.pathname]);

  // Global WebSocket for Real-Time Notifications
  useEffect(() => {
    if (!user?._id) return;
    let SOCKET_URL = "";
    try {
      const url = new URL(import.meta.env.VITE_API_URL || "", window.location.origin);
      SOCKET_URL = url.origin;
    } catch (e) {
      SOCKET_URL = window.location.origin;
    }
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });

    const handleConnect = () => {
      console.log("Global Socket Connected! Emitting join_room for", user._id);
      socket.emit('join_room', user._id);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on('connect', handleConnect);
    }

    socket.on('global_notification', (data) => {
      window.dispatchEvent(new CustomEvent('newNotification', { detail: data }));
      refreshUser(); // Background sync for XP/Coins
    });

    return () => socket.disconnect();
  }, [user?._id]);



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
    localStorage.removeItem("user_notifications");
    notify.success("Signed out successfully");
    window.location.href = "/";
  };

  const avatar = user.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "U")}&background=4f46e5&color=fff`;

  const hideSidebar = location.pathname.startsWith("/company-prep/") && location.pathname !== "/company-prep";

  return (
    <>
      <div className={`app-layout ${collapsed ? "collapsed" : ""} ${hideSidebar ? "hide-sidebar" : ""}`}>
        {!hideSidebar && (
        <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
          <div className="sidebar-top">
            <Link to="/interview" className="sidebar-brand">
              {collapsed && !mobileOpen ? (
                <img src="/logo.png" alt="PreepX" style={{ height: '32px', objectFit: 'contain', marginLeft: '4px' }} />
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

          <nav className="sidebar-nav">
            {NAV_ITEMS.map(({ to, icon: Icon, label, isFree, isNew }) => {
              const isActive = location.pathname === to || (to !== "/interview" && location.pathname.startsWith(to));
              return (
                <Link key={to} to={to} className={`sidebar-link ${isActive ? "active" : ""}`} onClick={() => setMobileOpen(false)} title={label}>
                  <Icon size={20} style={{ flexShrink: 0 }} />
                  {(!collapsed || mobileOpen) && (
                    <>
                      <span className="sidebar-link-label">{label}</span>
                      {isFree && <span className="nav-free-badge">Free</span>}
                      {isNew && <span className="nav-new-badge">New</span>}
                    </>
                  )}
                  {isActive && <span className="nav-indicator" />}
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-bottom" style={{ padding: collapsed ? "12px 8px" : "12px 16px" }}>
            <div className={`sidebar-bottom-actions ${collapsed ? "collapsed" : ""}`}>
              <Link to="/settings" className="sidebar-action-btn" data-tooltip="Settings" title="Settings" onClick={() => setMobileOpen(false)}>
                <Settings size={20} />
              </Link>

              <button className="sidebar-action-btn" onClick={toggleTheme} data-tooltip={isDark ? "Light Mode" : "Dark Mode"} title={isDark ? "Light Mode" : "Dark Mode"}>
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button className="sidebar-action-btn danger" onClick={handleLogout} data-tooltip="Sign Out" title="Sign Out">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </aside>
        )}

        {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

        <div className="app-content">
          {!location.pathname.includes("/pdf") && (
            <header className="topbar">
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

              <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  className="topbar-apply-jobs-btn"
                  onClick={() => navigate("/apply-jobs")}
                >
                  <Briefcase size={15} />
                  <span>Apply Jobs</span>
                </button>
              </div>

              <div className="topbar-center">
                <WalletBadge />
              </div>

              <div className="topbar-right">
                <button
                  type="button"
                  aria-label="Notifications"
                  className="topbar-notif-btn"
                  onClick={() => setShowNotifications(true)}
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {user.streak > 0 && (
                  <span className="streak-badge">
                    <span className="badge-icon">🔥</span>
                    <span>{user.streak} day streak</span>
                  </span>
                )}

                <span className="points-badge">
                  <img src="/logo.png" alt="XP" className="xp-logo-icon" />
                  <span>{user.points || 0} XP</span>
                </span>

                <Link to="/profile" className="topbar-profile-link" title="My Profile">
                  <img src={avatar} alt="Profile" className="topbar-avatar-img" />
                </Link>
              </div>
            </header>
          )}
          <div className="page-content">{children}</div>
        </div>
      </div>
      {!location.pathname.includes("/pdf") && location.pathname !== "/" && <Footer />}

      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifs={notifs}
        setNotifs={setNotifs}
      />
<<<<<<< HEAD
=======

      {/* Coming Soon Modal - Commented out (redirected to /apply-jobs) */}
      {/* {showComingSoon && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--surface, #1e1e2d)',
            padding: '40px',
            borderRadius: '16px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%',
            border: '1px solid var(--border, #2d2d3f)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', color: 'var(--primary, #6366f1)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text, #fff)', margin: '0 0 12px 0' }}>
              Coming Soon
            </h2>
            <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '15px', lineHeight: '1.6', margin: '0 0 32px 0' }}>
              This feature is under development and will be available shortly. Stay tuned!
            </p>
            <button
              onClick={() => setShowComingSoon(false)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: 'var(--primary, #6366f1)',
                color: '#fff',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#4f46e5'}
              onMouseOut={(e) => e.target.style.background = 'var(--primary, #6366f1)'}
            >
              Got it
            </button>
          </div>
        </div>
      )} */}
>>>>>>> main
    </>

  );
}

export default AppLayout;



