import { Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/format";
import { unitCost } from "@/lib/pricing";
import type { Product } from "@/types/business";
interface ProductsTableProps { products: Product[]; onEdit: (product: Product) => void; onDelete: (product: Product) => void; }
export function ProductsTable({ products, onEdit, onDelete }: ProductsTableProps) {
  if (!products.length) return <p className="py-10 text-center text-sm text-muted-foreground">Nenhum produto encontrado com os filtros atuais.</p>;
  return <div className="overflow-x-auto"><Table className="min-w-[1050px]">
    <TableHeader><TableRow><TableHead>Produto</TableHead><TableHead>Categoria</TableHead><TableHead className="text-right">Custo por fardo</TableHead><TableHead className="text-right">Unidades por fardo</TableHead><TableHead className="text-right">Preço por unidade</TableHead><TableHead className="text-right">Lucro bruto por unidade</TableHead><TableHead className="text-right">Estoque (fardos)</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
    <TableBody>{products.map(product => {
      const cost = unitCost(product.costPerBale, product.unitsPerBale);
      const profit = cost === null || !Number.isFinite(product.price) ? null : product.price - cost;
      return <TableRow key={product.id}><TableCell className="font-medium">{product.name}</TableCell><TableCell className="text-muted-foreground">{product.category}</TableCell><TableCell className="text-right">{cost === null ? "—" : formatCurrency(product.costPerBale)}</TableCell><TableCell className="text-right">{cost === null ? "—" : formatNumber(product.unitsPerBale)}</TableCell><TableCell className="text-right">{Number.isFinite(product.price) ? formatCurrency(product.price) : "—"}</TableCell><TableCell className={`text-right font-medium ${profit === null || profit === 0 ? "text-muted-foreground" : profit > 0 ? "text-success" : "text-destructive"}`}>{profit === null ? "—" : formatCurrency(profit)}</TableCell><TableCell className="text-right">{product.stockTracked && cost !== null ? formatNumber(product.stock / product.unitsPerBale) : "—"}</TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" title="Editar produto" aria-label={`Editar ${product.name}`} onClick={() => onEdit(product)}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" title="Excluir produto" aria-label={`Excluir ${product.name}`} onClick={() => onDelete(product)}><Trash2 className="size-4 text-destructive" /></Button></div></TableCell></TableRow>;
    })}</TableBody>
  </Table></div>;
}
