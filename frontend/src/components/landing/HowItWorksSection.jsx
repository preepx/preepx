import React from "react";
import { useNavigate } from "react-router-dom";
import { Award, HelpCircle, Play, User } from "lucide-react";

const NAV_ITEMS = [
  { iconSrc: null, Icon: User, label: "Profile", tone: "violet" },
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
  { iconSrc: null, Icon: Award, label: "Certificate", tone: "violet" },
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

function HowItWorksSection() {
  const navigate = useNavigate();

  return (
    <section className="hiw-section" id="how-it-works">
      <img
        className="hiw-section__bg"
        src="/landing/Frame.svg"
        alt=""
        aria-hidden="true"
      />

      <div className="hiw-section__inner">
        <h2 className="hiw-section__title">How PreepX Works?</h2>

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
                <img src="/landing/interview_scene.jpg" alt="AI mock interview session" />
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
    </section>
  );
}

export default HowItWorksSection;
