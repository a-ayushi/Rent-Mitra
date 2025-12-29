// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";
import authService from "../services/authService";
import userService from "../services/userService";

export const AuthContext = createContext();

// NOTE: login now supports OTP (token+user) and email/password
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshToken, setRefreshToken] = useState(
    () => localStorage.getItem("refreshToken") || ""
  );

  const decodeJwtPayload = (token) => {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const json = atob(padded);
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  const normalizePhone10 = (value) => {
    if (value == null) return '';
    const digits = String(value).replace(/\D/g, '');
    if (digits.length === 10) return digits;
    if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
    if (digits.length > 10) return digits.slice(-10);
    return digits;
  };

  const getPhoneFromToken = (token) => {
    const payload = decodeJwtPayload(token);
    const raw = payload?.sub ?? payload?.subject ?? payload?.phone ?? payload?.phoneNo ?? payload?.mobilenumber;
    const str = raw == null ? '' : String(raw);
    if (str.includes('@')) return '';
    return normalizePhone10(str);
  };

  const extractUserFromMeResponse = (me) => {
    if (!me) return null;
    if (me.user) return me.user;
    if (me.data && me.data.user) return me.data.user;
    if (
      me.id != null ||
      me._id != null ||
      me.email != null ||
      me.phone != null ||
      me.phoneNo != null ||
      me.mobilenumber != null ||
      me.name != null
    ) {
      return me;
    }
    return null;
  };

  const hydrateUserInBackground = (token) => {
    const phone10 = getPhoneFromToken(token);

    const run = async () => {
      if (phone10) {
        const res = await userService.getByPhoneNumber(phone10);
        const phoneUser = res?.data ?? res?.user ?? res;
        if (phoneUser) {
          setUser({ ...phoneUser, phone: phoneUser.phone ?? phoneUser.mobilenumber ?? phone10 });
        }
        return;
      }

      const me = await api.get("/auth/me");
      const meUser = extractUserFromMeResponse(me);
      if (meUser) {
        setUser(meUser);
      }
    };

    run().catch((error) => {
      console.error('Auth hydrate failed:', error);
    });
  };

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

    // Do not block initial route rendering on user hydration.
    // Hydrate best-effort in the background.
    if (token) {
      hydrateUserInBackground(token);
    }

    setLoading(false);
  };

  const refreshUserFromDb = async (phoneOverride) => {
    const token = localStorage.getItem('token');
    const tokenPhone = getPhoneFromToken(token);
    const currentPhone = normalizePhone10(
      phoneOverride || user?.phone || user?.mobilenumber || user?.mobileNumber || user?.phoneNo || tokenPhone
    );
    if (!currentPhone) return;
    const res = await userService.getByPhoneNumber(currentPhone);
    const phoneUser = res?.data ?? res?.user ?? res;
    if (phoneUser) {
      setUser({ ...phoneUser, phone: phoneUser.phone ?? phoneUser.mobilenumber ?? currentPhone });
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
    refreshUserFromDb,
    refreshToken,
    setRefreshToken,
    refreshAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
