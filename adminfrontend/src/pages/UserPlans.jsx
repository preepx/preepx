import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, Search, XCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';
import Pagination from '../components/Pagination';

const UserPlans = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      // Only keep users with an active subscription
      const subscribedUsers = response.data.filter(u => u.subscription?.status === 'active');
      setUsers(subscribedUsers);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeactivatePlan = async (user) => {
    const planTitle = user.subscription?.planName || 'Pro Plan';
    const confirmMsg = `Are you sure you want to deactivate / cancel ${user.fullName}'s ${planTitle}?`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(user._id);
    try {
      await api.put(`/users/${user._id}/plan/deactivate`);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      alert(`Plan for ${user.fullName} has been deactivated successfully.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate plan.');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.fullName && user.fullName.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.subscription?.planName && user.subscription.planName.toLowerCase().includes(searchLower))
    );
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to page 1 on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) return <div className="loading">Loading user plans...</div>;
  if (error) return <div className="error-alert">{error}</div>;

  return (
    <div className="users-page animate-fade-in">
      <div className="page-header">
        <h1>Pro Users (Subscribers)</h1>
        <p className="text-secondary">Manage users who have active Pro Plans.</p>
      </div>

      <div className="glass-panel content-card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={20} className="accent-icon" color="#10b981" />
            <h3>Subscribers ({filteredUsers.length})</h3>
          </div>
          <div className="search-container" style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search by name, email or plan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '35px' }}
            />
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Plan Name</th>
                <th>Payment Mode</th>
                <th>Expiry Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(user => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {user.profilePic ? (
                        <img src={user.profilePic} alt={user.fullName} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      {user.fullName}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{ color: '#10b981', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Shield size={14} /> {user.subscription?.planName || 'Pro'}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: user.subscription?.paymentMethod === 'Wallet' 
                        ? 'rgba(16, 185, 129, 0.15)' 
                        : user.subscription?.paymentMethod === 'Wallet + Razorpay'
                        ? 'rgba(99, 102, 241, 0.15)'
                        : 'rgba(255, 255, 255, 0.08)',
                      color: user.subscription?.paymentMethod === 'Wallet' 
                        ? '#10b981' 
                        : user.subscription?.paymentMethod === 'Wallet + Razorpay'
                        ? '#818cf8'
                        : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}>
                      {user.subscription?.paymentMethod || 'Razorpay'}
                      {user.subscription?.walletUsed > 0 ? ` (-₹${user.subscription.walletUsed})` : ''}
                    </span>
                  </td>
                  <td>{user.subscription?.expiresAt ? new Date(user.subscription.expiresAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                        onClick={() => navigate(`/users/${user._id}`)}
                      >
                        <Eye size={15} /> View
                      </button>
                      <button
                        style={{
                          padding: '0.45rem 0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.85rem',
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ef4444';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onClick={() => handleDeactivatePlan(user)}
                        disabled={actionLoading === user._id}
                        title="Cancel / Deactivate Pro Plan"
                      >
                        {actionLoading === user._id ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            <span>Cancelling...</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={15} />
                            <span>Cancel Plan</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No active subscribers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredUsers.length > itemsPerPage && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
            <Pagination 
              currentPage={currentPage}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPlans;
