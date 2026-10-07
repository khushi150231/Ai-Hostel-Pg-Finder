import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Lock, School, BookOpen, Calendar,
  MapPin, Wallet, ArrowRight, Building2, AlertCircle, Loader2, Sparkles, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    college: 'Parul University',
    course: '',
    year: '1st Year',
    preferredLocation: '',
    budget: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        college: formData.college,
        course: formData.course,
        year: formData.year,
        preferredLocation: formData.preferredLocation,
        budget: formData.budget,
      });
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-dark-900 flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Aesthetic Student Dorm & Hostel Living Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1920&q=85"
          alt="Modern Hostel Dorm & Study Space"
          className="w-full h-full object-cover object-center filter brightness-[0.36] contrast-105 scale-105 animate-pulse-slow"
        />
        {/* Atmospheric layered gradients and light glows */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/80 to-dark-900/60" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-dark-900/50 to-dark-900" />
        {/* Soft glowing ambient light orbs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-12 left-12 w-[450px] h-[350px] bg-accent-500/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-10 w-[400px] h-[300px] bg-indigo-500/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-900/60 group-hover:scale-105 transition-all">
              <Building2 className="w-7 h-7 text-white" />
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-accent-400" />
            <span>Join Vadodara Student Community</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Create Student Account
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
            Discover verified PGs & hostels near Parul, MSU, and ITM Universe tailored to your budget
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="bg-dark-800/85 backdrop-blur-2xl p-6 sm:p-10 rounded-3xl border border-white/12 shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="text-xs text-gray-300 mb-1.5 block font-medium">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Arjun Patel"
                    className="w-full bg-dark-900/90 border border-white/15 focus:border-primary-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs text-gray-300 mb-1.5 block font-medium">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@example.com"
                    className="w-full bg-dark-900/90 border border-white/15 focus:border-primary-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs text-gray-300 mb-1.5 block font-medium">Mobile Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="98765 43210"
                    className="w-full bg-dark-900/90 border border-white/15 focus:border-primary-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* College */}
              <div>
                <label className="text-xs text-gray-300 mb-1.5 block font-medium">College / University *</label>
                <div className="relative">
                  <School className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <select
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    className="w-full bg-dark-900/90 border border-white/15 focus:border-primary-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer [&>option]:bg-dark-900"
                    required
                  >
                    <option value="Parul University">Parul University</option>
                    <option value="MS University">MS University (MSU)</option>
                    <option value="ITM Universe">ITM Universe</option>
                    <option value="Navrachana University">Navrachana University</option>
                    <option value="Sigma University">Sigma University</option>
                    <option value="GSFC University">GSFC University</option>
                    <option value="Other">Other Vadodara College</option>
                  </select>
                </div>
              </div>

              {/* Course */}
              <div>
                <label className="text-xs text-gray-300 mb-1.5 block font-medium">Degree / Course</label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="e.g. B.Tech CSE / BBA"
                    className="w-full bg-dark-900/90 border border-white/15 focus:border-primary-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Academic Year */}
              <div>
                <label className="text-xs text-gray-300 mb-1.5 block font-medium">Academic Year</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full bg-dark-900/90 border border-white/15 focus:border-primary-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer [&>option]:bg-dark-900"
                  >
                    <option value="1st Year">1st Year (Freshman)</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>

              {/* Preferred Location */}
              <div>
                <label className="text-xs text-gray-300 mb-1.5 block font-medium">Preferred Area in Vadodara</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="preferredLocation"
                    value={formData.preferredLocation}
                    onChange={handleChange}
                    placeholder="e.g. Fatehgunj, Waghodia Road, Sayajigunj"
                    className="w-full bg-dark-900/90 border border-white/15 focus:border-primary-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Monthly Budget */}
              <div>
                <label className="text-xs text-gray-300 mb-1.5 block font-medium">Target Monthly Budget (₹)</label>
                <div className="relative">
                  <Wallet className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="e.g. 7000"
                    className="w-full bg-dark-900/90 border border-white/15 focus:border-primary-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs text-gray-300 mb-1.5 block font-medium">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-dark-900/90 border border-white/15 focus:border-primary-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs text-gray-300 mb-1.5 block font-medium">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-dark-900/90 border border-white/15 focus:border-primary-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 pt-2">
              By creating an account, you agree to StayNear's Terms of Service and student privacy safeguards.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-sm font-semibold rounded-2xl mt-4 shadow-xl shadow-primary-900/40 hover:shadow-primary-700/50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  Register Student Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-gray-400 pt-3 border-t border-white/8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 font-semibold hover:text-primary-300 hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
