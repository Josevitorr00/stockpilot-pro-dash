import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RecentSale } from "@/types/business";
import { formatCurrency, formatTime } from "@/lib/format";

const statusVariant: Record<RecentSale["status"], "default" | "secondary" | "destructive"> = {
  Concluída: "default",
  Pendente: "secondary",
  Cancelada: "destructive",
};

export function RecentSalesTable({ sales }: { sales: RecentSale[] }) {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[480px]">
        <TableHeader>
          <TableRow>
            <TableHead>Venda</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden md:table-cell">Pagamento</TableHead>
            <TableHead className="hidden sm:table-cell">Hora</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-medium">{sale.id}</TableCell>
              <TableCell className="max-w-40 truncate">{sale.customer}</TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {sale.method}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground">
                {formatTime(sale.createdAt)}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[sale.status]}>{sale.status}</Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(sale.total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}