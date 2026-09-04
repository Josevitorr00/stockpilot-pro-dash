import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  REMEMBER_STORAGE_KEY,
  buildSession,
  getCurrentSession,
  requestPasswordReset,
  signIn,
  signOutUser,
  signUp,
  updateUserProfile,
} from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import type { AuthSession, Credentials, SignUpPayload, User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: Credentials, remember?: boolean) => Promise<void>;
  register: (payload: SignUpPayload) => Promise<boolean>;
  recoverPassword: (email: string) => Promise<void>;
  updateUser: (updates: Partial<Pick<User, "name" | "email" | "avatarUrl">>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getCurrentSession()
      .then((next) => {
        if (active) setSession(next);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((event, supaSession) => {
      if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") return;
      if (!supaSession) {
        setSession(null);
        return;
      }
      void buildSession(supaSession).then((next) => {
        if (active) setSession(next);
      });
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (credentials: Credentials, remember = false) => {
    const next = await signIn(credentials);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(REMEMBER_STORAGE_KEY, remember ? credentials.email : "");
    }
    setSession(next);
  }, []);

  const register = useCallback(async (payload: SignUpPayload) => {
    const next = await signUp(payload);
    if (next) {
      setSession(next);
      return true;
    }
    return false;
  }, []);

  const recoverPassword = useCallback(async (email: string) => {
    await requestPasswordReset(email);
  }, []);

  const updateUser = useCallback(async (updates: Partial<Pick<User, "name" | "email" | "avatarUrl">>) => {
    const user = await updateUserProfile(updates);
    setSession((current) => (current ? { ...current, user } : current));
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    void signOutUser();
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
      updateUser,
      logout,
    }),
    [session, isLoading, login, register, recoverPassword, updateUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
