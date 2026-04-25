import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSession, submitAnswer, teachConcept } from "../services/api";
import { showToast } from "../components/Toast";
import FrictionHUD from "../components/FrictionHUD";
import { useAuth } from "../context/AuthContext";

export default function ResistantSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [answer, setAnswer] = useState("");
  const [confidence, setConfidence] = useState("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [teachMode, setTeachMode] = useState(false);
  const [teachAnswer, setTeachAnswer] = useState("");
  const [teachFeedback, setTeachFeedback] = useState(null);
  
  const endOfMessagesRef = useRef(null);

  const fetchSession = React.useCallback(async () => {
    try {
      const res = await getSession(id);
      setSession(res.data.session);
    } catch (err) {
      setError("Failed to load session");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [session?.iterations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await submitAnswer({ sessionId: id, answer, confidence });
      setSession(res.data.session);
      setAnswer("");
      setConfidence("medium");
    } catch (err) {
      console.error(err);
      alert("Failed to submit answer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeachSubmit = async (e) => {
    e.preventDefault();
    if (!teachAnswer.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await teachConcept({ sessionId: id, explanation: teachAnswer });
      setSession(res.data.session);
      setTeachFeedback(res.data);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || "Failed to evaluate explanation.";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh] bg-black">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">⚠️</div>
        <div className="text-gray-400 text-xl font-light mb-8">{error || "Session not found"}</div>
        <button onClick={() => navigate("/")} className="px-8 py-3 bg-white text-black font-bold rounded-xl uppercase tracking-widest text-xs">Return to Void</button>
      </div>
    );
  }

  const isCompleted = session.status === "completed";

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 font-sans pb-32">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-12 relative z-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-up">
          <div>
            <button 
              onClick={() => navigate("/")} 
              className="group text-gray-500 hover:text-white transition flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Dashboard
            </button>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
              Topic: <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 font-mono uppercase">{session.topic}</span>
            </h1>
          </div>
          <div className="w-full md:w-80">
            <FrictionHUD score={session.frictionScore} status={session.status} mode={session.mode} difficulty={session.difficultyLevel} />
          </div>
        </header>

        {/* Visual Anchor */}
        {session.imageUrl && (
          <div className="mb-12 relative group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative bg-black rounded-[1.8rem] overflow-hidden border border-white/5 shadow-2xl">
              <img 
                src={session.imageUrl} 
                alt={session.topic} 
                className={`w-full h-auto object-cover transition-all duration-1000 ${isCompleted ? 'scale-100' : 'scale-110 blur-[2px] grayscale-[40%] contrast-125 opacity-70 group-hover:scale-100 group-hover:blur-0 group-hover:grayscale-0 group-hover:opacity-100'}`}
              />
              {!isCompleted && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
                  <p className="text-xs font-mono text-gray-400 uppercase tracking-[0.3em] bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                    Aesthetic Enigma: Decipher the conceptual layer
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Final Explanation (Unlocked) */}
        {isCompleted ? (
          <div className="bg-[#0f0f0f] border border-green-500/20 rounded-[2rem] p-10 md:p-12 shadow-[0_30px_60px_rgba(34,197,94,0.05)] animate-fade-in-up">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-2xl border border-green-500/20">🔓</div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Clarity Achieved</h2>
                <p className="text-xs text-green-500 uppercase font-bold tracking-widest mt-1">Concept Fully Integrated</p>
              </div>
            </div>
            <div className="text-gray-400 text-lg leading-relaxed space-y-6 font-light">
              {session.finalExplanation.split('\n\n').map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
            <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
              <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">Cognitive Record #{id.slice(-6)}</span>
              <button onClick={() => navigate("/")} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition">Start New Conquest →</button>
            </div>
          </div>
        ) : (
          /* Iteration Flow */
          <div className="space-y-12">
            {session.iterations.length > 0 && (
              <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] flex items-center gap-4">
                  <span>Confrontation Log</span>
                  <div className="h-px flex-1 bg-white/5"></div>
                </h3>
                
                {session.iterations.map((iter, idx) => (
                  <div key={idx} className="group/item relative">
                    <div className="absolute left-[-1.5rem] top-0 bottom-0 w-px bg-white/5 group-hover/item:bg-indigo-500/30 transition-colors"></div>
                    <div className="bg-[#0f0f0f]/40 border border-white/5 rounded-2xl p-8 transition-all hover:bg-[#0f0f0f] hover:border-white/10">
                      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${iter.frictionScoreDelta > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {iter.frictionScoreDelta > 0 ? '+' : ''}{iter.frictionScoreDelta}
                          </div>
                          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Point Delta</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Claimed Confidence:</span>
                           <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-black tracking-widest ${
                             iter.confidence === 'high' ? 'border-red-500/30 text-red-400 bg-red-900/10' :
                             iter.confidence === 'low' ? 'border-green-500/30 text-green-400 bg-green-900/10' :
                             'border-yellow-500/30 text-yellow-400 bg-yellow-900/10'
                           }`}>
                             {iter.confidence}
                           </span>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-3">User Proposition</span>
                          <p className="text-gray-300 font-light italic leading-relaxed pl-4 border-l border-indigo-500/20">"{iter.userAnswer}"</p>
                        </div>
                        
                        <div className="bg-[#050505] border border-red-500/10 p-6 rounded-xl">
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-3">AI Deconstruction (Resist)</span>
                          <p className="text-gray-400 text-sm leading-relaxed font-light">{iter.aiCritique}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={endOfMessagesRef} />
              </div>
            )}

            {/* Input Arena */}
            {!teachMode ? (
              <form onSubmit={handleSubmit} className="bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="mb-8">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6 ml-1">
                    {session.iterations.length === 0 ? "Initial Synthesis" : "Iterative Refinement"}
                  </label>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full bg-[#050505] border border-white/5 rounded-2xl p-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none text-lg font-light leading-relaxed placeholder:text-gray-800"
                    rows="4"
                    placeholder="Submit your interpretation of the concept..."
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <div className="space-y-8">
                  {/* CONFIDENCE CHECKER - High Visibility */}
                  <div className="p-6 bg-black rounded-2xl border border-white/5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Subjective Certainty</label>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Accuracy x Confidence = Score Impact</p>
                      </div>
                      <div className="flex bg-[#0f0f0f] p-1.5 rounded-xl border border-white/5">
                        {['low', 'medium', 'high'].map(lvl => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setConfidence(lvl)}
                            className={`px-6 py-2.5 rounded-lg text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-300 ${
                              confidence === lvl 
                                ? (lvl === 'high' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                                   : lvl === 'low' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                   : 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]')
                                : 'text-gray-600 hover:text-gray-400'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                    {confidence === 'high' && (
                      <div className="mt-4 flex items-center gap-2 text-red-500/80 animate-pulse">
                        <span className="text-xs">⚠️</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest">Warning: High confidence in a flawed premise results in friction penalty.</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Protocol Status Indicator */}
                  <div className="flex items-center justify-between mb-6 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${session.iterations.length >= 3 ? 'bg-indigo-500 animate-pulse' : 'bg-gray-700'}`}></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                        Neural Protocol: <span className="text-white">{session.iterations.length}/3 Iterations</span>
                      </span>
                    </div>
                    {session.iterations.length >= 3 && (
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 animate-bounce">
                        Gateway Open →
                      </span>
                    )}
                  </div>

                  {session.iterations.length >= 3 && (
                    <button
                      type="button"
                      onClick={() => setTeachMode(true)}
                      className="w-full mb-8 px-8 py-5 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/40 text-indigo-400 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-600/30 transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(99,102,241,0.15)] group"
                    >
                      <span className="group-hover:tracking-[0.4em] transition-all">Initiate Mastery Protocol</span>
                    </button>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
                    {/* Mastery button removed from here */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !answer.trim()}
                      className="flex-1 px-8 py-4 bg-white text-black font-black text-[11px] uppercase tracking-[0.25em] rounded-xl shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.2)] hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-20 flex justify-center items-center gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                          Analyzing Synthesis...
                        </>
                      ) : (
                        <>Submit Interpretation →</>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Teach Mode */
              <div className="bg-[#0f0f0f] border border-indigo-500/20 rounded-[2.5rem] p-10 md:p-12 shadow-[0_30px_60px_rgba(99,102,241,0.1)] mt-8 animate-fade-in-up">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-2xl border border-indigo-500/20">🎓</div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">The Teaching Phase</h3>
                    <p className="text-xs text-indigo-400 uppercase font-bold tracking-widest mt-1">Demonstrate Mastery</p>
                  </div>
                </div>
                
                <p className="text-gray-400 mb-8 font-light leading-relaxed">
                  To earn the final clarity, you must now reverse the roles. Explain the concept of <span className="text-white font-mono font-bold uppercase">{session.topic}</span> as if you were the architect of its understanding.
                </p>
                
                {teachFeedback && !teachFeedback.unlocked && (
                  <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-6 rounded-2xl mb-8 flex gap-4 items-start">
                    <span className="text-xl">⛔</span>
                    <div>
                      <strong className="block text-[11px] uppercase tracking-widest mb-1">Deconstruction Failed:</strong>
                      <p className="text-sm font-light italic">{teachFeedback.feedback}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleTeachSubmit} className="space-y-8">
                  <textarea
                    value={teachAnswer}
                    onChange={(e) => setTeachAnswer(e.target.value)}
                    className="w-full bg-[#050505] border border-white/5 rounded-2xl p-8 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all mb-4 text-lg font-light leading-relaxed placeholder:text-gray-800"
                    rows="6"
                    placeholder="Your complete deconstruction of the concept..."
                    disabled={isSubmitting}
                    required
                  />
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setTeachMode(false)}
                      className="px-8 py-4 bg-transparent text-gray-500 font-bold text-[10px] uppercase tracking-widest hover:text-white transition-all"
                      disabled={isSubmitting}
                    >
                      ← Back to Iteration
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !teachAnswer.trim()}
                      className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] uppercase tracking-[0.25em] rounded-xl shadow-[0_10px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_15px_40px_rgba(99,102,241,0.5)] transition-all active:scale-95"
                    >
                      {isSubmitting ? "Evaluating Depth..." : "Force Unlock Clarity →"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
