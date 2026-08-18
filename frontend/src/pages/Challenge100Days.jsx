import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame, Lock, Trophy, CheckCircle2, ChevronRight, ChevronLeft,
  Code2, TrendingUp, Zap, Target, Brain, Sparkles, Gem,
  Calendar, Clock, Star, Flag, Play, Award, ArrowRight,
  Crown, Rocket, Shield, Swords
} from "lucide-react";
import API from "@/utils/api";
import "@/styles/Challenge100Days.css";

const TOTAL_DAYS = 100;

const FEATURES = [
  { icon: Code2, label: "Daily Problems", desc: "Curated DSA questions" },
  { icon: TrendingUp, label: "Track Progress", desc: "Visual analytics" },
  { icon: Zap, label: "Earn XP & Rewards", desc: "Unlock achievements" },
  { icon: Target, label: "Build Consistency", desc: "Daily streaks" },
];

const BOTTOM_FEATURES = [
  { icon: Brain, label: "Build strong coding habits" },
  { icon: Sparkles, label: "Improve problem solving" },
  { icon: Target, label: "Crack top companies" },
  { icon: Award, label: "Earn rewards daily" },
];

const PHASES = [
  { upTo: 25, name: "Foundation", desc: "Arrays, Strings & Hash Maps", icon: Shield, color: "#6366f1" },
  { upTo: 50, name: "Core DSA", desc: "Trees, Graphs & Recursion", icon: Swords, color: "#a78bfa" },
  { upTo: 75, name: "Advanced", desc: "DP & Greedy Algorithms", icon: Rocket, color: "#c084fc" },
  { upTo: 100, name: "Mastery", desc: "Hard Problems & Interview", icon: Crown, color: "#f59e0b" },
];

const MILESTONES = [
  { day: 1, label: "Start" },
  { day: 25, label: "Day 25" },
  { day: 50, label: "Day 50" },
  { day: 75, label: "Day 75" },
  { day: 100, label: "Finish" },
];

const DIFFICULTY_XP = { easy: 5, medium: 10, hard: 15 };

function getPhase(day) {
  return PHASES.find((p) => day <= p.upTo) || PHASES[PHASES.length - 1];
}
function getPhaseIndex(day) {
  return PHASES.findIndex((p) => day <= p.upTo);
}

/* ── Animated Counter ── */
function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display}</>;
}

