import React, { useState } from "react";
import { Check, ShieldCheck, Zap, IndianRupee } from "lucide-react";
import notify from "@/utils/notify";
import { createSubscriptionOrder, verifySubscriptionPayment } from "../services/subscriptionAPI";
import { SUBSCRIPTION_PLANS } from "../constants/subscriptionConfig";
import "@/styles/CoinPackages.css"; // We'll reuse existing package styles or add new ones

function PlanCards({ plans = SUBSCRIPTION_PLANS, onPurchaseSuccess, currentSub }) {
  const [buying, setBuying] = useState(null);
  const [activePlan, setActivePlan] = useState(plans.find((p) => p.popular)?.id || plans[0]?.id);

  const handleBuy = async (plan) => {
    setBuying(plan.id);
    try {
      const orderData = await createSubscriptionOrder(plan.id);
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_TIldjHmH0HwMPb",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "PreepX Pro Access",
        description: `${plan.name} Subscription`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyData = await verifySubscriptionPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
            });
            notify.success(verifyData.message);
            onPurchaseSuccess?.(verifyData);
          } catch (error) {
            notify.error(error.response?.data?.message || "Payment verification failed");
          }
        },
        prefill: {
          name: user.fullName || "PreepX User",
          email: user.email || "user@example.com",
          contact: user.phone || "",
        },
        theme: {
          color: plan.color || "#4f46e5",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function () {
        notify.error("Payment failed. Please try again.");
      });
      rzp1.open();
    } catch (err) {
      notify.error(err.response?.data?.message || "Failed to initiate purchase");
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="coin-packages">
      <div className="coin-packages-header">
        <h3>Choose Your Pro Plan</h3>
        <p>Unlock unlimited mock interviews, objective exams, and ATS resume scoring.</p>
      </div>

      {currentSub?.status === "active" && (
        <div className="coin-packages-notice" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
          <ShieldCheck size={16} />
          <span>You have an active {currentSub.planName} plan. Buying a new plan will extend your validity from {currentSub.expiresAt ? new Date(currentSub.expiresAt).toLocaleDateString() : 'now'}.</span>
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
              borderColor: activePlan === plan.id ? plan.color : "var(--border-color)",
              boxShadow: activePlan === plan.id ? `0 8px 24px -8px ${plan.color}40` : "none"
            }}
          >
            {plan.badge && (
              <span className="coin-pack-tag" style={{ background: plan.color }}>
                {plan.badge}
              </span>
            )}
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%", marginBottom: "12px" }}>
               <div>
                  <p className="coin-pack-label" style={{ color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: "600", marginBottom: "4px" }}>
                    {plan.name}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{plan.label}</p>
               </div>
               {activePlan === plan.id && <Check size={20} color={plan.color} />}
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", margin: "16px 0", justifyContent: "center" }}>
              <p className="coin-pack-price" style={{ margin: 0, fontSize: "2rem", display: "flex", alignItems: "center" }}>
                <IndianRupee size={24} style={{ marginRight: "-2px" }} />
                {plan.offerPrice}
              </p>
              <p style={{ textDecoration: "line-through", color: "var(--text-muted)", fontSize: "1rem", marginBottom: "6px" }}>
                ₹{plan.realPrice}
              </p>
            </div>

            <div style={{ background: "var(--bg-card-hover)", padding: "8px 12px", borderRadius: "8px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Approx</span>
              <span style={{ fontSize: "0.9rem", fontWeight: "600", color: plan.color }}>{plan.perMonth}</span>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", textAlign: "left", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
               <li style={{ display: "flex", gap: "8px", marginBottom: "8px" }}><Check size={16} color="#10b981" style={{ flexShrink: 0 }} /> Unlimited AI Interviews</li>
               <li style={{ display: "flex", gap: "8px", marginBottom: "8px" }}><Check size={16} color="#10b981" style={{ flexShrink: 0 }} /> Unlimited Objective Exams</li>
               <li style={{ display: "flex", gap: "8px", marginBottom: "8px" }}><Check size={16} color="#10b981" style={{ flexShrink: 0 }} /> Unlimited ATS Resume Scans</li>
               <li style={{ display: "flex", gap: "8px", marginBottom: "8px" }}><Check size={16} color="#10b981" style={{ flexShrink: 0 }} /> Top Companies Preparation</li>
            </ul>

            <button
              className="coin-pack-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleBuy(plan);
              }}
              disabled={buying === plan.id}
              style={{ 
                background: activePlan === plan.id ? plan.color : "transparent",
                color: activePlan === plan.id ? "#fff" : plan.color,
                border: `1px solid ${plan.color}`,
                width: "100%"
              }}
            >
              {buying === plan.id ? "Processing…" : `Subscribe for ₹${plan.offerPrice}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlanCards;
