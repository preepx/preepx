import React, { useEffect, useState } from "react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { getBilling, selectPlan } from "@/services/recruiterAPI";
import notify from "@/utils/notify";
import Loader from "@/components/Loader";
import '@/styles/RecruiterLayout.css';

export default function RecruiterBilling() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getBilling().then(setData).finally(() => setLoading(false)); }, []);

  const handleSelect = async (slug) => {
    try {
      await selectPlan(slug);
      notify.success("Plan updated");
      getBilling().then(setData);
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed");
    }
  };

  return (
    <RecruiterLayout title="Billing">
      {loading ? <Loader /> : (
        <>
          {data?.subscription && (
            <div className="rx-card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginTop: 0 }}>Current Plan: {data.subscription.planId?.name}</h3>
              <p style={{ color: "#64748b" }}>Status: {data.subscription.status}</p>
              <p style={{ fontSize: 13 }}>Usage: {data.subscription.usage?.assessmentsSent || 0} assessments · {data.subscription.usage?.activeJobs || 0} jobs</p>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {(data?.plans || []).map((p) => (
              <div key={p.slug} className="rx-card">
                <h3>{p.name}</h3>
                <p style={{ fontSize: 28, fontWeight: 800 }}>₹{p.priceInr?.toLocaleString()}<span style={{ fontSize: 14, fontWeight: 400 }}>/mo</span></p>
                <ul style={{ fontSize: 13, color: "#64748b", paddingLeft: 18 }}>
                  <li>{p.limits?.activeJobs} active jobs</li>
                  <li>{p.limits?.assessmentCredits} assessments</li>
                  <li>{p.limits?.candidateViews} candidate views</li>
                </ul>
                <button type="button" className="rx-btn rx-btn-primary" onClick={() => handleSelect(p.slug)}>Select Plan</button>
              </div>
            ))}
          </div>
        </>
      )}
    </RecruiterLayout>
  );
}
