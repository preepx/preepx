import React, { useState, useRef, useEffect } from "react";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { toast } from "react-toastify";
import { showAppError } from "../utils/appAlert";
import {
  Sparkles, Mail, Lock, User, Eye, EyeOff,
  ArrowRight, Shield, Zap, BarChart3, KeyRound, RefreshCw, CheckCircle,
} from "lucide-react";
import "./Login.css";

// ── Screens ──────────────────────────────────────────────
// "login" | "register" | "reg-otp" | "forgot-email" | "forgot-otp" | "forgot-newpass"
// ─────────────────────────────────────────────────────────

const EMPTY_REGISTER = { fullName: "", email: "", password: "", confirmPassword: "" };

function Auth() {
  const [screen, setScreen] = useState("login");
  const [loading, setLoading] = useState(false);

  // Login
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register
  const [registerData, setRegisterData] = useState(EMPTY_REGISTER);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Shared OTP state (register + forgot)
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpEmail, setOtpEmail] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const otpInputsRef = useRef([]);
  const timerRef = useRef(null);

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState(""); // OTP to pass to reset step

  const navigate = useNavigate();

  // Server warm-up ping — taaki register click pe delay na ho
  useEffect(() => {
    API.get("/users/platform-stats").catch(() => {});
  }, []);

  // Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);

  const resetOtp = () => setOtp(["", "", "", "", "", ""]);

  const goLogin = () => {
    setScreen("login");
    resetOtp();
    setShowLoginPass(false);
  };

  const goRegister = () => {
    setRegisterData({ ...EMPTY_REGISTER });
    setScreen("register");
    resetOtp();
  };

  // ── OTP input helpers ──────────────────────────────────
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1); // sirf ek digit lo
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

  // ── LOGIN ─────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/users/login", {
        email: loginData.email.trim().toLowerCase(),
        password: loginData.password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Welcome back!");
      navigate("/interview", { replace: true });
    } catch (error) {
      showAppError(
        error.response?.data?.message || "Something went wrong. Please try again.",
        "Sign in failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTER: Step 1 — Send OTP ───────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerData.password.length < 6) {
      showAppError("Password must be at least 6 characters.", "Password too short");
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      showAppError("Both password fields must match.", "Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const email = registerData.email.trim().toLowerCase();
      await API.post("/users/send-otp", {
        fullName: registerData.fullName,
        email,
        password: registerData.password,
      });
      setOtpEmail(email);
      resetOtp();
      setResendTimer(60);
      setScreen("reg-otp");
      toast.success(`Verification code sent to ${email}`);
    } catch (error) {
      showAppError(error.response?.data?.message || "Registration failed.", "Error");
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTER: Step 2 — Verify OTP ─────────────────────
  const handleVerifyRegOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      showAppError("Please enter the complete 6-digit code.", "Invalid code");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/users/verify-otp", { email: otpEmail, otp: otpValue });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setRegisterData({ ...EMPTY_REGISTER });
      resetOtp();
      toast.success("Account created! Welcome aboard!");
      navigate("/interview", { replace: true });
    } catch (error) {
      showAppError(error.response?.data?.message || "Invalid code. Try again.", "Verification failed");
      resetOtp();
      setTimeout(() => otpInputsRef.current[0]?.focus(), 0);
    } finally {
      setLoading(false);
    }
  };

  const handleResendRegOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await API.post("/users/send-otp", {
        fullName: registerData.fullName,
        email: otpEmail,
        password: registerData.password,
      });
      resetOtp();
      setResendTimer(60);
      toast.success("New code sent!");
      otpInputsRef.current[0]?.focus();
    } catch (error) {
      showAppError("Could not resend code. Please try again.", "Resend failed");
    } finally {
      setLoading(false);
    }
  };

  // ── FORGOT: Step 1 — Send reset OTP ───────────────────
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/users/forgot-password", {
        email: forgotEmail.trim().toLowerCase(),
      });
      setOtpEmail(forgotEmail.trim().toLowerCase());
      resetOtp();
      setResendTimer(60);
      setScreen("forgot-otp");
      toast.success(`Reset code sent to ${forgotEmail}`);
    } catch (error) {
      showAppError(error.response?.data?.message || "Email not found.", "Error");
    } finally {
      setLoading(false);
    }
  };

  // ── FORGOT: Step 2 — Verify reset OTP ─────────────────
  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      showAppError("Please enter the complete 6-digit code.", "Invalid code");
      return;
    }
    setLoading(true);
    try {
      await API.post("/users/verify-reset-otp", { email: otpEmail, otp: otpValue });
      setVerifiedOtp(otpValue);
      setNewPassword("");
      setConfirmNewPassword("");
      setScreen("forgot-newpass");
    } catch (error) {
      showAppError(error.response?.data?.message || "Invalid code. Try again.", "Verification failed");
      resetOtp();
      setTimeout(() => otpInputsRef.current[0]?.focus(), 0);
    } finally {
      setLoading(false);
    }
  };

  const handleResendResetOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await API.post("/users/forgot-password", { email: otpEmail });
      resetOtp();
      setResendTimer(60);
      toast.success("New reset code sent!");
      otpInputsRef.current[0]?.focus();
    } catch (error) {
      showAppError("Could not resend code. Please try again.", "Resend failed");
    } finally {
      setLoading(false);
    }
  };

  // ── FORGOT: Step 3 — Set new password ─────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showAppError("Password must be at least 6 characters.", "Too short");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showAppError("Both password fields must match.", "Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await API.post("/users/reset-password", {
        email: otpEmail,
        otp: verifiedOtp,
        newPassword,
      });
      toast.success("Password reset! Please sign in.");
      setForgotEmail("");
      setNewPassword("");
      setConfirmNewPassword("");
      resetOtp();
      setScreen("login");
    } catch (error) {
      showAppError(error.response?.data?.message || "Reset failed. Please try again.", "Error");
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

  // ── Left panel content based on screen ────────────────
  const isForgotFlow = screen.startsWith("forgot");

  return (
    <div className="auth-page">
      <aside className="auth-left">
        <div className="auth-left-glow auth-left-glow--1" />
        <div className="auth-left-glow auth-left-glow--2" />
        <div className="auth-left-content">
          <div className="auth-logo">
            <div className="auth-logo-icon"><Sparkles size={18} /></div>
            <span>CrackTogether</span>
          </div>
          <h1>Master your interviews with AI</h1>
          <p>Practice realistic mock interviews, get instant feedback, and track your progress — all powered by cutting-edge AI.</p>
          <div className="auth-features">
            <div className="auth-feature-card"><Zap size={18} /><span>AI-generated role-specific questions</span></div>
            <div className="auth-feature-card"><BarChart3 size={18} /><span>Detailed scoring & analytics</span></div>
            <div className="auth-feature-card"><Shield size={18} /><span>Secure & private practice sessions</span></div>
          </div>
          <div className="auth-stats">
            <div><strong>70+</strong><span>Users</span></div>
            <div><strong>24/7</strong><span>AI Ready</span></div>
            <div><strong>95%</strong><span>Satisfaction</span></div>
          </div>
        </div>
      </aside>

      <div className="auth-right">
        <div className="auth-right-bg" />
        <div className="auth-card">

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
                <h2>Welcome back</h2>
                <p className="auth-subtitle">Sign in to continue your interview journey</p>
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
                      onFocus={(e) => e.target.removeAttribute("readOnly")}
                      readOnly
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
                      onFocus={(e) => e.target.removeAttribute("readOnly")}
                      readOnly
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
                <h2>Create your account</h2>
                <p className="auth-subtitle">Email verified registration (min. 6 char password)</p>
              </div>
              <form onSubmit={handleRegisterSubmit} className="auth-form" autoComplete="off">
                <div className="input-field">
                  <label htmlFor="reg-fullName">Full Name</label>
                  <div className="input-group">
                    <User size={18} className="input-icon" />
                    <input id="reg-fullName" type="text" placeholder=""
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                      autoComplete="off" required />
                  </div>
                </div>
                <div className="input-field">
                  <label htmlFor="reg-email">Email Address</label>
                  <div className="input-group">
                    <Mail size={18} className="input-icon" />
                    <input id="reg-email" type="email" placeholder=""
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      autoComplete="off" required />
                  </div>
                </div>
                <div className="input-field">
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
                <div className="input-field">
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
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <span className="auth-submit-loading">Please wait...</span> : <>Create Account <ArrowRight size={18} /></>}
                </button>
              </form>
            </>
          )}

          {/* ══════════════════════════════════════
              SCREEN: REGISTER OTP
          ══════════════════════════════════════ */}
          {screen === "reg-otp" && (
            <>
              <div className="auth-card-header">
                <div className="otp-icon-wrap"><KeyRound size={28} /></div>
                <h2>Verify your email</h2>
                <p className="auth-subtitle">We sent a 6-digit code to <strong>{otpEmail}</strong></p>
              </div>
              <form onSubmit={handleVerifyRegOtp} className="auth-form" autoComplete="off">
                {renderOtpBoxes()}
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <span className="auth-submit-loading">Verifying...</span> : <>Verify & Create Account <ArrowRight size={18} /></>}
                </button>
                <div className="otp-resend">
                  <button type="button" className="otp-resend-btn" onClick={handleResendRegOtp} disabled={resendTimer > 0 || loading}>
                    <RefreshCw size={14} />
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                  </button>
                  <button type="button" className="otp-back-btn" onClick={() => setScreen("register")}>
                    ← Change details
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
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <span className="auth-submit-loading">Sending...</span> : <>Send Reset Code <ArrowRight size={18} /></>}
                </button>
                <div className="otp-resend">
                  <button type="button" className="otp-back-btn" onClick={goLogin}>
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
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <span className="auth-submit-loading">Verifying...</span> : <>Verify Code <ArrowRight size={18} /></>}
                </button>
                <div className="otp-resend">
                  <button type="button" className="otp-resend-btn" onClick={handleResendResetOtp} disabled={resendTimer > 0 || loading}>
                    <RefreshCw size={14} />
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                  </button>
                  <button type="button" className="otp-back-btn" onClick={() => setScreen("forgot-email")}>
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
                      className="input-with-toggle"
                      autoComplete="new-password" minLength={6} required
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowNewPass(!showNewPass)}>
                      {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="input-field">
                  <label htmlFor="confirm-new-password">Confirm New Password</label>
                  <div className="input-group">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="confirm-new-password"
                      type={showConfirmNewPass ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="input-with-toggle"
                      autoComplete="new-password" minLength={6} required
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowConfirmNewPass(!showConfirmNewPass)}>
                      {showConfirmNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
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

export default Auth;
