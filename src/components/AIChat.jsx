import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { aiService } from '../services/aiService';
import HostelCard from './HostelCard';

const SAMPLE_PROMPTS = [
  "I need a boys PG near Parul University under ₹7,000 with food and Wi-Fi.",
  "Looking for a safe girls hostel near MS University with AC and security under ₹8,000.",
  "Find me single room PG near ITM Universe under ₹6,000 with meals included.",
  "Cheapest student hostel within 2 km of Parul with laundry and Wi-Fi.",
];

export const AIChat = ({ initialQuery = '' }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your Vadodara Student Accommodation AI Assistant. Tell me your college, budget, gender preference, and must-have amenities, and I'll find the best matching PGs and hostels.",
      recommendations: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = async (queryText = input) => {
    const textToSend = queryText.trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.queryAI(textToSend);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.summary,
        recommendations: response.recommendations || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I encountered an issue analyzing the hostels. Please try phrasing your request with details like college name, budget, and gender.",
        recommendations: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[750px] bg-dark-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 bg-dark-800/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-base sm:text-lg flex items-center gap-2">
              StayNear AI Advisor
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Online
              </span>
            </h3>
            <p className="text-xs text-gray-400">Trained on verified Vadodara PG & Hostel listings</p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome',
                sender: 'ai',
                text: "Hello! I am your Vadodara Student Accommodation AI Assistant. Tell me your college, budget, gender preference, and must-have amenities, and I'll find the best matching PGs and hostels.",
                recommendations: [],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Chat
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 max-w-4xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-br from-primary-500 to-indigo-600'
                  : 'bg-gradient-to-br from-purple-600 to-accent-500'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`space-y-3 flex-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
              <div
                className={`inline-block p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary-600 text-white text-left rounded-tr-none shadow-lg shadow-primary-900/30'
                    : 'bg-dark-800/90 text-gray-200 border border-white/10 rounded-tl-none shadow-lg'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <span className="block text-[10px] text-white/50 mt-1.5">
                  {msg.timestamp}
                </span>
              </div>

              {/* Recommendations Cards Grid */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="mt-4 space-y-4 text-left animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-400">
                    <Sparkles className="w-4 h-4" />
                    AI Match Results
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {msg.recommendations.map(({ hostel, matchPercent, reason }) => (
                      <HostelCard
                        key={hostel.id}
                        hostel={hostel}
                        matchPercent={matchPercent}
                        matchReason={reason}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3.5 max-w-md">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-accent-500 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-dark-800 border border-white/10 rounded-2xl rounded-tl-none p-4 flex items-center gap-3 text-sm text-gray-300">
              <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
              <span>Analyzing requirements & calculating matches...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested prompts if few messages */}
      {messages.length <= 2 && (
        <div className="px-4 sm:px-6 py-2 border-t border-white/6 bg-dark-950/40">
          <p className="text-xs text-gray-500 mb-2 font-medium">Quick suggestions to try:</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-xs text-left px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/40 text-gray-300 hover:text-white transition-all"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <div className="p-4 sm:p-5 bg-dark-800/80 backdrop-blur-md border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="e.g. I need a boys PG near Parul University under ₹7,000 with food..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-dark-900 border border-white/15 focus:border-primary-500 rounded-2xl px-4 sm:px-5 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 pr-10"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-primary py-3 px-5 text-sm rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <span className="hidden sm:inline">Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
