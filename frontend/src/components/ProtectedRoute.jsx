import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredToken, getStoredUser } from "@/utils/authUtils";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = getStoredToken();
  const user = getStoredUser();
  const location = useLocation();

  if (!token || !user) {
    const redirectParam = location.pathname !== "/"
      ? `?redirect=${encodeURIComponent(location.pathname + location.search)}`
      : "";
    return <Navigate to={`/auth${redirectParam}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "recruiter") {
      return <Navigate to="/recruiter-dashboard" replace />;
    }
    return <Navigate to="/user-dashboard" replace />;
  }

  return children;
}
