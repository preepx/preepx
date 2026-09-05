import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, IndianRupee, TrendingUp, Briefcase, Shield,
  AlertTriangle, CreditCard, ArrowRight, Building2
} from 'lucide-react';
import api from '../utils/api';
import './Dashboard.css';

const KpiCard = ({ icon: Icon, label, value, sub, color = 'blue', link, onClick }) => {
  const colorMap = {
    blue:   { bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.25)',  iconBg: 'rgba(59,130,246,0.18)',  ic: '#60a5fa' },
    green:  { bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.25)',  iconBg: 'rgba(16,185,129,0.18)',  ic: '#34d399' },
    amber:  { bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.25)',  iconBg: 'rgba(245,158,11,0.18)',  ic: '#fbbf24' },
    purple: { bg: 'rgba(139,92,246,0.10)',  border: 'rgba(139,92,246,0.25)',  iconBg: 'rgba(139,92,246,0.18)',  ic: '#a78bfa' },
    rose:   { bg: 'rgba(244,63,94,0.10)',   border: 'rgba(244,63,94,0.25)',   iconBg: 'rgba(244,63,94,0.18)',   ic: '#fb7185' },
    cyan:   { bg: 'rgba(6,182,212,0.10)',   border: 'rgba(6,182,212,0.25)',   iconBg: 'rgba(6,182,212,0.18)',   ic: '#22d3ee' },
  };
  const c = colorMap[color] || colorMap.blue;
  const inner = (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, transition: 'transform 0.18s, box-shadow 0.18s', textDecoration: 'none', color: 'inherit', cursor: link || onClick ? 'pointer' : 'default' }} className="kpi-hover">
      <div style={{ background: c.iconBg, borderRadius: 12, padding: 10, flexShrink: 0 }}>
        <Icon size={22} color={c.ic} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.4px', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{sub}</div>}
      </div>
      {(link || onClick) && <ArrowRight size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />}
    </div>
  );
  if (link) return <Link to={link} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link>;
  if (onClick) return <div onClick={onClick}>{inner}</div>;
  return inner;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load dashboard stats.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12, color: 'var(--text-secondary)', fontSize: 14 }}>
      <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      Loading dashboard...
    </div>
  );
  if (error) return <div className="error-alert">{error}</div>;

  const s = stats || {};

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="gradient-text">Dashboard Overview</h1>
        <p className="text-secondary">Welcome back, Admin. Here's what's happening across PreepX.</p>
      </div>

      {/* ─── Platform KPIs ─── */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Platform Overview</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
          <KpiCard icon={Users}        label="Total Users"           value={(s.totalUsers || 0).toLocaleString('en-IN')}          color="blue"   link="/users" />
          <KpiCard icon={Building2}    label="Total Recruiters"      value={(s.totalRecruiters || 0).toLocaleString('en-IN')}      color="purple" link="/recruiters" />
          <KpiCard icon={Briefcase}    label="Jobs Posted (Total)"   value={(s.totalJobsPosted || 0).toLocaleString('en-IN')}      color="cyan"   sub="By all recruiters" />
          <KpiCard
            icon={AlertTriangle}
            label="Pending Verifications"
            value={s.pendingVerifications || 0}
            sub={s.pendingVerifications > 0 ? 'Needs review' : 'All clear ✓'}
            color={s.pendingVerifications > 0 ? 'rose' : 'green'}
            link="/recruiters"
          />
        </div>
      </div>

      {/* ─── Revenue KPIs ─── */}
      <div style={{ marginBottom: 8, marginTop: 22 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Revenue & Billing</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
          <KpiCard icon={IndianRupee} label="Lifetime Wallet Revenue"     value={`₹${(s.lifetimeRevenue || 0).toLocaleString('en-IN')}`}        color="green"  sub="Wallet recharges total" />
          <KpiCard icon={CreditCard}  label="Recruiter Revenue (Total)"    value={`₹${(s.recruiterRevenue || 0).toLocaleString('en-IN')}`}        color="amber"  link="/recruiter-plans" sub="Razorpay plan payments" />
          <KpiCard icon={TrendingUp}  label="Recruiter Revenue (This Month)" value={`₹${(s.recruiterMonthRevenue || 0).toLocaleString('en-IN')}`} color="purple" link="/recruiter-plans" />
          <KpiCard icon={Shield}      label="Active Recruiter Plans"       value={s.activeRecruiterPlans || 0}                                    color="cyan"   link="/recruiter-plans" sub="Active + trial" />
        </div>
      </div>

      {/* ─── Recent Tables ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16, marginTop: 22 }}>

        {/* Recent Recruiter Payments */}
        <div className="glass-panel content-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={18} color="#10b981" />
              <h3 style={{ margin: 0 }}>Recruiter Payments</h3>
            </div>
            <Link to="/recruiter-plans" style={{ fontSize: 12, color: '#10b981', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View all <ArrowRight size={12} /></Link>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead><tr><th>Recruiter</th><th>Plan</th><th>Amount</th><th>Date</th></tr></thead>
              <tbody>
                {!(s.recentRecruiterPayments || []).length ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)' }}>No payments yet</td></tr>
                ) : (s.recentRecruiterPayments || []).map(p => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.recruiterId?.fullName || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.recruiterId?.email}</div>
                    </td>
                    <td><span style={{ color: '#10b981', fontWeight: 600 }}>{p.planName}</span></td>
                    <td><span style={{ color: '#34d399', fontWeight: 700 }}>₹{(p.amountInr || 0).toLocaleString('en-IN')}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        <div className="glass-panel content-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="#60a5fa" />
              <h3 style={{ margin: 0 }}>Recent Users</h3>
            </div>
            <Link to="/users" style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View all <ArrowRight size={12} /></Link>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead><tr><th>User</th><th>Email</th><th>Joined</th></tr></thead>
              <tbody>
                {!(s.recentUsers || []).length ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)' }}>No users yet</td></tr>
                ) : (s.recentUsers || []).map(user => (
                  <tr key={user._id} onClick={() => navigate(`/users/${user._id}`)} style={{ cursor: 'pointer' }} className="clickable-row">
                    <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {user.profilePic
                        ? <img src={user.profilePic} alt={user.fullName} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>{user.fullName?.charAt(0)?.toUpperCase()}</div>
                      }
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{user.fullName}</span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Wallet Transactions */}
      <div className="glass-panel content-card" style={{ marginTop: 16 }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} color="#a78bfa" />
            <h3 style={{ margin: 0 }}>Recent Wallet Transactions</h3>
          </div>
          <Link to="/transactions" style={{ fontSize: 12, color: '#a78bfa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View all <ArrowRight size={12} /></Link>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {!(s.recentTransactions || []).length ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)' }}>No transactions yet</td></tr>
              ) : (s.recentTransactions || []).map(tx => (
                <tr key={tx._id}>
                  <td>{tx.userId?.fullName || 'Unknown User'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{tx.type}</td>
                  <td style={{ color: tx.type === 'purchase' ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
                    {tx.type === 'purchase' ? '+' : '-'}₹{Math.abs(tx.coins || 0)}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(tx.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .kpi-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.2); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Dashboard;
