import React from "react";
import Webcam from "react-webcam";
import {
  Bookmark, Sun, Moon, Lightbulb, AlertTriangle, HelpCircle,
  ChevronDown, Play, RotateCcw
} from "lucide-react";
import { formatTime } from "./codingConstants";

export default function CodingNavbar({
  title,
  isDark,
  toggleTheme,
  onOpenInfo,
  onOpenReport,
  onOpenHelp,
  selectedLang,
  currentLanguage,
  setCurrentLanguage,
  languages = [],
  showLangDropdown,
  setShowLangDropdown,
  langDropdownRef,
  timeLeft,
  onResetCode,
  onExit,
  faceWarning,
  camRef
}) {
  return (
    <nav className="ce-navbar">
      <div className="ce-nav-left">
        <div className="ce-brand">
          <img src="/preepx_logo.png" alt="PreepX Logo" style={{ height: "48px", objectFit: "contain" }} />
        </div>
        <div className="ce-nav-divider" />
        <Bookmark size={16} className="ce-icon-muted" />
        <div className="ce-nav-title">{title}</div>
      </div>

      <div className="ce-nav-right">
        <button type="button" className="ce-feature-btn">Request a Feature</button>

        <div className="ce-nav-icons">
          <button
            type="button"
            onClick={toggleTheme}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center" }}
            title="Toggle Theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            type="button"
            onClick={onOpenInfo}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center" }}
            title="Information"
          >
            <Lightbulb size={16} />
          </button>
          <button
            type="button"
            onClick={onOpenReport}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center" }}
            title="Report an Issue"
          >
            <AlertTriangle size={16} />
          </button>
          <button
            type="button"
            onClick={onOpenHelp}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center" }}
            title="How to Work"
          >
            <HelpCircle size={16} />
          </button>
        </div>

        {/* Language Dropdown in Navbar */}
        <div className="ce-lang-dropdown" ref={langDropdownRef}>
          <button
            type="button"
            className="ce-lang-btn"
            onClick={() => setShowLangDropdown((p) => !p)}
          >
            {selectedLang?.label}
            <ChevronDown size={14} />
          </button>
          {showLangDropdown && (
            <div className="ce-lang-menu">
              {languages.map((lang) => (
                <button
                  type="button"
                  key={lang.value}
                  className={`ce-lang-option ${currentLanguage === lang.value ? "active" : ""}`}
                  onClick={() => {
                    setCurrentLanguage(lang.value);
                    setShowLangDropdown(false);
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`ce-timer ${timeLeft < 300 ? "ce-timer-danger" : ""}`}>
          <Play size={14} />
          {formatTime(timeLeft)}
        </div>

        <button
          type="button"
          className="ce-nav-icon-btn"
          onClick={onResetCode}
          title="Reset Code"
        >
          <RotateCcw size={16} />
        </button>

        <button type="button" className="ce-exit-btn" onClick={onExit}>
          Exit
        </button>

        {faceWarning && (
          <div className="ce-cam-warning" title={faceWarning}>
            ⚠️ Warning
          </div>
        )}
        <div className="ce-cam-wrap" style={{ borderColor: faceWarning ? "#ef4444" : "#6366f1" }}>
          <Webcam ref={camRef} audio={false} mirrored className="ce-cam" screenshotFormat="image/jpeg" />
        </div>
      </div>
    </nav>
  );
}
