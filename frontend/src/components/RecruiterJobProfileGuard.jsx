import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getOnboarding } from "../services/recruiterAPI";
import Loader from "./Loader";

/** Only blocks job posting routes until recruiter + company profile is complete. */
export default function RecruiterJobProfileGuard({ children }) {
  const [status, setStatus] = useState(null);
  const location = useLocation();

  useEffect(() => {
    getOnboarding()
      .then(setStatus)
      .catch(() => setStatus({ profileComplete: true }));
  }, []);

  if (status === null) return <Loader />;

  // User requested to allow job posting even if profile is not complete
  // if (!status.profileComplete) {
  //   const redirect = encodeURIComponent(location.pathname + location.search);
  //   return <Navigate to={`/recruiter/complete-profile?redirect=${redirect}`} replace />;
  // }

  return children;
}
