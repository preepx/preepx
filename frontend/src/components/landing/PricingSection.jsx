import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Briefcase,
  Check,
  Award,
  Flame,
  UserCheck,
  Sparkles,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import "@/styles/landing/PricingLanding.css";

// ── DYNAMIC PRICING CONFIGURATION (EASILY EDITABLE) ──
export const pricingData = {
  header: {
    title: "Upgrade to Unlock Premium. Achieve More. Hire Better.",
    subtitle:
      "Choose the perfect plan and get access to powerful features that make a real difference.",
  },

  // ════ CANDIDATE ECOSYSTEM ════
  candidate: {
    title: "Candidate Plan",
    subtitle:
      "Prepare better, earn coins, and get discovered by top recruiters.",
    includedInAll: [
      "AI Mock Interviews",
      "Objective Exams",
      "Coding Challenges",
      "Performance Analytics",
      "Verified Certificates",
    ],
    plans: [
      {
        id: "plan_7d",
        name: "7 DAYS",
        tagline: "Weekly",
        price: "₹79",
        period: "",
        originalPrice: "₹99",
        buttonText: "Subscribe for ₹79",
        isPopular: false,
        buttonVariant: "secondary",
        features: [
          "Unlimited AI Interviews",
          "Unlimited Objective Exams",
          "Unlimited ATS Resume Scans",
          "Top Companies Preparation",
        ],
      },
      {
        id: "plan_1m",
        name: "1 MONTH",
        tagline: "Monthly",
        badge: "🔥 Most Popular",
        price: "₹299",
        period: "",
        originalPrice: "₹349",
        buttonText: "Subscribe for ₹299",
        isPopular: true,
        buttonVariant: "primary-purple",
        features: [
          "Unlimited AI Interviews",
          "Unlimited Objective Exams",
          "Unlimited ATS Resume Scans",
          "Top Companies Preparation",
        ],
      },
    ],
    footerFeatures: [
      {
        icon: Award,
        title: "Verified Certificates",
        desc: "Industry-recognized skill certificates.",
      },
      {
        icon: Flame,
        title: "100 Days Challenge",
        desc: "Build consistency and earn bonus coins.",
      },
      {
        icon: UserCheck,
        title: "Get Discovered",
        desc: "Top recruiters hire you based on proven skills.",
      },
    ],
  },

  // ════ RECRUITER ECOSYSTEM ════
  recruiter: {
    title: "Recruiter Plan",
    subtitle:
      "Find, evaluate and hire the right talent faster with AI-powered insights.",
    includedInAll: [
      "AI Candidate Scoring",
      "Custom Assessments",
      "Hiring Pipeline",
      "Candidate Comparison",
    ],
    plans: [
      {
        id: "recruiter-starter",
        name: "Starter",
        tagline: "For Small Teams",
        price: "₹1,999",
        period: "/month",
        buttonText: "Start Hiring",
        isPopular: false,
        buttonVariant: "outline-green",
        features: [
          "Up to 5 Job Posts/mo",
          "AI Candidate Scoring",
          "Basic Hiring Pipeline",
          "Email Support",
        ],
      },
      {
        id: "recruiter-growth",
        name: "Growth",
        tagline: "For Growing Teams",
        badge: "★ Best Value",
        price: "₹3,999",
        period: "/month",
        buttonText: "Upgrade to Growth",
        isPopular: true,
        buttonVariant: "primary-green",
        features: [
          "Upto 20 Job Posts/mo",
          "Advanced AI Insights",
          "Automated Screening",
          "Priority Support",
        ],
      },
      {
        id: "recruiter-enterprise",
        name: "Enterprise",
        tagline: "For Large Teams",
        price: "Custom",
        period: "Pricing",
        buttonText: "Contact Sales",
        isPopular: false,
        buttonVariant: "outline-green",
        features: [
          "Custom Integrations & API",
          "Dedicated Account Manager",
          "SSO & Team Access",
          "24/7 Priority Support",
        ],
      },
    ],
    footerFeatures: [
      {
        icon: Sparkles,
        title: "AI Skill Matching",
        desc: "Automated grading & ranking.",
      },
      {
        icon: FileCheck,
        title: "Custom Assessments",
        desc: "Tailored skill-based test flows.",
      },
      {
        icon: TrendingUp,
        title: "Fast-Track Hiring",
        desc: "Shortlist verified talent 3x faster.",
      },
    ],
  },
};

