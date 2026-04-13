"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
interface User { id: string; name: string; email: string; telegramId?: string | null; botToken?: string | null; }
interface AuthContextType { user: User | null; loading: boolean; login: (e: string, p: string) => Promise<void>; register: (n: string, e: string, p: string) => Promise<void>; logout: () => Promise<void>; checkSession: () => Promise<void>; setUser: (u: User | null) => void; }
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const checkSession = async () => { try { const res = await fetch("/api/auth/me"); if (res.ok) setUser((await res.json()).user); } finally { setLoading(false); } };
  useEffect(() => { checkSession(); }, []);
  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (res.ok) { setUser((await res.json()).user); router.push("/"); } else throw new Error("Login failed");
  };
  const register = async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
    if (res.ok) { setUser((await res.json()).user); router.push("/setup"); } else throw new Error("Registration failed");
  };
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); setUser(null); router.push("/login"); };
  return <AuthContext.Provider value={{ user, loading, login, register, logout, checkSession, setUser }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within Provider");
  return context;
}
