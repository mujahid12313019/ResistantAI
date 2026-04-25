import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../components/Toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login({ email, password });
      loginUser(res.data.token, res.data.username);
      showToast("Welcome back! 🎉", "success");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.msg || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6 bg-black relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="bg-[#0f0f0f]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-1 shadow-2xl">
          <div className="bg-[#0a0a0a] rounded-[22px] p-8 md:p-10">
            
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-2xl mb-6">⚡</div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h1>
              <p className="text-sm text-gray-500 font-light">Sign in to the Resistant AI crucible.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1" htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-light placeholder:text-gray-700"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-light placeholder:text-gray-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                {loading ? "Decrypting..." : "Sign In →"}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-xs text-gray-500 font-light">
                Don't have an account?{" "}
                <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition-colors">Create one free</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
