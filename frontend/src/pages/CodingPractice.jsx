import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import notify from "@/utils/notify";
import API from "@/utils/api";
import {
  Code2, Plus, Clock, Trophy, Target, Search,
  ChevronRight, BrainCircuit, Rocket, Flame, Code, Terminal, Bookmark,
  CheckCircle2
} from "lucide-react";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";
import '@/styles/InterviewPage.css';

const ALL_TOPICS = [
  { name: 'Array', count: 230 },
  { name: 'Binary Search', count: 11 },
  { name: 'Hash Table', count: 45 },
  { name: 'Linked List', count: 20 },
  { name: 'Math', count: 30 },
  { name: 'Dynamic Programming', count: 90 },
  { name: 'String', count: 65 },
  { name: 'Sliding Window', count: 15 }
];

const CodingPractice = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const topicQuery = selectedTopics.length > 0 ? `&topics=${selectedTopics.join(',')}` : '';
      const res = await API.get(`/coding/problems?page=${currentPage}&limit=${itemsPerPage}${topicQuery}`);
      if (res.data.success) {
        setProblems(res.data.problems);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch problems", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [currentPage, selectedTopics]);

  const handleTopicToggle = (topicName) => {
    setSelectedTopics(prev => 
      prev.includes(topicName) 
        ? prev.filter(t => t !== topicName)
        : [...prev, topicName]
    );
    setCurrentPage(1); // reset to page 1 on filter
  };

  const handleSolve = async (problem) => {
    try {
      // Deduct balance if required, here we just do a start check
      await API.post('/coding/start', { difficulty: problem.difficulty });
      window.dispatchEvent(new Event("walletUpdated"));
      navigate(`/coding-exam?problemId=${problem._id}`);
    } catch (err) {
      notify.error(err.response?.data?.message || err.response?.data?.error || err.message || 'Error starting session');
    }
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'easy') return '#10b981'; // Green
    if (diff === 'medium') return '#f59e0b'; // Orange
    if (diff === 'hard') return '#ef4444'; // Red
    return '#8b5cf6';
  };

  return (
    <div className="dashboard-page" style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="dashboard-header" style={{ marginBottom: '30px' }}>
        <div>
          <h1>Coding Practice</h1>
          <p>Sharpen your problem-solving skills with algorithms and data structures.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* LEFT SIDEBAR: TOPIC FILTERS */}
        <div className="panel" style={{ width: '280px', flexShrink: 0, padding: '20px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            Topics
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto' }}>
            {ALL_TOPICS.map(topic => (
              <label key={topic.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#cbd5e1' }}>
                <input 
                  type="checkbox" 
                  checked={selectedTopics.includes(topic.name)}
                  onChange={() => handleTopicToggle(topic.name)}
                  style={{ width: '16px', height: '16px', accentColor: '#4f46e5' }}
                />
                <span style={{ flex: 1 }}>{topic.name}</span>
                {/* Optional: <span style={{ color: '#64748b', fontSize: '0.85rem' }}>({topic.count})</span> */}
              </label>
            ))}
          </div>
        </div>

        {/* MAIN AREA: PROBLEM LIST */}
        <div className="panel" style={{ flex: 1, padding: '0' }}>
          <div className="panel-header" style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h2>Problems</h2>
            <div className="search-box">
              <Search size={16} />
              <input placeholder="Search problems..." />
            </div>
          </div>

          <div style={{ padding: '0' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading problems...</div>
            ) : problems.length > 0 ? (
              <div>
                {problems.map(problem => (
                  <div key={problem._id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '20px', 
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    transition: 'background 0.2s',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ marginRight: '20px', color: '#64748b' }}>
                      <Bookmark size={20} />
                    </div>
                    
                    <div style={{ flex: 2 }}>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {problem.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                        {problem.topics?.join(', ')}
                      </p>
                    </div>

                    <div style={{ flex: 1, color: getDifficultyColor(problem.difficulty), textTransform: 'capitalize', fontWeight: '500' }}>
                      {problem.difficulty}
                    </div>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
                      <span style={{ fontSize: '0.9rem' }}>{problem.acceptanceRate || 0}%</span>
                      {/* Simple progress bar representation */}
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{ 
                            width: '4px', height: '12px', 
                            background: i <= (problem.acceptanceRate / 20) ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                            borderRadius: '2px'
                          }} />
                        ))}
                      </div>
                    </div>

                    <div style={{ flex: 1, color: '#94a3b8', fontSize: '0.9rem' }}>
                      0/{problem.points || 100}
                    </div>

                    <div>
                      <button 
                        className="action-btn"
                        onClick={() => handleSolve(problem)}
                        style={{ 
                          background: 'transparent', 
                          border: '1px solid #4f46e5', 
                          color: '#818cf8',
                          padding: '8px 20px',
                          borderRadius: '20px',
                          fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#4f46e5';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#818cf8';
                        }}
                      >
                        Solve
                      </button>
                    </div>
                  </div>
                ))}
                
                <div style={{ padding: '20px' }}>
                  <Pagination
                    currentPage={currentPage}
                    totalItems={totalPages * itemsPerPage}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Code2}
                title="No problems found"
                desc="Try adjusting your topic filters to find more problems."
                actionLabel="Clear Filters"
                onAction={() => setSelectedTopics([])}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CodingPractice;
