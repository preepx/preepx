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
        <div className="ud-apply-banner-text">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="ud-title-icon">
              <img src="/dsbanner/applyjobs.svg" alt="Apply Jobs" />
            </span>
            Apply Jobs
          </h2>
          <p>View matched roles, track applications, shortlists & assessments</p>
        </div>

      </button>
    </section>
  );
}
