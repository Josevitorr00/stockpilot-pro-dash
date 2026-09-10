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
import { customerTypes, type CustomerInput } from "@/services/data/customerService";
import type { Customer, CustomerType } from "@/types/business";

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onSubmit: (values: CustomerInput) => void;
  isPending?: boolean;
}

const emptyForm: CustomerInput = {
  name: "",
  type: "Pessoa física",
  document: "",
  phone: "",
  email: "",
  city: "",
  notes: "",
};

export function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
  onSubmit,
  isPending,
}: CustomerFormDialogProps) {
  const [form, setForm] = useState<CustomerInput>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInput, string>>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      customer
        ? {
            name: customer.name,
            type: customer.type,
            document: customer.document,
            phone: customer.phone,
            email: customer.email,
            city: customer.city,
            notes: customer.notes,
          }
        : emptyForm,
    );
  }, [open, customer]);

  function setField<K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof CustomerInput, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Informe o nome do cliente.";
    if (!form.phone.trim()) nextErrors.phone = "Informe um telefone de contato.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      nextErrors.email = "E-mail inválido.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit({
      ...form,
      name: form.name.trim(),
      document: form.document.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      city: form.city.trim(),
      notes: form.notes.trim(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{customer ? "Editar cliente" : "Novo cliente"}</DialogTitle>
          <DialogDescription>
            Dados de contato usados no PDV e no histórico de compras.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="cliente-nome">Nome</Label>
            <Input
              id="cliente-nome"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Nome do cliente ou empresa"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cliente-tipo">Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(value) => setField("type", value as CustomerType)}
              >
                <SelectTrigger id="cliente-tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customerTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cliente-documento">CPF / CNPJ</Label>
              <Input
                id="cliente-documento"
                value={form.document}
                onChange={(e) => setField("document", e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cliente-telefone">Telefone</Label>
              <Input
                id="cliente-telefone"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="(00) 00000-0000"
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cliente-email">E-mail</Label>
              <Input
                id="cliente-email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="cliente@email.com"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cliente-cidade">Cidade / UF</Label>
            <Input
              id="cliente-cidade"
              value={form.city}
              onChange={(e) => setField("city", e.target.value)}
              placeholder="Fortaleza / CE"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cliente-observacoes">Observações</Label>
            <Textarea
              id="cliente-observacoes"
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder="Preferências de compra, condições combinadas..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : customer ? "Salvar alterações" : "Cadastrar cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
