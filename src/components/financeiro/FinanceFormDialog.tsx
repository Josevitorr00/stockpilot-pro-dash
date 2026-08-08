import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  expenseCategories,
  financeMethods,
  financeStatuses,
  revenueCategories,
  type FinanceInput,
} from "@/services/mock/financeService";
import type { FinanceEntry, FinanceStatus, FinanceType } from "@/types/business";
import { cn } from "@/lib/utils";

interface FinanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: FinanceEntry | null;
  onSubmit: (values: FinanceInput) => void;
  isPending?: boolean;
}

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm: FinanceInput = {
  description: "",
  type: "despesa",
  category: "Fornecedores",
  amount: 0,
  dueDate: new Date().toISOString(),
  paidAt: null,
  status: "Pendente",
  method: "Pix",
  counterparty: "",
  notes: "",
};

export function FinanceFormDialog({
  open,
  onOpenChange,
  entry,
  onSubmit,
  isPending,
}: FinanceFormDialogProps) {
  const [form, setForm] = useState<FinanceInput>(emptyForm);
  const [dueDate, setDueDate] = useState(todayInput());
  const [errors, setErrors] = useState<Partial<Record<keyof FinanceInput, string>>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (entry) {
      setForm({
        description: entry.description,
        type: entry.type,
        category: entry.category,
        amount: entry.amount,
        dueDate: entry.dueDate,
        paidAt: entry.paidAt,
        status: entry.status,
        method: entry.method,
        counterparty: entry.counterparty,
        notes: entry.notes,
      });
      setDueDate(entry.dueDate.slice(0, 10));
    } else {
      setForm(emptyForm);
      setDueDate(todayInput());
    }
  }, [open, entry]);

  function setField<K extends keyof FinanceInput>(key: K, value: FinanceInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function changeType(type: FinanceType) {
    setForm((prev) => ({
      ...prev,
      type,
      category: type === "receita" ? "Vendas" : "Fornecedores",
    }));
  }

  const categories = form.type === "receita" ? revenueCategories : expenseCategories;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof FinanceInput, string>> = {};
    if (!form.description.trim()) nextErrors.description = "Descreva o lançamento.";
    if (!Number.isFinite(form.amount) || form.amount <= 0)
      nextErrors.amount = "Informe um valor maior que zero.";
    if (!dueDate) nextErrors.dueDate = "Informe a data de vencimento.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const dueIso = new Date(`${dueDate}T12:00:00`).toISOString();
    onSubmit({
      ...form,
      description: form.description.trim(),
      counterparty: form.counterparty.trim(),
      notes: form.notes.trim(),
      dueDate: dueIso,
      paidAt: form.status === "Pago" ? (form.paidAt ?? dueIso) : null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{entry ? "Editar lançamento" : "Novo lançamento"}</DialogTitle>
          <DialogDescription>
            Registre contas a pagar e a receber para acompanhar o fluxo de caixa.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-2">
            {(["receita", "despesa"] as FinanceType[]).map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={form.type === type}
                onClick={() => changeType(type)}
                className={cn(
                  "rounded-xl border border-border px-3 py-2 text-sm font-medium capitalize transition-colors",
                  form.type === type
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted",
                )}
              >
                {type === "receita" ? "Receita" : "Despesa"}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fin-descricao">Descrição</Label>
            <Input
              id="fin-descricao"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Compra de mercearia, aluguel, recebimento..."
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fin-valor">Valor (R$)</Label>
              <Input
                id="fin-valor"
                type="number"
                min={0}
                step="0.01"
                value={form.amount}
                onChange={(e) => setField("amount", Number(e.target.value))}
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fin-vencimento">Vencimento</Label>
              <Input
                id="fin-vencimento"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="fin-categoria">Categoria</Label>
              <Select value={form.category} onValueChange={(value) => setField("category", value)}>
                <SelectTrigger id="fin-categoria">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fin-forma">Forma</Label>
              <Select value={form.method} onValueChange={(value) => setField("method", value)}>
                <SelectTrigger id="fin-forma">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {financeMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fin-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setField("status", value as FinanceStatus)}
              >
                <SelectTrigger id="fin-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {financeStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fin-parte">Cliente / Fornecedor</Label>
            <Input
              id="fin-parte"
              value={form.counterparty}
              onChange={(e) => setField("counterparty", e.target.value)}
              placeholder="Quem paga ou recebe"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fin-obs">Observações</Label>
            <Textarea
              id="fin-obs"
              rows={3}
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder="Parcelas, número do boleto, acordo..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : entry ? "Salvar alterações" : "Registrar lançamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}