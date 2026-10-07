import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-primary-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm font-medium text-gray-400">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: '⚠️ Access Restricted: Please sign in or register first to access this section.',
        }}
        replace
      />
    );
  }

  if (adminOnly && !isAdmin) {
    return (
      <Navigate
        to="/dashboard"
        state={{
          message: '🔒 Admin access required.',
        }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
