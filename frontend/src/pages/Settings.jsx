import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  SlidersHorizontal, User, Mail, Shield, ShieldCheck, Bell,
  Timer, Save, Briefcase, Bot, Eye, EyeOff, Sparkles,
  MapPin, Phone, CheckCircle2, RotateCcw, Loader2,
  ExternalLink, Globe, Lock, AlertCircle, Headphones, Building2
} from "lucide-react";
import { updateSettings, updateProfileDetails, getProfile } from "@/services/userAPI";
import { getStoredUser, setStoredUser } from "@/utils/authUtils";
import notify from "@/utils/notify";

import '@/features/apply-jobs/styles/JobsAssessments.css';
import '@/styles/Settings.css';

export default function Settings() {
  const [stored, setStored] = useState(() => getStoredUser() || {});
  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Profile fields
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    headline: "",
    phone: "",
    location: "",
    currentCompany: "",
  });

  // Settings preferences
  const [settings, setSettings] = useState({
    // Interview
    timerEnabled: true,
    aiVoiceFeedback: true,
    realtimeHints: true,
    autoRecordSession: false,
    syntaxAssist: true,

    // Jobs & Alerts
    jobAlerts: true,
    remoteOnly: false,
    hybridAllowed: true,
    onsiteAllowed: true,
    salaryExpectation: "flexible",
    recruiterDirectOutreach: true,
    immediateJoiner: false,

    // Notifications
    emailNotifications: true,
    applicationUpdates: true,
    assessmentReminders: true,
    weeklyDigest: false,
    notificationFrequency: "instant",

    // Privacy & Security
    profileVisibility: true,
    hideCurrentEmployer: false,
  });

  useEffect(() => {
    // Fetch latest profile & settings
    getProfile()
      .then((data) => {
        if (data) {
          setStored(data);
          setStoredUser(data);
          setProfileForm({
            fullName: data.fullName || "",
            headline: data.headline || data.preferredRole || "",
            phone: data.phone || data.mobile || "",
            location: data.city || data.location || data.address || "",
            currentCompany: data.currentCompany || "",
          });

          if (data.settings) {
            setSettings((prev) => ({
              ...prev,
              ...data.settings,
            }));
          }
        }
      })
      .catch(() => {
        // Fallback to local stored user
        const local = getStoredUser() || {};
        setStored(local);
        setProfileForm({
          fullName: local.fullName || "",
          headline: local.headline || local.preferredRole || "",
          phone: local.phone || local.mobile || "",
          location: local.city || local.location || local.address || "",
          currentCompany: local.currentCompany || "",
        });
        if (local.settings) {
          setSettings((prev) => ({ ...prev, ...local.settings }));
        }
      })
      .finally(() => setProfileLoading(false));
  }, []);

  const toggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Save preferences
      const updatedUser = await updateSettings(settings);

      // 2. Save profile details if on account tab
      let finalUser = updatedUser;
      if (profileForm.fullName && activeTab === "account") {
        try {
          finalUser = await updateProfileDetails({
            fullName: profileForm.fullName,
            preferredRole: profileForm.headline,
            mobile: profileForm.phone,
            location: profileForm.location,
            currentCompany: profileForm.currentCompany,
          });
        } catch (profileErr) {
          const detail =
            profileErr.response?.data?.errors?.preferredRole ||
            profileErr.response?.data?.message ||
            "Profile validation issue.";
          notify.error(`Profile: ${detail}`);
        }
      }

      const merged = { ...stored, ...(finalUser || {}), settings };
      setStored(merged);
      setStoredUser(merged);
    } catch (err) {
      const errMsg =
        err.response?.data?.errors?.preferredRole ||
        err.response?.data?.message ||
        "Failed to save settings. Please try again.";
      notify.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      timerEnabled: true,
      aiVoiceFeedback: true,
      realtimeHints: true,
      autoRecordSession: false,
      syntaxAssist: true,
      jobAlerts: true,
      remoteOnly: false,
      hybridAllowed: true,
      onsiteAllowed: true,
      salaryExpectation: "flexible",
      recruiterDirectOutreach: true,
      immediateJoiner: false,
      emailNotifications: true,
      applicationUpdates: true,
      assessmentReminders: true,
      weeklyDigest: false,
      notificationFrequency: "instant",
      profileVisibility: true,
      hideCurrentEmployer: false,
    });
    notify.info("Reset to recommended defaults");
  };

  const avatar = stored.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(stored.fullName || stored.email || "User")}&background=4f46e5&color=fff&bold=true`;

  return (
    <div className="prem-settings-root">
      {/* ── HERO BANNER (matching Jobs layout family) ── */}
      <section className="jas-hero">
        <div className="jas-hero-left">
          <div className="jas-hero-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <SlidersHorizontal size={22} />
          </div>
          <div className="jas-hero-text">
            <h1>Settings & Preferences</h1>
            <p>Customize your profile discovery, job matching alerts, and AI practice parameters.</p>
          </div>
        </div>

        <div className="jas-hero-stats">
          <div className="jas-hstat-card" style={{ background: '#f0fdf4', borderColor: '#dcfce3' }}>
            <div className="jas-hstat-icon" style={{ background: '#dcfce3', color: '#166534' }}>
              <ShieldCheck size={22} />
            </div>
            <div className="jas-hstat-info">
              <span className="jas-hstat-val">{stored._id ? "Active" : "Guest"}</span>
              <span className="jas-hstat-lbl">Account Health</span>
            </div>
          </div>
          <div className="jas-hstat-card" style={{ background: '#eff6ff', borderColor: '#dbeafe' }}>
            <div className="jas-hstat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
              <Bell size={22} />
            </div>
            <div className="jas-hstat-info">
              <span className="jas-hstat-val">{settings.jobAlerts ? "Enabled" : "Paused"}</span>
              <span className="jas-hstat-lbl">Job Alerts</span>
            </div>
          </div>
          <div className="jas-hstat-card" style={{ background: '#fffbeb', borderColor: '#fef3c7' }}>
            <div className="jas-hstat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Eye size={22} />
            </div>
            <div className="jas-hstat-info">
              <span className="jas-hstat-val">{settings.profileVisibility ? "Public" : "Hidden"}</span>
              <span className="jas-hstat-lbl">Recruiter Discovery</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY TABS BAR ── */}
      <div className="jas-filters-bar">
        <div className="jas-tabs">
          {[
            { id: "account", label: "Account & Profile", icon: User },
            { id: "jobs", label: "Job Alerts & Matching", icon: Briefcase },
            { id: "interview", label: "Interview & AI Tools", icon: Bot },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "security", label: "Privacy & Security", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`jas-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN SETTINGS CONTENT ── */}
      <div className="prem-settings-grid">
        {/* LEFT COLUMN: ACTIVE SECTION CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* TAB 1: ACCOUNT & PROFILE */}
          {activeTab === "account" && (
            <div className="prem-card">
              <div className="prem-card-header">
                <div className="prem-card-title-wrap">
                  <div className="prem-card-icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                    <User size={18} />
                  </div>
                  <div>
                    <h2>Profile & Account Identity</h2>
                    <p>Basic information visible to employers and recruiters.</p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#4f46e5',
                    textDecoration: 'none'
                  }}
                >
                  Full Profile <ExternalLink size={13} />
                </Link>
              </div>

              {/* User Identity Banner */}
              <div className="prem-user-strip">
                <img src={avatar} alt="Avatar" className="prem-avatar" />
                <div className="prem-user-meta">
                  <div className="prem-user-name-row">
                    <h3 className="prem-user-name">{profileForm.fullName || stored.fullName || "Candidate"}</h3>
                    <span className="prem-badge-pill">
                      <CheckCircle2 size={11} /> Verified
                    </span>
                  </div>
                  <p className="prem-user-email">
                    <Mail size={13} /> {stored.email || "No email linked"}
                  </p>
                </div>
              </div>

              {/* Profile Inputs */}
              <div className="prem-form-grid">
                <div className="prem-field-group">
                  <label className="prem-label">Full Name</label>
                  <div className="prem-input-wrap">
                    <User size={16} color="#94a3b8" />
                    <input
                      className="prem-input"
                      placeholder="e.g. John Doe"
                      value={profileForm.fullName}
                      onChange={(e) => handleProfileChange("fullName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="prem-field-group">
                  <label className="prem-label">Preferred Role / Headline</label>
                  <div className="prem-input-wrap">
                    <Briefcase size={16} color="#94a3b8" />
                    <input
                      className="prem-input"
                      placeholder="e.g. Full Stack Developer"
                      value={profileForm.headline}
                      onChange={(e) => handleProfileChange("headline", e.target.value)}
                    />
                  </div>
                </div>

                <div className="prem-field-group">
                  <label className="prem-label">Contact Phone</label>
                  <div className="prem-input-wrap">
                    <Phone size={16} color="#94a3b8" />
                    <input
                      className="prem-input"
                      placeholder="+91 98765 43210"
                      value={profileForm.phone}
                      onChange={(e) => handleProfileChange("phone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="prem-field-group">
                  <label className="prem-label">Current Location / City</label>
                  <div className="prem-input-wrap">
                    <MapPin size={16} color="#94a3b8" />
                    <input
                      className="prem-input"
                      placeholder="e.g. Bengaluru, India"
                      value={profileForm.location}
                      onChange={(e) => handleProfileChange("location", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JOB ALERTS & MATCHING */}
          {activeTab === "jobs" && (
            <div className="prem-card">
              <div className="prem-card-header">
                <div className="prem-card-title-wrap">
                  <div className="prem-card-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <h2>Job Matching & Preferences</h2>
                    <p>Tell the platform what kinds of jobs to highlight for you.</p>
                  </div>
                </div>
              </div>

              {/* Work Mode Selection Chips */}
              <div className="prem-field-group">
                <label className="prem-label">Preferred Work Modes</label>
                <div className="prem-chips-wrap">
                  <button
                    type="button"
                    className={`prem-chip ${settings.remoteOnly ? "active" : ""}`}
                    onClick={() => toggle("remoteOnly")}
                  >
                    <Globe size={14} /> Remote Only
                  </button>
                  <button
                    type="button"
                    className={`prem-chip ${settings.hybridAllowed ? "active" : ""}`}
                    onClick={() => toggle("hybridAllowed")}
                  >
                    <Building2 size={14} /> Hybrid Work
                  </button>
                  <button
                    type="button"
                    className={`prem-chip ${settings.onsiteAllowed ? "active" : ""}`}
                    onClick={() => toggle("onsiteAllowed")}
                  >
                    <MapPin size={14} /> On-Site Office
                  </button>
                </div>
              </div>

              {/* Salary Expectation */}
              <div className="prem-field-group">
                <label className="prem-label">Minimum Expected Annual CTC</label>
                <div className="prem-input-wrap">
                  <select
                    className="prem-select"
                    value={settings.salaryExpectation}
                    onChange={(e) => setSettings({ ...settings, salaryExpectation: e.target.value })}
                  >
                    <option value="flexible">Flexible / Any Range</option>
                    <option value="3-6">₹3 LPA – ₹6 LPA (Entry Level)</option>
                    <option value="6-12">₹6 LPA – ₹12 LPA (Mid Level)</option>
                    <option value="12-20">₹12 LPA – ₹20 LPA (Senior)</option>
                    <option value="20+">₹20+ LPA (Lead / Executive)</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="prem-toggles-list">
                <div className="prem-toggle-row" onClick={() => toggle("jobAlerts")}>
                  <div className="prem-toggle-info">
                    <div className="prem-toggle-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                      <Bell size={16} />
                    </div>
                    <div className="prem-toggle-text">
                      <span className="prem-toggle-title">Instant Job Match Alerts</span>
                      <p className="prem-toggle-desc">Notify me whenever a new verified job matches my role and skillset.</p>
                    </div>
                  </div>
                  <div className={`prem-switch ${settings.jobAlerts ? "active" : ""}`}>
                    <div className="prem-switch-thumb" />
                  </div>
                </div>

                <div className="prem-toggle-row" onClick={() => toggle("recruiterDirectOutreach")}>
                  <div className="prem-toggle-info">
                    <div className="prem-toggle-icon" style={{ background: '#dcfce3', color: '#166534' }}>
                      <Sparkles size={16} />
                    </div>
                    <div className="prem-toggle-text">
                      <span className="prem-toggle-title">Direct Recruiter Outreach</span>
                      <p className="prem-toggle-desc">Allow verified HR recruiters to invite me for direct interviews without applying.</p>
                    </div>
                  </div>
                  <div className={`prem-switch ${settings.recruiterDirectOutreach ? "active" : ""}`}>
                    <div className="prem-switch-thumb" />
                  </div>
                </div>

                <div className="prem-toggle-row" onClick={() => toggle("immediateJoiner")}>
                  <div className="prem-toggle-info">
                    <div className="prem-toggle-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                      <Timer size={16} />
                    </div>
                    <div className="prem-toggle-text">
                      <span className="prem-toggle-title">Immediate Joiner Badge</span>
                      <p className="prem-toggle-desc">Signal to hiring teams that you can join within 15–30 days.</p>
                    </div>
                  </div>
                  <div className={`prem-switch ${settings.immediateJoiner ? "active" : ""}`}>
                    <div className="prem-switch-thumb" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTERVIEW & AI TOOLS */}
          {activeTab === "interview" && (
            <div className="prem-card">
              <div className="prem-card-header">
                <div className="prem-card-title-wrap">
                  <div className="prem-card-icon-box" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                    <Bot size={18} />
                  </div>
                  <div>
                    <h2>Interview Simulator & AI Settings</h2>
                    <p>Customize timers, audio assistance, and coding environment options.</p>
                  </div>
                </div>
              </div>

              <div className="prem-toggles-list">
                <div className="prem-toggle-row" onClick={() => toggle("timerEnabled")}>
                  <div className="prem-toggle-info">
                    <div className="prem-toggle-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                      <Timer size={16} />
                    </div>
                    <div className="prem-toggle-text">
                      <span className="prem-toggle-title">Question Countdown Timer</span>
                      <p className="prem-toggle-desc">Display a 2-minute countdown timer per question during mock & technical rounds.</p>
                    </div>
                  </div>
                  <div className={`prem-switch ${settings.timerEnabled ? "active" : ""}`}>
                    <div className="prem-switch-thumb" />
                  </div>
                </div>

                <div className="prem-toggle-row" onClick={() => toggle("aiVoiceFeedback")}>
                  <div className="prem-toggle-info">
                    <div className="prem-toggle-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                      <Headphones size={16} />
                    </div>
                    <div className="prem-toggle-text">
                      <span className="prem-toggle-title">AI Speech & Audio Questions</span>
                      <p className="prem-toggle-desc">AI interviewer reads out questions using natural speech synthesis.</p>
                    </div>
                  </div>
                  <div className={`prem-switch ${settings.aiVoiceFeedback ? "active" : ""}`}>
                    <div className="prem-switch-thumb" />
                  </div>
                </div>

                <div className="prem-toggle-row" onClick={() => toggle("realtimeHints")}>
                  <div className="prem-toggle-info">
                    <div className="prem-toggle-icon" style={{ background: '#dcfce3', color: '#166534' }}>
                      <Sparkles size={16} />
                    </div>
                    <div className="prem-toggle-text">
                      <span className="prem-toggle-title">STAR Framework Guidance Hints</span>
                      <p className="prem-toggle-desc">Show structure suggestions (Situation, Task, Action, Result) during practice.</p>
                    </div>
                  </div>
                  <div className={`prem-switch ${settings.realtimeHints ? "active" : ""}`}>
                    <div className="prem-switch-thumb" />
                  </div>
                </div>

                <div className="prem-toggle-row" onClick={() => toggle("syntaxAssist")}>
                  <div className="prem-toggle-info">
                    <div className="prem-toggle-icon" style={{ background: '#f5f3ff', color: '#6d28d9' }}>
                      <SlidersHorizontal size={16} />
                    </div>
                    <div className="prem-toggle-text">
                      <span className="prem-toggle-title">Monaco Editor Autocomplete</span>
                      <p className="prem-toggle-desc">Enable syntax highlight & auto-brackets in coding assessment challenges.</p>
                    </div>
                  </div>
                  <div className={`prem-switch ${settings.syntaxAssist ? "active" : ""}`}>
                    <div className="prem-switch-thumb" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="prem-card">
              <div className="prem-card-header">
                <div className="prem-card-title-wrap">
                  <div className="prem-card-icon-box" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                    <Bell size={18} />
                  </div>
                  <div>
                    <h2>Notification Preferences</h2>
                    <p>Control what emails and push notifications you receive.</p>
                  </div>
                </div>
              </div>

              <div className="prem-field-group">
                <label className="prem-label">Email Digest Frequency</label>
                <div className="prem-input-wrap">
                  <select
                    className="prem-select"
                    value={settings.notificationFrequency}
                    onChange={(e) => setSettings({ ...settings, notificationFrequency: e.target.value })}
                  >
                    <option value="instant">Instant (Real-time)</option>
                    <option value="daily">Daily Digest (Once per evening)</option>
                    <option value="weekly">Weekly Summary (Every Monday)</option>
                  </select>
                </div>
              </div>

              <div className="prem-toggles-list">
                <div className="prem-toggle-row" onClick={() => toggle("emailNotifications")}>
                  <div className="prem-toggle-info">
                    <div className="prem-toggle-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                      <Mail size={16} />
                    </div>
                    <div className="prem-toggle-text">
                      <span className="prem-toggle-title">Master Email Notifications</span>
                      <p className="prem-toggle-desc">Enable all essential email communication from Preepx.</p>
                    </div>
                  </div>
                  <div className={`prem-switch ${settings.emailNotifications ? "active" : ""}`}>
                    <div className="prem-switch-thumb" />
                  </div>
                </div>

                <div className="prem-toggle-row" onClick={() => toggle("applicationUpdates")}>
                  <div className="prem-toggle-info">
                    <div className="prem-toggle-icon" style={{ background: '#dcfce3', color: '#166534' }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="prem-toggle-text">
                      <span className="prem-toggle-title">Application Status Changes</span>
                      <p className="prem-toggle-desc">Get notified when recruiters shortlist your profile, send tests, or extend offers.</p>
                    </div>
                  </div>
                  <div className={`prem-switch ${settings.applicationUpdates ? "active" : ""}`}>
                    <div className="prem-switch-thumb" />
                  </div>
                </div>

                <div className="prem-toggle-row" onClick={() => toggle("assessmentReminders")}>
                  <div className="prem-toggle-info">
                    <div className="prem-toggle-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                      <Timer size={16} />
                    </div>
                    <div className="prem-toggle-text">
                      <span className="prem-toggle-title">Assessment Expiration Reminders</span>
                      <p className="prem-toggle-desc">Get reminded 24 hours prior to technical assessment expiration deadlines.</p>
                    </div>
                  </div>
                  <div className={`prem-switch ${settings.assessmentReminders ? "active" : ""}`}>
                    <div className="prem-switch-thumb" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRIVACY & SECURITY */}
          {activeTab === "security" && (
            <div className="prem-card">
              <div className="prem-card-header">
                <div className="prem-card-title-wrap">
                  <div className="prem-card-icon-box" style={{ background: '#fee2e2', color: '#dc2626' }}>
                    <Shield size={18} />
                  </div>
                  <div>
                    <h2>Privacy, Security & Visibility</h2>
                    <p>Keep your job search confidential and secure.</p>
                  </div>
                </div>
              </div>

              <div className="prem-toggles-list">
                <div className="prem-toggle-row" onClick={() => toggle("profileVisibility")}>
                  <div className="prem-toggle-info">
                    <div className="prem-toggle-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                      {settings.profileVisibility ? <Eye size={16} /> : <EyeOff size={16} />}
                    </div>
                    <div className="prem-toggle-text">
                      <span className="prem-toggle-title">Public Candidate Directory Visibility</span>
                      <p className="prem-toggle-desc">Make your resume & skillset searchable by verified companies hiring on Preepx.</p>
                    </div>
                  </div>
                  <div className={`prem-switch ${settings.profileVisibility ? "active" : ""}`}>
                    <div className="prem-switch-thumb" />
                  </div>
                </div>

                <div className="prem-toggle-row" onClick={() => toggle("hideCurrentEmployer")}>
                  <div className="prem-toggle-info">
                    <div className="prem-toggle-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                      <Lock size={16} />
                    </div>
                    <div className="prem-toggle-text">
                      <span className="prem-toggle-title">Hide from Current Employer</span>
                      <p className="prem-toggle-desc">Automatically prevent recruiters from your current company from viewing your activity.</p>
                    </div>
                  </div>
                  <div className={`prem-switch ${settings.hideCurrentEmployer ? "active" : ""}`}>
                    <div className="prem-switch-thumb" />
                  </div>
                </div>
              </div>

              {settings.hideCurrentEmployer && (
                <div className="prem-field-group" style={{ marginTop: '4px' }}>
                  <label className="prem-label">Current Employer to Block</label>
                  <div className="prem-input-wrap">
                    <Building2 size={16} color="#94a3b8" />
                    <input
                      className="prem-input"
                      placeholder="e.g. Acme Corp"
                      value={profileForm.currentCompany}
                      onChange={(e) => handleProfileChange("currentCompany", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BOTTOM ACTIONS BAR */}
          <div className="prem-actions-bar">
            <button
              type="button"
              className="prem-btn-reset"
              onClick={handleReset}
            >
              <RotateCcw size={15} /> Reset Defaults
            </button>
            <button
              type="button"
              className="prem-btn-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save size={16} /> Save All Preferences
                </>
              )}
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: QUICK SUMMARY CARD & CANDIDATE TIPS */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="prem-sidebar-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#4f46e5" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Overview & Quick Status</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="prem-summary-item">
                <span className="prem-summary-lbl"><Globe size={14} /> Discovery</span>
                <span className="prem-summary-val" style={{ color: settings.profileVisibility ? '#166534' : '#64748b' }}>
                  {settings.profileVisibility ? "Public (Active)" : "Hidden"}
                </span>
              </div>
              <div className="prem-summary-item">
                <span className="prem-summary-lbl"><Bell size={14} /> Alerts</span>
                <span className="prem-summary-val" style={{ color: settings.jobAlerts ? '#0284c7' : '#64748b' }}>
                  {settings.jobAlerts ? "Enabled" : "Paused"}
                </span>
              </div>
              <div className="prem-summary-item">
                <span className="prem-summary-lbl"><Timer size={14} /> Timer</span>
                <span className="prem-summary-val">
                  {settings.timerEnabled ? "2-min Active" : "Disabled"}
                </span>
              </div>
              <div className="prem-summary-item">
                <span className="prem-summary-lbl"><Shield size={14} /> Confidential</span>
                <span className="prem-summary-val">
                  {settings.hideCurrentEmployer ? "Employer Blocked" : "Standard"}
                </span>
              </div>
            </div>
          </div>

          <div className="prem-sidebar-card" style={{ background: '#f0fdf4', borderColor: '#dcfce3' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534' }}>
              <CheckCircle2 size={18} />
              <h3 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0 }}>Pro Candidate Tip</h3>
            </div>
            <p style={{ fontSize: '12.5px', color: '#15803d', margin: 0, lineHeight: 1.5 }}>
              Keeping <strong>Direct Recruiter Outreach</strong> enabled gives you 3.5x more technical interview invitations from actively hiring startups and enterprises.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
