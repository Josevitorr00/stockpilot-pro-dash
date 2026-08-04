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
import type { Product } from "@/types/business";

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

function stockBadge(product: Product) {
  if (product.stock === 0) return { label: "Sem estoque", variant: "destructive" as const };
  if (product.stock <= product.minStock) return { label: "Estoque baixo", variant: "outline" as const };
  return { label: "Disponível", variant: "secondary" as const };
}

export function ProductsTable({ products, onEdit, onDelete }: ProductsTableProps) {
  if (products.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nenhum produto encontrado com os filtros atuais.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead className="hidden md:table-cell">Categoria</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead className="hidden text-right lg:table-cell">Custo</TableHead>
            <TableHead className="text-right">Estoque</TableHead>
            <TableHead className="hidden sm:table-cell">Situação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const badge = stockBadge(product);
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {product.category}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(product.price)}
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground lg:table-cell">
                  {formatCurrency(product.cost)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(product.stock)}
                  <span className="ml-1 text-xs text-muted-foreground">
                    / mín. {formatNumber(product.minStock)}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar ${product.name}`}
                      onClick={() => onEdit(product)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Excluir ${product.name}`}
                      onClick={() => onDelete(product)}
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