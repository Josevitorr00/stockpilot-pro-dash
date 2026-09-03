import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, LogOut, PackageX, Search, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { getProducts } from "@/services/mock/productService";
import { allNavItems } from "./navigation";

function initials(name?: string | null) {
  if (!name) return "SP";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = useMemo(
    () => allNavItems.find((item) => item.url === pathname),
    [pathname],
  );

  const { data: products } = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const lowStock = useMemo(
    () => (products ?? []).filter((p) => p.stock < p.minStock),
    [products],
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-3 backdrop-blur md:px-6">
      <SidebarTrigger className="text-muted-foreground" />

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold text-foreground md:text-base">
          {current?.title ?? "StockPilot"}
        </h2>
        <p className="hidden truncate text-xs text-muted-foreground md:block">
          {current?.description ?? "Controle inteligente para o seu comércio."}
        </p>
      </div>

      <div className="relative hidden w-72 lg:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos, clientes..."
          className="pl-9"
          aria-label="Buscar no sistema"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
            <Bell className="size-5" />
            {lowStock.length > 0 && (
              <Badge className="absolute -right-0.5 -top-0.5 size-4 justify-center rounded-full p-0 text-[10px]">
                {lowStock.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Alertas de estoque</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {lowStock.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted-foreground">
              Nenhum produto abaixo do estoque mínimo.
            </p>
          ) : (
            <>
              {lowStock.slice(0, 5).map((p) => (
                <DropdownMenuItem key={p.id} asChild>
                  <Link to="/estoque" className="flex items-center gap-2">
                    <PackageX className="size-4 shrink-0 text-destructive" />
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {p.stock}/{p.minStock}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
              {lowStock.length > 5 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/estoque" className="justify-center text-xs text-primary">
                      Ver todos ({lowStock.length})
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {initials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-32 truncate text-sm font-medium md:block">
              {user?.name ?? "Usuário"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="truncate">{user?.email ?? "—"}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/configuracoes">
              <User className="mr-2 size-4" /> Minha conta
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              logout();
              navigate({ to: "/", replace: true });
            }}
          >
            <LogOut className="mr-2 size-4" /> Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}