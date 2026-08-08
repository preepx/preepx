import React, { useState } from "react";
import { Moon, Sun, Bell, Timer, Save, User, Mail, Shield } from "lucide-react";
import { updateSettings } from "../services/userAPI";
import notify from '../utils/notify';
import { showAppError } from "../utils/appAlert";
import "./Settings.css";

function Settings() {
  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const [settings, setSettings] = useState({
    darkMode: localStorage.getItem("theme") === "dark",
    emailNotifications: stored.settings?.emailNotifications ?? true,
    timerEnabled: stored.settings?.timerEnabled ?? true,
  });
  const [saving, setSaving] = useState(false);

  const toggle = (key) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    if (key === "darkMode") {
      document.documentElement.dataset.theme = next.darkMode ? "dark" : "light";
      localStorage.setItem("theme", next.darkMode ? "dark" : "light");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateSettings(settings);
      localStorage.setItem("user", JSON.stringify({ ...stored, settings: updated.settings }));
      notify.success("Settings saved!");
    } catch {
      showAppError("Your settings could not be saved. Please try again.", "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Customize your interview experience</p>
      </div>

      <div className="settings-account">
        <h3><User size={16} /> Account</h3>
        <div className="account-row"><Mail size={16} /><span>{stored.email}</span></div>
        <div className="account-row"><Shield size={16} /><span>Member since {stored._id ? "2025" : "—"}</span></div>
      </div>

      <div className="settings-sections">
        <div className="settings-group">
          <h3>Appearance</h3>
          <div className="setting-row" onClick={() => toggle("darkMode")}>
            <div className="setting-info">
              {settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}
              <div><span>Dark Mode</span><p>Switch between light and dark theme</p></div>
            </div>
            <div className={`toggle ${settings.darkMode ? "on" : ""}`} />
          </div>
        </div>
        <div className="settings-group">
          <h3>Interview</h3>
          <div className="setting-row" onClick={() => toggle("timerEnabled")}>
            <div className="setting-info">
              <Timer size={18} />
              <div><span>Question Timer</span><p>2-minute countdown per question during interviews</p></div>
            </div>
            <div className={`toggle ${settings.timerEnabled ? "on" : ""}`} />
          </div>
        </div>
        <div className="settings-group">
          <h3>Notifications</h3>
          <div className="setting-row" onClick={() => toggle("emailNotifications")}>
            <div className="setting-info">
              <Bell size={18} />
              <div><span>Email Notifications</span><p>Receive updates about your progress and streaks</p></div>
            </div>
            <div className={`toggle ${settings.emailNotifications ? "on" : ""}`} />
          </div>
        </div>
      </div>

      <button className="save-settings-btn" onClick={handleSave} disabled={saving}>
        <Save size={18} />{saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}

export default Settings;
