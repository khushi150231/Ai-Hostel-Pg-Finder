import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu, X, Search, Brain, Scale, Heart, Info,
  User, LogOut, ChevronDown, Building2, Shield,
  Lock, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

const NAV_ITEMS = [
  { to: '/find', label: 'Find Hostel', icon: Search, isProtected: true },
  { to: '/ai-finder', label: 'AI Finder', icon: Brain, isProtected: true },
  { to: '/compare', label: 'Compare', icon: Scale, isProtected: true },
  { to: '/favourites', label: 'Favourites', icon: Heart, isProtected: true },
  { to: '/about', label: 'About', icon: Info, isProtected: false },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authAlertItem, setAuthAlertItem] = useState(null);

  const { user, logout, isAdmin } = useAuth();
  const { compareList, favourites } = useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleNavClick = (e, item) => {
    if (item.isProtected && !user) {
      e.preventDefault();
      setAuthAlertItem(item);
    }
  };

  const proceedToLogin = (item) => {
    setAuthAlertItem(null);
    setMobileOpen(false);
    navigate('/login', {
      state: {
        from: { pathname: item?.to || '/find' },
        message: `⚠️ Please sign in or register first to access ${item?.label || 'this section'}.`,
      },
    });
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Simple & Clean Sign-In Required Popup */}
      {authAlertItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-dark-800 border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4 relative animate-scale-in">
            {/* Close Icon Button */}
            <button
              onClick={() => setAuthAlertItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Icon + Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Sign In Required</h3>
                <p className="text-xs text-gray-400">{authAlertItem.label}</p>
              </div>
            </div>

            {/* Message Body */}
            <p className="text-sm text-gray-300 leading-relaxed">
              Please sign in to your account first to access <strong>{authAlertItem.label}</strong> and explore verified student accommodations.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setAuthAlertItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/8 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => proceedToLogin(authAlertItem)}
                className="btn-primary text-xs py-2 px-4 shadow-md"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-dark-900/95 backdrop-blur-xl border-b border-white/8 shadow-2xl shadow-black/50'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo Anchor (Home) */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/50 group-hover:scale-105 transition-all">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-display font-bold text-white text-lg leading-tight flex items-center gap-1.5">
                  StayNear
                  <span className="text-[10px] bg-primary-500/20 text-primary-300 border border-primary-500/30 px-1.5 py-0.2 rounded font-medium">
                    Vadodara
                  </span>
                </div>
                <div className="text-primary-400 text-[10px] font-medium leading-tight -mt-0.5">
                  AI Hostel Finder
                </div>
              </div>
            </Link>

            {/* Desktop Navigation (Clean, Normal Links) */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const badgeCount =
                  item.label === 'Compare'
                    ? compareList.length
                    : item.label === 'Favourites'
                    ? favourites.length
                    : 0;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={(e) => handleNavClick(e, item)}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                        isActive && user
                          ? 'text-white bg-primary-500/15 border border-primary-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/6'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 text-primary-400" />
                    <span>{item.label}</span>
                    {badgeCount > 0 && (
                      <span
                        className={`w-4 h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center ${
                          item.label === 'Favourites' ? 'bg-rose-500' : 'bg-primary-500'
                        }`}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Right Side: User Profile or Login/Register */}
            <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/8 border border-white/12 hover:bg-white/12 hover:border-white/20 transition-all"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-white text-sm font-medium max-w-24 truncate">
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-dark-800 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-slide-down z-50">
                      <div className="px-4 py-3 border-b border-white/8">
                        <div className="text-white font-medium text-sm truncate">{user.name}</div>
                        <div className="text-gray-400 text-xs truncate">{user.email}</div>
                        <span className="mt-1 inline-block text-[10px] bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded-full font-semibold">
                          {user.role?.toUpperCase() || 'STUDENT'}
                        </span>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/6 transition-colors text-sm"
                        >
                          <User className="w-4 h-4 text-primary-400" /> Dashboard
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-amber-400 hover:text-amber-300 hover:bg-white/6 transition-colors text-sm"
                          >
                            <Shield className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-400 hover:text-rose-300 hover:bg-white/6 transition-colors text-sm text-left"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="btn-secondary text-sm py-2 px-4 border border-white/15"
                  >
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4 shadow-lg shadow-primary-900/40">
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/8 transition-all"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-dark-900/98 backdrop-blur-2xl border-t border-white/10 animate-slide-down">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const badgeCount =
                  item.label === 'Compare'
                    ? compareList.length
                    : item.label === 'Favourites'
                    ? favourites.length
                    : 0;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={(e) => {
                      if (item.isProtected && !user) {
                        e.preventDefault();
                        setAuthAlertItem(item);
                        setMobileOpen(false);
                      } else {
                        setMobileOpen(false);
                      }
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive && user
                          ? 'text-white bg-primary-500/15 border border-primary-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/6'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 text-primary-400" />
                    <span>{item.label}</span>
                    {badgeCount > 0 && (
                      <span
                        className={`ml-auto w-5 h-5 text-white text-xs font-bold rounded-full flex items-center justify-center ${
                          item.label === 'Favourites' ? 'bg-rose-500' : 'bg-primary-500'
                        }`}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </NavLink>
                );
              })}

              <div className="pt-3 border-t border-white/8 flex flex-col gap-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{user.name}</div>
                        <div className="text-gray-400 text-xs">{user.email}</div>
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white rounded-xl hover:bg-white/6 text-sm"
                    >
                      <User className="w-4 h-4 text-primary-400" /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-rose-400 rounded-xl hover:bg-white/6 text-sm w-full text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="btn-secondary justify-center text-sm py-2.5"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="btn-primary justify-center text-sm py-2.5"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
