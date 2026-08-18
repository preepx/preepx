import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame, Lock, Trophy, CheckCircle2, ChevronRight, ChevronLeft,
  Code2, TrendingUp, Zap, Target, Brain, Sparkles, Gem,
  Calendar, Clock, Star, Flag, Award, ArrowRight,
  Crown, Rocket, Shield, Swords, Compass, Layers, Check, BarChart3
} from "lucide-react";
import API from "@/utils/api";
import "@/styles/Challenge100Days.css";

const TOTAL_DAYS = 100;

const BOTTOM_FEATURES = [
  { icon: Brain, label: "Build strong coding habits" },
  { icon: Code2, label: "Master DSA problem solving" },
  { icon: Target, label: "Crack top product companies" },
  { icon: Award, label: "Earn XP & exclusive rewards" },
];

const PHASES = [
  { id: 1, upTo: 25, start: 1, name: "Foundation", desc: "Arrays, Strings & Hash Maps", icon: Shield, color: "#6366f1" },
  { id: 2, upTo: 50, start: 26, name: "Core DSA", desc: "Trees, Graphs & Recursion", icon: Swords, color: "#a78bfa" },
  { id: 3, upTo: 75, start: 51, name: "Advanced", desc: "DP & Greedy Algorithms", icon: Rocket, color: "#c084fc" },
  { id: 4, upTo: 100, start: 76, name: "Mastery", desc: "Hard Problems & Interview Prep", icon: Crown, color: "#f59e0b" },
];

const MILESTONES = [
  { day: 1, label: "Start" },
  { day: 25, label: "Day 25" },
  { day: 50, label: "Day 50" },
  { day: 75, label: "Day 75" },
  { day: 100, label: "Finale" },
];

const DIFFICULTY_XP = { easy: 5, medium: 10, hard: 15 };

function getPhase(day) {
  return PHASES.find((p) => day <= p.upTo) || PHASES[PHASES.length - 1];
}

function getPhaseIndex(day) {
  const idx = PHASES.findIndex((p) => day <= p.upTo);
  return idx !== -1 ? idx : PHASES.length - 1;
}

/* ── Animated Counter ── */
function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    if (value === 0) {
      setDisplay(0);
      return;
    }
    const step = Math.max(1, Math.ceil(value / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{display}</>;
}

/* ── Skeleton ── */
function SkeletonLoader() {
  return (
    <div className="c100-page c100-skeleton-wrap">
      <div className="c100-skeleton-hero" />
      <div className="c100-skeleton-stats">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="c100-skeleton-stat" />
        ))}
      </div>
      <div className="c100-skeleton-roadmap" />
      <div className="c100-skeleton-journey" />
    </div>
  );
}

