import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LogOut, Shield, Menu, X, BookOpen, HelpCircle, FileUp, IndianRupee, Briefcase } from 'lucide-react';
import preepxLogo from '../../../frontend/public/preepx_logo.png';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
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
    <div className="app-container" style={{ flexDirection: 'column' }}>

      {/* Premium Full-Width Top Navbar */}
      <header className="top-navbar glass-panel">
        <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={preepxLogo} alt="Preepx Logo" style={{ height: '40px', width: 'auto' }} />
          <h2 style={{ margin: 0, background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.25rem' }}>Admin</h2>
        </div>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="admin-profile-pill">
            <div className="admin-profile-avatar">A</div>
            <span className="admin-profile-name">Admin</span>
          </div>
        </div>

        <div className="nav-tabs" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/recruiters" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>
            <Briefcase size={18} />
            Recruiters
          </NavLink>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="main-layout" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
        )}

        {/* Mobile Sidebar */}
        <aside className={`mobile-sidebar glass-panel ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-sidebar-header">
            <img src={preepxLogo} alt="Preepx Logo" style={{ height: '32px' }} />
            <button className="close-sidebar-btn" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <nav className="mobile-sidebar-nav">
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'mobile-nav-item active' : 'mobile-nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/users" className={({ isActive }) => isActive ? 'mobile-nav-item active' : 'mobile-nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
              <Users size={20} />
              <span>All Users</span>
            </NavLink>
            <NavLink to="/transactions" className={({ isActive }) => isActive ? 'mobile-nav-item active' : 'mobile-nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
              <CreditCard size={20} />
              <span>Transactions</span>
            </NavLink>
            <NavLink to="/purchases" className={({ isActive }) => isActive ? 'mobile-nav-item active' : 'mobile-nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
              <IndianRupee size={20} />
              <span>Coin Purchases</span>
            </NavLink>
            <NavLink to="/btec-notes" className={({ isActive }) => isActive ? 'mobile-nav-item active' : 'mobile-nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
              <BookOpen size={20} />
              <span>B.Tech Notes</span>
            </NavLink>
            <NavLink to="/btec-pdf-notes" className={({ isActive }) => isActive ? 'mobile-nav-item active' : 'mobile-nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
              <FileUp size={20} />
              <span>PDF Notes</span>
            </NavLink>
            <NavLink to="/btec-questions" className={({ isActive }) => isActive ? 'mobile-nav-item active' : 'mobile-nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
              <HelpCircle size={20} />
              <span>Important Q &amp; A</span>
            </NavLink>
            <button className="mobile-nav-item logout-btn" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Floating Glass Dock Navigation */}
        <div className="dock-container">
          <nav className="floating-dock glass-panel">
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'dock-item active' : 'dock-item'}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/users" className={({ isActive }) => isActive ? 'dock-item active' : 'dock-item'}>
              <Users size={20} />
              <span>All Users</span>
            </NavLink>
            <NavLink to="/transactions" className={({ isActive }) => isActive ? 'dock-item active' : 'dock-item'}>
              <CreditCard size={20} />
              <span>Transactions</span>
            </NavLink>

            <NavLink to="/purchases" className={({ isActive }) => isActive ? 'dock-item active' : 'dock-item'}>
              <IndianRupee size={20} />
              <span>Coin Purchases</span>
            </NavLink>

            <NavLink to="/btec-notes" className={({ isActive }) => isActive ? 'dock-item active' : 'dock-item'}>
              <BookOpen size={20} />
              <span>B.Tech Notes</span>
            </NavLink>

            <NavLink to="/btec-pdf-notes" className={({ isActive }) => isActive ? 'dock-item active' : 'dock-item'}>
              <FileUp size={20} />
              <span>PDF Notes</span>
            </NavLink>

            <NavLink to="/btec-questions" className={({ isActive }) => isActive ? 'dock-item active' : 'dock-item'}>
              <HelpCircle size={20} />
              <span>Important Q &amp; A</span>
            </NavLink>

            <button className="dock-item logout-btn" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </div>

        <main className="main-content">
          <div className="content-wrapper animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
