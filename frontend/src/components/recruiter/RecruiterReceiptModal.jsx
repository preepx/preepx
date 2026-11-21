import React from "react";
import {
  X,
  Printer,
  CheckCircle,
  ShieldCheck,
  Building,
  CreditCard,
  Briefcase,
  Sparkles,
} from "lucide-react";
import "@/styles/SubscriptionReceiptModal.css";

export default function RecruiterReceiptModal({ isOpen, onClose, receipt }) {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateVal, includeTime = false) => {
    if (!dateVal) return "N/A";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    });
  };

  const planName = receipt.planName || "Starter";
  const planSlug = receipt.planSlug || "starter";
  const amount = Number(receipt.amountInr) || (planSlug === "growth" ? 3999 : 999);
  const duration = receipt.planDurationDays || 30;

  return (
    <div className="srm-overlay" onClick={onClose}>
      <div
        className="srm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recruiter-receipt-title"
      >
        {/* Controls */}
        <div className="srm-controls no-print">
          <button
            type="button"
            className="srm-btn-print"
            onClick={handlePrint}
            title="Download PDF / Print Receipt"
          >
            <Printer size={16} />
            <span>Download / Print PDF</span>
          </button>
          <button
            type="button"
            className="srm-btn-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable Paper */}
        <div className="srm-paper printable-receipt">
          {/* Header */}
          <div className="srm-header">
            <div className="srm-brand">
              <div className="srm-logo">
                <img
                  src="/preepx_logo_copy.png"
                  alt="PreepX"
                  style={{ height: "36px", width: "auto", objectFit: "contain", display: "block" }}
                />
              </div>
              <p className="srm-tagline">Recruiter &amp; Talent Acquisition Suite</p>
              <p className="srm-contact">contact@preepx.in · https://preepx.in</p>
            </div>

            <div className="srm-meta">
              <span className="srm-badge-paid">
                <CheckCircle size={13} />
                <span>PAID</span>
              </span>
              <div className="srm-receipt-id">
                <small>RECEIPT NO.</small>
                <strong>{receipt.receiptId}</strong>
              </div>
              <div className="srm-receipt-date">
                <small>PAYMENT DATE &amp; TIME</small>
                <span>{formatDate(receipt.purchaseDate || receipt.createdAt, true)} IST</span>
              </div>
            </div>
          </div>

          <div className="srm-divider" />

          {/* Recruiter & Payment Info */}
          <div className="srm-grid-2">
            <div className="srm-info-box">
              <span className="srm-box-label">BILLED TO (RECRUITER)</span>
              <h4 className="srm-box-val">{receipt.recruiterName || "Recruiter"}</h4>
              <p className="srm-box-sub">{receipt.recruiterEmail}</p>
              {receipt.companyName && (
                <p className="srm-box-sub" style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                  <Building size={12} color="#64748b" />
                  <strong>{receipt.companyName}</strong>
                </p>
              )}
              {receipt.recruiterPhone && (
                <p className="srm-box-sub">{receipt.recruiterPhone}</p>
              )}
            </div>

            <div className="srm-info-box">
              <span className="srm-box-label">PAYMENT METHOD</span>
              <h4 className="srm-box-val" style={{ color: "#2563eb" }}>
                {receipt.paymentMethod || "Razorpay Online"}
              </h4>
              {receipt.razorpayPaymentId && (
                <p className="srm-box-sub mono">
                  <strong>Payment ID:</strong> {receipt.razorpayPaymentId}
                </p>
              )}
              {receipt.razorpayOrderId && (
                <p className="srm-box-sub mono">
                  <strong>Order ID:</strong> {receipt.razorpayOrderId}
                </p>
              )}
            </div>
          </div>

          {/* Subscription Validity Section */}
          <div className="srm-plan-banner">
            <div className="srm-plan-header">
              <div className="srm-plan-title">
                <Briefcase size={20} color="#2563eb" />
                <div>
                  <h3 id="recruiter-receipt-title">{planName} Plan</h3>
                  <span>{duration} Days Monthly Recruiter Access</span>
                </div>
              </div>
              <span className="srm-status-pill active">
                <Sparkles size={13} /> Active Subscription
              </span>
            </div>

            <div className="srm-dates-row">
              <div>
                <small>ACTIVATION DATE</small>
                <strong>{formatDate(receipt.startDate)}</strong>
              </div>
              <div className="srm-arrow">&rarr;</div>
              <div>
                <small>EXPIRATION DATE</small>
                <strong>{formatDate(receipt.expiryDate)}</strong>
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="srm-breakdown-section">
            <span className="srm-box-label">PAYMENT BREAKDOWN</span>
            <table className="srm-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Description</th>
                  <th style={{ textAlign: "center" }}>Billing Cycle</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>PreepX {planName} Plan</strong>
                    <div className="srm-item-sub">
                      {planSlug === "growth"
                        ? "Up to 20 Job Posts/mo, Advanced AI Insights, Automated Candidate Screening, Priority Support."
                        : "Up to 5 Job Posts/mo, AI Candidate Scoring, Basic Hiring Pipeline, Email Support."}
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>{duration} Days (Monthly)</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>
                    ₹{amount.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr className="srm-row-online">
                  <td colSpan={2}>
                    <span className="srm-tag-blue">&#x1F4B3; Online Gateway Settlement (Razorpay)</span>
                  </td>
                  <td style={{ textAlign: "right", color: "#2563eb", fontWeight: 600 }}>
                    ₹{amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="srm-total-row">
                  <td colSpan={2} style={{ textAlign: "right" }}>
                    <strong>Total Paid:</strong>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <strong className="srm-final-amount">₹{amount.toLocaleString("en-IN")}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer */}
          <div className="srm-footer">
            <p>
              Thank you for partnering with PreepX. This receipt is computer-generated and confirms successful activation of your recruiter plan.
            </p>
            <p className="srm-support-text">
              For billing or invoice inquiries, email <a href="mailto:contact@preepx.in">contact@preepx.in</a> with Receipt No. <strong>{receipt.receiptId}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
