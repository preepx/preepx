import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LogOut, Shield, Menu, X, BookOpen, HelpCircle, FileUp, IndianRupee } from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Mobile Top Header */}
      <div className="mobile-top-header glass-panel">
        <div className="mobile-logo">
          <Shield className="logo-icon" size={24} />
          <h2>Admin</h2>
        </div>
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      <aside className={`sidebar glass-panel ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Shield className="logo-icon" size={32} />
          <h2>Admin Portal</h2>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
            <Users size={20} />
            <span>Users</span>
          </NavLink>
          
          <NavLink to="/transactions" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
            <CreditCard size={20} />
            <span>Transactions</span>
          </NavLink>

          <NavLink to="/purchases" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
            <IndianRupee size={20} />
            <span>Coin Purchases</span>
          </NavLink>

          <NavLink to="/btec-notes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
            <BookOpen size={20} />
            <span>B.Tech Notes</span>
          </NavLink>

          <NavLink to="/btec-pdf-notes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
            <FileUp size={20} />
            <span>PDF Notes</span>
          </NavLink>

          <NavLink to="/btec-questions" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
            <HelpCircle size={20} />
            <span>Important Q &amp; A</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-wrapper animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
