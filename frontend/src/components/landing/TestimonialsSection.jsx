import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Video,
  Scale,
  ArrowRight,
  MapPin,
  Sparkles,
} from "lucide-react";
import "@/styles/landing/TestimonialsLanding.css";

const allTestimonials = [
  // Pair 1
  [
    {
      name: "Urooj Khan",
      role: "AI Developer, Capgemini",
      avatar: "/testonomial/urooj_khan.png",
      quote: "I had a great experience using PreepX AI-powered hiring platform. It added a productive layer to improve interview skills, and understand what to expect during the hiring process. Highly recommended for landing dream opportunities.",
    },
    {
      name: "Sumit Sahu",
      role: "Data Science Associate, Impactsure",
      avatar: "/testonomial/sumit_sahu.jpeg",
      quote: "PreepX offers a smart and effective approach to data science interview preparation.For anyone preparing for data science roles, PreepX is a valuable platform for making interview preparation more structured and impactful.",
    },
  ],
  // Pair 2
  [
    {
      name: "Akhilesh Ranjan",
      role: "Senior DevOps Engineer, Capgemini",
      avatar: "/testonomial/akhilesh_ranjan.jpg",
      quote: "I had a great experience using PreepX AI-powered platform. It provides a practical way to sharpen DevOps interview skills, strengthen technical concepts, and get thoroughly prepared for real-world hiring rounds.",
    },
    {
      name: "Sameer Vishwakarma",
      role: "Data Science, Skill Nexis",
      avatar: "/testonomial/sameer_vishwakarma.JPG",
      quote: "Using PreepX changed how I approach technical assessments. The simulation environment is so close to actual product company rounds that when I sat for my interviews, nothing felt out of place.",
    },
  ],
  // Pair 3
  [
    {
      name: "Riya Rajput",
      role: "Software Developer, SmartED",
      avatar: "/testonomial/riya_rajput.png",
      quote: "I got selected through my campus placement with the help of PreepX. The structured assessments and mock interview preparation gave me the confidence to crack the hiring process smoothly.",
    },
    {
      name: "Gopal Kumar",
      role: "Backend Developer, Axepert Exhibits",
      avatar: "/testonomial/gopal_kumar.jpeg",
      quote: "PreepX significantly improved my interview preparation. The mock interviews, real-time feedback, and technical questions helped me identify my weak areas and build confidence for actual interviews.",
    },
  ],
  // Pair 4
  [
    {
      name: "Ritika Chourasiya",
      role: "Associate Developer, SmartED",
      avatar: "/testonomial/ritika_chaurasiya.jpeg",
      quote: "I got selected through campus placement with the support of PreepX. The assessments and interview preparation helped me build strong confidence and perform better throughout the hiring process.",
    },
    {
      name: "Anshu Vats",
      role: "AI/ML Developer",
      avatar: "/testonomial/anshu_vats.jpg",
      quote: "PreepX's rigorous evaluation environment pushed me to sharpen my problem-solving skills under time constraints. The detailed performance analytics after every mock test helped me pinpoint my exact weak spots.",
    },
  ],
];

const securityPoints = [
  {
    icon: Lock,
    title: "Secure Data",
    desc: "Your data is encrypted and stored securely.",
  },
  {
    icon: EyeOff,
    title: "Privacy First",
    desc: "We never share your data without permission.",
  },
  {
    icon: Video,
    title: "Encrypted Interviews",
    desc: "Audio & video data is encrypted end-to-end.",
  },
  {
    icon: Scale,
    title: "Transparent Evaluation",
    desc: "AI evaluations are fair, unbiased and explainable.",
  },
];

const sampleJobs = [
  {
    title: "Frontend Developer",
    skills: "React, Next.js, JavaScript",
    location: "Bengaluru",
    match: "92% Match",
    highlight: true,
  },
  {
    title: "Backend Developer",
    skills: "Node.js, Express, MongoDB",
    location: "Pune",
    match: "87% Match",
    highlight: false,
  },
  {
    title: "Full Stack Developer",
    skills: "MERN, TypeScript, AWS",
    location: "Remote",
    match: "90% Match",
    highlight: false,
  },
];

function TestimonialsSection() {
  const navigate = useNavigate();
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll testimonials pairs every 2 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentPairIndex((prev) => (prev + 1) % allTestimonials.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleNavigateToAuth = () => {
    navigate("/auth?role=candidate");
  };

  const handleNavigateToPrivacyPolicy = () => {
    navigate("/privacy-policy");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="prepx-trio-section section">
      <div className="trio-container">
        {/* ══════════════════════════════════════════════
            CARD 1: WHAT PEOPLE SAY (6 Testimonials, 2 stacked)
        ══════════════════════════════════════════════ */}
        <div
          className="trio-card trio-testimonials-card"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <h3 className="trio-card-title">What People Say</h3>

          <div className="trio-testimonials-stack">
            {allTestimonials[currentPairIndex].map((item, idx) => (
              <div key={idx} className="trio-testimonial-item">
                <div className="trio-avatar-wrap">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="trio-avatar-img"
                  />
                </div>
                <div className="trio-quote-content">
                  <p className="trio-quote-text">
                    "{item.quote}"
                  </p>
                  <div className="trio-author-info">
                    <span className="trio-author-name">{item.name}</span>
                    <span className="trio-author-role">{item.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial Pair Indicator Dots */}
          <div className="trio-dots-row">
            {allTestimonials.map((_, i) => (
              <button
                key={i}
                className={`trio-mini-dot ${currentPairIndex === i ? "active" : ""}`}
                onClick={() => setCurrentPairIndex(i)}
                aria-label={`Go to testimonial pair ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            CARD 2: TRUST & SECURITY
        ══════════════════════════════════════════════ */}
        <div className="trio-card trio-security-card">
          <h3 className="trio-card-title">Trust & Security</h3>

          <div className="trio-security-list">
            {securityPoints.map((item, idx) => (
              <div key={idx} className="trio-security-item">
                <div className="trio-sec-icon-box">
                  <item.icon size={18} />
                </div>
                <div className="trio-sec-text">
                  <h4 className="trio-sec-title">{item.title}</h4>
                  <p className="trio-sec-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            className="trio-sec-link-btn"
            onClick={handleNavigateToPrivacyPolicy}
            type="button"
          >
            <span>Learn more about our security</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* ══════════════════════════════════════════════
            CARD 3: EXPLORE TECH JOBS
        ══════════════════════════════════════════════ */}
        <div className="trio-card trio-jobs-card">
          <h3 className="trio-card-title">Explore Tech Jobs</h3>

          <div className="trio-jobs-box">
            {sampleJobs.map((job, idx) => (
              <div
                key={idx}
                className="trio-job-row"
                onClick={handleNavigateToAuth}
              >
                <div className="trio-job-left">
                  <h4
                    className={`trio-job-role ${job.highlight ? "job-role-blue" : ""}`}
                  >
                    {job.title}
                  </h4>
                  <span className="trio-job-skills">{job.skills}</span>
                </div>
                <div className="trio-job-right">
                  <span className="trio-job-loc">• {job.location}</span>
                  <span className="trio-job-match">{job.match}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            className="trio-explore-btn"
            onClick={handleNavigateToAuth}
            type="button"
          >
            <span>Explore All Jobs</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
