import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Search, Bookmark, ChevronRight, CheckCircle, Sparkles, Home, MapPin } from "lucide-react";
import { getSavedJobs, toggleSaveJob } from "../services/candidateJobsAPI";
import EmptyState from "@/components/recruiter/EmptyState";
import Loader from "@/components/Loader";
import notify from "@/utils/notify";

// Reuse styles from JobBoard, ApplyJobsDashboard, and JobsAssessments
import '../styles/JobBoard.css';
import '../styles/ApplyJobsDashboard.css';
import '../styles/JobsAssessments.css';

import JobLogo from "../components/JobLogo";

export default function SavedJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const data = await getSavedJobs();
      setJobs(data || []);
    } catch (e) {
      notify.error("Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (jobId, e) => {
    e?.stopPropagation();
    try {
      const res = await toggleSaveJob(jobId);
      if (!res.saved) {
        setJobs(prev => prev.filter(j => j._id !== jobId));
        notify.success("Removed from saved jobs");
        
        // Also sync with localStorage for the dashboard count
        try {
          let ls = JSON.parse(localStorage.getItem("ajd_saved") || "[]");
          ls = ls.filter(x => x !== jobId);
          localStorage.setItem("ajd_saved", JSON.stringify(ls));
        } catch(e) {}
      }
    } catch (err) {
      notify.error("Failed to update saved job");
    }
  };

  return (
    <div className="jas-root">
      
      {/* Premium Hero Section matching JobsAssessments */}
      <section className="jas-hero">
        <div className="jas-hero-left">
          <div className="jas-hero-icon">
            <Bookmark size={28} />
          </div>
          <div className="jas-hero-text">
            <h1>Saved Jobs</h1>
            <p>Keep track of jobs you're interested in and apply when you're ready.</p>
          </div>
        </div>

        <div className="jas-hero-stats">
          <div className="jas-hstat">
            <span className="jas-hstat-val">{jobs.length}</span>
            <span className="jas-hstat-lbl">Saved</span>
          </div>
        </div>
      </section>

      <div style={{ paddingTop: '24px' }}>
        <div className="bj-jobs-list" style={{ transition: 'opacity 0.2s', minHeight: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? (
              <Loader />
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <Bookmark size={32} color="#94a3b8" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>No saved jobs yet</h3>
                <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '400px', marginBottom: '32px', lineHeight: '1.5' }}>
                  When you see a job you like on the job board, click the bookmark icon to save it for later.
                </p>
                <button 
                  onClick={() => navigate("/apply-jobs/browse")}
                  style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#4338ca'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#4f46e5'}
                >
                  <Search size={16} /> Browse Jobs
                </button>
              </div>
            ) : (
              jobs.map((job) => (
                <article key={job._id} className="bj-card" onClick={() => navigate("/apply-jobs/browse")} style={{ cursor: 'pointer' }}>

                  <div className="bjc-left-col">
                    <div className="bjc-logo">
                      <JobLogo job={job} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  </div>

                  <div className="bjc-mid-col">
                    <div className="bjc-tags-top">
                      {job.isHot && <span className="bjc-tag-hot"><Sparkles size={12} /> Hot</span>}
                      {job.isThirdParty && <span className="bjc-tag-hot" style={{ background: '#f8fafc', color: '#64748b' }}>External</span>}
                    </div>
                    <h3 className="bjc-title">
                      {job.title} <CheckCircle size={14} className="bjc-verified" />
                    </h3>
                    <div className="bjc-company-loc">
                      <span className="bjc-cname">{job.isThirdParty ? job.externalCompanyName : job.companyName}</span>
                      <span className="bjc-dot">•</span>
                      <span className="bjc-loc">{job.location || "Remote"}</span>
                    </div>

                    <div className="bjc-pills">
                      <span className="bjc-pill bjc-pill-ft">{job.employmentType === 'full_time' ? 'Full-time' : job.employmentType || 'Full-time'}</span>
                      <span className="bjc-pill bjc-pill-rem">{job.location?.toLowerCase().includes('remote') || job.workMode === 'remote' ? 'Remote' : 'Hybrid'}</span>
                    </div>

                    <div className="bjc-footer-meta">
                      {(job.experienceMin > 0 || job.experienceMax > 0) ? (
                        <span><Briefcase size={14} /> {job.experienceMin}-{job.experienceMax} Yrs</span>
                      ) : (
                        <span><Briefcase size={14} /> Not Specified</span>
                      )}
                      <span><Search size={14} /> Posted {Math.floor(Math.random() * 10) + 1}h ago</span>
                    </div>
                  </div>

                  <div className="bjc-right-col">
                    <div className="bjc-salary-book">
                      {(job.salaryMin > 0 || job.salaryMax > 0) && (
                        <div className="bjc-salary">₹{job.salaryMin || ''} - {job.salaryMax || ''} LPA</div>
                      )}
                      <button className="bjc-bookmark" onClick={(e) => handleToggleSave(job._id, e)}>
                        <Bookmark size={18} fill="currentColor" />
                      </button>
                    </div>
                    {job.isThirdParty ? (
                      <button className="bjc-view-btn" onClick={(e) => { e.stopPropagation(); window.open(job.applyLink, '_blank'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                        Apply <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button className="bjc-view-btn" onClick={(e) => { e.stopPropagation(); navigate("/apply-jobs/browse") }}>Apply</button>
                    )}
                  </div>

                </article>
              ))
            )}
          </div>
      </div>
    </div>
  );
}
