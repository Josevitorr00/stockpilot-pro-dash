import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, PackagePlus, Search, TriangleAlert, XCircle } from "lucide-react";
import { toast } from "sonner";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StockMovementDialog } from "@/components/estoque/StockMovementDialog";
import { StockMovementsTable } from "@/components/estoque/StockMovementsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getStockOverview,
  registerMovement,
  type StockMovementInput,
} from "@/services/mock/stockService";
import { formatCurrency, formatNumber } from "@/lib/format";

export function StockPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [presetProduct, setPresetProduct] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["stock"],
    queryFn: getStockOverview,
  });

  const mutation = useMutation({
    mutationFn: (values: StockMovementInput) => registerMovement(values),
    onSuccess: (movement) => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDialogOpen(false);
      toast.success(`Movimentação registrada. Novo saldo: ${movement.resultingStock} un.`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const products = data?.products ?? [];
  const movements = data?.movements ?? [];

  const summary = useMemo(() => {
    return {
      totalUnits: products.reduce((acc, p) => acc + p.stock, 0),
      stockValue: products.reduce((acc, p) => acc + p.cost * p.stock, 0),
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length,
      outOfStock: products.filter((p) => p.stock === 0).length,
    };
  }, [products]);

  const criticalProducts = useMemo(
    () =>
      [...products]
        .filter((p) => p.stock <= p.minStock)
        .sort((a, b) => a.stock / Math.max(a.minStock, 1) - b.stock / Math.max(b.minStock, 1))
        .slice(0, 6),
    [products],
  );

  const filteredMovements = useMemo(() => {
    const term = search.trim().toLowerCase();
    return movements.filter((movement) => {
      const matchesTerm =
        !term ||
        movement.productName.toLowerCase().includes(term) ||
        movement.sku.toLowerCase().includes(term);
      const matchesType = typeFilter === "todos" || movement.type === typeFilter;
      return matchesTerm && matchesType;
    });
  }, [movements, search, typeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Estoque</h1>
          <p className="text-sm text-muted-foreground">
            Controle entradas, saídas e ajustes de inventário do seu comércio.
          </p>
        </div>
        <Button
          onClick={() => {
            setPresetProduct(null);
            setDialogOpen(true);
          }}
        >
          <PackagePlus className="mr-2 size-4" /> Nova movimentação
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Unidades em estoque</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <Boxes className="size-5 text-primary" /> {formatNumber(summary.totalUnits)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Valor de custo</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatCurrency(summary.stockValue)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Estoque baixo</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <TriangleAlert className="size-5 text-primary" /> {formatNumber(summary.lowStock)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Sem estoque</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <XCircle className="size-5 text-destructive" /> {formatNumber(summary.outOfStock)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Alertas de estoque mínimo"
          description="Itens que precisam de reposição imediata."
          className="xl:col-span-1"
        >
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : criticalProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum item abaixo do mínimo. Estoque saudável!
            </p>
          ) : (
            <ul className="space-y-4">
              {criticalProducts.map((product) => (
                <li key={product.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(product.stock)} un. de {formatNumber(product.minStock)} mín.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPresetProduct(product.id);
                        setDialogOpen(true);
                      }}
                    >
                      Repor
                    </Button>
                  </div>
                  <Progress
                    value={Math.min(100, (product.stock / Math.max(product.minStock, 1)) * 100)}
                  />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Movimentações"
          description="Histórico de entradas, saídas e ajustes."
          className="xl:col-span-2"
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por produto ou SKU"
                className="pl-9"
                aria-label="Buscar movimentações"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="sm:w-48" aria-label="Filtrar por tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="entrada">Entradas</SelectItem>
                <SelectItem value="saida">Saídas</SelectItem>
                <SelectItem value="ajuste">Ajustes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-xl" />
              ))}
            </div>
          ) : (
            <StockMovementsTable movements={filteredMovements} />
          )}
        </SectionCard>
      </div>

      <StockMovementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        products={products}
        defaultProductId={presetProduct}
        isPending={mutation.isPending}
        onSubmit={(values) => mutation.mutate(values)}
      />
    </div>
  );
}
