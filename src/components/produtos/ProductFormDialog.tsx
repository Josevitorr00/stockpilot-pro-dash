import { useEffect, useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productCategories, type ProductInput } from "@/services/data/productService";
import { parseDecimal, stockUnits, unitCost } from "@/lib/pricing";
import type { Product } from "@/types/business";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSubmit: (values: ProductInput) => void;
  isPending?: boolean;
}
const emptyForm = { name: "", category: productCategories[0] as string, cost: "", units: "", price: "", stock: "" };
type FormState = typeof emptyForm;
export function ProductFormDialog({ open, onOpenChange, product, onSubmit, isPending }: ProductFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(product ? { name: product.name, category: product.category, cost: String(product.costPerBale), units: String(product.unitsPerBale), price: String(product.price), stock: product.stockTracked ? String(product.stock / product.unitsPerBale) : "" } : emptyForm);
  }, [open, product]);
  function setField(key: keyof FormState, value: string) { setForm(prev => ({ ...prev, [key]: value })); }
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Partial<Record<keyof FormState, string>> = {};
    const cost = parseDecimal(form.cost), units = parseDecimal(form.units), price = parseDecimal(form.price), bales = parseDecimal(form.stock);
    if (!form.name.trim()) next.name = "Informe o nome do produto.";
    if (!form.category) next.category = "Selecione a categoria.";
    if (cost === null || cost < 0) next.cost = "Informe um custo igual ou maior que zero.";
    if (units === null || !Number.isSafeInteger(units) || units <= 0) next.units = "Informe um número inteiro maior que zero.";
    if (price === null || price <= 0) next.price = "Informe um preço maior que zero.";
    const inventory = units === null ? null : stockUnits(bales, units);
    if (form.stock.trim() && (bales === null || inventory === null)) next.stock = "Informe fardos que correspondam a uma quantidade inteira de unidades.";
    setErrors(next);
    const costPerUnit = unitCost(cost, units);
    if (Object.keys(next).length || cost === null || units === null || price === null || costPerUnit === null) return;
    onSubmit({ name: form.name.trim(), category: form.category, costPerBale: cost, unitsPerBale: units, price, cost: costPerUnit, stock: inventory ?? product?.stock ?? 0, stockTracked: Boolean(form.stock.trim()), sku: product?.sku ?? "", minStock: product?.minStock ?? 0 });
  }
  const fields = [ ["cost", "Custo por fardo (R$)"], ["units", "Unidades por fardo"], ["price", "Preço de venda por unidade (R$)"], ["stock", "Estoque (fardos) — opcional"] ] as const;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
    <DialogHeader><DialogTitle>{product ? "Editar produto" : "Novo produto"}</DialogTitle><DialogDescription>Dados do produto</DialogDescription></DialogHeader>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2"><Label htmlFor="name">Nome do produto</Label><Input id="name" value={form.name} onChange={e => setField("name", e.target.value)} aria-invalid={Boolean(errors.name)} />{errors.name && <p className="text-xs text-destructive">{errors.name}</p>}</div>
      <div className="space-y-2"><Label htmlFor="category">Categoria</Label><Select value={form.category} onValueChange={value => setField("category", value)}><SelectTrigger id="category"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{[...new Set([...productCategories, ...(product?.category ? [product.category] : [])])].map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select></div>
      <div className="grid gap-4 sm:grid-cols-2">{fields.map(([key, label]) => <div key={key} className="space-y-2"><Label htmlFor={key}>{label}</Label><Input id={key} inputMode={key === "units" ? "numeric" : "decimal"} value={form[key]} onChange={e => setField(key, e.target.value)} placeholder={key === "stock" ? "Não informado" : ""} aria-invalid={Boolean(errors[key])} />{errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}</div>)}</div>
      <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={isPending}>{isPending ? "Salvando..." : product ? "Salvar alterações" : "Cadastrar produto"}</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>;
}
