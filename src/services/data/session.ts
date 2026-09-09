import { supabase } from "@/integrations/supabase/client";

export async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Sessão expirada. Entre novamente para continuar.");
  return data.user.id;
}
