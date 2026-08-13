import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "recruiter") {
      return <Navigate to="/recruiter-dashboard" replace />;
    }
    return <Navigate to="/user-dashboard" replace />;
  }

  return children;
}
