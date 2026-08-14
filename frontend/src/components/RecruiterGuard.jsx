import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getOnboarding } from "@/services/recruiterAPI";
import Loader from "./Loader";

export default function RecruiterGuard({ children }) {
  const [state, setState] = useState(null);
  const location = useLocation();

  useEffect(() => {
    getOnboarding()
      .then(setState)
      .catch(() => setState({ onboardingCompleted: true }));
  }, []);

  if (state === null) return <Loader />;

  const onOnboardingPage = location.pathname.startsWith("/recruiter/onboarding");
  if (!state.onboardingCompleted && !onOnboardingPage) {
    return <Navigate to="/recruiter/onboarding" replace />;
  }
  if (state.onboardingCompleted && onOnboardingPage) {
    return <Navigate to="/recruiter-dashboard" replace />;
  }

  return children;
}
