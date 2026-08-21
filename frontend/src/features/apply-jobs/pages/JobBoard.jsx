import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, Sparkles, Search, Building2, ChevronRight, CheckCircle, ChevronDown, FileText, Bookmark, Bell } from "lucide-react";
import { getPublishedJobs, applyToJob } from "../services/candidateJobsAPI";
import DashboardSkeleton from "@/components/recruiter/DashboardSkeleton";
import EmptyState from "@/components/recruiter/EmptyState";
import notify from "@/utils/notify";
import '../styles/JobBoard.css'; // Keep for overrides
import '../styles/ApplyJobsDashboard.css'; // Reuse premium styles

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

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Fetch all unique data once for suggestions
  const [allTags, setAllTags] = useState([]);
  const [allLocations, setAllLocations] = useState([]);

  useEffect(() => {
    getPublishedJobs({})
      .then((d) => {
        const list = d.jobs || [];
        const titles = list.map(j => j.title).filter(Boolean);
        const roles = list.map(j => j.role).filter(Boolean);
        const skills = list.flatMap(j => j.skills || []);
        setAllTags([...new Set([...titles, ...roles, ...skills])]);

        const locs = list.map(j => j.location).filter(Boolean);
        setAllLocations([...new Set(locs)]);
      })
      .catch(console.error);
  }, []);

  const [experience, setExperience] = useState("");
  const [showExpDropdown, setShowExpDropdown] = useState(false);
  const expContainerRef = useRef(null);

  const [locationSearch, setLocationSearch] = useState("");
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



  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    getPublishedJobs({ search: debouncedSearch })
      .then((d) => setJobs(d.jobs || []))
      .catch(() => notify.error("Could not load jobs"))
      .finally(() => setInitialLoading(false));
  }, [debouncedSearch]);

  const displayedJobs = useMemo(() => {
    const list = [...jobs];
    if (filter === "match") {
      return list
        .filter((j) => !j.applied && (j.matchScore ?? 0) >= 35)
        .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    }
    return list.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  }, [jobs, filter]);

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

  if (initialLoading) return <DashboardSkeleton />;

  return (
    <div className="bj-root">
      {/* ── MAIN TWO-COLUMN LAYOUT ── */}
      <div className="bj-main">

        {/* LEFT COLUMN: Header + Results Header + Job Cards */}
        <div className="bj-left-col">

          {/* ── HEADER & SEARCH ── */}
          <header className="bj-header">
            <div className="bj-header-inner">
              <h1 className="bj-title">Browse Jobs</h1>
              <p className="bj-subtitle">Explore 5,00,000+ jobs and find the perfect match for your career</p>

              <div className="bj-search-box">
                <div className="bj-sb-seg" ref={searchContainerRef}>
                  <Search className="bj-icon" size={16} />
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

                <div className="bj-divider" />

                <div className="bj-sb-seg" ref={expContainerRef} onClick={() => setShowExpDropdown(!showExpDropdown)} style={{ cursor: 'pointer' }}>
                  <span style={{ flex: 1, color: experience === "" ? "#94a3b8" : "#1e293b", fontSize: "14px" }}>
                    {experience === "" ? "Select experience" : experience === "0" ? "Fresher" : `${experience} years`}
                  </span>
                  <ChevronDown size={16} className="bj-icon" />
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

                <div className="bj-divider" />

                <div className="bj-sb-seg" ref={locContainerRef}>
                  <MapPin className="bj-icon" size={16} />
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
                  {showLocSuggestions && locSuggestions.length > 0 && (
                    <div className="ns-suggestions-dropdown">
                      {locSuggestions.map((sug, idx) => (
                        <div
                          key={idx}
                          className="ns-suggestion-item"
                          onClick={() => {
                            setLocationSearch(appendSuggestion(locationSearch, sug));
                            setShowLocSuggestions(false);
                          }}
                        >
                          <MapPin size={14} className="ns-suggestion-icon" /> {sug}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button className="bj-search-btn">Search Jobs</button>
              </div>
            </div>
          </header>

          <div className="bj-jobs-list">
            {displayedJobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title={filter === "match" ? "No strong matches yet" : "No open jobs right now"}
                description={filter === "match" ? "Add skills on Profile or upload your resume to improve matching." : "Check back soon — recruiters are posting new roles."}
                actionLabel={filter === "match" ? "Complete Profile" : null}
                actionTo={filter === "match" ? "/apply-jobs/profile" : null}
              />
            ) : (
              displayedJobs.map((job) => (
                <article key={job._id} className="bj-card">

                  <div className="bjc-left-col">
                    <div className="bjc-logo">
                      {job.companyName === "Google" ? <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" /> :
                        job.companyName === "Microsoft" ? <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="M" /> :
                          job.companyName === "Zomato" ? <img src="https://upload.wikimedia.org/wikipedia/commons/b/bd/Zomato_Logo.svg" alt="Z" /> :
                            job.companyName === "Swiggy" ? <img src="https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg" alt="S" /> :
                              job.companyName === "Paytm" ? <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="P" /> :
                                <span>{job.companyName?.charAt(0) || 'C'}</span>}
                    </div>
                  </div>

                  <div className="bjc-mid-col">
                    <div className="bjc-tags-top">
                      {job.isHot && <span className="bjc-tag-hot"><Sparkles size={12} /> Hot</span>}
                    </div>
                    <h3 className="bjc-title">
                      {job.title} <CheckCircle size={14} className="bjc-verified" />
                    </h3>
                    <div className="bjc-company-loc">
                      <span className="bjc-cname">{job.companyName}</span>
                      <span className="bjc-dot">•</span>
                      <span className="bjc-loc">{job.location || "Remote"}</span>
                    </div>

                    <div className="bjc-pills">
                      <span className="bjc-pill bjc-pill-ft">Full-time</span>
                      <span className="bjc-pill bjc-pill-rem">{job.location?.toLowerCase().includes('remote') ? 'Remote' : 'Hybrid'}</span>
                    </div>

                    <div className="bjc-footer-meta">
                      <span><Briefcase size={14} /> {job.experienceMin ?? 1}-{job.experienceMax ?? 3} Yrs</span>
                      <span><Search size={14} /> Posted {Math.floor(Math.random() * 10) + 1}h ago</span>
                    </div>
                  </div>

                  <div className="bjc-right-col">
                    <div className="bjc-salary-book">
                      <div className="bjc-salary">₹{job.salaryMin || 10} - {job.salaryMax || 20} LPA</div>
                      <button className="bjc-bookmark"><Bookmark size={18} /></button>
                    </div>
                    <button className="bjc-view-btn" onClick={() => handleApply(job._id)}>Apply</button>
                  </div>

                </article>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Widgets */}
        <div className="bj-right-col">

          {/* Widget 1: Recommended */}
          <div className="bj-widget bj-recs">
            <div className="bjw-header">
              <h3>Recommended for you</h3>
              <a href="#">View all</a>
            </div>
            <div className="bjw-rec-list">
              {[
                { title: "Frontend Developer", comp: "Adobe", loc: "Noida, India", sal: "₹12 - 18 LPA", ago: "1d ago", logo: "https://upload.wikimedia.org/wikipedia/commons/4/42/Adobe_Acrobat_DC_logo_2020.svg" },
                { title: "Backend Developer", comp: "Paytm", loc: "Bangalore, India", sal: "₹10 - 15 LPA", ago: "2d ago", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" },
                { title: "Full Stack Engineer", comp: "Groww", loc: "Mumbai, India", sal: "₹9 - 14 LPA", ago: "2d ago", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Groww_app_logo.png" },
                { title: "UI/UX Designer", comp: "Google", loc: "Remote", sal: "₹15 - 22 LPA", ago: "4d ago", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" }
              ].map((rec, i) => (
                <div key={i} className="bjw-rec-item">
                  <img src={rec.logo} alt="logo" className="bjw-rec-logo" />
                  <div className="bjw-rec-info">
                    <h4>{rec.title}</h4>
                    <p>{rec.comp} • {rec.loc}</p>
                    <span className="bjw-rec-sal">{rec.sal}</span>
                  </div>
                  <div className="bjw-rec-actions">
                    <Bookmark size={14} className="bjw-rec-book" />
                    <span className="bjw-rec-time">{rec.ago}</span>
                  </div>
                </div>
              ))}
            </div>
            <a href="#" className="bjw-more-link">View More Recommendations &rarr;</a>
          </div>

          {/* Widget 2: Profile Complete */}
          <div className="bj-widget bj-profile-card">
            <h3 className="bjp-title">Complete Your Profile</h3>
            <p className="bjp-subtitle">Increase your visibility to recruiters by completing your profile.</p>
            <div className="bjp-progress-ring">
              <div className="bjp-progress-inner">
                80%
              </div>
            </div>
            <button className="bjp-btn">Complete Profile &rarr;</button>
          </div>

          {/* Widget 3: Job Alerts */}
          <div className="bj-widget bj-alerts">
            <h3>Job Alerts</h3>
            <p>Get notified about new jobs that match your preferences.</p>
            <button className="bj-alert-btn"><Bell size={16} /> Create Job Alert</button>
          </div>

        </div>

      </div>
    </div>
  );
}
