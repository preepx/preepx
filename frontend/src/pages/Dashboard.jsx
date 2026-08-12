import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic, BarChart3, FileText, Sparkles, Shield, Zap, Users,
  Star, ChevronDown, ChevronUp, Check, Play, Award, Trophy, Target,
  Calendar, MessageSquare, Lock, Server
} from "lucide-react";
import { getPlatformStats } from "../services/userAPI";
import "./Dashboard.css";

function Dashboard({ landingRole = 'candidate', setLandingRole }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [openFaq, setOpenFaq] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

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

  const goToAuth = () => navigate(user ? "/user-dashboard" : "/auth");

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

  const companies = [
    { name: "Google", icon: "/company/google-2015-logo-svgrepo-com.svg" },
    { name: "Amazon", icon: "/company/amazon-2-logo-svgrepo-com.svg" },
    { name: "Meta", icon: "/company/facebook-logo-svgrepo-com.svg" },
    { name: "Netflix", icon: "/company/netflix-2-logo-svgrepo-com.svg" },
    { name: "IBM", icon: "/company/ibm-logo-svgrepo-com.svg" },
    { name: "Oracle", icon: "/company/oracle-6-logo-svgrepo-com.svg" },
    { name: "Salesforce", icon: "/company/salesforce-2-logo-svgrepo-com.svg" },
    { name: "LinkedIn", icon: "/company/linkedin-logo-svgrepo-com.svg" },
    { name: "Walmart", icon: "/company/walmart-logo-svgrepo-com.svg" },
    { name: "Cisco", icon: "/company/cisco-2-logo-svgrepo-com.svg" },
    { name: "DHL", icon: "/company/dhl-express-logo-svgrepo-com.svg" },
    { name: "Flipkart", icon: "/company/flipkart-logo-svgrepo-com.svg" },
    { name: "Booking.com", icon: "/company/bookingcom-logo-svgrepo-com.svg" },
    { name: "Hyundai", icon: "/company/hyundai-automobiles-1-logo-svgrepo-com.svg" },
    { name: "Mastercard", icon: "/company/mastercard-2-logo-svgrepo-com.svg" },
    { name: "Paypal", icon: "/company/paypal-logo-svgrepo-com.svg" },
    { name: "Visa", icon: "/company/visa-logo-svgrepo-com.svg" },
  ];

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
    { name: "Minal Singh", role: "Software Engineer @ Walmart", text: "PreepX helped me practice 20+ mock interviews. The AI feedback is incredibly detailed!", rating: 5 },
    { name: "Gopal Kumar", role: "Associate @ Amazon", text: "Improved my answer quality by 40% in just 2 weeks. The analytics dashboard is a game-changer.", rating: 5 },
    { name: "Ananya Patel", role: "Data Analyst @ Cisco", text: "Resume-based questions were spot-on. Best interview prep platform I've used.", rating: 4 },
  ];

  const faqs = [
    { q: "Is PreepX free to use?", a: "Yes! All core features — analytics, leaderboard, and badges — are completely free. However, each AI interview session costs 5 coins." },
    { q: "How does AI evaluation work?", a: "Our Groq-powered LLM analyzes your spoken answers against each question and returns a score (0-10) with detailed feedback." },
    { q: "What roles can I practice for?", a: "Any role! Frontend, Backend, Data Science, DevOps, Product Manager — enter any title and skills." },
    { q: "Will my data show on the dashboard?", a: "Yes! Every interview you complete is saved to your account. Stats, history, and analytics update in real-time." },
    { q: "Can I use my own resume?", a: "Yes! You can upload your PDF resume and our AI will extract your skills to generate personalized interview questions." },
    { q: "How is the score calculated?", a: "Our AI evaluates your response against a rubric that checks for technical accuracy, clarity, and completeness. The score is out of 10." },
    { q: "Is my audio/video recorded?", a: "Your webcam feed is processed locally and is never recorded. Audio is temporarily processed for transcription only." },
    { q: "Can I cancel or restart an interview?", a: "Yes, you can end or restart a mock session at any time from the interview room." },
    { q: "How do I deposit coins?", a: "You can securely deposit coins manually through the Wallet section, or simply by clicking on the coin package boxes." },
    { q: "Are interview notes available?", a: "Yes, detailed interview notes are available after each session and they are completely free!" }
  ];

  const recruiterTestimonials = [
    { name: "Sarah Jenkins", role: "Talent Acquisition @ TechCorp", text: "PreepX helped us cut our time-to-hire by 40%. The AI screening is incredibly accurate at identifying top talent.", rating: 5 },
    { name: "David Chen", role: "Engineering Manager @ StartupX", text: "We interviewed 50 candidates in 2 days using the automated AI interview room. Saved us countless engineering hours.", rating: 5 },
    { name: "Priya Sharma", role: "HR Director @ GlobalSystems", text: "The candidate comparison dashboard makes hiring decisions objective and data-driven. Highly recommended.", rating: 4 },
  ];

  const recruiterFaqs = [
    { q: "How accurate is the AI evaluation?", a: "Our AI is trained on millions of technical interviews and benchmarks candidates against industry standards with 94% accuracy compared to human technical interviewers." },
    { q: "Can we customize the interview questions?", a: "Yes, you can input specific job descriptions, required skills, and custom rubrics. The AI will tailor the interview strictly to your parameters." },
    { q: "Is the platform compliant with data privacy laws?", a: "Absolutely. We are fully compliant with GDPR and CCPA. Candidate data is encrypted and never shared with third parties." },
    { q: "How does the pricing scale?", a: "Our Starter and Professional plans are based on monthly subscriptions. Enterprise plans offer custom limits for high-volume hiring." },
    { q: "Can we integrate this with our ATS?", a: "Yes, our Enterprise plan includes API access and native integrations with popular ATS platforms like Greenhouse and Lever." },
  ];

  if (landingRole === 'recruiter') {
    return (
      <div className="landing recruiter-landing">
        {/* HERO */}
        <section className="hero">
          <div className="hero-bg">
            <div className="hero-orb hero-orb-1" />
            <div className="hero-orb hero-orb-2" />
            <div className="hero-orb hero-orb-3" />
            <div className="hero-grid" />
          </div>
          <div className="toggle-wrapper" style={{ zIndex: 10 }}>
            <div className="role-toggle-container">
              <button
                className={`role-toggle-btn ${landingRole === 'candidate' ? 'active' : ''}`}
                onClick={() => setLandingRole('candidate')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Candidate
              </button>
              <button
                className={`role-toggle-btn ${landingRole === 'recruiter' ? 'active' : ''}`}
                onClick={() => setLandingRole('recruiter')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                Recruiter
              </button>
            </div>
          </div>
          <div className="hero-inner">
            <div className="hero-content">
              <h1 className="hero-title">
                <span style={{ whiteSpace: 'nowrap' }}>Hire Better Talent.</span>
                <br />With <span className="gradient-text">{["Unmatched Speed.", "AI Screening.", "Smart Matching.", "AI Evaluation.", "Zero Hassle."][textIndex % 5]}</span>
              </h1>
              <p className="hero-desc">
                Discover, screen, evaluate and hire the right candidates using AI-powered hiring intelligence.
              </p>
              <div className="hero-actions">
                <button className="btn-hero-primary" onClick={() => navigate('/auth?role=recruiter')}>
                  Start Hiring
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
                <button className="btn-hero-secondary" onClick={() => document.getElementById("recruiter-features")?.scrollIntoView({ behavior: "smooth" })}>
                  <Play size={16} /> Explore Platform
                </button>
              </div>
            </div>

            <div className="hero-mockup recruiter-hero-mockup">
              <div className="recruiter-mockup-window">
                <div className="rm-header">
                  <span>Recruiter Dashboard</span>
                </div>
                <div className="rm-stats">
                  <div className="rm-stat"><Users size={16} color="#94a3b8" style={{ marginBottom: '6px' }} /><span>124</span><small>Candidates</small></div>
                  <div className="rm-stat"><Star size={16} color="#94a3b8" style={{ marginBottom: '6px' }} /><span>18</span><small>Shortlisted</small></div>
                  <div className="rm-stat"><Mic size={16} color="#94a3b8" style={{ marginBottom: '6px' }} /><span>07</span><small>Interviews</small></div>
                </div>
                <div className="rm-body">
                  <div className="rm-pipeline-bar">
                    <span>Applied</span>
                    <div className="progress"><div className="fill" style={{ width: '85%' }}></div></div>
                  </div>
                  <div className="rm-card">
                    <div className="rm-card-header">Top AI Match</div>
                    <div className="rm-card-body">
                      <strong>Software Developer</strong>
                      <span className="rm-badge">94% Match</span>
                      <span className="rm-status">Shortlisted</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <button 
                      onClick={() => navigate('/auth?role=recruiter')}
                      style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px dashed rgba(99, 102, 241, 0.4)', borderRadius: '8px', padding: '10px 0', width: '100%', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.6)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)'; }}
                    >
                      + Create New Job
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RECRUITER FEATURES */}
        <section id="recruiter-features" className="section features-section">
          <div className="section-header"><h2>Why Recruiters Use PreepX</h2><p>End-to-end AI hiring intelligence</p></div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><FileText size={22} /></div>
              <h3>AI Resume Screening</h3><p>Parse resumes, extract skills, and automatically match candidates against your job requirements.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Target size={22} /></div>
              <h3>Candidate Matching</h3><p>Rank candidates using AI-powered matching and accurate skills scoring.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Users size={22} /></div>
              <h3>Candidate Comparison</h3><p>Compare candidates side-by-side on experience, skills, and AI match scores.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Calendar size={22} /></div>
              <h3>Smart Interview Scheduling</h3><p>Schedule interviews, manage interviewer availability, and organize every hiring stage.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><MessageSquare size={22} /></div>
              <h3>Candidate Communication</h3><p>Automate invitations, shortlisting notifications, and offer communications.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><BarChart3 size={22} /></div>
              <h3>Hiring Analytics</h3><p>Track hiring performance, time-to-hire, and recruitment metrics visually.</p>
            </div>
          </div>
        </section>

        {/* CANDIDATE COMPARISON */}
        <div style={{ width: '100%', background: 'var(--surface)' }}>
          <section className="section comparison-section" style={{ padding: '80px 20px' }}>
            <div className="section-header"><h2>Candidate Comparison</h2><p>Compare candidates side-by-side with AI metrics</p></div>
            <div className="comparison-container">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th className="th-label">Compare Candidates</th>
                    <th className="th-center">Candidate A</th>
                    <th className="th-center">Candidate B</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="td-label">Experience</td>
                    <td className="td-center">4.2 yrs</td>
                    <td className="td-center">3.8 yrs</td>
                  </tr>
                  <tr>
                    <td className="td-label">Skills Match</td>
                    <td className="td-center">94%</td>
                    <td className="td-center">89%</td>
                  </tr>
                  <tr>
                    <td className="td-label">Assessment</td>
                    <td className="td-center">91%</td>
                    <td className="td-center">86%</td>
                  </tr>
                  <tr>
                    <td className="td-label">Interview</td>
                    <td className="td-center">88%</td>
                    <td className="td-center">84%</td>
                  </tr>
                  <tr>
                    <td className="td-label"><strong>AI Match</strong></td>
                    <td className="td-center" style={{ color: 'var(--success)', fontWeight: 'bold' }}>96%</td>
                    <td className="td-center" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>91%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* HOW HIRING WORKS / PIPELINE */}
        <section className="section pipeline-section" style={{ padding: '80px 20px' }}>
          <div className="section-header"><h2>From Job Description to Hire</h2><p>Seamless progression from application to offer</p></div>
          <div className="pipeline-flow">
            <div className="pipe-card" style={{ background: 'var(--surface)', width: '150px', padding: '24px 16px', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px', margin: '0 auto 16px' }}>01</div>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}><FileText size={24} /></div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Create Job</span>
            </div>
            <div className="pipe-arrow" style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>→</div>
            
            <div className="pipe-card" style={{ background: 'var(--surface)', width: '150px', padding: '24px 16px', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px', margin: '0 auto 16px' }}>02</div>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}><Sparkles size={24} /></div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>AI Screening</span>
            </div>
            <div className="pipe-arrow" style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>→</div>
            
            <div className="pipe-card" style={{ background: 'var(--surface)', width: '150px', padding: '24px 16px', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px', margin: '0 auto 16px' }}>03</div>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}><Target size={24} /></div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Matching</span>
            </div>
            <div className="pipe-arrow" style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>→</div>
            
            <div className="pipe-card" style={{ background: 'var(--surface)', width: '150px', padding: '24px 16px', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px', margin: '0 auto 16px' }}>04</div>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}><Users size={24} /></div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Shortlisting</span>
            </div>
            <div className="pipe-arrow" style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>→</div>
            
            <div className="pipe-card" style={{ background: 'var(--surface)', width: '150px', padding: '24px 16px', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px', margin: '0 auto 16px' }}>05</div>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}><Zap size={24} /></div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Assessment</span>
            </div>
            <div className="pipe-arrow" style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>→</div>
            
            <div className="pipe-card" style={{ background: 'var(--surface)', width: '150px', padding: '24px 16px', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px', margin: '0 auto 16px' }}>06</div>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}><Calendar size={24} /></div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Interview</span>
            </div>
            <div className="pipe-arrow" style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>→</div>
            
            <div className="pipe-card" style={{ background: 'var(--surface)', width: '150px', padding: '24px 16px', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px', margin: '0 auto 16px' }}>07</div>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}><Mic size={24} /></div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>AI Evaluation</span>
            </div>
            <div className="pipe-arrow" style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>→</div>
            
            <div className="pipe-card" style={{ background: 'var(--surface)', width: '150px', padding: '24px 16px', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', color: 'var(--success)', fontWeight: 'bold', fontSize: '12px', margin: '0 auto 16px' }}>08</div>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--success)' }}><Check size={24} /></div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Select</span>
            </div>
          </div>
        </section>

        {/* RECRUITER ANALYTICS */}
        <div style={{ width: '100%', background: 'var(--surface)' }}>
          <section className="section analytics-section" style={{ padding: '80px 20px' }}>
            <div className="section-header"><h2>Hiring Overview</h2><p>Track your recruitment performance in real-time</p></div>
            <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
              <div className="analytics-card" style={{ background: 'var(--bg)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                  <FileText size={16} /> Applications
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text)' }}>248</div>
              </div>
              <div className="analytics-card" style={{ background: 'var(--bg)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                  <Target size={16} /> Shortlisted
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text)' }}>42</div>
              </div>
              <div className="analytics-card" style={{ background: 'var(--bg)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                  <Mic size={16} /> Interviews
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text)' }}>18</div>
              </div>
              <div className="analytics-card" style={{ background: 'var(--bg)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                  <Check size={16} /> Selected
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--success)' }}>6</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '40px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><Calendar size={24} /></div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Avg. Time to Hire</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text)' }}>12 days</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}><Target size={24} /></div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>AI Screening Accuracy</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text)' }}>94%</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* SECURITY / TRUST */}
        <section className="section security-section" style={{ padding: '80px 20px' }}>
          <div className="section-header"><h2>Built for Secure Hiring</h2><p>Enterprise-grade security for candidate data and assessments</p></div>
          <div className="security-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', background: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}><Shield size={24} /></div>
              <div><h4 style={{ color: 'var(--text)', marginBottom: '8px', fontSize: '16px' }}>Secure Candidate Data</h4><p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>End-to-end encryption for all resumes, profiles, and contact details.</p></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', background: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}><Lock size={24} /></div>
              <div><h4 style={{ color: 'var(--text)', marginBottom: '8px', fontSize: '16px' }}>Role-Based Access</h4><p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>Controlled access for interviewers, recruiters, and hiring managers.</p></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', background: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent)' }}><Server size={24} /></div>
              <div><h4 style={{ color: 'var(--text)', marginBottom: '8px', fontSize: '16px' }}>Privacy-Focused</h4><p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>Compliant architecture ensuring user data is never shared externally.</p></div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <div style={{ width: '100%', background: 'var(--surface)' }}>
          <section className="section pricing-section" style={{ padding: '80px 20px' }}>
            <div className="section-header"><h2>Simple Pricing for Growing Teams</h2><p>Scale your hiring without scaling your costs</p></div>
            <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
              <div className="pricing-card" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ color: 'var(--text)', fontSize: '24px', marginBottom: '8px' }}>Starter</h3>
                <div style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px' }}>$49<span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 'normal' }}>/mo</span></div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', flexGrow: 1 }}>For small hiring teams</p>
                <button className="btn-hero-secondary" style={{ width: '100%', color: 'var(--text)', border: '1px solid var(--border)', background: 'transparent', display: 'flex', justifyContent: 'center' }}>Get Started</button>
              </div>
              <div className="pricing-card" style={{ background: 'rgba(99,102,241,0.05)', border: '2px solid var(--primary)', borderRadius: '16px', padding: '32px', textAlign: 'center', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', fontSize: '12px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '20px' }}>MOST POPULAR</div>
                <h3 style={{ color: 'var(--text)', fontSize: '24px', marginBottom: '8px' }}>Professional</h3>
                <div style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px' }}>$149<span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 'normal' }}>/mo</span></div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', flexGrow: 1 }}>For growing companies</p>
                <button className="btn-hero-primary" style={{ width: '100%', justifyContent: 'center' }}>Start Free Trial</button>
              </div>
              <div className="pricing-card" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ color: 'var(--text)', fontSize: '24px', marginBottom: '8px' }}>Enterprise</h3>
                <div style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px' }}>Custom</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', flexGrow: 1 }}>For high-volume hiring</p>
                <button className="btn-hero-secondary" style={{ width: '100%', color: 'var(--text)', border: '1px solid var(--border)', background: 'transparent', display: 'flex', justifyContent: 'center' }}>Contact Sales</button>
              </div>
            </div>
          </section>
        </div>

        {/* TESTIMONIALS */}
        <section className="section testimonials-section">
          <div className="section-header"><h2>Trusted by Top Teams</h2><p>See what hiring managers are saying</p></div>
          <div className="testimonials-grid">
            {recruiterTestimonials.map((t) => (
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
            {recruiterFaqs.map((f, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? "open" : ""}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="faq-q"><span>{f.q}</span>{openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
                {openFaq === i && <p className="faq-a">{f.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="cta-section">
          <div className="cta-card">
            <h2>Ready to Hire Smarter?</h2>
            <p>Join the AI revolution in technical hiring.</p>
            <button className="btn-hero-primary" onClick={() => navigate('/auth?role=recruiter')} style={{ margin: '0 auto' }}>
              Start Hiring
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="landing candidate-landing">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-grid" />
        </div>
        <div className="toggle-wrapper" style={{ zIndex: 10 }}>
          <div className="role-toggle-container">
            <button
              className={`role-toggle-btn ${landingRole === 'candidate' ? 'active' : ''}`}
              onClick={() => setLandingRole('candidate')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Candidate
            </button>
            <button
              className={`role-toggle-btn ${landingRole === 'recruiter' ? 'active' : ''}`}
              onClick={() => setLandingRole('recruiter')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              Recruiter
            </button>
          </div>
        </div>
        <div className="hero-inner">
          <div className="hero-content">
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
                <span className="mockup-title">PreepX — Interview Room</span>
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
            {companies.map((c, i) => <img key={`c1-${i}`} src={c.icon} alt={c.name} className="company-item-img" />)}
            {companies.map((c, i) => <img key={`c2-${i}`} src={c.icon} alt={c.name} className="company-item-img" />)}
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

      {/* Coming Soon Modal */}
      {/* showComingSoon && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--surface, #1e1e2d)',
            padding: '40px',
            borderRadius: '16px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%',
            border: '1px solid var(--border, #2d2d3f)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', color: 'var(--primary, #6366f1)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text, #fff)', margin: '0 0 12px 0' }}>
              Coming Soon
            </h2>
            <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '15px', lineHeight: '1.6', margin: '0 0 32px 0' }}>
              We are working hard on the Recruiter portal to help you hire top talent with AI. Stay tuned!
            </p>
            <button
              onClick={() => setShowComingSoon(false)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: 'var(--primary, #6366f1)',
                color: '#fff',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#4f46e5'}
              onMouseOut={(e) => e.target.style.background = 'var(--primary, #6366f1)'}
            >
              Got it
            </button>
          </div>
        </div>
      ) */}

    </div>
  );
};

export default Dashboard;
