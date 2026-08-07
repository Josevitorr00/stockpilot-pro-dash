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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  paymentTermsOptions,
  supplierCategories,
  supplierStatuses,
  type SupplierInput,
} from "@/services/mock/supplierService";
import type { Supplier, SupplierStatus } from "@/types/business";
import { cn } from "@/lib/utils";

interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onSubmit: (values: SupplierInput) => void;
  isPending?: boolean;
}

const emptyForm: SupplierInput = {
  name: "",
  document: "",
  contactName: "",
  phone: "",
  email: "",
  city: "",
  categories: [],
  paymentTerms: "À vista",
  leadTimeDays: 3,
  status: "Ativo",
  notes: "",
};

export function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
  onSubmit,
  isPending,
}: SupplierFormDialogProps) {
  const [form, setForm] = useState<SupplierInput>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof SupplierInput, string>>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      supplier
        ? {
            name: supplier.name,
            document: supplier.document,
            contactName: supplier.contactName,
            phone: supplier.phone,
            email: supplier.email,
            city: supplier.city,
            categories: [...supplier.categories],
            paymentTerms: supplier.paymentTerms,
            leadTimeDays: supplier.leadTimeDays,
            status: supplier.status,
            notes: supplier.notes,
          }
        : emptyForm,
    );
  }, [open, supplier]);

  function setField<K extends keyof SupplierInput>(key: K, value: SupplierInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCategory(category: string) {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((item) => item !== category)
        : [...prev.categories, category],
    }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof SupplierInput, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Informe a razão social ou nome fantasia.";
    if (!form.phone.trim()) nextErrors.phone = "Informe um telefone de contato.";
    if (form.categories.length === 0) nextErrors.categories = "Selecione ao menos uma categoria.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      nextErrors.email = "E-mail inválido.";
    if (!Number.isFinite(form.leadTimeDays) || form.leadTimeDays < 0)
      nextErrors.leadTimeDays = "Prazo inválido.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit({
      ...form,
      name: form.name.trim(),
      document: form.document.trim(),
      contactName: form.contactName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      city: form.city.trim(),
      notes: form.notes.trim(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{supplier ? "Editar fornecedor" : "Novo fornecedor"}</DialogTitle>
          <DialogDescription>
            Contatos, categorias fornecidas e condições comerciais de compra.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="forn-nome">Fornecedor</Label>
              <Input
                id="forn-nome"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Distribuidora Nordeste"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="forn-documento">CNPJ</Label>
              <Input
                id="forn-documento"
                value={form.document}
                onChange={(e) => setField("document", e.target.value)}
                placeholder="00.000.000/0001-00"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="forn-contato">Contato</Label>
              <Input
                id="forn-contato"
                value={form.contactName}
                onChange={(e) => setField("contactName", e.target.value)}
                placeholder="Nome do representante"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="forn-telefone">Telefone</Label>
              <Input
                id="forn-telefone"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="(00) 00000-0000"
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="forn-email">E-mail</Label>
              <Input
                id="forn-email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="comercial@fornecedor.com"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="forn-cidade">Cidade / UF</Label>
              <Input
                id="forn-cidade"
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
                placeholder="Fortaleza / CE"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categorias fornecidas</Label>
            <div className="flex flex-wrap gap-2">
              {supplierCategories.map((category) => {
                const active = form.categories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    aria-pressed={active}
                    className="rounded-full"
                  >
                    <Badge
                      variant={active ? "default" : "outline"}
                      className={cn("cursor-pointer px-3 py-1", !active && "text-muted-foreground")}
                    >
                      {category}
                    </Badge>
                  </button>
                );
              })}
            </div>
            {errors.categories && <p className="text-xs text-destructive">{errors.categories}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="forn-pagamento">Condição de pagamento</Label>
              <Select
                value={form.paymentTerms}
                onValueChange={(value) => setField("paymentTerms", value)}
              >
                <SelectTrigger id="forn-pagamento">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentTermsOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="forn-prazo">Prazo de entrega (dias)</Label>
              <Input
                id="forn-prazo"
                type="number"
                min={0}
                value={form.leadTimeDays}
                onChange={(e) => setField("leadTimeDays", Number(e.target.value))}
              />
              {errors.leadTimeDays && (
                <p className="text-xs text-destructive">{errors.leadTimeDays}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="forn-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setField("status", value as SupplierStatus)}
              >
                <SelectTrigger id="forn-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supplierStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="forn-observacoes">Observações</Label>
            <Textarea
              id="forn-observacoes"
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder="Pedido mínimo, dias de entrega, condições negociadas..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : supplier
                  ? "Salvar alterações"
                  : "Cadastrar fornecedor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}