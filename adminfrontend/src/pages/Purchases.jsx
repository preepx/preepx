import { useState, useEffect } from 'react';
import { IndianRupee, ShoppingBag } from 'lucide-react';
import api from '../utils/api';
import Pagination from '../components/Pagination';

const Purchases = () => {
  const [transactions, setTransactions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await api.get('/purchases');
        setTransactions(response.data.transactions);
        setTotalRevenue(response.data.totalRevenue);
      } catch (err) {
        setError('Failed to load purchases.');
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  if (loading) return <div className="loading">Loading purchases...</div>;
  if (error) return <div className="error-alert">{error}</div>;

  return (
    <div className="transactions-page animate-fade-in">
      <div className="page-header">
        <h1>Coin Purchases</h1>
        <p className="text-secondary">View all real money transactions where users purchased coins.</p>
      </div>

      <div className="dashboard-stats" style={{ marginBottom: '24px' }}>
        <div className="stat-card glass-panel" style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', padding: '24px', minWidth: '300px' }}>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '16px', borderRadius: '12px' }}>
            <IndianRupee size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Total Revenue</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>₹{totalRevenue}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel content-card">
        <div className="card-header">
          <ShoppingBag size={20} className="accent-icon" />
          <h3>Purchase Transactions ({transactions.length})</h3>
        </div>
        
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Coins Added</th>
                <th>Amount (₹)</th>
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
                  <td style={{ fontWeight: 600, color: 'var(--success)' }}>
                    +{tx.coins} Coins
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{tx.metadata?.rupees || 0}</td>
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
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No purchase transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {transactions.length > 0 && (
          <Pagination 
            currentPage={currentPage}
            totalItems={transactions.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default Purchases;
