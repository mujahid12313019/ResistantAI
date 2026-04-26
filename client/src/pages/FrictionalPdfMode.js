import React, { useState } from "react";
import { uploadPdf, submitPdfCheckpoint } from "../services/api";
import { showToast } from "../components/Toast";

export default function FrictionalPdfMode() {
  const [session, setSession] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [lectureFile, setLectureFile] = useState(null);
  const [examFile, setExamFile] = useState(null);
  
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualPage, setManualPage] = useState("");

  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);


  const readingTimeRef = React.useRef(0);
  const answeringTimeRef = React.useRef(0);
  const lastTimestampRef = React.useRef(Date.now());

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTimestampRef.current;
      lastTimestampRef.current = now;
      if (session) {
        if (session.checkpoints.some(cp => cp.status === "locked" && session.currentPage >= cp.pageNumber)) {
          answeringTimeRef.current += delta;
        } else {
          readingTimeRef.current += delta;
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const startResizing = React.useCallback((e) => {
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback((e) => {
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 200 && newWidth < window.innerWidth * 0.8) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  React.useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!lectureFile) return showToast("Lecture PDF is required.", "error");
    setUploading(true);
    const formData = new FormData();
    formData.append("lecture", lectureFile);
    if (examFile) formData.append("exam", examFile);
    try {
      const res = await uploadPdf(formData);
      setSession(res.data.session);
      showToast("Dual-Gauntlet Initialized.", "success");
    } catch (err) {
      showToast("Failed to initialize.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitCheckpoint = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setIsSubmitting(true);
    
    const timeReading = readingTimeRef.current;
    const timeAnswering = answeringTimeRef.current;

    try {
      const res = await submitPdfCheckpoint({ 
        sessionId: session._id, 
        answer,
        timeReading,
        timeAnswering
      });
      setSession(res.data.session);
      showToast("Neural Sync Complete.", "success");
      setAnswer("");
      // Reset local timers for the next sector
      readingTimeRef.current = 0;
      answeringTimeRef.current = 0;
    } catch (err) {
      showToast("Submission failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextPage = () => {
    if (session.currentPage < session.totalPageCount) {
      setSession({ ...session, currentPage: session.currentPage + 1 });
    }
  };

  const handleSnapPage = () => {
    const p = parseInt(manualPage);
    if (!isNaN(p) && p > 0 && p <= session.totalPageCount) {
      setSession({ ...session, currentPage: p });
      setManualPage("");
      showToast(`Neural Snap: Page ${p}`, "success");
    }
  };

  const currentCheckpoint = session?.checkpoints?.find(cp => cp.status === "locked");
  const isLocked = !!(session && currentCheckpoint && session.currentPage >= currentCheckpoint.pageNumber);
  const staticPdfUrl = session ? `/uploads/${session.multerFileName || session.lectureFileName}#toolbar=0&navpanes=0&view=FitH` : "";

  const scrollRef = React.useRef(null);
  const activeChallengeRef = React.useRef(null);

  React.useEffect(() => {
    // If we are locked, snap to the active question
    if (isLocked && activeChallengeRef.current) {
      setTimeout(() => {
        activeChallengeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } else if (scrollRef.current) {
      // Otherwise scroll to the absolute bottom (for reports/intel)
      setTimeout(() => {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 150);
    }
  }, [session?.checkpoints?.length, isLocked]);

  React.useEffect(() => {
    if (!session) return;
    if (isLocked) {
      setSidebarWidth(prev => Math.max(prev, window.innerWidth * 0.6));
    } else {
      setSidebarWidth(260);
    }
  }, [session, isLocked]);

  if (uploading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-8 shadow-[0_0_50px_rgba(99,102,241,0.3)]"></div>
        <h2 className="text-3xl font-black tracking-tighter text-white mb-4 italic uppercase tracking-widest animate-pulse">TRANSMITTING...</h2>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans overflow-hidden relative flex items-center justify-center">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="max-w-4xl w-full relative z-10">
          <header className="mb-16 text-center">
             <div className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-[9px] font-black tracking-[0.4em] text-indigo-400 uppercase mb-4">Dual-Gauntlet Protocol</div>
            <h1 className="text-4xl md:text-8xl font-black tracking-tighter mb-6 uppercase italic text-center text-white">PDF <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Lockdown</span></h1>
          </header>
          <form onSubmit={handleUpload} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[#0f0f0f] border border-white/5 rounded-[2rem] p-10 shadow-2xl hover:border-indigo-500/40 transition-all">
                <h3 className="text-xl font-black mb-8 uppercase tracking-tight">Lecture Notes</h3>
                <input type="file" accept=".pdf" onChange={(e) => setLectureFile(e.target.files[0])} className="w-full text-xs text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-white/5 file:text-white cursor-pointer"/>
              </div>
              <div className="bg-[#0f0f0f] border border-white/5 rounded-[2rem] p-10 shadow-2xl hover:border-purple-500/40 transition-all">
                <h3 className="text-xl font-black mb-8 uppercase tracking-tight">PYQ Repository</h3>
                <input type="file" accept=".pdf" onChange={(e) => setExamFile(e.target.files[0])} className="w-full text-xs text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-white/5 file:text-white cursor-pointer"/>
              </div>
            </div>
            <button 
              type="submit" 
              className="relative w-full py-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] text-white font-black text-xs uppercase tracking-[0.6em] rounded-[2rem] shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] hover:bg-right transition-all duration-500 italic overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-4 group-hover:gap-6 transition-all duration-300">
                INITIALIZE STREAM 
                <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-indigo-500/20 blur-xl"></div>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ position: 'fixed', top: '64px', left: 0, right: 0, bottom: 0, width: '100vw', zIndex: 9999 }}
      className={`bg-black text-white flex overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}
    >
      {/* Immersive Reader Area */}
      <div 
        className="relative bg-black h-full overflow-hidden transition-all duration-500 ease-in-out"
        style={{ flex: 1 }}
      >
        <iframe src={staticPdfUrl} className="w-full h-full border-none relative z-10" key={session.currentPage} title="Neural Reader" />
        
        {/* Cinematic Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 z-[60] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
             <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-xl mb-4 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.3)] animate-pulse text-red-500">🔒</div>
             <h2 className="text-xl font-black uppercase italic tracking-tighter mb-2 text-red-500">Locked</h2>
             <p className="text-gray-400 max-w-sm font-light leading-relaxed uppercase text-[7px] tracking-[0.2em]">Complete Sync</p>
          </div>
        )}
      </div>

      {/* Resize Handle */}
      <div 
        onMouseDown={startResizing}
        className={`group w-3 h-full cursor-col-resize hover:bg-indigo-500/10 transition-all z-[80] relative flex items-center justify-center ${isResizing ? 'bg-indigo-500/20' : 'bg-transparent'}`}
      >
        <div className={`w-[2px] rounded-full transition-all duration-500 ${isResizing ? 'bg-indigo-400 h-32' : 'bg-white/10 group-hover:bg-indigo-500/50 h-12 group-hover:h-24'}`}></div>
        
        {/* Visual Hint */}
        {!isResizing && (
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-indigo-500/0 group-hover:bg-indigo-500/5 blur-xl pointer-events-none transition-all"></div>
        )}
      </div>

      {/* Neural Sidecar - Re-engineered for Vertical Stability */}
      <div 
        className="bg-[#080808] border-l border-white/5 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)] relative z-[70] overflow-hidden transition-[width] duration-300"
        style={{ 
          width: `${sidebarWidth}px`, 
          minWidth: '200px',
          maxWidth: '90vw',
          height: '100%' 
        }}
      >
        {/* Fixed Header */}
        <div className="flex-none p-4 border-b border-white/5 bg-[#0a0a0a]">
          <div className="flex justify-between items-center mb-1">
             <div className="flex items-center gap-2">
               <span className="text-emerald-400 text-sm">🛡️</span>
               <h2 className="text-sm font-black tracking-widest uppercase italic">Lockdown Status</h2>
             </div>
             <div className="text-[7px] font-black px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded animate-pulse">
               {isLocked ? "SECURE" : "OPEN"}
             </div>
          </div>
          <p className="text-[7px] text-gray-600 font-black uppercase tracking-widest italic opacity-50">Sector {Math.ceil(session.currentPage / 5)} · Page {session.currentPage}/{session.totalPageCount}</p>
        </div>

        {/* Fixed Console */}
        <div className="flex-none p-4 bg-[#080808] border-b border-white/5">
           {!isLocked ? (
             <div className="space-y-3">
                <button onClick={handleNextPage} className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-lg shadow-lg border border-indigo-400/20 group transition-all active:scale-95">
                  <span className="text-[8px] font-black tracking-[0.2em] uppercase italic text-white">MARK PAGE {session.currentPage} DONE →</span>
                </button>
                <div className="flex gap-2">
                   <div className="flex-1 bg-black/40 border border-white/5 rounded-lg px-2 py-1 flex items-center justify-between">
                      <span className="text-[6px] font-black text-gray-600 uppercase">Snap:</span>
                      <input type="text" value={manualPage} onChange={(e) => setManualPage(e.target.value)} className="bg-transparent w-8 text-center text-[10px] font-black focus:outline-none" placeholder="P#"/>
                   </div>
                   <button onClick={handleSnapPage} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all">SNAP</button>
                </div>
             </div>
           ) : (
             <div className="py-2 text-center bg-red-500/5 rounded-lg border border-red-500/10">
                <p className="text-[7px] font-black text-red-500 uppercase tracking-widest animate-pulse italic">LOCKDOWN ACTIVE</p>
             </div>
           )}
        </div>

        {/* Core Content */}
        <div className="flex-1 min-h-0 p-4 bg-[#080808] flex flex-col justify-between overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            {/* Checkpoint Feed */}
            {session.checkpoints.map((cp, idx) => {
              const isActive = cp.status === "locked" && session.currentPage >= cp.pageNumber;

              if (isActive) {
                return (
                  <div key={idx} ref={activeChallengeRef} className="animate-fade-in-up space-y-6 pt-4 border-t border-white/5">
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-xl mx-auto mb-4 text-red-500 border border-red-500/20 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.2)]">🔒</div>
                      <h3 className="text-sm font-black uppercase tracking-widest italic text-red-500">Neural Sync Required</h3>
                      <p className="text-[7px] text-gray-600 uppercase tracking-[0.2em] mt-1">Sector {Math.ceil(cp.pageNumber / 5)}</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[7px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">Blueprint (PYQ)</h4>
                      <div className="bg-[#111] border border-white/5 p-4 rounded-xl text-[10px] font-light leading-relaxed text-gray-400 italic">
                        "{cp.pyq}"
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-[7px] font-black text-indigo-500 uppercase tracking-widest ml-1 italic">Evolution Challenge</h4>
                      <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl text-[11px] font-light leading-relaxed text-indigo-100 italic border-l-4 border-l-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                        "{cp.creativeQuestion}"
                      </div>
                    </div>

                    <form onSubmit={handleSubmitCheckpoint} className="space-y-4">
                      <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full bg-black border border-white/5 rounded-xl p-4 text-[11px] text-white focus:outline-none focus:border-indigo-500/40 transition-all font-light min-h-[140px] shadow-inner" placeholder="Analyze the evolution..." disabled={isSubmitting} />
                      <button type="submit" disabled={isSubmitting || !answer.trim()} className="w-full py-5 bg-indigo-600 text-white font-black text-[9px] uppercase tracking-[0.5em] rounded-xl shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_50px_rgba(79,70,229,0.6)] hover:bg-indigo-500 transition-all disabled:opacity-20 italic border border-indigo-400/30">
                        {isSubmitting ? "SYNCING..." : "VERIFY EVOLUTION →"}
                      </button>
                    </form>
                  </div>
                );
              }

              return null;
            })}


          </div>
        </div>

        {/* Fixed Global Metrics Footer */}
        <div className="flex-none p-4 border-t border-white/5 bg-[#0a0a0a]">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[6px] font-black text-gray-600 uppercase tracking-widest mb-1">Integration</p>
              <p className="text-2xl font-black font-mono tracking-tighter text-white">{session.actualUnderstanding}%</p>
            </div>
            <div className="text-right">
              <p className="text-[6px] font-black text-gray-600 uppercase tracking-widest mb-1">Progress</p>
              <p className="text-2xl font-black font-mono tracking-tighter text-indigo-500 italic">{session.currentPage} <span className="text-[8px] opacity-20">/ {session.totalPageCount}</span></p>
            </div>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden flex gap-1">
             {[...Array(10)].map((_, i) => (
               <div key={i} className={`h-full flex-1 transition-all duration-1000 ${ (i + 1) * 10 <= (session.currentPage / session.totalPageCount) * 100 ? 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-white/5' }`}></div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
