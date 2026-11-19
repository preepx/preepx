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
  activeRole,
  onSubmit,
  onForgotPassword,
  onGoogleLogin,
  onLinkedInLogin,
  onGithubLogin,
  onSwitchToRegister,
}) {
  return (
    <form onSubmit={onSubmit} className="auth-form-wrap">
      <div className="auth-input-group">
        <label>Email ID</label>
        <div className="auth-input-box">
          <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="input-icon">
            <path d="M32.3916 6.77502H7.60832C6.50325 6.77502 5.44344 7.21401 4.66204 7.99541C3.88064 8.77681 3.44165 9.83662 3.44165 10.9417V29.0584C3.44165 30.1634 3.88064 31.2232 4.66204 32.0046C5.44344 32.786 6.50325 33.225 7.60832 33.225H32.3916C33.4967 33.225 34.5565 32.786 35.3379 32.0046C36.1193 31.2232 36.5583 30.1634 36.5583 29.0584V10.9417C36.5583 9.83662 36.1193 8.77681 35.3379 7.99541C34.5565 7.21401 33.4967 6.77502 32.3916 6.77502ZM7.60832 8.44169H32.3916C33.0224 8.44027 33.63 8.67891 34.0912 9.10916C34.5524 9.53941 34.8327 10.129 34.875 10.7584C30.7583 12.9584 26.625 15.1417 22.4916 17.3417C21.9334 17.6937 21.3416 17.9896 20.725 18.225C20.2415 18.3208 19.7432 18.3123 19.2632 18.2002C18.7833 18.0881 18.3327 17.875 17.9417 17.575C15.575 16.325 13.2083 15.0584 10.8583 13.8084C8.95832 12.8084 7.02498 11.7917 5.12498 10.775C5.16324 10.1427 5.44168 9.54898 5.90331 9.11523C6.36494 8.68148 6.97488 8.44053 7.60832 8.44169ZM34.8916 29.0584C34.8916 29.7214 34.6283 30.3573 34.1594 30.8261C33.6906 31.295 33.0547 31.5584 32.3916 31.5584H7.60832C6.94528 31.5584 6.30939 31.295 5.84055 30.8261C5.37171 30.3573 5.10832 29.7214 5.10832 29.0584V12.6667C9.04165 14.7334 12.9583 16.8334 16.8916 18.9167C17.5942 19.3479 18.3508 19.6842 19.1417 19.9167C20.299 20.1052 21.4852 19.862 22.475 19.2334C24.8916 17.9667 27.2917 16.6834 29.7083 15.4167C31.4417 14.4834 33.1583 13.5834 34.8916 12.6667V29.0584Z" fill="black" stroke="black" strokeWidth="1" />
          </svg>
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

      {activeRole !== "recruiter" && (
        <>
          <div className="auth-divider-line">
            <span>or continue with</span>
          </div>

          <div className="auth-social-btns-row">
            <button
              type="button"
              className="auth-social-btn auth-google-btn"
              onClick={onGoogleLogin}
              disabled={loading}
              title="Continue with Google"
              aria-label="Continue with Google"
            >
              <svg viewBox="1 1 22 22" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              className="auth-social-btn auth-linkedin-btn"
              onClick={onLinkedInLogin}
              disabled={loading}
              title="Continue with LinkedIn"
              aria-label="Continue with LinkedIn"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="4.5" fill="#0A66C2" />
                <path d="M6.9 19.5V9.5H3.8v10h3.1zM5.35 8.2c1.08 0 1.75-.72 1.75-1.62-.02-.92-.67-1.62-1.73-1.62s-1.75.7-1.75 1.62c0 .9.67 1.62 1.71 1.62h.02zM19.8 19.5v-5.6c0-2.88-1.54-4.22-3.59-4.22-1.65 0-2.39.91-2.8 1.55V9.5h-3.1c.04.88 0 10 0 10h3.1v-5.6c0-.3.02-.6.11-.82.25-.6.8-1.23 1.72-1.23 1.21 0 1.7.92 1.7 2.28v5.37h3.1z" fill="#FFFFFF" />
              </svg>
              <span>LinkedIn</span>
            </button>

            <button
              type="button"
              className="auth-social-btn auth-github-btn"
              onClick={onGithubLogin}
              disabled={loading}
              title="Continue with GitHub"
              aria-label="Continue with GitHub"
            >
              <svg viewBox="2 2 20 20" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>GitHub</span>
            </button>
          </div>
        </>
      )}

      <div className="auth-switch-prompt">
        Don't have an account?
        <button type="button" onClick={onSwitchToRegister}>
          Signup
        </button>
      </div>
    </form>
  );
}
