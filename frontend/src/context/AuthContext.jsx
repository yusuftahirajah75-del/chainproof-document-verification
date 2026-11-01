import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/authApi";
import { ROLES } from "../utils/constants";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check current session on mount (HTTP-only cookie)
  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Login handler
  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.success && res.data?.user) {
      if (res.data.token) {
        localStorage.setItem("chainproof_token", res.data.token);
      }
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || "Login failed");
  };

  // Register handler
  const register = async (payload) => {
    const res = await authApi.register(payload);
    if (res.success && res.data?.user) {
      if (res.data.token) {
        localStorage.setItem("chainproof_token", res.data.token);
      }
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || "Registration failed");
  };

  // Logout handler
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      localStorage.removeItem("chainproof_token");
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === ROLES.ADMIN,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

