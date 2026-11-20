import React, { useState } from "react";
import { CheckCircle, ShieldCheck, Zap, IndianRupee, Calendar, ArrowRight, FileText } from "lucide-react";
import notify from "@/utils/notify";
import { SUBSCRIPTION_PLANS } from "../constants/subscriptionConfig";
import SubscriptionPaymentModal from "./SubscriptionPaymentModal";
import "@/styles/CoinPackages.css";

function PlanCards({
  plans = SUBSCRIPTION_PLANS,
  onPurchaseSuccess,
  currentSub,
  walletBalance = 0,
  onViewReceipt,
}) {
  const [activePlan, setActivePlan] = useState(plans.find((p) => p.popular)?.id || plans[0]?.id);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleOpenPaymentModal = (plan) => {
    setSelectedPlanForModal(plan);
    setShowPaymentModal(true);
  };

  return (
    <div className="coin-packages">
      <div className="coin-packages-header">
        <h3>Choose Your Pro Plan</h3>
        <p>Unlock unlimited mock interviews, objective exams, and ATS resume scoring.</p>
      </div>

      {currentSub?.status === "active" && (
        <div
          className="coin-packages-notice"
          style={{
            background: "rgba(16, 185, 129, 0.1)",
            color: "#047857",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: "flex-start",
            padding: "14px 18px",
            borderRadius: "10px",
            marginTop: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "260px" }}>
              <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "13px", fontWeight: "600", lineHeight: "1.4" }}>
                Active Plan: <strong>{currentSub.planName}</strong> (Valid till{" "}
                {currentSub.expiresAt ? new Date(currentSub.expiresAt).toLocaleDateString("en-IN") : "now"}).
                New plan purchases are queued sequentially and activate automatically without losing any days!
              </span>
            </div>

            {onViewReceipt && (
              <button
                type="button"
                onClick={() => onViewReceipt(currentSub?.receiptId)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#ffffff",
                  color: "#047857",
                  border: "1px solid #a7f3d0",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  transition: "all 0.2s ease",
                }}
              >
                <FileText size={13} />
                <span>View Current Receipt</span>
              </button>
            )}
          </div>

          {Array.isArray(currentSub?.queuedSubscriptions) && currentSub.queuedSubscriptions.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px", paddingLeft: "28px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#065f46" }}>Next in Queue:</span>
              {currentSub.queuedSubscriptions.map((q, idx) => (
                <span
                  key={idx}
                  onClick={() => q.receiptId && onViewReceipt?.(q.receiptId)}
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    background: "#ffffff",
                    color: "#0284c7",
                    border: "1px solid #bae6fd",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    cursor: q.receiptId ? "pointer" : "default",
                  }}
                  title={q.receiptId ? "Click to view receipt" : ""}
                >
                  📅 {q.planName} (Activates {new Date(q.scheduledStartDate).toLocaleDateString("en-IN")})
                  {q.receiptId && <span style={{ opacity: 0.7, fontSize: "10px" }}>🧾</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="coin-packages-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`coin-pack ${activePlan === plan.id ? "popular" : ""}`}
            onClick={() => setActivePlan(plan.id)}
            style={{ 
              cursor: "pointer", 
              borderColor: activePlan === plan.id ? "#f59e0b" : "var(--border)",
              boxShadow: activePlan === plan.id ? `0 8px 24px -8px rgba(245, 158, 11, 0.4)` : "0 4px 12px rgba(0,0,0,0.05)",
              background: activePlan === plan.id ? "#fffbeb" : "var(--surface)",
              color: "var(--text)",
              borderRadius: '8px',
              padding: "20px",
              transition: "all 0.3s ease"
            }}
          >
            {plan.badge && (
              <span className="coin-pack-tag" style={{ background: activePlan === plan.id ? "#f59e0b" : plan.color }}>
                {plan.badge}
              </span>
            )}
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%", marginBottom: "16px" }}>
               <div>
                  <p className="coin-pack-label" style={{ color: "var(--text)", fontSize: "1.1rem", fontWeight: "800", marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px", textTransform: "uppercase" }}>
                    <img src="/7day.svg" alt="Plan Icon" style={{ width: 28, height: 28, objectFit: "contain" }} /> {plan.name}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "700", paddingLeft: "36px" }}>{plan.label}</p>
               </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "16px 0", justifyContent: "center" }}>
              <p className="coin-pack-price" style={{ margin: 0, fontSize: "1.6rem", fontWeight: "800", color: "var(--text)", display: "flex", alignItems: "center" }}>
                ₹{plan.offerPrice}
              </p>
              <p style={{ textDecoration: "line-through", color: "var(--text-muted)", fontSize: "1rem", fontWeight: "600", marginTop: "4px" }}>
                ₹{plan.realPrice}
              </p>
            </div>

            <button
              className="coin-pack-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenPaymentModal(plan);
              }}
              style={{ 
                background: activePlan === plan.id ? "#f59e0b" : "transparent",
                color: activePlan === plan.id ? "#ffffff" : "var(--text)",
                border: `1px solid ${activePlan === plan.id ? "#f59e0b" : "#3b82f6"}`,
                width: "100%",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.95rem",
                fontWeight: "700",
                padding: "10px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <span>Subscribe for ₹{plan.offerPrice}</span>
              <ArrowRight size={16} />
            </button>

            <ul style={{ listStyle: "none", padding: 0, margin: "24px 0 0 0", textAlign: "left", fontSize: "0.85rem", color: "var(--text)", fontWeight: "600" }}>
               <li style={{ display: "flex", gap: "8px", marginBottom: "12px" }}><CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: "1px" }} /> Unlimited AI Interviews</li>
               <li style={{ display: "flex", gap: "8px", marginBottom: "12px" }}><CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: "1px" }} /> Unlimited Objective Exams</li>
               <li style={{ display: "flex", gap: "8px", marginBottom: "12px" }}><CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: "1px" }} /> Unlimited ATS Resume Scans</li>
               <li style={{ display: "flex", gap: "8px", marginBottom: "12px" }}><CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: "1px" }} /> Top Companies Preparation</li>
            </ul>
          </div>
        ))}
      </div>

      {/* Subscription Payment & Partial Wallet Redemption Modal (Landscape) */}
      <SubscriptionPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        plan={selectedPlanForModal}
        walletBalance={walletBalance}
        currentSub={currentSub}
        onSuccess={onPurchaseSuccess}
      />
    </div>
  );
}

export default PlanCards;
