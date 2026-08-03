import { AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Product } from "@/types/business";

export function LowStockList({ items }: { items: Product[] }) {
  return (
    <ul className="space-y-4">
      {items.map((product) => {
        const ratio = Math.min(100, Math.round((product.stock / product.minStock) * 100));
        return (
          <li key={product.id} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.sku} · {product.category}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                <AlertTriangle className="size-3" />
                {product.stock}/{product.minStock}
              </span>
            </div>
            <Progress value={ratio} className="h-1.5" />
          </li>
        );
      })}
    </ul>
  );
}