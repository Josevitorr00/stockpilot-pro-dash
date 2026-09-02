/**
 * Mock settings service.
 * Prepared to be swapped by real HTTP calls later: keep the same
 * signatures and replace the body with fetch() calls.
 */

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

export const SETTINGS_STORAGE_KEY = "stockpilot:settings";

export const stateOptions = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const defaultSettings: AppSettings = {
  company: {
    tradeName: "Comércio Central",
    legalName: "Comércio Central Ltda.",
    document: "12.345.678/0001-90",
    phone: "(85) 3222-1100",
    email: "contato@comerciocentral.com.br",
    address: "Rua das Flores, 120",
    city: "Fortaleza",
    state: "CE",
  },
  preferences: {
    lowStockAlerts: true,
    saleNotifications: true,
    weeklySummary: false,
    itemsPerPage: 10,
  },
};

const delay = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms));

function readSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      company: { ...defaultSettings.company, ...parsed.company },
      preferences: { ...defaultSettings.preferences, ...parsed.preferences },
    };
  } catch {
    return defaultSettings;
  }
}

function persistSettings(settings: AppSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export async function getSettings(): Promise<AppSettings> {
  await delay(300);
  return readSettings();
}

export async function updateCompanySettings(company: CompanySettings): Promise<CompanySettings> {
  await delay();
  if (!company.tradeName.trim()) throw new Error("Informe o nome fantasia da empresa.");
  const settings = readSettings();
  settings.company = company;
  persistSettings(settings);
  return company;
}

export async function updatePreferences(preferences: SystemPreferences): Promise<SystemPreferences> {
  await delay(400);
  const settings = readSettings();
  settings.preferences = preferences;
  persistSettings(settings);
  return preferences;
}
