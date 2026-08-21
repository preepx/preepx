import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LogOut, Menu, X, BookOpen, HelpCircle, FileUp, IndianRupee, Briefcase, ChevronRight } from 'lucide-react';
import preepxLogo from '../../../frontend/public/preepx_logo.png';
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

  const NavItems = ({ isMobile }) => (
    <>
      <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => isMobile && setIsMobileMenuOpen(false)}>
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
        <ChevronRight size={16} className="nav-chevron" />
      </NavLink>
      <div className="nav-section-title">Management</div>
      <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => isMobile && setIsMobileMenuOpen(false)}>
        <Users size={20} />
        <span>All Users</span>
        <ChevronRight size={16} className="nav-chevron" />
      </NavLink>
      <NavLink to="/recruiters" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => isMobile && setIsMobileMenuOpen(false)}>
        <Briefcase size={20} />
        <span>Recruiters</span>
        <ChevronRight size={16} className="nav-chevron" />
      </NavLink>
      <div className="nav-section-title">Finance</div>
      <NavLink to="/transactions" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => isMobile && setIsMobileMenuOpen(false)}>
        <CreditCard size={20} />
        <span>Transactions</span>
        <ChevronRight size={16} className="nav-chevron" />
      </NavLink>
      <NavLink to="/purchases" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => isMobile && setIsMobileMenuOpen(false)}>
        <IndianRupee size={20} />
        <span>Coin Purchases</span>
        <ChevronRight size={16} className="nav-chevron" />
      </NavLink>
      <div className="nav-section-title">Content</div>
      <NavLink to="/btec-notes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => isMobile && setIsMobileMenuOpen(false)}>
        <BookOpen size={20} />
        <span>B.Tech Notes</span>
        <ChevronRight size={16} className="nav-chevron" />
      </NavLink>
      <NavLink to="/btec-pdf-notes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => isMobile && setIsMobileMenuOpen(false)}>
        <FileUp size={20} />
        <span>PDF Notes</span>
        <ChevronRight size={16} className="nav-chevron" />
      </NavLink>
      <NavLink to="/btec-questions" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => isMobile && setIsMobileMenuOpen(false)}>
        <HelpCircle size={20} />
        <span>Important Q &amp; A</span>
        <ChevronRight size={16} className="nav-chevron" />
      </NavLink>
    </>
  );

  return (
    <div className="app-container">
      
      {/* Desktop Sidebar (Premium Glassmorphism) */}
      <aside className="desktop-sidebar glass-panel">
        <div className="sidebar-header">
          <img src={preepxLogo} alt="Preepx Logo" className="sidebar-logo-img" />
          <h2 className="sidebar-brand gradient-text">Admin</h2>
        </div>
        <div className="sidebar-scrollable">
          <nav className="sidebar-nav">
            <NavItems isMobile={false} />
          </nav>
        </div>
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-layout">
        
        {/* Top Header inside main layout */}
        <header className="main-header glass-panel">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="header-breadcrumbs">
              <span className="breadcrumb-text">Admin Dashboard</span>
            </div>
          </div>
          <div className="header-right">
            <div className="admin-profile-pill">
              <div className="admin-profile-avatar">A</div>
              <span className="admin-profile-name">Admin</span>
            </div>
          </div>
        </header>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-overlay animate-fade-in" onClick={() => setIsMobileMenuOpen(false)}></div>
        )}

        {/* Mobile Sidebar */}
        <aside className={`mobile-sidebar glass-panel ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-sidebar-header">
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
               <img src={preepxLogo} alt="Preepx Logo" style={{ height: '32px' }} />
               <h2 className="gradient-text" style={{margin:0, fontSize:'1.2rem'}}>Admin</h2>
            </div>
            <button className="close-sidebar-btn" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <nav className="mobile-sidebar-nav">
            <NavItems isMobile={true} />
            <button className="mobile-nav-item logout-btn" onClick={handleLogout} style={{marginTop: 'auto'}}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

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
