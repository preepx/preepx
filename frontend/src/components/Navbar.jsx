import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import notify from "@/utils/notify";
import { Moon, Sun } from "lucide-react";
import '@/styles/Navbar.css';

function Navbar({ landingRole, setLandingRole }) {
  const [showMenu, setShowMenu] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const safeGetUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  };

  const [user, setUser] = useState(safeGetUser());
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const handleUserUpdate = () => {
      setUser(safeGetUser());
    };
    window.addEventListener("user-updated", handleUserUpdate);
    return () => window.removeEventListener("user-updated", handleUserUpdate);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const navLinks = [
    { to: "/user-dashboard", label: "Dashboard" },
    { to: "/practice", label: "Practice" },
    { to: "/mock-test", label: "Mock Tests" },
    { to: "/leaderboard", label: "Leaderboard" },
  ];

  const landingNavLinks = [
    { targetId: "how-it-works", label: "How It Works" },
    { targetId: "journeys", label: "Why PreepX?" },
    { targetId: "features", label: "Features" },
    { targetId: "pricing", label: "Pricing" },
    { targetId: "faq", label: "FAQ" },
  ];

  const scrollToSectionWithOffset = (targetId) => {
    const el = document.getElementById(targetId);
    if (el) {
      const navOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    }
  };

  const handleLandingNavClick = (e, targetId) => {
    e.preventDefault();
    if (location.pathname === "/") {
      scrollToSectionWithOffset(targetId);
    } else {
      navigate(`/#${targetId}`);
    }
  };

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        scrollToSectionWithOffset(id);
      }, 150);
    }
  }, [location]);

  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_notifications");
    notify.success("Logged out successfully!");
    setShowMenu(false);
    window.location.href = "/";
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={user ? "/user-dashboard" : "/"} className="navbar-brand">
          <img src="/preepx_logo.png" alt="PreepX" className="brand-logo-img" />
        </Link>

        <div className="navbar-center">
          {user
            ? navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link ${isActive(link.to) ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              ))
            : landingNavLinks.map((link) => (
                <a
                  key={link.targetId}
                  href={`#${link.targetId}`}
                  onClick={(e) => handleLandingNavClick(e, link.targetId)}
                  className="nav-link"
                >
                  {link.label}
                </a>
              ))}
        </div>

        <div className="navbar-right">
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {user ? (
            <div className="profile-wrapper" ref={profileRef}>
              <button
                type="button"
                className="profile-btn"
                onClick={() => setShowMenu(!showMenu)}
                aria-expanded={showMenu}
                aria-label="Open profile menu"
              >
                <img
                  src={user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=4f46e5&color=fff`}
                  alt="Profile"
                  className="nav-profile-avatar"
                />
                <span className="profile-name">{user.fullName?.split(" ")[0]}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="profile-chevron">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {showMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <img
                      src={user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=4f46e5&color=fff`}
                      alt=""
                      className="dropdown-avatar"
                    />
                    <div>
                      <p className="dropdown-name">{user.fullName}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                  </div>
                  {user.points > 0 && (
                    <div className="dropdown-points">
                      <span style={{ display: 'flex', alignItems: 'center' }}><img src="/logo.png" alt="XP" style={{ width: '32px', height: '32px', marginRight: '-6px', marginLeft: '-6px', marginTop: '-8px', marginBottom: '-8px', objectFit: 'contain' }} />{user.points}XP</span>
                    </div>
                  )}
                  <div className="dropdown-divider" />
                  <Link to={user.role === 'recruiter' ? "/recruiter/company" : "/profile"} className="dropdown-item" onClick={() => setShowMenu(false)}>
                    {user.role === 'recruiter' ? "Company Profile" : "View Profile"}
                  </Link>
                  <Link to={user.role === 'recruiter' ? "/recruiter-dashboard" : "/user-dashboard"} className="dropdown-item" onClick={() => setShowMenu(false)}>
                    Dashboard
                  </Link>
                  <button type="button" className="dropdown-item danger" onClick={handleLogout}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons" style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <Link to={landingRole === 'recruiter' ? "/auth/recruiter" : "/auth"} className="btn-ghost">Sign In</Link>
              <Link to={landingRole === 'recruiter' ? "/auth/recruiter" : "/auth"} className="btn-primary-sm">
                {landingRole === 'recruiter' ? 'Start Hiring' : 'Get Started'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