function PricingSection({ onRecruiterClick }) {
  const navigate = useNavigate();

  const handleCandidateAction = (planId) => {
    navigate("/auth?role=candidate");
  };

  const handleRecruiterAction = (planId) => {
    if (onRecruiterClick) {
      onRecruiterClick();
    } else {
      navigate("/auth?role=recruiter");
    }
  };

  return (
    <section id="pricing" className="prepx-pricing-section section">
      {/* ── HEADER ── */}
      <div className="section-header pricing-title-header">
        <h2 className="pricing-main-title">{pricingData.header.title}</h2>
        <p className="pricing-header-subtitle">{pricingData.header.subtitle}</p>
      </div>

      {/* ── 2-WING MASTER WRAPPER ── */}
      <div className="pricing-wings-container">
        {/* ══════════════════════════════════════════════
            WING 1: CANDIDATE PLAN (PURPLE / BLUE ACCENT)
        ══════════════════════════════════════════════ */}
        <div className="pricing-wing candidate-wing">
          {/* Header */}
          <div className="wing-header">
            <div className="wing-header-left">
              <div className="wing-icon-circle circle-purple">
                <Users size={20} />
              </div>
              <div className="wing-header-text">
                <h3 className="wing-main-title title-purple">
                  {pricingData.candidate.title}
                </h3>
                <p className="wing-sub-text">
                  {pricingData.candidate.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Included in all strip */}
          <div className="wing-included-bar bar-purple">
            <span className="inc-bar-label">All plans include:</span>
            <div className="inc-bar-tags">
              {pricingData.candidate.includedInAll.map((item, i) => (
                <span key={i} className="inc-tag tag-p-pill">
                  ✓ {item}
                </span>
              ))}
            </div>
          </div>

          {/* Cards Grid: Free + Pro */}
          <div className="candidate-cards-grid">
            {pricingData.candidate.plans.map((plan) => (
              <div
                key={plan.id}
                className={`pricing-tier-card ${plan.isPopular ? "tier-card-popular cand-pro-card" : "cand-free-card"}`}
              >
                {plan.badge && (
                  <div className="tier-popular-tag tag-purple">
                    {plan.badge}
                  </div>
                )}

                <div className="tier-header-info">
                  <h4 className="tier-name">{plan.name}</h4>
                  <p className="tier-tagline">{plan.tagline}</p>
                </div>

                <div className="tier-price-box">
                  {plan.originalPrice && (
                    <span style={{ textDecoration: "line-through", color: "var(--text-muted)", fontSize: "16px", marginRight: "8px", fontWeight: "normal" }}>
                      {plan.originalPrice}
                    </span>
                  )}
                  <span
                    className={`tier-price ${plan.isPopular ? "tier-price-purple" : ""}`}
                  >
                    {plan.price}
                  </span>
                  <span className="tier-period">{plan.period}</span>
                </div>

                <button
                  className={`tier-btn ${plan.buttonVariant === "primary-purple" ? "tier-btn-purple" : "tier-btn-secondary"}`}
                  onClick={() => handleCandidateAction(plan.id)}
                  type="button"
                >
                  {plan.buttonText}
                </button>

                <ul className="tier-features-ul">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="tier-feat-li">
                      <span className="chk-icon-wrap chk-purple">
                        <Check size={11} strokeWidth={3} />
                      </span>
                      <span className="tier-feat-text">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Feature Strip (3 items) */}
          <div className="wing-bottom-strip">
            {pricingData.candidate.footerFeatures.map((item, i) => (
              <div key={i} className="bottom-strip-item">
                <div className="strip-icon-box strip-purple">
                  <item.icon size={15} />
                </div>
                <div className="strip-text-box">
                  <h5 className="strip-title">{item.title}</h5>
                  <p className="strip-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            WING 2: RECRUITER PLAN (EMERALD GREEN ACCENT)
        ══════════════════════════════════════════════ */}
        <div className="pricing-wing recruiter-wing">
          {/* Header */}
          <div className="wing-header">
            <div className="wing-header-left">
              <div className="wing-icon-circle circle-green">
                <Briefcase size={20} />
              </div>
              <div className="wing-header-text">
                <h3 className="wing-main-title title-green">
                  {pricingData.recruiter.title}
                </h3>
                <p className="wing-sub-text">
                  {pricingData.recruiter.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Included in all strip */}
          <div className="wing-included-bar bar-green">
            <span className="inc-bar-label">All plans include:</span>
            <div className="inc-bar-tags">
              {pricingData.recruiter.includedInAll.map((item, i) => (
                <span key={i} className="inc-tag tag-g-pill">
                  ✓ {item}
                </span>
              ))}
            </div>
          </div>

          {/* Cards Grid: Starter + Growth + Enterprise */}
          <div className="recruiter-cards-grid">
            {pricingData.recruiter.plans.map((plan) => (
              <div
                key={plan.id}
                className={`pricing-tier-card ${plan.isPopular ? "tier-card-popular rec-growth-card" : "rec-standard-card"}`}
              >
                {plan.badge && (
                  <div className="tier-popular-tag tag-green">
                    {plan.badge}
                  </div>
                )}

                <div className="tier-header-info">
                  <h4 className="tier-name">{plan.name}</h4>
                  <p className="tier-tagline">{plan.tagline}</p>
                </div>

                <div className="tier-price-box">
                  <span
                    className={`tier-price ${plan.isPopular ? "tier-price-green" : ""}`}
                  >
                    {plan.price}
                  </span>
                  <span className="tier-period">{plan.period}</span>
                </div>

                <button
                  className={`tier-btn ${plan.buttonVariant === "primary-green" ? "tier-btn-green" : "tier-btn-outline-green"}`}
                  onClick={() => handleRecruiterAction(plan.id)}
                  type="button"
                >
                  {plan.buttonText}
                </button>

                <ul className="tier-features-ul">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="tier-feat-li">
                      <span className="chk-icon-wrap chk-green">
                        <Check size={11} strokeWidth={3} />
                      </span>
                      <span className="tier-feat-text">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Feature Strip for Recruiters (3 items) */}
          <div className="wing-bottom-strip">
            {pricingData.recruiter.footerFeatures.map((item, i) => (
              <div key={i} className="bottom-strip-item">
                <div className="strip-icon-box strip-green">
                  <item.icon size={15} />
                </div>
                <div className="strip-text-box">
                  <h5 className="strip-title">{item.title}</h5>
                  <p className="strip-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
