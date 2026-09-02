import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "var(--bg-primary, #0f172a)",
            color: "var(--text-primary, #f8fafc)",
            fontFamily: "var(--font-sans, system-ui, sans-serif)",
          }}
        >
          <div
            style={{
              maxWidth: "480px",
              width: "100%",
              textAlign: "center",
              padding: "40px 32px",
              borderRadius: "16px",
              background: "var(--bg-card, #1e293b)",
              border: "1px solid var(--border-color, #334155)",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                margin: "0 auto 20px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ef4444",
              }}
            >
              <AlertTriangle size={30} />
            </div>

            <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 10px 0" }}>
              Something went wrong
            </h1>
            <p style={{ color: "var(--text-secondary, #94a3b8)", fontSize: "14px", lineHeight: "1.6", margin: "0 0 28px 0" }}>
              An unexpected error occurred while loading this view. Please try refreshing or return to the homepage.
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "var(--primary, #6366f1)",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={15} />
                Try Again
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color, #334155)",
                  background: "transparent",
                  color: "var(--text-primary, #f8fafc)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Home size={15} />
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
