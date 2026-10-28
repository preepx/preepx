import React, { useState } from "react";
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
        icon: "/landing/preepxcertificate.svg",
        title: "Verified Certificates",
        desc: "Industry-recognized skill certificates.",
      },
      {
        icon: "/landing/100daychallenge.svg",
        title: "100 Days Challenge",
        desc: "Build consistency and earn bonus coins.",
      },
      {
        icon: "/landing/getdescover.svg",
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
        price: "₹999",
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
        icon: "/landing/aiskillmatch.svg",
        title: "AI Skill Matching",
        desc: "Automated grading & ranking.",
      },
      {
        icon: "/landing/customassesment.svg",
        title: "Custom Assessments",
        desc: "Tailored skill-based test flows.",
      },
      {
        icon: "/landing/fasttrackhiring.svg",
        title: "Fast-Track Hiring",
        desc: "Shortlist verified talent 3x faster.",
      },
    ],
  },
};

function PricingSection({ onRecruiterClick }) {
  const [activeTab, setActiveTab] = useState("all");
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
    <section id="pricing" className="relative py-12 md:py-24 overflow-hidden bg-transparent w-full flex flex-col items-center justify-center">
      {/* Background blobs for aesthetics */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#E0F2FE] blur-[120px] opacity-70"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#F3E8FF] blur-[120px] opacity-70"></div>
      </div>

      <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16 max-w-[1380px] mx-auto px-4">
          <h2
            className="text-slate-900 mb-3 text-[22px] sm:text-[28px] md:text-[36px] leading-tight md:leading-[44px]"
            style={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 700,
              letterSpacing: '0%',
              textAlign: 'center'
            }}
          >
            {pricingData.header.title}
          </h2>
          <p
            className="text-[13px] sm:text-[15px] md:text-[16.5px] text-slate-700 font-medium max-w-[850px] mx-auto px-2"
            style={{ textWrap: 'balance' }}
          >
            {pricingData.header.subtitle}
          </p>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex sm:hidden items-center justify-between p-1 bg-slate-200/70 rounded-full border border-slate-300/80 mb-6 shadow-inner w-full max-w-[320px]">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-1.5 px-2 rounded-full text-[12px] font-bold transition-all text-center ${activeTab === "all"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            All Plans
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("candidate")}
            className={`flex-1 py-1.5 px-2 rounded-full text-[12px] font-bold transition-all text-center flex items-center justify-center gap-1 ${activeTab === "candidate"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Candidate <span className={`text-[10px] ${activeTab === "candidate" ? "text-blue-100" : "text-slate-400"}`}>(2)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("recruiter")}
            className={`flex-1 py-1.5 px-2 rounded-full text-[12px] font-bold transition-all text-center flex items-center justify-center gap-1 ${activeTab === "recruiter"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Recruiter <span className={`text-[10px] ${activeTab === "recruiter" ? "text-emerald-100" : "text-slate-400"}`}>(3)</span>
          </button>
        </div>

        {/* Main Content Area: Groups Title + Cards for mobile responsive stacking */}
        <div
          className="flex flex-col xl:flex-row gap-8 xl:gap-8 justify-center items-center xl:items-start mb-16 w-full"
          style={{ marginTop: '10px' }}
        >
          {/* Candidate Section */}
          <div
            className={`flex flex-col gap-3 sm:gap-[20px] items-center w-full xl:w-auto ${activeTab === "recruiter" ? "hidden sm:flex" : "flex"
              }`}
          >
            {/* Candidate Title */}
            <div className="flex justify-start w-full max-w-[340px] min-[480px]:max-w-[460px]">
              <div className="flex items-center gap-3">
                <img src="/landing/condinateplan.svg" alt="Candidate Plan Icon" className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="text-[16px] font-extrabold text-slate-900">{pricingData.candidate.title}</h3>
                  <p className="text-[11px] text-slate-600 font-medium">{pricingData.candidate.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Candidate Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:flex xl:flex-nowrap gap-3 sm:gap-[10px] justify-center w-full
  max-w-[340px] sm:max-w-[460px] xl:max-w-none mx-auto">
              {pricingData.candidate.plans.map((plan) => {
                return (
                  <div className="flex items-center mx-auto justify-center">
                    <div
                      key={plan.id}
                      className="flex flex-col items-center w-[90vw] min-w-0 sm:w-[200px] md:w-[225px]"
                    >
                      <div
                        className="bg-white border border-[#BFDBFE] shadow-md relative flex flex-col hover:-translate-y-1 transition-transform w-full"
                        style={{
                          background: "#B6D2FF",
                          minHeight: '240px',
                          borderRadius: '10px',
                          borderWidth: '1px',
                          padding: '14px 12px',
                          opacity: 1
                        }}
                      >
                        {plan.badge && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-blue-200 text-blue-700 text-[9.5px] sm:text-[11px] font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm whitespace-nowrap">
                            {plan.badge}
                          </div>
                        )}
                        <div className="mb-3 border-b border-blue-200/50 pb-3">
                          <h4 className="text-[14px] sm:text-[16px] md:text-[18px] font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span className="opacity-80">📅</span> {plan.name}
                          </h4>
                          <p className="text-[11px] sm:text-[12px] text-slate-600 font-semibold mb-2 sm:mb-3">{plan.tagline}</p>
                          <div className="flex items-center gap-1.5">
                            {plan.originalPrice && <span className="text-[12px] sm:text-[15px] md:text-[16px] text-slate-400 line-through font-bold">{plan.originalPrice}</span>}
                            <span className="text-[18px] sm:text-[22px] md:text-[28px] font-extrabold text-slate-900">{plan.price}</span>
                          </div>
                        </div>

                        <button
                          className="w-full h-[35px] py-2 px-2 sm:py-2.5 sm:px-3 md:py-3 md:px-9 rounded-full bg-white border border-blue-200/80 hover:bg-blue-50 text-slate-800 font-bold text-[11px] sm:text-[12px] md:text-[13px] mb-3 transition-all shadow-sm flex justify-center items-center gap-1 active:scale-[0.98]"
                          onClick={() => handleCandidateAction(plan.id)}
                        >
                          {plan.buttonText}
                        </button>


                        <ul className="space-y-3 sm:space-y-3" style={{ marginTop: "12px" }}>
                          {plan.features.map(feat => (
                            <li key={feat} style={{ marginTop: "3px" }} className="flex items-start gap-1.5 sm:gap-2 text-[12px] sm:text-[11px] md:text-[12px] font-bold text-slate-700">
                              <img src="/landing/tick.svg" alt="Tick" className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mt-0.5" />
                              <span className="leading-tight">{feat}</span>
                            </li>
                          ))}
                        </ul>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recruiter Section */}
          <div
            className={`flex flex-col gap-3 sm:gap-[20px] items-center w-full sm:w-[500px] xl:w-auto ${activeTab === "candidate" ? "hidden sm:flex" : "flex"
              }`}
          >
            {/* Recruiter Title */}
            <div className="flex justify-start w-full max-w-[320px] sm:max-w-[700px]">
              <div className="flex items-center gap-3">
                <img src="/landing/recuirterplan.svg" alt="Recruiter Plan Icon" className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="text-[16px] font-extrabold text-slate-900">{pricingData.recruiter.title}</h3>
                  <p className="text-[11px] text-slate-600 font-medium">{pricingData.recruiter.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Recruiter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:flex xl:flex-nowrap gap-4 sm:gap-3 justify-center relative w-full max-w-[420px] sm:max-w-[700px] xl:max-w-none">
              {pricingData.recruiter.plans.map((plan) => {
                return (
                  <div className="flex items-center mx-auto justify-center">
                    <div key={plan.id} className="flex flex-col items-center w-[90vw] min-w-0 sm:w-[200px] md:w-[225px]">
                      <div
                        className="bg-white border border-[#A7F3D0] shadow-md relative flex flex-col hover:-translate-y-1 transition-transform w-full"
                        style={{
                          background: "#A3F1FF",
                          minHeight: '240px',
                          borderRadius: '10px',
                          borderWidth: '1px',
                          padding: '16px 14px',
                          opacity: 1
                        }}
                      >
                        {plan.badge && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-emerald-200 text-emerald-800 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm whitespace-nowrap">
                            {plan.badge}
                          </div>
                        )}
                        <div className="mb-3 border-b border-emerald-200/50 pb-3">
                          <h4 className="text-[16px] md:text-[18px] font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span className="opacity-80">🎬</span> {plan.name}
                          </h4>
                          <p className="text-[12px] text-slate-600 font-semibold mb-2 sm:mb-3">{plan.tagline}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-[24px] sm:text-[22px] md:text-[28px] font-extrabold text-slate-900">{plan.price}</span>
                            <span className="text-[12px] text-slate-500 font-semibold">{plan.period}</span>
                          </div>
                        </div>

                        <button
                          className="w-full h-[35px] py-2.5 px-3 md:py-3 md:px-4 rounded-full bg-white border border-emerald-200/80 hover:bg-emerald-50 text-slate-800 font-bold text-[12px] md:text-[13px] mb-3.5 transition-all shadow-sm flex justify-center items-center gap-1.5 active:scale-[0.98]"
                          onClick={() => handleRecruiterAction(plan.id)}
                        >
                          {plan.buttonText}
                        </button>

                        <ul className="space-y-2.5 sm:space-y-3" style={{ marginTop: "12px" }}>
                          {plan.features.map(feat => (
                            <li key={feat} style={{ marginTop: "3px" }} className="flex items-start gap-2 text-[12px] md:text-[12px] font-bold text-slate-700">
                              <img src="/landing/tick.svg" alt="Tick" className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span className="leading-tight">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Features Row (Removed for Mobile) */}

      </div>
    </section>
  );
}

export default PricingSection;
