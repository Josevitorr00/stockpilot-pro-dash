import { Pencil, Trash2 } from "lucide-react";
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
import { formatCurrency, formatNumber } from "@/lib/format";
import type { CustomerWithStats } from "@/services/mock/customerService";

interface CustomersTableProps {
  customers: CustomerWithStats[];
  onEdit: (customer: CustomerWithStats) => void;
  onDelete: (customer: CustomerWithStats) => void;
}

function formatDate(iso: string | null) {
  if (!iso) return "Sem compras";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function CustomersTable({ customers, onEdit, onDelete }: CustomersTableProps) {
  if (customers.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nenhum cliente encontrado com os filtros atuais.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden md:table-cell">Contato</TableHead>
            <TableHead className="hidden lg:table-cell">Cidade</TableHead>
            <TableHead className="text-right">Compras</TableHead>
            <TableHead className="text-right">Total gasto</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Última compra</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <p className="font-medium text-foreground">{customer.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary">{customer.type}</Badge>
                  {customer.document && (
                    <span className="text-xs text-muted-foreground">{customer.document}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                <p className="text-sm">{customer.phone}</p>
                {customer.email && <p className="text-xs">{customer.email}</p>}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground">
                {customer.city || "—"}
              </TableCell>
              <TableCell className="text-right">{formatNumber(customer.stats.orders)}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(customer.stats.revenue)}
              </TableCell>
              <TableCell className="hidden text-right text-muted-foreground sm:table-cell">
                {formatDate(customer.stats.lastPurchase)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${customer.name}`}
                    onClick={() => onEdit(customer)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir ${customer.name}`}
                    onClick={() => onDelete(customer)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
