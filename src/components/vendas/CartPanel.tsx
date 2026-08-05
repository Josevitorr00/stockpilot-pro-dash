import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import type { PaymentMethod, SaleItem } from "@/types/business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { paymentMethods } from "@/services/mock/salesService";
import { formatCurrency } from "@/lib/format";

interface CartPanelProps {
  items: SaleItem[];
  customer: string;
  method: PaymentMethod;
  discount: number;
  isPending: boolean;
  onCustomerChange: (value: string) => void;
  onMethodChange: (value: PaymentMethod) => void;
  onDiscountChange: (value: number) => void;
  onChangeQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onCheckout: () => void;
}

export function CartPanel({
  items,
  customer,
  method,
  discount,
  isPending,
  onCustomerChange,
  onMethodChange,
  onDiscountChange,
  onChangeQuantity,
  onRemove,
  onClear,
  onCheckout,
}: CartPanelProps) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = Math.max(subtotal - discount, 0);

  return (
    <div className="flex h-full flex-col gap-4">
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
          <ShoppingCart className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Carrinho vazio. Selecione produtos para iniciar a venda.
          </p>
        </div>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {items.map((item) => (
            <li
              key={item.productId}
              className="rounded-xl border border-border bg-background p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.price)} · {item.sku}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Remover ${item.name}`}
                  onClick={() => onRemove(item.productId)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-7"
                    aria-label="Diminuir quantidade"
                    onClick={() => onChangeQuantity(item.productId, -1)}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-7"
                    aria-label="Aumentar quantidade"
                    onClick={() => onChangeQuantity(item.productId, 1)}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-3 border-t border-border pt-4">
        <div className="space-y-1.5">
          <Label htmlFor="pdv-cliente">Cliente</Label>
          <Input
            id="pdv-cliente"
            value={customer}
            onChange={(e) => onCustomerChange(e.target.value)}
            placeholder="Consumidor final"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pdv-pagamento">Pagamento</Label>
            <Select value={method} onValueChange={(value) => onMethodChange(value as PaymentMethod)}>
              <SelectTrigger id="pdv-pagamento">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pdv-desconto">Desconto (R$)</Label>
            <Input
              id="pdv-desconto"
              type="number"
              min={0}
              step="0.01"
              value={discount || ""}
              onChange={(e) => onDiscountChange(Number(e.target.value) || 0)}
              placeholder="0,00"
            />
          </div>
        </div>

        <dl className="space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <dt>Subtotal</dt>
            <dd>{formatCurrency(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <dt>Desconto</dt>
            <dd>-{formatCurrency(Math.min(discount, subtotal))}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold text-foreground">
            <dt>Total</dt>
            <dd>{formatCurrency(total)}</dd>
          </div>
        </dl>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClear}
            disabled={items.length === 0 || isPending}
          >
            Limpar
          </Button>
          <Button
            className="flex-1"
            onClick={onCheckout}
            disabled={items.length === 0 || isPending}
          >
            {isPending ? "Finalizando..." : "Finalizar venda"}
          </Button>
        </div>
      </div>
    </div>
  );
}
