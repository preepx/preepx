import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { getOnboarding, updateCompanyProfile, getBilling, getAnalytics } from "@/services/recruiterAPI";
import notify from "@/utils/notify";
import Loader from "@/components/Loader";
import { Building2, Globe, Mail, Users, Linkedin, FileText, CheckCircle, ShieldAlert, Briefcase, Shield } from "lucide-react";
import '@/styles/RecruiterLayout.css';

export default function CompanyProfile() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [billing, setBilling] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [company, setCompany] = useState({
    name: "",
    website: "",
    industry: "",
    companySize: "",
    linkedin: "",
    officialEmail: "",
    description: "",
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    Promise.all([
      getOnboarding().catch(() => ({})),
      getBilling().catch(() => null),
      getAnalytics().catch(() => null)
    ]).then(([d, billingData, analyticsData]) => {
      const existing = d.company || {};
      setCompany({
        ...existing,
        name: existing.name || user.companyName || "",
        website: existing.website || user.companyWebsite || "",
        officialEmail: existing.officialEmail || user.email || "",
        industry: existing.industry || "",
        companySize: existing.companySize || "",
        linkedin: existing.linkedin || "",
        description: existing.description || "",
      });
      if (!existing.website || !existing.industry) {
        setIsEditing(true);
      }
      setBilling(billingData);
      setAnalytics(analyticsData);
    }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      await updateCompanyProfile(company);
      notify.success("Company profile updated successfully!");
      setIsEditing(false);
      window.dispatchEvent(new Event("company_profile_updated"));
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) return <RecruiterLayout title="Company Profile"><Loader /></RecruiterLayout>;

  return (
    <RecruiterLayout title="Company Profile">
      <div className="rx-dashboard">

        {/* Account Overview Card */}
        <div className="rx-card" style={{ width: "100%", padding: "28px 40px", border: "1px solid color-mix(in srgb, var(--primary) 20%, var(--border))", boxShadow: "0 12px 32px rgba(0,0,0,0.08)", borderRadius: "20px", marginBottom: "24px" }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Account Overview
              </h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
                Your current subscription and usage stats.
              </p>
            </div>
            <Link to="/recruiter/billing" className="rx-btn rx-btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px' }}>
              Manage Billing
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'color-mix(in srgb, var(--success) 12%, transparent)', color: 'var(--success)', padding: '12px', borderRadius: '10px' }}>
                <Shield size={24} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Current Plan</p>
                <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 800 }}>{billing?.subscription?.planName || billing?.subscription?.planId?.name || 'Free Trial'}</h3>
              </div>
            </div>

            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)', padding: '12px', borderRadius: '10px' }}>
                <Briefcase size={24} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Jobs</p>
                <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 800 }}>{analytics?.metrics?.activeJobs || 0}</h3>
              </div>
            </div>

            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'color-mix(in srgb, var(--warning) 12%, transparent)', color: 'var(--warning)', padding: '12px', borderRadius: '10px' }}>
                <Users size={24} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Candidates</p>
                <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 800 }}>{analytics?.metrics?.totalCandidates || 0}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="rx-card" style={{ width: "100%", padding: "32px 40px", border: "1px solid color-mix(in srgb, var(--primary) 20%, var(--border))", boxShadow: "0 12px 32px rgba(0,0,0,0.12)", borderRadius: "20px" }}>

          {/* Header Section */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                  <Building2 size={20} />
                </div>
                Company Details
              </h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', paddingLeft: '40px' }}>
                Update your company's information to help candidates understand your business.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {company.verificationStatus && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: company.verificationStatus === 'VERIFIED' ? 'color-mix(in srgb, var(--success) 12%, transparent)' : 'color-mix(in srgb, var(--warning) 12%, transparent)',
                  padding: '8px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: '700',
                  color: company.verificationStatus === 'VERIFIED' ? 'var(--success)' : 'var(--warning)',
                  border: `1px solid color-mix(in srgb, ${company.verificationStatus === 'VERIFIED' ? 'var(--success)' : 'var(--warning)'} 30%, transparent)`,
                  whiteSpace: 'nowrap'
                }}>
                  {company.verificationStatus === 'VERIFIED' ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
                  {company.verificationStatus === 'VERIFIED' ? 'Verified' : 'Pending Approval'}
                </div>
              )}
              {!isEditing && (
                <button type="button" className="rx-btn rx-btn-primary" onClick={() => setIsEditing(true)} style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className="rx-form" style={{ maxWidth: '100%' }}>
            <div className="rx-grid-2">
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}><Building2 size={16} className="rx-muted" /> Company Name</label>
                {isEditing ? (
                  <input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} placeholder="e.g. Acme Corp" style={{ padding: '12px 16px', background: 'var(--bg)' }} />
                ) : (
                  <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>{company.name || "N/A"}</div>
                )}
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}><Globe size={16} className="rx-muted" /> Website URL</label>
                {isEditing ? (
                  <input value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} placeholder="https://example.com" style={{ padding: '12px 16px', background: 'var(--bg)' }} />
                ) : (
                  <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>{company.website || "N/A"}</div>
                )}
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}><Mail size={16} className="rx-muted" /> Official Email</label>
                {isEditing ? (
                  <input value={company.officialEmail} onChange={(e) => setCompany({ ...company, officialEmail: e.target.value })} placeholder="contact@company.com" style={{ padding: '12px 16px', background: 'var(--bg)' }} />
                ) : (
                  <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>{company.officialEmail || "N/A"}</div>
                )}
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}><Users size={16} className="rx-muted" /> Company Size</label>
                {isEditing ? (
                  <select value={company.companySize} onChange={(e) => setCompany({ ...company, companySize: e.target.value })} style={{ padding: '12px 16px', background: 'var(--bg)' }}>
                    <option value="">Select Size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                ) : (
                  <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>{company.companySize || "N/A"}</div>
                )}
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}><Briefcase size={16} className="rx-muted" /> Industry</label>
                {isEditing ? (
                  <input value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })} placeholder="e.g. Technology, Healthcare, Finance" style={{ padding: '12px 16px', background: 'var(--bg)' }} />
                ) : (
                  <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>{company.industry || "N/A"}</div>
                )}
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}><Linkedin size={16} className="rx-muted" /> LinkedIn Profile</label>
                {isEditing ? (
                  <input value={company.linkedin} onChange={(e) => setCompany({ ...company, linkedin: e.target.value })} placeholder="https://linkedin.com/company/..." style={{ padding: '12px 16px', background: 'var(--bg)' }} />
                ) : (
                  <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>{company.linkedin || "N/A"}</div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}><FileText size={16} className="rx-muted" /> Company Description</label>
              {isEditing ? (
                <textarea rows={5} value={company.description} onChange={(e) => setCompany({ ...company, description: e.target.value })} placeholder="Tell us about your company's mission, values, culture, and what you do..." style={{ padding: '16px', background: 'var(--bg)', resize: 'vertical' }} />
              ) : (
                <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)', minHeight: '100px', whiteSpace: 'pre-wrap' }}>{company.description || "No description provided."}</div>
              )}
            </div>

            {isEditing && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="rx-btn rx-btn-primary" onClick={save} style={{ padding: '14px 28px', fontSize: '15px', borderRadius: '12px', boxShadow: '0 4px 12px color-mix(in srgb, var(--primary) 40%, transparent)' }}>
                  Save Profile Details
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
}
