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
import type { SupplierWithStats } from "@/services/data/supplierService";

interface SuppliersTableProps {
  suppliers: SupplierWithStats[];
  onEdit: (supplier: SupplierWithStats) => void;
  onDelete: (supplier: SupplierWithStats) => void;
}

export function SuppliersTable({ suppliers, onEdit, onDelete }: SuppliersTableProps) {
  if (suppliers.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nenhum fornecedor encontrado com os filtros atuais.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead>Fornecedor</TableHead>
            <TableHead className="hidden md:table-cell">Contato</TableHead>
            <TableHead className="hidden lg:table-cell">Categorias</TableHead>
            <TableHead className="hidden sm:table-cell">Condição</TableHead>
            <TableHead className="text-right">Itens</TableHead>
            <TableHead className="hidden text-right xl:table-cell">Custo em estoque</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell>
                <p className="font-medium text-foreground">{supplier.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={supplier.status === "Ativo" ? "secondary" : "outline"}>
                    {supplier.status}
                  </Badge>
                  {supplier.document && (
                    <span className="text-xs text-muted-foreground">{supplier.document}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                <p className="text-sm">{supplier.contactName || "—"}</p>
                <p className="text-xs">{supplier.phone}</p>
                {supplier.email && <p className="text-xs">{supplier.email}</p>}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex flex-wrap gap-1">
                  {supplier.categories.map((category) => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground">
                <p className="text-sm">{supplier.paymentTerms}</p>
                <p className="text-xs">Entrega em {formatNumber(supplier.leadTimeDays)} dia(s)</p>
              </TableCell>
              <TableCell className="text-right">
                <p>{formatNumber(supplier.stats.products)}</p>
                {supplier.stats.lowStock > 0 && (
                  <p className="text-xs text-destructive">
                    {formatNumber(supplier.stats.lowStock)} p/ repor
                  </p>
                )}
              </TableCell>
              <TableCell className="hidden text-right font-medium xl:table-cell">
                {formatCurrency(supplier.stats.stockCost)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${supplier.name}`}
                    onClick={() => onEdit(supplier)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir ${supplier.name}`}
                    onClick={() => onDelete(supplier)}
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