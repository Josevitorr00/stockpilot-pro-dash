import { supabase } from "@/integrations/supabase/client";
import type { AuthSession, Credentials, SignUpPayload, User } from "@/types/auth";
import type { Session } from "@supabase/supabase-js";

export const REMEMBER_STORAGE_KEY = "stockpilot:remember";

interface ProfileRow {
  name: string | null;
  company: string | null;
  avatar_url: string | null;
}

function translateError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const msg = raw.toLowerCase();
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: unknown }).status)
      : undefined;

  if (msg.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("user already registered") || msg.includes("already been registered"))
    return "Este e-mail já possui uma conta. Faça login.";
  if (msg.includes("password should be at least")) return "A senha deve ter ao menos 6 caracteres.";
  if (msg.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (msg.includes("unable to validate email")) return "Informe um e-mail válido.";
  if (msg.includes("too many requests") || status === 429)
    return "Muitas tentativas. Aguarde alguns instantes e tente novamente.";

  // Falha de rede / serviço indisponível (inclui 5xx e erros de borda como 520-530).
  if (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network request failed") ||
    msg.includes("load failed") ||
    msg.includes("fetch failed")
  )
    return "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";

  if ((status && status >= 500) || /\b5\d\d\b/.test(raw))
    return "Serviço temporariamente indisponível. Tente novamente em instantes.";

  if (status === 401 || status === 403) return "E-mail ou senha incorretos.";

  return "Não foi possível entrar agora. Tente novamente em instantes.";
}

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data } = await supabase
    .from("profiles")
    .select("name, company, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  return data ?? null;
}

export async function buildSession(session: Session | null): Promise<AuthSession | null> {
  if (!session?.user) return null;
  const profile = await fetchProfile(session.user.id);
  const metadata = session.user.user_metadata ?? {};
  const user: User = {
    id: session.user.id,
    email: session.user.email ?? "",
    name: profile?.name || (metadata['name'] as string) || (session.user.email ?? "").split("@")[0] || "Usuário",
    company: profile?.company || (metadata['company'] as string) || "",
    role: "admin",
    ...(profile?.avatar_url ? { avatarUrl: profile.avatar_url } : {}),
  };
  return { user, token: session.access_token, createdAt: new Date().toISOString() };
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  const { data } = await supabase.auth.getSession();
  return buildSession(data.session);
}

export async function signIn({ email, password }: Credentials): Promise<AuthSession> {
  const result = await supabase.auth
    .signInWithPassword({ email: email.trim().toLowerCase(), password })
    .catch((err: unknown) => ({ data: null, error: err }));
  if (result.error) throw new Error(translateError(result.error));
  const data = result.data!;
  const session = await buildSession(data.session);
  if (!session) throw new Error("Não foi possível iniciar a sessão.");
  return session;
}

export async function signUp({ email, password, name, company }: SignUpPayload): Promise<AuthSession | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      ...(typeof window !== "undefined" ? { emailRedirectTo: window.location.origin } : {}),
      data: { name: name.trim(), company: company.trim() },
    },
  });
  if (error) throw new Error(translateError(error));
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new Error("Este e-mail já possui uma conta. Faça login.");
  }
  return buildSession(data.session);
}

export async function signOutUser(): Promise<void> {
  await supabase.auth.signOut();
}

export async function requestPasswordReset(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) throw new Error("Informe um e-mail válido.");
  const { error } = await supabase.auth.resetPasswordForEmail(
    normalized,
    typeof window !== "undefined" ? { redirectTo: `${window.location.origin}/reset-password` } : {},
  );
  if (error) throw new Error(translateError(error));
}

export async function updateUserProfile(
  updates: Partial<Pick<User, "name" | "email" | "avatarUrl">>,
): Promise<User> {
  const { data: userData } = await supabase.auth.getUser();
  const authUser = userData.user;
  if (!authUser) throw new Error("Sessão expirada. Faça login novamente.");

  if (updates.name !== undefined && !updates.name.trim()) throw new Error("Informe o seu nome.");
  if (updates.email !== undefined && !updates.email.includes("@")) throw new Error("Informe um e-mail válido.");

  if (updates.email && updates.email.trim().toLowerCase() !== (authUser.email ?? "")) {
    const { error } = await supabase.auth.updateUser({ email: updates.email.trim().toLowerCase() });
    if (error) throw new Error(translateError(error));
  }

  const profilePatch: { name?: string; avatar_url?: string } = {};
  if (updates.name !== undefined) profilePatch.name = updates.name.trim();
  if (updates.avatarUrl !== undefined) profilePatch.avatar_url = updates.avatarUrl;
  if (Object.keys(profilePatch).length > 0) {
    const { error } = await supabase.from("profiles").update(profilePatch).eq("id", authUser.id);
    if (error) throw new Error(error.message);
  }

  const profile = await fetchProfile(authUser.id);
  return {
    id: authUser.id,
    email: updates.email?.trim().toLowerCase() ?? authUser.email ?? "",
    name: profile?.name || updates.name || "",
    company: profile?.company || "",
    role: "admin",
    ...(profile?.avatar_url ? { avatarUrl: profile.avatar_url } : {}),
  };
}
