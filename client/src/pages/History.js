import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSessions, getPdfSessions } from "../services/api";
import { showToast } from "../components/Toast";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Resistant-AI session card
// ─────────────────────────────────────────────────────────────────────────────
function ResistantCard({ session, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden hover:border-indigo-500/30 transition-all cursor-pointer shadow-xl hover:shadow-indigo-500/10 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="h-44 relative overflow-hidden bg-black flex-shrink-0">
        {session.imageUrl ? (
          <img
            src={session.imageUrl}
            alt={session.topic}
            className="w-full h-full object-cover grayscale-[30%] opacity-60 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-800 text-6xl">🧠</div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full backdrop-blur-md border ${
            session.status === "completed"
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
              : "bg-indigo-500/20 text-indigo-400 border-indigo-500/20"
          }`}>
            {session.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-7 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black tracking-tight group-hover:text-indigo-400 transition-colors uppercase truncate">
              {session.topic}
            </h3>
            <p className="text-[10px] text-gray-600 font-mono mt-1">{formatDate(session.createdAt)}</p>
          </div>
          <div className="text-right ml-3 flex-shrink-0">
            <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Friction</p>
            <p className="text-xl font-black text-white font-mono">{session.frictionScore}</p>
          </div>
        </div>

        {/* Iterations summary */}
        {session.iterations?.length > 0 && (
          <div className="mt-auto pt-4 border-t border-white/5 space-y-2">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
              {session.iterations.length} iteration{session.iterations.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-1 max-h-20 overflow-hidden">
              {session.iterations.slice(-2).map((iter, i) => (
                <p key={i} className="text-[10px] text-gray-500 italic truncate">
                  "{iter.userAnswer}"
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
          <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-[10px]">
            {session.mode === "Strict Teacher" ? "📏" : session.mode === "Socratic" ? "🤔" : session.mode === "Scientist" ? "🔬" : "🔥"}
          </div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{session.mode}</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF session card
// ─────────────────────────────────────────────────────────────────────────────
function PdfCard({ session }) {
  const [expanded, setExpanded] = useState(false);
  const passedCPs = session.checkpoints?.filter(cp => cp.status === "passed") || [];
  const totalCPs = session.checkpoints?.length || 0;
  const pct = session.actualUnderstanding ?? 0;

  return (
    <div className="group bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden hover:border-purple-500/20 transition-all shadow-xl">
      {/* Header */}
      <div className="p-7">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-purple-400 text-lg">📄</span>
              <h3 className="text-base font-black tracking-tight text-white truncate">{session.lectureFileName}</h3>
            </div>
            <p className="text-[10px] text-gray-600 font-mono">{formatDate(session.createdAt)}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Actual</p>
            <p className={`text-xl font-black font-mono ${pct >= 70 ? "text-emerald-400" : pct >= 40 ? "text-yellow-400" : "text-red-400"}`}>{pct}%</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2 mb-5">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-600">
            <span>Pages Completed</span>
            <span>{session.currentPage} / {session.totalPageCount}</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex gap-0.5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`h-full flex-1 transition-all duration-700 ${
                (i + 1) * 10 <= Math.round((session.currentPage / (session.totalPageCount || 1)) * 100)
                  ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                  : "bg-white/5"
              }`} />
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-black/40 rounded-xl p-3 border border-white/5">
            <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1">Checkpoints</p>
            <p className="text-base font-black text-white font-mono">{passedCPs.length}<span className="text-[10px] text-gray-600">/{totalCPs}</span></p>
          </div>
          <div className="bg-black/40 rounded-xl p-3 border border-white/5">
            <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1">Perceived</p>
            <p className="text-base font-black text-indigo-400 font-mono">{session.perceivedUnderstanding}%</p>
          </div>
          <div className="bg-black/40 rounded-xl p-3 border border-white/5">
            <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1">Overconf.</p>
            <p className={`text-base font-black font-mono ${(session.overconfidenceLevel ?? 0) > 20 ? "text-red-400" : "text-emerald-400"}`}>
              +{session.overconfidenceLevel ?? 0}%
            </p>
          </div>
        </div>

        {/* Weak topics */}
        {session.weakTopics?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {session.weakTopics.slice(0, 4).map((t, i) => (
              <span key={i} className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] rounded font-black italic uppercase">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Checkpoint history toggle */}
      {passedCPs.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full flex items-center justify-between px-7 py-3 border-t border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white"
          >
            <span>Answer History ({passedCPs.length})</span>
            <span className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>▾</span>
          </button>

          {expanded && (
            <div className="px-7 pb-7 space-y-5 animate-fade-in-up border-t border-white/5">
              {passedCPs.map((cp, idx) => (
                <div key={idx} className="pt-5 border-l-2 border-purple-500/20 pl-4 space-y-3">
                  {/* Score badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                      Checkpoint {idx + 1} · pg {cp.pageNumber}
                    </span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                      (cp.score ?? 0) >= 70
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      SCORE: {cp.score ?? 0}%
                    </span>
                  </div>

                  {/* Question */}
                  <div>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Question</p>
                    <p className="text-[11px] text-gray-300 italic leading-relaxed">"{cp.creativeQuestion}"</p>
                  </div>

                  {/* User's answer */}
                  <div>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Your Answer</p>
                    <p className="text-[11px] text-gray-400 bg-white/5 border border-white/5 rounded-xl p-3 italic leading-relaxed">
                      "{cp.userAnswer}"
                    </p>
                  </div>

                  {/* AI critique / suggestions */}
                  {cp.aiCritique && (
                    <div className={`rounded-xl p-4 border space-y-1 ${
                      (cp.score ?? 0) < 70
                        ? "bg-red-500/5 border-red-500/20"
                        : "bg-indigo-500/5 border-indigo-500/10"
                    }`}>
                      <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${
                        (cp.score ?? 0) < 70 ? "text-red-400" : "text-indigo-400"
                      }`}>
                        {(cp.score ?? 0) < 70 ? "⚠ AI Suggestion" : "✦ AI Feedback"}
                      </p>
                      <p className="text-[10px] text-gray-400 leading-relaxed font-light italic">{cp.aiCritique}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main History page
// ─────────────────────────────────────────────────────────────────────────────
export default function History() {
  const [tab, setTab] = useState("resistant"); // "resistant" | "pdf"
  const [resistantSessions, setResistantSessions] = useState([]);
  const [pdfSessions, setPdfSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, pRes] = await Promise.all([getSessions(), getPdfSessions()]);
      setResistantSessions(rRes.data.sessions || []);
      setPdfSessions(pRes.data.sessions || []);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else showToast("Failed to load history.", "error");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { load(); }, [load]);

  const activeCount = tab === "resistant" ? resistantSessions.length : pdfSessions.length;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 font-sans pb-32">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 blur-[150px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-16 relative z-10">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-in-up">
          <div className="space-y-3">
            <h1 className="text-5xl font-black tracking-tighter">
              Learning <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Archive</span>
            </h1>
            <p className="text-gray-500 font-light max-w-xl">
              Your complete record of cognitive friction — resistant sessions and PDF lockdown deconstructions.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-lg hover:shadow-white/10 hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
          >
            Start New Conquest →
          </button>
        </header>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-10 p-1.5 bg-[#0a0a0a] border border-white/5 rounded-2xl w-fit">
          {[
            { id: "resistant", label: "Resistant AI", icon: "🧠", count: resistantSessions.length },
            { id: "pdf", label: "PDF Lockdown", icon: "📄", count: pdfSessions.length },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                tab === t.id
                  ? t.id === "resistant"
                    ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                    : "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ml-1 ${
                tab === t.id ? "bg-white/20" : "bg-white/5 text-gray-600"
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeCount === 0 ? (
          <div className="text-center py-32 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] animate-fade-in-up">
            <div className="text-5xl mb-6 opacity-30">{tab === "resistant" ? "🧠" : "📄"}</div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">No {tab === "resistant" ? "Resistant AI" : "PDF Lockdown"} sessions yet.</h3>
            <p className="text-gray-600 mb-8">Begin a session to build your archive.</p>
            <button
              onClick={() => navigate(tab === "pdf" ? "/pdf-mode" : "/")}
              className="px-6 py-2 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              {tab === "resistant" ? "Start Resistant Session" : "Upload PDF"}
            </button>
          </div>
        ) : tab === "resistant" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {resistantSessions.map(s => (
              <ResistantCard key={s._id} session={s} onClick={() => navigate(`/session/${s._id}`)} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up">
            {pdfSessions.map(s => (
              <PdfCard key={s._id} session={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
