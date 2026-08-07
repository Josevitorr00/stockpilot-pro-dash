import type { Supplier, SupplierStatus } from "@/types/business";
import { getProductsSync, productCategories } from "./productService";

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function iso(daysAgo: number) {
  return new Date(Date.now() - daysAgo * 86_400_000).toISOString();
}

export const supplierStatuses: SupplierStatus[] = ["Ativo", "Inativo"];
export const supplierCategories = [...productCategories];
export const paymentTermsOptions = ["À vista", "7 dias", "14 dias", "21 dias", "28 dias", "30/60 dias"];

let suppliers: Supplier[] = [
  {
    id: "f-001",
    name: "Distribuidora Nordeste",
    document: "11.222.333/0001-44",
    contactName: "Marcos Lima",
    phone: "(85) 3222-1010",
    email: "vendas@distnordeste.com.br",
    city: "Fortaleza / CE",
    categories: ["Mercearia", "Limpeza"],
    paymentTerms: "28 dias",
    leadTimeDays: 3,
    status: "Ativo",
    notes: "Pedido mínimo de R$ 800. Entrega às terças e sextas.",
    createdAt: iso(320),
  },
  {
    id: "f-002",
    name: "Bebidas Litoral",
    document: "22.333.444/0001-55",
    contactName: "Juliana Rocha",
    phone: "(85) 99655-4020",
    email: "comercial@bebidaslitoral.com",
    city: "Caucaia / CE",
    categories: ["Bebidas"],
    paymentTerms: "14 dias",
    leadTimeDays: 2,
    status: "Ativo",
    notes: "Melhor preço em cerveja e refrigerante por pallet.",
    createdAt: iso(240),
  },
  {
    id: "f-003",
    name: "HigiClean Produtos",
    document: "33.444.555/0001-66",
    contactName: "Renato Alves",
    phone: "(85) 98700-3311",
    email: "renato@higiclean.com.br",
    city: "Maracanaú / CE",
    categories: ["Higiene", "Limpeza"],
    paymentTerms: "30/60 dias",
    leadTimeDays: 5,
    status: "Ativo",
    notes: "",
    createdAt: iso(180),
  },
  {
    id: "f-004",
    name: "Hortifruti Serra Verde",
    document: "44.555.666/0001-77",
    contactName: "Dona Cleide",
    phone: "(85) 99432-8877",
    email: "serraverde@email.com",
    city: "Guaramiranga / CE",
    categories: ["Hortifruti"],
    paymentTerms: "À vista",
    leadTimeDays: 1,
    status: "Ativo",
    notes: "Entrega diária de madrugada. Pagamento no ato.",
    createdAt: iso(120),
  },
  {
    id: "f-005",
    name: "Panificadora Central",
    document: "55.666.777/0001-88",
    contactName: "Sérgio Barros",
    phone: "(85) 3255-7744",
    email: "sergio@panicentral.com",
    city: "Fortaleza / CE",
    categories: ["Padaria"],
    paymentTerms: "7 dias",
    leadTimeDays: 1,
    status: "Inativo",
    notes: "Parceria suspensa por atraso nas entregas.",
    createdAt: iso(60),
  },
];

export type SupplierInput = Omit<Supplier, "id" | "createdAt">;

export interface SupplierWithStats extends Supplier {
  stats: {
    products: number;
    lowStock: number;
    stockCost: number;
  };
}

function statsFor(supplier: Supplier) {
  const products = getProductsSync().filter((product) =>
    supplier.categories.includes(product.category),
  );
  return {
    products: products.length,
    lowStock: products.filter((product) => product.stock <= product.minStock).length,
    stockCost: products.reduce((acc, product) => acc + product.cost * product.stock, 0),
  };
}

export async function getSuppliers(): Promise<SupplierWithStats[]> {
  await delay();
  return suppliers.map((supplier) => ({ ...supplier, stats: statsFor(supplier) }));
}

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  await delay(200);
  const supplier: Supplier = {
    ...input,
    id: `f-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  suppliers = [supplier, ...suppliers];
  return supplier;
}

export async function updateSupplier(id: string, input: SupplierInput): Promise<Supplier> {
  await delay(200);
  let updated: Supplier | undefined;
  suppliers = suppliers.map((supplier) => {
    if (supplier.id !== id) return supplier;
    updated = { ...supplier, ...input };
    return updated;
  });
  if (!updated) throw new Error("Fornecedor não encontrado.");
  return updated;
}

export async function deleteSupplier(id: string): Promise<void> {
  await delay(200);
  suppliers = suppliers.filter((supplier) => supplier.id !== id);
}