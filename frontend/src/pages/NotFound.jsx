import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Search, Compass } from "lucide-react";
import { getStoredToken, getStoredUser } from "@/utils/authUtils";

export default function NotFound() {
  const navigate = useNavigate();
  const token = getStoredToken();
  const user = getStoredUser();
  const dashboardLink = user?.role === "recruiter" ? "/recruiter-dashboard" : "/user-dashboard";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        background: "var(--bg-primary, #0a0f1d)",
        color: "var(--text-primary, #f8fafc)",
        textAlign: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--primary, #6366f1)",
          marginBottom: "24px",
        }}
      >
        <Compass size={40} />
      </div>

      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "2px",
          color: "var(--primary, #6366f1)",
          marginBottom: "12px",
        }}
      >
        Error 404
      </div>

      <h1
        style={{
          fontSize: "clamp(28px, 5vw, 42px)",
          fontWeight: 800,
          letterSpacing: "-0.5px",
          margin: "0 0 12px 0",
          color: "var(--text-primary, #ffffff)",
        }}
      >
        Page Not Found
      </h1>

      <p
        style={{
          maxWidth: "460px",
          fontSize: "15px",
          lineHeight: "1.6",
          color: "var(--text-secondary, #94a3b8)",
          margin: "0 0 32px 0",
        }}
      >
        The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            borderRadius: "10px",
            border: "1px solid var(--border-color, #334155)",
            background: "transparent",
            color: "var(--text-primary, #f8fafc)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <ArrowLeft size={16} />
          Go Back
        </button>

        {token ? (
          <Link
            to={dashboardLink}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
            }}
          >
            <Home size={16} />
            Go to Dashboard
          </Link>
        ) : (
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
            }}
          >
            <Home size={16} />
            Return Home
          </Link>
        )}

        <Link
          to="/apply-jobs/browse"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            borderRadius: "10px",
            border: "1px solid var(--border-color, #334155)",
            background: "rgba(255, 255, 255, 0.03)",
            color: "var(--text-primary, #f8fafc)",
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <Search size={16} />
          Browse Jobs
        </Link>
      </div>
    </div>
  );
}
