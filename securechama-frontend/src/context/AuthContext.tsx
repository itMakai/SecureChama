"use client";

import { createContext, useState, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth";

export interface UserPayload {
  user_id: number;
  username: string;
  name?: string;
  email?: string;
  role: "platform_admin" | "sacco_admin" | "loan_officer" | "member";
  sacco_id: number | null;
  exp: number;
}

interface AuthContextType {
  user: UserPayload | null;
  loading: boolean;
  login: (access: string, refresh: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function defaultDashboardRoute(role?: UserPayload["role"]) {
  if (role === "loan_officer") return "/dashboard/loans";
  if (role === "platform_admin" || role === "sacco_admin") return "/dashboard/members";
  return "/dashboard";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(() => {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh") || undefined;

    if (!token) return null;

    try {
      const decoded = jwtDecode<UserPayload>(token);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.clear();
        clearAuthCookies();
        return null;
      }

      setAuthCookies(token, refresh);
      return decoded;
    } catch {
      localStorage.clear();
      clearAuthCookies();
      return null;
    }
  });
  const [loading] = useState(false);

  const login = (access: string, refresh: string) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    setAuthCookies(access, refresh);

    const decoded = jwtDecode<UserPayload>(access);
    setUser(decoded);
  };

  const logout = () => {
    localStorage.clear();
    clearAuthCookies();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
