import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Bot, X, Send, ChevronRight, MapPin,
  CheckCircle2, DollarSign, Utensils, RefreshCw, MessageSquare
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';

const QUICK_PROMPTS = [
  '🎓 Girls PG near MSU with Food',
  '💎 Luxury Studio in Alkapuri / Gotri',
  '💰 Budget Boys Hostel near Parul under 8k',
  '🍽️ Hostels with Pure Veg Mess',
  '⚡ AC Single Room near SVIT Vasad',
  '🏢 Co-living space with High Speed WiFi',
];

export const FloatingAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: '👋 Hello! I am your **Vadodara AI Hostel Assistant**.\n\nAsk me anything about **hostels, curfew timings, mess food, rent & deposits, or area proximity** (e.g. *"Girls PG near MSU with food"* or *"What are gate timings?"* or *"Luxury AC room under 20k"*), and I will provide expert guidance and top verified stays!',
      recommendations: [],
    },
  ]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (queryText) => {
    const prompt = (queryText || input).trim();
    if (!prompt || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Format recent conversation history for multi-turn reasoning
      const history = messages.slice(-4).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const result = await aiService.sendChatMessage(prompt, history, currentFilters);

      if (result.updatedFilters) {
        setCurrentFilters(result.updatedFilters);
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.reply || `Here are the top verified hostel matches for "${prompt}":`,
        recommendations: (result.recommendations || []).map((r) => r.hostel || r).slice(0, 4),
        filters: result.updatedFilters,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.warn('[Floating AI Assistant] Chat error:', err.message);
      // Fallback to queryAI
      try {
        const fallbackRes = await aiService.queryAI(prompt);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: fallbackRes.summary || `Here are recommendations for "${prompt}":`,
            recommendations: (fallbackRes.recommendations || []).map((r) => r.hostel || r).slice(0, 4),
          },
        ]);
      } catch (innerErr) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-err-${Date.now()}`,
            sender: 'ai',
            text: 'I am ready to help! You can ask about curfew rules, pure veg mess food, room sharing rates, or Parul/MSU college hostels.',
            recommendations: [],
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentFilters({});
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: '👋 Chat cleared! Ask me anything about Vadodara student hostels, rent, food, or rules.',
        recommendations: [],
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 bg-[#FBF9F6] text-[#3E362E] border border-[#AC8968]/30 px-3.5 py-1.5 rounded-full shadow-lg text-xs font-semibold animate-bounce shadow-black/10">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
            <span>Need hostel help? Ask AI!</span>
          </div>
        )}

        <button
          id="floating-ai-button"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Open AI Hostel Finder Assistant"
          className="relative group p-3.5 sm:p-4 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-2xl shadow-primary-900/50 hover:from-primary-700 hover:to-primary-800 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/80"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <div className="relative">
              <Bot className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-400 border-2 border-white rounded-full animate-pulse" />
            </div>
          )}
        </button>
      </div>

      {/* AI Assistant Modal Window (Warm Brown & Cream Theme) */}
      {isOpen && (
        <div
          id="floating-ai-modal"
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[82vh] h-[600px] bg-[#FAF8F5] rounded-3xl shadow-2xl shadow-black/30 border border-[#AC8968]/30 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header - Warm Brown */}
          <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-800 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Sparkles className="w-5 h-5 text-primary-200" />
              </div>
              <div>
                <div className="font-bold text-sm sm:text-base leading-tight flex items-center gap-2">
                  Vadodara AI Hostel Finder
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium border border-white/30">
                    Live
                  </span>
                </div>
                <div className="text-primary-100 text-xs flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-accent-400"></span>
                  82+ Verified Vadodara Hostels
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Reset Chat"
                className="p-1.5 text-primary-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 text-primary-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions Bar */}
          <div className="bg-[#F5EFEA] border-b border-[#AC8968]/20 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-primary-900 uppercase tracking-wider whitespace-nowrap pl-1">
              Quick:
            </span>
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                disabled={loading}
                className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white text-primary-800 font-medium border border-primary-200 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all shadow-xs"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FBF9F6]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Text Bubble */}
                <div
                  className={`max-w-[88%] p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary-600 text-white rounded-2xl rounded-tr-none font-medium'
                      : 'bg-white text-[#3E362E] border border-[#AC8968]/20 rounded-2xl rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Recommendations Carousel / Cards */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="w-full mt-2.5 space-y-2">
                    <div className="text-[11px] font-bold text-primary-900 uppercase tracking-wider flex items-center gap-1 pl-1">
                      <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                      Top Recommended Hostels:
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {msg.recommendations.map((hostel) => (
                        <div
                          key={hostel._id || hostel.id}
                          className="bg-white rounded-xl border border-[#AC8968]/25 p-2.5 shadow-sm hover:border-primary-500 hover:shadow-md transition-all flex gap-3 group"
                        >
                          {/* Image */}
                          <img
                            src={hostel.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'}
                            alt={hostel.name}
                            className="w-20 h-20 rounded-lg object-cover bg-primary-50 flex-shrink-0"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400';
                            }}
                          />

                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="font-bold text-[#3E362E] text-xs truncate group-hover:text-primary-600 transition-colors">
                                  {hostel.name}
                                </h4>
                                {hostel.verified && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                                )}
                              </div>

                              <div className="flex items-center gap-1 text-[11px] text-accent-500 mt-0.5 truncate">
                                <MapPin className="w-3 h-3 text-accent-400 flex-shrink-0" />
                                <span>{hostel.address?.area || hostel.location?.area || 'Vadodara'}</span>
                                {hostel.distanceKm && (
                                  <span>• {hostel.distanceKm} km</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-primary-100">
                              <div className="text-xs font-bold text-primary-700">
                                ₹{(hostel.monthlyRent || hostel.startingPrice || 6000).toLocaleString('en-IN')}
                                <span className="text-[10px] text-accent-500 font-normal">/mo</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setIsOpen(false);
                                  const slug = hostel.slug || hostel._id || hostel.id;
                                  if (!user) {
                                    navigate('/login', {
                                      state: {
                                        from: { pathname: `/hostel/${slug}` },
                                        message: '⚠️ Please sign in or register first to view hostel details.',
                                      },
                                    });
                                    return;
                                  }
                                  navigate(`/hostel/${slug}`);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-800 bg-[#F5EFEA] px-2 py-0.5 rounded-md hover:bg-[#E8DED4] transition-colors"
                              >
                                View
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white border border-[#AC8968]/20 rounded-2xl rounded-tl-none w-fit text-primary-700 text-xs shadow-sm">
                <Sparkles className="w-4 h-4 animate-spin text-primary-600" />
                <span className="font-medium">Finding best student stays in Vadodara...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3 bg-white border-t border-[#AC8968]/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask e.g. Single AC room near MSU under 12k..."
                className="flex-1 bg-[#F5EFEA] text-[#3E362E] placeholder:text-accent-500 border border-[#AC8968]/30 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-primary-900/20"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-[10px] text-center text-accent-500 mt-1.5">
              Powered by StayNear AI Engine • Real-time Vadodara Hostels
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAIAssistant;
