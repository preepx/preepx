import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function RecruiterDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_notifications");
    window.dispatchEvent(new Event("user-updated"));
    navigate("/auth/recruiter");
  };

  return (
    <div style={{ textAlign: "center", padding: "80px 24px", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: "16px" }}>Recruiter Dashboard</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 18, marginTop: 8, marginBottom: 32 }}>Coming soon...</p>
      
      <button 
        onClick={handleLogout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 20px",
          backgroundColor: "var(--error-bg, #fee2e2)",
          color: "var(--error-text, #ef4444)",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "16px"
        }}
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
