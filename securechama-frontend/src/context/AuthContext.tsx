"use client";

import { createContext, useState, useEffect } from "react";

interface User {
  role: string;
  sacco_id: number | null;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem("access", token);
    const payload = JSON.parse(atob(token.split(".")[1]));
    setUser(payload);
  };

  const logout = () => {
    localStorage.removeItem("access");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
