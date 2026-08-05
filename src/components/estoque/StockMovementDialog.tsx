import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StockMovementInput } from "@/services/mock/stockService";
import type { Product, StockMovementType } from "@/types/business";

interface StockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  defaultProductId?: string | null;
  defaultType?: StockMovementType;
  isPending?: boolean;
  onSubmit: (values: StockMovementInput) => void;
}

const typeLabels: Record<StockMovementType, string> = {
  entrada: "Entrada",
  saida: "Saída",
  ajuste: "Ajuste de inventário",
};

export function StockMovementDialog({
  open,
  onOpenChange,
  products,
  defaultProductId,
  defaultType = "entrada",
  isPending,
  onSubmit,
}: StockMovementDialogProps) {
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<StockMovementType>(defaultType);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{ productId?: string; quantity?: string }>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setQuantity("");
    setReason("");
    setType(defaultType);
    setProductId(defaultProductId ?? products[0]?.id ?? "");
  }, [open, defaultProductId, defaultType, products]);

  const selected = products.find((product) => product.id === productId);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: { productId?: string; quantity?: string } = {};
    if (!productId) next.productId = "Selecione um produto.";
    const value = Number(quantity);
    if (!Number.isInteger(value) || value < 0 || (type !== "ajuste" && value <= 0)) {
      next.quantity = "Informe uma quantidade válida.";
    } else if (type === "saida" && selected && value > selected.stock) {
      next.quantity = `Disponível apenas ${selected.stock} un.`;
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit({ productId, type, quantity: value, reason });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova movimentação</DialogTitle>
          <DialogDescription>
            Registre entradas, saídas ou ajustes de inventário do estoque.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="movement-product">Produto</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger id="movement-product">
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selected && (
              <p className="text-xs text-muted-foreground">
                Estoque atual: {selected.stock} un. · mínimo {selected.minStock} un.
              </p>
            )}
            {errors.productId && <p className="text-xs text-destructive">{errors.productId}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="movement-type">Tipo</Label>
              <Select value={type} onValueChange={(value) => setType(value as StockMovementType)}>
                <SelectTrigger id="movement-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(typeLabels) as StockMovementType[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {typeLabels[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="movement-qty">
                {type === "ajuste" ? "Estoque contado" : "Quantidade"}
              </Label>
              <Input
                id="movement-qty"
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
              />
              {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="movement-reason">Observação</Label>
            <Textarea
              id="movement-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex.: compra fornecedor, perda, inventário mensal"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              Registrar movimentação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
