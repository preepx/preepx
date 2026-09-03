import React from "react";
import { User, Mail, Building, Globe, Lock, Eye, EyeOff } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

export default function RegisterRecruiterForm({
  recruiterReg,
  setRecruiterReg,
  showRecPass,
  setShowRecPass,
  showRecConfirmPass,
  setShowRecConfirmPass,
  recaptchaRef,
  setCaptchaToken,
  theme = "dark",
  loading,
  onSubmit,
  onSwitchToLogin
}) {
  return (
    <form onSubmit={onSubmit} className="auth-form-wrap">
      <div className="auth-form-row">
        <div className="auth-input-group">
          <label>Full Name</label>
          <div className="auth-input-box">
            <User size={16} className="input-icon" />
            <input
              type="text"
              placeholder="e.g. Sarah Jenkins"
              value={recruiterReg.fullName}
              onChange={(e) => setRecruiterReg({ ...recruiterReg, fullName: e.target.value })}
              className="auth-input"
              required
            />
          </div>
        </div>

        <div className="auth-input-group">
          <label>Work Email</label>
          <div className="auth-input-box">
            <Mail size={16} className="input-icon" />
            <input
              type="email"
              placeholder="sarah@company.com"
              value={recruiterReg.email}
              onChange={(e) => setRecruiterReg({ ...recruiterReg, email: e.target.value })}
              className="auth-input"
              required
            />
          </div>
        </div>
      </div>

      <div className="auth-form-row">
        <div className="auth-input-group">
          <label>Company Name</label>
          <div className="auth-input-box">
            <Building size={16} className="input-icon" />
            <input
              type="text"
              placeholder="Acme Technologies"
              value={recruiterReg.companyName}
              onChange={(e) => setRecruiterReg({ ...recruiterReg, companyName: e.target.value })}
              className="auth-input"
              required
            />
          </div>
        </div>

        <div className="auth-input-group">
          <label>Company Website</label>
          <div className="auth-input-box">
            <Globe size={16} className="input-icon" />
            <input
              type="url"
              placeholder="https://company.com"
              value={recruiterReg.companyWebsite}
              onChange={(e) => setRecruiterReg({ ...recruiterReg, companyWebsite: e.target.value })}
              className="auth-input"
            />
          </div>
        </div>
      </div>

      <div className="auth-form-row">
        <div className="auth-input-group">
          <label>Password</label>
          <div className="auth-input-box">
            <Lock size={16} className="input-icon" />
            <input
              type={showRecPass ? "text" : "password"}
              placeholder="Min. 6 chars"
              value={recruiterReg.password}
              onChange={(e) => setRecruiterReg({ ...recruiterReg, password: e.target.value })}
              className="auth-input"
              minLength={6}
              required
            />
            <button
              type="button"
              className="auth-pass-toggle"
              onClick={() => setShowRecPass(!showRecPass)}
              aria-label="Toggle password visibility"
            >
              {showRecPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="auth-input-group">
          <label>Confirm Password</label>
          <div className="auth-input-box">
            <Lock size={16} className="input-icon" />
            <input
              type={showRecConfirmPass ? "text" : "password"}
              placeholder="Confirm password"
              value={recruiterReg.confirmPassword}
              onChange={(e) => setRecruiterReg({ ...recruiterReg, confirmPassword: e.target.value })}
              className="auth-input"
              minLength={6}
              required
            />
            <button
              type="button"
              className="auth-pass-toggle"
              onClick={() => setShowRecConfirmPass(!showRecConfirmPass)}
              aria-label="Toggle confirm password visibility"
            >
              {showRecConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="auth-form-row auth-recruiter-captcha-row">
        <div className="auth-captcha-col" style={{ width: "100%" }}>
          <label>Verification</label>
          <div className={`auth-captcha-wrapper auth-captcha-wrapper-full ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
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
        {loading ? "Sending verification code..." : "Create Recruiter Account"}
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
