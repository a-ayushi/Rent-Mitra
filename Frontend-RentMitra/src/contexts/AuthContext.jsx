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
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await api.get("/auth/me");
        // response is already unwrapped, just check for user fields
        if (response && (response.data || response._id)) {
          setUser(response.data || response);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    // OTP login: credentials will have token and user directly
    if (credentials.token && credentials.user) {
      localStorage.setItem("token", credentials.token);
      setUser(credentials.user);
      setIsAuthenticated(true);
      return { token: credentials.token, user: credentials.user };
    }
    // Email/password login: call backend
    try {
      const data = await api.post("/auth/login", credentials); // already unwrapped
      if (data && data.token && data.user) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return data;
      } else {
        throw new Error(data.error || "Login failed");
      }
    } catch (error) {
      localStorage.removeItem("token");
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
