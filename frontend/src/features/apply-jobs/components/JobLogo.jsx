import React, { useState } from "react";
import { jobCompany } from "../utils/jobHelpers";

const COMPANY_LOGOS = {
  Google: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
  Microsoft: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
  Zomato: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Zomato_Logo.svg",
  Swiggy: "https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg",
  Paytm: "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg",
  Adobe: "https://upload.wikimedia.org/wikipedia/commons/4/42/Adobe_Corporate_logo.svg",
};

export default function JobLogo({ job, className, style }) {
  const [error, setError] = useState(false);
  const compName = jobCompany(job);
  const hasKnownLogo = !job?.isThirdParty && job?.companyName && COMPANY_LOGOS[job.companyName];

  if (error || (!job?.externalCompanyLogo && !hasKnownLogo)) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#eef2ff",
          color: "#4f46e5",
          fontWeight: 800,
          ...style,
        }}
      >
        {(compName || "C").charAt(0).toUpperCase()}
      </div>
    );
  }

  const src = job?.externalCompanyLogo || (job?.companyName && COMPANY_LOGOS[job.companyName]);

  return (
    <img
      src={src}
      alt={compName}
      className={className}
      style={style}
      onError={() => setError(true)}
      onLoad={(e) => {
        if (e.target.naturalWidth <= 10) setError(true);
      }}
    />
  );
}
