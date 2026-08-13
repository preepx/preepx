import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  Briefcase, CheckCircle, XCircle, Clock, Shield, Search, Eye, AlertTriangle
} from 'lucide-react';
import './Dashboard.css';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', className: 'badge-pending', icon: Clock },
  VERIFIED: { label: 'Verified', className: 'badge-verified', icon: CheckCircle },
  REJECTED: { label: 'Rejected', className: 'badge-rejected', icon: XCircle },
  SUSPENDED: { label: 'Suspended', className: 'badge-suspended', icon: AlertTriangle },
};

const Recruiters = () => {
  const [list, setList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [recruitersRes, statsRes] = await Promise.all([
        api.get('/recruiters', { params: filter ? { status: filter } : {} }),
        api.get('/recruiters/stats'),
      ]);
      setList(recruitersRes.data);
      setStats(statsRes.data);
    } catch {
      setError('Failed to load recruiters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const filtered = list.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.company?.name?.toLowerCase().includes(q) ||
      item.recruiter?.fullName?.toLowerCase().includes(q) ||
      item.recruiter?.email?.toLowerCase().includes(q)
    );
  });

  const handleVerify = async (companyId, status) => {
    setActionLoading(true);
    try {
      await api.patch(`/recruiters/${companyId}/verification`, { status, notes });
      setSelected(null);
      setNotes('');
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !list.length) return <div className="loading">Loading recruiters...</div>;

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Briefcase size={32} className="accent-icon" />
          <div>
            <h1>Recruiter Verification</h1>
            <p className="text-secondary">Review and verify recruiter company profiles</p>
          </div>
        </div>
      </div>

      {stats && (
        <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
          <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper amber"><Clock size={24} /></div>
            <div><h3>{stats.pending}</h3><p className="text-secondary">Pending</p></div>
          </div>
          <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper green"><CheckCircle size={24} /></div>
            <div><h3>{stats.verified}</h3><p className="text-secondary">Verified</p></div>
          </div>
          <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper blue"><Shield size={24} /></div>
            <div><h3>{stats.totalRecruiters}</h3><p className="text-secondary">Total Recruiters</p></div>
          </div>
        </div>
      )}

      {error && <div className="error-alert">{error}</div>}

      <div className="glass-panel content-card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED', ''].map((s) => (
              <button
                key={s || 'all'}
                type="button"
                className={`filter-btn ${filter === s ? 'active' : ''}`}
                onClick={() => setFilter(s)}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
          <div className="search-container" style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input className="input-field" placeholder="Search company or recruiter..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Recruiter</th>
                <th>Industry</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No recruiters found</td></tr>
              ) : filtered.map((item) => {
                const cfg = STATUS_CONFIG[item.verificationStatus] || STATUS_CONFIG.PENDING;
                const Icon = cfg.icon;
                return (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.company?.name}</strong>
                      <br /><span className="text-secondary" style={{ fontSize: 12 }}>{item.company?.website || '—'}</span>
                    </td>
                    <td>
                      {item.recruiter?.fullName || '—'}
                      <br /><span className="text-secondary" style={{ fontSize: 12 }}>{item.recruiter?.email}</span>
                    </td>
                    <td>{item.company?.industry || '—'}</td>
                    <td><span className={`status-badge ${cfg.className}`}><Icon size={12} /> {cfg.label}</span></td>
                    <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <button type="button" className="btn-icon" onClick={() => { setSelected(item); setNotes(item.verificationNotes || ''); }}>
                        <Eye size={16} /> Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <h2>Review Verification</h2>
            <p className="text-secondary">{selected.company?.name}</p>

            <div style={{ margin: '1rem 0', fontSize: 14, lineHeight: 1.7 }}>
              <p><strong>Recruiter:</strong> {selected.recruiter?.fullName} ({selected.recruiter?.email})</p>
              <p><strong>Phone:</strong> {selected.recruiter?.phone || '—'}</p>
              <p><strong>Website:</strong> {selected.company?.website || '—'}</p>
              <p><strong>Industry:</strong> {selected.company?.industry || '—'} · {selected.company?.companySize || '—'}</p>
              <p><strong>Description:</strong> {selected.company?.description || '—'}</p>
              <p><strong>Current Status:</strong> {selected.verificationStatus}</p>
            </div>

            <label className="text-secondary" style={{ fontSize: 13 }}>Admin Notes (sent to recruiter if rejected)</label>
            <textarea
              className="input-field"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes for the recruiter..."
              style={{ width: '100%', marginTop: 6, marginBottom: 16 }}
            />

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="btn-primary" disabled={actionLoading} onClick={() => handleVerify(selected._id, 'VERIFIED')}>
                <CheckCircle size={16} /> Approve
              </button>
              <button type="button" className="btn-danger" disabled={actionLoading} onClick={() => handleVerify(selected._id, 'REJECTED')}>
                <XCircle size={16} /> Reject
              </button>
              <button type="button" className="btn-secondary" disabled={actionLoading} onClick={() => handleVerify(selected._id, 'SUSPENDED')}>
                <AlertTriangle size={16} /> Suspend
              </button>
              <button type="button" className="btn-ghost" onClick={() => setSelected(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .filter-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 13px; }
        .filter-btn.active { background: rgba(99,102,241,0.2); color: #818cf8; border-color: rgba(99,102,241,0.4); }
        .status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
        .badge-pending { background: rgba(245,158,11,0.15); color: #f59e0b; }
        .badge-verified { background: rgba(16,185,129,0.15); color: #10b981; }
        .badge-rejected { background: rgba(239,68,68,0.15); color: #ef4444; }
        .badge-suspended { background: rgba(148,163,184,0.15); color: #94a3b8; }
        .stat-icon-wrapper.amber { background: rgba(245,158,11,0.15); color: #f59e0b; }
        .btn-icon { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(99,102,241,0.1); color: #818cf8; cursor: pointer; font-size: 13px; }
        .btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 8px; border: none; background: #10b981; color: #fff; cursor: pointer; font-weight: 600; }
        .btn-danger { display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 8px; border: none; background: #ef4444; color: #fff; cursor: pointer; font-weight: 600; }
        .btn-secondary { display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 8px; border: none; background: #64748b; color: #fff; cursor: pointer; }
        .btn-ghost { padding: 10px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-secondary); cursor: pointer; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-content { padding: 24px; width: 100%; border-radius: 16px; max-height: 90vh; overflow-y: auto; }
      `}</style>
    </div>
  );
};

export default Recruiters;
