/**
 * context/AuthContext.jsx — Global authentication state
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('qbank_admin');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('qbank_token'));
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await authService.getMe();
        setAdmin(res.data.data);
        localStorage.setItem('qbank_admin', JSON.stringify(res.data.data));
      } catch {
        // Token invalid — clear everything
        setAdmin(null);
        setToken(null);
        localStorage.removeItem('qbank_token');
        localStorage.removeItem('qbank_admin');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const { token: newToken, admin: newAdmin } = res.data.data;
    setToken(newToken);
    setAdmin(newAdmin);
    localStorage.setItem('qbank_token', newToken);
    localStorage.setItem('qbank_admin', JSON.stringify(newAdmin));
    return res.data;
  };

  const logout = async () => {
    try { await authService.logout(); } catch {}
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('qbank_token');
    localStorage.removeItem('qbank_admin');
  };

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
