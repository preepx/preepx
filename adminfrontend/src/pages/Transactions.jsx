import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import api from '../utils/api';
import Pagination from '../components/Pagination';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get('/transactions');
        setTransactions(response.data);
      } catch (err) {
        setError('Failed to load transactions.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (loading) return <div className="loading">Loading transactions...</div>;
  if (error) return <div className="error-alert">{error}</div>;

  return (
    <div className="transactions-page animate-fade-in">
      <div className="page-header">
        <h1>Transaction History</h1>
        <p className="text-secondary">View all coin purchases, spends, and bonuses across the platform.</p>
      </div>

      <div className="glass-panel content-card">
        <div className="card-header">
          <CreditCard size={20} className="accent-icon" />
          <h3>All Transactions ({transactions.length})</h3>
        </div>
        
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Coins</th>
                <th>Rupees (Rs.)</th>
                <th>Description</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map(tx => (
                <tr key={tx._id}>
                  <td>
                    {tx.userId ? (
                      <div>
                        <div style={{fontWeight: 500}}>{tx.userId.fullName}</div>
                        <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{tx.userId.email}</div>
                      </div>
                    ) : 'Unknown User'}
                  </td>
                  <td>
                    <span className={`badge ${tx.type === 'purchase' ? 'badge-accent' : (tx.type === 'bonus' || tx.type === 'xp_bonus' ? 'badge-yellow' : '')}`}>
                      {tx.type.toUpperCase().replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: (tx.type === 'purchase' || tx.type === 'bonus' || tx.type === 'xp_bonus') ? 'var(--success)' : 'var(--danger)' }}>
                    {(tx.type === 'purchase' || tx.type === 'bonus' || tx.type === 'xp_bonus') ? '+' : '-'}{tx.coins} {tx.type === 'xp_bonus' ? 'XP' : 'Coins'}
                  </td>
                  <td>{tx.metadata?.rupees ? `Rs.${tx.metadata.rupees}` : '-'}</td>
                  <td>{tx.description}</td>
                  <td>
                    <span style={{ 
                      color: tx.status === 'completed' ? 'var(--success)' : 
                             tx.status === 'pending' ? '#f59e0b' : 'var(--danger)' 
                    }}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </td>
                  <td>{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination 
          currentPage={currentPage}
          totalItems={transactions.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Transactions;
