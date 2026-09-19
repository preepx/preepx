import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import API from "@/utils/api";
import notify from "@/utils/notify";
import { showAppError } from "@/utils/appAlert";
import { triggerAnnouncement } from "@/utils/announcement";
import { User, Briefcase, X } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import {
  AuthHero,
  LoginForm,
  RegisterCandidateForm,
  RegisterRecruiterForm,
  OtpVerificationForm,
  ForgotPasswordEmailForm,
  ForgotPasswordNewPassForm
} from "./components";
import "@/styles/ModernAuth.css";

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

function Auth({ defaultRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const currentTheme = isDark ? "dark" : "light";

  // Role: candidate | recruiter
  const queryRole = new URLSearchParams(location.search).get("role");
  const isRecruiterPath = location.pathname.includes("/recruiter");
  const initialRole = defaultRole || (isRecruiterPath || queryRole === "recruiter" ? "recruiter" : "candidate");
  const [activeRole, setActiveRole] = useState(initialRole);

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
    if (queryRole === "recruiter" || isRecruiterPath || defaultRole === "recruiter") {
      setActiveRole("recruiter");
    } else if (queryRole === "candidate" || defaultRole === "candidate") {
      setActiveRole("candidate");
    }
  }, [queryRole, isRecruiterPath, defaultRole]);

  // Server warm-up ping and param handlers
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "google_failed") {
      showAppError("Failed to authenticate with Google. Please try again.", "Google Sign-In Failed");
      navigate("/auth", { replace: true });
    }

    const refCode = params.get("ref");
    if (refCode) {
      setCandidateReg((prev) => ({ ...prev, referralCode: refCode }));
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
    setActiveRole(role);
    setScreen("login");
    resetOtp();
    const targetUrl = `/auth?role=${role}`;
    navigate(targetUrl, { replace: true });
  };

  const handleClose = () => {
    navigate("/");
  };

  const handleGoogleLogin = () => {
    const apiBase = API.defaults.baseURL;
    let url = `${apiBase.replace(/\/api$/, "")}/api/auth/google`;
    if (candidateReg.referralCode) {
      url += `?state=${candidateReg.referralCode}`;
    }
    window.location.href = url;
  };

  // ══════════════════════════════════════════════════════
  // CANDIDATE AUTH HANDLERS
  // ══════════════════════════════════════════════════════
  const handleCandidateLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/users/login", {
        email: loginData.email.trim().toLowerCase(),
        password: loginData.password,
      });
      if (!res.data || !res.data.token) {
        throw new Error("Invalid API response. Please check if VITE_API_URL is set correctly in production.");
      }
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
    if (recruiterReg.password.length < 6) {
      showAppError("Password must be at least 6 characters.", "Password too short");
      return;
    }
    if (recruiterReg.password !== recruiterReg.confirmPassword) {
      showAppError("Passwords do not match", "Error");
      return;
    }
    if (!captchaToken) {
      showAppError("Please complete the CAPTCHA to prove you are human.", "CAPTCHA Required");
      return;
    }
    setLoading(true);
    try {
      await API.post("/recruiter/send-otp", {
        ...recruiterReg,
        email: recruiterReg.email.trim().toLowerCase(),
        captchaToken,
      });
      setOtpEmail(recruiterReg.email.trim().toLowerCase());
      notify.success("OTP sent to your email!");
      resetOtp();
      setResendTimer(60);
      setScreen("reg-otp");
    } catch (err) {
      showAppError(err.response?.data?.message || "Registration failed", "Error");
    } finally {
      setLoading(false);
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken("");
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
        otp: otpValue,
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

  return (
    <>
      <div
        className="modern-auth-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div className="modern-auth-modal" onClick={(e) => e.stopPropagation()}>
          {/* Desktop Close Button */}
          <button
            className="modern-auth-close-btn desktop-only-close"
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* ── LEFT BRANDING PANEL (Desktop only) ── */}
<AuthHero
            onRecruiterClick={() => {
              if (typeof handleRoleChange === "function") handleRoleChange("recruiter");
              setShowRecruiterComingSoon(true);
            }}
            onClose={handleClose}
          />

          {/* ── RIGHT AUTH FORM CARD (Desktop & Mobile) ── */}
          <div className="modern-auth-right">
            {/* Mobile Header */}
            <div className="modern-auth-mobile-header">
              <a href="/" onClick={(e) => { e.preventDefault(); handleClose(); }} style={{ cursor: 'pointer' }}>
                <img src="/preepx_logo.png" alt="PreepX" className="modern-auth-mobile-logo" />
              </a>
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
                  onClick={() => {
                    setScreen("login");
                    resetOtp();
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`auth-mode-tab ${screen === "register" ? "active" : ""}`}
                  onClick={() => {
                    setScreen("register");
                    resetOtp();
                  }}
                >
                  Signup
                </button>
              </div>
            )}

            {/* SCREEN: LOGIN */}
            {screen === "login" && (
              <LoginForm
                loginData={loginData}
                setLoginData={setLoginData}
                showLoginPass={showLoginPass}
                setShowLoginPass={setShowLoginPass}
                loading={loading}
                onSubmit={activeRole === "recruiter" ? handleRecruiterLogin : handleCandidateLogin}
                onForgotPassword={() => {
                  setForgotEmail(loginData.email);
                  setScreen("forgot-email");
                }}
                onGoogleLogin={handleGoogleLogin}
                onSwitchToRegister={() => {
                  setScreen("register");
                  resetOtp();
                }}
              />
            )}

            {/* SCREEN: CANDIDATE REGISTER */}
            {screen === "register" && activeRole === "candidate" && (
              <RegisterCandidateForm
                candidateReg={candidateReg}
                setCandidateReg={setCandidateReg}
                showCandPass={showCandPass}
                setShowCandPass={setShowCandPass}
                showCandConfirmPass={showCandConfirmPass}
                setShowCandConfirmPass={setShowCandConfirmPass}
                recaptchaRef={recaptchaRef}
                setCaptchaToken={setCaptchaToken}
                theme={currentTheme}
                loading={loading}
                onSubmit={handleCandidateRegister}
                onGoogleLogin={handleGoogleLogin}
                onSwitchToLogin={() => {
                  setScreen("login");
                  resetOtp();
                }}
              />
            )}

            {/* SCREEN: RECRUITER REGISTER */}
            {screen === "register" && activeRole === "recruiter" && (
              <RegisterRecruiterForm
                recruiterReg={recruiterReg}
                setRecruiterReg={setRecruiterReg}
                showRecPass={showRecPass}
                setShowRecPass={setShowRecPass}
                showRecConfirmPass={showRecConfirmPass}
                setShowRecConfirmPass={setShowRecConfirmPass}
                recaptchaRef={recaptchaRef}
                setCaptchaToken={setCaptchaToken}
                theme={currentTheme}
                loading={loading}
                onSubmit={handleRecruiterRegister}
                onSwitchToLogin={() => {
                  setScreen("login");
                  resetOtp();
                }}
              />
            )}

            {/* SCREEN: REGISTRATION OTP */}
            {screen === "reg-otp" && (
              <OtpVerificationForm
                title="Verify your email"
                subtitle="Enter the 6-digit verification code sent to"
                email={otpEmail}
                otp={otp}
                setOtp={setOtp}
                loading={loading}
                submitLabel="Verify & Complete Signup"
                resendTimer={resendTimer}
                onSubmit={activeRole === "recruiter" ? handleVerifyRecruiterOtp : handleVerifyCandidateOtp}
                onResend={activeRole === "recruiter" ? handleRecruiterRegister : handleResendCandidateOtp}
                onBack={() => setScreen("register")}
                backLabel="← Change details"
              />
            )}

            {/* SCREEN: FORGOT PASSWORD (EMAIL) */}
            {screen === "forgot-email" && (
              <ForgotPasswordEmailForm
                forgotEmail={forgotEmail}
                setForgotEmail={setForgotEmail}
                activeRole={activeRole}
                recaptchaRef={recaptchaRef}
                setCaptchaToken={setCaptchaToken}
                theme={currentTheme}
                loading={loading}
                onSubmit={handleForgotEmailSubmit}
                onBackToLogin={() => {
                  setScreen("login");
                  resetOtp();
                }}
              />
            )}

            {/* SCREEN: FORGOT PASSWORD (OTP) */}
            {screen === "forgot-otp" && (
              <OtpVerificationForm
                title="Enter reset code"
                subtitle="Enter the 6-digit code sent to"
                email={otpEmail}
                otp={otp}
                setOtp={setOtp}
                loading={loading}
                submitLabel="Verify Code"
                resendTimer={resendTimer}
                onSubmit={handleVerifyResetOtp}
                onResend={handleForgotEmailSubmit}
                onBack={() => setScreen("forgot-email")}
                backLabel="← Change email"
              />
            )}

            {/* SCREEN: FORGOT PASSWORD (NEW PASSWORD) */}
            {screen === "forgot-newpass" && (
              <ForgotPasswordNewPassForm
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmNewPassword={confirmNewPassword}
                setConfirmNewPassword={setConfirmNewPassword}
                showNewPass={showNewPass}
                setShowNewPass={setShowNewPass}
                showConfirmNewPass={showConfirmNewPass}
                setShowConfirmNewPass={setShowConfirmNewPass}
                loading={loading}
                onSubmit={handleResetPassword}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Auth;
