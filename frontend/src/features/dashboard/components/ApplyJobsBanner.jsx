import React from "react";
import { useNavigate } from "react-router-dom";


export default function ApplyJobsBanner() {
  const navigate = useNavigate();

  return (
    <section className="ud-section">
      <button
        type="button"
        className="ud-apply-banner"
        onClick={() => navigate("/apply-jobs")}
      >
        <div className="ud-apply-banner-icon"><img src="/dsbanner/applyjobs.svg" alt="Apply Jobs" style={{ width: 28, height: 28 }} /></div>
        <div className="ud-apply-banner-text">
          <h2>Apply Jobs</h2>
          <p>View matched roles, track applications, shortlists & assessments</p>
        </div>

      </button>
    </section>
  );
}
