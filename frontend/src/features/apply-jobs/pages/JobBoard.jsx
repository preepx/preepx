import React, { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useSearchParams } from "react-router-dom";
import { Briefcase, MapPin, Sparkles, Search, Building2, ChevronRight, CheckCircle, ChevronDown, FileText, Bookmark, Bell, Loader2 } from "lucide-react";
import { getPublishedJobs, applyToJob, toggleSaveJob, getSavedJobs } from "../services/candidateJobsAPI";
import { getProfile } from "@/services/userAPI";
import Loader from "@/components/Loader";
import EmptyState from "@/components/recruiter/EmptyState";
import notify from "@/utils/notify";
import '../styles/JobBoard.css'; // Keep for overrides
import '../styles/ApplyJobsDashboard.css'; // Reuse premium styles

// Profile completion calculator matching JobsProfile.jsx
function calcCompletion(user) {
  if (!user) return 0;
  const checks = [
    !!user.fullName,
    !!user.email,
    !!user.phone,
    !!user.city,
    !!user.headline,
    (user.skills || []).length > 0,
    (user.experience || []).length > 0,
    (user.education || []).length > 0,
    !!user.resumeUrl,
    !!user.profilePic,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

const getLastTerm = (str) => {
  const parts = str.split(",");
  return parts[parts.length - 1].trimStart();
};

const appendSuggestion = (currentStr, newSug) => {
  const parts = currentStr.split(",");
  parts.pop();
  parts.push(parts.length > 0 ? ` ${newSug}` : newSug);
  return parts.join(",") + ", ";
};

const JobLogo = ({ job, className, style }) => {
  const [error, setError] = useState(false);
  const compName = job.isThirdParty ? job.externalCompanyName : job.companyName;

  if (error || (!job.externalCompanyLogo && !["Google", "Microsoft", "Zomato", "Swiggy", "Paytm", "Adobe"].includes(job.companyName))) {
    return (
      <div className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#64748b', fontWeight: 'bold' }}>
        {(compName || 'C').charAt(0).toUpperCase()}
      </div>
    );
  }

  let src = job.externalCompanyLogo;
  if (!job.isThirdParty) {
    if (job.companyName === "Google") src = "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg";
    else if (job.companyName === "Microsoft") src = "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg";
    else if (job.companyName === "Zomato") src = "https://upload.wikimedia.org/wikipedia/commons/b/bd/Zomato_Logo.svg";
    else if (job.companyName === "Swiggy") src = "https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg";
    else if (job.companyName === "Paytm") src = "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg";
    else if (job.companyName === "Adobe") src = "https://upload.wikimedia.org/wikipedia/commons/4/42/Adobe_Acrobat_DC_logo_2020.svg";
  }

  return (
    <img
      src={src}
      alt={compName}
      className={className}
      style={style}
      onError={() => setError(true)}
      onLoad={(e) => {
        if (e.target.naturalWidth <= 10) {
          setError(true);
        }
      }}
    />
  );
};

export default function JobBoard() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Fetch all unique data once for suggestions
  const [allTags, setAllTags] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    getProfile()
      .then(p => setProfileData(p))
      .catch(console.error);

    getSavedJobs()
      .then(saved => {
        if (saved && saved.length > 0) {
          setSavedIds(saved.map(sj => sj._id || sj));
        }
      })
      .catch(console.error);
  }, []);

  const handleToggleSave = async (jobId, e) => {
    e?.stopPropagation();
    try {
      const res = await toggleSaveJob(jobId);
      setSavedIds(prev => {
        const next = res.saved ? [...prev, jobId] : prev.filter(x => x !== jobId);
        notify.success(res.saved ? "Saved to your list" : "Removed from saved jobs");
        return next;
      });
    } catch (err) {
      notify.error("Failed to save job");
    }
  };

  useEffect(() => {
    const list = jobs || [];
    const titles = list.map(j => j.title).filter(Boolean);
    const roles = list.map(j => j.role).filter(Boolean);
    const skills = list.flatMap(j => j.skills || []);
    setAllTags(prev => [...new Set([...prev, ...titles, ...roles, ...skills])]);

    const locs = list.map(j => j.location).filter(Boolean);
    setAllLocations(prev => [...new Set([...prev, ...locs])]);
  }, [jobs]);

  const [experience, setExperience] = useState(searchParams.get("exp") || "");
  const [showExpDropdown, setShowExpDropdown] = useState(false);
  const expContainerRef = useRef(null);

  const [locationSearch, setLocationSearch] = useState(searchParams.get("loc") || "");
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);
  const locContainerRef = useRef(null);

  const [internetSuggestions, setInternetSuggestions] = useState([]);
  const [internetLocSuggestions, setInternetLocSuggestions] = useState([]);

  // Fetch internet skills
  useEffect(() => {
    const term = getLastTerm(search);
    if (!term.trim()) {
      setInternetSuggestions([]);
      return;
    }
    const handler = setTimeout(() => {
      fetch(`https://api.datamuse.com/sug?s=${term}`)
        .then(res => res.json())
        .then(data => {
          const words = data.map(d => d.word.charAt(0).toUpperCase() + d.word.slice(1));
          setInternetSuggestions(words);
        })
        .catch(console.error);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch internet locations
  useEffect(() => {
    const term = getLastTerm(locationSearch);
    if (!term.trim()) {
      setInternetLocSuggestions([]);
      return;
    }
    const handler = setTimeout(() => {
      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${term}&count=5`)
        .then(res => res.json())
        .then(data => {
          if (data.results) {
            const locs = data.results.map(d => `${d.name}${d.admin1 ? `, ${d.admin1}` : ''}`);
            setInternetLocSuggestions(locs);
          } else {
            setInternetLocSuggestions([]);
          }
        })
        .catch(console.error);
    }, 300);
    return () => clearTimeout(handler);
  }, [locationSearch]);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [applying, setApplying] = useState(null);
  const [filter, setFilter] = useState("all");
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (locContainerRef.current && !locContainerRef.current.contains(event.target)) {
        setShowLocSuggestions(false);
      }
      if (expContainerRef.current && !expContainerRef.current.contains(event.target)) {
        setShowExpDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    const term = getLastTerm(search).toLowerCase();
    if (!term.trim()) return [];

    const pool = [
      "HR", "Human Resources", "MERN Stack", "MEAN Stack", "Marketing", "Management",
      "HTML", "CSS", "Javascript", "Java", "Python", "React.js", "Node.js", "Angular", "Vue.js",
      "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
      "Data Scientist", "Data Analyst", "Machine Learning", "Artificial Intelligence",
      "DevOps Engineer", "Cloud Architect", "AWS", "Azure", "SQL", "MongoDB",
      "Business Analyst", "Product Manager", "Project Manager", "UI/UX Designer",
      "Graphic Designer", "Sales", "Finance", "Accountant", "Customer Support", "Operations",
      "PHP", "Laravel", "C#", ".NET", "Ruby on Rails", "Go", "Rust", "Swift", "Kotlin", "Flutter",
      "React Native", "Spring Boot", "Django", "Flask", "Cybersecurity", "Blockchain", "Web3"
    ];

    const combinedOptions = [...new Set([...pool, ...allTags, ...internetSuggestions])];

    const startsWith = combinedOptions.filter(item => item.toLowerCase().startsWith(term));
    const includes = combinedOptions.filter(item => item.toLowerCase().includes(term) && !item.toLowerCase().startsWith(term));

    return [...startsWith, ...includes].slice(0, 8);
  }, [search, allTags, internetSuggestions]);

  const locSuggestions = useMemo(() => {
    const term = getLastTerm(locationSearch).toLowerCase();
    if (!term.trim()) return [];

    const pool = [
      "Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai", "Kolkata",
      "Ahmedabad", "Gurgaon", "Noida", "Remote", "Pune, Maharashtra", "Chandigarh",
      "Jaipur", "Indore", "Lucknow", "Bhopal", "Surat", "Nagpur", "Kochi",
      "Thiruvananthapuram", "Coimbatore", "Visakhapatnam", "Bhubaneswar", "Guwahati",
      "United States", "United Kingdom", "Canada", "Australia", "Singapore", "Dubai"
    ];

    const combinedOptions = [...new Set([...pool, ...allLocations, ...internetLocSuggestions])];

    const startsWith = combinedOptions.filter(item => item.toLowerCase().startsWith(term));
    const includes = combinedOptions.filter(item => item.toLowerCase().includes(term) && !item.toLowerCase().startsWith(term));

    return [...startsWith, ...includes].slice(0, 6);
  }, [locationSearch, allLocations, internetLocSuggestions]);



  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      const cleanSearch = search.replace(/^[,\s]+|[,\s]+$/g, '');
      setDebouncedSearch(cleanSearch);
      setPage(1); // Reset page on new search
      setHasMore(true);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchJobs = async () => {
      if (isFirstLoad) setInitialLoading(true);
      else if (page === 1) setIsSearching(true);
      else setLoadingMore(true);

      try {
        const d = await getPublishedJobs({ search: debouncedSearch, page, limit: 14 });
        const newJobs = d.jobs || [];

        setJobs(prev => page === 1 ? newJobs : [...prev, ...newJobs]);
        setHasMore(d.page < d.pages); // Or newJobs.length > 0 if pages isn't perfectly returned
      } catch (e) {
        notify.error("Could not load jobs");
      } finally {
        setIsFirstLoad(false);
        setInitialLoading(false);
        setIsSearching(false);
        setLoadingMore(false);
      }
    };

    if (hasMore || page === 1) {
      fetchJobs();
    }
  }, [debouncedSearch, page]);

  const displayedJobs = useMemo(() => {
    const list = [...jobs];
    if (filter === "match") {
      return list
        .filter((j) => !j.applied && (j.matchScore ?? 0) >= 35)
        .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    }
    return list.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  }, [jobs, filter]);

  useEffect(() => {
    getPublishedJobs({ limit: 50 }).then(d => {
      const list = d.jobs || [];
      let recommended = [];

      // 1. Profile Matching (Match Score >= 35)
      const profileMatches = list.filter(j => (j.matchScore ?? 0) >= 35).sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
      recommended.push(...profileMatches);

      // 2. Trending / Hot Jobs (isHot flag or top tier companies)
      if (recommended.length < 4) {
        const topCompanies = ['Google', 'Microsoft', 'Adobe', 'Amazon', 'Meta', 'Paytm', 'Zomato', 'Swiggy'];
        const hotJobs = list.filter(j => {
          if (recommended.find(r => r._id === j._id)) return false;
          return j.isHot || topCompanies.includes(j.companyName);
        });
        recommended.push(...hotJobs);
      }

      // 3. Fallback Logic (Whatever has the highest match score or just newly fetched)
      if (recommended.length < 4) {
        const remaining = list.filter(j => !recommended.find(r => r._id === j._id)).sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
        recommended.push(...remaining);
      }

      setRecommendedJobs(recommended.slice(0, 4));
    }).catch(console.error);
  }, []);

  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      const res = await applyToJob(jobId);
      notify.success(res.message || "Application submitted!");
      setJobs((prev) => prev.map((j) => (j._id === jobId ? { ...j, applied: true } : j)));
    } catch (e) {
      notify.error(e.response?.data?.message || "Apply failed");
    } finally {
      setApplying(null);
    }
  };

  if (initialLoading) return <Loader />;

  return (
    <div className="bj-root">
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      {/* ── MAIN TWO-COLUMN LAYOUT ── */}
      <div className="bj-main">

        {/* ── HEADER & SEARCH (Grid Row 1, Col 1-2) ── */}
        <header className="bj-header" style={{ gridColumn: '1 / -1', position: 'relative', zIndex: 50 }}>
          <div className="bj-header-inner">
            <div className="bj-kicker"><span className="bj-live-dot" /> Live job board · verified employers</div>
            <h1 className="bj-title">Find your next role</h1>
            <p className="bj-subtitle">Search 5 lakh+ openings across MNCs, startups, remote and walk-in drives</p>

            <div className="ajd-hb-search" style={{ marginTop: '28px' }}>
              <div className="ajd-hbs-seg" ref={searchContainerRef}>
                <Search className="ajd-hbs-icon" size={16} />
                <input
                  type="text"
                  placeholder="Enter skills / designations / companies"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {/* Existing Suggestions dropdown logic */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="ns-suggestions-dropdown">
                    {suggestions.map((sug, idx) => (
                      <div
                        key={idx}
                        className="ns-suggestion-item"
                        onClick={() => {
                          setSearch(appendSuggestion(search, sug));
                          setShowSuggestions(false);
                        }}
                      >
                        <Search size={14} className="ns-suggestion-icon" /> {sug}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="ajd-hbs-div" />

              <div className="ajd-hbs-seg ajd-hbs-seg--mid" ref={expContainerRef} onClick={() => setShowExpDropdown(!showExpDropdown)} style={{ cursor: 'pointer' }}>
                <span style={{ flex: 1, fontSize: "13px", opacity: experience === "" ? 0.6 : 1 }}>
                  {experience === "" ? "Select experience" : experience === "0" ? "Fresher" : `${experience} years`}
                </span>
                <ChevronDown size={16} className="ajd-hbs-icon" />
                {showExpDropdown && (
                  <div className="ns-suggestions-dropdown ns-exp-dropdown" style={{ border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", borderRadius: "8px", top: "calc(100% + 8px)", maxHeight: "250px", overflowY: "auto" }}>
                    <div className="ns-suggestion-item" onClick={() => setExperience("0")}>
                      Fresher <span style={{ color: "#6b7280", marginLeft: "6px", fontSize: "13px" }}>(less than 1 year)</span>
                    </div>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(y => (
                      <div key={y} className="ns-suggestion-item" onClick={() => setExperience(y.toString())}>
                        {y} {y === 1 ? "year" : "years"}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="ajd-hbs-div" />

              <div className="ajd-hbs-seg" ref={locContainerRef}>
                <MapPin className="ajd-hbs-icon" size={16} />
                <input
                  type="text"
                  placeholder="Enter location"
                  value={locationSearch}
                  onChange={(e) => {
                    setLocationSearch(e.target.value);
                    setShowLocSuggestions(true);
                  }}
                  onFocus={() => setShowLocSuggestions(true)}
                />
                {/* Location Suggestions dropdown logic */}
                {showLocSuggestions && locSuggestions.length > 0 && (
                  <div className="ns-suggestions-dropdown ns-loc-dropdown">
                    {locSuggestions.map((loc, idx) => (
                      <div
                        key={idx}
                        className="ns-suggestion-item"
                        onClick={() => {
                          setLocationSearch(appendSuggestion(locationSearch, loc));
                          setShowLocSuggestions(false);
                        }}
                      >
                        <MapPin size={14} className="ns-suggestion-icon" /> {loc}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="ajd-hbs-btn">Search Jobs</button>
            </div>

            <div className="bj-quick-cats">
              {["Remote", "Internship", "Fresher", "Backend", "Frontend", "Data Science", "Product"].map((c) => (
                <button
                  type="button"
                  key={c}
                  className="bj-quick-cat"
                  onClick={() => setSearch(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* LEFT COLUMN: Job Cards */}
        <div className="bj-left-col">

          <div className="bj-jobs-list" style={{ transition: 'opacity 0.2s' }}>
            {(initialLoading || isSearching) ? (
              <Loader />
            ) : displayedJobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title={filter === "match" ? "No strong matches yet" : "No open jobs right now"}
                description={filter === "match" ? "Add skills on Profile or upload your resume to improve matching." : "Check back soon — recruiters are posting new roles."}
                actionLabel={filter === "match" ? "Complete Profile" : null}
                actionTo={filter === "match" ? "/profile" : null}
              />
            ) : (
              displayedJobs.map((job) => (
                <article key={job._id} className="bj-card" onClick={() => setSelectedJob(job)} style={{ cursor: 'pointer' }}>

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
                        <Bookmark size={18} fill={savedIds.includes(job._id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    {job.isThirdParty ? (
                      <button className="bjc-view-btn" onClick={(e) => { e.stopPropagation(); window.open(job.applyLink, '_blank'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                        Apply <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button className="bjc-view-btn" onClick={(e) => { e.stopPropagation(); handleApply(job._id); }}>Apply</button>
                    )}
                  </div>

                </article>
              ))
            )}
          </div>

          {hasMore && !isSearching && !initialLoading && displayedJobs.length > 0 && (
            <div className="bj-load-more" style={{ textAlign: 'center', marginTop: '30px' }}>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={loadingMore}
                style={{
                  padding: '10px 24px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                {loadingMore ? 'Loading...' : 'Load More Jobs'}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Widgets */}
        <div className="bj-right-col">

          {/* Widget 1: Profile Complete */}
          <div className="bj-widget bj-profile-card">
            <h3 className="bjp-title">Complete Your Profile</h3>
            <p className="bjp-subtitle">Increase your visibility to recruiters by completing your profile.</p>
            <div className="bjp-progress-ring" style={{ '--progress-pct': `${calcCompletion(profileData)}%` }}>
              <div className="bjp-progress-inner">
                {calcCompletion(profileData)}%
              </div>
            </div>
            <Link to="/profile" className="bjp-btn" style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>Complete Profile &rarr;</Link>
          </div>

          {/* Widget 2: Recommended */}
          <div className="bj-widget bj-recs">
            <div className="bjw-header">
              <h3>Recommended for you</h3>
              <a href="#">View all</a>
            </div>
            <div className="bjw-rec-list">
              {recommendedJobs.length > 0 ? recommendedJobs.map((job) => {
                const compName = job.isThirdParty ? job.externalCompanyName : job.companyName;
                const salStr = (job.salaryMin > 0 || job.salaryMax > 0) ? `₹${job.salaryMin} - ${job.salaryMax} LPA` : 'Not Disclosed';

                return (
                  <div key={job._id} className="bjw-rec-item" onClick={() => setSelectedJob(job)} style={{ cursor: 'pointer' }}>
                    <JobLogo job={job} className="bjw-rec-logo" style={{ objectFit: 'contain' }} />
                    <div className="bjw-rec-info" style={{ overflow: 'hidden' }}>
                      <h4 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{job.title}</h4>
                      <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{compName} • {job.location || 'Remote'}</p>
                      <span className="bjw-rec-sal">{salStr}</span>
                    </div>
                    <div className="bjw-rec-actions">
                      <Bookmark size={14} className="bjw-rec-book" onClick={(e) => e.stopPropagation()} />
                      <span className="bjw-rec-time">{`${(parseInt(job._id.slice(-5), 16) % 24) + 1}h ago`}</span>
                    </div>
                  </div>
                );
              }) : (
                <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px 0' }}>No recommendations found</p>
              )}
            </div>
            <a href="#" className="bjw-more-link">View More Recommendations &rarr;</a>
          </div>

          {/* Widget 3: Job Alerts */}
          <div className="bj-widget bj-alerts">
            <h3>Job Alerts</h3>
            <p>Get notified about new jobs that match your preferences.</p>
            <button className="bj-alert-btn"><Bell size={16} /> Create Job Alert</button>
          </div>

        </div>

      </div>

      {/* Details Modal (Candidate Side) */}
      {selectedJob && createPortal(
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) setSelectedJob(null); }}>
          <div className="modal-content bj-modal" style={{ borderRadius: '12px', width: '100%', maxWidth: '800px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button
              onClick={() => setSelectedJob(null)}
              className="bj-modal-close"
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <h1 className="bj-modal-title" style={{ fontSize: '1.8rem', marginBottom: '0.5rem', marginTop: 0 }}>{selectedJob.title}</h1>
            <p className="bj-modal-meta" style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <a href={selectedJob.isThirdParty ? selectedJob.applyLink : '#'} target={selectedJob.isThirdParty ? "_blank" : "_self"} rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                {selectedJob.isThirdParty ? selectedJob.externalCompanyName : selectedJob.companyName}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px' }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
            </p>
            <p className="bj-modal-meta" style={{ marginBottom: '1.5rem' }}>{selectedJob.location || 'Remote'}</p>

            <div className="bj-modal-actions" style={{ display: 'flex', gap: '12px', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--bj-border, #e2e8f0)' }}>
              {selectedJob.isThirdParty ? (
                <a href={selectedJob.applyLink} target="_blank" rel="noreferrer" style={{ background: '#2563eb', color: '#fff', textDecoration: 'none', padding: '10px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                  Apply on company site
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
              ) : (
                <button onClick={() => { handleApply(selectedJob._id); setSelectedJob(null); }} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>
                  Apply Now
                </button>
              )}
              <button className="bj-modal-icon-btn" style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg></button>
              <button className="bj-modal-icon-btn" style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg></button>
              <button className="bj-modal-icon-btn" style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg></button>
            </div>

            <h3 className="bj-modal-heading" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Location</h3>
            <p className="bj-modal-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--bj-border, #e2e8f0)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {selectedJob.location || 'Remote'}
            </p>

            <h3 className="bj-modal-heading" style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Full job description</h3>
            <h4 className="bj-modal-heading" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Summary</h4>
            <div className="bj-modal-desc" style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {selectedJob.description}
            </div>
          </div>
        </div>
        , document.body)}
    </div>
  );
}
