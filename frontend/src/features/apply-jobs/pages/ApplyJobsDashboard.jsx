import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase, Search, MapPin, Building2, ChevronRight,
  Bookmark, CheckCircle, Clock, Video, FileText, BellRing
} from "lucide-react";
import { getApplicationStats } from "../services/candidateJobsAPI";
import DashboardSkeleton from "@/components/recruiter/DashboardSkeleton";
import '../styles/ApplyJobsDashboard.css';

const FEATURED_JOBS = [
  {
    title: "Senior Frontend Developer",
    co: "Google", loc: "Bangalore, India",
    ctc: "₹18 - 25 LPA", type: "Full-time", mode: "Remote", time: "2h ago",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
    logoBg: "#fff",
  },
  {
    title: "Software Engineer (Backend)",
    co: "Microsoft", loc: "Hyderabad, India",
    ctc: "₹15 - 22 LPA", type: "Full-time", mode: "Hybrid", time: "4h ago",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    logoBg: "#fff",
  },
  {
    title: "Full Stack Developer",
    co: "Zomato", loc: "Gurgaon, India",
    ctc: "₹12 - 18 LPA", type: "Full-time", mode: "On-site", time: "6h ago",
    logo: "https://b.zmtcdn.com/images/logo/zomato_logo_2017.png",
    logoBg: "#e23744",
  },
  {
    title: "React Developer",
    co: "Swiggy", loc: "Bangalore, India",
    ctc: "₹10 - 16 LPA", type: "Full-time", mode: "Remote", time: "8h ago",
    logo: "https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg",
    logoBg: "#fc8019",
  },
];

const RECOMMENDED = [
  {
    title: "Frontend Developer", co: "Adobe", loc: "Noida, India",
    ctc: "₹12 - 18 LPA", time: "1d ago",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/42/Adobe_Corporate_logo.svg",
    logoBg: "#ff0000",
  },
  {
    title: "Backend Developer", co: "Paytm", loc: "Bangalore, India",
    ctc: "₹10 - 15 LPA", time: "2d ago",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Paytm_logo.png/320px-Paytm_logo.png",
    logoBg: "#002970",
  },
  {
    title: "Full Stack Engineer", co: "Grofers", loc: "Mumbai, India",
    ctc: "₹9 - 14 LPA", time: "2d ago",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Blinkit_logo.png/640px-Blinkit_logo.png",
    logoBg: "#f8d254",
  },
  {
    title: "UI/UX Developer", co: "Figma", loc: "Remote",
    ctc: "₹11 - 16 LPA", time: "3d ago",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg",
    logoBg: "#1e1e1e",
  },
];

