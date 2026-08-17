import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame, Lock, Trophy, CheckCircle2, ChevronRight, ChevronLeft,
  Code2, TrendingUp, Zap, Target, Brain, Sparkles, Gem,
  Calendar, Clock, Star, Flag, Play, Award
} from "lucide-react";
import API from "@/utils/api";
import "@/styles/Challenge100Days.css";

const TOTAL_DAYS = 100;

const FEATURES = [
  { icon: Code2, label: "Daily Problems" },
  { icon: TrendingUp, label: "Track Progress" },
  { icon: Zap, label: "Earn XP & Rewards" },
  { icon: Target, label: "Build Consistency" },
];

const BOTTOM_FEATURES = [
  { icon: Brain, label: "Build strong coding habits" },
  { icon: Sparkles, label: "Improve problem solving" },
  { icon: Target, label: "Crack top companies" },
  { icon: Award, label: "Earn rewards daily" },
];

const PHASES = [
  { upTo: 25, name: "Foundation", desc: "Arrays, Strings & Hash Maps" },
  { upTo: 50, name: "Core DSA", desc: "Trees, Graphs & Recursion" },
  { upTo: 75, name: "Advanced", desc: "Dynamic Programming & Greedy" },
  { upTo: 100, name: "Mastery", desc: "Hard Problems & Interview Prep" },
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

function CircularProgress({ percent }) {
  const size = 128;
  const stroke = 8;
  const radius = 48;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="challenge-progress-ring-wrap">
      <svg width={size} height={size} aria-hidden="true">
        <defs>
          <linearGradient id="c100ProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={normalizedRadius}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={normalizedRadius}
          fill="none" stroke="url(#c100ProgressGrad)" strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="challenge-progress-percent">
        <span className="challenge-progress-percent-value">{percent}%</span>
        <span className="challenge-progress-percent-label">Complete</span>
      </div>
    </div>
  );
}

