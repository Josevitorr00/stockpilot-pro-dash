import type { Sale } from "@/types/business";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatTime } from "@/lib/format";

interface SalesHistoryTableProps {
  sales: Sale[];
  onCancel: (sale: Sale) => void;
}

export function SalesHistoryTable({ sales, onCancel }: SalesHistoryTableProps) {
  if (sales.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nenhuma venda registrada com os filtros atuais.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[520px]">
        <TableHeader>
          <TableRow>
            <TableHead>Venda</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-center">Itens</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>
                <p className="font-medium text-foreground">{sale.id}</p>
                <p className="text-xs text-muted-foreground">{formatTime(sale.createdAt)}</p>
              </TableCell>
              <TableCell className="text-sm">{sale.customer}</TableCell>
              <TableCell className="text-center text-sm">
                {sale.items.reduce((acc, item) => acc + item.quantity, 0)}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{sale.method}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={sale.status === "Concluída" ? "secondary" : "destructive"}>
                  {sale.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(sale.total)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={sale.status === "Cancelada"}
                  onClick={() => onCancel(sale)}
                >
                  Cancelar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
