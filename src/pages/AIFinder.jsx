import { useSearchParams } from 'react-router-dom';
import { Sparkles, Brain, Bot, Compass, CheckCircle2 } from 'lucide-react';
import AIChat from '../components/AIChat';

export const AIFinder = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/15 border border-primary-500/30 text-primary-300 text-xs sm:text-sm font-semibold shadow-xl">
            <Sparkles className="w-4 h-4 text-accent-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>AI Accommodation Discovery</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white">
            Tell AI what you need.
          </h1>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Our AI scans all PG & hostel listings across Vadodara to match your exact budget, distance preferences, food habits, and amenities.
          </p>
        </div>

        {/* AI Capabilities Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/8 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary-500/20 text-primary-400 mt-0.5">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Campus Proximity</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Understands distances to Parul University, MS University & ITM Universe.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/8 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-accent-500/20 text-accent-400 mt-0.5">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Budget Calibration</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Understands ranges like "under ₹7,000" or "₹5,000 to ₹8,000".
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/8 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Match Percentiles</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Scores each accommodation with detailed explanation of why it fits.
              </p>
            </div>
          </div>
        </div>

        {/* Main AI Chat Interface Component */}
        <div className="animate-slide-up">
          <AIChat initialQuery={initialQuery} />
        </div>
      </div>
    </div>
  );
};

export default AIFinder;