function MountainSVG() {
  return (
    <div className="challenge-hero-mountain" aria-hidden="true">
      <svg viewBox="0 0 1200 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="c100Mtn" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a113d" />
            <stop offset="100%" stopColor="#080914" />
          </linearGradient>
          <linearGradient id="c100Path" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Mountain Silhouette */}
        <path d="M0,200 L150,110 L300,160 L450,80 L600,120 L750,40 L900,110 L1050,30 L1200,90 L1200,200 Z" fill="url(#c100Mtn)" opacity="0.8" />
        <path d="M0,200 L200,140 L400,180 L650,90 L850,150 L1100,50 L1200,120 L1200,200 Z" fill="rgba(8,9,20,0.5)" />

        {/* Glowing Path */}
        <path
          d="M 120 170 Q 280 140 450 150 Q 600 100 750 90 Q 900 60 1050 30"
          fill="none" stroke="url(#c100Path)" strokeWidth="3"
          strokeLinecap="round" filter="url(#glow)"
          strokeDasharray="8 6"
        />

        {/* Markers */}
        <g transform="translate(450, 150)">
          <circle cx="0" cy="0" r="4" fill="#a78bfa" filter="url(#glow)" />
          <rect x="-24" y="-30" width="48" height="20" rx="4" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="1" />
          <text x="0" y="-16" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">DAY 1</text>
        </g>

        <g transform="translate(600, 110)">
          <circle cx="0" cy="0" r="4" fill="#a78bfa" filter="url(#glow)" />
          <rect x="-24" y="-30" width="48" height="20" rx="4" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="1" />
          <text x="0" y="-16" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">DAY 25</text>
        </g>

        <g transform="translate(750, 90)">
          <circle cx="0" cy="0" r="4" fill="#c084fc" filter="url(#glow)" />
          <rect x="-24" y="-30" width="48" height="20" rx="4" fill="#1e1b4b" stroke="#9333ea" strokeWidth="1" />
          <text x="0" y="-16" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">DAY 50</text>
        </g>

        <g transform="translate(1050, 30)">
          <circle cx="0" cy="0" r="6" fill="#f59e0b" filter="url(#glow)" />
          <rect x="-24" y="-36" width="48" height="20" rx="4" fill="#451a03" stroke="#f59e0b" strokeWidth="1" />
          <text x="0" y="-22" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">DAY 100</text>
          <path d="M0,-8 L0,0 M-5,-8 L5,-8 M-3,-12 L3,-12" stroke="#f59e0b" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="challenge-skeleton-page">
      <div className="challenge-skeleton-hero" />
      <div className="challenge-skeleton-stats">
        {[1, 2, 3, 4].map((i) => <div key={i} className="challenge-skeleton-stat" />)}
      </div>
      <div className="challenge-skeleton-journey" />
    </div>
  );
}

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
    scrollRef.current.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  if (loading) return <SkeletonLoader />;

  const unlockHint = activeDay < TOTAL_DAYS
    ? `Complete Day ${activeDay} to unlock Day ${activeDay + 1}`
    : "Congratulations — you've completed the challenge!";

  return (
    <div className="challenge-100-page">
      <div className="challenge-banner-wrap">
        <img src="/chealgebanner.png" alt="100 Days Challenge" className="challenge-banner-img" />
      </div>

      {/* Stats */}
      <section className="challenge-stats" aria-label="Challenge statistics">
        <div className="challenge-stat-card">
          <div className="challenge-stat-top">
            <div className="challenge-stat-icon purple"><CheckCircle2 size={18} /></div>
          </div>
          <div className="challenge-stat-value">{completedCount}</div>
          <div className="challenge-stat-label">Days Completed</div>
        </div>
        <div className="challenge-stat-card">
          <div className="challenge-stat-top">
            <div className="challenge-stat-icon orange"><Flame size={18} /></div>
          </div>
          <div className="challenge-stat-value">{streak}</div>
          <div className="challenge-stat-label">Day Streak</div>
        </div>
        <div className="challenge-stat-card">
          <div className="challenge-stat-top">
            <div className="challenge-stat-icon green"><Calendar size={18} /></div>
          </div>
          <div className="challenge-stat-value">{daysRemaining}</div>
          <div className="challenge-stat-label">Days Remaining</div>
        </div>
        <div className="challenge-stat-card">
          <div className="challenge-stat-top">
            <div className="challenge-stat-icon gold"><Star size={18} /></div>
          </div>
          <div className="challenge-stat-value">{activeDay}</div>
          <div className="challenge-stat-label">Current Day</div>
        </div>
      </section>

      {/* Milestone progress */}
      <section className="challenge-milestone" aria-label="Overall milestone progress">
        <div className="challenge-milestone-header">
          <h3>Roadmap Progress</h3>
          <span className="challenge-milestone-phase">
            Phase: {currentPhase.name} — {currentPhase.desc}
          </span>
        </div>
        <div className="challenge-milestone-track">
          <div className="challenge-milestone-fill" style={{ width: `${progressPercent}%` }} />
          <div className="challenge-milestone-markers">
            {MILESTONES.map(({ day, label }) => {
              const reached = completedCount >= day || (day === 1 && completedCount >= 0);
              const isFinal = day === 100;
              return (
                <div key={day} className="challenge-milestone-dot-wrap">
                  <div className={`challenge-milestone-dot ${reached ? "reached" : ""} ${isFinal ? "final" : ""}`} />
                  <span className={`challenge-milestone-dot-label ${reached ? "reached" : ""}`}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Journey */}
      {challengeData.length === 0 ? (
        <div className="challenge-empty">
          <div className="challenge-empty-icon"><Code2 size={28} /></div>
          <h3>Challenge content coming soon</h3>
          <p>Daily coding problems are being prepared. Check back shortly to begin your 100-day journey.</p>
        </div>
      ) : (
        <section className="challenge-journey" aria-label="Daily challenge journey">
          <div className="challenge-journey-top">
            <div className="challenge-journey-header">
              <h2><Trophy size={22} color="#f59e0b" /> The Journey</h2>
              <p>Complete each day sequentially to unlock the next challenge.</p>
            </div>
            <div className="challenge-journey-nav">
              <button type="button" className="challenge-nav-btn" onClick={() => scrollJourney(-1)} aria-label="Scroll left">
                <ChevronLeft size={18} />
              </button>
              <button type="button" className="challenge-nav-btn" onClick={() => scrollJourney(1)} aria-label="Scroll right">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="challenge-journey-scroll" ref={scrollRef}>
            <div className="challenge-journey-track">
              {/* Timeline nodes */}
              <div className="challenge-timeline">
                <div className="challenge-timeline-line" />
                {visibleDays.map((dayNum) => {
                  const isFinal = dayNum === 100;
                  const unlocked = isUnlocked(dayNum);
                  const completed = isCompleted(dayNum);
                  const inProgress = unlocked && !completed && dayNum === activeDay;
                  const allPrevDone = completedCount >= 99;

                  return (
                    <div key={`tl-${dayNum}`} className={`challenge-timeline-step ${isFinal ? "wide" : ""}`}>
                      <span className={`challenge-step-badge ${inProgress ? "in-progress" : completed ? "completed-tag" : "empty"
                        }`}>
                        {inProgress ? "IN PROGRESS" : completed ? "COMPLETED" : ""}
                      </span>

                      {isFinal ? (
                        <div className={`challenge-step-circle final ${allPrevDone ? "" : "locked-final"}`}>
                          <span>100</span>
                          <Trophy size={15} />
                        </div>
                      ) : (
                        <div className={`challenge-step-circle ${completed ? "completed" : unlocked ? "active" : "locked"
                          }`}>
                          {completed ? <CheckCircle2 size={22} /> : unlocked ? dayNum : <Lock size={16} />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Day cards */}
              <div className="challenge-cards-row">
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
                      <div key={`card-${dayNum}`} className="challenge-day-card wide final">
                        <div className="challenge-card-header">
                          <span className="challenge-card-day-label">Day 100</span>
                          <Flag size={14} color="#fbbf24" />
                        </div>
                        <div className="challenge-final-icon"><Gem size={24} /></div>
                        <h3 className="challenge-card-title">The Final Day</h3>
                        <p className="challenge-card-desc">
                          Complete all 99 days to unlock the grand finale.
                          Earn exclusive rewards and the 100 Days badge.
                        </p>
                        <div className="challenge-final-reward">
                          <Trophy size={14} />
                          {allDone ? "Ready to claim your reward" : "Grand Reward Locked"}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`card-${dayNum}`}
                      className={`challenge-day-card ${inProgress ? "active" : ""} ${completed ? "completed-card" : ""} ${!unlocked ? "locked" : ""}`}
                    >
                      <div className="challenge-card-header">
                        <span className="challenge-card-day-label">Day {dayNum}</span>
                        {problem?.difficulty && (
                          <span className={`challenge-difficulty ${diff}`}>{problem.difficulty}</span>
                        )}
                      </div>

                      {!unlocked ? (
                        <div className="challenge-card-lock-msg">
                          <div className="challenge-lock-icon-wrap"><Lock size={20} /></div>
                          <span>Complete Day {dayNum - 1} to unlock</span>
                        </div>
                      ) : (
                        <>
                          <h3 className="challenge-card-title">
                            {problem?.title || `Challenge Day ${dayNum}`}
                          </h3>

                          {problem?.topics?.length > 0 && (
                            <div className="challenge-card-tags">
                              {problem.topics.slice(0, 2).map((t) => (
                                <span key={t} className="challenge-card-tag">{t}</span>
                              ))}
                            </div>
                          )}

                          <p className="challenge-card-desc">{getShortDesc(problem)}</p>

                          <div className="challenge-card-meta">
                            <span><Zap size={12} /> +{xp} XP</span>
                            <span><Clock size={12} /> ~30 min</span>
                          </div>

                          <div className="challenge-card-progress-label">
                            <span>Progress</span>
                            <span>{completed ? "100%" : "0%"}</span>
                          </div>
                          <div className="challenge-card-progress-bar">
                            <div
                              className={`challenge-card-progress-fill ${completed ? "done" : ""}`}
                              style={{ width: completed ? "100%" : "0%" }}
                            />
                          </div>

                          <button
                            type="button"
                            className={`challenge-card-btn ${completed ? "completed" : "primary"}`}
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

      {/* Bottom bar */}
      <section className="challenge-bottom-bar">
        <div className="challenge-bottom-left">
          <h3>Stay consistent — small daily wins lead to big career outcomes.</h3>
          <div className="challenge-bottom-features">
            {BOTTOM_FEATURES.map(({ icon: Icon, label }) => (
              <span key={label} className="challenge-bottom-feature">
                <Icon size={14} color="#6366f1" />
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="challenge-streak-pill">
          <Flame size={17} color="#f97316" />
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
