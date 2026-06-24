import React from "react";

export default function FrictionHUD({ score, status, mode, difficulty = 1 }) {
  const isCompleted = status === "completed";

  return (
    <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-xl animate-fade-in-up">
      <div className="flex items-center justify-between gap-6">
        {/* Total Score */}
        <div className="flex-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Cumulative Friction</p>
          <p className="text-3xl font-black text-white font-mono tracking-tighter">
            {score.toLocaleString()}
          </p>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-white/5"></div>

        {/* Difficulty Meter */}
        <div className="flex-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Friction Level</p>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <div 
                key={level} 
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  level <= difficulty 
                    ? (difficulty >= 4 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-indigo-500') 
                    : 'bg-white/5'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-white/5"></div>

        {/* Status */}
        <div className="flex-1 text-right">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">State</p>
          <div className="flex items-center justify-end gap-2">
            <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-indigo-500'}`}></div>
            <span className={`text-xs font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-400' : 'text-indigo-400'}`}>
              {isCompleted ? "Unlocked" : "Resisting"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
