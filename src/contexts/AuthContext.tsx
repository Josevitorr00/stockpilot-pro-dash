import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  persistSession,
  readStoredSession,
  requestPasswordReset,
  signIn,
  signUp,
} from "@/services/mock/authService";
import type { AuthSession, Credentials, SignUpPayload, User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: Credentials, remember?: boolean) => Promise<void>;
  register: (payload: SignUpPayload) => Promise<void>;
  recoverPassword: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSession(readStoredSession());
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: Credentials, remember = false) => {
    const next = await signIn(credentials);
    persistSession(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("stockpilot:remember", remember ? credentials.email : "");
    }
    setSession(next);
  }, []);

  const register = useCallback(async (payload: SignUpPayload) => {
    const next = await signUp(payload);
    persistSession(next);
    setSession(next);
  }, []);

  const recoverPassword = useCallback(async (email: string) => {
    await requestPasswordReset(email);
  }, []);

  const logout = useCallback(() => {
    persistSession(null);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isAuthenticated: Boolean(session),
      isLoading,
      login,
      register,
      recoverPassword,
      logout,
    }),
    [session, isLoading, login, register, recoverPassword, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}