/* ── Main Component ── */
const Challenge100Days = () => {
  const [challengeData, setChallengeData] = useState([]);
  const [progress, setProgress] = useState({ currentDay: 1, completedDays: [] });
  const [loading, setLoading] = useState(true);
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState("all");
  const scrollRef = useRef(null);
  const activeCardRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const streak = user.streak || 0;

  useEffect(() => {
    API.get("/coding/challenge")
      .then((res) => {
        if (res.data?.success) {
          setChallengeData(res.data.data.challengeDays || []);
          setProgress(res.data.data.progress || { currentDay: 1, completedDays: [] });
        }
      })
      .catch((err) => console.error("Failed to fetch challenge data", err))
      .finally(() => setLoading(false));
  }, []);

  const isCompleted = (day) => (progress.completedDays || []).includes(day);
  const isUnlocked = (day) => day === 1 || (progress.completedDays || []).includes(day - 1);

  const activeDay = useMemo(() => {
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      if (isUnlocked(d) && !isCompleted(d)) return d;
    }
    return TOTAL_DAYS;
  }, [progress]);

  const completedCount = progress.completedDays ? progress.completedDays.length : 0;
  const progressPercent = Math.min(100, Math.round((completedCount / TOTAL_DAYS) * 100));
  const daysRemaining = Math.max(0, TOTAL_DAYS - completedCount);
  const currentPhase = getPhase(activeDay);
  const currentPhaseIdx = getPhaseIndex(activeDay);

  // Filter visible days
  const visibleDays = useMemo(() => {
    let allAvailableDays = [];
    if (challengeData && challengeData.length > 0) {
      allAvailableDays = challengeData.map((d) => d.day);
      if (!allAvailableDays.includes(100)) {
        allAvailableDays.push(100);
      }
    } else {
      allAvailableDays = [1, 2, 3, 4, 5, 6, 7, 100];
    }

    // Sort uniquely
    allAvailableDays = Array.from(new Set(allAvailableDays)).sort((a, b) => a - b);

    if (selectedPhaseFilter === "all") {
      return allAvailableDays;
    }

    const phaseNum = parseInt(selectedPhaseFilter, 10);
    const targetPhase = PHASES.find((p) => p.id === phaseNum);
    if (!targetPhase) return allAvailableDays;

    return allAvailableDays.filter((d) => d >= targetPhase.start && d <= targetPhase.upTo);
  }, [challengeData, selectedPhaseFilter]);

  const getDayData = (dayNum) => challengeData.find((d) => d.day === dayNum);

  const getShortDesc = (problem) => {
    if (problem?.description) {
      const text = problem.description.replace(/<[^>]*>/g, "").trim();
      return text.length > 85 ? `${text.slice(0, 82)}…` : text;
    }
    return "Solve today's curated DSA challenge to level up and unlock the next day.";
  };

  const handleStart = (problemId, dayNum) => {
    navigate(`/coding-exam/${problemId}?source=challenge&day=${dayNum}`);
  };

  const scrollJourney = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  const scrollToActiveDay = () => {
    if (activeCardRef.current && scrollRef.current) {
      activeCardRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
      });
    }
  };

  // Scroll to active day once content loads
  useEffect(() => {
    if (!loading && challengeData.length > 0) {
      const timer = setTimeout(() => {
        if (activeCardRef.current && scrollRef.current) {
          activeCardRef.current.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest"
          });
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [loading, challengeData.length]);

  if (loading) return <SkeletonLoader />;

  return (
    <div className="c100-page">
      {/* Background ambient glow */}
      <div className="c100-ambient" aria-hidden="true">
        <div className="c100-orb c100-orb-1" />
        <div className="c100-orb c100-orb-2" />
        <div className="c100-orb c100-orb-3" />
      </div>

      {/* ─── Responsive Adaptive Banner ─── */}
      <div
        className="c100-banner-wrap"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
      >
        <picture className="c100-banner-picture">
          {/* Desktop (>= 1200px): 1600x440 */}
          <source
            media="(min-width: 1200px)"
            srcSet="https://ik.imagekit.io/cjnon47kr/preepx_100_days_desktop_1600x440.png"
          />
          {/* Laptop (>= 900px): 1400x400 */}
          <source
            media="(min-width: 900px)"
            srcSet="https://ik.imagekit.io/cjnon47kr/preepx_100_days_laptop_1400x400.png"
          />
          {/* Tablet (>= 600px) */}
          <source
            media="(min-width: 600px)"
            srcSet="https://ik.imagekit.io/cjnon47kr/tablet.png?updatedAt=1787077267679"
          />
          {/* Mobile (< 600px): EXACT 800x420 */}
          <img
            src="https://ik.imagekit.io/cjnon47kr/preepx_100_days_mobile_EXACT_800x420.png"
            alt="100 Days Challenge Banner"
            className="c100-banner-img"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          />
        </picture>
      </div>

      {/* ─── Stats Row (Matching User Dashboard) ─── */}
      <section className="c100-stats-section" aria-label="Your Progress Stats">
        <div className="c100-stats-grid">
          <div className="c100-stat-card" style={{ "--accent": "#6366f1" }}>
            <div className="c100-stat-icon"><BarChart3 size={20} /></div>
            <div>
              <span className="c100-stat-val"><AnimatedNumber value={completedCount} /></span>
              <span className="c100-stat-lbl">Days Completed</span>
            </div>
          </div>

          <div className="c100-stat-card" style={{ "--accent": "#06b6d4" }}>
            <div className="c100-stat-icon"><Flame size={20} /></div>
            <div>
              <span className="c100-stat-val"><AnimatedNumber value={streak} /></span>
              <span className="c100-stat-lbl">Current Streak</span>
            </div>
          </div>

          <div className="c100-stat-card" style={{ "--accent": "#10b981" }}>
            <div className="c100-stat-icon"><Target size={20} /></div>
            <div>
              <span className="c100-stat-val"><AnimatedNumber value={daysRemaining} /></span>
              <span className="c100-stat-lbl">Days Remaining</span>
            </div>
          </div>

          <div className="c100-stat-card" style={{ "--accent": "#f59e0b" }}>
            <div className="c100-stat-icon"><Crown size={20} /></div>
            <div>
              <span className="c100-stat-val">Day {activeDay}</span>
              <span className="c100-stat-lbl">Active Challenge</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Phase Roadmap ─── */}
      <section className="c100-roadmap-section" aria-label="Curriculum Phase Roadmap">
        <div className="c100-section-header">
          <div className="c100-section-title-wrap">
            <div className="c100-title-icon-badge">
              <Rocket size={18} />
            </div>
            <div>
              <h2 className="c100-section-title">Curriculum Roadmap</h2>
              <p className="c100-section-subtitle">Structured progression from fundamentals to interview mastery</p>
            </div>
          </div>

          <div className="c100-current-phase-badge">
            <span className="c100-phase-pulse-dot" style={{ background: currentPhase.color }} />
            <span>Currently: <strong>{currentPhase.name}</strong> (Day {currentPhase.start}–{currentPhase.upTo})</span>
          </div>
        </div>

        <div className="c100-phases-grid">
          {PHASES.map((phase, idx) => {
            const PhaseIcon = phase.icon;
            const isActive = idx === currentPhaseIdx;
            const isDone = currentPhaseIdx > idx;
            const isLocked = idx > currentPhaseIdx;

            return (
              <div
                key={phase.id}
                className={`c100-phase-box ${isActive ? "active" : ""} ${isDone ? "completed" : ""} ${isLocked ? "locked" : ""}`}
              >
                <div className="c100-phase-box-top">
                  <div
                    className="c100-phase-icon"
                    style={{
                      borderColor: phase.color + "44",
                      color: phase.color,
                      background: phase.color + "12"
                    }}
                  >
                    {isDone ? <CheckCircle2 size={20} /> : <PhaseIcon size={20} />}
                  </div>

                  <span className="c100-phase-day-range">
                    Day {phase.start}–{phase.upTo}
                  </span>
                </div>

                <div className="c100-phase-box-body">
                  <h3 className="c100-phase-name">{phase.name}</h3>
                  <p className="c100-phase-desc">{phase.desc}</p>
                </div>

                <div className="c100-phase-box-footer">
                  {isDone && (
                    <span className="c100-phase-status-pill done">
                      <Check size={12} /> Phase Completed
                    </span>
                  )}
                  {isActive && (
                    <span className="c100-phase-status-pill current">
                      <span className="c100-dot-live" /> In Progress
                    </span>
                  )}
                  {isLocked && (
                    <span className="c100-phase-status-pill upcoming">
                      <Lock size={11} /> Upcoming Phase
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Milestone Progress Bar */}
        <div className="c100-milestone-wrapper">
          <div className="c100-milestone-bar-container">
            <div className="c100-milestone-bar-bg">
              <div
                className="c100-milestone-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="c100-milestone-checkpoints">
              {MILESTONES.map(({ day, label }) => {
                const reached = completedCount >= day || (day === 1 && completedCount >= 0);
                const isFinal = day === 100;
                return (
                  <div key={day} className="c100-checkpoint-node">
                    <div
                      className={`c100-checkpoint-dot ${reached ? "reached" : ""} ${isFinal ? "final" : ""}`}
                    >
                      {reached ? (
                        <Check size={10} strokeWidth={3} />
                      ) : isFinal ? (
                        <Trophy size={9} />
                      ) : (
                        <span className="c100-node-inner" />
                      )}
                    </div>
                    <span className={`c100-checkpoint-label ${reached ? "reached" : ""}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Daily Challenge Journey ─── */}
      {challengeData.length === 0 ? (
        <div className="c100-empty-card">
          <div className="c100-empty-icon-wrap">
            <Code2 size={32} />
          </div>
          <h3>Daily Challenges Loading</h3>
          <p>We are syncing the curated 100-day problems for your account. Please check back shortly.</p>
        </div>
      ) : (
        <section className="c100-journey-section" aria-label="Daily Coding Challenges">
          {/* Header with Phase Filters and Navigation Controls */}
          <div className="c100-journey-header-row">
            <div className="c100-section-title-wrap">
              <div className="c100-title-icon-badge gold">
                <Trophy size={18} />
              </div>
              <div>
                <h2 className="c100-section-title">The 100-Day Journey</h2>
                <p className="c100-section-subtitle">
                  Complete challenges in sequential order. Solve each to unlock the next.
                </p>
              </div>
            </div>

            <div className="c100-journey-controls">
              <button
                type="button"
                className="c100-jump-btn"
                onClick={scrollToActiveDay}
                title="Scroll directly to today's challenge"
              >
                <Target size={15} />
                <span>Jump to Day {activeDay}</span>
              </button>

              <div className="c100-scroll-arrows">
                <button
                  type="button"
                  className="c100-scroll-arrow-btn"
                  onClick={() => scrollJourney(-1)}
                  aria-label="Scroll challenges left"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="c100-scroll-arrow-btn"
                  onClick={() => scrollJourney(1)}
                  aria-label="Scroll challenges right"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Phase Filter Tabs */}
          <div className="c100-filter-tabs">
            <button
              type="button"
              className={`c100-filter-tab ${selectedPhaseFilter === "all" ? "active" : ""}`}
              onClick={() => setSelectedPhaseFilter("all")}
            >
              <Layers size={14} />
              <span>All Challenges</span>
              <span className="c100-tab-count">{challengeData.length || 100}</span>
            </button>

            {PHASES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`c100-filter-tab ${selectedPhaseFilter === String(p.id) ? "active" : ""}`}
                onClick={() => setSelectedPhaseFilter(String(p.id))}
              >
                <span>Phase {p.id}: {p.name}</span>
                <span className="c100-tab-sub">({p.start}–{p.upTo})</span>
              </button>
            ))}
          </div>

          {/* Horizontal Scroll Track Container */}
          <div className="c100-journey-scroll-area" ref={scrollRef}>
            <div className="c100-journey-inner-track">
              {/* Timeline Header Row */}
              <div className="c100-timeline-track">
                <div className="c100-timeline-connecting-line" />
                {visibleDays.map((dayNum) => {
                  const isFinal = dayNum === 100;
                  const unlocked = isUnlocked(dayNum);
                  const completed = isCompleted(dayNum);
                  const inProgress = unlocked && !completed && dayNum === activeDay;
                  const allPrevDone = completedCount >= 99;

                  return (
                    <div
                      key={`timeline-step-${dayNum}`}
                      className={`c100-timeline-item ${isFinal ? "is-final" : ""}`}
                    >
                      <div className="c100-step-indicator-wrapper">
                        {inProgress && <span className="c100-step-badge in-progress">Active</span>}
                        {completed && <span className="c100-step-badge completed">Done</span>}
                        {!inProgress && !completed && <span className="c100-step-badge placeholder">Day {dayNum}</span>}

                        {isFinal ? (
                          <div className={`c100-step-node finale ${allPrevDone ? "unlocked" : "locked"}`}>
                            <span>100</span>
                            <Trophy size={14} />
                          </div>
                        ) : (
                          <div
                            className={`c100-step-node ${completed ? "completed" : unlocked ? "active" : "locked"}`}
                          >
                            {completed ? (
                              <CheckCircle2 size={20} />
                            ) : unlocked ? (
                              <span>{dayNum}</span>
                            ) : (
                              <Lock size={15} />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Challenge Day Cards Row */}
              <div className="c100-challenge-cards-row">
                {visibleDays.map((dayNum) => {
                  const isFinal = dayNum === 100;
                  const dayObj = getDayData(dayNum);
                  const problem = dayObj?.problems?.[0];
                  const unlocked = isUnlocked(dayNum);
                  const completed = isCompleted(dayNum);
                  const inProgress = unlocked && !completed && dayNum === activeDay;
                  const diff = problem?.difficulty?.toLowerCase() || "medium";
                  const xp = DIFFICULTY_XP[diff] || 10;
                  const isTargetActive = dayNum === activeDay;

                  if (isFinal) {
                    const allDone = completedCount >= 99;
                    return (
                      <div
                        key={`challenge-card-${dayNum}`}
                        ref={isTargetActive ? activeCardRef : null}
                        className={`c100-challenge-card final-card ${allDone ? "unlocked" : ""}`}
                      >
                        <div className="c100-card-header">
                          <span className="c100-card-day-tag finale">Day 100 Finale</span>
                          <span className="c100-difficulty-tag finale">
                            <Gem size={12} /> Legend
                          </span>
                        </div>

                        <div className="c100-finale-icon-badge">
                          <Trophy size={28} />
                        </div>

                        <h3 className="c100-card-title">The Grand Finale Challenge</h3>

                        <p className="c100-card-description">
                          Complete all 99 daily DSA problems to unlock the grand finale examination.
                          Earn verified certificate badge & master rewards.
                        </p>

                        <div className="c100-finale-rewards-box">
                          <Crown size={16} />
                          <span>{allDone ? "Unlocked: Ready for Finale" : "Unlock by finishing Day 99"}</span>
                        </div>

                        <button
                          type="button"
                          className="c100-challenge-action-btn finale"
                          disabled={!allDone || !problem}
                          onClick={() => problem && handleStart(problem._id, 100)}
                        >
                          <span>{allDone ? "Enter Finale Exam" : "Locked Finale"}</span>
                          <Lock size={15} />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`challenge-card-${dayNum}`}
                      ref={isTargetActive ? activeCardRef : null}
                      className={`c100-challenge-card ${inProgress ? "is-active-day" : ""} ${completed ? "is-completed-day" : ""} ${!unlocked ? "is-locked-day" : ""}`}
                    >
                      {/* Top Bar with Day Tag & Difficulty */}
                      <div className="c100-card-header">
                        <span className={`c100-card-day-tag ${inProgress ? "active" : completed ? "done" : ""}`}>
                          Day {dayNum < 10 ? `0${dayNum}` : dayNum}
                        </span>
                        {unlocked && (
                          <span className={`c100-difficulty-tag ${diff}`}>
                            {problem?.difficulty || "Medium"}
                          </span>
                        )}
                      </div>

                      {!unlocked ? (
                        <div className="c100-card-locked-body">
                          <div className="c100-lock-bubble">
                            <Lock size={22} />
                          </div>
                          <h4 className="c100-lock-title">Challenge Locked</h4>
                          <p className="c100-lock-text">
                            Complete Day {dayNum - 1} challenge to unlock this problem.
                          </p>
                          <div className="c100-lock-requirement-pill">
                            <span>Requires Day {dayNum - 1} Completion</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="c100-card-title" title={problem?.title}>
                            {problem?.title || `Day ${dayNum} DSA Challenge`}
                          </h3>

                          {problem?.topics && problem.topics.length > 0 && (
                            <div className="c100-card-topics">
                              {problem.topics.slice(0, 2).map((t) => (
                                <span key={t} className="c100-topic-chip">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          <p className="c100-card-description">{getShortDesc(problem)}</p>

                          <div className="c100-card-meta-row">
                            <div className="c100-meta-item xp">
                              <Zap size={13} />
                              <span>+{xp} XP</span>
                            </div>
                            <div className="c100-meta-item time">
                              <Clock size={13} />
                              <span>~30 mins</span>
                            </div>
                          </div>

                          <div className="c100-card-progress-section">
                            <div className="c100-card-progress-labels">
                              <span>Status</span>
                              <strong>{completed ? "Completed" : inProgress ? "In Progress" : "Not Started"}</strong>
                            </div>
                            <div className="c100-card-progress-track">
                              <div
                                className={`c100-card-progress-bar ${completed ? "full" : inProgress ? "half" : ""}`}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`c100-challenge-action-btn ${completed ? "review" : "start"}`}
                            onClick={() => problem && handleStart(problem._id, dayNum)}
                            disabled={!problem}
                          >
                            <span>{completed ? "Review Solution" : "Start Challenge"}</span>
                            {completed ? <CheckCircle2 size={16} /> : <ChevronRight size={16} />}
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Bottom Motivation & Consistency Card ─── */}
      <section className="c100-bottom-motivation-bar" aria-label="Consistency motivation">
        <div className="c100-motivation-left">
          <div className="c100-motivation-badge">
            <Zap size={14} />
            <span>Consistency Formula</span>
          </div>
          <h3 className="c100-motivation-title">
            Small daily coding habits compound into massive career breakthroughs.
          </h3>
          <div className="c100-motivation-chips">
            {BOTTOM_FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="c100-motivation-chip">
                <Icon size={14} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="c100-motivation-right">
          <div className="c100-streak-highlight-card">
            <div className="c100-streak-flame-wrap">
              <Flame size={24} className="c100-flame-bounce" />
            </div>
            <div className="c100-streak-info">
              <span className="c100-streak-tag">Streak Status</span>
              <strong>
                {streak > 0 ? `${streak} Day Streak! 🔥` : "Start Your Streak Today"}
              </strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Challenge100Days;
