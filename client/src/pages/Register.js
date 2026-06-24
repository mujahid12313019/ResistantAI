import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../services/api";
import { showToast } from "../components/Toast";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await signup({ username, email, password });
      showToast("Account created! Please log in.", "success");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6 bg-black relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="bg-[#0f0f0f]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-1 shadow-2xl">
          <div className="bg-[#0a0a0a] rounded-[22px] p-8 md:p-10">
            
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-2xl mb-6">🧠</div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">Join the Crucible</h1>
              <p className="text-sm text-gray-500 font-light leading-relaxed">Start your journey into visual cognitive friction.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1" htmlFor="reg-username">Username</label>
                <input
                  id="reg-username"
                  type="text"
                  className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-light placeholder:text-gray-700"
                  placeholder="Your visual alias"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1" htmlFor="reg-email">Email address</label>
                <input
                  id="reg-email"
                  type="email"
                  className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-light placeholder:text-gray-700"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-light placeholder:text-gray-700"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1" htmlFor="reg-confirm">Confirm password</label>
                <input
                  id="reg-confirm"
                  type="password"
                  className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-light placeholder:text-gray-700"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex gap-2 items-center animate-pulse">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-lg hover:shadow-white/10 hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-30 flex justify-center items-center gap-3"
                disabled={loading}
              >
                {loading ? "Architecting..." : "Create Account →"}
              </button>
            </form>

            <div className="mt-10 text-center border-t border-white/5 pt-8">
              <p className="text-xs text-gray-500 font-light">
                Already part of the network?{" "}
                <Link to="/login" className="text-purple-400 hover:text-purple-300 font-bold ml-1 transition-colors">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
