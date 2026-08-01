import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2, Plus, Clock, Trophy, Target, Search,
  ChevronRight, BrainCircuit, Rocket, Flame, Code, Terminal, Trash2
} from "lucide-react";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import "../Interview/InterviewPage.css"; 

const CodingPractice = () => {
  const navigate = useNavigate();
  const [showConfig, setShowConfig] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('codingPracticeHistory') || '[]'));
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Calculate Stats
  const problemsSolved = history.filter(h => h.status === 'pass').length;
  const acceptanceRate = history.length > 0 ? Math.round((problemsSolved / history.length) * 100) : 0;
  const totalTimeSecs = history.reduce((acc, h) => acc + (h.timeSpentSecs || 0), 0);
  const timeSpentFormatted = totalTimeSecs > 3600 
    ? `${(totalTimeSecs / 3600).toFixed(1)}h` 
    : `${Math.ceil(totalTimeSecs / 60)}m`;
  
  const diffWeights = { easy: 1, medium: 2, hard: 3 };
  const avgDiffScore = history.length > 0 
    ? history.reduce((acc, h) => acc + (diffWeights[h.difficulty] || 1), 0) / history.length 
    : 1;
  const avgDifficulty = avgDiffScore > 2.5 ? 'Hard' : avgDiffScore > 1.5 ? 'Medium' : 'Easy';

  const clearHistory = () => {
    if (window.confirm('Clear all practice history?')) {
      localStorage.removeItem('codingPracticeHistory');
      setHistory([]);
    }
  };

  const handleStart = () => {
    navigate(`/coding-exam?difficulty=${difficulty}`);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Coding Practice Dashboard</h1>
          <p>Sharpen your problem-solving skills with algorithms and data structures.</p>
        </div>
        <div className="header-actions">
          <button className="action-btn primary" onClick={() => setShowConfig(true)}>
            <Plus size={18} /> New Practice
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon blue"><Code2 size={20} /></div>
          <div><span className="stat-num">{problemsSolved}</span><span className="stat-lbl">Problems Solved</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Target size={20} /></div>
          <div><span className="stat-num">{acceptanceRate}%</span><span className="stat-lbl">Acceptance Rate</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Terminal size={20} /></div>
          <div><span className="stat-num">{avgDifficulty}</span><span className="stat-lbl">Avg Difficulty</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Clock size={20} /></div>
          <div><span className="stat-num">{timeSpentFormatted}</span><span className="stat-lbl">Time Spent</span></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel interviews-panel">
          <div className="panel-header">
            <h2>Practice History</h2>
            <div className="panel-tools">
              <div className="search-box">
                <Search size={16} />
                <input placeholder="Search..." />
              </div>
              {history.length > 0 && (
                <button onClick={clearHistory} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {history.length > 0 ? (
            <div className="interview-list">
              {history.slice().reverse()
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((session, i) => (
                <div key={i} className="interview-item">
                  <div className="interview-info">
                    <h3>{session.title}</h3>
                    <p>
                      Language: {session.language} · Difficulty: <span style={{ textTransform: 'capitalize'}}>{session.difficulty}</span>
                    </p>
                    <span className="interview-date">
                      {new Date(session.date).toLocaleDateString()} · {Math.ceil(session.timeSpentSecs / 60)}m spent
                    </span>
                  </div>
                  <div className="interview-meta">
                    <span className={`status-badge ${session.status === 'pass' ? 'completed' : 'pending'}`}>
                      {session.status === 'pass' ? 'Passed' : session.status === 'fail' ? 'Failed' : 'Untested'}
                    </span>
                  </div>
                </div>
              ))}
              <Pagination
                currentPage={currentPage}
                totalItems={history.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          ) : (
            <EmptyState
              icon={Code2}
              title="No practice sessions yet"
              desc="Start a new coding practice session to improve your logic building skills. No XP is awarded here, it's just for your improvement."
              actionLabel="Start Coding"
              onAction={() => setShowConfig(true)}
            />
          )}
        </div>

        <div className="side-panels">
          <div className="panel quick-start-panel">
            <h2>Quick Actions</h2>
            <button className="action-btn primary full" onClick={() => setShowConfig(true)}>
              <Plus size={18} /> New Coding Session
            </button>
          </div>
          <div className="panel tips-panel">
            <div className="panel-header"><Code size={18} /><h2>Practice Tips</h2></div>
            <ul className="tips-list">
              <li>Read the problem statement carefully</li>
              <li>Consider edge cases before writing code</li>
              <li>Optimize for time and space complexity</li>
              <li>Run sample test cases often</li>
            </ul>
          </div>
        </div>
      </div>

      {showConfig && (
        <div className="modal-overlay" onClick={() => setShowConfig(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Setup Practice</h2>
              <button className="close-btn" onClick={() => setShowConfig(false)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
              
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Select Difficulty</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['easy', 'medium', 'hard'].map(level => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: `1px solid ${difficulty === level ? '#4f46e5' : 'rgba(255,255,255,0.1)'}`,
                        background: difficulty === level ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                        color: difficulty === level ? '#818cf8' : '#cbd5e1',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

            </div>
            <div className="modal-footer" style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="action-btn primary" onClick={handleStart} style={{ width: '100%' }}>
                Start Practice <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodingPractice;
