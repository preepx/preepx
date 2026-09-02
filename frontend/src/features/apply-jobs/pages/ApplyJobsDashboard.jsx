import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Zap, Eye, Clock, Star, Bookmark, X
} from "lucide-react";
import SidebarApplicationAnalytics from "../components/SidebarApplicationAnalytics";
import SidebarImproveProfile from "../components/SidebarImproveProfile";
import {
  getApplicationStats,
  getPublishedJobs,
  applyToJob,
  toggleSaveJob,
  getSavedJobs
} from "../services/candidateJobsAPI";
import Loader from "@/components/Loader";
import notify from "@/utils/notify";
import { getProfile } from "@/services/userAPI";
import { getStoredUser } from "@/utils/authUtils";
import {
  calcCompletion, timeAgo, jobCompany, formatSalary, loadList
} from "../utils/jobHelpers";
import JobLogo from "../components/JobLogo";
import {
  CATEGORIES,
  EXP_OPTIONS,
  EVENTS,
  SKILL_DEMAND
} from "../constants/dashboardConstants";
import {
  JobSearchHero,
  DashboardStatsRow,
  FeaturedJobsSection,
  HiringEventsSection,
  MarketInsightsSection,
  EcosystemSection,
  JobAlertModal
} from "../components/dashboard";
import "../styles/ApplyJobsDashboard.css";

