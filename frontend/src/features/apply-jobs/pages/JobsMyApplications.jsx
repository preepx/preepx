import React, { useEffect, useState } from "react";
import {
  Briefcase, Search, Building2, MapPin, CheckCircle2, ChevronRight,
  Filter, Grid, List, Bookmark, CircleDot, ArrowRight, Check, Circle
} from "lucide-react";
import { Link } from "react-router-dom";
import SidebarApplicationAnalytics from "../components/SidebarApplicationAnalytics";
import SidebarImproveProfile from "../components/SidebarImproveProfile";
import { getProfile } from "@/services/userAPI";
import { calcCompletion } from "../utils/jobHelpers";
import '../styles/JobsMyApplications.css';
import '../styles/ApplyJobsDashboard.css'; // For the shared sidebar components

// --- MOCK DATA ---
const APPS = [
  {
    _id: "1",
    jobId: { title: "Software Developer", companyName: "Microsoft", location: "Noida, India" },
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    status: "applied",
    matchScore: 86,
    appliedAt: "2026-08-12",
    nextStep: "Shortlisting",
    jobType: "Full-time"
  },
  {
    _id: "2",
    jobId: { title: "Full Stack Developer", companyName: "TCS", location: "Bhopal, India" },
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
    status: "inprogress",
    matchScore: 72,
    appliedAt: "2026-08-10",
    nextStep: "Assessment",
    jobType: "Full-time"
  },
  {
    _id: "3",
    jobId: { title: "Frontend Developer", companyName: "Swiggy", location: "Remote" },
    logo: "https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg",
    status: "shortlisted",
    matchScore: 91,
    appliedAt: "2026-08-08",
    nextStep: "HR Interview",
    jobType: "Full-time"
  }
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

export default function JobsMyApplications() {
  const [activeTab, setActiveTab] = useState("All");
  const [profileData, setProfileData] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    import("../services/candidateJobsAPI").then(({ getApplicationStats }) => {
      getApplicationStats().then(setAnalytics).catch(() => setAnalytics(null));
    });
    getProfile()
      .then(p => setProfileData(p))
      .catch(() => setProfileData(null));
  }, []);

  const completion = calcCompletion(profileData);

  return (
    <div className="jma-page-wrapper">
      {/* HERO BANNER (FULL WIDTH) */}
      <section className="jma-hero" style={{ marginBottom: 24 }}>
        <div className="jma-hero-left">
          <div className="jma-hero-icon"><Briefcase size={24} /></div>
          <div className="jma-hero-text">
            <div className="jma-kicker">Pipeline · live status</div>
            <h1>My Applications</h1>
            <p>Track every stage — applied, assessment, interview, offer</p>
          </div>
        </div>
        <div className="jma-hero-stats">
          <div className="jma-hstat">
            <span className="jma-hstat-val">4</span>
            <span className="jma-hstat-lbl">Total Applied</span>
          </div>
          <div className="jma-hstat-div" />
          <div className="jma-hstat">
            <span className="jma-hstat-val">2</span>
            <span className="jma-hstat-lbl">In Progress</span>
          </div>
          <div className="jma-hstat-div" />
          <div className="jma-hstat">
            <span className="jma-hstat-val">0</span>
            <span className="jma-hstat-lbl">Offered</span>
          </div>
          <div className="jma-hstat-div" />
          <div className="jma-hstat">
            <span className="jma-hstat-val" style={{ color: '#10b981' }}>2</span>
            <span className="jma-hstat-lbl" style={{ color: '#10b981' }}>Shortlisted</span>
          </div>
        </div>
      </section>

      <div className="jma-root">

        {/* ── LEFT COLUMN ── */}
        <div className="jma-left-col">


        {/* TOOLBAR */}
        <div className="jma-toolbar-top">
          <div className="jma-tabs">
            {["All", "Shortlisted", "Assessment", "Offered", "Rejected"].map((t, i) => (
              <button
                key={t}
                className={`jma-tab ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t} <span className="jma-tab-count">{i === 0 ? 4 : i === 1 ? 2 : i === 2 ? 1 : 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="jma-toolbar-bottom">
          <div className="jma-search-bar">
            <Search size={18} color="#64748b" />
            <input placeholder="Search by job title, company, or location..." />
          </div>
          <select className="jma-sort-dropdown">
            <option>Sort by: Recent</option>
            <option>Sort by: Match Score</option>
          </select>
          <div className="jma-view-toggles">
            <button className="jma-view-btn active"><Grid size={18} /></button>
            <button className="jma-view-btn"><List size={18} /></button>
          </div>
        </div>

        {/* JOB CARDS */}
        <div className="jma-grid">
          {APPS.map((a) => (
            <article key={a._id} className="jma-card">
              <div className="jma-card-header">
                <div className="jma-card-top-left">
                  <div className="jma-card-logo">
                    <img src={a.logo} alt={a.jobId.companyName} />
                  </div>
                  <div className="jma-card-info">
                    <h3 className="jma-card-title">{a.jobId.title}</h3>
                    <p className="jma-card-company"><Building2 size={10} /> {a.jobId.companyName}</p>
                    <p className="jma-card-location">{a.jobId.location}</p>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <span className={`jma-status-badge ${a.status}`}>
                  <CheckCircle2 size={10} />
                  {a.status === 'applied' ? 'Applied' : a.status === 'inprogress' ? 'In Progress' : 'Shortlisted'}
                </span>
              </div>

              <div className="jma-match-sec">
                <div className="jma-match-header">
                  <span>Match Score</span>
                  <span style={{ color: a.status === 'applied' ? '#10b981' : a.status === 'inprogress' ? '#3b82f6' : '#f59e0b' }}>
                    {a.matchScore}%
                  </span>
                </div>
                <div className="jma-match-bar">
                  <div
                    className="jma-match-fill"
                    style={{
                      width: `${a.matchScore}%`,
                      background: a.status === 'applied' ? '#10b981' : a.status === 'inprogress' ? '#3b82f6' : '#f59e0b'
                    }}
                  />
                </div>
              </div>

              <div className="jma-card-meta">
                <div className="jma-meta-col">
                  <span className="jma-meta-lbl">{a.status === 'applied' ? 'Applied on' : 'Next Step'}</span>
                  <span className="jma-meta-val">{a.status === 'applied' ? new Date(a.appliedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : a.nextStep}</span>
                </div>
                <div className="jma-meta-col">
                  <span className="jma-meta-lbl">{a.status === 'applied' ? 'Job Type' : 'Applied on'}</span>
                  <span className="jma-meta-val">{a.status === 'applied' ? a.jobType : new Date(a.appliedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              <Link to={`/apply-jobs/applications/${a._id}`} className={`jma-card-cta ${a.status === 'inprogress' ? 'jma-cta-solid' : 'jma-cta-outline'}`}>
                {a.status === 'inprogress' ? 'Take Assessment' : 'View Details'} <ArrowRight size={12} />
              </Link>
            </article>
          ))}
        </div>

        {/* RECOMMENDED */}
        <div className="jma-sidebar-card" style={{ marginTop: '24px' }}>
          <div className="jma-sec-title-row" style={{ marginBottom: 20 }}>
            <h2>Recommended for you</h2>
            <Link to="/apply-jobs/browse" className="jma-link-blue">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="jma-rec-list">
            {RECOMMENDED.map((job, i) => (
              <div key={i} className="jma-rec-item">
                <div className="jma-rec-logo" style={{ background: job.logoBg }}>
                  <img src={job.logo} alt={job.co} />
                </div>
                <div className="jma-rec-info">
                  <h3 className="jma-rec-title">{job.title}</h3>
                  <p className="jma-rec-co">{job.co} • {job.loc}</p>
                  <strong style={{ fontSize: 11, color: 'inherit' }}>{job.ctc}</strong>
                </div>
                <div className="jma-rec-right">
                  <Bookmark size={14} color="#3b82f6" />
                  <span className="jma-rec-time">{job.time}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="jma-card-cta jma-cta-solid" style={{ marginTop: 16 }}>Explore More Jobs</button>
        </div>

      </div>

      {/* ── RIGHT COLUMN ── */}
      <aside className="jma-right-col">

        {/* ANALYTICS */}
        <SidebarApplicationAnalytics 
          analytics={analytics} 
          prefix="ajd" 
          containerClass="ajd-rcard" 
        />

        {/* IMPROVE PROFILE */}
        <SidebarImproveProfile 
          profileData={profileData} 
          completion={completion} 
          prefix="ajd" 
          containerClass="ajd-rcard" 
        />

      </aside>
      </div>
    </div>
  );
}
