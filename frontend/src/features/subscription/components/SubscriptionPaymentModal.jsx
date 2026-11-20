import React, { useState, useEffect } from "react";
import {
  X,
  Shield,
  IndianRupee,
  CheckCircle2,
  Sparkles,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Calendar,
  Zap,
} from "lucide-react";
import notify from "@/utils/notify";
import {
  createSubscriptionOrder,
  verifySubscriptionPayment,
  subscribeWithWallet,
} from "../services/subscriptionAPI";
import "@/styles/SubscriptionPaymentModal.css";

export default function SubscriptionPaymentModal({
  isOpen,
  onClose,
  plan,
  walletBalance = 0,
  currentSub = null,
  onSuccess,
}) {
  const [useWallet, setUseWallet] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const numWalletBalance = Math.max(0, Number(walletBalance) || 0);
  const planPrice = Number(plan?.offerPrice) || 0;

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      setUseWallet(numWalletBalance > 0);
      setProcessing(false);
      setErrorMsg("");
    }
  }, [isOpen, plan?.id, numWalletBalance]);

  if (!isOpen || !plan) return null;

  // Calculations
  const walletDeduction = useWallet ? Math.min(numWalletBalance, planPrice) : 0;
  const remainingPayable = Math.max(0, planPrice - walletDeduction);
  const isFullWalletPayment = remainingPayable === 0 && walletDeduction > 0;
  const walletRemainingAfter = useWallet
    ? Math.max(0, numWalletBalance - walletDeduction)
    : numWalletBalance;

  // Check if current subscription is active to inform the user about queuing
  const isCurrentActive =
    currentSub?.status === "active" &&
    currentSub?.expiresAt &&
    new Date(currentSub.expiresAt) > new Date();

  // Handle Complete Subscription
  const handleProceed = async () => {
    setErrorMsg("");
    setProcessing(true);

    try {
      // ═════════════════════════════════════════════════════════════════════
      // 100% Wallet Balance Payment (No Gateway Needed)
      // ═════════════════════════════════════════════════════════════════════
      if (isFullWalletPayment) {
        const result = await subscribeWithWallet(plan.id);

        // Reset caches and notify all listeners
        localStorage.removeItem("wallet_data");
        localStorage.removeItem("subscription_data");
        window.dispatchEvent(new Event("walletUpdated"));
        window.dispatchEvent(new Event("wallet-updated"));
        window.dispatchEvent(new Event("subscriptionUpdated"));

        notify.success(
          result.message ||
            (result.subscription?.isQueued
              ? `🎉 ${plan.name} plan queued using ₹${walletDeduction} wallet balance!`
              : `🎉 ${plan.name} plan activated using ₹${walletDeduction} wallet balance!`)
        );

        onSuccess?.(result);
        onClose();
        return;
      }

      // ═════════════════════════════════════════════════════════════════════
      // Partial Wallet + Razorpay OR 100% Razorpay Gateway
      // ═════════════════════════════════════════════════════════════════════
      const orderData = await createSubscriptionOrder(plan.id, useWallet);

      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_TIldjHmH0HwMPb",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "PreepX Pro Access",
        description:
          walletDeduction > 0
            ? `${plan.name} (₹${walletDeduction} Wallet + ₹${remainingPayable} Online)`
            : `${plan.name} Subscription`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyData = await verifySubscriptionPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
              useWallet,
            });

            // Reset caches and notify all listeners
            localStorage.removeItem("wallet_data");
            localStorage.removeItem("subscription_data");
            window.dispatchEvent(new Event("walletUpdated"));
            window.dispatchEvent(new Event("wallet-updated"));
            window.dispatchEvent(new Event("subscriptionUpdated"));

            notify.success(verifyData.message || `🎉 ${plan.name} plan activated!`);
            onSuccess?.(verifyData);
            onClose();
          } catch (verErr) {
            const msg =
              verErr.response?.data?.message ||
              "Payment verification failed. Please contact support.";
            setErrorMsg(msg);
            notify.error(msg);
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
        prefill: {
          name: user.fullName || user.name || "PreepX Candidate",
          email: user.email || "",
          contact: user.phone || "",
        },
        theme: {
          color: plan.color || "#4f46e5",
        },
      };

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK is not loaded. Please refresh the page.");
      }

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on("payment.failed", function (failResp) {
        setProcessing(false);
        const errMsg =
          failResp?.error?.description || "Payment failed. Please try again.";
        setErrorMsg(errMsg);
        notify.error(errMsg);
      });

      rzpInstance.open();
    } catch (err) {
      setProcessing(false);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to initiate subscription payment.";
      setErrorMsg(errMsg);
      notify.error(errMsg);
    }
  };

  return (
    <div
      className="sub-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !processing) {
          onClose();
        }
      }}
    >
      <div
        className="sub-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sub-modal-title"
      >
        {/* Compact Header */}
        <div className="sub-modal-header">
          <div className="sub-modal-header-left">
            <div className="sub-modal-icon-badge">
              <Shield size={18} />
            </div>
            <div>
              <h3 id="sub-modal-title" className="sub-modal-title">
                Confirm Subscription
              </h3>
              <p className="sub-modal-subtitle">
                Review plan details and wallet balance redemption
              </p>
            </div>
          </div>
          <button
            type="button"
            className="sub-modal-close-btn"
            onClick={onClose}
            disabled={processing}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="sub-modal-error-alert">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Landscape Two-Column Main Content */}
        <div className="sub-modal-main-grid">
          {/* ════ LEFT SECTION ════ */}
          <div className="sub-modal-left-col">
            <div className="sub-modal-plan-card">
              <div className="sub-modal-plan-top">
                <div className="sub-modal-plan-name-wrap">
                  {plan.badge && (
                    <span className="sub-modal-plan-badge">
                      <Sparkles size={10} /> {plan.badge}
                    </span>
                  )}
                  <h4 className="sub-modal-plan-name">{plan.name} Pro Plan</h4>
                  <span className="sub-modal-plan-tagline">
                    {plan.label} • {plan.days} Days Full Access
                  </span>
                </div>
                <div className="sub-modal-plan-pricing">
                  <p className="sub-modal-plan-offer">₹{plan.offerPrice}</p>
                  {plan.realPrice && plan.realPrice > plan.offerPrice && (
                    <span className="sub-modal-plan-real">₹{plan.realPrice}</span>
                  )}
                  {plan.saving && plan.saving > 0 && (
                    <span className="sub-modal-plan-saving">Save ₹{plan.saving}</span>
                  )}
                </div>
              </div>

              {/* Compact Benefits 2x2 Grid */}
              <div className="sub-modal-features-grid">
                <div className="sub-modal-feature-item">
                  <CheckCircle2 size={13} color="#10b981" />
                  <span>Unlimited AI Interviews</span>
                </div>
                <div className="sub-modal-feature-item">
                  <CheckCircle2 size={13} color="#10b981" />
                  <span>Unlimited Objective Exams</span>
                </div>
                <div className="sub-modal-feature-item">
                  <CheckCircle2 size={13} color="#10b981" />
                  <span>Unlimited ATS Scans</span>
                </div>
                <div className="sub-modal-feature-item">
                  <CheckCircle2 size={13} color="#10b981" />
                  <span>Verified Certificates</span>
                </div>
              </div>

              {/* Informative Queue Notice if Current Plan is Running */}
              {isCurrentActive && (
                <div className="sub-modal-queue-notice">
                  <Calendar size={13} color="#0284c7" />
                  <span>
                    Current {currentSub.planName} is active till{" "}
                    <strong>
                      {new Date(currentSub.expiresAt).toLocaleDateString("en-IN")}
                    </strong>
                    . This plan will queue &amp; start automatically right after.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ════ RIGHT SECTION ════ */}
          <div className="sub-modal-right-col">
            {/* Wallet Balance & Checkbox Card */}
            <div
              className={`sub-modal-wallet-card ${
                numWalletBalance <= 0 ? "disabled" : ""
              }`}
            >
              <div className="sub-modal-wallet-header">
                <div className="sub-modal-wallet-info">
                  <div className="sub-modal-wallet-icon-circle">
                    <IndianRupee size={14} strokeWidth={2.8} />
                  </div>
                  <div>
                    <p className="sub-modal-wallet-title">PreepX Wallet</p>
                    <span className="sub-modal-wallet-balance-val">
                      ₹{numWalletBalance} Available
                    </span>
                  </div>
                </div>

                {useWallet && walletDeduction > 0 && (
                  <span className="sub-modal-wallet-applied-badge">
                    -₹{walletDeduction} applied
                  </span>
                )}
              </div>

              {/* Use Wallet Balance Checkbox */}
              <label
                className={`sub-modal-checkbox-row ${
                  numWalletBalance <= 0 || processing ? "disabled" : ""
                }`}
              >
                <input
                  type="checkbox"
                  className="sub-modal-checkbox-input"
                  checked={useWallet && numWalletBalance > 0}
                  disabled={numWalletBalance <= 0 || processing}
                  onChange={(e) => setUseWallet(e.target.checked)}
                />
                <div className="sub-modal-checkbox-text-wrap">
                  <div className="sub-modal-checkbox-label">
                    Use Wallet Balance (₹{numWalletBalance} available)
                  </div>
                  <div className="sub-modal-checkbox-sub">
                    {numWalletBalance <= 0
                      ? "No wallet balance available"
                      : useWallet
                      ? `₹${walletDeduction} applied • ₹${walletRemainingAfter} left in wallet`
                      : "Check to deduct wallet balance"}
                  </div>
                </div>
              </label>
            </div>

            {/* Payment Breakdown Card */}
            <div className="sub-modal-breakdown-card">
              <h5 className="sub-modal-breakdown-title">Payment Breakdown</h5>

              <div className="sub-modal-breakdown-row">
                <span>Plan Amount:</span>
                <span>₹{planPrice}</span>
              </div>

              {useWallet && walletDeduction > 0 && (
                <div className="sub-modal-breakdown-row discount">
                  <span>Wallet Balance Applied:</span>
                  <span>-₹{walletDeduction}</span>
                </div>
              )}

              <div className="sub-modal-divider" />

              <div className="sub-modal-breakdown-total">
                <span>Remaining Amount to Pay:</span>
                <span
                  className={`sub-modal-total-amount ${
                    remainingPayable === 0 ? "free" : ""
                  }`}
                >
                  ₹{remainingPayable}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ════ BOTTOM SECTION ════ */}
        <div className="sub-modal-footer">
          <div className="sub-modal-footer-left">
            <button
              type="button"
              className="sub-modal-cancel-btn"
              onClick={onClose}
              disabled={processing}
            >
              Cancel
            </button>
            <div className="sub-modal-security-note">
              <Lock size={11} color="#10b981" />
              <span>100% Secure Checkout</span>
            </div>
          </div>

          <button
            type="button"
            className={`sub-modal-submit-btn ${
              isFullWalletPayment ? "wallet-btn" : "gateway-btn"
            }`}
            onClick={handleProceed}
            disabled={processing}
          >
            {processing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>
                  {isFullWalletPayment ? "Activating..." : "Processing..."}
                </span>
              </>
            ) : isFullWalletPayment ? (
              <>
                <Sparkles size={16} />
                <span>Confirm &amp; Pay ₹{walletDeduction} with Wallet</span>
              </>
            ) : (
              <>
                <Lock size={14} />
                <span>Pay ₹{remainingPayable} &amp; Subscribe</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
