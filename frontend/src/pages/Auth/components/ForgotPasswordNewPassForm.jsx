import React from "react";
import { CheckCircle, Lock, Eye, EyeOff } from "lucide-react";

export default function ForgotPasswordNewPassForm({
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  showNewPass,
  setShowNewPass,
  showConfirmNewPass,
  setShowConfirmNewPass,
  loading,
  onSubmit
}) {
  return (
    <form onSubmit={onSubmit} className="auth-form-wrap">
      <div className="auth-otp-screen">
        <div
          className="otp-icon-wrap"
          style={{
            background: "rgba(16, 185, 129, 0.15)",
            borderColor: "rgba(16, 185, 129, 0.35)",
            color: "#34d399",
          }}
        >
          <CheckCircle size={26} />
        </div>
        <h2 className="auth-otp-title">Set new password</h2>
        <p className="auth-otp-sub">
          Code verified! Create a secure new password for your account.
        </p>
      </div>

      <div className="auth-input-group">
        <label>New Password</label>
        <div className="auth-input-box">
          <Lock size={16} className="input-icon" />
          <input
            type={showNewPass ? "text" : "password"}
            placeholder="Min. 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="auth-input"
            minLength={6}
            required
          />
          <button
            type="button"
            className="auth-pass-toggle"
            onClick={() => setShowNewPass(!showNewPass)}
            aria-label="Toggle password visibility"
          >
            {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="auth-input-group">
        <label>Confirm New Password</label>
        <div className="auth-input-box">
          <Lock size={16} className="input-icon" />
          <input
            type={showConfirmNewPass ? "text" : "password"}
            placeholder="Re-enter new password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="auth-input"
            minLength={6}
            required
          />
          <button
            type="button"
            className="auth-pass-toggle"
            onClick={() => setShowConfirmNewPass(!showConfirmNewPass)}
            aria-label="Toggle confirm password visibility"
          >
            {showConfirmNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading ? "Updating password..." : "Reset Password & Login"}
      </button>
    </form>
  );
}
