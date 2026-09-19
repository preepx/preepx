import React from "react";
import { User, Mail, Lock, Sparkles, Eye, EyeOff } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

export default function RegisterCandidateForm({
  candidateReg,
  setCandidateReg,
  showCandPass,
  setShowCandPass,
  showCandConfirmPass,
  setShowCandConfirmPass,
  recaptchaRef,
  setCaptchaToken,
  theme = "dark",
  loading,
  onSubmit,
  onGoogleLogin,
  onSwitchToLogin
}) {
  return (
    <form onSubmit={onSubmit} className="auth-form-wrap">
      <div className="auth-form-row">
        <div className="auth-input-group">
          <label>Full Name</label>
          <div className="auth-input-box">
            <img src="/sidebar/profile.svg" alt="Profile" className="input-icon" style={{ width: 16, height: 16 }} />
            <input
              type="text"
              placeholder="e.g. Rahul Verma"
              value={candidateReg.fullName}
              onChange={(e) => setCandidateReg({ ...candidateReg, fullName: e.target.value })}
              className="auth-input"
              required
            />
          </div>
        </div>

        <div className="auth-input-group">
          <label>Email ID</label>
          <div className="auth-input-box">
            <img src="/landing/email.svg" alt="Email" className="input-icon" style={{ width: 16, height: 16 }} />
            <input
              type="email"
              placeholder="you@example.com"
              value={candidateReg.email}
              onChange={(e) => setCandidateReg({ ...candidateReg, email: e.target.value })}
              className="auth-input"
              required
            />
          </div>
        </div>
      </div>

      <div className="auth-form-row">
        <div className="auth-input-group">
          <label>Password</label>
          <div className="auth-input-box">
            <img src="/landing/lock.svg" alt="Lock" className="input-icon" style={{ width: 16, height: 16 }} />
            <input
              type={showCandPass ? "text" : "password"}
              placeholder="Min. 6 chars"
              value={candidateReg.password}
              onChange={(e) => setCandidateReg({ ...candidateReg, password: e.target.value })}
              className="auth-input"
              minLength={6}
              required
            />
            <button
              type="button"
              className="auth-pass-toggle"
              onClick={() => setShowCandPass(!showCandPass)}
              aria-label="Toggle password visibility"
            >
              {showCandPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="auth-input-group">
          <label>Confirm Password</label>
          <div className="auth-input-box">
            <img src="/landing/lock.svg" alt="Lock" className="input-icon" style={{ width: 16, height: 16 }} />
            <input
              type={showCandConfirmPass ? "text" : "password"}
              placeholder="Confirm password"
              value={candidateReg.confirmPassword}
              onChange={(e) => setCandidateReg({ ...candidateReg, confirmPassword: e.target.value })}
              className="auth-input"
              minLength={6}
              required
            />
            <button
              type="button"
              className="auth-pass-toggle"
              onClick={() => setShowCandConfirmPass(!showCandConfirmPass)}
              aria-label="Toggle confirm password visibility"
            >
              {showCandConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="auth-form-row auth-ref-captcha-row">
        <div className="auth-input-group">
          <label>Referral Code (Optional)</label>
          <div className="auth-input-box">
            <Sparkles size={16} className="input-icon" />
            <input
              type="text"
              placeholder="e.g. REF-12345"
              value={candidateReg.referralCode}
              onChange={(e) => setCandidateReg({ ...candidateReg, referralCode: e.target.value.toUpperCase() })}
              className="auth-input"
            />
          </div>
        </div>

        <div className="auth-captcha-col">
          <label>Verification</label>
          <div className={`auth-captcha-wrapper ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
            <ReCAPTCHA
              key={theme}
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              theme={theme === "light" ? "light" : "dark"}
              onChange={(token) => setCaptchaToken(token)}
            />
          </div>
        </div>
      </div>

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading ? "Sending verification code..." : "Create Account"}
      </button>

      <div className="auth-divider-line">
        <span>or continue with</span>
      </div>

      <button
        type="button"
        className="auth-google-btn-full"
        onClick={onGoogleLogin}
        disabled={loading}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
        </svg>
        <span>Continue with Google</span>
      </button>

      <div className="auth-switch-prompt">
        Already have an account?
        <button type="button" onClick={onSwitchToLogin}>
          Login
        </button>
      </div>
    </form>
  );
}
