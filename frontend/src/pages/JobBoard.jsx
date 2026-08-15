import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, Sparkles, Search, Building2, ChevronRight, CheckCircle, ChevronDown, FileText, Bookmark } from "lucide-react";
import { getPublishedJobs, applyToJob } from "@/services/candidateJobsAPI";
import DashboardSkeleton from "@/components/recruiter/DashboardSkeleton";
import EmptyState from "@/components/recruiter/EmptyState";
import notify from "@/utils/notify";
import '@/styles/JobBoard.css'; // Keep for overrides
import '@/styles/ApplyJobsDashboard.css'; // Reuse premium styles

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
    <div className="prem-dashboard">
      <div className="naukri-hero">
        <div className="naukri-hero-content">
          <h1>Find your dream job now</h1>
          <p>5 lakh+ jobs for you to explore</p>
          
          <div className="naukri-search-bar">
            <div className="ns-input-group ns-skill" ref={searchContainerRef} style={{ position: "relative" }}>
              <Search className="ns-icon" size={18} />
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
            
            <div className="ns-divider"></div>
            
            <div className="ns-input-group ns-exp" ref={expContainerRef} style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => setShowExpDropdown(!showExpDropdown)}>
              <span className={experience === "" ? "placeholder" : ""} style={{ flex: 1, color: experience === "" ? "#9ca3af" : "inherit" }}>
                {experience === "" ? "Select experience" : experience === "0" ? "Fresher (less than 1 year)" : `${experience} ${experience === "1" ? "year" : "years"}`}
              </span>
              <ChevronDown size={18} color="#9ca3af" />
              
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
            
            <div className="ns-divider"></div>
            
            <div className="ns-input-group ns-loc" ref={locContainerRef} style={{ position: "relative" }}>
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
            
            <button className="ns-search-btn">Search</button>
          </div>
        </div>
      </div>



      <section className="prem-jobs-grid">
        {displayedJobs.length === 0 ? (
          <div className="prem-empty-state">
            <EmptyState
              icon={Briefcase}
              title={filter === "match" ? "No strong matches yet" : "No open jobs right now"}
              description={filter === "match" ? "Add skills on Profile or upload your resume to improve matching." : "Check back soon — recruiters are posting new roles."}
              actionLabel={filter === "match" ? "Complete Profile" : null}
              actionTo={filter === "match" ? "/apply-jobs/profile" : null}
            />
          </div>
        ) : (
          displayedJobs.map((job) => (
            <article key={job._id} className="prem-job-card">
              <div className="prem-job-card-content">
                
                <div className="pjc-header">
                  <div className="pjc-title-section">
                    <h3>{job.title}</h3>
                    <div className="pjc-company-info">
                      <span className="pjc-company-name">{job.companyName}</span>
                      <span className="pjc-rating">⭐ 3.5</span>
                      <span className="pjc-reviews">| 50455 Reviews</span>
                    </div>
                  </div>
                  <div className="pjc-logo">
                    <span>{job.companyName?.charAt(0) || 'C'}</span>
                  </div>
                </div>
                
                <div className="pjc-meta-row">
                  <div className="pjc-meta-item">
                    <Briefcase size={15} /> <span>{job.experienceMin ?? 0}-{job.experienceMax ?? 5} Yrs</span>
                  </div>
                  <div className="pjc-meta-item">
                    <MapPin size={15} /> <span>{job.location || "Remote"}</span>
                  </div>
                </div>
                
                <div className="pjc-desc-row">
                  <FileText size={15} className="pjc-desc-icon" />
                  <p>{(job.description || "No description provided.").slice(0, 80)}...</p>
                </div>
                
                <div className="pjc-skills-row">
                  {(job.matchedSkills?.length ? job.matchedSkills : (job.requiredSkills || job.skills || [])).slice(0, 6).join(' • ')}
                </div>
                
                <div className="pjc-footer">
                  <span className="pjc-time">1 week ago</span>
                  {job.applied ? (
                    <span className="pjc-applied-text"><CheckCircle size={15} /> Applied</span>
                  ) : (
                    <button type="button" className="pjc-apply-btn" onClick={() => handleApply(job._id)} disabled={applying === job._id}>
                      {applying === job._id ? "Applying..." : <><Bookmark size={15} /> Apply</>}
                    </button>
                  )}
                </div>
                
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
