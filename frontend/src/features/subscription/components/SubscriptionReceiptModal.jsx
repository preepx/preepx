import React from "react";
import {
  X,
  Printer,
  Download,
  CheckCircle,
  ShieldCheck,
  Calendar,
  CreditCard,
  IndianRupee,
  Clock,
  Sparkles,
} from "lucide-react";
import "@/styles/SubscriptionReceiptModal.css";

export default function SubscriptionReceiptModal({
  isOpen,
  onClose,
  receipt,
}) {
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

  const isQueued = Boolean(receipt.isQueued);
  const originalPrice = Number(receipt.originalPrice || receipt.totalAmount) || 0;
  const walletUsed = Number(receipt.walletUsed) || 0;
  const onlinePaid = Number(receipt.onlineAmountPaid) || 0;
  const totalAmount = Number(receipt.totalAmount || originalPrice) || 0;

  return (
    <div className="srm-overlay" onClick={onClose}>
      <div
        className="srm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-title"
      >
        {/* Modal Controls (Hidden in Print) */}
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

        {/* Printable Receipt Paper */}
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
              <p className="srm-tagline">AI Mock Interviews &amp; Placement Prep</p>
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
                <small>DATE &amp; TIME</small>
                <span>{formatDate(receipt.purchaseDate || receipt.createdAt, true)} IST</span>
              </div>
            </div>
          </div>

          <div className="srm-divider" />

          {/* Customer & Payment Info */}
          <div className="srm-grid-2">
            <div className="srm-info-box">
              <span className="srm-box-label">BILLED TO (CUSTOMER)</span>
              <h4 className="srm-box-val">{receipt.customerName || "PreepX User"}</h4>
              <p className="srm-box-sub">{receipt.customerEmail}</p>
              {receipt.customerPhone && (
                <p className="srm-box-sub">{receipt.customerPhone}</p>
              )}
            </div>

            <div className="srm-info-box">
              <span className="srm-box-label">PAYMENT METHOD</span>
              <h4 className="srm-box-val" style={{ color: "#2563eb" }}>
                {receipt.paymentMethod || "Online"}
              </h4>
              {receipt.paymentId && (
                <p className="srm-box-sub mono">
                  <strong>Ref ID:</strong> {receipt.paymentId}
                </p>
              )}
              {receipt.orderId && (
                <p className="srm-box-sub mono">
                  <strong>Order ID:</strong> {receipt.orderId}
                </p>
              )}
            </div>
          </div>

          {/* Subscription Validity Section */}
          <div className="srm-plan-banner">
            <div className="srm-plan-header">
              <div className="srm-plan-title">
                <ShieldCheck size={20} color="#2563eb" />
                <div>
                  <h3>{receipt.planName}</h3>
                  <span>{receipt.planDurationDays} Days Unlimited Access</span>
                </div>
              </div>
              {isQueued ? (
                <span className="srm-status-pill queued">
                  <Clock size={13} /> Scheduled (Queued)
                </span>
              ) : (
                <span className="srm-status-pill active">
                  <Sparkles size={13} /> Active Subscription
                </span>
              )}
            </div>

            <div className="srm-dates-row">
              <div>
                <small>{isQueued ? "SCHEDULED ACTIVATION" : "START DATE"}</small>
                <strong>{formatDate(receipt.startDate || receipt.scheduledStartDate)}</strong>
              </div>
              <div className="srm-arrow">&rarr;</div>
              <div>
                <small>{isQueued ? "SCHEDULED EXPIRY" : "EXPIRY DATE"}</small>
                <strong>{formatDate(receipt.expiryDate || receipt.scheduledExpiryDate)}</strong>
              </div>
            </div>

            {isQueued && (
              <p className="srm-queue-note">
                &#x2139; This plan is queued and will activate automatically once your current plan expires. No days are lost!
              </p>
            )}
          </div>

          {/* Payment Breakdown Table (Important: Full Plan Value vs Actual Paid) */}
          <div className="srm-breakdown-section">
            <span className="srm-box-label">PAYMENT BREAKDOWN</span>
            <table className="srm-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Description</th>
                  <th style={{ textAlign: "center" }}>Duration</th>
                  <th style={{ textAlign: "right" }}>Plan Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>{receipt.planName}</strong>
                    <div className="srm-item-sub">
                      Unlimited AI Mock Interviews, Objective Exams with Certificates, ATS Resume Scans &amp; DSA prep.
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>{receipt.planDurationDays} Days</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>₹{originalPrice}</td>
                </tr>

                {/* Wallet Balance Deduction */}
                {walletUsed > 0 && (
                  <tr className="srm-row-discount">
                    <td colSpan={2}>
                      <span className="srm-tag-green">&#x2713; Wallet Balance Applied</span>
                    </td>
                    <td style={{ textAlign: "right", color: "#16a34a", fontWeight: 600 }}>
                      -₹{walletUsed}
                    </td>
                  </tr>
                )}

                {/* Online Payment */}
                {onlinePaid > 0 && (
                  <tr className="srm-row-online">
                    <td colSpan={2}>
                      <span className="srm-tag-blue">&#x1F4B3; Online Gateway Payment (Razorpay)</span>
                    </td>
                    <td style={{ textAlign: "right", color: "#2563eb", fontWeight: 600 }}>
                      ₹{onlinePaid}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="srm-total-row">
                  <td colSpan={2} style={{ textAlign: "right" }}>
                    <strong>Total Subscription Value:</strong>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <strong className="srm-final-amount">₹{totalAmount}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Note */}
          <div className="srm-footer">
            <p>
              Thank you for trusting PreepX. This receipt is computer-generated and confirms successful settlement for your subscription.
            </p>
            <p className="srm-support-text">
              For billing questions, please email <a href="mailto:contact@preepx.in">contact@preepx.in</a> with Receipt No. <strong>{receipt.receiptId}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
