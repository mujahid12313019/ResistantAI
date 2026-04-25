import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-black/80 border-b border-gray-800 backdrop-blur-md">
      <Link to="/" className="text-xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center gap-2">
        <span className="text-2xl">⚡</span>
        Resistant<span className="opacity-70 text-white">AI</span>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-xs text-gray-400 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-full hidden sm:inline-block">
              {user.username}
            </span>
            <Link
              to="/history"
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition border ${
                location.pathname === "/history"
                  ? "border-indigo-500 text-indigo-400 bg-indigo-900/20"
                  : "border-gray-700 text-gray-300 bg-gray-800 hover:bg-gray-700"
              }`}
            >
              History
            </Link>
            <Link
              to="/pdf-mode"
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition border ${
                location.pathname === "/pdf-mode"
                  ? "border-indigo-500 text-indigo-400 bg-indigo-900/20"
                  : "border-gray-700 text-gray-300 bg-gray-800 hover:bg-gray-700"
              }`}
            >
              PDF Mode
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-gray-400 hover:text-white px-3 py-1.5 transition"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="px-4 py-1.5 text-sm font-semibold text-gray-300 hover:text-white transition">
              Log In
            </Link>
            <Link to="/register" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-md shadow-lg shadow-indigo-500/20 transition">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
