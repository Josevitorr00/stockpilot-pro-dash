import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Crown, Plus, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { CustomerFormDialog } from "@/components/clientes/CustomerFormDialog";
import { CustomersTable } from "@/components/clientes/CustomersTable";
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
  createCustomer,
  customerTypes,
  deleteCustomer,
  getCustomers,
  updateCustomer,
  type CustomerInput,
  type CustomerWithStats,
} from "@/services/data/customerService";
import { formatCurrency, formatNumber } from "@/lib/format";

export function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerWithStats | null>(null);
  const [toDelete, setToDelete] = useState<CustomerWithStats | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });
  const customers = data ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["customers"] });

  const save = useMutation({
    mutationFn: (values: CustomerInput) =>
      editing ? updateCustomer(editing.id, values) : createCustomer(values),
    onSuccess: (customer) => {
      invalidate();
      setDialogOpen(false);
      setEditing(null);
      toast.success(`${customer.name} ${editing ? "atualizado" : "cadastrado"} com sucesso.`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removal = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      invalidate();
      toast.success(`${toDelete?.name} removido da base de clientes.`);
      setToDelete(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesTerm =
        !term ||
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.document.toLowerCase().includes(term) ||
        customer.phone.toLowerCase().includes(term);
      const matchesType = typeFilter === "todos" || customer.type === typeFilter;
      return matchesTerm && matchesType;
    });
  }, [customers, search, typeFilter]);

  const summary = useMemo(() => {
    const revenue = customers.reduce((acc, customer) => acc + customer.stats.revenue, 0);
    const active = customers.filter((customer) => customer.stats.orders > 0).length;
    const top = [...customers].sort((a, b) => b.stats.revenue - a.stats.revenue)[0];
    return { revenue, active, top };
  }, [customers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Base de clientes, contatos e histórico de compras no PDV.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" /> Novo cliente
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <Users className="size-5 text-primary" /> {formatNumber(customers.length)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatNumber(summary.active)} com compras registradas
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Receita da carteira</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <Wallet className="size-5 text-primary" /> {formatCurrency(summary.revenue)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Somatório das vendas concluídas</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Melhor cliente</p>
          <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Crown className="size-5 text-primary" /> {summary.top?.name ?? "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {summary.top ? formatCurrency(summary.top.stats.revenue) : "Sem vendas registradas"}
          </p>
        </div>
      </div>

      <SectionCard title="Base de clientes" description="Busque, filtre e mantenha os cadastros atualizados.">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, documento, telefone ou e-mail"
            aria-label="Buscar clientes"
            className="flex-1"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="sm:w-52" aria-label="Filtrar por tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              {customerTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
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
          <CustomersTable
            customers={filtered}
            onEdit={(customer) => {
              setEditing(customer);
              setDialogOpen(true);
            }}
            onDelete={setToDelete}
          />
        )}
      </SectionCard>

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        customer={editing}
        isPending={save.isPending}
        onSubmit={(values) => save.mutate(values)}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              O cadastro será removido da base. O histórico de vendas não é alterado.
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
