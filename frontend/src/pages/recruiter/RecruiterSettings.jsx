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
  const [isDark] = useState(false); // Theme permanently light

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



  if (loading) return <RecruiterLayout title="Settings"><Loader /></RecruiterLayout>;

  return (
    <RecruiterLayout title="Settings">

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