export default function ApplyJobsDashboard() {
  const navigate = useNavigate();
  const user = getStoredUser() || {};
  const firstName = (user.fullName || "there").split(" ")[0];
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [experience, setExperience] = useState("");
  const [debouncedExp, setDebouncedExp] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [debouncedLoc, setDebouncedLoc] = useState("");
  const [serverSearchJobs, setServerSearchJobs] = useState([]);
  const [serverSearchTotal, setServerSearchTotal] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [expOpen, setExpOpen] = useState(false);
  const expRef = useRef(null);
  const [applying, setApplying] = useState(null);
  const [savedIds, setSavedIds] = useState(() => loadList("ajd_saved"));
  const [followed] = useState(() => loadList("ajd_followed"));
  const [registeredEvents, setRegisteredEvents] = useState(() => loadList("ajd_registered_events"));
  const [livePulse, setLivePulse] = useState(0);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertFreq, setAlertFreq] = useState("daily");
  const [boostHidden, setBoostHidden] = useState(false);

  // Close exp dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (expRef.current && !expRef.current.contains(e.target)) {
        setExpOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Debounce search filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedExp(experience);
      setDebouncedLoc(locationSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, experience, locationSearch]);

  const isSearchActive = Boolean(
    debouncedSearch.trim() || debouncedExp !== "" || debouncedLoc.trim()
  );

  useEffect(() => {
    if (!isSearchActive) {
      setServerSearchJobs([]);
      setServerSearchTotal(0);
      return;
    }
    setIsSearching(true);
    getPublishedJobs({
      search: debouncedSearch.trim() || undefined,
      experience: debouncedExp !== "" ? Number(debouncedExp) : undefined,
      location: debouncedLoc.trim() || undefined,
      limit: 10,
    })
      .then((res) => {
        setServerSearchJobs(res.jobs || []);
        setServerSearchTotal(res.total || (res.jobs || []).length);
      })
      .catch(console.error)
      .finally(() => {
        setIsSearching(false);
      });
  }, [debouncedSearch, debouncedExp, debouncedLoc, isSearchActive]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  useEffect(() => {
    Promise.all([
      getApplicationStats().catch(() => ({})),
      getPublishedJobs({ limit: 14 }).catch(() => ({ jobs: [] })),
      getProfile().catch(() => null),
      getSavedJobs().catch(() => []),
    ]).then(([s, j, p, saved]) => {
      setStats(s);
      setJobs(j.jobs || []);
      setProfileData(p);
      if (saved && saved.length > 0) {
        const ids = saved.map((sj) => sj._id || sj);
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

  const toggleSave = async (jobId, e) => {
    e.stopPropagation();
    try {
      const res = await toggleSaveJob(jobId);
      const isSaved = res.isSaved ?? !savedIds.includes(jobId);
      const next = isSaved ? [...savedIds, jobId] : savedIds.filter((id) => id !== jobId);
      setSavedIds(next);
      localStorage.setItem("ajd_saved", JSON.stringify(next));
      notify.success(res.message || (isSaved ? "Saved to your list" : "Removed from saved"));
    } catch {
      notify.error("Could not update saved job");
    }
  };

  const registerEvent = (evId) => {
    const next = [...registeredEvents, evId];
    setRegisteredEvents(next);
    localStorage.setItem("ajd_registered_events", JSON.stringify(next));
    notify.success("You are registered! Check your email for joining pass.");
  };

  const submitAlert = (e) => {
    e.preventDefault();
    if (!alertEmail.trim()) return;
    notify.success(`Alerts active for ${alertEmail} (${alertFreq})`);
    setAlertOpen(false);
    setAlertEmail("");
  };

  const liveOpenings = useMemo(() => 2400 + livePulse * 37, [livePulse]);
  const recruiterViews = useMemo(() => 14 + (stats?.inProgress || 0) * 3, [stats]);
  const completion = useMemo(() => calcCompletion(profileData), [profileData]);

  const recommendedJobs = useMemo(() => {
    const pool = jobs.length ? jobs : [];
    return [...pool].sort((a, b) => (b.matchScore || 70) - (a.matchScore || 70)).slice(0, 4);
  }, [jobs]);

  const displayJobs = useMemo(() => {
    if (isSearchActive) return serverSearchJobs;
    return jobs.slice(0, 7);
  }, [isSearchActive, serverSearchJobs, jobs]);

  const totalFound = useMemo(() => {
    if (isSearchActive) return serverSearchTotal;
    return jobs.length;
  }, [isSearchActive, serverSearchTotal, jobs.length]);

  const getViewAllLink = () => {
    const p = new URLSearchParams();
    if (search.trim()) p.set("search", search.trim());
    if (experience !== "") p.set("experience", experience);
    if (locationSearch.trim()) p.set("location", locationSearch.trim());
    const qs = p.toString();
    return `/apply-jobs/browse${qs ? `?${qs}` : ""}`;
  };

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
      <JobSearchHero
        greeting={greeting}
        firstName={firstName}
        liveOpenings={liveOpenings}
        search={search}
        setSearch={setSearch}
        experience={experience}
        setExperience={setExperience}
        expOpen={expOpen}
        setExpOpen={setExpOpen}
        expRef={expRef}
        expOptions={EXP_OPTIONS}
        locationSearch={locationSearch}
        setLocationSearch={setLocationSearch}
        onSearchSubmit={() => navigate(getViewAllLink())}
        user={user}
        completion={completion}
        ringOffset={ringOffset}
      />

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
          {/* STATS ROW */}
          <DashboardStatsRow
            savedCount={savedIds.length || stats?.savedJobs || 0}
            companiesCount={stats?.totalCompanies || followed.length || jobs.length}
            applicationsCount={stats?.total || 0}
            inProgressCount={stats?.inProgress || 0}
            interviewsCount={stats?.interviews || 0}
            onNavigate={(to) => navigate(to)}
          />

          {/* FEATURED / SEARCH RESULTS */}
          <FeaturedJobsSection
            isSearchActive={isSearchActive}
            isSearching={isSearching}
            totalFound={totalFound}
            viewAllLink={getViewAllLink()}
            displayJobs={displayJobs}
            savedIds={savedIds}
            toggleSave={toggleSave}
            handleApply={handleApply}
            applying={applying}
            onJobClick={() => navigate("/apply-jobs/browse")}
          />

          {/* HIRING EVENTS */}
          <HiringEventsSection
            events={EVENTS}
            registeredEvents={registeredEvents}
            onRegister={registerEvent}
          />

          {/* MARKET INSIGHTS */}
          <MarketInsightsSection
            skillDemand={SKILL_DEMAND}
            onSkillClick={(name) => navigate(`/apply-jobs/browse?search=${encodeURIComponent(name)}`)}
          />
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="ajd-right-sidebar">
          <SidebarApplicationAnalytics
            analytics={analytics}
            prefix="ajd"
            containerClass="ajd-rcard"
          />

          <div className="ajd-rcard ajd-views">
            <div className="ajd-views-icon"><Eye size={18} /></div>
            <div>
              <strong>{recruiterViews}</strong>
              <p>Recruiter profile views this week</p>
            </div>
          </div>

          <SidebarImproveProfile
            profileData={profileData}
            completion={completion}
            prefix="ajd"
            containerClass="ajd-rcard"
          />

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
                <Link to="/profile" className="ajd-boost-btn">Boost profile →</Link>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ECOSYSTEM */}
      <EcosystemSection onNavigate={(to) => navigate(to)} />

      {/* JOB ALERT MODAL */}
      <JobAlertModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        alertEmail={alertEmail}
        setAlertEmail={setAlertEmail}
        alertFreq={alertFreq}
        setAlertFreq={setAlertFreq}
        onSubmit={submitAlert}
      />
    </div>
  );
}
