import React, { useEffect, useState } from "react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { getAnalytics } from "@/services/recruiterAPI";
import Loader from "@/components/Loader";
import '@/styles/RecruiterLayout.css';

export default function RecruiterAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getAnalytics().then(setData).finally(() => setLoading(false)); }, []);

  return (
    <RecruiterLayout title="Analytics">
      {loading ? <Loader /> : (
        <div className="rx-stats">
          <div className="rx-stat"><h3>{data?.conversion?.matchedToAssessment ?? 0}%</h3><p>Matched → Assessment</p></div>
          <div className="rx-stat"><h3>{data?.conversion?.assessmentToShortlist ?? 0}%</h3><p>Assessment → Shortlist</p></div>
          <div className="rx-stat"><h3>{data?.conversion?.shortlistToHire ?? 0}%</h3><p>Shortlist → Hire</p></div>
        </div>
      )}
    </RecruiterLayout>
  );
}
