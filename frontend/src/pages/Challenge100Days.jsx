import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame, Lock, Trophy, CheckCircle2, ChevronRight, ChevronLeft,
  Code2, TrendingUp, Zap, Target, Brain, Sparkles, Gem,
  Calendar, Clock, Star, Flag, Award, ArrowRight,
  Crown, Rocket, Shield, Swords, Compass, Layers, Check, BarChart3,
  Medal, Gift, Activity, LayoutList, Building2
} from "lucide-react";
import API from "@/utils/api";
import notify from "@/utils/notify";
import PreChallengeSetupModal from "@/components/PreChallengeSetupModal";
import TopCompaniesWidget from "@/components/TopCompaniesWidget";
import "@/styles/Challenge100Days.css";
import "@/styles/Challenge100DaysDash.css";

const TOTAL_DAYS = 100;

const BOTTOM_FEATURES = [
  { icon: Brain, label: "Build strong coding habits" },
  { icon: Code2, label: "Master DSA problem solving" },
  { icon: Target, label: "Crack top product companies" },
  { icon: Award, label: "Earn XP & exclusive rewards" },
];

const PHASES = [
  { id: 1, upTo: 25, start: 1, name: "Foundation", desc: "Day 1-25", icon: Shield, color: "#6366f1" },
  { id: 2, upTo: 50, start: 26, name: "Core DSA", desc: "Day 26-50", icon: Code2, color: "#0ea5e9" },
  { id: 3, upTo: 75, start: 51, name: "Advanced", desc: "Day 51-75", icon: Rocket, color: "#10b981" },
  { id: 4, upTo: 100, start: 76, name: "Mastery", desc: "Day 76-100", icon: Lock, color: "#f59e0b" },
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
        {[1, 2, 3, 4, 5].map((i) => (
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
  const [globalRank, setGlobalRank] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState("all");
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [pendingChallenge, setPendingChallenge] = useState(null);
  const scrollRef = useRef(null);
  const activeCardRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const streak = user.streak || 0;
  const xp = user.points || user.xp || 0;
  const displayRank = globalRank ? `#${globalRank}` : "New";

  useEffect(() => {
    API.get("/coding/challenge")
      .then((res) => {
        if (res.data?.success) {
          setChallengeData(res.data.data.challengeDays || []);
          setProgress(res.data.data.progress || { currentDay: 1, completedDays: [] });
          if (res.data.data.rank) {
            setGlobalRank(res.data.data.rank);
          }
        }
      })
      .catch((err) => console.error("Failed to fetch challenge data", err))
      .finally(() => setLoading(false));

    API.get("/users/leaderboard")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setLeaderboard(res.data.slice(0, 5));
        }
      })
      .catch((err) => console.error("Failed to fetch leaderboard", err));
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
      // Dummy visual data if API fails or empty
      allAvailableDays = [1, 2, 3, 4, 5, 6, 7, 100];
    }

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
    return "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.";
  };

  const handleStart = (problemId, dayNum) => {
    setPendingChallenge({ problemId, dayNum });
    setShowSetupModal(true);
  };

  const handleSetupProceed = async () => {
    if (!pendingChallenge) return;
    const { problemId, dayNum } = pendingChallenge;
    setShowSetupModal(false);
    try {
      const res = await API.post('/coding/start', { challengeDay: dayNum });
      if (res.data?.success) {
        window.dispatchEvent(new Event("walletUpdated"));
        navigate(`/coding-exam/${problemId}?source=challenge&day=${dayNum}`);
      } else {
        notify.error(res.data?.message || "Could not start challenge");
      }
    } catch (err) {
      notify.error(err.response?.data?.message || "Insufficient coins to start challenge");
    }
    setPendingChallenge(null);
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

  // Reset page scroll to top on mount — prevents auto-scroll to active card
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (!loading && challengeData.length > 0) {
      const timer = setTimeout(() => {
        // Scroll only the horizontal carousel — NOT the whole page
        if (activeCardRef.current && scrollRef.current) {
          const container = scrollRef.current;
          const card = activeCardRef.current;
          const cardLeft = card.offsetLeft;
          const cardWidth = card.offsetWidth;
          const containerWidth = container.offsetWidth;
          // Center the active card inside the scroll area
          container.scrollLeft = cardLeft - (containerWidth / 2) + (cardWidth / 2);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [loading, challengeData.length]);

  if (loading) return <SkeletonLoader />;

  // Calendar logic dummy
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const calendarDays = [];
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  // Get active problem from data or fallback
  const activeDayObj = getDayData(activeDay);
  const realActiveProblem = activeDayObj?.problems?.[0];
  const activeProblem = {
    title: realActiveProblem?.title || "Two Sum",
    difficulty: realActiveProblem?.difficulty || "Easy",
    _id: realActiveProblem?._id || "64a2f8b5f3a2a30012c4e567"
  };

  return (
    <div className="c100-page">
      {/* Background ambient glow */}
      <div className="c100-ambient" aria-hidden="true">
        <div className="c100-orb c100-orb-1" />
        <div className="c100-orb c100-orb-2" />
        <div className="c100-orb c100-orb-3" />
      </div>

      {/* ─── Responsive Adaptive Banner ─── */}
      <div className="c100-banner-wrap" draggable={false} onDragStart={(e) => e.preventDefault()}>
        <picture className="c100-banner-picture">
          <source media="(min-width: 1024px)" srcSet="https://ik.imagekit.io/cjnon47kr/banner1400*400.png" />
          <source media="(min-width: 600px)" srcSet="https://ik.imagekit.io/cjnon47kr/tablet.png?updatedAt=1787077267679" />
          <img src="https://ik.imagekit.io/cjnon47kr/preepx_100_days_mobile_EXACT_800x420.png" alt="100 Days Challenge Banner" className="c100-banner-img" draggable={false} onDragStart={(e) => e.preventDefault()} />
        </picture>
      </div>

      {/* ─── Stats Row ─── */}
      <section className="c100-stats-section" aria-label="Your Progress Stats">
        <div className="c100-stats-grid">
          <div className="c100-stat-card" style={{ "--accent": "#ef4444" }}>
            <div className="c100-stat-icon">
              <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Fire/3D/fire_3d.png" alt="Streak" style={{ width: 20, height: 20 }} />
            </div>
            <div className="c100-stat-text-block">
              <span className="c100-stat-val"><AnimatedNumber value={streak} /></span>
              <span className="c100-stat-lbl">Current Streak</span>
              <span className="c100-stat-sub">Keep it up!</span>
            </div>
          </div>
          <div className="c100-stat-card" style={{ "--accent": "#0ea5e9" }}>
            <div className="c100-stat-icon"><Target size={18} /></div>
            <div className="c100-stat-text-block">
              <span className="c100-stat-val"><AnimatedNumber value={daysRemaining} /></span>
              <span className="c100-stat-lbl">Days Remaining</span>
              <span className="c100-stat-sub">Finish strong</span>
            </div>
          </div>
          <div className="c100-stat-card" style={{ "--accent": "#8b5cf6" }}>
            <div className="c100-stat-icon"><Zap size={18} /></div>
            <div className="c100-stat-text-block">
              <span className="c100-stat-val"><AnimatedNumber value={xp} /> XP</span>
              <span className="c100-stat-lbl">Total Experience</span>
              <span className="c100-stat-sub">Next: 55 XP</span>
            </div>
          </div>
          <div className="c100-stat-card" style={{ "--accent": "#3b82f6" }}>
            <div className="c100-stat-icon"><BarChart3 size={18} /></div>
            <div className="c100-stat-text-block">
              <span className="c100-stat-val"><AnimatedNumber value={completedCount} /></span>
              <span className="c100-stat-lbl">Problems Solved</span>
              <span className="c100-stat-sub">This Journey</span>
            </div>
          </div>
          <div className="c100-stat-card" style={{ "--accent": "#f59e0b" }}>
            <div className="c100-stat-icon"><Crown size={18} /></div>
            <div className="c100-stat-text-block">
              <span className="c100-stat-val">{displayRank}</span>
              <span className="c100-stat-lbl">Global Rank</span>
              <span className="c100-stat-sub">Keep climbing</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Today's Challenge & Calendar ─── */}
      <section className="c100-today-calendar-section">
        <div className="c100-today-challenge">
          <div className="c100-today-header">
            <h3>Today's Challenge</h3>
            <span className="c100-day-badge">DAY {activeDay}</span>
          </div>

          <div className="c100-today-content">
            <div className="c100-today-info">
              <div className="c100-today-title-row">
                <h2>{activeProblem.title}</h2>
                <span className={`c100-difficulty-tag easy`}>{activeProblem.difficulty}</span>
              </div>
              <p className="c100-today-desc">{getShortDesc(null)}</p>

              <div className="c100-today-meta">
                <span className="meta-item"><Clock size={14} /> 20 min</span>
                <span className="meta-item"><Zap size={14} className="text-purple" /> +5 XP</span>
                <span className="meta-item"><TrendingUp size={14} className="text-blue" /> 90% Success Rate</span>
              </div>

              <button
                className="c100-primary-btn start-challenge-btn"
                onClick={() => handleStart(activeProblem._id, activeDay)}
              >
                Start Challenge <ChevronRight size={18} />
              </button>
            </div>

            <div className="c100-today-graphic" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Laptop.png"
                alt="Code Challenge"
                className="today-3d-graphic"
                style={{
                  width: '160px',
                  height: '160px',
                  objectFit: 'contain',
                  animation: 'floatImage 4s ease-in-out infinite',
                  filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.5))'
                }}
              />
              <style>{`
                @keyframes floatImage {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-10px); }
                  100% { transform: translateY(0px); }
                }
                @media (max-width: 768px) {
                  .c100-today-graphic {
                    display: none !important;
                  }
                }
              `}</style>
            </div>
          </div>

          <div className="c100-today-goal">
            <div className="goal-icon"><LayoutList size={16} /></div>
            <div className="goal-text">
              <strong>Today's Goal</strong>
              <span>Solve 1 problem</span>
            </div>
            <div className="goal-progress">0/1 <ChevronRight size={14} /></div>
          </div>
          <div className="goal-progress-bar"><div className="fill" style={{ width: '10%' }}></div></div>
        </div>

        {/* ─── Top Companies Widget ─── */}
        <TopCompaniesWidget />
      </section>

      {/* ─── Roadmap & Achievements ─── */}
      <section className="c100-roadmap-achievements">
        <div className="c100-roadmap-compact">
          <div className="compact-header">
            <h3>Curriculum Roadmap</h3>
            <span className="view-all">View Roadmap <ArrowRight size={14} /></span>
          </div>

          <div className="c100-phases-compact">
            {PHASES.map((phase, idx) => {
              const PhaseIcon = phase.icon;
              const isActive = idx === currentPhaseIdx;
              const isDone = currentPhaseIdx > idx;
              const isLocked = idx > currentPhaseIdx;

              return (
                <div key={phase.id} className={`phase-compact-box ${isActive ? 'active' : ''} ${isDone ? 'done' : ''} ${isLocked ? 'locked' : ''}`}>
                  <div className="phase-icon" style={{ background: isActive ? '#6366f1' : 'rgba(255,255,255,0.05)', color: isActive ? '#fff' : phase.color }}>
                    <PhaseIcon size={20} />
                  </div>
                  <div className="phase-info">
                    <strong>{phase.name}</strong>
                    <span>{phase.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="roadmap-progress-line">
            <div className="line-bg">
              <div className="line-fill" style={{ width: '25%' }}></div>
            </div>
            <div className="line-nodes">
              <div className="node active"><Check size={12} /></div>
              <div className="node"><Lock size={12} /></div>
              <div className="node"><Lock size={12} /></div>
              <div className="node"><Lock size={12} /></div>
            </div>
          </div>
        </div>

        <div className="c100-achievements-card">
          <div className="achievements-header">
            <div className="title"><Trophy size={16} /> Rewards</div>
            <span className="view-all">View All</span>
          </div>

          <div className="achievements-list">
            <div className="achievement-item">
              <div className="achiev-icon bg-gold"><Trophy size={16} /></div>
              <div className="achiev-text">
                <strong>Completion Certificate</strong>
                <span>Complete 100 days</span>
              </div>
              <div className="achiev-status"><Lock size={16} /></div>
            </div>
            <div className="achievement-item">
              <div className="achiev-icon bg-green"><Shield size={16} /></div>
              <div className="achiev-text">
                <strong>Interview Ready Badge</strong>
                <span>Solve 200 problems</span>
              </div>
              <div className="achiev-status"><Lock size={16} /></div>
            </div>
            <div className="achievement-item">
              <div className="achiev-icon bg-purple"><Gift size={16} /></div>
              <div className="achiev-text">
                <strong>Premium Access</strong>
                <span>Unlock premium content</span>
              </div>
              <div className="achiev-status"><Lock size={16} /></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 100-Day Journey (Carousel) ─── */}
      <section className="c100-journey-section" aria-label="Daily Coding Challenges">
        <div className="c100-journey-header-row">
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>100-Day Journey</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--c100-text-muted)' }}>Your daily progress</p>
          </div>
          <div className="c100-scroll-arrows">
            <button type="button" className="c100-scroll-arrow-btn" onClick={() => scrollJourney(-1)}>
              <ChevronLeft size={16} />
            </button>
            <button type="button" className="c100-scroll-arrow-btn" onClick={() => scrollJourney(1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="c100-journey-scroll-area" ref={scrollRef}>
          <div className="c100-journey-inner-track" style={{ flexDirection: 'row' }}>
            {visibleDays.slice(0, 7).map((dayNum) => {
              // ✅ Real user progress – no hardcoded fakeData
              const unlocked = isUnlocked(dayNum);
              const completed = isCompleted(dayNum);
              const isActiveCard = unlocked && !completed && dayNum === activeDay;
              const isLocked = !unlocked;
              const isDone = completed;

              // Get real problem data from API
              const dayObj = getDayData(dayNum);
              const problem = dayObj?.problems?.[0];
              const title = problem?.title || `Day ${dayNum}`;
              const diff = problem?.difficulty || 'Easy';
              const xpVal = DIFFICULTY_XP[diff?.toLowerCase()] || 5;

              return (
                <div
                  key={dayNum}
                  ref={isActiveCard ? activeCardRef : null}
                  className={`c100-compact-day-card ${isActiveCard ? 'active' : ''}`}
                  onClick={() => !isLocked && problem?._id && handleStart(problem._id, dayNum)}
                  style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
                >
                  <div className="day-header">DAY {dayNum}</div>
                  <h4 className="day-title">{title}</h4>
                  <span className={`day-diff ${diff.toLowerCase()}`}>{diff}</span>

                  <div className="day-footer">
                    {isDone && <span className="status done"><CheckCircle2 size={12} /> Completed</span>}
                    {isActiveCard && <span className="status active"><Activity size={12} /> In Progress</span>}
                    {isLocked && <span className="status locked"><Lock size={12} /> Locked</span>}
                    <span className="xp-val"><Zap size={10} /> +{xpVal} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Bottom Dash (XP, Heatmap, Leaderboard, Rewards) ─── */}
      <section className="c100-bottom-dash-grid">
        <div className="c100-dash-card xp-card">
          <h4 className="dash-card-title">XP Progress</h4>
          <div className="xp-center">
            <div className="level-info">Level 1</div>
            <div className="hex-badge"><span>1</span></div>
          </div>
          <div className="xp-bar-container">
            <span className="xp-text">45 / 100 XP</span>
            <div className="xp-bar-bg"><div className="xp-bar-fill" style={{ width: '45%' }}></div></div>
          </div>
          <p className="keep-solving-text">Keep solving to level up!</p>
        </div>

        <div className="c100-dash-card heatmap-card">
          <h4 className="dash-card-title">Activity Heatmap</h4>
          <div className="heatmap-days-labels">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
          <div className="heatmap-grid">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className={`heatmap-cell ${i === 0 || i === 1 ? 'lvl-3' : i === 4 ? 'lvl-1' : i === 8 ? 'lvl-2' : ''}`}></div>
            ))}
          </div>
          <div className="heatmap-legend">
            <span>Less</span>
            <div className="legend-colors">
              <span className="lvl-0"></span><span className="lvl-1"></span><span className="lvl-2"></span><span className="lvl-3"></span>
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="c100-dash-card leaderboard-card">
          <div className="dash-header-row">
            <h4 className="dash-card-title">Leaderboard</h4>
            <span className="view-all">View All</span>
          </div>
          <div className="leaderboard-list">
            {leaderboard.map((u, idx) => {
              const isCurrentUser = u._id === user._id;
              const rank = idx + 1;
              let rankElem = <span className="lb-rank">{rank}</span>;
              if (rank === 1) rankElem = <span className="lb-rank gold"><Trophy size={12} /></span>;
              else if (rank === 2) rankElem = <span className="lb-rank silver"><Medal size={12} /></span>;

              const initials = u.fullName ? u.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

              return (
                <div key={u._id} className={`lb-item ${isCurrentUser ? 'current-user' : ''}`}>
                  {rankElem}
                  <div className="lb-user">
                    <div className="avatar">
                      {u.profilePic ? (
                        <img src={u.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        initials
                      )}
                    </div>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                      {isCurrentUser ? `You (${u.fullName})` : u.fullName}
                    </span>
                  </div>
                  <span className="lb-score">{u.points || 0} XP</span>
                </div>
              );
            })}

            {user && user._id && !leaderboard.some(u => u._id === user._id) && (
              <div className="lb-item current-user">
                <span className="lb-rank">#{globalRank || "?"}</span>
                <div className="lb-user">
                  <div className="avatar">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'
                    )}
                  </div>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                    You ({user.fullName || 'User'})
                  </span>
                </div>
                <span className="lb-score">{user.points || user.xp || 0} XP</span>
              </div>
            )}
          </div>
        </div>

        <div className="c100-dash-card achievements-card">
          <div className="dash-header-row">
            <h4 className="dash-card-title">Achievements</h4>
            <span className="view-all">View All</span>
          </div>
          <div className="rewards-list">
            <div className="reward-item">
              <div className="reward-icon bg-green"><Flag size={14} /></div>
              <div className="reward-info">
                <strong>First Steps</strong>
                <span>Complete Day 1</span>
              </div>
              <CheckCircle2 size={14} className="text-muted" />
            </div>
            <div className="reward-item">
              <div className="reward-icon bg-orange"><Flame size={14} /></div>
              <div className="reward-info">
                <strong>2 Day Streak</strong>
                <span>Maintain streak for 2 days</span>
              </div>
              <Lock size={14} className="text-muted" />
            </div>
            <div className="reward-item">
              <div className="reward-icon bg-purple"><Code2 size={14} /></div>
              <div className="reward-info">
                <strong>Problem Solver</strong>
                <span>Solve 10 problems</span>
              </div>
              <Lock size={14} className="text-muted" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bottom Motivation Bar ─── */}
      <section className="c100-motivation-bottom">
        <div className="mot-icon-wrap"><Trophy size={24} className="text-orange" /></div>
        <div className="mot-text">
          <h3>Consistency today builds your success tomorrow!</h3>
          <p>You're just 1% away from becoming unstoppable.</p>
        </div>
        <button className="c100-primary-btn">Continue Day 1 Challenge <ArrowRight size={16} /></button>
      </section>

      {showSetupModal && (
        <PreChallengeSetupModal
          onProceed={handleSetupProceed}
          onCancel={() => { setShowSetupModal(false); setPendingChallenge(null); }}
        />
      )}
    </div>
  );
};

export default Challenge100Days;
