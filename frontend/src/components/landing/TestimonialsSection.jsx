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
      name: "Sneha Patel",
      role: "Software Developer",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&auto=format&fit=crop&q=80",
      quote: "PreepX helped me identify exactly where I was weak before my interview. The AI mock interviews are amazing!",
    },
    {
      name: "Rohit Verma",
      role: "Talent Acquisition Manager",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&auto=format&fit=crop&q=80",
      quote: "We can evaluate candidates based on actual skills instead of relying only on resumes. Hiring has become 10x faster.",
    },
  ],
  // Pair 2
  [
    {
      name: "Aditya Deshmukh",
      role: "Backend Engineer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&auto=format&fit=crop&q=80",
      quote: "The objective exams and coding challenge simulator matched the real hiring bar of top product companies.",
    },
    {
      name: "Kavita Rao",
      role: "Technical Recruiter",
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=160&h=160&auto=format&fit=crop&q=80",
      quote: "PreepX's verified certificates give us instant trust. We fast-tracked certified candidates directly to finals.",
    },
  ],
  // Pair 3
  [
    {
      name: "Vikram Sengupta",
      role: "Full Stack Developer",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=160&h=160&auto=format&fit=crop&q=80",
      quote: "The voice AI interview felt like talking to a real engineering director. The system design tips were spot on.",
    },
    {
      name: "Anjali Mehta",
      role: "HR Lead, TechCorp",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&h=160&auto=format&fit=crop&q=80",
      quote: "The assessments are accurate and the candidate quality we get here is much better than traditional job boards.",
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

  // Auto-scroll testimonials pairs every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentPairIndex((prev) => (prev + 1) % allTestimonials.length);
    }, 5000);
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
                    <span className="trio-author-name">— {item.name}</span>
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
