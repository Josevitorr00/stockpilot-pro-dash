import { Search } from "lucide-react";
import type { Product } from "@/types/business";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/format";

interface ProductPickerProps {
  products: Product[];
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (product: Product) => void;
}

export function ProductPicker({ products, search, onSearchChange, onSelect }: ProductPickerProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar produto por nome ou SKU"
          className="pl-9"
          aria-label="Buscar produto"
        />
      </div>

      {products.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nenhum produto encontrado para esta busca.
        </p>
      ) : (
        <div className="grid max-h-[26rem] grid-cols-2 gap-3 overflow-y-auto pr-1 lg:grid-cols-3">
          {products.map((product) => {
            const disabled = product.stock <= 0;
            return (
              <button
                key={product.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(product)}
                className="flex flex-col justify-between gap-2 rounded-xl border border-border bg-background p-3 text-left transition hover:border-primary hover:shadow-[var(--shadow-card)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(product.price)}
                  </span>
                  <Badge variant={disabled ? "destructive" : "secondary"}>
                    {disabled ? "Sem estoque" : `${formatNumber(product.stock)} un.`}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
