import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Briefcase,
  ClipboardList,
  HelpCircle,
  MessageSquareText,
  Play,
  TrendingUp,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { iconSrc: "/landing/iconamoon_profile-fill.svg", label: "Profile", tone: "violet" },
  {
    iconSrc: "/landing/hugeicons_message-programming.svg",
    label: "Practise and Learn",
    tone: "blue",
  },
  {
    iconSrc: "/landing/fluent_notepad-edit-20-filled.svg",
    label: "Track your progress",
    tone: "violet",
  },
  { iconSrc: "/landing/fluent_certificate-24-filled.svg", label: "Certificate", tone: "violet" },
  {
    iconSrc: "/landing/fluent-mdl2_add-work.svg",
    label: "Find Opportunities",
    tone: "violet",
    invert: true,
  },
];

const PERF_STATS = [
  { label: "Tests", val: "26", delta: "+12" },
  { label: "Interviews", val: "6", delta: "+6" },
  { label: "Score", val: "90%", delta: "+10" },
  { label: "Certificates", val: "5", delta: "+5" },
];

const RECRUITER_NAV = [
  { iconSrc: "/landing/buildtest.svg", label: "Build a Test", tone: "text-blue-600" },
  { iconSrc: "/landing/reviewcondinate.svg", label: "Review Candidates", tone: "text-violet-700" },
  { iconSrc: "/landing/sortlist.svg", label: "Shortlisted Candidates", tone: "text-violet-700" },
  { iconSrc: "/landing/conduct intyerview.svg", label: "Conduct Interviews", tone: "text-violet-700" },
  { iconSrc: "/landing/hire.svg", label: "Hire Candidates", tone: "text-violet-700" },
];

const CANDIDATES = [
  {
    name: "Saloni Rajput",
    avatar: "/testonomial/saloni_rajput.JPG",
    skill: "94%",
    assessment: "88%",
    interviews: "74%",
    overall: "94%",
    status: "Top Match",
  },
  {
    name: "Sameer",
    avatar: "/testonomial/sameer_vishwakarma.JPG",
    skill: "84%",
    assessment: "74%",
    interviews: "64%",
    overall: "85%",
    status: "Shortlisted",
  },
  {
    name: "Anshu Vats",
    avatar: "/testonomial/anshu_vats.jpg",
    skill: "70%",
    assessment: "75%",
    interviews: "90%",
    overall: "80%",
    status: "Review",
  },
  {
    name: "Aman singh",
    avatar: "/testonomial/onam_paswan.jpeg",
    skill: "90%",
    assessment: "89%",
    interviews: "78%",
    overall: "95%",
    status: "Top Match",
  },
];

const PIPELINE = [
  { label: "Applied", val: "287", dot: "bg-[#9ec9e8]" },
  { label: "Assessment", val: "184", dot: "bg-[#6b9eb8]" },
  { label: "Shortlisted", val: "50", dot: "bg-[#4a7c99]" },
  { label: "Interviews", val: "35", dot: "bg-[#2f5d73]" },
  { label: "Hired", val: "10", dot: "bg-[#1e293b]" },
];

const TABLE_HEADS = ["Candidates", "Skill Match", "Assessment", "Interviews", "Overall", "Status"];

