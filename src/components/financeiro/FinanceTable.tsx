import { ArrowDownCircle, ArrowUpCircle, Check, Pencil, Trash2, Undo2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FinanceEntry } from "@/types/business";

interface FinanceTableProps {
  entries: FinanceEntry[];
  onEdit: (entry: FinanceEntry) => void;
  onDelete: (entry: FinanceEntry) => void;
  onToggleStatus: (entry: FinanceEntry) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function isOverdue(entry: FinanceEntry) {
  return entry.status === "Pendente" && new Date(entry.dueDate).getTime() < Date.now();
}

export function FinanceTable({ entries, onEdit, onDelete, onToggleStatus }: FinanceTableProps) {
  if (entries.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nenhum lançamento encontrado com os filtros atuais.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[620px]">
        <TableHeader>
          <TableRow>
            <TableHead>Lançamento</TableHead>
            <TableHead className="hidden md:table-cell">Categoria</TableHead>
            <TableHead className="hidden sm:table-cell">Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const receita = entry.type === "receita";
            const overdue = isOverdue(entry);
            return (
              <TableRow key={entry.id}>
                <TableCell>
                  <div className="flex items-start gap-2">
                    {receita ? (
                      <ArrowUpCircle className="mt-0.5 size-4 text-primary" />
                    ) : (
                      <ArrowDownCircle className="mt-0.5 size-4 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{entry.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.counterparty || "—"} · {entry.method}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="text-xs">
                    {entry.category}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                  {formatDate(entry.dueDate)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={entry.status === "Pago" ? "secondary" : overdue ? "destructive" : "outline"}
                  >
                    {entry.status === "Pago" ? "Pago" : overdue ? "Vencido" : "Pendente"}
                  </Badge>
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium",
                    receita ? "text-primary" : "text-destructive",
                  )}
                >
                  {receita ? "+" : "−"} {formatCurrency(entry.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={
                        entry.status === "Pago"
                          ? `Reabrir ${entry.description}`
                          : `Marcar ${entry.description} como pago`
                      }
                      onClick={() => onToggleStatus(entry)}
                    >
                      {entry.status === "Pago" ? (
                        <Undo2 className="size-4" />
                      ) : (
                        <Check className="size-4 text-primary" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar ${entry.description}`}
                      onClick={() => onEdit(entry)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Excluir ${entry.description}`}
                      onClick={() => onDelete(entry)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}