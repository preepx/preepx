import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { getOnboarding, updateRecruiterProfile } from "@/services/recruiterAPI";
import notify from "@/utils/notify";
import Loader from "@/components/Loader";
import '@/styles/RecruiterLayout.css';

export default function RecruiterSettings() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ fullName: "", designation: "", phone: "" });
  const [isDark, setIsDark] = useState(document.documentElement.dataset.theme === "dark");

  useEffect(() => {
    getOnboarding().then((d) => {
      if (d.recruiter) setProfile(d.recruiter);
    }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      await updateRecruiterProfile(profile);
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...u, ...profile }));
      notify.success("Settings saved");
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed");
    }
  };

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    setIsDark(!isDark);
  };

  if (loading) return <RecruiterLayout title="Settings"><Loader /></RecruiterLayout>;

  return (
    <RecruiterLayout title="Settings">
      <div className="rx-card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Appearance</h3>
        <p className="rx-muted" style={{ marginBottom: 12 }}>Match candidate dashboard theme (dark / light).</p>
        <button type="button" className="rx-btn rx-btn-secondary" onClick={toggleTheme}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {isDark ? "Switch to Light" : "Switch to Dark"}
        </button>
      </div>

      <div className="rx-card">
        <h3 style={{ marginTop: 0 }}>Recruiter Profile</h3>
        <div className="rx-form">
          <div><label>Full Name</label><input value={profile.fullName || ""} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} /></div>
          <div><label>Designation</label><input value={profile.designation || ""} onChange={(e) => setProfile({ ...profile, designation: e.target.value })} /></div>
          <div><label>Phone</label><input value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
          <button type="button" className="rx-btn rx-btn-primary" onClick={save} style={{ width: "fit-content", padding: "10px 24px" }}>Save Changes</button>
        </div>
      </div>
    </RecruiterLayout>
  );
}
