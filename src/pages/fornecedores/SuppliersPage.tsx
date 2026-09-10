import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Plus, Timer, Truck } from "lucide-react";
import { toast } from "sonner";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { SupplierFormDialog } from "@/components/fornecedores/SupplierFormDialog";
import { SuppliersTable } from "@/components/fornecedores/SuppliersTable";
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
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  supplierCategories,
  updateSupplier,
  type SupplierInput,
  type SupplierWithStats,
} from "@/services/data/supplierService";
import { formatNumber } from "@/lib/format";

export function SuppliersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierWithStats | null>(null);
  const [toDelete, setToDelete] = useState<SupplierWithStats | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["suppliers"], queryFn: getSuppliers });
  const suppliers = data ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["suppliers"] });

  const save = useMutation({
    mutationFn: (values: SupplierInput) =>
      editing ? updateSupplier(editing.id, values) : createSupplier(values),
    onSuccess: (supplier) => {
      invalidate();
      setDialogOpen(false);
      setEditing(null);
      toast.success(`${supplier.name} ${editing ? "atualizado" : "cadastrado"} com sucesso.`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removal = useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      invalidate();
      toast.success(`${toDelete?.name} removido dos fornecedores.`);
      setToDelete(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return suppliers.filter((supplier) => {
      const matchesTerm =
        !term ||
        supplier.name.toLowerCase().includes(term) ||
        supplier.contactName.toLowerCase().includes(term) ||
        supplier.email.toLowerCase().includes(term) ||
        supplier.document.toLowerCase().includes(term) ||
        supplier.phone.toLowerCase().includes(term);
      const matchesCategory =
        categoryFilter === "todas" || supplier.categories.includes(categoryFilter);
      return matchesTerm && matchesCategory;
    });
  }, [suppliers, search, categoryFilter]);

  const summary = useMemo(() => {
    const active = suppliers.filter((supplier) => supplier.status === "Ativo");
    const needsOrder = suppliers.filter((supplier) => supplier.stats.lowStock > 0);
    const averageLead = active.length
      ? active.reduce((acc, supplier) => acc + supplier.leadTimeDays, 0) / active.length
      : 0;
    return { active: active.length, needsOrder, averageLead };
  }, [suppliers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Fornecedores</h1>
          <p className="text-sm text-muted-foreground">
            Parceiros de compra, contatos e condições comerciais.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" /> Novo fornecedor
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Fornecedores cadastrados</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <Truck className="size-5 text-primary" /> {formatNumber(suppliers.length)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatNumber(summary.active)} ativos no momento
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Prazo médio de entrega</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <Timer className="size-5 text-primary" />{" "}
            {summary.averageLead.toFixed(1).replace(".", ",")} dias
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Considerando fornecedores ativos</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Com itens para repor</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <AlertTriangle className="size-5 text-primary" />{" "}
            {formatNumber(summary.needsOrder.length)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Categorias com estoque abaixo do mínimo
          </p>
        </div>
      </div>

      {summary.needsOrder.length > 0 && (
        <SectionCard
          title="Sugestões de compra"
          description="Fornecedores que atendem categorias com estoque crítico."
        >
          <ul className="space-y-3">
            {summary.needsOrder.map((supplier) => (
              <li
                key={supplier.id}
                className="flex flex-col gap-1 rounded-xl border border-border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{supplier.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {supplier.categories.join(", ")} · {supplier.paymentTerms} · entrega em{" "}
                    {formatNumber(supplier.leadTimeDays)} dia(s)
                  </p>
                </div>
                <p className="text-sm font-semibold text-destructive">
                  {formatNumber(supplier.stats.lowStock)} item(ns) abaixo do mínimo
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <SectionCard
        title="Cadastro de fornecedores"
        description="Busque, filtre por categoria e mantenha as condições atualizadas."
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, contato, CNPJ, telefone ou e-mail"
            aria-label="Buscar fornecedores"
            className="flex-1"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="sm:w-52" aria-label="Filtrar por categoria">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {supplierCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : (
          <SuppliersTable
            suppliers={filtered}
            onEdit={(supplier) => {
              setEditing(supplier);
              setDialogOpen(true);
            }}
            onDelete={setToDelete}
          />
        )}
      </SectionCard>

      <SupplierFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        supplier={editing}
        isPending={save.isPending}
        onSubmit={(values) => save.mutate(values)}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              O fornecedor será removido do cadastro. Produtos e estoque não são alterados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                if (toDelete) removal.mutate(toDelete.id);
              }}
            >
              {removal.isPending ? "Excluindo..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}