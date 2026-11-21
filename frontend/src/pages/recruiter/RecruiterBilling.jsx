import React, { useEffect, useState } from "react";
import {
  Briefcase, Check, Star, Shield, Zap, Headphones, Building2, Building, Mail, Phone, User, X, AlertCircle, Loader2, FileText,
} from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import {
  getBilling, createRecruiterPlanOrder, verifyRecruiterPlanPayment, contactRecruiterSales,
} from "@/services/recruiterAPI";
import RecruiterReceiptModal from "@/components/recruiter/RecruiterReceiptModal";
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
  const [showSales, setShowSales] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [salesError, setSalesError] = useState("");
  const [salesForm, setSalesForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  });

  const refresh = () => getBilling().then(setData);

  const handleViewReceipt = (p) => {
    if (p?.receiptId) {
      setSelectedReceipt(p);
      setShowReceiptModal(true);
      return;
    }

    const matched = (data?.receipts || []).find(
      (r) =>
        (p.razorpayPaymentId && r.razorpayPaymentId === p.razorpayPaymentId) ||
        (p.razorpayOrderId && r.razorpayOrderId === p.razorpayOrderId) ||
        p.planSlug === r.planSlug
    );

    if (matched) {
      setSelectedReceipt(matched);
      setShowReceiptModal(true);
      return;
    }

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};
    const fallbackReceipt = {
      receiptId: `RCP-REC-${(p._id || "").slice(-8).toUpperCase()}`,
      recruiterName: user.fullName || user.name || "Recruiter",
      recruiterEmail: user.email,
      companyName: user.companyName || data?.company?.name || "",
      planName: p.planName || "Starter",
      planSlug: p.planSlug || "starter",
      planDurationDays: 30,
      amountInr: p.amountInr || (p.planSlug === "growth" ? 3999 : 999),
      razorpayPaymentId: p.razorpayPaymentId || "N/A",
      razorpayOrderId: p.razorpayOrderId || "N/A",
      purchaseDate: p.createdAt,
      startDate: p.periodStart || p.createdAt,
      expiryDate: p.periodEnd || new Date(new Date(p.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000),
      paymentStatus: "paid",
      paymentMethod: "Razorpay Online",
    };
    setSelectedReceipt(fallbackReceipt);
    setShowReceiptModal(true);
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const openSalesModal = () => {
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      setSalesForm((prev) => ({
        name: prev.name || user.fullName || user.name || "",
        email: prev.email || user.email || "",
        company: prev.company || user.companyName || (data?.subscription?.companyName) || "",
        phone: prev.phone || user.phone || "",
        message: prev.message || "",
      }));
    } catch {
      // ignore
    }
    setSalesError("");
    setShowSales(true);
  };

  const sub = data?.subscription;
  const usage = data?.usage;
  const currentSlug = sub?.planSlug || sub?.planId?.slug;
  const live = !!sub?.live;

  const handlePay = async (plan) => {
    if (plan.contactSales) {
      openSalesModal();
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
            if (result.receipt) {
              setSelectedReceipt(result.receipt);
              setShowReceiptModal(true);
            }
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
        theme: { color: "#2563EB" },
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

  const submitSales = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSalesError("");

    if (!salesForm.name.trim()) {
      setSalesError("Please enter your name.");
      return;
    }
    if (!salesForm.email.trim()) {
      setSalesError("Please enter your work email.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(salesForm.email.trim())) {
      setSalesError("Please enter a valid email address.");
      return;
    }
    if (!salesForm.message.trim()) {
      setSalesError("Please enter your hiring requirements or team volume.");
      return;
    }

    setBuying("enterprise");
    try {
      const res = await contactRecruiterSales({
        name: salesForm.name.trim(),
        email: salesForm.email.trim(),
        company: salesForm.company.trim(),
        phone: salesForm.phone.trim(),
        note: salesForm.message.trim(),
      });
      notify.success(res.message || "Sales request submitted successfully! Our team will contact you shortly.");
      setShowSales(false);
      setSalesForm({
        name: "",
        email: "",
        company: "",
        phone: "",
        message: "",
      });
      await refresh();
    } catch (err) {
      const msg = err.response?.data?.message || "Could not submit request. Please try again.";
      setSalesError(msg);
      notify.error(msg);
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
            <div className="rp-hero-icon"><Briefcase size={22} color="#ffffff" strokeWidth={2.2} /></div>
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
                  priceInr: 999,
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
                return dbPlan ? { ...sp, ...dbPlan, priceInr: dbPlan.priceInr ?? sp.priceInr, features: sp.features } : sp;
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
                    <th style={{ textAlign: "right" }}>Receipt</th>
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
                      <td style={{ textAlign: "right" }}>
                        {p.status === "completed" && (
                          <button
                            type="button"
                            className="rp-receipt-btn"
                            onClick={() => handleViewReceipt(p)}
                            title="View / Download Payment Receipt"
                          >
                            <FileText size={12} />
                            <span>Receipt</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showSales && (
            <div className="rp-modal" onClick={() => !buying && setShowSales(false)}>
              <div
                className="rp-modal-card rp-sales-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="sales-modal-title"
              >
                <div className="rp-sales-modal-header">
                  <div className="rp-sales-modal-icon">
                    <Building2 size={22} />
                  </div>
                  <div className="rp-sales-modal-titles">
                    <h3 id="sales-modal-title">Contact Sales</h3>
                    <p>
                      Tell us about your hiring needs. We’ll tailor Enterprise pricing, custom integrations, SSO, and API access.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rp-sales-modal-close"
                    onClick={() => !buying && setShowSales(false)}
                    aria-label="Close"
                    disabled={buying === "enterprise"}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="rp-sales-badge">
                  <span className="rp-sales-badge-dot" />
                  <span>Direct inquiry will be sent to <strong>contact@preepx.in</strong></span>
                </div>

                {salesError && (
                  <div className="rp-sales-error">
                    <AlertCircle size={16} />
                    <span>{salesError}</span>
                  </div>
                )}

                <form onSubmit={submitSales} className="rp-sales-form">
                  <div className="rp-form-row">
                    <div className="rp-form-group">
                      <label className="rp-form-label">
                        Your Name <span className="rp-required">*</span>
                      </label>
                      <div className="rp-input-wrap">
                        <User size={15} className="rp-input-icon" />
                        <input
                          type="text"
                          className="rp-input"
                          placeholder="Enter your name"
                          value={salesForm.name}
                          onChange={(e) => setSalesForm({ ...salesForm, name: e.target.value })}
                          disabled={buying === "enterprise"}
                          required
                        />
                      </div>
                    </div>

                    <div className="rp-form-group">
                      <label className="rp-form-label">
                        Work Email <span className="rp-required">*</span>
                      </label>
                      <div className="rp-input-wrap">
                        <Mail size={15} className="rp-input-icon" />
                        <input
                          type="email"
                          className="rp-input"
                          placeholder="name@company.com"
                          value={salesForm.email}
                          onChange={(e) => setSalesForm({ ...salesForm, email: e.target.value })}
                          disabled={buying === "enterprise"}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rp-form-row">
                    <div className="rp-form-group">
                      <label className="rp-form-label">Company Name</label>
                      <div className="rp-input-wrap">
                        <Building size={15} className="rp-input-icon" />
                        <input
                          type="text"
                          className="rp-input"
                          placeholder="e.g. Acme Corp"
                          value={salesForm.company}
                          onChange={(e) => setSalesForm({ ...salesForm, company: e.target.value })}
                          disabled={buying === "enterprise"}
                        />
                      </div>
                    </div>

                    <div className="rp-form-group">
                      <label className="rp-form-label">Phone / WhatsApp (Optional)</label>
                      <div className="rp-input-wrap">
                        <Phone size={15} className="rp-input-icon" />
                        <input
                          type="tel"
                          className="rp-input"
                          placeholder="+91 98765 43210"
                          value={salesForm.phone}
                          onChange={(e) => setSalesForm({ ...salesForm, phone: e.target.value })}
                          disabled={buying === "enterprise"}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rp-form-group">
                    <label className="rp-form-label">
                      Hiring Volume & Requirements <span className="rp-required">*</span>
                    </label>
                    <textarea
                      rows={4}
                      className="rp-textarea"
                      value={salesForm.message}
                      onChange={(e) => setSalesForm({ ...salesForm, message: e.target.value })}
                      placeholder="Tell us about your team size, monthly job openings, candidate volume, or required integrations..."
                      disabled={buying === "enterprise"}
                      required
                    />
                  </div>

                  <div className="rp-modal-actions">
                    <button
                      type="button"
                      className="rp-btn ghost"
                      onClick={() => setShowSales(false)}
                      disabled={buying === "enterprise"}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rp-btn solid rp-btn-submit"
                      disabled={buying === "enterprise"}
                    >
                      {buying === "enterprise" ? (
                        <>
                          <Loader2 size={16} className="rp-spin" />
                          <span>Sending Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <Mail size={16} />
                          <span>Submit Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <RecruiterReceiptModal
            isOpen={showReceiptModal}
            onClose={() => setShowReceiptModal(false)}
            receipt={selectedReceipt}
          />
        </div>
      )}
    </RecruiterLayout>
  );
}