function HowItWorksSection() {
  const navigate = useNavigate();

  return (
    <section className="hiw-section" id="how-it-works">

      <div className="hiw-section__inner">
        <h2 className="hiw-section__title">
          How <span>PreepX</span> Works?
        </h2>

        <div className="hiw-main">
          <div className="hiw-main__face">
            <div className="hiw-board">
              <aside className="hiw-sidebar">
                <div className="hiw-nav">
                  {NAV_ITEMS.map((item) => (
                    <button type="button" key={item.label} className="hiw-nav__item">
                      {item.iconSrc ? (
                        <img
                          src={item.iconSrc}
                          alt=""
                          className={`hiw-nav__icon-img${item.invert ? " hiw-nav__icon-img--invert" : ""}`}
                        />
                      ) : (
                        <item.Icon size={18} strokeWidth={2.2} className="hiw-nav__icon" />
                      )}
                      <span className={`hiw-nav__label hiw-nav__label--${item.tone}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="hiw-help">
                  <div className="hiw-help__row">
                    <HelpCircle size={16} strokeWidth={2.4} />
                    <span>Need Help?</span>
                  </div>
                  <p>
                    Check out our help center or
                    <br />
                    contact support.
                  </p>
                </div>
              </aside>

              <div className="hiw-stage">
                <div className="hiw-interview">
                  <div className="hiw-interview__copy">
                    <div className="hiw-interview__meta">
                      <span className="hiw-badge">Ai Mock Interviews</span>
                      <span className="hiw-qcount">Question 3 of 6</span>
                    </div>

                    <h3>
                      Explain how memory
                      <br />
                      managment and the GIL work in
                      <br />
                      pythons applications.
                    </h3>

                    <p>
                      Think out loud and try to be as
                      <br />
                      detailed as possible.
                      <br />
                      You can take your time
                    </p>

                    <button
                      type="button"
                      className="hiw-start"
                      onClick={() => navigate("/auth?role=candidate")}
                    >
                      Start Interviews
                      <Play size={14} fill="white" />
                    </button>
                  </div>

                  <div className="hiw-photo">
                    <img src="/landing/Rectangle%209.svg" alt="AI mock interview session" />
                  </div>
                </div>

                <div className="hiw-perf">
                  <h4>Recent Performance</h4>
                  <div className="hiw-perf__grid">
                    {PERF_STATS.map((stat) => (
                      <div key={stat.label} className="hiw-perf__col">
                        <span className="hiw-perf__name">{stat.label}</span>
                        <span className="hiw-perf__val">{stat.val}</span>
                        <span className="hiw-perf__delta">{stat.delta}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hiw-main">
          <div className="hiw-main__face">
            <div className="hiw-board">
              <aside className="flex w-full flex-col gap-[10px] min-[860px]:w-[285px]">
                {RECRUITER_NAV.map((item) => (
                  <button type="button" key={item.label} className="hiw-nav__item">
                    <img
                      src={item.iconSrc}
                      alt=""
                      className="hiw-nav__icon-img"
                    />
                    <span className={`text-sm font-semibold hiw-nav__label-gradient`}>{item.label}</span>
                  </button>
                ))}
              </aside>

              <div className="hiw-stage">
                <h3 className="-translate-y-[8px] mb-1 text-left text-[16px] font-bold text-black">
                  FrontEnd Developer - Hiring
                </h3>

                <div className="overflow-x-auto">
                  <div className="grid min-w-[640px] grid-cols-[1.5fr_repeat(5,0.7fr)] items-center gap-y-3">
                    {TABLE_HEADS.map((heading) => (
                      <div
                        key={heading}
                        className={`text-[12px] font-semibold text-black ${heading === "Candidates" ? "text-left" : "text-center"
                          }`}
                      >
                        {heading}
                      </div>
                    ))}

                    {CANDIDATES.map((c) => (
                      <React.Fragment key={c.name}>
                        <div className="flex items-center gap-2 text-left">
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="h-8 w-8 shrink-0 rounded-full border border-gray-300 object-cover"
                          />
                          <span className="text-[13px] font-medium text-black">{c.name}</span>
                        </div>
                        <div className="text-center text-[13px] text-black">{c.skill}</div>
                        <div className="text-center text-[13px] text-black">{c.assessment}</div>
                        <div className="text-center text-[13px] text-black">{c.interviews}</div>
                        <div className="text-center text-[13px] text-black">{c.overall}</div>
                        <div className="text-center text-[13px] text-black">{c.status}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="mt-[12px] ml-0 w-full h-[110px] rounded-[8px] border border-gray-500 bg-[#84D4FF] px-[16px] pb-[8px] pt-[10px]">
                  <h4 className="mt-0 mb-[6px] translate-x-[20px] text-left font-sans text-[16px] font-medium leading-[24px] tracking-normal text-[#111]">Hiring Pipeline</h4>
                  <div className="relative mt-[4px] grid grid-cols-5 text-center">
                    <div className="pointer-events-none absolute left-[10%] right-[10%] top-[45px] h-[3px] rounded-full bg-gradient-to-r from-sky-200 via-slate-500 to-slate-800" />
                    {PIPELINE.map((step) => (
                      <div key={step.label} className="relative z-10 flex flex-col items-center">
                        <span className="text-[11px] font-medium text-black">{step.label}</span>
                        <span className="mb-[2px] text-[12px] font-bold text-black">{step.val}</span>
                        <span className={`h-[22px] w-[22px] rounded-full ${step.dot}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