/* ── Circular Progress ── */
function CircularProgress({ percent }) {
  const size = 140;
  const stroke = 10;
  const radius = 52;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="c100-progress-ring-wrap">
      <svg width={size} height={size} aria-hidden="true">
        <defs>
          <linearGradient id="c100ProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <filter id="c100ProgressGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={normalizedRadius}
          fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={normalizedRadius}
          fill="none" stroke="url(#c100ProgressGrad)" strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#c100ProgressGlow)"
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="c100-progress-center">
        <span className="c100-progress-value">{percent}%</span>
        <span className="c100-progress-label">Complete</span>
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function SkeletonLoader() {
  return (
    <div className="c100-skeleton">
      <div className="c100-skeleton-hero" />
      <div className="c100-skeleton-stats">
        {[1, 2, 3, 4].map((i) => <div key={i} className="c100-skeleton-stat" />)}
      </div>
      <div className="c100-skeleton-journey" />
    </div>
  );
}

/* ── Main Component ── */
const Challenge100Days = () => {
  const [challengeData, setChallengeData] = useState([]);
  const [progress, setProgress] = useState({ currentDay: 1, completedDays: [] });
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const streak = user.streak || 0;

  useEffect(() => {
    API.get("/coding/challenge")
      .then((res) => {
        if (res.data.success) {
          setChallengeData(res.data.data.challengeDays);
          setProgress(res.data.data.progress);
        }
      })
      .catch((err) => console.error("Failed to fetch challenge data", err))
      .finally(() => setLoading(false));
  }, []);

  const isCompleted = (day) => progress.completedDays.includes(day);
  const isUnlocked = (day) => day === 1 || progress.completedDays.includes(day - 1);

  const activeDay = useMemo(() => {
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      if (isUnlocked(d) && !isCompleted(d)) return d;
    }
    return TOTAL_DAYS;
  }, [progress]);

  const completedCount = progress.completedDays.length;
  const progressPercent = Math.min(100, Math.round((completedCount / TOTAL_DAYS) * 100));
  const daysRemaining = TOTAL_DAYS - completedCount;
  const currentPhase = getPhase(activeDay);
  const currentPhaseIdx = getPhaseIndex(activeDay);

  const visibleDays = useMemo(() => {
    const fromApi = challengeData.map((d) => d.day).filter((d) => d < 100);
    const firstSeven = fromApi.length > 0
      ? fromApi.slice(0, 7)
      : [1, 2, 3, 4, 5, 6, 7];
    return [...firstSeven, 100];
  }, [challengeData]);

  const getDayData = (dayNum) => challengeData.find((d) => d.day === dayNum);

  const activeProblem = getDayData(activeDay)?.problems?.[0];

  const getShortDesc = (problem) => {
    if (problem?.description) {
      const text = problem.description.replace(/<[^>]*>/g, "").trim();
      return text.length > 90 ? `${text.slice(0, 87)}…` : text;
    }
    return "Solve today's coding challenge to unlock the next day.";
  };

  const handleStart = (problemId) => navigate(`/coding-exam?problemId=${problemId}`);

  const scrollJourney = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  if (loading) return <SkeletonLoader />;

  return (
    <div className="c100-page">
      {/* Ambient background effects */}
      <div className="c100-ambient" aria-hidden="true">
        <div className="c100-orb c100-orb-1" />
        <div className="c100-orb c100-orb-2" />
        <div className="c100-orb c100-orb-3" />
      </div>

      {/* ─── Banner ─── */}
      <div className="c100-banner-wrap">
        <img src="/chealgebanner.png" alt="100 Days Challenge" className="c100-banner-img" />
      </div>

      {/* ─── Stats Strip ─── */}
      <section className="c100-stats" aria-label="Challenge statistics">
        {[
          { icon: CheckCircle2, value: completedCount, label: "Days Completed", color: "purple", accent: "#818cf8" },
          { icon: Flame, value: streak, label: "Day Streak", color: "orange", accent: "#fb923c" },
          { icon: Calendar, value: daysRemaining, label: "Days Remaining", color: "green", accent: "#34d399" },
          { icon: Star, value: activeDay, label: "Current Day", color: "gold", accent: "#fbbf24" },
        ].map(({ icon: Icon, value, label, color, accent }) => (
          <div key={label} className="c100-stat-card">
            <div className="c100-stat-glow" style={{ background: accent }} />
            <div className={`c100-stat-icon ${color}`}><Icon size={20} /></div>
            <div className="c100-stat-value"><AnimatedNumber value={value} /></div>
            <div className="c100-stat-label">{label}</div>
          </div>
        ))}
      </section>

      {/* ─── Phase Roadmap ─── */}
      <section className="c100-roadmap" aria-label="Phase roadmap">
        <div className="c100-roadmap-header">
          <div>
            <h3><Rocket size={18} /> Phase Roadmap</h3>
            <p>Your journey through 4 phases of DSA mastery</p>
          </div>
          <div className="c100-roadmap-current-phase">
            <span className="c100-phase-indicator" style={{ background: currentPhase.color }} />
            Currently in: <strong>{currentPhase.name}</strong>
          </div>
        </div>
        <div className="c100-roadmap-phases">
          {PHASES.map((phase, idx) => {
            const PhaseIcon = phase.icon;
            const isActive = idx === currentPhaseIdx;
            const isDone = currentPhaseIdx > idx;
            return (
              <div key={phase.name} className={`c100-phase-card ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
                {idx < PHASES.length - 1 && <div className={`c100-phase-connector ${isDone ? "done" : ""}`} />}
                <div className="c100-phase-icon-wrap" style={{ borderColor: phase.color + "55", color: phase.color }}>
                  {isDone ? <CheckCircle2 size={22} /> : <PhaseIcon size={22} />}
                </div>
                <div className="c100-phase-info">
                  <span className="c100-phase-name">{phase.name}</span>
                  <span className="c100-phase-range">Day 1–{phase.upTo}</span>
                  <span className="c100-phase-desc">{phase.desc}</span>
                </div>
                {isActive && <span className="c100-phase-active-badge">Current</span>}
                {isDone && <span className="c100-phase-done-badge"><CheckCircle2 size={12} /> Done</span>}
              </div>
            );
          })}
        </div>

        {/* Milestone progress bar */}
        <div className="c100-milestone-track">
          <div className="c100-milestone-fill" style={{ width: `${progressPercent}%` }} />
          <div className="c100-milestone-markers">
            {MILESTONES.map(({ day, label }) => {
              const reached = completedCount >= day || (day === 1 && completedCount >= 0);
              const isFinal = day === 100;
              return (
                <div key={day} className="c100-milestone-dot-wrap">
                  <div className={`c100-milestone-dot ${reached ? "reached" : ""} ${isFinal ? "final" : ""}`}>
                    {reached && <CheckCircle2 size={8} />}
                  </div>
                  <span className={`c100-milestone-label ${reached ? "reached" : ""}`}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Journey / Day Cards ─── */}
      {challengeData.length === 0 ? (
        <div className="c100-empty">
          <div className="c100-empty-icon"><Code2 size={32} /></div>
          <h3>Challenge content coming soon</h3>
          <p>Daily coding problems are being prepared. Check back shortly to begin your 100-day journey.</p>
        </div>
      ) : (
        <section className="c100-journey" aria-label="Daily challenge journey">
          <div className="c100-journey-top">
            <div className="c100-journey-header">
              <h2><Trophy size={22} color="#f59e0b" /> The Journey</h2>
              <p>Complete each day sequentially to unlock the next challenge.</p>
            </div>
            <div className="c100-journey-nav">
              <button type="button" className="c100-nav-btn" onClick={() => scrollJourney(-1)} aria-label="Scroll left">
                <ChevronLeft size={18} />
              </button>
              <button type="button" className="c100-nav-btn" onClick={() => scrollJourney(1)} aria-label="Scroll right">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="c100-journey-scroll" ref={scrollRef}>
            <div className="c100-journey-track">
              {/* Timeline nodes */}
              <div className="c100-timeline">
                <div className="c100-timeline-line" />
                {visibleDays.map((dayNum) => {
                  const isFinal = dayNum === 100;
                  const unlocked = isUnlocked(dayNum);
                  const completed = isCompleted(dayNum);
                  const inProgress = unlocked && !completed && dayNum === activeDay;
                  const allPrevDone = completedCount >= 99;

                  return (
                    <div key={`tl-${dayNum}`} className={`c100-timeline-step ${isFinal ? "wide" : ""}`}>
                      <span className={`c100-step-badge ${inProgress ? "in-progress" : completed ? "completed-tag" : "empty"}`}>
                        {inProgress ? "IN PROGRESS" : completed ? "COMPLETED" : ""}
                      </span>

                      {isFinal ? (
                        <div className={`c100-step-circle final ${allPrevDone ? "" : "locked-final"}`}>
                          <span>100</span>
                          <Trophy size={15} />
                        </div>
                      ) : (
                        <div className={`c100-step-circle ${completed ? "completed" : unlocked ? "active" : "locked"}`}>
                          {completed ? <CheckCircle2 size={22} /> : unlocked ? dayNum : <Lock size={16} />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Day cards */}
              <div className="c100-cards-row">
                {visibleDays.map((dayNum) => {
                  const isFinal = dayNum === 100;
                  const dayObj = getDayData(dayNum);
                  const problem = dayObj?.problems?.[0];
                  const unlocked = isUnlocked(dayNum);
                  const completed = isCompleted(dayNum);
                  const inProgress = unlocked && !completed && dayNum === activeDay;
                  const diff = problem?.difficulty?.toLowerCase();
                  const xp = DIFFICULTY_XP[diff] || 10;

                  if (isFinal) {
                    const allDone = completedCount >= 99;
                    return (
                      <div key={`card-${dayNum}`} className="c100-day-card wide final">
                        <div className="c100-card-header">
                          <span className="c100-card-day-label">Day 100</span>
                          <Flag size={14} color="#fbbf24" />
                        </div>
                        <div className="c100-final-icon"><Gem size={24} /></div>
                        <h3 className="c100-card-title">The Grand Finale</h3>
                        <p className="c100-card-desc">
                          Complete all 99 days to unlock the grand finale.
                          Earn exclusive rewards and the 100 Days badge.
                        </p>
                        <div className="c100-final-reward">
                          <Trophy size={14} />
                          {allDone ? "Ready to claim your reward" : "Grand Reward Locked"}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`card-${dayNum}`}
                      className={`c100-day-card ${inProgress ? "active" : ""} ${completed ? "completed-card" : ""} ${!unlocked ? "locked" : ""}`}
                    >
                      <div className="c100-card-header">
                        <span className="c100-card-day-label">Day {dayNum}</span>
                        {problem?.difficulty && (
                          <span className={`c100-difficulty ${diff}`}>{problem.difficulty}</span>
                        )}
                      </div>

                      {!unlocked ? (
                        <div className="c100-card-lock-msg">
                          <div className="c100-lock-icon-wrap"><Lock size={20} /></div>
                          <span>Complete Day {dayNum - 1} to unlock</span>
                        </div>
                      ) : (
                        <>
                          <h3 className="c100-card-title">
                            {problem?.title || `Challenge Day ${dayNum}`}
                          </h3>

                          {problem?.topics?.length > 0 && (
                            <div className="c100-card-tags">
                              {problem.topics.slice(0, 2).map((t) => (
                                <span key={t} className="c100-card-tag">{t}</span>
                              ))}
                            </div>
                          )}

                          <p className="c100-card-desc">{getShortDesc(problem)}</p>

                          <div className="c100-card-meta">
                            <span><Zap size={12} /> +{xp} XP</span>
                            <span><Clock size={12} /> ~30 min</span>
                          </div>

                          <div className="c100-card-progress-label">
                            <span>Progress</span>
                            <span>{completed ? "100%" : "0%"}</span>
                          </div>
                          <div className="c100-card-progress-bar">
                            <div
                              className={`c100-card-progress-fill ${completed ? "done" : ""}`}
                              style={{ width: completed ? "100%" : "0%" }}
                            />
                          </div>

                          <button
                            type="button"
                            className={`c100-card-btn ${completed ? "completed" : "primary"}`}
                            onClick={() => problem && handleStart(problem._id)}
                            disabled={!problem}
                          >
                            {completed ? "Review Solution" : "Start Challenge"}
                            <ChevronRight size={15} />
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

      {/* ─── Bottom Motivation Bar ─── */}
      <section className="c100-bottom-bar">
        <div className="c100-bottom-left">
          <h3>Stay consistent — small daily wins lead to big career outcomes.</h3>
          <div className="c100-bottom-features">
            {BOTTOM_FEATURES.map(({ icon: Icon, label }) => (
              <span key={label} className="c100-bottom-feature">
                <Icon size={14} />
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="c100-streak-pill">
          <Flame size={20} className="c100-streak-flame" />
          {streak > 0 ? (
            <>Keep the streak alive — <strong>{streak} day streak</strong></>
          ) : (
            <>Start today and <strong>build your streak</strong></>
          )}
        </div>
      </section>
    </div>
  );
};

export default Challenge100Days;
