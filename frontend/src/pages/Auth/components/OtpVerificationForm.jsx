import React, { useRef } from "react";
import { KeyRound } from "lucide-react";

export default function OtpVerificationForm({
  title = "Verify your email",
  subtitle = "Enter the 6-digit verification code sent to",
  email,
  otp,
  setOtp,
  loading,
  submitLabel = "Verify & Complete Signup",
  resendTimer,
  onSubmit,
  onResend,
  onBack,
  backLabel = "← Change details",
}) {
  const otpInputsRef = useRef([]);

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
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);
    const lastFilled = Math.min(pasted.length, 5);
    otpInputsRef.current[lastFilled]?.focus();
  };

  return (
    <form onSubmit={onSubmit} className="auth-otp-screen">
      <div className="otp-icon-wrap">
        <KeyRound size={26} />
      </div>
      <h2 className="auth-otp-title">{title}</h2>
      <p className="auth-otp-sub">
        {subtitle} <strong>{email}</strong>
      </p>

      <div className="otp-boxes">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (otpInputsRef.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(idx, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
            onPaste={handleOtpPaste}
            onFocus={(e) => e.target.select()}
            className={`otp-box${digit ? " otp-box--filled" : ""}`}
            autoComplete={idx === 0 ? "one-time-code" : "off"}
            required
            aria-label={`OTP Digit ${idx + 1}`}
          />
        ))}
      </div>

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading ? "Verifying code..." : submitLabel}
      </button>

      <div className="otp-resend-row">
        <button type="button" className="otp-back-link" onClick={onBack}>
          {backLabel}
        </button>
        <button
          type="button"
          className="otp-resend-btn"
          onClick={onResend}
          disabled={resendTimer > 0 || loading}
        >
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
        </button>
      </div>
    </form>
  );
}
