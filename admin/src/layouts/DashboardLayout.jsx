/**
 * layouts/DashboardLayout.jsx — Protected layout with Sidebar + Navbar
 */
import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

// Map routes to page titles
const pageTitles = {
  '/': 'Dashboard',
  '/skills': 'Skills',
  '/questions': 'Questions',
  '/upload': 'Bulk Upload',
  '/settings': 'Settings',
};

export default function DashboardLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Get page title (handle /questions/:skill)
  const pathKey = '/' + location.pathname.split('/')[1];
  const title = pageTitles[pathKey] || 'QBank Admin';

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-60 min-w-0">
        <Navbar
          onMenuToggle={() => setSidebarOpen((o) => !o)}
          title={title}
        />
        <main className="flex-1 p-5 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
