// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";
import authService from "../services/authService";

export const AuthContext = createContext();

// NOTE: login now supports OTP (token+user) and email/password
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshToken, setRefreshToken] = useState(
    () => localStorage.getItem("refreshToken") || ""
  );

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    } else {
      localStorage.removeItem("refreshToken");
    }
  }, [refreshToken]);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");

    // Frontend-only persistence: if a JWT is present, consider the user logged in.
    // Backend will still enforce auth on protected APIs.
    if (token) {
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }

    // Best-effort validation (do not force logout on failure)
    try {
      if (token) {
        await api.get("/auth/me");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    // OTP login: may have just a JWT token, or token+user
    if (credentials.token) {
      localStorage.setItem("token", credentials.token);
      if (credentials.user) {
        setUser(credentials.user);
      }
      setIsAuthenticated(true);
      return { token: credentials.token, user: credentials.user || null };
    }

    // Email/password login: call backend once via authService
    try {
      const data = await authService.login(credentials); // api already unwraps response.data
      if (data && data.token && data.user) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken);
        }
        return data;
      } else {
        throw new Error(data?.error || "Login failed");
      }
    } catch (error) {
      // Keep any existing token; only reset in-memory auth flags.
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    if (refreshToken) {
      await authService.logout(refreshToken);
      setRefreshToken("");
    }
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (userData) => {
    const response = await api.post("/auth/register", userData);

    if (response.data.success && response.data.token && response.data.user) {
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data;
    } else {
      throw new Error(response.data.error || "Registration failed");
    }
  };

  const refreshAuthToken = async () => {
    if (!refreshToken) return;
    try {
      await authService.refreshToken(refreshToken);
      // Optionally update access token here
    } catch {
      setRefreshToken("");
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    checkAuth,
    refreshToken,
    setRefreshToken,
    refreshAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
