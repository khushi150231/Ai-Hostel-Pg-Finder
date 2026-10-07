import { Link, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, Instagram, Twitter, Facebook, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProtectedLink = (e, to, label) => {
    if (to === '/about' || to === '/privacy' || to === '/terms' || to === '/register' || to === '/') {
      return;
    }
    if (!user) {
      e.preventDefault();
      navigate('/login', {
        state: {
          from: { pathname: to },
          message: `⚠️ Please sign in or register first to access ${label}.`,
        },
      });
    }
  };

  return (
    <footer className="bg-dark-900 border-t border-white/8 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-display font-bold text-white text-xl">StayNear</div>
                <div className="text-primary-400 text-xs font-medium">AI Hostel Finder</div>
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              AI-powered PG and hostel discovery for students in Vadodara. Find your perfect stay in minutes.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-white/6 hover:bg-primary-500/20 hover:text-primary-400 text-gray-400 rounded-xl flex items-center justify-center transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/find', label: 'Find Hostel' },
                { to: '/ai-finder', label: 'AI Finder' },
                { to: '/compare', label: 'Compare' },
                { to: '/favourites', label: 'My Favourites' },
                { to: '/about', label: 'About Us' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={(e) => handleProtectedLink(e, to, label)}
                    className="text-gray-500 hover:text-primary-400 text-sm transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Popular Areas</h4>
            <ul className="space-y-2.5">
              {['Gotri', 'Alkapuri', 'Waghodia Road', 'Fatehgunj', 'Sama Road', 'Karelibaug', 'Limda', 'Manjalpur'].map((area) => (
                <li key={area}>
                  <Link
                    to={`/find?area=${area}`}
                    onClick={(e) => handleProtectedLink(e, `/find?area=${area}`, `${area} Hostels`)}
                    className="text-gray-500 hover:text-primary-400 text-sm transition-colors flex items-center gap-1.5 group"
                  >
                    <MapPin className="w-3 h-3" />
                    {area}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-500 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0 text-primary-500" />
                Vadodara, Gujarat 390001
              </li>
              <li>
                <a href="tel:+919876543210" className="flex items-center gap-3 text-gray-500 hover:text-white text-sm transition-colors">
                  <Phone className="w-4 h-4 flex-shrink-0 text-primary-500" />
                  +91 98765 43210
                </a>
              </li>
              <li>
                <a href="mailto:hello@staynear.in" className="flex items-center gap-3 text-gray-500 hover:text-white text-sm transition-colors">
                  <Mail className="w-4 h-4 flex-shrink-0 text-primary-500" />
                  hello@staynear.in
                </a>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-primary-500/8 border border-primary-500/20 rounded-xl">
              <p className="text-primary-400 text-sm font-medium mb-1">List Your Property</p>
              <p className="text-gray-500 text-xs mb-3">Are you a hostel owner? Get listed on StayNear for free.</p>
              <Link to="/register" className="text-primary-400 text-xs font-semibold hover:text-primary-300 flex items-center gap-1">
                Register as Owner <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/6 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © 2026 StayNear. Built for students of Vadodara.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
