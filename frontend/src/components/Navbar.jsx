import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import notify from "@/utils/notify";
import { Moon, Sun, Crown, Menu, X } from "lucide-react";
import { useSubscription } from "@/features/subscription";

function Navbar({ landingRole, setLandingRole }) {
  const [showMenu, setShowMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  const { subscribed } = useSubscription();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

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
    setMobileMenuOpen(false);
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
    setMobileMenuOpen(false);
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

  // Determine if it's the landing page for transparent absolute layout
  const isLanding = location.pathname === "/";

  const navClasses = isLanding
    ? "absolute left-0 w-full z-50 bg-transparent"
    : "sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm";

  const landingNavStyle = isLanding
    ? { top: '0' }
    : {};

  return (
    <nav className={navClasses} style={landingNavStyle}>
      <div className="max-w-[1398px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-[50px] md:h-[70px]" style={{ gap: '10px' }}>
          {/* Logo */}
          <Link to={user ? "/user-dashboard" : "/"} className="flex-shrink-0 flex items-center">
            <img src="/landing/image%201.svg" alt="PreepX" className="h-[22px] sm:h-[45px] w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center gap-6">
            {user
              ? navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-semibold transition-colors ${isActive(link.to) ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  {link.label}
                </Link>
              ))
              : landingNavLinks.map((link) => (
                <a
                  key={link.targetId}
                  href={`#${link.targetId}`}
                  onClick={(e) => handleLandingNavClick(e, link.targetId)}
                  className="text-base font-semibold text-[#000000] hover:opacity-80 transition-colors"
                >
                  {link.label}
                </a>
              ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0 md:-translate-x-8">
            <button onClick={toggleTheme} className="hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-full transition-colors">
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-full hover:shadow-md transition-shadow bg-white"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <div className="relative inline-flex">
                    <img
                      src={user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=4f46e5&color=fff`}
                      alt="Profile"
                      className={`w-8 h-8 rounded-full object-cover ${subscribed ? 'border-2 border-amber-500 p-[1px]' : ''}`}
                    />
                    {subscribed && (
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full w-4 h-4 flex items-center justify-center border-2 border-white shadow-sm">
                        <Crown size={9} color="#fff" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user.fullName?.split(" ")[0]}</span>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 flex items-center gap-3">
                      <img
                        src={user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=4f46e5&color=fff`}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    {user.points > 0 && (
                      <div className="px-4 py-2 text-sm font-medium text-amber-600 flex items-center gap-1">
                        <img src="/logo.png" alt="XP" className="w-5 h-5 object-contain" /> {user.points} XP
                      </div>
                    )}
                    <hr className="my-1 border-slate-100" />
                    <Link to={user.role === 'recruiter' ? "/recruiter/company" : "/profile"} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      {user.role === 'recruiter' ? "Company Profile" : "View Profile"}
                    </Link>
                    <Link to={user.role === 'recruiter' ? "/recruiter-dashboard" : "/user-dashboard"} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      Dashboard
                    </Link>
                    <button type="button" onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to={landingRole === 'recruiter' ? "/auth/recruiter" : "/auth"} className="text-sm font-medium text-[#000000] hover:opacity-80 transition-opacity">
                  Sign In
                </Link>
                <Link
                  to={landingRole === 'recruiter' ? "/auth/recruiter" : "/auth"}
                  className="text-white font-medium flex items-center justify-center transition-opacity hover:opacity-90"
                  style={{
                    background: 'linear-gradient(90deg, #3D5EFF 0%, #6017C7 100%)',
                    width: '110px',
                    height: '36px',
                    gap: '8px',
                    borderRadius: '8px',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: '#1e293b',
                    padding: '4px',
                    boxSizing: 'border-box',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  {landingRole === 'recruiter' ? 'Start Hiring' : 'Get Started'}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Actions */}
          <div className="md:hidden flex items-center gap-3" style={{ marginRight: '8px' }}>
            <button onClick={toggleTheme} className="hidden text-slate-600 hover:text-slate-900 p-1.5 rounded-full transition-colors">
              {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            {user ? (
              <button onClick={handleLogout} className="text-xs font-medium text-red-600 px-2 py-1">Sign Out</button>
            ) : (
              <>
                <Link to="/auth" className="text-xs font-medium text-[#000000] hover:opacity-80 transition-opacity px-1">Sign In</Link>
                <Link
                  to="/auth"
                  className="text-white font-medium flex items-center justify-center transition-opacity hover:opacity-90"
                  style={{
                    background: 'linear-gradient(90deg, #3D5EFF 0%, #6017C7 100%)',
                    height: '28px',
                    borderRadius: '7px',
                    border: '1px solid #1e293b',
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

    </nav>
  );
}

export default Navbar;
