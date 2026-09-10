import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Plus, Search, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import {
  createProduct,
  deleteProduct,
  getProducts,
  productCategories,
  updateProduct,
  type ProductInput,
} from "@/services/data/productService";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { ProductsTable } from "@/components/produtos/ProductsTable";
import { ProductFormDialog } from "@/components/produtos/ProductFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Product } from "@/types/business";

export function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todas");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  const createMutation = useMutation({
    mutationFn: (values: ProductInput) => createProduct(values),
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
      toast.success("Produto cadastrado com sucesso.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ProductInput }) => updateProduct(id, values),
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
      toast.success("Produto atualizado.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      invalidate();
      setDeleting(null);
      toast.success("Produto excluído.");
    },
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (products ?? []).filter((product) => {
      const matchesTerm =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term);
      const matchesCategory = category === "todas" || product.category === category;
      return matchesTerm && matchesCategory;
    });
  }, [products, search, category]);

  const summary = useMemo(() => {
    const list = products ?? [];
    return {
      total: list.length,
      lowStock: list.filter((p) => p.stock <= p.minStock).length,
      stockValue: list.reduce((acc, p) => acc + p.cost * p.stock, 0),
    };
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre, edite e organize o catálogo do seu comércio.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" /> Novo produto
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Itens cadastrados</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <Package className="size-5 text-primary" /> {formatNumber(summary.total)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Abaixo do mínimo</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <TriangleAlert className="size-5 text-destructive" /> {formatNumber(summary.lowStock)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Valor de custo em estoque</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatCurrency(summary.stockValue)}
          </p>
        </div>
      </div>

      <SectionCard title="Catálogo" description="Busque por nome ou código e filtre por categoria.">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou SKU"
              className="pl-9"
              aria-label="Buscar produtos"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="sm:w-52" aria-label="Filtrar por categoria">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {productCategories.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
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
          <ProductsTable
            products={filtered}
            onEdit={(product) => {
              setEditing(product);
              setFormOpen(true);
            }}
            onDelete={(product) => setDeleting(product)}
          />
        )}
      </SectionCard>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={(values) => {
          if (editing) updateMutation.mutate({ id: editing.id, values });
          else createMutation.mutate(values);
        }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.name} será removido do catálogo. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && deleteMutation.mutate(deleting.id)}
              disabled={deleteMutation.isPending}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}