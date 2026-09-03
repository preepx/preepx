import React from "react";
import { Lock, Mail } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

export default function ForgotPasswordEmailForm({
  forgotEmail,
  setForgotEmail,
  activeRole,
  recaptchaRef,
  setCaptchaToken,
  theme = "dark",
  loading,
  onSubmit,
  onBackToLogin
}) {
  return (
    <form onSubmit={onSubmit} className="auth-form-wrap">
      <div className="auth-otp-screen">
        <div className="otp-icon-wrap">
          <Lock size={26} />
        </div>
        <h2 className="auth-otp-title">Reset your password</h2>
        <p className="auth-otp-sub">
          Enter your registered email to receive a password reset code.
        </p>
      </div>

      <div className="auth-input-group">
        <label>Registered Email Address</label>
        <div className="auth-input-box">
          <Mail size={16} className="input-icon" />
          <input
            type="email"
            placeholder="you@example.com"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            className="auth-input"
            required
          />
        </div>
      </div>

      {activeRole === "candidate" && (
        <div style={{ margin: "4px 0", display: "flex", justifyContent: "center" }}>
          <ReCAPTCHA
            key={theme}
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            theme={theme === "light" ? "light" : "dark"}
            onChange={(token) => setCaptchaToken(token)}
          />
        </div>
      )}

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading ? "Sending reset code..." : "Send Reset Code"}
      </button>

      <div className="auth-switch-prompt">
        Remember your password?
        <button type="button" onClick={onBackToLogin}>
          Back to Login
        </button>
      </div>
    </form>
  );
}
