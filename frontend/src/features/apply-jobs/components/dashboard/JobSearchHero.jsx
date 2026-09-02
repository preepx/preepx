import React from "react";
import { Search, Briefcase, ChevronDown, Check, MapPin } from "lucide-react";

export default function JobSearchHero({
  greeting,
  firstName,
  liveOpenings = 2400,
  search,
  setSearch,
  experience,
  setExperience,
  expOpen,
  setExpOpen,
  expRef,
  expOptions = [],
  locationSearch,
  setLocationSearch,
  onSearchSubmit,
  user,
  completion = 0,
  ringOffset = 0,
}) {
  return (
    <section className="ajd-hero-banner">
      <div className="ajd-hero-glow" />
      <div className="ajd-hb-left">
        <div className="ajd-live-chip">
          <span className="ajd-pulse" />
          {liveOpenings}+ live openings · updated just now
        </div>
        <h1 className="ajd-hb-title">{greeting}, {firstName}</h1>
        <p className="ajd-hb-sub">Find roles at MNCs, startups and walk-in drives — matched to your profile.</p>

        <div className="ajd-hb-search">
          <div className="ajd-hbs-seg">
            <Search size={16} className="ajd-hbs-icon" />
            <input
              placeholder="Skills, designation or company"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSearchSubmit(); }}
            />
          </div>
          <div className="ajd-hbs-div" />
          <div
            className={`ajd-hbs-seg ajd-hbs-seg--mid ajd-hbs-seg--dropdown ${expOpen ? "is-open" : ""}`}
            ref={expRef}
            onClick={() => setExpOpen((prev) => !prev)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setExpOpen((prev) => !prev);
              }
            }}
          >
            <Briefcase size={16} className="ajd-hbs-icon" />
            <span className={`ajd-hbs-select-value ${experience !== "" ? "has-value" : ""}`}>
              {expOptions.find((o) => o.value === experience)?.label || "Experience"}
            </span>
            <ChevronDown size={14} className={`ajd-hbs-chevron ${expOpen ? "is-rotated" : ""}`} />

            {expOpen && (
              <div className="ajd-exp-menu" onClick={(e) => e.stopPropagation()}>
                <div className="ajd-exp-menu-header">
                  <span>Experience Level</span>
                  {experience !== "" && (
                    <button
                      type="button"
                      className="ajd-exp-clear-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExperience("");
                        setExpOpen(false);
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="ajd-exp-menu-list">
                  {expOptions.map((opt) => {
                    const isSelected = experience === opt.value;
                    return (
                      <div
                        key={opt.value}
                        className={`ajd-exp-item ${isSelected ? "is-selected" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExperience(opt.value);
                          setExpOpen(false);
                        }}
                      >
                        <span>{opt.label === "Experience" ? "All Experience" : opt.label}</span>
                        {isSelected && <Check size={14} className="ajd-exp-check-icon" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="ajd-hbs-div" />
          <div className="ajd-hbs-seg">
            <MapPin size={16} className="ajd-hbs-icon" />
            <input
              placeholder="Location"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSearchSubmit(); }}
            />
          </div>
          <button className="ajd-hbs-btn" type="button" onClick={onSearchSubmit}>
            Search
          </button>
        </div>

        <div className="ajd-hb-tags">
          <span>Popular:</span>
          {["React Developer", "Frontend Developer", "UI/UX Designer", "Backend Developer", "Data Analyst"].map((t) => (
            <button type="button" key={t} className="ajd-hb-tag" onClick={() => setSearch(t)}>
              {t}
            </button>
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
  );
}
