"use client";

import { createContext, useEffect, useState, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth";

export interface UserPayload {
  user_id: number;
  username: string;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh") || undefined;

    if (token) {
      try {
        const decoded = jwtDecode<UserPayload>(token);

        if (decoded.exp * 1000 < Date.now()) {
          localStorage.clear();
          clearAuthCookies();
        } else {
          setAuthCookies(token, refresh);
          setUser(decoded);
        }
      } catch {
        localStorage.clear();
        clearAuthCookies();
      }
    }

    setLoading(false);
  }, []);

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
