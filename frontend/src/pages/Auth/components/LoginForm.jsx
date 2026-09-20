import React from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginForm({
  loginData,
  setLoginData,
  showLoginPass,
  setShowLoginPass,
  loginError,
  setLoginError,
  loading,
  onSubmit,
  onForgotPassword,
  onGoogleLogin,
  onSwitchToRegister,
}) {
  return (
    <form onSubmit={onSubmit} className="auth-form-wrap">
      <div className="auth-input-group">
        <label>Email ID</label>
        <div className="auth-input-box">
          <img src="/landing/email.svg" alt="Email" className="input-icon" style={{ width: 16, height: 16 }} />
          <input
            type="email"
            placeholder="Enter your email"
            value={loginData.email}
            onChange={(e) => {
              setLoginData({ ...loginData, email: e.target.value });
              if (loginError) setLoginError("");
            }}
            className="auth-input"
            required
          />
        </div>
      </div>

      <div className="auth-input-group">
        <label>Password</label>
        <div className={`auth-input-box ${loginError ? "has-error" : ""}`}>
          <img src="/landing/lock.svg" alt="Lock" className="input-icon" style={{ width: 16, height: 16 }} />
          <input
            type={showLoginPass ? "text" : "password"}
            placeholder="Enter your password"
            value={loginData.password}
            onChange={(e) => {
              setLoginData({ ...loginData, password: e.target.value });
              if (loginError) setLoginError("");
            }}
            className="auth-input"
            required
          />
          <button
            type="button"
            className="auth-pass-toggle"
            onClick={() => setShowLoginPass(!showLoginPass)}
            aria-label="Toggle password visibility"
          >
            {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '-2px', minHeight: '18px' }}>
        <div style={{ flex: 1, paddingRight: '8px' }}>
          {loginError && (
            <div className="auth-inline-error" style={{ marginTop: 0 }}>
              <AlertCircle size={14} fill="#ef4444" color="#fff" style={{ flexShrink: 0 }} />
              <span>{loginError}</span>
            </div>
          )}
        </div>
        <button
          type="button"
          className="auth-forgot-btn"
          onClick={onForgotPassword}
        >
          Forgot password?
        </button>
      </div>

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading ? "Signing in..." : "Login"}
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
        Don't have an account?
        <button type="button" onClick={onSwitchToRegister}>
          Signup
        </button>
      </div>
    </form>
  );
}
