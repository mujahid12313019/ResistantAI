import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getProfile } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await getProfile();
        setUser({ ...res.data.user, token });
      } catch (err) {
        console.error("Failed to refresh user:", err);
        // If profile fetch fails but we have token, keep basic user or logout
        if (err.response?.status === 401) logoutUser();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const loginUser = (token, username) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    refreshUser(); // Fetch full profile immediately
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
