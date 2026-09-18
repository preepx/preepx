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
    <section id="pricing" className="relative py-24 overflow-hidden bg-transparent">
      {/* Background blobs for aesthetics */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#E0F2FE] blur-[120px] opacity-70"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#F3E8FF] blur-[120px] opacity-70"></div>
      </div>

      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 max-w-[1380px] mx-auto px-4">
          <h2
            className="text-slate-900 mb-3 text-[26px] md:text-[36px] leading-tight md:leading-[44px]"
            style={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 700,
              letterSpacing: '0%',
              textAlign: 'center'
            }}
          >
            {pricingData.header.title}
          </h2>
          <p className="text-[15px] md:text-[17px] text-slate-700 font-medium">
            {pricingData.header.subtitle}
          </p>
        </div>

        {/* Main Content Area: Groups Title + Cards for mobile responsive stacking */}
        <div
          className="flex flex-col xl:flex-row gap-10 xl:gap-[10px] justify-center items-stretch mb-16"
          style={{ marginTop: '30px' }}
        >
          {/* Candidate Section */}
          <div className="flex flex-col flex-1 gap-[20px]">
            {/* Candidate Title */}
            <div className="flex justify-center px-4">
              <div className="flex items-center gap-3">
                <img src="/landing/condinateplan.svg" alt="Candidate Plan Icon" className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="text-[16px] font-extrabold text-slate-900">{pricingData.candidate.title}</h3>
                  <p className="text-[11px] text-slate-600 font-medium">{pricingData.candidate.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Candidate Cards */}
            <div className="grid grid-cols-2 md:flex md:flex-row gap-[10px] justify-center">
              {pricingData.candidate.plans.map((plan, index) => {
                const feature = pricingData.candidate.footerFeatures[index];
                return (
                <div key={plan.id} className="flex flex-col items-center w-full" style={{ maxWidth: '225px' }}>
                  <div className="bg-white border border-[#BFDBFE] shadow-xl shadow-blue-500/5 relative flex flex-col hover:-translate-y-1 transition-transform w-full" style={{ background: "#B6D2FF", height: '250px', borderRadius: '10px', borderWidth: '1px', padding: '15px', gap: '10px', opacity: 1 }}>
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-blue-200 text-blue-700 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                        {plan.badge}
                      </div>
                    )}
                    <div className="mb-5 border-b border-blue-200/50 pb-5">
                      <h4 className="text-[15px] md:text-[18px] font-extrabold text-slate-900 flex items-center gap-2">
                        <span className="opacity-80">📅</span> {plan.name}
                      </h4>
                      <p className="text-[12px] text-slate-600 font-semibold mb-4">{plan.tagline}</p>
                      <div className="flex items-center gap-2">
                        {plan.originalPrice && <span className="text-[16px] text-slate-400 line-through font-bold">{plan.originalPrice}</span>}
                        <span className="text-[22px] md:text-[28px] font-extrabold text-slate-900">{plan.price}</span>
                      </div>
                    </div>

                    <button className="w-full py-2 px-2 md:py-3 md:px-4 rounded-[14px] bg-white border border-blue-200 hover:bg-blue-50 text-slate-800 font-bold text-[11px] md:text-[13px] mb-4 md:mb-6 transition-colors shadow-sm flex justify-center items-center gap-1 md:gap-2" onClick={() => handleCandidateAction(plan.id)}>
                      {plan.buttonText}
                      <span className="opacity-60">→</span>
                    </button>

                    <ul className="space-y-3.5 mt-auto">
                      {plan.features.map(feat => (
                        <li key={feat} className="flex items-start gap-1.5 md:gap-2.5 text-[10px] md:text-[12.5px] font-bold text-slate-700">
                          <img src="/landing/tick.svg" alt="Tick" className="w-3.5 h-3.5 shrink-0 mt-0.5" /> <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Attached Footer Feature */}
                  <div className="mt-8 hidden md:flex flex-col items-center text-center gap-1 w-full">
                    {typeof feature.icon === 'string' ? (
                      <img src={feature.icon} alt={feature.title} className="w-8 h-8 shrink-0 mb-1" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mb-1">
                        <feature.icon className="w-4 h-4 text-slate-700" />
                      </div>
                    )}
                    <div>
                      <h5 className="text-[12px] font-bold text-slate-900 leading-tight mb-1">{feature.title}</h5>
                      <p className="text-[10px] text-slate-600 font-medium leading-snug">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>

          {/* Recruiter Section */}
          <div className="flex flex-col flex-[1.5] gap-[20px]">
            {/* Recruiter Title */}
            <div className="flex justify-center px-4">
              <div className="flex items-center gap-3">
                <img src="/landing/recuirterplan.svg" alt="Recruiter Plan Icon" className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="text-[16px] font-extrabold text-slate-900">{pricingData.recruiter.title}</h3>
                  <p className="text-[11px] text-slate-600 font-medium">{pricingData.recruiter.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Recruiter Cards */}
            <div className="grid grid-cols-2 md:flex md:flex-row gap-[10px] justify-center relative">
              {pricingData.recruiter.plans.map((plan, index) => {
                const allFeatures = [...pricingData.candidate.footerFeatures, ...pricingData.recruiter.footerFeatures];
                const feature = allFeatures[index + 2]; // Map to 3rd, 4th, 5th feature
                return (
                <div key={plan.id} className="flex flex-col items-center w-full" style={{ maxWidth: '225px' }}>
                  <div className="bg-white border border-[#A7F3D0] shadow-xl shadow-emerald-500/5 relative flex flex-col hover:-translate-y-1 transition-transform w-full" style={{ background: "#A3F1FF", height: '250px', borderRadius: '10px', borderWidth: '1px', padding: '15px', gap: '10px', opacity: 1 }}>
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-emerald-200 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                        {plan.badge}
                      </div>
                    )}
                    <div className="mb-5 border-b border-emerald-200/50 pb-5">
                      <h4 className="text-[15px] md:text-[18px] font-extrabold text-slate-900 flex items-center gap-2">
                        <span className="opacity-80">🎬</span> {plan.name}
                      </h4>
                      <p className="text-[12px] text-slate-600 font-semibold mb-4">{plan.tagline}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[22px] md:text-[28px] font-extrabold text-slate-900">{plan.price}</span>
                        <span className="text-[12px] text-slate-500 font-semibold">{plan.period}</span>
                      </div>
                    </div>

                    <button className="w-full py-2 px-2 md:py-3 md:px-4 rounded-[14px] bg-white border border-emerald-200 hover:bg-emerald-50 text-slate-800 font-bold text-[11px] md:text-[13px] mb-4 md:mb-6 transition-colors shadow-sm flex justify-center items-center gap-1 md:gap-2" onClick={() => handleRecruiterAction(plan.id)}>
                      {plan.buttonText}
                    </button>

                    <ul className="space-y-3.5 mt-auto">
                      {plan.features.map(feat => (
                        <li key={feat} className="flex items-start gap-1.5 md:gap-2.5 text-[10px] md:text-[12.5px] font-bold text-slate-700">
                          <img src="/landing/tick.svg" alt="Tick" className="w-3.5 h-3.5 shrink-0 mt-0.5" /> <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Attached Footer Feature */}
                  <div className="mt-8 hidden md:flex flex-col items-center text-center gap-1 w-full">
                    {typeof feature.icon === 'string' ? (
                      <img src={feature.icon} alt={feature.title} className="w-8 h-8 shrink-0 mb-1" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mb-1">
                        <feature.icon className="w-4 h-4 text-slate-700" />
                      </div>
                    )}
                    <div>
                      <h5 className="text-[12px] font-bold text-slate-900 leading-tight mb-1">{feature.title}</h5>
                      <p className="text-[10px] text-slate-600 font-medium leading-snug">{feature.desc}</p>
                    </div>
                  </div>
                </div>

              )})}
            </div>
          </div>
        </div>

        {/* Footer Features Row (Mobile Only) */}
        <div
          className="bg-transparent p-4 md:hidden"
          style={{ marginTop: '15px' }}
        >
          <div className="grid grid-cols-2 gap-4 divide-slate-200/60">
            {[...pricingData.candidate.footerFeatures, ...pricingData.recruiter.footerFeatures].slice(0, 5).map((item, i) => (
              <div key={i} className={`flex items-start gap-2 ${i !== 0 && i !== 1 ? 'pt-2' : ''}`}>
                {typeof item.icon === 'string' ? (
                  <img src={item.icon} alt={item.title} className="w-7 h-7 shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <item.icon className="w-3.5 h-3.5 text-slate-700" />
                  </div>
                )}
                <div>
                  <h5 className="text-[11px] font-bold text-slate-900 mb-0.5 leading-tight">{item.title}</h5>
                  <p className="text-[9.5px] text-slate-600 font-medium leading-snug">{item.desc}</p>
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
