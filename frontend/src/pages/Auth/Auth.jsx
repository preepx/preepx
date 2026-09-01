import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import API from "@/utils/api";
import notify from "@/utils/notify";
import { showAppError } from "@/utils/appAlert";
import { triggerAnnouncement } from "@/utils/announcement";
import {
  Mail, Lock, User, Eye, EyeOff,
  ArrowRight, Shield, Sparkles, KeyRound, CheckCircle,
  Building, Globe, X, ArrowLeft, BarChart3, Briefcase,
  // Wrench, Clock, Bell
} from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import RecruiterComingSoonModal from "@/components/landing/RecruiterComingSoonModal";
import "@/styles/ModernAuth.css";

// ─────────────────────────────────────────────────────────
// 🔧 MAINTENANCE MODE — Set to false / commented out
// ─────────────────────────────────────────────────────────
// const MAINTENANCE_MODE = true;

const EMPTY_CANDIDATE_REG = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  referralCode: ""
};


const EMPTY_RECRUITER_REG = {
  fullName: "",
  email: "",
  companyName: "",
  companyWebsite: "",
  password: "",
  confirmPassword: ""
};

// ─────────────────────────────────────────────────────────
// Maintenance Modal Component (Commented out)
// ─────────────────────────────────────────────────────────
// function MaintenanceModal({ onClose }) {
//   return (
//     <div className="maint-overlay" onClick={onClose}>
//       <div className="maint-modal" onClick={(e) => e.stopPropagation()}>
//         <button className="maint-close" onClick={onClose} aria-label="Close">
//           <X size={16} />
//         </button>
// 
//         {/* Logo */}
//         <img src="/preepx_logo.png" alt="PreepX" className="maint-logo" />
// 
//         {/* Wrench badge */}
//         <div className="maint-badge">
//           <Wrench size={11} className="maint-wrench" />
//           Scheduled Maintenance
//         </div>
// 
//         <h2 className="maint-title">
//           We'll be back on
//           <span className="maint-date"> September 1<sup>st</sup></span>
//         </h2>
// 
//         <p className="maint-desc">
//           Our servers are undergoing maintenance for a faster experience.
//           Everything will be fully live on <strong>1st September 2026</strong>.
//         </p>
// 
//         <div className="maint-info-row">
//           <div className="maint-info-card">
//             <Clock size={14} />
//             <span>Back Online</span>
//             <strong>Sept 1, 2026</strong>
//           </div>
//           <div className="maint-info-card">
//             <Bell size={14} />
//             <span>Status</span>
//             <strong>In Progress</strong>
//           </div>
//         </div>
// 
//         <button className="maint-ok-btn" onClick={onClose}>
//           Got it! 💜
//         </button>
//       </div>
//     </div>
//   );
// }

