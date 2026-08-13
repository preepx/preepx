import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Sparkles, Mail, Lock, User, Eye, EyeOff,
  ArrowRight, Shield, Zap, BarChart3, KeyRound, RefreshCw, CheckCircle, Phone, Building, Globe
} from "lucide-react";
import API from "../utils/api";
import notify from '../utils/notify';
import "./Login.css";

// ── Screens ──────────────────────────────────────────────
// "login" | "register"
// ─────────────────────────────────────────────────────────

const EMPTY_REGISTER = { fullName: "", email: "", companyName: "", companyWebsite: "", password: "", confirmPassword: "" };

function RecruiterAuth() {
  const [screen, setScreen] = useState("login");
  const [loading, setLoading] = useState(false);
  const [realtimeUsers, setRealtimeUsers] = useState(70);

  // Login
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register
  const [registerData, setRegisterData] = useState(EMPTY_REGISTER);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);

  const otpInputsRef = useRef([]);

  const navigate = useNavigate();

  const goLogin = () => {
    setScreen("login");
    setShowLoginPass(false);
  };

  const goRegister = () => {
    setRegisterData({ ...EMPTY_REGISTER });
    setScreen("register");
  };

  const resetOtp = () => {
    setOtp(["", "", "", "", "", ""]);
  };

  // ── OTP input helpers ──────────────────────────────────
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) {
      setTimeout(() => otpInputsRef.current[index + 1]?.focus(), 0);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];
      if (newOtp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpInputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i];
    setOtp(newOtp);
    const focusIndex = Math.min(pasted.length, 5);
    setTimeout(() => otpInputsRef.current[focusIndex]?.focus(), 0);
  };

  // ── FORGOT HANDLERS ──────────────────────────────────
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/recruiter/forgot-password", { email: forgotEmail });
      notify.success("Password reset OTP sent to your email!");
      setOtpEmail(forgotEmail.trim().toLowerCase());
      resetOtp();
      setScreen("forgot-otp");
    } catch (err) {
      notify.error(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOtp = (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      notify.error("Please enter the complete 6-digit code.");
      return;
    }
    setVerifiedOtp(otpValue);
    setNewPassword("");
    setConfirmNewPassword("");
    setScreen("forgot-newpass");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      notify.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      notify.error("Both password fields must match.");
      return;
    }
    
    setLoading(true);
    try {
      await API.post("/recruiter/reset-password", { 
        email: otpEmail, 
        otp: verifiedOtp, 
        newPassword 
      });
      notify.success("Password reset successfully! You can now sign in.");
      setForgotEmail("");
      setNewPassword("");
      setConfirmNewPassword("");
      resetOtp();
      setScreen("login");
    } catch (err) {
      notify.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Boxes (shared component) ──────────────────────
  const renderOtpBoxes = () => (
    <div className="otp-boxes">
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (otpInputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleOtpChange(i, e.target.value)}
          onKeyDown={(e) => handleOtpKeyDown(i, e)}
          onPaste={handleOtpPaste}
          onFocus={(e) => e.target.select()}
          className={`otp-box${digit ? " otp-box--filled" : ""}`}
          autoComplete={i === 0 ? "one-time-code" : "off"}
        />
      ))}
    </div>
  );

  // ── LOGIN ─────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/recruiter/login", loginData);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("user-updated"));
      notify.success("Logged in successfully!");
      navigate("/recruiter-dashboard");
    } catch (err) {
      notify.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTER ───────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      notify.error("Passwords do not match");
      return;
    }
    
    setLoading(true);
    try {
      await API.post("/recruiter/send-otp", registerData);
      notify.success("OTP sent to your email!");
      resetOtp();
      setScreen("register-otp");
    } catch (err) {
      notify.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegisterOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      notify.error("Please enter the complete 6-digit code.");
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await API.post("/recruiter/register", {
        email: registerData.email,
        otp: otpValue
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("user-updated"));
      notify.success("Account created successfully!");
      navigate("/recruiter-dashboard");
    } catch (err) {
      notify.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-page">
      <aside className="auth-left">
        <div className="auth-left-glow auth-left-glow--1" />
        <div className="auth-left-glow auth-left-glow--2" />
        <div className="auth-left-content">
          <Link to="/" className="auth-logo" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <img src="/preepx_logo.png" alt="PreepX" style={{ height: "72px", objectFit: "contain", margin: "-16px 0 -12px -12px" }} />
          </Link>
          <h1>Find the best talent with AI</h1>
          <p>Streamline your hiring process, conduct AI-driven initial screenings, and discover top candidates faster.</p>
          <div className="auth-features">
            <div className="auth-feature-card"><Zap size={18} /><span>Automated AI Screenings</span></div>
            <div className="auth-feature-card"><BarChart3 size={18} /><span>Detailed Candidate Analytics</span></div>
            <div className="auth-feature-card"><Shield size={18} /><span>Secure & private assessments</span></div>
          </div>
          <div className="auth-stats">
            <div><strong>10k+</strong><span>Candidates</span></div>
            <div><strong>24/7</strong><span>Screening</span></div>
            <div><strong>Top</strong><span>Talent</span></div>
          </div>
        </div>
      </aside>

      <div className="auth-right">
        <div className="auth-right-bg" />
        <div className="auth-card" style={{ maxWidth: screen === 'register' ? '600px' : undefined, transition: 'max-width 0.3s ease' }}>

          {/* ── Tabs (only on login/register) ── */}
          {(screen === "login" || screen === "register") && (
            <div className="auth-tabs">
              <button type="button" className={`auth-tab ${screen === "login" ? "active" : ""}`} onClick={goLogin}>
                Sign In
              </button>
              <button type="button" className={`auth-tab ${screen === "register" ? "active" : ""}`} onClick={goRegister}>
                Register
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════
              SCREEN: LOGIN
          ══════════════════════════════════════ */}
          {screen === "login" && (
            <>
              <div className="auth-card-header">
                <h2>Recruiter Login</h2>
                <p className="auth-subtitle">Sign in to manage your candidates</p>
              </div>
              <form onSubmit={handleLoginSubmit} className="auth-form" autoComplete="on">
                <div className="input-field">
                  <label htmlFor="login-email">Email Address</label>
                  <div className="input-group">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="login-email" type="email" name="login-email"
                      placeholder=""
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
                <div className="input-field">
                  <div className="input-field-row">
                    <label htmlFor="login-password">Password</label>
                    <button type="button" className="forgot-link" onClick={() => { setForgotEmail(loginData.email); setScreen("forgot-email"); }}>
                      Forgot password?
                    </button>
                  </div>
                  <div className="input-group">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="login-password"
                      type={showLoginPass ? "text" : "password"}
                      name="login-password"
                      placeholder=""
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="input-with-toggle"
                      autoComplete="new-password"
                      required
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowLoginPass(!showLoginPass)} aria-label="Toggle password">
                      {showLoginPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <span className="auth-submit-loading">Please wait...</span> : <>Sign In <ArrowRight size={18} /></>}
                </button>
              </form>
            </>
          )}

          {/* ══════════════════════════════════════
              SCREEN: REGISTER
          ══════════════════════════════════════ */}
          {screen === "register" && (
            <>
              <div className="auth-card-header">
                <h2>Create Recruiter Account</h2>
                <p className="auth-subtitle">Join us to find top talent</p>
              </div>
              <form onSubmit={handleRegisterSubmit} className="auth-form" autoComplete="off">
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div className="input-field" style={{ flex: '1 1 200px' }}>
                    <label htmlFor="reg-fullName">Name</label>
                    <div className="input-group">
                      <User size={18} className="input-icon" />
                      <input id="reg-fullName" type="text" placeholder=""
                        value={registerData.fullName}
                        onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                        autoComplete="off" required />
                    </div>
                  </div>
                  <div className="input-field" style={{ flex: '1 1 200px' }}>
                    <label htmlFor="reg-email">Email Address</label>
                    <div className="input-group">
                      <Mail size={18} className="input-icon" />
                      <input id="reg-email" type="email" placeholder=""
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        autoComplete="off" required />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div className="input-field" style={{ flex: '1 1 200px' }}>
                    <label htmlFor="reg-companyName">Company Name</label>
                    <div className="input-group">
                      <Building size={18} className="input-icon" />
                      <input id="reg-companyName" type="text" placeholder=""
                        value={registerData.companyName}
                        onChange={(e) => setRegisterData({ ...registerData, companyName: e.target.value })}
                        autoComplete="off" required />
                    </div>
                  </div>
                  <div className="input-field" style={{ flex: '1 1 200px' }}>
                    <label htmlFor="reg-companyWebsite">Company Website</label>
                    <div className="input-group">
                      <Globe size={18} className="input-icon" />
                      <input id="reg-companyWebsite" type="url" placeholder=""
                        value={registerData.companyWebsite}
                        onChange={(e) => setRegisterData({ ...registerData, companyWebsite: e.target.value })}
                        autoComplete="off" />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div className="input-field" style={{ flex: '1 1 200px' }}>
                    <label htmlFor="reg-password">Password</label>
                    <div className="input-group">
                      <Lock size={18} className="input-icon" />
                      <input id="reg-password" type={showRegPass ? "text" : "password"}
                        placeholder=""
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="input-with-toggle" autoComplete="new-password" minLength={6} required />
                      <button type="button" className="password-toggle" onClick={() => setShowRegPass(!showRegPass)}>
                        {showRegPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="input-field" style={{ flex: '1 1 200px' }}>
                    <label htmlFor="reg-confirm">Confirm Password</label>
                    <div className="input-group">
                      <Lock size={18} className="input-icon" />
                      <input id="reg-confirm" type={showConfirmPass ? "text" : "password"}
                        placeholder=""
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        className="input-with-toggle" autoComplete="new-password" minLength={6} required />
                      <button type="button" className="password-toggle" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                        {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" className="auth-submit" disabled={loading} style={{ marginTop: '20px' }}>
                  {loading ? <span className="auth-submit-loading">Please wait...</span> : <>Create Account <ArrowRight size={18} /></>}
                </button>
              </form>
            </>
          )}

          {/* ══════════════════════════════════════
              SCREEN: REGISTER OTP
          ══════════════════════════════════════ */}
          {screen === "register-otp" && (
            <>
              <div className="auth-card-header">
                <div className="otp-icon-wrap"><Mail size={28} /></div>
                <h2>Verify your email</h2>
                <p className="auth-subtitle">We sent a 6-digit code to <strong>{registerData.email}</strong></p>
              </div>
              <form onSubmit={handleVerifyRegisterOtp} className="auth-form">
                {renderOtpBoxes()}
                <button type="submit" className="auth-submit otp-submit" disabled={loading}>
                  {loading ? <span className="auth-submit-loading">Verifying...</span> : <>Complete Registration <CheckCircle size={18} /></>}
                </button>
                <div className="otp-resend">
                  <button type="button" className="otp-back-btn" onClick={goRegister}>
                    ← Back
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ══════════════════════════════════════
              SCREEN: FORGOT — Step 1 (Email)
          ══════════════════════════════════════ */}
          {screen === "forgot-email" && (
            <>
              <div className="auth-card-header">
                <div className="otp-icon-wrap forgot"><Lock size={28} /></div>
                <h2>Reset your password</h2>
                <p className="auth-subtitle">Enter your registered email — we'll send you a reset code.</p>
              </div>
              <form onSubmit={handleForgotEmailSubmit} className="auth-form" autoComplete="off">
                <div className="input-field">
                  <label htmlFor="forgot-email">Email Address</label>
                  <div className="input-group">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="forgot-email" type="email" placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      autoComplete="off" required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit" disabled={loading} style={{ marginTop: '20px' }}>
                  {loading ? <span className="auth-submit-loading">Sending...</span> : <>Send Reset Code <ArrowRight size={18} /></>}
                </button>
                <div className="otp-resend" style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                  <button type="button" className="otp-back-btn" onClick={goLogin} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 500 }}>
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ══════════════════════════════════════
              SCREEN: FORGOT — Step 2 (OTP)
          ══════════════════════════════════════ */}
          {screen === "forgot-otp" && (
            <>
              <div className="auth-card-header">
                <div className="otp-icon-wrap forgot"><KeyRound size={28} /></div>
                <h2>Enter reset code</h2>
                <p className="auth-subtitle">We sent a 6-digit code to <strong>{otpEmail}</strong></p>
              </div>
              <form onSubmit={handleVerifyResetOtp} className="auth-form" autoComplete="off">
                {renderOtpBoxes()}
                <button type="submit" className="auth-submit" disabled={loading} style={{ marginTop: '20px' }}>
                  {loading ? <span className="auth-submit-loading">Verifying...</span> : <>Verify Code <ArrowRight size={18} /></>}
                </button>
                <div className="otp-resend" style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                  <button type="button" className="otp-back-btn" onClick={() => setScreen("forgot-email")} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 500 }}>
                    ← Change email
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ══════════════════════════════════════
              SCREEN: FORGOT — Step 3 (New Password)
          ══════════════════════════════════════ */}
          {screen === "forgot-newpass" && (
            <>
              <div className="auth-card-header">
                <div className="otp-icon-wrap success"><CheckCircle size={28} /></div>
                <h2>Set new password</h2>
                <p className="auth-subtitle">Code verified! Choose a strong new password.</p>
              </div>
              <form onSubmit={handleResetPassword} className="auth-form" autoComplete="off">
                <div className="input-field">
                  <label htmlFor="new-password">New Password</label>
                  <div className="input-group">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="new-password"
                      type={showNewPass ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-with-toggle" autoComplete="new-password" minLength={6} required
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowNewPass(!showNewPass)}>
                      {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="input-field">
                  <label htmlFor="confirm-new-password">Confirm Password</label>
                  <div className="input-group">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="confirm-new-password"
                      type={showConfirmNewPass ? "text" : "password"}
                      placeholder="Match new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="input-with-toggle" autoComplete="new-password" minLength={6} required
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowConfirmNewPass(!showConfirmNewPass)}>
                      {showConfirmNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="auth-submit" disabled={loading} style={{ marginTop: '20px' }}>
                  {loading ? <span className="auth-submit-loading">Resetting...</span> : <>Reset Password <ArrowRight size={18} /></>}
                </button>
              </form>
            </>
          )}

          <p className="auth-secure">
            <Shield size={14} />
            Your data is encrypted and never shared
          </p>
        </div>
      </div>
    </div>
  );
}

export default RecruiterAuth;
