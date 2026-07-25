import React from "react";
import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    return <Navigate to="/user-dashboard" replace />;
  }

  return children;
}
