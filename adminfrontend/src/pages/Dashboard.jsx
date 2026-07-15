import { useState, useEffect } from 'react';
import { Users, IndianRupee, Coins, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    revenueLast7Days: 0,
    coinsSoldLast7Days: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard');
        setStats(response.data);
      } catch (err) {
        setError('Failed to load dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error-alert">{error}</div>;

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p className="text-secondary">Welcome to your admin panel. Here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.2))', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div className="stat-icon-wrapper green" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
            <IndianRupee size={32} />
          </div>
          <div className="stat-details">
            <h3 style={{ color: '#10b981', fontWeight: 600 }}>Admin Wallet (Total Earnings)</h3>
            <p className="stat-value" style={{ fontSize: '2.5rem', color: '#10b981' }}>₹{stats.lifetimeRevenue || 0}</p>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper blue">
            <Users size={24} />
          </div>
          <div className="stat-details">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper yellow">
            <Coins size={24} />
          </div>
          <div className="stat-details">
            <h3>Coins Sold (Last 7 Days)</h3>
            <p className="stat-value">{stats.coinsSoldLast7Days}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="glass-panel content-card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <Users size={20} className="accent-icon" />
            <h3>Recent Users</h3>
          </div>
          <div className="card-body">
            {stats.recentUsers && stats.recentUsers.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map(user => (
                      <tr key={user._id}>
                        <td>{user.fullName}</td>
                        <td>{user.email}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-secondary">No recent users found.</p>
            )}
          </div>
        </div>

        <div className="glass-panel content-card">
          <div className="card-header">
            <TrendingUp size={20} className="accent-icon" />
            <h3>Recent Transactions</h3>
          </div>
          <div className="card-body">
            {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Type</th>
                      <th>Coins</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentTransactions.map(tx => (
                      <tr key={tx._id}>
                        <td>{tx.userId?.fullName || 'Unknown User'}</td>
                        <td style={{ textTransform: 'capitalize' }}>{tx.type}</td>
                        <td style={{ color: tx.type === 'purchase' ? '#10b981' : '#f59e0b' }}>
                          {tx.type === 'purchase' ? '+' : '-'}{tx.coins}
                        </td>
                        <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-secondary">No recent transactions found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
