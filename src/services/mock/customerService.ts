import type { Customer, CustomerStats } from "@/types/business";
import { getSalesSync } from "./salesService";

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function iso(daysAgo: number) {
  return new Date(Date.now() - daysAgo * 86_400_000).toISOString();
}

let customers: Customer[] = [
  {
    id: "c-001",
    name: "Mercearia do Zé",
    type: "Pessoa jurídica",
    document: "12.345.678/0001-90",
    phone: "(85) 99811-2233",
    email: "contato@merceariadoze.com.br",
    city: "Fortaleza / CE",
    notes: "Compra semanal de bebidas. Pagamento preferencial em cartão.",
    createdAt: iso(210),
  },
  {
    id: "c-002",
    name: "Ana Paula",
    type: "Pessoa física",
    document: "123.456.789-00",
    phone: "(85) 98822-4411",
    email: "ana.paula@email.com",
    city: "Fortaleza / CE",
    notes: "Cliente de balcão, leva itens de higiene.",
    createdAt: iso(140),
  },
  {
    id: "c-003",
    name: "Bar do Chico",
    type: "Pessoa jurídica",
    document: "98.765.432/0001-11",
    phone: "(85) 99700-1050",
    email: "bardochico@email.com",
    city: "Maracanaú / CE",
    notes: "Compra fiado com fechamento mensal.",
    createdAt: iso(95),
  },
  {
    id: "c-004",
    name: "Ricardo Menezes",
    type: "Pessoa física",
    document: "321.654.987-11",
    phone: "(85) 99123-7788",
    email: "ricardo.menezes@email.com",
    city: "Caucaia / CE",
    notes: "",
    createdAt: iso(52),
  },
  {
    id: "c-005",
    name: "Padaria Estrela",
    type: "Pessoa jurídica",
    document: "45.678.912/0001-33",
    phone: "(85) 3245-9090",
    email: "compras@padariaestrela.com",
    city: "Fortaleza / CE",
    notes: "Solicita nota fiscal em todas as compras.",
    createdAt: iso(18),
  },
];

export type CustomerInput = Omit<Customer, "id" | "createdAt">;

export const customerTypes: Customer["type"][] = ["Pessoa física", "Pessoa jurídica"];

export function getCustomerStats(name: string): CustomerStats {
  const sales = getSalesSync().filter(
    (sale) => sale.status === "Concluída" && sale.customer.toLowerCase() === name.toLowerCase(),
  );
  const revenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const lastPurchase = sales
    .map((sale) => sale.createdAt)
    .sort()
    .pop();
  return {
    orders: sales.length,
    revenue,
    averageTicket: sales.length ? revenue / sales.length : 0,
    lastPurchase: lastPurchase ?? null,
  };
}

export interface CustomerWithStats extends Customer {
  stats: CustomerStats;
}

export async function getCustomers(): Promise<CustomerWithStats[]> {
  await delay();
  return customers.map((customer) => ({ ...customer, stats: getCustomerStats(customer.name) }));
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  await delay(200);
  const customer: Customer = {
    ...input,
    id: `c-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  customers = [customer, ...customers];
  return customer;
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<Customer> {
  await delay(200);
  let updated: Customer | undefined;
  customers = customers.map((customer) => {
    if (customer.id !== id) return customer;
    updated = { ...customer, ...input };
    return updated;
  });
  if (!updated) throw new Error("Cliente não encontrado.");
  return updated;
}

export async function deleteCustomer(id: string): Promise<void> {
  await delay(200);
  customers = customers.filter((customer) => customer.id !== id);
}
