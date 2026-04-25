import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startSession } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../components/Toast";

const MODES = [
  { id: "Strict Teacher", label: "Strict Teacher", desc: "Critical feedback, points out flaws instantly.", icon: "📏", color: "from-red-500/20 to-red-900/20", border: "border-red-500/30" },
  { id: "Socratic", label: "Socratic", desc: "Answers questions with more questions.", icon: "🤔", color: "from-blue-500/20 to-blue-900/20", border: "border-blue-500/30" },
  { id: "Devil's Advocate", label: "Devil's Advocate", desc: "Challenges your logic, takes the opposing view.", icon: "🔥", color: "from-orange-500/20 to-orange-900/20", border: "border-orange-500/30" },
  { id: "Scientist", label: "Scientist", desc: "Demands logical proof and structured explanations.", icon: "🔬", color: "from-emerald-500/20 to-emerald-900/20", border: "border-emerald-500/30" },
];

const SUGGESTIONS = [
  "Binary Tree", "Quantum Entanglement", "Photosynthesis", 
  "The French Revolution", "Recursion", "Black Holes"
];

export default function Dashboard() {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("Strict Teacher");
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (user) refreshUser();
  }, [refreshUser]);

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    if (!topic.trim()) { showToast("Please enter a topic.", "error"); return; }
    
    setLoading(true);
    try {
      const res = await startSession({ topic: topic.trim(), mode });
      const sessionId = res.data.session._id;
      navigate(`/session/${sessionId}`);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to initialize learning session.";
      showToast(msg, "error");
      setLoading(false);
    }
  };

  // Capacity Percentage Calculation
  const capacityPct = user ? Math.min(Math.round(user.dailyCognitiveUsage || 0), 100) : 0;
  const capacityLevel = capacityPct > 80 ? "Critical Load" : capacityPct > 40 ? "Optimal Stress" : "Low Engagement";
  const capacityColor = capacityPct > 80 ? "text-red-400" : capacityPct > 40 ? "text-indigo-400" : "text-emerald-400";

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 pt-16 pb-24 relative z-10">
        
        <header className="text-center mb-20 space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase mb-2">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            Cognitive Friction Active
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
              Resistant AI
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            The anti-assistant. A crucible for deep thought that <span className="text-white font-medium italic">resists</span> clarity until you earn it.
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Main Card */}
          <div className="lg:col-span-7 bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
            <div className="bg-[#0a0a0a] rounded-[22px] p-8 md:p-10">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">🧠</span>
                Start New Session
              </h2>

              <form onSubmit={handleStartSession} className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                    What concept shall we deconstruct?
                  </label>
                  <div className="relative group/input">
                    <input
                      type="text"
                      className="w-full bg-[#050505] border border-white/5 rounded-2xl p-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xl font-light placeholder:text-gray-700"
                      placeholder='e.g. "Quantum Mechanics"'
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      disabled={loading}
                    />
                    <div className="absolute inset-0 rounded-2xl border border-indigo-500/0 group-focus-within/input:border-indigo-500/20 pointer-events-none transition-all"></div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="text-[10px] px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full border border-white/5 transition-all uppercase tracking-wider font-bold"
                        onClick={() => setTopic(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Select AI Personality
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MODES.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMode(m.id)}
                        className={`text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group/btn ${
                          mode === m.id 
                            ? `${m.border} bg-gradient-to-br ${m.color}` 
                            : 'border-white/5 bg-[#050505] hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2 relative z-10">
                          <span className="text-2xl">{m.icon}</span>
                          <span className={`font-bold tracking-tight ${mode === m.id ? 'text-white' : 'text-gray-400'}`}>{m.label}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed relative z-10">{m.desc}</p>
                        {mode === m.id && (
                          <div className="absolute top-2 right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !topic.trim()}
                  className="relative w-full py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] text-white font-black text-sm uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] hover:bg-right transition-all duration-500 italic overflow-hidden group flex justify-center items-center gap-3"
                >
                  <div className="relative z-10 flex items-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>Architecting Visuals...</span>
                      </>
                    ) : (
                      <span className="flex items-center gap-3 group-hover:gap-5 transition-all duration-300">
                        Initialize Learning Loop 
                        <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-indigo-500/20 blur-xl"></div>
                </button>
              </form>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Cognitive Capacity HUD */}
            <div className="bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none text-6xl">🌀</div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="p-2 bg-purple-500/10 rounded-lg text-purple-400 text-sm">🧠</span>
                Capacity Usage
              </h3>
              
              {user ? (
                <div className="space-y-8">
                  <div className="relative pt-4 pb-2 text-center">
                    {/* Radial Progress Concept */}
                    <div className="text-6xl font-black font-mono tracking-tighter mb-2">
                      {capacityPct}<span className="text-2xl opacity-40">%</span>
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${capacityColor}`}>
                      {capacityLevel}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-6 font-light">
                      "You have utilized <span className="text-white font-bold">{capacityPct}%</span> of your cognitive capacity today."
                    </p>
                  </div>

                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                    {[...Array(20)].map((_, i) => (
                      <div 
                        key={i}
                        className={`h-full flex-1 transition-all duration-1000 delay-${i * 50} ${
                          (i + 1) * 5 <= capacityPct ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-white/5'
                        }`}
                      ></div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Total Friction</p>
                      <p className="text-lg font-black font-mono">{user.globalFrictionScore || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Global Rank</p>
                      <p className="text-lg font-black font-mono text-indigo-400">#{(user.globalFrictionScore || 0) > 1000 ? "S" : "A"}-CLASS</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 space-y-6">
                  <p className="text-sm text-gray-500 leading-relaxed font-light italic">"The limits of my language mean the limits of my world."</p>
                  <button onClick={() => navigate("/login")} className="w-full py-3 bg-[#151515] hover:bg-[#1a1a1a] border border-white/5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">
                    Unlock Capacity Stats
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0f0f0f]/50 border border-white/5 rounded-2xl p-6 hover:bg-[#0f0f0f]/80 transition-colors group/card">
                <div className="text-2xl mb-4 group-hover:scale-110 transition-transform">👁️</div>
                <h4 className="font-bold text-gray-200 text-[10px] uppercase tracking-widest mb-2">Visual Logic</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed font-light">Bypass verbal centers. Decode pure concept art before seeking words.</p>
              </div>
              <div className="bg-[#0f0f0f]/50 border border-white/5 rounded-2xl p-6 hover:bg-[#0f0f0f]/80 transition-colors group/card">
                <div className="text-2xl mb-4 group-hover:scale-110 transition-transform">🌪️</div>
                <h4 className="font-bold text-gray-200 text-[10px] uppercase tracking-widest mb-2">Reconstruction</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed font-light">AI destroys weak reasoning. Force your brain to rebuild from ground up.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
