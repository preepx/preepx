import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredToken, getStoredUser } from "@/utils/authUtils";

export default function GuestRoute({ children }) {
  const token = getStoredToken();
  const user = getStoredUser();

  if (token && user) {
    if (user.role === "recruiter") {
      return <Navigate to="/recruiter-dashboard" replace />;
    }
    return <Navigate to="/user-dashboard" replace />;
  }

  return children;
}
