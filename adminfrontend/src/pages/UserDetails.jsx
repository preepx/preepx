import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Wallet, History, ArrowLeft, Briefcase, GraduationCap } from 'lucide-react';
import api from '../utils/api';
import './UserDetails.css';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        setData(response.data);
      } catch (err) {
        setError('Failed to load user details.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [id]);

  if (loading) return <div className="loading">Loading user profile...</div>;
  if (error) return <div className="error-alert">{error}</div>;
  if (!data) return null;

  const { user, wallet, interviews, mcqResults, recentTransactions } = data;

  return (
    <div className="user-details-page animate-fade-in">
      <button className="back-btn" onClick={() => navigate('/users')}>
        <ArrowLeft size={20} /> Back to Users
      </button>

      <div className="profile-header glass-panel">
        <div className="profile-avatar">
          {user.profilePic ? (
            <img src={user.profilePic} alt={user.fullName} />
          ) : (
            <span>{user.fullName.charAt(0)}</span>
          )}
        </div>
        <div className="profile-info">
          <h1>{user.fullName}</h1>
          <p className="text-secondary">{user.email}</p>
          <div className="profile-badges">
            <span className="badge">Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
            <span className="badge badge-accent">Level {user.level || 1}</span>
            <span className="badge badge-yellow">{user.points || 0} XP</span>
            {user.isBlocked && <span className="badge" style={{background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)'}}>Blocked</span>}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button 
            className="btn-primary" 
            style={{ 
              background: user.isBlocked ? 'var(--success)' : 'var(--danger)',
              opacity: loading ? 0.7 : 1
            }}
            onClick={async () => {
              if (window.confirm(`Are you sure you want to ${user.isBlocked ? 'unblock' : 'block'} this user?`)) {
                try {
                  const res = await api.put(`/users/${user._id}/block`);
                  setData({...data, user: {...user, isBlocked: res.data.isBlocked}});
                } catch (err) {
                  alert('Failed to toggle block status');
                }
              }
            }}
          >
            {user.isBlocked ? 'Unblock User' : 'Block User'}
          </button>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-sidebar">
          <div className="glass-panel content-card mb-4">
            <div className="card-header">
              <Wallet size={20} className="accent-icon" />
              <h3>Wallet</h3>
            </div>
            <div className="wallet-balance">
              <h2>{wallet.balance} <span className="text-secondary" style={{fontSize: '1rem'}}>Coins</span></h2>
            </div>
          </div>

          <div className="glass-panel content-card">
            <div className="card-header">
              <History size={20} className="accent-icon" />
              <h3>Recent Transactions</h3>
            </div>
            <div className="tx-list">
              {recentTransactions.length > 0 ? (
                recentTransactions.map(tx => (
                  <div key={tx._id} className="tx-item">
                    <div className="tx-info">
                      <p className="tx-desc">{tx.description}</p>
                      <small className="text-secondary">{new Date(tx.createdAt).toLocaleDateString()}</small>
                    </div>
                    <div className={`tx-amount ${tx.type === 'purchase' || tx.type === 'bonus' ? 'positive' : 'negative'}`}>
                      {tx.type === 'purchase' || tx.type === 'bonus' ? '+' : '-'}{tx.coins}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-secondary">No transactions yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="details-main">
          <div className="glass-panel content-card mb-4">
            <div className="card-header">
              <Briefcase size={20} className="accent-icon" />
              <h3>Mock Interviews ({interviews.length})</h3>
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Company</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map(inv => (
                    <tr key={inv._id}>
                      <td>{inv.jobTitle || 'N/A'}</td>
                      <td>{inv.company || 'N/A'}</td>
                      <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {interviews.length === 0 && (
                    <tr><td colSpan="3" className="text-secondary text-center">No interviews found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-panel content-card">
            <div className="card-header">
              <GraduationCap size={20} className="accent-icon" />
              <h3>Objective Exams ({mcqResults.length})</h3>
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Score</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mcqResults.map(mcq => (
                    <tr key={mcq._id}>
                      <td>{mcq.topic}</td>
                      <td>{mcq.score} / {mcq.totalQuestions}</td>
                      <td>{new Date(mcq.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {mcqResults.length === 0 && (
                    <tr><td colSpan="3" className="text-secondary text-center">No exams taken.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
