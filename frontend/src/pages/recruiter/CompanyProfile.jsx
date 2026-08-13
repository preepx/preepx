import React, { useEffect, useState } from "react";
import RecruiterLayout from "../../layouts/RecruiterLayout";
import { getOnboarding, updateCompanyProfile } from "../../services/recruiterAPI";
import notify from "../../utils/notify";
import Loader from "../../components/Loader";
import "../../layouts/RecruiterLayout.css";

export default function CompanyProfile() {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState({});

  useEffect(() => {
    getOnboarding().then((d) => { if (d.company) setCompany(d.company); }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      await updateCompanyProfile(company);
      notify.success("Company profile updated");
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed");
    }
  };

  if (loading) return <RecruiterLayout title="Company Profile"><Loader /></RecruiterLayout>;

  return (
    <RecruiterLayout title="Company Profile">
      <div className="rx-card">
        {company.verificationStatus && (
          <p>Verification: <span className={`rx-badge ${company.verificationStatus === "VERIFIED" ? "rx-badge-green" : "rx-badge-amber"}`}>{company.verificationStatus}</span></p>
        )}
        <div className="rx-form">
          {["name", "website", "industry", "companySize", "linkedin", "officialEmail"].map((f) => (
            <div key={f}><label>{f}</label><input value={company[f] || ""} onChange={(e) => setCompany({ ...company, [f]: e.target.value })} /></div>
          ))}
          <div><label>Description</label><textarea rows={4} value={company.description || ""} onChange={(e) => setCompany({ ...company, description: e.target.value })} /></div>
          <button type="button" className="rx-btn rx-btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </RecruiterLayout>
  );
}
