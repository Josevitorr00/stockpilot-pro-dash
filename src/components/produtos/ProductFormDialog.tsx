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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productCategories, type ProductInput } from "@/services/data/productService";
import type { Product } from "@/types/business";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSubmit: (values: ProductInput) => void;
  isPending?: boolean;
}

const emptyForm = {
  name: "",
  sku: "",
  category: productCategories[0] as string,
  price: "",
  cost: "",
  stock: "",
  minStock: "",
};

type FormState = typeof emptyForm;

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  isPending,
}: ProductFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      product
        ? {
            name: product.name,
            sku: product.sku,
            category: product.category,
            price: String(product.price),
            cost: String(product.cost),
            stock: String(product.stock),
            minStock: String(product.minStock),
          }
        : emptyForm,
    );
  }, [open, product]);

  function setField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Informe o nome do produto.";
    if (!form.sku.trim()) nextErrors.sku = "Informe o código (SKU).";
    const price = Number(form.price.replace(",", "."));
    const cost = Number(form.cost.replace(",", "."));
    const stock = Number(form.stock);
    const minStock = Number(form.minStock);
    if (!Number.isFinite(price) || price <= 0) nextErrors.price = "Preço deve ser maior que zero.";
    if (!Number.isFinite(cost) || cost < 0) nextErrors.cost = "Custo inválido.";
    if (!Number.isInteger(stock) || stock < 0) nextErrors.stock = "Quantidade inválida.";
    if (!Number.isInteger(minStock) || minStock < 0) nextErrors.minStock = "Mínimo inválido.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      category: form.category,
      price,
      cost,
      stock,
      minStock,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? "Editar produto" : "Novo produto"}</DialogTitle>
          <DialogDescription>
            Preencha os dados do item para manter o catálogo atualizado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Ex.: Arroz Tipo 1 5kg"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">Código / SKU</Label>
              <Input
                id="sku"
                value={form.sku}
                onChange={(e) => setField("sku", e.target.value)}
                placeholder="ARZ-5KG"
              />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={form.category} onValueChange={(value) => setField("category", value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Preço de venda (R$)</Label>
              <Input
                id="price"
                inputMode="decimal"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                placeholder="0,00"
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Preço de custo (R$)</Label>
              <Input
                id="cost"
                inputMode="decimal"
                value={form.cost}
                onChange={(e) => setField("cost", e.target.value)}
                placeholder="0,00"
              />
              {errors.cost && <p className="text-xs text-destructive">{errors.cost}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stock">Estoque atual</Label>
              <Input
                id="stock"
                inputMode="numeric"
                value={form.stock}
                onChange={(e) => setField("stock", e.target.value)}
                placeholder="0"
              />
              {errors.stock && <p className="text-xs text-destructive">{errors.stock}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Estoque mínimo</Label>
              <Input
                id="minStock"
                inputMode="numeric"
                value={form.minStock}
                onChange={(e) => setField("minStock", e.target.value)}
                placeholder="0"
              />
              {errors.minStock && <p className="text-xs text-destructive">{errors.minStock}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {product ? "Salvar alterações" : "Cadastrar produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}