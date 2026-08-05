import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/format";
import type { StockMovement, StockMovementType } from "@/types/business";

const typeMeta: Record<
  StockMovementType,
  { label: string; icon: typeof ArrowUpRight; variant: "secondary" | "outline" | "destructive" }
> = {
  entrada: { label: "Entrada", icon: ArrowDownLeft, variant: "secondary" },
  saida: { label: "Saída", icon: ArrowUpRight, variant: "destructive" },
  ajuste: { label: "Ajuste", icon: Scale, variant: "outline" },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StockMovementsTable({ movements }: { movements: StockMovement[] }) {
  if (movements.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nenhuma movimentação encontrada com os filtros atuais.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Qtd.</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Saldo</TableHead>
            <TableHead className="hidden md:table-cell">Observação</TableHead>
            <TableHead className="hidden text-right lg:table-cell">Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => {
            const meta = typeMeta[movement.type];
            const Icon = meta.icon;
            return (
              <TableRow key={movement.id}>
                <TableCell>
                  <p className="font-medium text-foreground">{movement.productName}</p>
                  <p className="text-xs text-muted-foreground">{movement.sku}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={meta.variant} className="gap-1">
                    <Icon className="size-3" /> {meta.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {movement.type === "saida" ? "-" : movement.type === "entrada" ? "+" : ""}
                  {formatNumber(movement.quantity)}
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground sm:table-cell">
                  {formatNumber(movement.resultingStock)}
                </TableCell>
                <TableCell className="hidden max-w-64 truncate md:table-cell text-muted-foreground">
                  {movement.reason}
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground lg:table-cell">
                  {formatDateTime(movement.createdAt)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
