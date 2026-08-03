import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Boxes, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — StockPilot" },
      { name: "description", content: "Painel de gestão comercial do StockPilot." },
      { property: "og:title", content: "Dashboard — StockPilot" },
      { property: "og:description", content: "Painel de gestão comercial do StockPilot." },
    ],
  }),
  component: DashboardPlaceholder,
});

function DashboardPlaceholder() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate({ to: "/", replace: true });
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !isAuthenticated) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Boxes className="size-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Olá, {user?.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Autenticação mock concluída. O layout principal (sidebar, navbar e rotas) vem na etapa 2.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            logout();
            navigate({ to: "/", replace: true });
          }}
        >
          <LogOut className="mr-2 size-4" /> Sair
        </Button>
      </div>
    </main>
  );
}