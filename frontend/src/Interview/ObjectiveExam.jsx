import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import API from '../utils/api';
import {
  ArrowRight, CheckCircle, XCircle, AlertTriangle,
  Clock, Target, Zap, Eye, ShieldCheck, BookOpen, Trophy,
} from 'lucide-react';
import { toast } from 'react-toastify';

const SOCKET_URL = API.defaults.baseURL
  ? API.defaults.baseURL.replace('/api', '')
  : 'http://localhost:4000';

const TIMER_SECONDS = 30;
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function useAntiCheat(active, onViolation) {
  const countRef = useRef(0);
  useEffect(() => {
    if (!active) return;
    const onBlur = () => { countRef.current += 1; onViolation(countRef.current); };
    const onVis  = () => { if (document.hidden) { countRef.current += 1; onViolation(countRef.current); } };
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVis);
    return () => { window.removeEventListener('blur', onBlur); document.removeEventListener('visibilitychange', onVis); };
  }, [active, onViolation]);
  return countRef;
}

export default function ObjectiveExam() {
  const navigate  = useNavigate();
  const socketRef = useRef(null);
  const webcamRef = useRef(null);

  const [topic,      setTopic]      = useState('');
  const [numQ,       setNumQ]       = useState(20);
  const [screen,     setScreen]     = useState('SETUP');
  const [question,   setQuestion]   = useState(null);
  const [selected,   setSelected]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [results,    setResults]    = useState(null);
  const [timeLeft,   setTimeLeft]   = useState(TIMER_SECONDS);
  const [warnings,   setWarnings]   = useState(0);
  const [showWarn,   setShowWarn]   = useState(false);
  const [correct,    setCorrect]    = useState(0);
  const [wrong,      setWrong]      = useState(0);
  const timerRef = useRef(null);

  useAntiCheat(screen === 'EXAM', (n) => {
    setWarnings(n); setShowWarn(true);
    setTimeout(() => setShowWarn(false), 4000);
    toast.warning(`⚠️ Tab switch! Warning ${n}/3`);
    if (n >= 3) { toast.error('Exam terminated.'); handleForceEnd(); }
  });

  useEffect(() => {
    if (screen !== 'EXAM' || !question) return;
    setTimeLeft(TIMER_SECONDS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(p => { if (p <= 1) { clearInterval(timerRef.current); handleAutoSubmit(); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [question?.questionIndex]);

  useEffect(() => () => { clearInterval(timerRef.current); socketRef.current?.disconnect(); }, []);

  const startExam = () => {
    if (!topic.trim()) return toast.error('Please enter a topic.');
    setScreen('EXAM'); setCorrect(0); setWrong(0); setWarnings(0);
    const user = JSON.parse(localStorage.getItem('user') || '{"_id":"guest"}');
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('connect', () =>
      socketRef.current.emit('start_mcq', { topic, userId: user._id, numQuestions: parseInt(numQ) }));
    socketRef.current.on('receive_question', d => { setQuestion(d); setSelected(''); setSubmitting(false); });
    socketRef.current.on('mcq_finished',     d => { setResults(d); setScreen('RESULTS'); socketRef.current?.disconnect(); });
    socketRef.current.on('mcq_error',        e => { toast.error(e.message || 'Error'); setScreen('SETUP'); });
  };

  const submitAnswer = () => {
    if (!selected) return;
    clearInterval(timerRef.current);
    setSubmitting(true);
    socketRef.current.emit('submit_answer', { answer: selected });
  };

  const handleAutoSubmit = () => {
    if (submitting || !question) return;
    toast.info('⏱ Time up!');
    setSubmitting(true);
    socketRef.current?.emit('submit_answer', { answer: selected || '' });
  };

  const handleForceEnd = () => { clearInterval(timerRef.current); socketRef.current?.disconnect(); navigate('/interview'); };

  const radius  = 20;
  const circ    = 2 * Math.PI * radius;
  const dashoff = circ - (timeLeft / TIMER_SECONDS) * circ;
  const progress = question ? Math.round((question.questionIndex / question.totalQuestions) * 100) : 0;

  /* ─────────────────────── SETUP ─────────────────────── */
  if (screen === 'SETUP') return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 font-sans overflow-auto">
      {/* grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)',
        backgroundSize: '48px 48px'
      }} />
      {/* glow blobs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-violet-700/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[480px] my-8">
        {/* top badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-bold text-indigo-400 uppercase tracking-[2px]">
            <Zap size={11} /> AI-Powered Exam Platform
          </span>
        </div>

        {/* main card */}
        <div className="bg-[#0d1117] border border-[#1e2433] rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_32px_80px_rgba(0,0,0,0.8)]">
          {/* card top accent */}
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          <div className="p-8">
            {/* logo */}
            <div className="flex flex-col items-center gap-2 mb-8">
              <img src="/logo.png" alt="PrepX" className="h-11 w-auto object-contain" />
              <div className="text-center">
                <h1 className="text-[28px] font-black tracking-tight text-white leading-tight">
                  Objective Exam
                </h1>
                <p className="text-[13px] text-slate-500 mt-1">AI-generated MCQs · Live proctored · Instant results</p>
              </div>
            </div>

            {/* stats row */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: <Clock size={14} className="text-indigo-400" />,     label: '30s / Q',         sub: 'Per question' },
                { icon: <Eye size={14} className="text-violet-400" />,       label: 'Webcam',          sub: 'Monitored' },
                { icon: <ShieldCheck size={14} className="text-emerald-400" />, label: 'Anti-Cheat',   sub: '3-strike rule' },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="bg-[#161b27] border border-[#1e2d3d] rounded-xl p-3 text-center">
                  <div className="flex justify-center mb-1.5">{icon}</div>
                  <div className="text-[13px] font-bold text-white">{label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>

            {/* divider */}
            <div className="h-px bg-[#1e2433] mb-6" />

            {/* topic input */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[1.5px] mb-2">
                Topic / Subject
              </label>
              <div className="relative">
                <BookOpen size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  className="w-full pl-10 pr-4 py-3.5 bg-[#161b27] border border-[#1e2d3d] rounded-xl text-[14px] text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15 focus:bg-[#1a2035]"
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && startExam()}
                  placeholder="e.g. React Hooks, System Design, OS..."
                />
              </div>
            </div>

            {/* question count */}
            <div className="mb-7">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[1.5px] mb-2.5">
                Number of Questions
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { val: 20, label: '20', tag: 'Quick',     time: '~10 min' },
                  { val: 40, label: '40', tag: 'Standard',  time: '~20 min' },
                  { val: 60, label: '60', tag: 'Deep Dive', time: '~30 min' },
                ].map(({ val, label, tag, time }) => {
                  const active = numQ === val;
                  return (
                    <button key={val} onClick={() => setNumQ(val)}
                      className={`relative py-4 rounded-xl border transition-all duration-150 text-center overflow-hidden ${
                        active
                          ? 'bg-indigo-600/15 border-indigo-500/50 ring-2 ring-indigo-500/20'
                          : 'bg-[#161b27] border-[#1e2d3d] hover:border-[#2e3d55] hover:bg-[#1a2035]'
                      }`}>
                      {active && <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />}
                      <div className={`text-[28px] font-black leading-none ${active ? 'text-indigo-300' : 'text-white'}`}>{label}</div>
                      <div className={`text-[11px] font-bold mt-1 ${active ? 'text-indigo-400' : 'text-slate-400'}`}>{tag}</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">{time}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <button onClick={startExam}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all duration-200 hover:-translate-y-px">
              Start Exam <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate(-1)}
              className="w-full mt-3 py-3.5 rounded-xl text-slate-500 text-[13px] font-semibold hover:text-slate-300 hover:bg-white/[0.03] transition-all duration-200">
              Go back
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-700 mt-6">PrepX · AI-Powered Interview Preparation</p>
      </div>
    </div>
  );

  /* ─────────────────────── EXAM ─────────────────────── */
  if (screen === 'EXAM') return (
    <div className="h-screen bg-[#030712] flex flex-col overflow-hidden text-white font-sans">

      {/* ── Topbar ── */}
      <header className="shrink-0 h-14 px-5 md:px-8 flex items-center gap-4 border-b border-[#1e2433] bg-[#030712]/95 backdrop-blur-xl z-50">
        {/* logo */}
        <div className="flex items-center gap-2 mr-2">
          <img src="/logo.png" alt="PrepX" className="h-6 w-auto" />
          <span className="text-[14px] font-extrabold tracking-tight text-white">PrepX</span>
          <span className="flex items-center gap-1 ml-1 text-[10px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />LIVE
          </span>
        </div>

        {/* progress */}
        <div className="hidden md:flex flex-1 items-center gap-3">
          <div className="flex-1 h-1 bg-[#1e2433] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out rounded-full"
              style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap tabular-nums">
            {question ? `${question.questionIndex + 1} / ${question.totalQuestions}` : '— / —'}
          </span>
        </div>

        {/* topic pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-[#161b27] border border-[#1e2d3d] rounded-full">
          <BookOpen size={11} className="text-slate-500" />
          <span className="text-[11px] font-semibold text-slate-400 max-w-[160px] truncate">{topic}</span>
        </div>

        {/* timer */}
        <div className="relative w-11 h-11 ml-auto md:ml-0">
          <svg viewBox="0 0 48 48" className="w-11 h-11 -rotate-90">
            <circle cx="24" cy="24" r={radius} className="fill-none stroke-[#1e2433]" strokeWidth="3" />
            <circle cx="24" cy="24" r={radius}
              className={`fill-none stroke-[3] stroke-linecap-round transition-all duration-1000 ease-linear ${
                timeLeft <= 10 ? 'stroke-red-500' : timeLeft <= 20 ? 'stroke-amber-400' : 'stroke-indigo-500'
              }`}
              strokeDasharray={circ} strokeDashoffset={dashoff} />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-[13px] font-black tabular-nums ${
            timeLeft <= 10 ? 'text-red-400' : timeLeft <= 20 ? 'text-amber-400' : 'text-white'
          }`}>{timeLeft}</span>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── Question panel ── */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-[#1e2433]">

          {!question ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-5">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping" />
                <div className="relative w-16 h-16 rounded-full border-2 border-[#1e2433] border-t-indigo-500 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-[15px] font-semibold text-white">Generating question…</p>
                <p className="text-[12px] text-slate-600 mt-1">AI is crafting your next challenge</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto px-6 md:px-10 py-8 flex flex-col gap-6">

                {/* warning */}
                {showWarn && (
                  <div className="bg-red-950/60 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
                    <AlertTriangle size={16} className="text-red-400 shrink-0" />
                    <p className="text-[13px] font-semibold text-red-300">
                      Tab switch detected! Warning <span className="font-black">{warnings}/3</span> — 3 warnings ends the exam.
                    </p>
                  </div>
                )}

                {/* question header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-[11px] font-black text-indigo-400">
                      {question.questionIndex + 1}
                    </span>
                    <span className="text-[12px] font-semibold text-slate-500">of {question.totalQuestions} questions</span>
                  </div>
                  {/* mobile progress */}
                  <div className="flex items-center gap-2 md:hidden">
                    <div className="w-20 h-1 bg-[#1e2433] rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-600">{progress}%</span>
                  </div>
                </div>

                {/* question text */}
                <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-6">
                  <p className="text-[17px] md:text-[19px] font-bold text-white leading-[1.6] tracking-tight">
                    {question.question}
                  </p>
                </div>

                {/* options */}
                <div className="flex flex-col gap-2.5">
                  {question.options.map((opt, idx) => {
                    const sel = selected === opt;
                    return (
                      <button key={idx} disabled={submitting} onClick={() => setSelected(opt)}
                        className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-xl border text-left transition-all duration-150 group ${
                          sel
                            ? 'bg-indigo-600/15 border-indigo-500/50 ring-2 ring-indigo-500/15'
                            : 'bg-[#0d1117] border-[#1e2433] hover:border-[#2e3d55] hover:bg-[#10151e]'
                        }`}>
                        <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-black border transition-all ${
                          sel
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_2px_12px_rgba(99,102,241,0.4)]'
                            : 'bg-[#161b27] border-[#2e3a4a] text-slate-500 group-hover:border-slate-600 group-hover:text-slate-400'
                        }`}>
                          {OPTION_LETTERS[idx]}
                        </span>
                        <span className={`text-[14px] md:text-[15px] font-medium flex-1 ${sel ? 'text-white' : 'text-slate-300'}`}>
                          {opt}
                        </span>
                        {sel && <CheckCircle size={16} className="text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* submit button */}
                <button onClick={submitAnswer} disabled={!selected || submitting}
                  className={`w-full py-4 rounded-xl text-[15px] font-bold flex items-center justify-center gap-2.5 transition-all duration-200 ${
                    !selected || submitting
                      ? 'bg-[#161b27] border border-[#1e2d3d] text-slate-600 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_30px_rgba(99,102,241,0.35)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] hover:-translate-y-px'
                  }`}>
                  {submitting
                    ? <><div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> Evaluating…</>
                    : <><CheckCircle size={17} /> Confirm Answer</>
                  }
                </button>

              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="hidden md:flex w-64 lg:w-72 shrink-0 flex-col border-l border-[#1e2433] overflow-y-auto bg-[#030712]">

          {/* webcam */}
          <div className="border-b border-[#1e2433]">
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[1.5px]">Proctor Camera</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
              </span>
            </div>
            <Webcam ref={webcamRef} audio={false} mirrored
              className="w-full aspect-video object-cover bg-[#0a0d14] block"
              screenshotFormat="image/jpeg" />
            <div className="px-4 py-2.5 flex items-center gap-1.5">
              <ShieldCheck size={11} className="text-slate-700" />
              <span className="text-[10px] text-slate-700">Anti-cheat monitoring active</span>
            </div>
          </div>

          {/* score */}
          <div className="p-4 border-b border-[#1e2433]">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[1.5px] mb-3">Live Score</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: correct,  label: 'Correct', color: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-900' },
                { val: wrong,    label: 'Wrong',   color: 'text-red-400',     bg: 'bg-red-500/8 border-red-900' },
                { val: warnings, label: 'Warns',   color: 'text-amber-400',   bg: 'bg-amber-500/8 border-amber-900' },
              ].map(({ val, label, color, bg }) => (
                <div key={label} className={`${bg} border rounded-xl py-3 text-center`}>
                  <div className={`text-[22px] font-black leading-none ${color}`}>{val}</div>
                  <div className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.8px] mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* exam info */}
          <div className="p-4 flex flex-col gap-3">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[1.5px]">Exam Info</p>
            <div className="flex items-center gap-2.5 text-[12px]">
              <BookOpen size={13} className="text-slate-600 shrink-0" />
              <span className="text-slate-400 truncate">{topic}</span>
            </div>
            <div className="flex items-center gap-2.5 text-[12px]">
              <Target size={13} className="text-slate-600 shrink-0" />
              <span className="text-slate-400">{numQ} total questions</span>
            </div>
            <div className="flex items-center gap-2.5 text-[12px]">
              <Clock size={13} className="text-slate-600 shrink-0" />
              <span className="text-slate-400">30 seconds per question</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ─────────────────────── RESULTS ─────────────────────── */
  if (screen === 'RESULTS' && results) {
    const pct = Math.round((results.score / results.totalQuestions) * 100);
    const grade =
      pct >= 90 ? { label: 'Excellent',  color: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'shadow-[0_0_80px_rgba(52,211,153,0.08)]' } :
      pct >= 70 ? { label: 'Good',        color: 'text-indigo-400',  border: 'border-indigo-500/20',  glow: 'shadow-[0_0_80px_rgba(99,102,241,0.08)]' } :
      pct >= 50 ? { label: 'Average',     color: 'text-amber-400',   border: 'border-amber-500/20',   glow: 'shadow-[0_0_80px_rgba(251,191,36,0.08)]' } :
                  { label: 'Needs Work',  color: 'text-red-400',     border: 'border-red-500/20',     glow: 'shadow-[0_0_80px_rgba(248,113,113,0.08)]' };
    return (
      <div className="min-h-screen bg-[#030712] text-white font-sans">
        {/* fixed grid bg */}
        <div className="fixed inset-0 pointer-events-none" style={{
          backgroundImage:'linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)',
          backgroundSize:'48px 48px'
        }} />

        <div className="relative z-10 max-w-3xl mx-auto px-4 py-12 pb-24">

          {/* ── Hero card ── */}
          <div className={`relative bg-[#0d1117] border ${grade.border} rounded-2xl overflow-hidden mb-8 ${grade.glow}`}>
            <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-48 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10 px-8 py-12 text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <img src="/logo.png" alt="PrepX" className="h-6 w-auto" />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-[2.5px]">Exam Complete</span>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-current/10 border border-current/20 mb-6 ${grade.color}`}
                style={{ backgroundColor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)' }}>
                <Trophy size={13} />
                <span className="text-[12px] font-bold uppercase tracking-[1.5px]">{topic}</span>
              </div>
              <div className="text-[88px] md:text-[108px] font-black tracking-tighter leading-none mb-1">
                <span className={grade.color}>{results.score}</span>
                <span className="text-[40px] text-slate-700 font-bold">/{results.totalQuestions}</span>
              </div>
              <p className={`text-[16px] font-bold mb-8 ${grade.color}`}>{grade.label} &nbsp;·&nbsp; {pct}% accuracy</p>

              <div className="grid grid-cols-4 divide-x divide-[#1e2433] border-t border-[#1e2433] pt-6">
                {[
                  { val: results.score,                          label: 'Correct',  cls: 'text-emerald-400' },
                  { val: results.totalQuestions - results.score, label: 'Wrong',    cls: 'text-red-400' },
                  { val: pct + '%',                              label: 'Accuracy', cls: 'text-indigo-400' },
                  { val: warnings,                               label: 'Warnings', cls: 'text-amber-400' },
                ].map(({ val, label, cls }) => (
                  <div key={label} className="py-2 text-center">
                    <div className={`text-[24px] font-black tracking-tight ${cls}`}>{val}</div>
                    <div className="text-[10px] text-slate-600 uppercase tracking-[1px] mt-1 font-bold">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Section header ── */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center">
              <CheckCircle size={15} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-[16px] font-extrabold text-white">Answer Review</h2>
              <p className="text-[11px] text-slate-600">{results.questionsAndAnswers.length} questions with AI explanations</p>
            </div>
          </div>

          {/* ── Question cards ── */}
          <div className="flex flex-col gap-4">
            {results.questionsAndAnswers.map((qa, i) => {
              const ok = qa.userAnswer === qa.correctAnswer;
              return (
                <div key={i} className={`bg-[#0d1117] border rounded-xl overflow-hidden ${ok ? 'border-[#1e3a2a]' : 'border-[#3a1e1e]'}`}>
                  {/* question row */}
                  <div className="flex items-start gap-3.5 px-6 py-5 border-b border-[#161b27]">
                    <div className={`shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center ${ok ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
                      {ok
                        ? <CheckCircle size={14} className="text-emerald-400" />
                        : <XCircle    size={14} className="text-red-400" />}
                    </div>
                    <p className="text-[14px] md:text-[15px] font-semibold text-white leading-relaxed flex-1">
                      <span className="text-slate-600 font-bold mr-2">{i + 1}.</span>{qa.question}
                    </p>
                  </div>

                  {/* options */}
                  <div className="px-6 py-4 flex flex-col gap-2">
                    {qa.options.map((opt, idx) => {
                      const isRight  = opt === qa.correctAnswer;
                      const isMissed = opt === qa.userAnswer && !ok;
                      return (
                        <div key={idx} className={`flex items-center justify-between px-4 py-3 rounded-lg text-[13px] font-medium border ${
                          isRight  ? 'bg-emerald-950/50 border-emerald-700/30 text-emerald-300' :
                          isMissed ? 'bg-red-950/50 border-red-700/30 text-red-300' :
                                     'bg-[#0a0d14] border-[#161b27] text-slate-600'
                        }`}>
                          <div className="flex items-center gap-2.5">
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black border ${
                              isRight  ? 'bg-emerald-600 border-emerald-600 text-white' :
                              isMissed ? 'bg-red-600 border-red-600 text-white' :
                                         'bg-[#161b27] border-[#2e3a4a] text-slate-700'
                            }`}>{OPTION_LETTERS[idx]}</span>
                            <span>{opt}</span>
                          </div>
                          {isRight  && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">✓ Correct</span>}
                          {isMissed && <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">✗ Your answer</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* explanation */}
                  <div className="mx-6 mb-5 bg-[#0f1420] border border-indigo-500/15 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={11} className="text-indigo-400" />
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[1.5px]">AI Explanation</span>
                    </div>
                    <p className="text-[13px] text-slate-400 leading-[1.8]">{qa.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="flex justify-center mt-12">
            <button onClick={() => navigate('/interview')}
              className="flex items-center gap-2.5 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-[15px] font-bold shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] hover:-translate-y-px transition-all duration-200">
              <Target size={17} /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
