import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Wallet, History, ArrowLeft, Briefcase, GraduationCap, PlusCircle, Star, Terminal, Users, X, Gift, Calendar } from 'lucide-react';
import api from '../utils/api';
import './UserDetails.css';
import Pagination from '../components/Pagination';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [coinsToAdd, setCoinsToAdd] = useState('');
  const [addingCoins, setAddingCoins] = useState(false);
  
  const [xpToAdd, setXpToAdd] = useState('');
  const [addingXp, setAddingXp] = useState(false);

  const [referrals, setReferrals] = useState([]);
  const [showReferralsModal, setShowReferralsModal] = useState(false);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

  const [interviewPage, setInterviewPage] = useState(1);
  const interviewsPerPage = 10;

  const fetchReferrals = async () => {
    try {
      setLoadingReferrals(true);
      const response = await api.get(`/users/${id}/referrals`);
      setReferrals(response.data);
      setShowReferralsModal(true);
    } catch (err) {
      alert('Failed to load referrals.');
    } finally {
      setLoadingReferrals(false);
    }
  };

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

  const { user, wallet, interviews, mcqResults, codingResults = [], recentTransactions } = data;

  const indexOfLastInterview = interviewPage * interviewsPerPage;
  const indexOfFirstInterview = indexOfLastInterview - interviewsPerPage;
  const currentInterviews = interviews.slice(indexOfFirstInterview, indexOfLastInterview);

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
            {user.referralCode && (
              <span 
                className="badge" 
                style={{background: 'rgba(79, 70, 229, 0.2)', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}
                onClick={fetchReferrals}
                title="Click to view referrals"
              >
                Code: {user.referralCode} <Users size={12} /> {loadingReferrals ? '...' : ''}
              </span>
            )}
            {user.referredBy && <span className="badge" style={{background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)'}}>Referred</span>}
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
              <User size={20} className="accent-icon" />
              <h3 className="gradient-text">Profile Details</h3>
            </div>
            <div className="profile-extra-details">
              {user.bio && <p><strong>Bio:</strong> {user.bio}</p>}
              {user.mobile && <p><strong>Mobile:</strong> {user.mobile}</p>}
              {user.college && <p><strong>College:</strong> {user.college}</p>}
              {user.degree && <p><strong>Degree:</strong> {user.degree}</p>}
              {user.address && <p><strong>Location:</strong> {user.address}</p>}
              {user.github && <p><strong>GitHub:</strong> <a href={`https://${user.github.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer">{user.github}</a></p>}
              {user.linkedin && <p><strong>LinkedIn:</strong> <a href={`https://${user.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer">{user.linkedin}</a></p>}
              
              {!user.bio && !user.mobile && !user.college && !user.degree && !user.address && !user.github && !user.linkedin && (
                <p className="text-secondary">No additional details provided.</p>
              )}
            </div>
          </div>

          <div className="glass-panel content-card mb-4">
            <div className="card-header">
              <Wallet size={20} className="accent-icon" />
              <h3 className="gradient-text">Wallet</h3>
            </div>
            <div className="wallet-balance" style={{ marginBottom: '1rem' }}>
              <h2>{wallet.balance} <span className="text-secondary" style={{fontSize: '1rem'}}>Coins</span></h2>
            </div>
            
            <div className="add-coins-form">
              <input 
                type="number" 
                className="input-field" 
                placeholder="Coins to add" 
                value={coinsToAdd}
                onChange={(e) => setCoinsToAdd(e.target.value)}
                style={{ flex: 1, padding: '0.5rem' }}
              />
              <button 
                className="btn-primary" 
                disabled={addingCoins || !coinsToAdd}
                onClick={async () => {
                  if (!coinsToAdd || isNaN(coinsToAdd) || Number(coinsToAdd) <= 0) return;
                  setAddingCoins(true);
                  try {
                    const res = await api.post(`/users/${id}/wallet/add`, { coins: Number(coinsToAdd) });
                    // Refresh data
                    const updatedData = await api.get(`/users/${id}`);
                    setData(updatedData.data);
                    setCoinsToAdd('');
                    alert('Coins added successfully!');
                  } catch (err) {
                    alert('Failed to add coins');
                  } finally {
                    setAddingCoins(false);
                  }
                }}
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <PlusCircle size={18} /> {addingCoins ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>

          <div className="glass-panel content-card mb-4">
            <div className="card-header">
              <Star size={20} className="accent-icon" />
              <h3 className="gradient-text">Experience Points</h3>
            </div>
            <div className="wallet-balance" style={{ marginBottom: '1rem' }}>
              <h2>{user.points || 0} <span className="text-secondary" style={{fontSize: '1rem'}}>XP</span></h2>
            </div>
            
            <div className="add-coins-form">
              <input 
                type="number" 
                className="input-field" 
                placeholder="XP to add" 
                value={xpToAdd}
                onChange={(e) => setXpToAdd(e.target.value)}
                style={{ flex: 1, padding: '0.5rem' }}
              />
              <button 
                className="btn-primary" 
                disabled={addingXp || !xpToAdd}
                onClick={async () => {
                  if (!xpToAdd || isNaN(xpToAdd) || Number(xpToAdd) <= 0) return;
                  setAddingXp(true);
                  try {
                    await api.post(`/users/${id}/xp/add`, { xp: Number(xpToAdd) });
                    const updatedData = await api.get(`/users/${id}`);
                    setData(updatedData.data);
                    setXpToAdd('');
                    alert('XP added successfully!');
                  } catch (err) {
                    alert('Failed to add XP');
                  } finally {
                    setAddingXp(false);
                  }
                }}
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <PlusCircle size={18} /> {addingXp ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
          <div className="glass-panel content-card mb-4">
            <div className="card-header">
              <Gift size={20} className="accent-icon" />
              <h3 className="gradient-text">Rewards & Daily Logins</h3>
            </div>
            <div className="rewards-info" style={{ marginTop: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Last Daily Login Claim:</p>
                <p style={{ fontWeight: '500' }}>
                  {user.lastDailyRewardDate 
                    ? new Date(user.lastDailyRewardDate).toLocaleString() 
                    : <span className="text-secondary">Never claimed</span>}
                </p>
              </div>
              
              <div>
                <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>XP Rewards Claimed ({user.xpRewardsClaimed?.length || 0}):</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {user.xpRewardsClaimed && user.xpRewardsClaimed.length > 0 ? (
                    user.xpRewardsClaimed.map((reward, idx) => (
                      <span key={idx} className="badge badge-accent" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                        {reward.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    ))
                  ) : (
                    <p className="text-secondary" style={{ fontSize: '0.85rem' }}>No rewards claimed yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel content-card mb-4">
            <div className="card-header">
              <Calendar size={20} className="accent-icon" />
              <h3 className="gradient-text">100 Days Coding Challenge</h3>
            </div>
            <div className="coding-challenge-info" style={{ marginTop: '1rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Current Progress</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.4)', borderRadius: '999px', height: '12px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ 
                      width: `${Math.min(((user.challengeProgress?.completedDays?.length || 0) / 100) * 100, 100)}%`, 
                      background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', 
                      height: '100%',
                      borderRadius: '999px',
                      transition: 'width 0.5s ease-out'
                    }}></div>
                  </div>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    {user.challengeProgress?.completedDays?.length || 0}/100
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p className="text-secondary" style={{ fontSize: '0.85rem', margin: 0 }}>Current Day</p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.25rem', margin: '4px 0 0 0', color: 'var(--accent-primary)' }}>
                    Day {user.challengeProgress?.currentDay || 1}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="text-secondary" style={{ fontSize: '0.85rem', margin: 0 }}>Streak</p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.25rem', margin: '4px 0 0 0', color: 'var(--warning)' }}>
                    {user.streak || 0} 🔥
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel content-card">
            <div className="card-header">
              <History size={20} className="accent-icon" />
              <h3 className="gradient-text">Recent Transactions</h3>
            </div>
            <div className="tx-list">
              {recentTransactions.length > 0 ? (
                recentTransactions.map(tx => (
                  <div key={tx._id} className="tx-item">
                    <div className="tx-info">
                      <p className="tx-desc">{tx.description}</p>
                      <small className="text-secondary">{new Date(tx.createdAt).toLocaleDateString()}</small>
                    </div>
                    <div className={`tx-amount ${tx.type === 'purchase' || tx.type === 'bonus' || tx.type === 'xp_bonus' ? 'positive' : 'negative'}`}>
                      {tx.type === 'purchase' || tx.type === 'bonus' || tx.type === 'xp_bonus' ? '+' : '-'}{tx.coins} {tx.type === 'xp_bonus' ? 'XP' : 'Coins'}
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
              <h3 className="gradient-text">Mock Interviews ({interviews.length})</h3>
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
                  {currentInterviews.map(inv => (
                    <tr key={inv._id}>
                      <td>{inv.jobTitle || 'N/A'}</td>
                      <td>{inv.company || 'N/A'}</td>
                      <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {currentInterviews.length === 0 && (
                    <tr><td colSpan="3" className="text-secondary text-center">No interviews found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination 
              currentPage={interviewPage}
              totalItems={interviews.length}
              itemsPerPage={interviewsPerPage}
              onPageChange={setInterviewPage}
            />
          </div>

          <div className="glass-panel content-card">
            <div className="card-header">
              <GraduationCap size={20} className="accent-icon" />
              <h3 className="gradient-text">Objective Exams ({mcqResults.length})</h3>
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
          <div className="glass-panel content-card mt-4">
            <div className="card-header">
              <Terminal size={20} className="accent-icon" />
              <h3 className="gradient-text">Coding Practice ({codingResults.length})</h3>
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Difficulty / Lang</th>
                    <th>Status</th>
                    <th>Time Spent</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {codingResults.map(cr => (
                    <tr key={cr._id}>
                      <td>{cr.title}</td>
                      <td>{cr.difficulty} / {cr.language}</td>
                      <td>
                        <span className={`badge ${cr.status === 'success' || cr.status === 'passed' ? 'badge-success' : 'badge-warning'}`}>
                          {cr.status}
                        </span>
                      </td>
                      <td>{Math.floor(cr.timeSpentSecs / 60)}m {cr.timeSpentSecs % 60}s</td>
                      <td>{new Date(cr.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {codingResults.length === 0 && (
                    <tr><td colSpan="5" className="text-secondary text-center">No coding practices taken.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showReferralsModal && (
        <div className="modal-overlay" onClick={() => setShowReferralsModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.75)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '5vh 1rem', backdropFilter: 'blur(4px)' }}>
          <div className="modal-content glass-panel hide-scrollbar" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '550px', padding: '1.5rem', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={20} className="accent-icon" /> Referred Users ({referrals.length})</h3>
              <button onClick={() => setShowReferralsModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                <X size={18} />
              </button>
            </div>
            
            {referrals.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>No users have joined using this referral code yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {referrals.map(ref => (
                  <div key={ref._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', transition: 'transform 0.2s, background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                    {ref.profilePic ? (
                      <img src={ref.profilePic} alt={ref.fullName} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {ref.fullName ? ref.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ref.fullName}</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ref.email}</p>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span className="badge badge-yellow" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>{ref.points || 0} XP</span>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {new Date(ref.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
