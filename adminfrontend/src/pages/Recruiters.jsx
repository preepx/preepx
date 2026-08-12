import React from 'react';
import './Dashboard.css'; // Reusing dashboard styles for now
import { Users, Briefcase } from 'lucide-react';

const Recruiters = () => {
  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Briefcase size={32} className="accent-icon" />
          <div>
            <h1>Recruiters Management</h1>
            <p className="text-secondary">View and manage all registered recruiters</p>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
        <Users size={64} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
        <h2>Coming Soon</h2>
        <p className="text-secondary" style={{ maxWidth: '400px', margin: '1rem auto' }}>
          The recruiters module is currently under development. This page will display a list of all active recruiters, their job postings, and analytics.
        </p>
      </div>
    </div>
  );
};

export default Recruiters;
