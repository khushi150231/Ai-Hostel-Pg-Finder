import { useNavigate } from 'react-router-dom';
import {
  Building2, Sparkles, ShieldCheck, HeartHandshake,
  School, MapPin, Users, ArrowRight, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const About = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartFinding = () => {
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: '/find' },
          message: '⚠️ Please sign in or register first to explore Vadodara hostels.',
        },
      });
      return;
    }
    navigate('/find');
  };
  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/15 border border-primary-500/30 text-primary-300 text-xs sm:text-sm font-semibold shadow-xl">
            <Building2 className="w-4 h-4 text-primary-400" />
            <span>About StayNear Vadodara</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white">
            Transforming student accommodation in Vadodara with AI.
          </h1>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Every year, over 30,000 students relocate to Vadodara to study at institutions like Parul University, MS University, and ITM Universe. StayNear was born to eliminate broker extortion, unsafe PGs, and endless street hunting.
          </p>
        </div>

        {/* Mission Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-600/20 text-primary-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">AI Tailored Discovery</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              We analyze student commute routes, mess menus, budgets, and roommate preferences to recommend high-compatibility stays.
            </p>
          </div>

          <div className="card p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">100% Verified Inspections</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Every listed PG is vetted for CCTV cameras, clean washrooms, hygienic water filters, and active warden oversight.
            </p>
          </div>

          <div className="card p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-accent-500/20 text-accent-400 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Zero Brokerage Forever</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Students communicate directly with verified hostel owners. No commission fees, no hidden platform charges.
            </p>
          </div>
        </div>

        {/* Major Campus Coverage */}
        <div className="bg-dark-800/80 border border-white/8 rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-display font-bold text-2xl text-white">Vadodara College Clusters</h2>
            <p className="text-xs text-gray-400">We specialize in student accommodations surrounding:</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/8 space-y-2">
              <School className="w-6 h-6 text-amber-400 mx-auto" />
              <h4 className="font-bold text-white text-base">Parul University</h4>
              <p className="text-xs text-gray-400">Limda & Waghodia corridor with 40+ boys & girls PGs</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/8 space-y-2">
              <School className="w-6 h-6 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-white text-base">MS University (MSU)</h4>
              <p className="text-xs text-gray-400">Alkapuri, Fatehgunj, and Karelibaug historic student stays</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/8 space-y-2">
              <School className="w-6 h-6 text-violet-400 mx-auto" />
              <h4 className="font-bold text-white text-base">ITM Universe</h4>
              <p className="text-xs text-gray-400">Paldi & Jarod Highway accommodations with direct transport</p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary-400" />
            <h2 className="font-display font-bold text-2xl text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How does StayNear ensure that listings are authentic?',
                a: 'All PGs and hostels undergo physical address verification and warden verification before appearing on our search index.',
              },
              {
                q: 'Is StayNear free for students?',
                a: 'Yes! StayNear is 100% free for students. You pay rent directly to the property warden or owner without any intermediary cuts.',
              },
              {
                q: 'How does the AI Finder work?',
                a: 'You can write in plain English (e.g., "Need a single room near Parul with pure veg food under ₹6,500") and our algorithm matches your natural language requirements with hostel attributes.',
              },
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/8 space-y-1.5">
                <h4 className="font-semibold text-white text-sm">{faq.q}</h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center pt-8 border-t border-white/8">
          <button
            onClick={handleStartFinding}
            className="btn-primary text-sm px-8 py-3.5"
          >
            Start Finding Hostels in Vadodara <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;
