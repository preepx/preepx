import React from "react";
import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }) {
  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  if (token && user) {
    if (user.role === "recruiter") {
      return <Navigate to="/recruiter-dashboard" replace />;
    }
    return <Navigate to="/user-dashboard" replace />;
  }

  return children;
}
