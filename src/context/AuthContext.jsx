import { createContext, useEffect, useState } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from sessionStorage on mount & verify with backend
  useEffect(() => {
    const init = async () => {
      const token = sessionStorage.getItem('sc_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data.user);
        setProfile(data.data.profile);
        sessionStorage.setItem('sc_user', JSON.stringify(data.data.user));
      } catch {
        sessionStorage.removeItem('sc_token');
        sessionStorage.removeItem('sc_user');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    sessionStorage.setItem('sc_token', data.data.token);
    sessionStorage.setItem('sc_user', JSON.stringify(data.data.user));
    setUser(data.data.user);

    // Fetch profile for role-specific data
    try {
      const me = await api.get('/auth/me');
      setProfile(me.data.data.profile);
    } catch {}

    return data.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    sessionStorage.removeItem('sc_token');
    sessionStorage.removeItem('sc_user');
    setUser(null);
    setProfile(null);
  };

  const value = { user, profile, loading, login, logout, setProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};