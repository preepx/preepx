import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, Building2 } from "lucide-react";
import RecruiterLayout from "../../layouts/RecruiterLayout";
import { getOnboarding, completeRecruiterProfile } from "../../services/recruiterAPI";
import notify from "../../utils/notify";
import Loader from "../../components/Loader";
import "../../layouts/RecruiterLayout.css";

function buildDefaultsFromStorage() {
  const u = JSON.parse(localStorage.getItem("user") || "{}");
  return {
    profile: {
      fullName: u.fullName || "",
      email: u.email || "",
      designation: u.designation || "",
      phone: u.phone || "",
    },
    company: {
      name: u.companyName || "",
      website: u.companyWebsite || "",
      description: "",
      industry: "",
      companySize: "",
      linkedin: "",
      officialEmail: u.email || "",
    },
  };
}

export default function RecruiterCompleteProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/recruiter/jobs/new";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(buildDefaultsFromStorage().profile);
  const [company, setCompany] = useState(buildDefaultsFromStorage().company);

  useEffect(() => {
    getOnboarding()
      .then((data) => {
        const stored = buildDefaultsFromStorage();
        setProfile({
          fullName: data.recruiter?.fullName || stored.profile.fullName,
          email: data.recruiter?.email || stored.profile.email,
          designation: data.recruiter?.designation || stored.profile.designation,
          phone: data.recruiter?.phone || stored.profile.phone,
        });
        setCompany({
          name: data.company?.name || data.recruiter?.companyName || stored.company.name,
          website: data.company?.website || data.recruiter?.companyWebsite || stored.company.website,
          description: data.company?.description || stored.company.description,
          industry: data.company?.industry || stored.company.industry,
          companySize: data.company?.companySize || stored.company.companySize,
          linkedin: data.company?.linkedin || stored.company.linkedin,
          officialEmail: data.company?.officialEmail || data.recruiter?.email || stored.company.officialEmail,
        });
        if (data.profileComplete) {
          navigate(redirect, { replace: true });
        }
      })
      .finally(() => setLoading(false));
  }, [navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await completeRecruiterProfile({ profile, company });
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...u,
        fullName: profile.fullName,
        designation: profile.designation,
        phone: profile.phone,
        companyName: company.name,
        companyWebsite: company.website,
        profileComplete: true,
      }));
      notify.success("Profile complete! You can post jobs now.");
      navigate(redirect, { replace: true });
    } catch (err) {
      notify.error(err.response?.data?.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <RecruiterLayout title="Complete Profile">
        <Loader />
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout title="Complete Profile">
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="rx-card" style={{ marginBottom: 16 }}>
          <h2 style={{ marginTop: 0 }}>Complete your profile to post jobs</h2>
          <p className="rx-muted" style={{ lineHeight: 1.6, marginBottom: 0 }}>
            Your registration details are pre-filled below. Review and complete the remaining fields to start posting jobs.
          </p>
        </div>

        <form className="rx-card rx-form" onSubmit={handleSubmit}>
          <h3 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <User size={18} style={{ color: "var(--primary)" }} /> Recruiter Details
          </h3>
          <div>
            <label>Full Name</label>
            <input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} required />
          </div>
          <div>
            <label>Email</label>
            <input value={profile.email} readOnly style={{ opacity: 0.7 }} />
          </div>
          <div>
            <label>Designation</label>
            <input value={profile.designation} onChange={(e) => setProfile({ ...profile, designation: e.target.value })} placeholder="HR Manager" required />
          </div>
          <div>
            <label>Phone</label>
            <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 9876543210" required />
          </div>

          <h3 style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <Building2 size={18} style={{ color: "var(--primary)" }} /> Company Details
          </h3>
          <div>
            <label>Company Name</label>
            <input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} required />
          </div>
          <div>
            <label>Website</label>
            <input value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} placeholder="https://company.com" />
          </div>
          <div>
            <label>Description</label>
            <textarea rows={3} value={company.description} onChange={(e) => setCompany({ ...company, description: e.target.value })} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label>Industry</label>
              <input value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })} placeholder="Technology" required />
            </div>
            <div>
              <label>Company Size</label>
              <input value={company.companySize} onChange={(e) => setCompany({ ...company, companySize: e.target.value })} placeholder="11-50" />
            </div>
          </div>
          <div>
            <label>LinkedIn</label>
            <input value={company.linkedin} onChange={(e) => setCompany({ ...company, linkedin: e.target.value })} />
          </div>
          <div>
            <label>Official Email</label>
            <input value={company.officialEmail} onChange={(e) => setCompany({ ...company, officialEmail: e.target.value })} />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="button" className="rx-btn rx-btn-ghost" onClick={() => navigate("/recruiter-dashboard")}>
              Back to Dashboard
            </button>
            <button type="submit" className="rx-btn rx-btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save & Continue to Post Job"}
            </button>
          </div>
        </form>
      </div>
    </RecruiterLayout>
  );
}