function Auth({ defaultRole }) {
  const navigate = useNavigate();
  const location = useLocation();

  // const [showMaintenance, setShowMaintenance] = useState(false);

  // Role: candidate | recruiter
  const queryRole = new URLSearchParams(location.search).get("role");
  const isRecruiterPath = location.pathname.includes("/recruiter");
  const initialRole = defaultRole || (isRecruiterPath || queryRole === "recruiter" ? "recruiter" : "candidate");
  const [activeRole, setActiveRole] = useState(initialRole);
  const [showRecruiterComingSoon, setShowRecruiterComingSoon] = useState(false);

  // Screen: "login" | "register" | "reg-otp" | "forgot-email" | "forgot-otp" | "forgot-newpass"
  const [screen, setScreen] = useState("login");
  const [loading, setLoading] = useState(false);

  // Login Form State
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Candidate Register State
  const [candidateReg, setCandidateReg] = useState(EMPTY_CANDIDATE_REG);
  const [showCandPass, setShowCandPass] = useState(false);
  const [showCandConfirmPass, setShowCandConfirmPass] = useState(false);

  // Recruiter Register State
  const [recruiterReg, setRecruiterReg] = useState(EMPTY_RECRUITER_REG);
  const [showRecPass, setShowRecPass] = useState(false);
  const [showRecConfirmPass, setShowRecConfirmPass] = useState(false);

  // OTP State (Shared)
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpEmail, setOtpEmail] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const otpInputsRef = useRef([]);
  const timerRef = useRef(null);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);

  // ReCAPTCHA
  const [captchaToken, setCaptchaToken] = useState("");
  const recaptchaRef = useRef(null);

  // Sync role state from props/query
  useEffect(() => {
    if (queryRole === "recruiter" || isRecruiterPath) {
      setShowRecruiterComingSoon(true);
    } else if (queryRole === "candidate") {
      setActiveRole("candidate");
    }
  }, [queryRole, isRecruiterPath]);

  // Server warm-up ping and param handlers
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "google_failed") {
      showAppError("Failed to authenticate with Google. Please try again.", "Google Sign-In Failed");
      navigate("/auth", { replace: true });
    }

    const refCode = params.get("ref");
    if (refCode) {
      setCandidateReg(prev => ({ ...prev, referralCode: refCode }));
      setScreen("register");
    }
  }, [navigate]);

  // Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);

  const resetOtp = () => setOtp(["", "", "", "", "", ""]);

  const handleRoleChange = (role) => {
    if (role === "recruiter") {
      setShowRecruiterComingSoon(true);
      return;
    }
    setActiveRole(role);
    setScreen("login");
    resetOtp();
    const targetUrl = "/auth?role=candidate";
    navigate(targetUrl, { replace: true });
  };

  const handleClose = () => {
    navigate("/");
  };

  const handleGoogleLogin = () => {
    // if (MAINTENANCE_MODE) { setShowMaintenance(true); return; }
    const apiBase = API.defaults.baseURL;
    let url = `${apiBase.replace(/\/api$/, "")}/api/auth/google`;
    if (candidateReg.referralCode) {
      url += `?state=${candidateReg.referralCode}`;
    }
    window.location.href = url;
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

  // ══════════════════════════════════════════════════════
  // CANDIDATE AUTH HANDLERS
  // ══════════════════════════════════════════════════════
  const handleCandidateLogin = async (e) => {
    e.preventDefault();
    // if (MAINTENANCE_MODE) { setShowMaintenance(true); return; }
    setLoading(true);
    try {
      const res = await API.post("/users/login", {
        email: loginData.email.trim().toLowerCase(),
        password: loginData.password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      triggerAnnouncement();
      notify.success("Welcome back!");
      navigate("/user-dashboard", { replace: true });
    } catch (error) {
      showAppError(error.response?.data?.message || "Something went wrong. Please try again.", "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateRegister = async (e) => {
    e.preventDefault();
    // if (MAINTENANCE_MODE) { setShowMaintenance(true); return; }
    if (candidateReg.password.length < 6) {
      showAppError("Password must be at least 6 characters.", "Password too short");
      return;
    }
    if (candidateReg.password !== candidateReg.confirmPassword) {
      showAppError("Both password fields must match.", "Passwords don't match");
      return;
    }
    if (!captchaToken) {
      showAppError("Please complete the CAPTCHA to prove you are human.", "CAPTCHA Required");
      return;
    }
    setLoading(true);
    try {
      const email = candidateReg.email.trim().toLowerCase();
      await API.post("/users/send-otp", {
        fullName: candidateReg.fullName,
        email,
        password: candidateReg.password,
        referralCode: candidateReg.referralCode,
        captchaToken,
      });
      setOtpEmail(email);
      resetOtp();
      setResendTimer(60);
      setScreen("reg-otp");
      notify.success(`Verification code sent to ${email}`);
    } catch (error) {
      showAppError(error.response?.data?.message || "Registration failed.", "Error");
    } finally {
      setLoading(false);
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken("");
    }
  };

  const handleVerifyCandidateOtp = async (e) => {
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
      setCandidateReg({ ...EMPTY_CANDIDATE_REG });
      resetOtp();
      triggerAnnouncement();
      notify.success("Account created! Welcome aboard!");
      navigate("/user-dashboard", { replace: true });
    } catch (error) {
      showAppError(error.response?.data?.message || "Invalid code. Try again.", "Verification failed");
      resetOtp();
      setTimeout(() => otpInputsRef.current[0]?.focus(), 0);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCandidateOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await API.post("/users/send-otp", {
        fullName: candidateReg.fullName,
        email: otpEmail,
        password: candidateReg.password,
      });
      resetOtp();
      setResendTimer(60);
      notify.success("New code sent!");
      otpInputsRef.current[0]?.focus();
    } catch (error) {
      showAppError("Could not resend code. Please try again.", "Resend failed");
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════
  // RECRUITER AUTH HANDLERS
  // ══════════════════════════════════════════════════════
  const handleRecruiterLogin = async (e) => {
    e.preventDefault();
    // if (MAINTENANCE_MODE) { setShowMaintenance(true); return; }
    setLoading(true);
    try {
      const { data } = await API.post("/recruiter/login", {
        email: loginData.email.trim().toLowerCase(),
        password: loginData.password,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("user-updated"));
      notify.success("Logged in successfully!");
      navigate("/recruiter-dashboard", { replace: true });
    } catch (err) {
      showAppError(err.response?.data?.message || "Login failed", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleRecruiterRegister = async (e) => {
    e.preventDefault();
    // if (MAINTENANCE_MODE) { setShowMaintenance(true); return; }
    if (recruiterReg.password !== recruiterReg.confirmPassword) {
      showAppError("Passwords do not match", "Error");
      return;
    }
    setLoading(true);
    try {
      await API.post("/recruiter/send-otp", recruiterReg);
      setOtpEmail(recruiterReg.email.trim().toLowerCase());
      notify.success("OTP sent to your email!");
      resetOtp();
      setResendTimer(60);
      setScreen("reg-otp");
    } catch (err) {
      showAppError(err.response?.data?.message || "Registration failed", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRecruiterOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      showAppError("Please enter the complete 6-digit code.", "Error");
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post("/recruiter/register", {
        email: otpEmail,
        otp: otpValue
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("user-updated"));
      notify.success("Account created successfully!");
      navigate("/recruiter-dashboard", { replace: true });
    } catch (err) {
      showAppError(err.response?.data?.message || "Verification failed", "Error");
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════
  // FORGOT PASSWORD HANDLERS
  // ══════════════════════════════════════════════════════
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    if (activeRole === "candidate" && !captchaToken) {
      showAppError("Please complete the CAPTCHA to prove you are human.", "CAPTCHA Required");
      return;
    }
    setLoading(true);
    try {
      const endpoint = activeRole === "recruiter" ? "/recruiter/forgot-password" : "/users/forgot-password";
      await API.post(endpoint, {
        email: forgotEmail.trim().toLowerCase(),
        captchaToken,
      });
      setOtpEmail(forgotEmail.trim().toLowerCase());
      resetOtp();
      setResendTimer(60);
      setScreen("forgot-otp");
      notify.success(`Reset code sent to ${forgotEmail}`);
    } catch (error) {
      showAppError(error.response?.data?.message || "Email not found.", "Error");
    } finally {
      setLoading(false);
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken("");
    }
  };

  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      showAppError("Please enter the complete 6-digit code.", "Invalid code");
      return;
    }
    setLoading(true);
    try {
      if (activeRole === "candidate") {
        await API.post("/users/verify-reset-otp", { email: otpEmail, otp: otpValue });
      }
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
      const endpoint = activeRole === "recruiter" ? "/recruiter/reset-password" : "/users/reset-password";
      await API.post(endpoint, {
        email: otpEmail,
        otp: verifiedOtp,
        newPassword,
      });
      notify.success("Password reset successfully! Please sign in.");
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

  // OTP Boxes JSX
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

  return (
    <>
    {/* {showMaintenance && <MaintenanceModal onClose={() => setShowMaintenance(false)} />} */}
    <div className="modern-auth-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="modern-auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Desktop Close Button */}
        <button className="modern-auth-close-btn desktop-only-close" onClick={handleClose} aria-label="Close">
          <X size={16} />
        </button>

        {/* ── LEFT BRANDING PANEL (Desktop only) ── */}
        <aside className="modern-auth-left">
          <div className="auth-radar-ring" />
          <div className="auth-radar-ring-2" />

          <div className="modern-auth-left-top">
            <Link to="/" style={{ display: "inline-block" }}>
              <img src="/preepx_logo.png" alt="PreepX" className="auth-brand-logo" />
            </Link>

            <h1 className="auth-brand-title">
              Prepare.<br />Prove.<br />
              <span className="gradient-text-purple">Get Hired.</span>
            </h1>

            <p className="auth-brand-desc">
              AI-powered platform to help candidates prepare better and help recruiters hire the right talent faster.
            </p>
          </div>

          <div className="modern-auth-left-bottom">
            <div className="auth-value-props">
              <div className="auth-prop-card">
                <div className="auth-prop-icon candidate-icon">
                  <BarChart3 size={17} />
                </div>
                <div className="auth-prop-info">
                  <h4>For Candidates</h4>
                  <p>Practice smart. Get confident. Crack every interview.</p>
                </div>
              </div>

              <div
                className="auth-prop-card"
                style={{ cursor: "pointer" }}
                onClick={() => setShowRecruiterComingSoon(true)}
              >
                <div className="auth-prop-icon recruiter-icon">
                  <Briefcase size={17} />
                </div>
                <div className="auth-prop-info">
                  <h4>For Recruiters</h4>
                  <p>Find top talent faster. Hire with confidence.</p>
                </div>
              </div>
            </div>

            <div className="auth-trust-footer">
              <Shield size={15} />
              <span>Trusted by thousands of candidates & recruiters</span>
            </div>
          </div>
        </aside>

        {/* ── RIGHT AUTH FORM CARD (Desktop & Mobile) ── */}
        <div className="modern-auth-right">
          {/* Mobile Header */}
          <div className="modern-auth-mobile-header">
            <Link to="/">
              <img src="/preepx_logo.png" alt="PreepX" className="modern-auth-mobile-logo" />
            </Link>
            <button className="modern-auth-close-btn" onClick={handleClose} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          {/* Role Switcher Pill */}
          <div className="auth-role-switcher">
            <button
              type="button"
              className={`auth-role-btn ${activeRole === "candidate" ? "active" : ""}`}
              onClick={() => handleRoleChange("candidate")}
            >
              <User size={15} />
              <span>Candidate</span>
            </button>
            <button
              type="button"
              className={`auth-role-btn ${activeRole === "recruiter" ? "active" : ""}`}
              onClick={() => handleRoleChange("recruiter")}
            >
              <Briefcase size={15} />
              <span>Recruiter</span>
            </button>
          </div>

          {/* Mode Tabs (Login / Signup) */}
          {(screen === "login" || screen === "register") && (
            <div className="auth-mode-tabs">
              <button
                type="button"
                className={`auth-mode-tab ${screen === "login" ? "active" : ""}`}
                onClick={() => { setScreen("login"); resetOtp(); }}
              >
                Login
              </button>
              <button
                type="button"
                className={`auth-mode-tab ${screen === "register" ? "active" : ""}`}
                onClick={() => { setScreen("register"); resetOtp(); }}
              >
                Signup
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════
              SCREEN: LOGIN (Candidate & Recruiter)
          ══════════════════════════════════════════ */}
          {screen === "login" && (
            <form onSubmit={activeRole === "recruiter" ? handleRecruiterLogin : handleCandidateLogin} className="auth-form-wrap">
              <div className="auth-input-group">
                <label>Email ID</label>
                <div className="auth-input-box">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="auth-input"
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Password</label>
                <div className="auth-input-box">
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showLoginPass ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="auth-input"
                    required
                  />
                  <button
                    type="button"
                    className="auth-pass-toggle"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                  >
                    {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="auth-forgot-row">
                <button
                  type="button"
                  className="auth-forgot-btn"
                  onClick={() => { setForgotEmail(loginData.email); setScreen("forgot-email"); }}
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
                onClick={handleGoogleLogin}
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
                <button type="button" onClick={() => { setScreen("register"); resetOtp(); }}>
                  Signup
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════
              SCREEN: CANDIDATE REGISTER
          ══════════════════════════════════════════ */}
          {screen === "register" && activeRole === "candidate" && (
            <form onSubmit={handleCandidateRegister} className="auth-form-wrap">
              <div className="auth-form-row">
                <div className="auth-input-group">
                  <label>Full Name</label>
                  <div className="auth-input-box">
                    <User size={16} className="input-icon" />
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
                    <Mail size={16} className="input-icon" />
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
                    <Lock size={16} className="input-icon" />
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
                    >
                      {showCandPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Confirm Password</label>
                  <div className="auth-input-box">
                    <Lock size={16} className="input-icon" />
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
                  <div className="auth-captcha-wrapper">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "YOUR_RECAPTCHA_SITE_KEY"}
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
                onClick={handleGoogleLogin}
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
                <button type="button" onClick={() => { setScreen("login"); resetOtp(); }}>
                  Login
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════
              SCREEN: RECRUITER REGISTER
          ══════════════════════════════════════════ */}
          {screen === "register" && activeRole === "recruiter" && (
            <form onSubmit={handleRecruiterRegister} className="auth-form-wrap">
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
                    >
                      {showRecConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Sending verification code..." : "Create Recruiter Account"}
              </button>

              <div className="auth-switch-prompt">
                Already have an account?
                <button type="button" onClick={() => { setScreen("login"); resetOtp(); }}>
                  Login
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════
              SCREEN: REGISTRATION OTP VERIFICATION
          ══════════════════════════════════════════ */}
          {screen === "reg-otp" && (
            <form onSubmit={activeRole === "recruiter" ? handleVerifyRecruiterOtp : handleVerifyCandidateOtp} className="auth-otp-screen">
              <div className="otp-icon-wrap">
                <KeyRound size={26} />
              </div>
              <h2 className="auth-otp-title">Verify your email</h2>
              <p className="auth-otp-sub">
                Enter the 6-digit verification code sent to <strong>{otpEmail}</strong>
              </p>

              {renderOtpBoxes()}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Verifying code..." : "Verify & Complete Signup"}
              </button>

              <div className="otp-resend-row">
                <button type="button" className="otp-back-link" onClick={() => setScreen("register")}>
                  ← Change details
                </button>
                <button
                  type="button"
                  className="otp-resend-btn"
                  onClick={activeRole === "recruiter" ? handleRecruiterRegister : handleResendCandidateOtp}
                  disabled={resendTimer > 0 || loading}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════
              SCREEN: FORGOT PASSWORD (STEP 1 - EMAIL)
          ══════════════════════════════════════════ */}
          {screen === "forgot-email" && (
            <form onSubmit={handleForgotEmailSubmit} className="auth-form-wrap">
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
                    ref={recaptchaRef}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "YOUR_RECAPTCHA_SITE_KEY"}
                    onChange={(token) => setCaptchaToken(token)}
                  />
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Sending reset code..." : "Send Reset Code"}
              </button>

              <div className="auth-switch-prompt">
                Remember your password?
                <button type="button" onClick={() => { setScreen("login"); resetOtp(); }}>
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════
              SCREEN: FORGOT PASSWORD (STEP 2 - OTP)
          ══════════════════════════════════════════ */}
          {screen === "forgot-otp" && (
            <form onSubmit={handleVerifyResetOtp} className="auth-otp-screen">
              <div className="otp-icon-wrap">
                <KeyRound size={26} />
              </div>
              <h2 className="auth-otp-title">Enter reset code</h2>
              <p className="auth-otp-sub">
                Enter the 6-digit code sent to <strong>{otpEmail}</strong>
              </p>

              {renderOtpBoxes()}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <div className="otp-resend-row">
                <button type="button" className="otp-back-link" onClick={() => setScreen("forgot-email")}>
                  ← Change email
                </button>
                <button
                  type="button"
                  className="otp-resend-btn"
                  onClick={handleForgotEmailSubmit}
                  disabled={resendTimer > 0 || loading}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════
              SCREEN: FORGOT PASSWORD (STEP 3 - NEW PASS)
          ══════════════════════════════════════════ */}
          {screen === "forgot-newpass" && (
            <form onSubmit={handleResetPassword} className="auth-form-wrap">
              <div className="auth-otp-screen">
                <div className="otp-icon-wrap" style={{ background: "rgba(16, 185, 129, 0.15)", borderColor: "rgba(16, 185, 129, 0.35)", color: "#34d399" }}>
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
                  >
                    {showConfirmNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Updating password..." : "Reset Password & Login"}
              </button>
            </form>
          )}
        </div>
      </div>

      {showRecruiterComingSoon && (
        <RecruiterComingSoonModal
          isOpen={showRecruiterComingSoon}
          onClose={() => setShowRecruiterComingSoon(false)}
        />
      )}
    </div>
    </>
  );
}

export default Auth;
