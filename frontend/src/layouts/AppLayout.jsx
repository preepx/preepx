import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BarChart3, Trophy, Award, Settings, User,
  LogOut, X, BookOpen, Moon, Sun, Zap, Wallet, ClipboardCheck, Video, FileText, Bell, Briefcase, Crown,
  Code, ChevronDown, Search, Leaf
} from "lucide-react";
import notify from "@/utils/notify";
import { getProfile, syncUserToStorage } from "@/services/userAPI";
import NotificationModal from "@/components/NotificationModal";
import { useWallet, WalletBadge } from "@/features/wallet";
import { useSubscription } from "@/features/subscription";
import { useTheme } from "@/hooks/useTheme";
import { getStoredUser, clearAuth } from "@/utils/authUtils";
import { io } from "socket.io-client";
import API from "@/utils/api";
// Footer import removed
import "@/styles/AppLayout.css";

const SvgIcon = ({ src, size = 19, style = {} }) => {
  return <img src={src} alt="" style={{ width: size, height: size, objectFit: 'contain', ...style }} />;
};

const DashboardIcon = (props) => <SvgIcon src="/sidebar/dsboard.svg" {...props} />;
const MockInterviewIcon = (props) => <SvgIcon src="/sidebar/mockintervieww.svg" {...props} />;
const CodingHubIcon = (props) => <SvgIcon src="/sidebar/codinghub.svg" {...props} />;
const ObjectiveExamIcon = (props) => <SvgIcon src="/sidebar/objectiveexamicon.svg" {...props} />;
const AtsScoreIcon = (props) => <SvgIcon src="/sidebar/atsscore.svg" {...props} />;
const NotesIcon = (props) => <SvgIcon src="/sidebar/notes.svg" {...props} />;
const LeaderboardIcon = (props) => <SvgIcon src="/sidebar/leaderboard.svg" {...props} />;
const AnalyticsIcon = (props) => <SvgIcon src="/sidebar/anyltics.svg" {...props} />;
const CustomWalletIcon = (props) => <SvgIcon src="/sidebar/wallet.svg" {...props} />;
const ProfileIcon = (props) => <SvgIcon src="/sidebar/profile.svg" {...props} />;
const RewardIcon = (props) => <SvgIcon src="/sidebar/redeemxp.svg" {...props} />;
const MyRewardsIcon = (props) => <SvgIcon src="/sidebar/myrewards.svg" {...props} />;
const CustomSettingsIcon = (props) => <SvgIcon src="/sidebar/setting.svg" {...props} />;
const CustomLogoutIcon = (props) => <SvgIcon src="/sidebar/logout.svg" {...props} />;

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { to: "/user-dashboard", icon: DashboardIcon, label: "Dashboard" },
    ],
  },
  {
    label: "PRACTICE",
    items: [
      { to: "/interview", icon: MockInterviewIcon, label: "Mock Interview" },
      { to: "/100-days-challenge", icon: CodingHubIcon, label: "Coding Hub", isNew: true },
      { to: "/objective-exam", icon: ObjectiveExamIcon, label: "Objective Exam" },
      { to: "/ats-score", icon: AtsScoreIcon, label: "ATS Score" },
    ],
  },
  {
    label: "LEARNING",
    items: [
      { to: "/btech-notes", icon: NotesIcon, label: "Notes", isFree: true },
    ],
  },
  {
    label: "COMMUNITY",
    items: [
      { to: "/leaderboard", icon: LeaderboardIcon, label: "Leaderboard" },
      { to: "/analytics", icon: AnalyticsIcon, label: "Analytics" },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { to: "/wallet", icon: CustomWalletIcon, label: "Wallet" },
      { to: "/rewards", icon: RewardIcon, label: "Reward" },
      { to: "/achievements", icon: MyRewardsIcon, label: "My Rewards" },
      { to: "/profile", icon: ProfileIcon, label: "Profile" },
    ],
  },
];

