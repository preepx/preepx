import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, User, Shield, CreditCard, CheckCircle } from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import {
  updateRecruiterProfile, updateCompanyProfile, submitVerification, completeOnboarding, getBilling
} from "@/services/recruiterAPI";
import notify from "@/utils/notify";
import '@/styles/RecruiterLayout.css';

const STEPS = [
  { id: "profile", label: "Recruiter Profile", icon: User },
  { id: "company", label: "Company Profile", icon: Building2 },
  { id: "verification", label: "Verification", icon: Shield },
  { id: "subscription", label: "Subscription", icon: CreditCard },
];

export default function RecruiterOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [profile, setProfile] = useState({ fullName: "", designation: "", phone: "" });
  const [company, setCompany] = useState({
    name: "", website: "", description: "", industry: "", companySize: "", linkedin: "", officialEmail: "",
  });

  React.useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    setProfile((p) => ({ ...p, fullName: u.fullName || "" }));
    setCompany((c) => ({ ...c, name: u.companyName || "", website: u.companyWebsite || "" }));
    getBilling().then((d) => setPlans(d.plans || [])).catch(() => {});
  }, []);

  const saveProfile = async () => {
    setLoading(true);
    try {
      await updateRecruiterProfile(profile);
      notify.success("Profile saved");
      setStep(1);
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const saveCompany = async () => {
    setLoading(true);
    try {
      await updateCompanyProfile(company);
      notify.success("Company profile saved");
      setStep(2);
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const submitVerify = async () => {
    setLoading(true);
    try {
      await submitVerification();
      notify.success("Verification submitted. Admin will review your company.");
      setStep(3);
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const finish = async (planSlug) => {
    setLoading(true);
    try {
      await completeOnboarding(planSlug);
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      u.onboardingCompleted = true;
      localStorage.setItem("user", JSON.stringify(u));
      notify.success("Welcome to PreepX Recruiter!");
      navigate("/recruiter-dashboard");
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RecruiterLayout title="Get Started">
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{
              flex: 1, minWidth: 140, padding: 12, borderRadius: 12,
              background: i <= step ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "var(--surface)",
              border: `1px solid ${i <= step ? "var(--primary-light)" : "var(--border)"}`,
              textAlign: "center", fontSize: 13, fontWeight: 600,
              color: i <= step ? "var(--primary)" : "var(--text-muted)",
            }}>
              <s.icon size={18} style={{ marginBottom: 4 }} />
              <div>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="rx-card">
          {step === 0 && (
            <>
              <h2 style={{ marginTop: 0 }}>Recruiter Profile</h2>
              <div className="rx-form">
                <div><label>Full Name</label><input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} /></div>
                <div><label>Designation</label><input value={profile.designation} onChange={(e) => setProfile({ ...profile, designation: e.target.value })} placeholder="HR Manager" /></div>
                <div><label>Phone</label><input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
                <button type="button" className="rx-btn rx-btn-primary" onClick={saveProfile} disabled={loading}>Continue</button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 style={{ marginTop: 0 }}>Company Profile</h2>
              <div className="rx-form">
                <div><label>Company Name</label><input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} /></div>
                <div><label>Website</label><input value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} /></div>
                <div><label>Description</label><textarea rows={3} value={company.description} onChange={(e) => setCompany({ ...company, description: e.target.value })} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label>Industry</label><input value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })} /></div>
                  <div><label>Company Size</label><input value={company.companySize} onChange={(e) => setCompany({ ...company, companySize: e.target.value })} placeholder="11-50" /></div>
                </div>
                <div><label>LinkedIn</label><input value={company.linkedin} onChange={(e) => setCompany({ ...company, linkedin: e.target.value })} /></div>
                <div><label>Official Email</label><input value={company.officialEmail} onChange={(e) => setCompany({ ...company, officialEmail: e.target.value })} /></div>
                <button type="button" className="rx-btn rx-btn-primary" onClick={saveCompany} disabled={loading}>Continue</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ marginTop: 0 }}>Company Verification</h2>
              <p className="rx-muted" style={{ lineHeight: 1.6 }}>Your company profile will be reviewed by PreepX admin. Once verified, you can publish jobs and discover candidates.</p>
              <ul className="rx-muted" style={{ lineHeight: 2 }}>
                <li>Status: <strong>PENDING</strong> after submission</li>
                <li>Verified companies get full access to candidate discovery</li>
                <li>1 Company = 1 Recruiter (MVP)</li>
              </ul>
              <button type="button" className="rx-btn rx-btn-primary" onClick={submitVerify} disabled={loading}>Submit for Verification</button>
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={{ marginTop: 0 }}>Start hiring with a trial</h2>
              <p className="rx-muted">You get a 14-day Starter trial (up to 5 job posts). Upgrade to Growth anytime from Billing.</p>
              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                {(plans.length ? plans.filter((p) => p.slug === "starter") : [{ name: "Starter", slug: "starter", priceInr: 1999 }]).map((p) => (
                  <div key={p.slug} className="rx-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong>{p.name} trial</strong>
                      <p className="rx-muted" style={{ margin: "4px 0 0" }}>Then ₹{p.priceInr?.toLocaleString("en-IN")}/month · 5 job posts</p>
                    </div>
                    <button type="button" className="rx-btn rx-btn-primary" onClick={() => finish("starter")} disabled={loading}>
                      <CheckCircle size={16} /> Start 14-day trial
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </RecruiterLayout>
  );
}
