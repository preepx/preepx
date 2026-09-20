import React from "react";
import { Lock, Mail, AlertCircle } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

export default function ForgotPasswordEmailForm({
  forgotEmail,
  setForgotEmail,
  forgotError,
  setForgotError,
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
          <img src="/landing/lock.svg" alt="Lock" style={{ width: 26, height: 26 }} />
        </div>
        <h2 className="auth-otp-title">Reset your password</h2>
        <p className="auth-otp-sub">
          Enter your registered email to receive a password reset code.
        </p>
      </div>

      <div className="auth-input-group">
        <label>Registered Email Address</label>
        <div className={`auth-input-box ${forgotError ? "has-error" : ""}`}>
          <img src="/landing/email.svg" alt="Email" className="input-icon" style={{ width: 16, height: 16 }} />
          <input
            type="email"
            placeholder="you@example.com"
            value={forgotEmail}
            onChange={(e) => {
              setForgotEmail(e.target.value);
              if (forgotError && setForgotError) setForgotError("");
            }}
            className="auth-input"
            required
          />
        </div>
        {forgotError && (
          <div className="auth-inline-error" style={{ display: 'flex', alignItems: 'flex-start', marginTop: '4px' }}>
            <AlertCircle size={14} fill="#ef4444" color="#fff" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '4px' }}>
              {forgotError.split('\n').map((line, idx) => (
                <span key={idx} style={{ color: idx === 1 ? '#94a3b8' : '#ef4444', fontSize: idx === 1 ? '9.5px' : '10px' }}>{line}</span>
              ))}
            </div>
          </div>
        )}
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