function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { balance } = useWallet();
  const { subscribed } = useSubscription();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifs, setNotifs] = useState([]);

  const unreadCount = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    let isMounted = true;
    const fetchNotifs = async () => {
      try {
        const res = await API.get("/users/notifications");
        if (isMounted && res.data) {
          setNotifs([...res.data].reverse());
        }
      } catch (err) {
        // Silently handle notification network failure
      }
    };
    if (user && user._id) {
      fetchNotifs();
    }
    return () => {
      isMounted = false;
    };
  }, [user?._id]);

  useEffect(() => {
    const handleNewNotif = (e) => {
      if (e.detail) {
        setNotifs((prev) => [e.detail, ...prev]);
      }
    };
    window.addEventListener("newNotification", handleNewNotif);
    return () => window.removeEventListener("newNotification", handleNewNotif);
  }, []);

  const refreshUser = useCallback(() => {
    getProfile()
      .then((u) => {
        if (u) {
          setUser(u);
          syncUserToStorage(u);
          window.dispatchEvent(new Event("walletUpdated"));
        }
      })
      .catch(() => { });
  }, []);

  // Initial user fetch and update listener
  useEffect(() => {
    refreshUser();
    const handler = () => setUser(getStoredUser());
    window.addEventListener("user-updated", handler);
    return () => window.removeEventListener("user-updated", handler);
  }, [refreshUser]);

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
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnectionAttempts: 3,
    });

    const handleConnect = () => {
      socket.emit("join_room", user._id);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }

    socket.on("global_notification", (data) => {
      window.dispatchEvent(new CustomEvent("newNotification", { detail: data }));
      refreshUser();
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("global_notification");
      socket.disconnect();
    };
  }, [user?._id, refreshUser]);

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
    clearAuth();
    notify.success("Signed out successfully");
    window.location.href = "/";
  };

  const avatar =
    user?.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "U")}&background=4f46e5&color=fff`;

  const hideSidebar = location.pathname.startsWith("/company-prep/") && location.pathname !== "/company-prep";

  return (
    <>
      <div className={`app-layout ${collapsed ? "collapsed" : ""} ${hideSidebar ? "hide-sidebar" : ""}`}>
        {!location.pathname.includes("/pdf") && !hideSidebar && (
          <header className="topbar new-topbar">
            <div className="topbar-left-section">
              {!collapsed || mobileOpen ? (
                <Link to="/interview" className="sidebar-brand">
                  <img
                    src="/preepx_logo.png"
                    alt="PreepX"
                    className="brand-logo-img"
                    style={{ height: "100px", objectFit: "contain", margin: "-28px 0 -28px 10px" }}
                  />
                </Link>
              ) : null}
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

              <button
                type="button"
                className="topbar-apply-jobs-btn"
                onClick={() => navigate("/apply-jobs")}
              >
                <Briefcase size={15} />
                <span>Apply Jobs</span>
              </button>
            </div>

            <div className="topbar-right-section">
              <button
                type="button"
                className="tb-icon-btn theme-toggle-btn"
                onClick={toggleTheme}
                title={isDark ? "Light Mode" : "Dark Mode"}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                type="button"
                className="tb-icon-btn"
                onClick={() => setShowNotifications(true)}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="tb-notif-dot">
                    {unreadCount}
                  </span>
                )}
              </button>

              <div className="tb-divider"></div>

              <Link to="/wallet" className="tb-wallet-badge">
                <img src="/sidebar/wallet.svg" alt="Wallet" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                <span>₹ {balance || 0}</span>
              </Link>

              <div className="tb-divider"></div>

              <div className="tb-streak-badge">
                <Leaf size={16} />
                <span>{user?.streak || 0} day streak</span>
              </div>

              <div className="tb-divider"></div>

              <div className="tb-xp-badge">
                <BarChart3 size={16} />
                <span>{user?.points || 0} XP</span>
              </div>

              <div className="tb-profile">
                <img src={avatar} alt="Profile" className="tb-avatar" />
              </div>
            </div>
          </header>
        )}

        <div className="app-main-body">
          {!hideSidebar && (
            <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
              {mobileOpen && (
                <div className="sidebar-top mobile-only">
                  <Link to="/interview" className="sidebar-brand">
                    <img
                      src="/preepx_logo.png"
                      alt="PreepX"
                      className="brand-logo-img"
                      style={{ height: "100px", objectFit: "contain", margin: "-28px 0 -28px 10px" }}
                    />
                  </Link>
                  <button
                    type="button"
                    className="sidebar-close-btn"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close Sidebar"
                  >
                    <X size={19} />
                  </button>
                </div>
              )}

              <nav className="sidebar-nav">
                {NAV_SECTIONS.map(({ label: sectionLabel, items }) => (
                  <div key={sectionLabel || "top"} className="sidebar-section">
                    {sectionLabel && (!collapsed || mobileOpen) && (
                      <span className="sidebar-section-label">{sectionLabel}</span>
                    )}
                    {items.map(({ to, icon: Icon, label, isFree, isNew }) => {
                      const isActive = location.pathname === to || (to !== "/interview" && location.pathname.startsWith(to));
                      return (
                        <Link
                          key={to}
                          to={to}
                          className={`sidebar-link ${isActive ? "active" : ""}`}
                          onClick={() => setMobileOpen(false)}
                          title={label}
                        >
                          <Icon size={20} style={{ flexShrink: 0 }} />
                          {(!collapsed || mobileOpen) && (
                            <>
                              <span className="sidebar-link-label">{label}</span>
                              {isFree && <span className="nav-free-badge">Free</span>}
                              {isNew && <span className="nav-new-badge">New</span>}
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
                    <Link
                      to="/settings"
                      className="sidebar-bottom-btn"
                      onClick={() => setMobileOpen(false)}
                      title="Settings"
                    >
                      <CustomSettingsIcon size={20} />
                      <span>Settings</span>
                    </Link>
                    <button
                      type="button"
                      className="sidebar-bottom-btn logout-btn"
                      onClick={handleLogout}
                      title="Sign Out"
                    >
                      <CustomLogoutIcon size={20} />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="sidebar-bottom-collapsed">
                    <Link
                      to="/settings"
                      className="sidebar-action-btn"
                      data-tooltip="Settings"
                      onClick={() => setMobileOpen(false)}
                    >
                      <CustomSettingsIcon size={20} />
                    </Link>
                    <button
                      type="button"
                      className="sidebar-action-btn danger"
                      onClick={handleLogout}
                      data-tooltip="Sign Out"
                    >
                      <CustomLogoutIcon size={20} />
                    </button>
                  </div>
                )}
              </div>
            </aside>
          )}

          {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

          <div className="app-content">
            <div className="page-content">{children}</div>
          </div>
        </div>
      </div>
      {/* Footer removed per user request to only show on landing page */}
      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifs={notifs}
        setNotifs={setNotifs}
      />
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
    </>

  );
}

export default AppLayout;