const COMPANIES = [
  { name: "Google",    jobs: "120+", logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" },
  { name: "Microsoft", jobs: "95+",  logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
  { name: "Amazon",    jobs: "150+", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "Adobe",     jobs: "30+",  logo: "https://upload.wikimedia.org/wikipedia/commons/4/42/Adobe_Corporate_logo.svg" },
  { name: "TCS",       jobs: "80+",  logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg" },
  { name: "Infosys",   jobs: "70+",  logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg" },
];

export default function ApplyJobsDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    getApplicationStats().catch(() => ({})).then((s) => {
      setStats(s);
      setLoading(false);
    });
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="ajd-root">
      {/* ── LEFT COLUMN (Hero, Stats, Featured, Companies) ── */}
      <div className="ajd-left-col">
        {/* ── HERO BANNER (MINIMAL) ── */}
        <section className="ajd-hero-minimal">
          <h1 className="ajd-hm-title">Find your dream job now</h1>
          <p className="ajd-hm-sub">5 lakh+ jobs for you to explore</p>

          <div className="ajd-hm-search">
            <div className="ajd-hms-seg">
              <Search size={18} className="ajd-hms-icon" />
              <input placeholder="Enter skills / designations / companies" />
            </div>
            
            <div className="ajd-hms-div" />
            
            <div className="ajd-hms-seg ajd-hms-seg--mid">
              <select defaultValue="">
                <option value="" disabled>Select experience</option>
                <option>Fresher</option>
                <option>1-3 Years</option>
                <option>3-5 Years</option>
                <option>5+ Years</option>
              </select>
            </div>
            
            <div className="ajd-hms-div" />
            
            <div className="ajd-hms-seg">
              <input placeholder="Enter location" />
            </div>
            
            <button className="ajd-hms-btn">Search</button>
          </div>
        </section>

        {/* ── STAT CARDS ── */}
        <section className="ajd-stats-row">
          {[
            { icon: Briefcase,   color: "#4f46e5", bg: "#ede9fe", label: "Active Jobs",    val: 324,                  sub: "+12% this week" },
            { icon: Building2,   color: "#059669", bg: "#d1fae5", label: "Companies",      val: 156,                  sub: "+8 new companies" },
            { icon: FileText,    color: "#7c3aed", bg: "#ede9fe", label: "Applications",   val: stats?.total || 4,    sub: "2 in progress" },
            { icon: Video,       color: "#d97706", bg: "#fef3c7", label: "Interviews",     val: stats?.interviews || 12, sub: "3 upcoming" },
          ].map(({ icon: Icon, color, bg, label, val, sub }) => (
            <div key={label} className="ajd-stat-card">
              <div className="ajd-stat-icon" style={{ background: bg }}>
                <Icon size={22} color={color} />
              </div>
              <div>
                <div className="ajd-stat-val">{val}</div>
                <div className="ajd-stat-lbl">{label}</div>
                <div className="ajd-stat-sub" style={{ color: sub.startsWith("+") ? "#059669" : "#64748b" }}>{sub}</div>
              </div>
            </div>
          ))}
        </section>

        {/* ── FEATURED JOBS ── */}
        <section className="ajd-card">
          <div className="ajd-card-head">
            <h2>Featured Jobs</h2>
            <Link to="/apply-jobs/browse" className="ajd-view-link">View All Jobs →</Link>
          </div>
          <div className="ajd-job-list">
            {FEATURED_JOBS.map((job, i) => (
              <div key={i} className="ajd-job-row">
                <div className="ajd-jlogo" style={{ background: job.logoBg }}>
                  <img src={job.logo} alt={job.co} />
                </div>
                <div className="ajd-jinfo">
                  <h4>{job.title}</h4>
                  <p>{job.co} &bull; {job.loc}</p>
                  <div className="ajd-tags">
                    <span className="ajd-tag ajd-tag--green">{job.type}</span>
                    <span className="ajd-tag ajd-tag--blue">{job.mode}</span>
                  </div>
                </div>
                <div className="ajd-jright">
                  <strong>{job.ctc}</strong>
                  <span>{job.time}</span>
                </div>
                <button className="ajd-bm-btn"><Bookmark size={17} /></button>
              </div>
            ))}
          </div>
          <div className="ajd-view-all-wrap">
            <Link to="/apply-jobs/browse" className="ajd-view-all-btn">View All Jobs →</Link>
          </div>
        </section>

        {/* ── TOP COMPANIES ── */}
        <section className="ajd-card">
          <div className="ajd-card-head">
            <h2>Top Companies Hiring</h2>
            <Link to="/apply-jobs/companies" className="ajd-view-link">View All Companies →</Link>
          </div>
          <div className="ajd-co-grid">
            {COMPANIES.map((c) => (
              <div key={c.name} className="ajd-co-box">
                <img src={c.logo} alt={c.name} />
                <span>{c.name}</span>
                <span className="ajd-co-jobs">{c.jobs} Jobs</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <aside className="ajd-right-sidebar">
          {/* Recommended for you */}
          <div className="ajd-rcard">
            <div className="ajd-rcard-head">
              <h3>Recommended for you</h3>
              <Link to="/apply-jobs/browse" className="ajd-view-link">View all</Link>
            </div>
            <div className="ajd-rec-list">
              {RECOMMENDED.map((job, i) => (
                <div key={i} className="ajd-rec-item">
                  <div className="ajd-rec-logo" style={{ background: job.logoBg }}>
                    <img src={job.logo} alt={job.co} />
                  </div>
                  <div className="ajd-rec-info">
                    <h4>{job.title}</h4>
                    <p>{job.co} &bull; {job.loc}</p>
                    <strong>{job.ctc}</strong>
                  </div>
                  <div className="ajd-rec-meta">
                    <button className="ajd-bm-btn"><Bookmark size={14} /></button>
                    <span className="ajd-time">{job.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/apply-jobs/browse" className="ajd-see-more">View More Recommendations →</Link>
          </div>

          {/* Stand Out to Recruiters */}
          <div className="ajd-boost-card">
            <div className="ajd-boost-text">
              <h3>Stand Out to Recruiters</h3>
              <p>Complete these steps to increase your chances of getting hired.</p>
              <div className="ajd-boost-progress">
                <span>Progress</span>
                <div className="ajd-bp-bar"><div className="ajd-bp-fill" style={{ width: "80%" }} /></div>
                <span className="ajd-bp-pct">80%</span>
              </div>
              <Link to="/apply-jobs/profile" className="ajd-boost-btn">Improve Profile →</Link>
            </div>
            <div className="ajd-boost-art">
              <img src="https://cdni.iconscout.com/illustration/premium/thumb/businessman-3021652-2524843.png" alt="" />
            </div>
          </div>

          {/* Job Alerts */}
          <div className="ajd-rcard">
            <h3 style={{ marginBottom: 4 }}>Job Alerts</h3>
            <p className="ajd-rcard-sub">Get notified about new jobs that match your preferences.</p>
            <button className="ajd-alert-btn"><BellRing size={15} /> Create Job Alert</button>
          </div>
        </aside>
    </div>
  );
}
