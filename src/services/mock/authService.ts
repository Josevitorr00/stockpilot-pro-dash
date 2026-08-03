import type { AuthSession, Credentials, SignUpPayload, User } from "@/types/auth";

/**
 * Mock auth service.
 * Prepared to be swapped by real HTTP calls (Node + Express + SQLite) later:
 * keep the same signatures and replace the body with fetch() calls.
 */

export const AUTH_STORAGE_KEY = "stockpilot:session";
export const REMEMBER_STORAGE_KEY = "stockpilot:remember";

const DEMO_EMAIL = "admin@comercio.com";
const DEMO_PASSWORD = "123456";

const demoUser: User = {
  id: "usr_001",
  name: "Administrador",
  email: DEMO_EMAIL,
  role: "admin",
  company: "Comércio Central Ltda.",
};

const delay = (ms = 900) => new Promise((resolve) => setTimeout(resolve, ms));

export async function signIn({ email, password }: Credentials): Promise<AuthSession> {
  await delay();
  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    throw new Error("E-mail ou senha inválidos.");
  }
  return { user: demoUser, token: `mock.${btoa(email)}.token`, createdAt: new Date().toISOString() };
}

export async function signUp({ email, name, company }: SignUpPayload): Promise<AuthSession> {
  await delay();
  const user: User = {
    id: `usr_${Math.random().toString(36).slice(2, 8)}`,
    name,
    email: email.trim().toLowerCase(),
    role: "admin",
    company,
  };
  return { user, token: `mock.${btoa(email)}.token`, createdAt: new Date().toISOString() };
}

export async function requestPasswordReset(email: string): Promise<void> {
  await delay(800);
  if (!email.includes("@")) throw new Error("Informe um e-mail válido.");
}

export function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function persistSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export const DEMO_CREDENTIALS = { email: DEMO_EMAIL, password: DEMO_PASSWORD };