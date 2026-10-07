import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight, Building2, Check, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { authService } from '../services/authService';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'mock_reset_token';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(token, newPassword);
      setMessage(res.message || 'Password reset successfully.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-dark-900 flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Aesthetic Student Residence Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1920&q=85"
          alt="Student Living & Accommodation"
          className="w-full h-full object-cover object-center filter brightness-[0.35] contrast-105 scale-105 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/80 to-dark-900/60" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-dark-900/50 to-dark-900" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-primary-500/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-900/60 group-hover:scale-105 transition-all">
              <Building2 className="w-7 h-7 text-white" />
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-accent-400" />
            <span>Security & Authentication</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl text-white tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs sm:text-sm text-gray-300">
            Enter your new secure password below
          </p>
        </div>

        <div className="bg-dark-800/85 backdrop-blur-2xl p-7 sm:p-8 rounded-3xl border border-white/12 shadow-2xl space-y-6">
          {message && (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{message} Redirecting to login...</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-300 mb-1.5 block font-medium">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-900/90 border border-white/15 focus:border-primary-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-300 mb-1.5 block font-medium">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-900/90 border border-white/15 focus:border-primary-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-sm font-semibold rounded-2xl shadow-xl shadow-primary-900/40"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Updating Password...
                </>
              ) : (
                <>
                  Set New Password <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-gray-400 pt-3 border-t border-white/8">
            <Link to="/login" className="text-primary-400 font-semibold hover:text-primary-300 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
