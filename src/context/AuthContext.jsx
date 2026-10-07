import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    setError(null);
    setLoading(true);
    try {
      const result = await authService.login(credentials);
      const token = result.token;
      const userData = result.user;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return result;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setError(null);
    setLoading(true);
    try {
      const result = await authService.register(userData);
      const token = result.token;
      const userObj = result.user;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userObj));
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userObj));

      setUser(userObj);
      return result;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  }, []);

  const userRole = (user?.role || '').toLowerCase();
  const isAdmin = userRole === 'admin';
  const isOwner = userRole === 'owner';
  const isStudent = userRole === 'student';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        login,
        register,
        logout,
        isAdmin,
        isOwner,
        isStudent,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
