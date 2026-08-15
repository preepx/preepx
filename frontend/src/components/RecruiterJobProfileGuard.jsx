import React from "react";

/** Only blocks job posting routes until recruiter + company profile is complete. */
export default function RecruiterJobProfileGuard({ children }) {
  // User requested to allow job posting even if profile is not complete
  // The blocking API call and full-screen loader have been removed to prevent layout unmounting.
  return children;
}
