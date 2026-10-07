import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Building2, AlertCircle, Loader2, Sparkles, Shield, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const location = useLocation();
  const [email, setEmail] = useState('student@test.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(location.state?.message || '');

  const { login } = useAuth();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname;

  const performLogin = async (loginEmail, loginPassword) => {
    setErrorMessage('');
    setLoading(true);

    try {
      const result = await login({ email: loginEmail, password: loginPassword });
      const role = (result.user?.role || '').toLowerCase();

      if (from) {
        navigate(from, { replace: true });
      } else if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    await performLogin(demoEmail, demoPassword);
  };

  return (
    <div className="relative min-h-screen bg-dark-900 flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Distinct Student PG Room Background with Warm Ambient Lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1920&q=85"
          alt="Modern Student PG Room in Vadodara"
          className="w-full h-full object-cover object-center filter brightness-[0.38] contrast-105 scale-105 animate-pulse-slow"
        />
        {/* Atmospheric layered gradients and light glows */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/80 to-dark-900/60" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-dark-900/50 to-dark-900" />
        {/* Soft glowing ambient light orbs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-primary-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-12 right-12 w-[450px] h-[320px] bg-accent-500/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-10 w-[350px] h-[250px] bg-indigo-500/15 rounded-full blur-[90px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-900/60 group-hover:scale-105 transition-all">
              <Building2 className="w-7 h-7 text-white" />
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-accent-400" />
            <span>StayNear Vadodara Portal</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Welcome back
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-sm mx-auto">
            Sign in to access your saved hostels, AI recommendations & inquiries in Vadodara
          </p>
        </div>

        {/* 1-Click Demo Login Bar */}
        <div className="p-4 bg-dark-800/80 backdrop-blur-xl border border-primary-500/30 rounded-3xl shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-300">
              <Sparkles className="w-4 h-4 text-accent-400" />
              <span>Instant 1-Click Demo Logins:</span>
            </div>
            <span className="text-[10px] text-gray-400">Ready to test</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('student@test.com', 'password')}
              disabled={loading}
              className="px-3.5 py-2.5 bg-gradient-to-r from-primary-600/30 to-primary-800/30 hover:from-primary-600/50 hover:to-primary-800/50 border border-primary-500/40 hover:border-primary-400 rounded-2xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <span>🎓 Student Login</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@test.com', 'admin123')}
              disabled={loading}
              className="px-3.5 py-2.5 bg-gradient-to-r from-amber-600/20 to-amber-800/20 hover:from-amber-600/40 hover:to-amber-800/40 border border-amber-500/40 hover:border-amber-400 rounded-2xl text-xs font-semibold text-amber-300 flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="bg-dark-800/85 backdrop-blur-2xl p-7 sm:p-8 rounded-3xl border border-white/12 shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-300 mb-1.5 block font-medium">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@test.com"
                  className="w-full bg-dark-900/90 border border-white/15 focus:border-primary-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-gray-300 font-medium">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-900/90 border border-white/15 focus:border-primary-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-sm font-semibold rounded-2xl mt-2 shadow-xl shadow-primary-900/40 hover:shadow-primary-700/50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-gray-400 pt-3 border-t border-white/8">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 font-semibold hover:text-primary-300 hover:underline">
              Register as Student
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
