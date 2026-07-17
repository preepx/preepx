import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic, BarChart3, FileText, Sparkles, Shield, Zap, Users,
  Star, ChevronDown, ChevronUp, Check, Play, Award, Trophy, Target,
} from "lucide-react";
import { getPlatformStats } from "../services/userAPI";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [openFaq, setOpenFaq] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);

  const rotatingTexts = [
    "AI-Based Mock Interview",
    "AI-Powered Practice",
    "Real Interview Questions",
    "Personalized Feedback",
    "Improve Every Attempt"
  ];
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getPlatformStats().then(setPlatformStats).catch(() => { });
  }, []);

  const goToAuth = () => navigate(user ? "/interview" : "/auth");

  const heroStats = platformStats
    ? [
      { value: `${(platformStats.totalUsers * 10) || 0}+`, label: "Registered Users" },
      { value: `${(platformStats.totalInterviews * 10) || 0}+`, label: "Interviews Taken" },
      { value: `${(platformStats.completedInterviews * 10) || 0}+`, label: "Completed" },
      { value: "24/7", label: "AI Available" },
    ]
    : [
      { value: "70+", label: "Registered Users" },
      { value: "—", label: "Interviews Taken" },
      { value: "95%", label: "Satisfaction" },
      { value: "24/7", label: "AI Available" },
    ];

  const companies = ["Google", "Amazon", "Microsoft", "Meta", "Netflix", "Adobe", "Accenture", "Capgemini", "TCS"];

  const productCards = [
    { icon: Mic, title: "Live Interview Room", desc: "Webcam + voice + AI interviewer with real-time evaluation", color: "#4f46e5", path: "/interview" },
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Weekly charts, role breakdown, score trends", color: "#06b6d4", path: "/analytics" },
    { icon: Trophy, title: "Leaderboard", desc: "Compete globally, earn points, climb ranks", color: "#f59e0b", path: "/leaderboard" },
    { icon: Award, title: "Achievements", desc: "8 unlockable badges for milestones & streaks", color: "#8b5cf6", path: "/achievements" },
  ];

  const steps = [
    { icon: FileText, title: "Configure Session", desc: "Pick role, difficulty, type & skills. AI generates custom questions instantly." },
    { icon: Mic, title: "Practice Live", desc: "Voice interview with webcam, timer, and AI that listens & evaluates." },
    { icon: BarChart3, title: "Review & Improve", desc: "Detailed feedback, analytics, badges, and leaderboard rankings." },
  ];

  const features = [
    { icon: Sparkles, title: "AI Question Engine", desc: "Groq LLM generates role-specific questions with adjustable difficulty." },
    { icon: Shield, title: "Enterprise Security", desc: "JWT authentication, protected APIs, and secure data handling." },
    { icon: Zap, title: "Instant AI Scoring", desc: "0-10 score per answer with constructive feedback in seconds." },
    { icon: Users, title: "Resume Analyzer", desc: "PDF upload → skill extraction → personalized questions." },
    { icon: BarChart3, title: "Performance Analytics", desc: "Weekly activity charts, role breakdown, score history." },
    { icon: Star, title: "Gamification", desc: "Points, levels, streaks, badges, and community leaderboard." },
  ];

  const testimonials = [
    { name: "Priya Sharma", role: "Frontend Dev @ Adobe", text: "PrepX helped me practice 20+ mock interviews. The AI feedback is incredibly detailed!", rating: 5 },
    { name: "Rahul Verma", role: "SDE @ Capgemini", text: "Improved my answer quality by 40% in just 2 weeks. The analytics dashboard is a game-changer.", rating: 5 },
    { name: "Ananya Patel", role: "Data Analyst @ Accenture", text: "Resume-based questions were spot-on. Best interview prep platform I've used.", rating: 4 },
  ];

  const faqs = [
    { q: "Is PrepX free to use?", a: "Yes! All core features — AI interviews, analytics, leaderboard, and badges — are completely free." },
    { q: "How does AI evaluation work?", a: "Our Groq-powered LLM analyzes your spoken answers against each question and returns a score (0-10) with detailed feedback." },
    { q: "What roles can I practice for?", a: "Any role! Frontend, Backend, Data Science, DevOps, Product Manager — enter any title and skills." },
    { q: "Will my data show on the dashboard?", a: "Yes! Every interview you complete is saved to your account. Stats, history, and analytics update in real-time." },
    { q: "Can I use my own resume?", a: "Yes! You can upload your PDF resume and our AI will extract your skills to generate personalized interview questions." },
    { q: "How is the score calculated?", a: "Our AI evaluates your response against a rubric that checks for technical accuracy, clarity, and completeness. The score is out of 10." },
    { q: "Is my audio/video recorded?", a: "Your webcam feed is processed locally and is never recorded. Audio is temporarily processed for transcription only." },
    { q: "Can I cancel or restart an interview?", a: "Yes, you can end or restart a mock session at any time from the interview room." },
  ];

  return (
    <div className="landing">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-grid" />
        </div>
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-badge"><img src="/logo.png" alt="AI logo" style={{ height: '32px', width: 'auto' }} /><span>AI-Powered Interview Platform</span></div>
            <h1 className="hero-title">
              <span style={{ whiteSpace: 'nowrap' }}>Crack Your Dream Job</span>
              <br />With <span className="gradient-text">{rotatingTexts[textIndex]}</span>
            </h1>
            <p className="hero-desc">
              Practice with an AI interviewer, get instant scoring, track your progress with analytics,
              and compete on the leaderboard — all in one platform.
            </p>
            <div className="hero-actions">
              <button className="btn-hero-primary" onClick={goToAuth}>
                {user ? "Open Dashboard" : "Start Free — No Card Required"}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
              <button className="btn-hero-secondary" onClick={() => document.getElementById("product")?.scrollIntoView({ behavior: "smooth" })}>
                <Play size={16} /> See Platform
              </button>
            </div>
            <div className="hero-stats">
              {heroStats.map((s) => (
                <div key={s.label} className="stat-item">
                  <span className="stat-value">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-mockup">
            <div className="mockup-window">
              <div className="mockup-bar">
                <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
                <span className="mockup-title">PrepX — Interview Room</span>
              </div>
              <div className="mockup-body">
                <div className="mock-q">Q3: Explain React hooks and their use cases</div>
                <div className="mock-panels">
                  <div className="mock-cam">You</div>
                  <div className="mock-ai">AI</div>
                </div>
                <div className="mock-score"><Target size={14} /> Score: 8/10 — Great explanation!</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPANIES */}
      <section className="companies-strip">
        <p>Trusted by candidates preparing for</p>
        <div className="company-logos-wrapper">
          <div className="company-logos">
            {companies.map((c, i) => <span key={`c1-${i}`} className="company-name">{c}</span>)}
            {companies.map((c, i) => <span key={`c2-${i}`} className="company-name">{c}</span>)}
          </div>
        </div>
      </section>

      {/* PRODUCT SHOWCASE */}
      <section id="product" className="section product-section">
        <div className="section-header"><h2>Complete Interview Platform</h2><p>Built by a team of 10 — every feature you need</p></div>
        <div className="product-grid">
          {productCards.map((p) => (
            <div
              key={p.title}
              className="product-card"
              style={{ "--accent": p.color, cursor: "pointer" }}
              onClick={() => navigate(user ? p.path : "/auth")}
            >
              <div className="product-icon"><p.icon size={24} /></div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="section">
        <div className="section-header"><h2>How It Works</h2><p>From setup to offer letter in 3 steps</p></div>
        <div className="steps-grid">
          {steps.map((step, i) => (
            <div key={step.title} className="step-card">
              <div className="step-number">{i + 1}</div>
              <div className="step-icon-wrap"><step.icon size={24} /></div>
              <h3>{step.title}</h3><p>{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="section-cta">
          <button className="btn-hero-primary" onClick={goToAuth}>Try It Now — Free</button>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section features-section">
        <div className="section-header"><h2>Platform Features</h2><p>Enterprise-grade tools for interview success</p></div>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon"><f.icon size={22} /></div>
              <h3>{f.title}</h3><p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section testimonials-section">
        <div className="section-header"><h2>Loved by Candidates</h2><p>Real stories from our community</p></div>
        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <div key={t.name} className="testimonial-card">
              <div className="t-stars">{[...Array(t.rating)].map((_, i) => <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />)}</div>
              <p className="t-text">"{t.text}"</p>
              <div className="t-author">
                <div className="t-avatar">{t.name[0]}</div>
                <div><span className="t-name">{t.name}</span><span className="t-role">{t.role}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section faq-section">
        <div className="section-header"><h2>Frequently Asked Questions</h2></div>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? "open" : ""}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="faq-q"><span>{f.q}</span>{openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
              {openFaq === i && <p className="faq-a">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Your next interview starts here</h2>
          <p>Join {(platformStats?.totalUsers * 10) || "70"}+ candidates already preparing with AI.</p>
          <button className="btn-hero-primary" onClick={goToAuth}>{user ? "Go to Dashboard" : "Create Free Account"}</button>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
