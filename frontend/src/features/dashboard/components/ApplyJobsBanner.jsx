import React from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, ChevronRight } from "lucide-react";

export default function ApplyJobsBanner() {
  const navigate = useNavigate();

  return (
    <section className="ud-section">
      <button
        type="button"
        className="ud-apply-banner"
        onClick={() => navigate("/apply-jobs")}
      >
        <div className="ud-apply-banner-icon"><Briefcase size={28} /></div>
        <div className="ud-apply-banner-text">
          <h2>Apply Jobs</h2>
          <p>View matched roles, track applications, shortlists & assessments</p>
        </div>
        <ChevronRight size={24} className="ud-apply-banner-arrow" />
      </button>
    </section>
  );
}
