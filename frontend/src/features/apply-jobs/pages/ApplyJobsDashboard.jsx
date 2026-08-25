import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase, Search, MapPin, Building2, Bookmark, CheckCircle, Clock,
  Video, FileText, BellRing, ArrowRight, BadgeCheck, X, Check, Circle,
  Loader2, Sparkles, Wifi, GraduationCap, Home, Layers, TrendingUp,
  CalendarDays, Flame, Zap, Eye, Star, Bell, Code2, BrainCircuit, Target
} from "lucide-react";
import { getApplicationStats, getPublishedJobs, applyToJob, toggleSaveJob, getSavedJobs } from "../services/candidateJobsAPI";
import Loader from "@/components/Loader";
import notify from "@/utils/notify";
import { getProfile } from "@/services/userAPI";
import '../styles/ApplyJobsDashboard.css';

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

function timeAgo(iso) {
  if (!iso) return "Recently";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function jobCompany(job) {
  return job.isThirdParty ? job.externalCompanyName : job.companyName;
}

function formatSalary(job) {
  if (job.salaryMin > 0 || job.salaryMax > 0) return `₹${job.salaryMin} – ${job.salaryMax} LPA`;
  return "Not disclosed";
}

function workModeLabel(job) {
  const m = (job.workMode || "").toLowerCase();
  const loc = (job.location || "").toLowerCase();
  if (m === "remote" || loc.includes("remote")) return "Remote";
  if (m === "hybrid") return "Hybrid";
  return "On-site";
}

function empType(job) {
  const t = (job.employmentType || "full_time").replace(/_/g, " ");
  return t.replace(/\b\w/g, (c) => c.toUpperCase());
}

function loadList(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}

const CATEGORIES = [
  { label: "Remote", q: "remote", icon: Wifi },
  { label: "MNC", q: "engineer", icon: Building2 },
  { label: "Internship", q: "intern", icon: GraduationCap },
  { label: "Walk-in", q: "walk-in", icon: CalendarDays },
  { label: "Fresher", q: "fresher", icon: Sparkles },
  { label: "Work from home", q: "work from home", icon: Home },
  { label: "Product", q: "product", icon: Layers },
  { label: "Data / AI", q: "data", icon: TrendingUp },
];

const EVENTS = [
  {
    id: 1,
    type: "Virtual Fair",
    title: "Pan-India Tech Hiring Fair 2026",
    date: "28 Aug",
    time: "10:00 AM – 6:00 PM IST",
    loc: "Online · Live",
    companies: 48,
    roles: "2,400+",
    cta: "Register free",
  },
  {
    id: 2,
    type: "Walk-in",
    title: "Product Engineering Walk-in Drive",
    date: "30 Aug",
    time: "9:30 AM onwards",
    loc: "Bengaluru · Whitefield",
    companies: 12,
    roles: "180+",
    cta: "Get pass",
  },
  {
    id: 3,
    type: "Campus",
    title: "Campus Connect · Freshers Batch",
    date: "02 Sep",
    time: "11:00 AM",
    loc: "Hyderabad · HITEC City",
    companies: 22,
    roles: "900+",
    cta: "Apply now",
  },
];

const BLOGS = [
  {
    id: 1,
    title: "How top MNCs shortlist resumes in under 8 seconds",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400&auto=format&fit=crop",
    tag: "Career Tips", tagColor: "purple",
    author: "PreepX Careers", date: "17 Aug 2026"
  },
  {
    id: 2,
    title: "Salary negotiation playbook for 2026 tech offers",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&auto=format&fit=crop",
    tag: "Compensation", tagColor: "blue",
    author: "PreepX Insights", date: "11 Aug 2026"
  },
  {
    id: 3,
    title: "Walk-in drives vs. online apply — what actually converts",
    img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=400&auto=format&fit=crop",
    tag: "Hiring", tagColor: "green",
    author: "Talent Lab", date: "04 Aug 2026"
  },
  {
    id: 4,
    title: "In-demand skills recruiters are filtering for this quarter",
    img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop",
    tag: "Skills", tagColor: "purple",
    author: "PreepX Careers", date: "29 Jul 2026"
  }
];

const COMPANIES = [
  { name: "Google", jobs: "120+", logo: "/company/google-2015-logo-svgrepo-com.svg" },
  { name: "Amazon", jobs: "150+", logo: "/company/amazon-2-logo-svgrepo-com.svg" },
  { name: "Flipkart", jobs: "95+", logo: "/company/flipkart-logo-svgrepo-com.svg" },
  { name: "IBM", jobs: "80+", logo: "/company/ibm-logo-svgrepo-com.svg" },
  { name: "Netflix", jobs: "30+", logo: "/company/netflix-2-logo-svgrepo-com.svg" },
  { name: "Salesforce", jobs: "70+", logo: "/company/salesforce-2-logo-svgrepo-com.svg" },
];

const SKILL_DEMAND = [
  { name: "React", growth: "+18%" },
  { name: "Python", growth: "+14%" },
  { name: "AWS", growth: "+22%" },
  { name: "SQL", growth: "+9%" },
  { name: "Java", growth: "+11%" },
  { name: "Figma", growth: "+16%" },
];

const JobLogo = ({ job, className, style }) => {
  const [error, setError] = useState(false);
  const compName = jobCompany(job);

  if (error || (!job.externalCompanyLogo && !["Google", "Microsoft", "Zomato", "Swiggy", "Paytm", "Adobe"].includes(job.companyName))) {
    return (
      <div className={className} style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", background: "#eef2ff", color: "#4f46e5", fontWeight: 800 }}>
        {(compName || "C").charAt(0).toUpperCase()}
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
    else if (job.companyName === "Adobe") src = "https://upload.wikimedia.org/wikipedia/commons/4/42/Adobe_Corporate_logo.svg";
  }

  return (
    <img
      src={src}
      alt={compName}
      className={className}
      style={style}
      onError={() => setError(true)}
      onLoad={(e) => {
        if (e.target.naturalWidth <= 10) setError(true);
      }}
    />
  );
};

export default function ApplyJobsDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const firstName = (user.fullName || "there").split(" ")[0];
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [applying, setApplying] = useState(null);
  const [savedIds, setSavedIds] = useState(() => loadList("ajd_saved"));
  const [followed, setFollowed] = useState(() => loadList("ajd_followed"));
  const [registeredEvents, setRegisteredEvents] = useState(() => loadList("ajd_events"));
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertEmail, setAlertEmail] = useState(user.email || "");
  const [alertFreq, setAlertFreq] = useState("daily");
  const [boostHidden, setBoostHidden] = useState(false);
  const [livePulse, setLivePulse] = useState(0);

  const [search, setSearch] = useState("");
  const [experience, setExperience] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedExp, setDebouncedExp] = useState("");
  const [debouncedLoc, setDebouncedLoc] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [serverSearchJobs, setServerSearchJobs] = useState([]);
  const [serverSearchTotal, setServerSearchTotal] = useState(0);

  useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedExp(experience);
      setDebouncedLoc(locationSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [search, experience, locationSearch]);

  useEffect(() => {
    const isSearchActive = debouncedSearch.trim() !== "" || debouncedExp !== "" || debouncedLoc.trim() !== "";
    if (!isSearchActive) {
      setServerSearchJobs([]);
      setServerSearchTotal(0);
      setIsSearching(false);
      return;
    }

    getPublishedJobs({
      search: debouncedSearch,
      exp: debouncedExp,
      location: debouncedLoc,
      limit: 5
    }).then((res) => {
      setServerSearchJobs(res.jobs || []);
      setServerSearchTotal(res.total || (res.jobs || []).length);
    }).catch(console.error).finally(() => {
      setIsSearching(false);
    });
  }, [debouncedSearch, debouncedExp, debouncedLoc]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    Promise.all([
      getApplicationStats().catch(() => ({})),
      getPublishedJobs({ limit: 14 }).catch(() => ({ jobs: [] })),
      getProfile().catch(() => null),
      getSavedJobs().catch(() => [])
    ]).then(([s, j, p, saved]) => {
      setStats(s);
      setJobs(j.jobs || []);
      setProfileData(p);
      if (saved && saved.length > 0) {
        const ids = saved.map(sj => sj._id || sj);
        setSavedIds(ids);
        localStorage.setItem("ajd_saved", JSON.stringify(ids));
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setLivePulse((n) => (n + 1) % 9), 4200);
    return () => clearInterval(id);
  }, []);

  const handleApply = async (job) => {
    if (job.isThirdParty) {
      window.open(job.applyLink, "_blank");
      return;
    }
    setApplying(job._id);
    try {
      const res = await applyToJob(job._id);
      notify.success(res.message || "Application submitted!");
      setJobs((prev) => prev.map((j) => (j._id === job._id ? { ...j, applied: true } : j)));
    } catch (e) {
      notify.error(e.response?.data?.message || "Apply failed");
    } finally {
      setApplying(null);
    }
  };

  const toggleSave = async (id, e) => {
    e?.stopPropagation();
    try {
      const res = await toggleSaveJob(id);
      setSavedIds((prev) => {
        const next = res.saved ? [...prev, id] : prev.filter(x => x !== id);
        localStorage.setItem("ajd_saved", JSON.stringify(next));
        notify.success(res.saved ? "Saved to your list" : "Removed from saved jobs");
        return next;
      });
    } catch (err) {
      notify.error("Failed to save job");
    }
  };

  const toggleFollow = (name) => {
    setFollowed((prev) => {
      const exists = prev.includes(name);
      const next = exists ? prev.filter((x) => x !== name) : [...prev, name];
      localStorage.setItem("ajd_followed", JSON.stringify(next));
      notify.success(exists ? `Unfollowed ${name}` : `Following ${name}`);
      return next;
    });
  };

  const registerEvent = (id) => {
    setRegisteredEvents((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem("ajd_events", JSON.stringify(next));
      notify.success("You're registered. We'll send a reminder.");
      return next;
    });
  };

  const submitAlert = (e) => {
    e.preventDefault();
    if (!alertEmail.trim()) {
      notify.error("Enter an email for alerts");
      return;
    }
    localStorage.setItem("ajd_alert", JSON.stringify({ email: alertEmail, freq: alertFreq }));
    notify.success("Job alerts are on. We'll ping you when roles match.");
    setAlertOpen(false);
  };

  const isSearchActive = search.trim() !== "" || experience !== "" || locationSearch.trim() !== "";
  const featuredJobs = jobs.filter((j) => !j.applied).slice(0, 5);
  const displayJobs = isSearchActive ? serverSearchJobs.slice(0, 5) : featuredJobs;
  const totalFound = isSearchActive ? serverSearchTotal : featuredJobs.length;
  const completion = calcCompletion(profileData);
  const liveOpenings = (jobs.length || 0) + livePulse;
  const recruiterViews = Math.max(18, (stats?.total || 0) * 9 + 24);

  const getViewAllLink = () => {
    if (!isSearchActive) return "/apply-jobs/browse";
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (debouncedExp) params.set("exp", debouncedExp);
    if (debouncedLoc) params.set("loc", debouncedLoc);
    return `/apply-jobs/browse?${params.toString()}`;
  };

  const recommendedJobs = useMemo(() => {
    const list = [...jobs];
    const recommended = [];
    const profileMatches = list.filter((j) => (j.matchScore ?? 0) >= 35).sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    recommended.push(...profileMatches);
    if (recommended.length < 4) {
      const topCompanies = ["Google", "Microsoft", "Adobe", "Amazon", "Meta", "Paytm", "Zomato", "Swiggy"];
      const hotJobs = list.filter((j) => {
        if (recommended.find((r) => r._id === j._id)) return false;
        return j.isHot || topCompanies.includes(j.companyName);
      });
      recommended.push(...hotJobs);
    }
    if (recommended.length < 4) {
      const remaining = list.filter((j) => !recommended.find((r) => r._id === j._id)).sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
      recommended.push(...remaining);
    }
    return recommended.slice(0, 4);
  }, [jobs]);

  const analytics = useMemo(() => {
    const total = stats?.total || 0;
    const inProgress = stats?.inProgress || 0;
    const shortlisted = stats?.shortlisted || 0;
    const offered = stats?.offered || 0;
    const rejected = stats?.rejected || 0;
    const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
    return { total, inProgress, shortlisted, offered, rejected, pct };
  }, [stats]);

  const tickerItems = useMemo(() => {
    const names = [...new Set(jobs.map(jobCompany).filter(Boolean))].slice(0, 8);
    const base = names.length
      ? names.map((n) => `${n} is hiring now`)
      : ["Google is hiring 120+ engineers", "Amazon posted 18 new roles", "Walk-in: Infosys Bengaluru this Saturday"];
    return [...base, "Virtual Tech Fair · 28 Aug · 2,400+ roles", "Freshers 2026 campus drives are live"];
  }, [jobs]);

  useEffect(() => {
    if (loading) return;
    if (window.location.hash === "#ajd-events") {
      document.getElementById("ajd-events")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading]);

  if (loading) return <Loader />;

  const ringOffset = 301.6 - (301.6 * completion) / 100;

  return (
    <div className="ajd-page-wrapper ajd-premium">
      {/* ── HERO ── */}
      <section className="ajd-hero-banner">
        <div className="ajd-hero-glow" />
        <div className="ajd-hb-left">
          <div className="ajd-live-chip">
            <span className="ajd-pulse" />
            {liveOpenings}+ live openings · updated just now
          </div>
          <h1 className="ajd-hb-title">{greeting()}, {firstName}</h1>
          <p className="ajd-hb-sub">Find roles at MNCs, startups and walk-in drives — matched to your profile.</p>

          <div className="ajd-hb-search">
            <div className="ajd-hbs-seg">
              <Search size={16} className="ajd-hbs-icon" />
              <input
                placeholder="Skills, designation or company"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") navigate(getViewAllLink()); }}
              />
            </div>
            <div className="ajd-hbs-div" />
            <div className="ajd-hbs-seg ajd-hbs-seg--mid">
              <select value={experience} onChange={(e) => setExperience(e.target.value)}>
                <option value="">Experience</option>
                <option value="0">Fresher</option>
                <option value="1">1–3 years</option>
                <option value="3">3–5 years</option>
                <option value="5">5+ years</option>
              </select>
            </div>
            <div className="ajd-hbs-div" />
            <div className="ajd-hbs-seg">
              <MapPin size={16} className="ajd-hbs-icon" />
              <input
                placeholder="Location"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") navigate(getViewAllLink()); }}
              />
            </div>
            <button className="ajd-hbs-btn" type="button" onClick={() => navigate(getViewAllLink())}>Search</button>
          </div>

          <div className="ajd-hb-tags">
            <span>Popular:</span>
            {["React Developer", "Frontend Developer", "UI/UX Designer", "Backend Developer", "Data Analyst"].map((t) => (
              <button type="button" key={t} className="ajd-hb-tag" onClick={() => setSearch(t)}>{t}</button>
            ))}
          </div>
        </div>

        <div className="ajd-hb-right">
          <div className="ajd-hero-profile-progress">
            <svg viewBox="0 0 100 100" className="progress-ring">
              <circle cx="50" cy="50" r="48" className="progress-ring-bg" />
              <circle
                cx="50" cy="50" r="48"
                className="progress-ring-fg"
                strokeDasharray="301.6"
                strokeDashoffset={ringOffset}
              />
            </svg>
            <div className="ajd-hero-avatar-wrapper">
              <img
                src={user?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "Candidate")}&background=4f46e5&color=fff`}
                alt="User Avatar"
                className="user-avatar-hero"
              />
            </div>
            <div className="profile-completion-badge">{completion}%</div>
          </div>
        </div>
      </section>

      {/* ── LIVE TICKER ── */}
      <div className="ajd-ticker" aria-hidden="true">
        <div className="ajd-ticker-label"><Zap size={13} /> Hiring now</div>
        <div className="ajd-ticker-track">
          <div className="ajd-ticker-inner">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="ajd-ticker-item">{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div className="ajd-cats">
        {CATEGORIES.map(({ label, q, icon: Icon }) => (
          <button
            type="button"
            key={label}
            className="ajd-cat"
            onClick={() => navigate(`/apply-jobs/browse?search=${encodeURIComponent(q)}`)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="ajd-root">
        <div className="ajd-left-col">
          <section className="ajd-stats-row">
            {[
              { icon: Bookmark, color: "#4f46e5", bg: "#ede9fe", label: "Saved Jobs", val: savedIds.length || stats?.savedJobs || 0, sub: "Bookmarked roles", to: "/apply-jobs/browse" },
              { icon: Building2, color: "#059669", bg: "#d1fae5", label: "Companies", val: stats?.totalCompanies || followed.length || jobs.length, sub: "Actively hiring", to: "/apply-jobs/browse" },
              { icon: FileText, color: "#7c3aed", bg: "#ede9fe", label: "Applications", val: stats?.total || 0, sub: `${stats?.inProgress || 0} in progress`, to: "/apply-jobs/my-applications" },
              { icon: Video, color: "#d97706", bg: "#fef3c7", label: "Interviews", val: stats?.interviews || 0, sub: "Upcoming rounds", to: "/apply-jobs/assessments" },
            ].map(({ icon: Icon, color, bg, label, val, sub, to }) => (
              <button type="button" key={label} className="ajd-stat-card" onClick={() => navigate(to)}>
                <div className="ajd-stat-icon" style={{ background: bg }}>
                  <Icon size={22} color={color} />
                </div>
                <div>
                  <div className="ajd-stat-val">{val}</div>
                  <div className="ajd-stat-lbl">{label}</div>
                  <div className="ajd-stat-sub">{sub}</div>
                </div>
              </button>
            ))}
          </section>

          <section className="ajd-card" id="ajd-jobs">
            <div className="ajd-card-head">
              <div>
                <h2>{isSearchActive ? (isSearching ? "Searching…" : `Search results (${totalFound})`) : "Featured openings"}</h2>
                <p className="ajd-card-kicker">Priority apply · verified employers</p>
              </div>
              <Link to={getViewAllLink()} className="ajd-view-link">View all jobs →</Link>
            </div>
            <div className="ajd-job-list">
              {isSearching ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="ajd-job-row" style={{ pointerEvents: 'none' }}>
                      <div className="ajd-jlogo ajd-skel-bg" style={{ border: 'none' }} />
                      <div className="ajd-jinfo">
                        <div className="ajd-skel-bg" style={{ height: '16px', width: '60%', borderRadius: '4px', marginBottom: '8px' }} />
                        <div className="ajd-skel-bg" style={{ height: '14px', width: '40%', borderRadius: '4px', marginBottom: '12px' }} />
                        <div className="ajd-tags">
                          <span className="ajd-tag ajd-skel-bg" style={{ width: '60px', border: 'none', color: 'transparent' }}>.</span>
                          <span className="ajd-tag ajd-skel-bg" style={{ width: '80px', border: 'none', color: 'transparent' }}>.</span>
                        </div>
                      </div>
                      <div className="ajd-jright">
                        <div className="ajd-skel-bg" style={{ height: '16px', width: '70px', borderRadius: '4px', marginBottom: '8px' }} />
                        <div className="ajd-skel-bg" style={{ height: '12px', width: '40px', borderRadius: '4px', alignSelf: 'flex-end' }} />
                      </div>
                    </div>
                  ))}
                </>
              ) : displayJobs.length === 0 ? (
                <p className="ajd-empty">No jobs found. Try a different skill or city.</p>
              ) : (
                displayJobs.map((job) => (
                  <div key={job._id} className="ajd-job-row" onClick={() => navigate("/apply-jobs/browse")}>
                    <div className="ajd-jlogo">
                      {job.isThirdParty && job.externalCompanyLogo ? (
                        <img src={job.externalCompanyLogo} alt={jobCompany(job)} />
                      ) : (
                        <span>{(jobCompany(job) || "C").charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="ajd-jinfo">
                      <h4>
                        {job.title}
                        {job.isThirdParty && <BadgeCheck size={15} color="#2563eb" />}
                        {job.isHot && <span className="ajd-pill-hot"><Flame size={11} /> Hot</span>}
                        {(job.matchScore ?? 0) >= 50 && <span className="ajd-pill-match">{job.matchScore}% match</span>}
                      </h4>
                      <p>{jobCompany(job)} · {job.location || "Remote"}</p>
                      <div className="ajd-tags">
                        <span className="ajd-tag ajd-tag--green">{empType(job)}</span>
                        <span className="ajd-tag ajd-tag--blue">{workModeLabel(job)}</span>
                        <span className="ajd-tag ajd-tag--amber">
                          {(job.experienceMin > 0 || job.experienceMax > 0) ? `${job.experienceMin}–${job.experienceMax} yrs` : "Fresher / Any"}
                        </span>
                      </div>
                    </div>
                    <div className="ajd-jright">
                      <strong>{formatSalary(job)}</strong>
                      <span>{timeAgo(job.createdAt || job.postedAt)}</span>
                      <div className="ajd-jactions">
                        <button
                          type="button"
                          className={`ajd-icon-btn ${savedIds.includes(job._id) ? "on" : ""}`}
                          onClick={(e) => toggleSave(job._id, e)}
                          aria-label="Save job"
                        >
                          <Bookmark size={14} fill={savedIds.includes(job._id) ? "currentColor" : "none"} />
                        </button>
                        <button
                          type="button"
                          className="ajd-apply-btn"
                          onClick={(e) => { e.stopPropagation(); handleApply(job); }}
                          disabled={applying === job._id || job.applied}
                        >
                          {job.applied ? "Applied" : applying === job._id ? "Applying…" : "Easy apply"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="ajd-view-all-wrap">
              <Link to={getViewAllLink()} className="ajd-view-all-btn">Browse full job board →</Link>
            </div>
          </section>

          <section className="ajd-card" id="ajd-events">
            <div className="ajd-card-head">
              <div>
                <h2>Hiring events & walk-ins</h2>
                <p className="ajd-card-kicker">Fairs, campus drives and on-site interviews this week</p>
              </div>
              <span className="ajd-live-mini"><span className="ajd-pulse" /> 3 live</span>
            </div>
            <div className="ajd-events">
              {EVENTS.map((ev) => (
                <article key={ev.id} className="ajd-event">
                  <div className="ajd-event-date">
                    <strong>{ev.date}</strong>
                    <span>{ev.type}</span>
                  </div>
                  <div className="ajd-event-body">
                    <h3>{ev.title}</h3>
                    <p><MapPin size={12} /> {ev.loc} · {ev.time}</p>
                    <div className="ajd-event-meta">
                      <span><Building2 size={12} /> {ev.companies} companies</span>
                      <span><Briefcase size={12} /> {ev.roles} roles</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`ajd-event-cta ${registeredEvents.includes(ev.id) ? "done" : ""}`}
                    onClick={() => registerEvent(ev.id)}
                    disabled={registeredEvents.includes(ev.id)}
                  >
                    {registeredEvents.includes(ev.id) ? "Registered" : ev.cta}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="ajd-insights">
            <div className="ajd-insight">
              <h3>Salary pulse</h3>
              <p>Median tech CTC this week</p>
              <strong>₹14.2 LPA</strong>
              <span className="up">+6.4% vs last quarter</span>
            </div>
            <div className="ajd-insight">
              <h3>Remote share</h3>
              <p>Roles you can do from anywhere</p>
              <strong>31%</strong>
              <span>of live openings</span>
            </div>
            <div className="ajd-insight ajd-insight--skills">
              <h3>Skills in demand</h3>
              <div className="ajd-skill-row">
                {SKILL_DEMAND.map((s) => (
                  <button type="button" key={s.name} onClick={() => navigate(`/apply-jobs/browse?search=${encodeURIComponent(s.name)}`)}>
                    {s.name} <em>{s.growth}</em>
                  </button>
                ))}
              </div>
            </div>
          </section>


        </div>

        <aside className="ajd-right-sidebar">
          <div className="ajd-rcard">
            <div className="ajd-sec-title-row" style={{ marginBottom: 18 }}>
              <h2>Application analytics</h2>
              <span className="ajd-muted">This month</span>
            </div>
            <div className="ajd-chart-row">
              <div className="ajd-donut-wrapper">
                <div className="ajd-donut-inner">
                  <strong>{analytics.total}</strong>
                  <span>Total</span>
                </div>
              </div>
              <div className="ajd-legend">
                {[
                  ["c-applied", "Applied", analytics.total],
                  ["c-inprogress", "In progress", analytics.inProgress],
                  ["c-shortlisted", "Shortlisted", analytics.shortlisted],
                  ["c-offered", "Offered", analytics.offered],
                  ["c-rejected", "Rejected", analytics.rejected],
                ].map(([cls, label, val]) => (
                  <div key={label} className="ajd-legend-item">
                    <div className="ajd-legend-left"><div className={`ajd-legend-dot ${cls}`} /> {label}</div>
                    <div className="ajd-legend-val">{val} ({analytics.pct(val)}%)</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ajd-rcard ajd-views">
            <div className="ajd-views-icon"><Eye size={18} /></div>
            <div>
              <strong>{recruiterViews}</strong>
              <p>Recruiter profile views this week</p>
            </div>
          </div>

          <div className="ajd-rcard">
            <div className="ajd-profile-top">
              <div className="ajd-profile-text">
                <h2>Improve your profile</h2>
                <p>Complete these steps to rank higher with recruiters.</p>
              </div>
              <div className="ajd-circle-progress" style={{ background: `conic-gradient(#10b981 ${completion}%, #e2e8f0 0)` }}>
                <div className="ajd-circle-inner">{completion}%</div>
              </div>
            </div>
            <div className="ajd-checklist">
              <div className={`ajd-check-item ${(profileData?.experience || []).length > 0 ? "done" : ""}`}>
                {(profileData?.experience || []).length > 0 ? <Check size={14} color="#10b981" /> : <Circle size={14} />} Work exp.
              </div>
              <div className={`ajd-check-item ${profileData?.email ? "done" : ""}`}>
                {profileData?.email ? <Check size={14} color="#10b981" /> : <Circle size={14} />} Verify email
              </div>
              <div className={`ajd-check-item ${profileData?.resumeUrl ? "done" : ""}`}>
                {profileData?.resumeUrl ? <Check size={14} color="#10b981" /> : <Circle size={14} />} Resume
              </div>
              <div className={`ajd-check-item ${(profileData?.education || []).length > 0 ? "done" : ""}`}>
                {(profileData?.education || []).length > 0 ? <Check size={14} color="#10b981" /> : <Circle size={14} />} Education
              </div>
              <div className={`ajd-check-item ${(profileData?.skills || []).length > 0 ? "done" : ""}`}>
                {(profileData?.skills || []).length > 0 ? <Check size={14} color="#10b981" /> : <Circle size={14} />} Skills
              </div>
              <div className={`ajd-check-item ${profileData?.profilePic ? "done" : ""}`}>
                {profileData?.profilePic ? <Check size={14} color="#10b981" /> : <Circle size={14} />} Photo
              </div>
            </div>
            <button type="button" className="ajd-card-cta ajd-cta-solid ajd-cta-row" onClick={() => navigate("/apply-jobs/profile")}>
              Improve profile <ArrowRight size={14} />
            </button>
          </div>

          <div className="ajd-rcard">
            <div className="ajd-rcard-head">
              <h3>Upcoming interviews</h3>
              <Link to="/apply-jobs/assessments" className="ajd-view-link">Prep</Link>
            </div>
            {(stats?.interviews || 0) > 0 ? (
              <div className="ajd-iv-row">
                <Clock size={16} />
                <div>
                  <strong>{stats.interviews} round{stats.interviews > 1 ? "s" : ""} scheduled</strong>
                  <p>Keep your assessments ready.</p>
                </div>
              </div>
            ) : (
              <div className="ajd-iv-empty">
                <Star size={16} />
                <p>No interviews yet. Apply to featured roles to get shortlisted faster.</p>
              </div>
            )}
          </div>

          <div className="ajd-rcard">
            <div className="ajd-rcard-head">
              <h3>Recommended for you</h3>
              <Link to="/apply-jobs/browse" className="ajd-view-link">View all</Link>
            </div>
            <div className="ajd-rec-list">
              {recommendedJobs.length > 0 ? recommendedJobs.map((job) => (
                <div key={job._id} className="ajd-rec-item" onClick={() => navigate("/apply-jobs/browse")}>
                  <JobLogo job={job} className="ajd-rec-logo" style={{ objectFit: "contain" }} />
                  <div className="ajd-rec-info">
                    <h4>{job.title}</h4>
                    <p>{jobCompany(job)} · {job.location || "Remote"}</p>
                    <strong>{formatSalary(job)}</strong>
                  </div>
                  <div className="ajd-rec-meta">
                    <button type="button" className="ajd-bm-btn" onClick={(e) => toggleSave(job._id, e)}>
                      <Bookmark size={14} fill={savedIds.includes(job._id) ? "currentColor" : "none"} />
                    </button>
                    <span className="ajd-time">{timeAgo(job.createdAt || job.postedAt)}</span>
                  </div>
                </div>
              )) : (
                <p className="ajd-empty">No recommendations yet</p>
              )}
            </div>
            <Link to="/apply-jobs/browse" className="ajd-see-more">View more recommendations →</Link>
          </div>

          {!boostHidden && (
            <div className="ajd-boost-card">
              <button type="button" className="ajd-boost-close" onClick={() => setBoostHidden(true)} aria-label="Dismiss">
                <X size={16} />
              </button>
              <div className="ajd-boost-text">
                <h3>Stand out to recruiters</h3>
                <p>Priority applicant visibility can 3× your shortlist rate on featured roles.</p>
                <div className="ajd-boost-progress">
                  <span>Profile completion</span>
                  <span className="ajd-bp-pct">{completion}%</span>
                </div>
                <div className="ajd-bp-bar"><div className="ajd-bp-fill" style={{ width: `${completion}%` }} /></div>
                <Link to="/apply-jobs/profile" className="ajd-boost-btn">Boost profile →</Link>
              </div>
            </div>
          )}
        </aside>
      </div>

      <section className="ajd-ecosystem">
        <div className="ajd-eco-head">
          <h2>Your Path to Top Tech Roles</h2>
          <p>Prepare, practice, and prove your skills to get hired faster.</p>
        </div>
        <div className="ajd-eco-grid">
          <div className="ajd-eco-card" onClick={() => navigate('/coding')}>
            <div className="ajd-eco-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
              <Code2 size={24} color="#fff" />
            </div>
            <h3>Coding Hub</h3>
            <p>Master Data Structures & Algorithms. Solve real-world problems and compete in contests.</p>
            <span className="ajd-eco-link">Start coding →</span>
          </div>
          <div className="ajd-eco-card" onClick={() => navigate('/interviews')}>
            <div className="ajd-eco-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Video size={24} color="#fff" />
            </div>
            <h3>Mock Interviews</h3>
            <p>Practice with AI or peers. Get instant feedback to ace your behavioral and system design rounds.</p>
            <span className="ajd-eco-link">Book interview →</span>
          </div>
          <div className="ajd-eco-card" onClick={() => navigate('/apply-jobs/assessments')}>
            <div className="ajd-eco-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <Target size={24} color="#fff" />
            </div>
            <h3>Skill Assessments</h3>
            <p>Take objective tests to prove your expertise. Top scorers get direct interview shortlists.</p>
            <span className="ajd-eco-link">Take assessment →</span>
          </div>
        </div>
      </section>

      {alertOpen && (
        <div className="ajd-modal-bg" onClick={() => setAlertOpen(false)}>
          <form className="ajd-modal" onClick={(e) => e.stopPropagation()} onSubmit={submitAlert}>
            <div className="ajd-modal-head">
              <h3>Create job alert</h3>
              <button type="button" onClick={() => setAlertOpen(false)}><X size={16} /></button>
            </div>
            <label>
              Email
              <input value={alertEmail} onChange={(e) => setAlertEmail(e.target.value)} placeholder="you@email.com" />
            </label>
            <label>
              Frequency
              <select value={alertFreq} onChange={(e) => setAlertFreq(e.target.value)}>
                <option value="daily">Daily digest</option>
                <option value="instant">Instant (as posted)</option>
                <option value="weekly">Weekly roundup</option>
              </select>
            </label>
            <p className="ajd-modal-hint">We’ll match new roles to your saved search and skills.</p>
            <button type="submit" className="ajd-ab-btn ajd-modal-submit">Turn on alerts</button>
          </form>
        </div>
      )}
    </div>
  );
}
