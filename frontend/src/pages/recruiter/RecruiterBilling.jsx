import React, { useEffect, useState } from "react";
import {
  Briefcase, Check, Star, Shield, Zap, Headphones, Building2,
} from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import {
  getBilling, createRecruiterPlanOrder, verifyRecruiterPlanPayment, contactRecruiterSales,
} from "@/services/recruiterAPI";
import notify from "@/utils/notify";
import Loader from "@/components/Loader";
import "@/styles/RecruiterBilling.css";

const formatLimit = (n) => (n == null || n < 0 || n >= 9999 ? "Unlimited" : n);

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = resolve;
    s.onerror = () => reject(new Error("Razorpay failed to load"));
    document.body.appendChild(s);
  });
}

export default function RecruiterBilling() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [salesNote, setSalesNote] = useState("");
  const [showSales, setShowSales] = useState(false);

  const refresh = () => getBilling().then(setData);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const sub = data?.subscription;
  const usage = data?.usage;
  const currentSlug = sub?.planSlug || sub?.planId?.slug;
  const live = !!sub?.live;

  const handlePay = async (plan) => {
    if (plan.contactSales) {
      setShowSales(true);
      return;
    }
    setBuying(plan.slug);
    try {
      await loadRazorpay();
      const order = await createRecruiterPlanOrder(plan.slug);
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_TIldjHmH0HwMPb",
        amount: order.amount,
        currency: order.currency || "INR",
        name: "PreepX Recruiter",
        description: `${plan.name} plan — monthly`,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            const result = await verifyRecruiterPlanPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planSlug: plan.slug,
            });
            notify.success(result.message || `${plan.name} activated`);
            await refresh();
          } catch (err) {
            notify.error(err.response?.data?.message || "Payment verification failed");
          }
        },
        prefill: {
          name: user.fullName || "Recruiter",
          email: user.email || "",
          contact: user.phone || "",
        },
        theme: { color: "#22c55e" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => notify.error("Payment failed. Please try again."));
      rzp.open();
    } catch (err) {
      notify.error(err.response?.data?.message || "Could not start checkout");
    } finally {
      setBuying(null);
    }
  };

  const submitSales = async () => {
    setBuying("enterprise");
    try {
      const res = await contactRecruiterSales(salesNote);
      notify.success(res.message || "Sales request sent");
      setShowSales(false);
      setSalesNote("");
      await refresh();
    } catch (err) {
      notify.error(err.response?.data?.message || "Could not submit request");
    } finally {
      setBuying(null);
    }
  };

  const jobPct = !usage || !usage.jobPostsLimit || usage.jobPostsLimit < 0
    ? 0
    : Math.min(100, Math.round((usage.jobPostsThisMonth / usage.jobPostsLimit) * 100));

  return (
    <RecruiterLayout title="Recruiter Plan">
      {loading ? <Loader /> : (
        <div className="rp-wrap">
          <section className="rp-hero">
            <div className="rp-hero-icon"><Briefcase size={22} /></div>
            <div>
              <h1>Recruiter Plan</h1>
              <p>Find, evaluate and hire the right talent faster with AI-powered insights.</p>
            </div>
          </section>

          <div className="rp-included">
            <span>All plans include:</span>
            {(data?.includedInAll || ["AI Candidate Scoring", "Custom Assessments", "Hiring Pipeline", "Candidate Comparison"]).map((item) => (
              <em key={item}><Check size={12} strokeWidth={3} /> {item}</em>
            ))}
          </div>

          {sub && (
            <div className="rp-current">
              <div>
                <div className="rp-current-label">Current plan</div>
                <strong>{sub.planName || sub.planId?.name || "None"}</strong>
                <span className={`rp-pill ${live ? "ok" : "warn"}`}>
                  {live ? (sub.status === "trial" ? "Trial" : "Active") : (sub.status || "Expired")}
                </span>
              </div>
              <div className="rp-meters">
                <div>
                  <div className="rp-meter-head">
                    <span>Job posts this month</span>
                    <b>
                      {usage?.jobPostsThisMonth || 0}
                      {usage?.jobPostsLimit < 0 ? " / Unlimited" : ` / ${usage?.jobPostsLimit || 0}`}
                    </b>
                  </div>
                  <div className="rp-bar"><i style={{ width: usage?.jobPostsLimit < 0 ? "12%" : `${jobPct}%` }} /></div>
                </div>
                {sub.currentPeriodEnd && (
                  <p className="rp-expiry">
                    {live ? `Renews / expires ${new Date(sub.currentPeriodEnd).toLocaleDateString("en-IN")}` : "Plan expired — upgrade to keep posting jobs"}
                    {live && sub.daysLeft != null ? ` · ${sub.daysLeft} days left` : ""}
                  </p>
                )}
              </div>
              {!live && (
                <button type="button" className="rp-btn solid" onClick={() => document.getElementById("rp-plans")?.scrollIntoView({ behavior: "smooth" })}>
                  Upgrade now
                </button>
              )}
            </div>
          )}

          <div id="rp-plans" className="rp-grid">
            {(() => {
              const STATIC_PLANS = [
                {
                  slug: "starter",
                  name: "Starter",
                  tagline: "For Small Teams",
                  priceInr: 1999,
                  ctaLabel: "Start Hiring",
                  highlight: false,
                  contactSales: false,
                  features: ["Up to 5 Job Posts/mo", "AI Candidate Scoring", "Basic Hiring Pipeline", "Email Support"]
                },
                {
                  slug: "growth",
                  name: "Growth",
                  tagline: "For Growing Teams",
                  priceInr: 3999,
                  ctaLabel: "Upgrade to Growth",
                  highlight: true,
                  contactSales: false,
                  features: ["Upto 20 Job Posts/mo", "Advanced AI Insights", "Automated Screening", "Priority Support"]
                },
                {
                  slug: "enterprise",
                  name: "Enterprise",
                  tagline: "For Large Teams",
                  priceInr: 0,
                  contactSales: true,
                  ctaLabel: "Contact Sales",
                  highlight: false,
                  features: ["Custom Integrations & API", "Dedicated Account Manager", "SSO & Team Access", "24/7 Priority Support"]
                }
              ];

              // Merge DB plans with static display data (DB plan has correct _id & slug for payment)
              const dbPlans = data?.plans || [];
              const plans = STATIC_PLANS.map((sp) => {
                const dbPlan = dbPlans.find((p) => p.slug === sp.slug);
                return dbPlan ? { ...sp, ...dbPlan, priceInr: sp.priceInr, features: sp.features } : sp;
              });

              return plans.map((plan) => {
                const popular = plan.highlight || plan.slug === "growth";
                const isCurrent = live && currentSlug === plan.slug;
                const priceLabel = plan.contactSales || plan.priceInr === 0
                  ? "Custom"
                  : `₹${Number(plan.priceInr).toLocaleString("en-IN")}`;
                const period = plan.contactSales || plan.priceInr === 0 ? "Pricing" : "/month";
                return (
                  <article key={plan.slug} className={`rp-card ${popular ? "featured" : ""} ${isCurrent ? "current" : ""}`}>
                    {popular && <div className="rp-badge"><Star size={12} /> Best Value</div>}
                    <h3>{plan.name}</h3>
                    <p className="rp-tagline">{plan.tagline || ""}</p>
                    <div className="rp-price">
                      <strong>{priceLabel}</strong>
                      <small>{period}</small>
                    </div>
                    <button
                      type="button"
                      className={`rp-btn ${popular ? "solid" : "ghost"}`}
                      disabled={buying === plan.slug || isCurrent}
                      onClick={() => handlePay(plan)}
                    >
                      {isCurrent ? "✓ Current Plan" : buying === plan.slug ? "Processing…" : (plan.ctaLabel || "Select")}
                    </button>
                    <ul>
                      {(plan.features || []).map((f) => (
                        <li key={f}><Check size={14} strokeWidth={3} /> {f}</li>
                      ))}
                    </ul>
                  </article>
                );
              });
            })()}
          </div>

          <div className="rp-foot">
            <div><Zap size={16} /> AI Skill Matching</div>
            <div><Shield size={16} /> Custom Assessments</div>
            <div><Headphones size={16} /> Fast-track hiring support</div>
          </div>

          {(data?.payments || []).length > 0 && (
            <div className="rp-history">
              <h3>Payment history</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((p) => (
                    <tr key={p._id}>
                      <td>{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                      <td>{p.planName}</td>
                      <td>{p.amountInr ? `₹${p.amountInr.toLocaleString("en-IN")}` : "—"}</td>
                      <td><span className={`rp-pill ${p.status === "completed" ? "ok" : p.status === "inquiry" ? "info" : "warn"}`}>{p.status}</span></td>
                      <td className="mono">{p.razorpayPaymentId || p.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showSales && (
            <div className="rp-modal" onClick={() => setShowSales(false)}>
              <div className="rp-modal-card" onClick={(e) => e.stopPropagation()}>
                <Building2 size={28} />
                <h3>Contact Sales</h3>
                <p>Tell us about your hiring volume. We’ll tailor Enterprise pricing, SSO, and API access.</p>
                <textarea rows={4} value={salesNote} onChange={(e) => setSalesNote(e.target.value)} placeholder="Team size, monthly job volume, integrations…" />
                <div className="rp-modal-actions">
                  <button type="button" className="rp-btn ghost" onClick={() => setShowSales(false)}>Cancel</button>
                  <button type="button" className="rp-btn solid" disabled={buying === "enterprise"} onClick={submitSales}>
                    {buying === "enterprise" ? "Sending…" : "Submit request"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </RecruiterLayout>
  );
}
