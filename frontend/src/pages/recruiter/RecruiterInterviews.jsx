import React, { useEffect, useState } from "react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { getInterviews } from "@/services/recruiterAPI";
import Loader from "@/components/Loader";
import '@/styles/RecruiterLayout.css';

export default function RecruiterInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getInterviews().then(setInterviews).finally(() => setLoading(false)); }, []);

  return (
    <RecruiterLayout title="Interviews">
      {loading ? <Loader /> : interviews.length === 0 ? (
        <div className="rx-card rx-empty">No interviews scheduled. Schedule from a candidate profile.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {interviews.map((i) => (
            <div key={i._id} className="rx-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{i.jobId?.title}</strong>
                <p style={{ margin: "4px 0", color: "#64748b" }}>{i.userId?.fullName} · {new Date(i.scheduledAt).toLocaleString()}</p>
                {i.meetingLink && <a href={i.meetingLink} target="_blank" rel="noreferrer" className="rx-btn rx-btn-primary">Join</a>}
              </div>
              <span className="rx-badge rx-badge-blue">{i.status}</span>
            </div>
          ))}
        </div>
      )}
    </RecruiterLayout>
  );
}
