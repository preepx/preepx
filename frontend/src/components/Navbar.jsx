import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "./Navbar.css";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const navLinks = user
    ? [
      { to: "/interview", label: "Dashboard" },
      { to: "/profile", label: "Profile" },
    ]
    : [];

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
    toast.success("Logged out successfully!");
    setShowMenu(false);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={user ? "/interview" : "/"} className="navbar-brand">
          <img src="/headername1.png" alt="PrepX" className="brand-logo-img" style={{ height: "40px", transform: "scale(2.5)", transformOrigin: "left center", objectFit: "contain", marginLeft: "10px" }} />
        </Link>

        <div className="navbar-center">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${isActive(link.to) ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-right">
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
                  className="profile-avatar"
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
                      <span>⭐ {user.points} points</span>
                    </div>
                  )}
                  <div className="dropdown-divider" />
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowMenu(false)}>
                    View Profile
                  </Link>
                  <Link to="/interview" className="dropdown-item" onClick={() => setShowMenu(false)}>
                    My Interviews
                  </Link>
                  <button type="button" className="dropdown-item danger" onClick={handleLogout}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/auth" className="btn-ghost">Sign In</Link>
              <Link to="/auth" className="btn-primary-sm">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
