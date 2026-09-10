import { supabase } from "@/integrations/supabase/client";
import { currentUserId } from "./session";

export interface CompanySettings {
  tradeName: string;
  legalName: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
}

export interface SystemPreferences {
  lowStockAlerts: boolean;
  saleNotifications: boolean;
  weeklySummary: boolean;
  itemsPerPage: number;
}

export interface AppSettings {
  company: CompanySettings;
  preferences: SystemPreferences;
}

export const stateOptions = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const emptySettings: AppSettings = {
  company: {
    tradeName: "",
    legalName: "",
    document: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
  },
  preferences: {
    lowStockAlerts: true,
    saleNotifications: true,
    weeklySummary: false,
    itemsPerPage: 10,
  },
};

export async function getSettings(): Promise<AppSettings> {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("user_settings")
    .select("company,preferences")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return {
    company: { ...emptySettings.company, ...((data?.company as Partial<CompanySettings>) ?? {}) },
    preferences: {
      ...emptySettings.preferences,
      ...((data?.preferences as Partial<SystemPreferences>) ?? {}),
    },
  };
}

async function saveSettings(patch: Partial<AppSettings>) {
  const userId = await currentUserId();
  const current = await getSettings();
  const next = { ...current, ...patch };
  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      company: next.company,
      preferences: next.preferences,
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);
  return next;
}

export async function updateCompanySettings(company: CompanySettings): Promise<CompanySettings> {
  if (!company.tradeName.trim()) throw new Error("Informe o nome fantasia da empresa.");
  const next = await saveSettings({ company });
  return next.company;
}

export async function updatePreferences(
  preferences: SystemPreferences,
): Promise<SystemPreferences> {
  const next = await saveSettings({ preferences });
  return next.preferences;
}
