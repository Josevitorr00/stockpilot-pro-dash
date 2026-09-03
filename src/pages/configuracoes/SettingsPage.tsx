import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Building2, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import {
  getSettings,
  stateOptions,
  updateCompanySettings,
  updatePreferences,
  type AppSettings,
  type CompanySettings,
  type SystemPreferences,
} from "@/services/mock/settingsService";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({ queryKey: ["settings"], queryFn: getSettings });

  const [profile, setProfile] = useState({ name: user?.name ?? "", email: user?.email ?? "" });
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [preferences, setPreferences] = useState<SystemPreferences | null>(null);

  useEffect(() => {
    if (settings) {
      setCompany(settings.company);
      setPreferences(settings.preferences);
    }
  }, [settings]);

  useEffect(() => {
    if (user) setProfile({ name: user.name, email: user.email });
  }, [user]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["settings"] });

  const saveProfile = useMutation({
    mutationFn: () => updateUser({ name: profile.name.trim(), email: profile.email.trim() }),
    onSuccess: () => toast.success("Perfil atualizado com sucesso."),
    onError: (error: Error) => toast.error(error.message),
  });

  const saveCompany = useMutation({
    mutationFn: (values: CompanySettings) => updateCompanySettings(values),
    onSuccess: () => {
      invalidate();
      toast.success("Dados da empresa atualizados.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const savePreferences = useMutation({
    mutationFn: (values: SystemPreferences) => updatePreferences(values),
    onSuccess: () => {
      invalidate();
      toast.success("Preferências salvas.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updatePref = <K extends keyof SystemPreferences>(key: K, value: SystemPreferences[K]) => {
    if (!preferences) return;
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    savePreferences.mutate(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie seu perfil, os dados da empresa e as preferências do sistema.
        </p>
      </div>

      <Tabs defaultValue="perfil" className="space-y-4">
        <TabsList>
          <TabsTrigger value="perfil">
            <UserRound className="size-4" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="empresa">
            <Building2 className="size-4" /> Empresa
          </TabsTrigger>
          <TabsTrigger value="preferencias">
            <Bell className="size-4" /> Preferências
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <SectionCard title="Meu perfil" description="Informações da sua conta de acesso.">
            <div className="mb-6 flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                  {user ? initials(user.name) : "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{user?.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <ShieldCheck className="size-3" />
                    {user?.role === "admin" ? "Administrador" : "Operador"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{user?.company}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="profile-name">Nome completo</Label>
                <Input
                  id="profile-name"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-email">E-mail</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}>
                {saveProfile.isPending ? "Salvando..." : "Salvar perfil"}
              </Button>
              <Button variant="outline" onClick={logout}>
                Sair da conta
              </Button>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="empresa">
          <SectionCard title="Dados da empresa" description="Informações cadastrais do seu negócio.">
            {isLoading || !company ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-xl" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="company-trade">Nome fantasia</Label>
                    <Input
                      id="company-trade"
                      value={company.tradeName}
                      onChange={(e) => setCompany({ ...company, tradeName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company-legal">Razão social</Label>
                    <Input
                      id="company-legal"
                      value={company.legalName}
                      onChange={(e) => setCompany({ ...company, legalName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company-doc">CNPJ</Label>
                    <Input
                      id="company-doc"
                      value={company.document}
                      onChange={(e) => setCompany({ ...company, document: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company-phone">Telefone</Label>
                    <Input
                      id="company-phone"
                      value={company.phone}
                      onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company-email">E-mail comercial</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={company.email}
                      onChange={(e) => setCompany({ ...company, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company-address">Endereço</Label>
                    <Input
                      id="company-address"
                      value={company.address}
                      onChange={(e) => setCompany({ ...company, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company-city">Cidade</Label>
                    <Input
                      id="company-city"
                      value={company.city}
                      onChange={(e) => setCompany({ ...company, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>UF</Label>
                    <Select
                      value={company.state}
                      onValueChange={(value) => setCompany({ ...company, state: value })}
                    >
                      <SelectTrigger aria-label="Selecionar UF">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stateOptions.map((uf) => (
                          <SelectItem key={uf} value={uf}>
                            {uf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-6">
                  <Button
                    onClick={() => saveCompany.mutate(company)}
                    disabled={saveCompany.isPending}
                  >
                    {saveCompany.isPending ? "Salvando..." : "Salvar empresa"}
                  </Button>
                </div>
              </>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="preferencias">
          <SectionCard title="Preferências" description="Alertas, notificações e comportamento do sistema.">
            {isLoading || !preferences ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                <PreferenceRow
                  title="Alertas de estoque baixo"
                  description="Avisar quando um produto atingir o estoque mínimo."
                  checked={preferences.lowStockAlerts}
                  onCheckedChange={(value) => updatePref("lowStockAlerts", value)}
                />
                <PreferenceRow
                  title="Notificações de venda"
                  description="Exibir confirmação a cada venda concluída no PDV."
                  checked={preferences.saleNotifications}
                  onCheckedChange={(value) => updatePref("saleNotifications", value)}
                />
                <PreferenceRow
                  title="Resumo semanal"
                  description="Receber um resumo de vendas e estoque toda semana."
                  checked={preferences.weeklySummary}
                  onCheckedChange={(value) => updatePref("weeklySummary", value)}
                />
                <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Itens por página</p>
                    <p className="text-xs text-muted-foreground">
                      Quantidade de registros exibidos nas tabelas.
                    </p>
                  </div>
                  <Select
                    value={String(preferences.itemsPerPage)}
                    onValueChange={(value) => updatePref("itemsPerPage", Number(value))}
                  >
                    <SelectTrigger className="sm:w-32" aria-label="Itens por página">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 50].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} itens
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PreferenceRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={title} />
    </div>
  );
}
