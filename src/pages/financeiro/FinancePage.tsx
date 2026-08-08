import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, Plus, Wallet } from "lucide-react";
import { toast } from "sonner";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { CashFlowChart } from "@/components/financeiro/CashFlowChart";
import { FinanceFormDialog } from "@/components/financeiro/FinanceFormDialog";
import { FinanceTable } from "@/components/financeiro/FinanceTable";
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
  createFinanceEntry,
  deleteFinanceEntry,
  getFinanceData,
  toggleFinanceStatus,
  updateFinanceEntry,
  type FinanceInput,
} from "@/services/mock/financeService";
import { formatCurrency } from "@/lib/format";
import type { FinanceEntry } from "@/types/business";

export function FinancePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FinanceEntry | null>(null);
  const [toDelete, setToDelete] = useState<FinanceEntry | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["finance"], queryFn: getFinanceData });
  const entries = data?.entries ?? [];
  const summary = data?.summary;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["finance"] });

  const save = useMutation({
    mutationFn: (values: FinanceInput) =>
      editing ? updateFinanceEntry(editing.id, values) : createFinanceEntry(values),
    onSuccess: (entry) => {
      invalidate();
      setDialogOpen(false);
      setEditing(null);
      toast.success(`${entry.description} ${editing ? "atualizado" : "registrado"} com sucesso.`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggle = useMutation({
    mutationFn: (id: string) => toggleFinanceStatus(id),
    onSuccess: (entry) => {
      invalidate();
      toast.success(
        entry.status === "Pago"
          ? `${entry.description} marcado como pago.`
          : `${entry.description} voltou para pendente.`,
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removal = useMutation({
    mutationFn: (id: string) => deleteFinanceEntry(id),
    onSuccess: () => {
      invalidate();
      toast.success(`${toDelete?.description} removido do financeiro.`);
      setToDelete(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesTerm =
        !term ||
        entry.description.toLowerCase().includes(term) ||
        entry.counterparty.toLowerCase().includes(term) ||
        entry.category.toLowerCase().includes(term);
      const matchesType = typeFilter === "todos" || entry.type === typeFilter;
      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "vencidos"
          ? entry.status === "Pendente" && new Date(entry.dueDate).getTime() < Date.now()
          : entry.status === statusFilter);
      return matchesTerm && matchesType && matchesStatus;
    });
  }, [entries, search, typeFilter, statusFilter]);

  const overdue = useMemo(
    () =>
      entries.filter(
        (entry) => entry.status === "Pendente" && new Date(entry.dueDate).getTime() < Date.now(),
      ),
    [entries],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Contas a pagar, a receber e o fluxo de caixa do negócio.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" /> Novo lançamento
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Saldo do caixa</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <Wallet className="size-5 text-primary" /> {formatCurrency(summary?.balance ?? 0)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Inclui {formatCurrency(summary?.posRevenue ?? 0)} do PDV
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">A receber</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <ArrowUpCircle className="size-5 text-primary" /> {formatCurrency(summary?.toReceive ?? 0)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Recebido: {formatCurrency(summary?.received ?? 0)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">A pagar</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <ArrowDownCircle className="size-5 text-destructive" /> {formatCurrency(summary?.toPay ?? 0)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Pago: {formatCurrency(summary?.paid ?? 0)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Vencidos</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <AlertTriangle className="size-5 text-primary" /> {formatCurrency(summary?.overdue ?? 0)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {overdue.length} lançamento(s) em atraso
          </p>
        </div>
      </div>

      <SectionCard
        title="Fluxo de caixa"
        description="Receitas e despesas por mês de vencimento."
      >
        {isLoading ? (
          <Skeleton className="h-72 rounded-xl" />
        ) : (
          <CashFlowChart data={data?.cashFlow ?? []} />
        )}
      </SectionCard>

      {overdue.length > 0 && (
        <SectionCard title="Em atraso" description="Lançamentos pendentes com vencimento passado.">
          <ul className="space-y-3">
            {overdue.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-1 rounded-xl border border-border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{entry.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.counterparty || entry.category} · venceu em{" "}
                    {new Date(entry.dueDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-destructive">
                    {formatCurrency(entry.amount)}
                  </p>
                  <Button size="sm" variant="outline" onClick={() => toggle.mutate(entry.id)}>
                    Marcar como pago
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <SectionCard
        title="Lançamentos"
        description="Busque, filtre por tipo e status e mantenha o caixa em dia."
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por descrição, categoria ou parte envolvida"
            aria-label="Buscar lançamentos"
            className="flex-1"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="sm:w-44" aria-label="Filtrar por tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="receita">Receitas</SelectItem>
              <SelectItem value="despesa">Despesas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-44" aria-label="Filtrar por status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="Pago">Pagos</SelectItem>
              <SelectItem value="Pendente">Pendentes</SelectItem>
              <SelectItem value="vencidos">Vencidos</SelectItem>
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
          <FinanceTable
            entries={filtered}
            onEdit={(entry) => {
              setEditing(entry);
              setDialogOpen(true);
            }}
            onDelete={setToDelete}
            onToggleStatus={(entry) => toggle.mutate(entry.id)}
          />
        )}
      </SectionCard>

      <FinanceFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        entry={editing}
        isPending={save.isPending}
        onSubmit={(values) => save.mutate(values)}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.description} será removido do financeiro. Essa ação não pode ser desfeita.
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