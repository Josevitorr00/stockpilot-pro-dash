import type { FinanceEntry, FinanceStatus, FinanceType } from "@/types/business";
import { getSalesSync } from "./salesService";

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function iso(daysFromNow: number) {
  return new Date(Date.now() + daysFromNow * 86_400_000).toISOString();
}

export const financeTypes: FinanceType[] = ["receita", "despesa"];
export const financeStatuses: FinanceStatus[] = ["Pago", "Pendente"];
export const financeMethods = ["Dinheiro", "Pix", "Cartão", "Boleto", "Transferência"];
export const revenueCategories = ["Vendas", "Serviços", "Outras receitas"];
export const expenseCategories = [
  "Fornecedores",
  "Aluguel",
  "Salários",
  "Energia",
  "Impostos",
  "Manutenção",
  "Outras despesas",
];
export const financeCategories = [...revenueCategories, ...expenseCategories];

let entries: FinanceEntry[] = [
  {
    id: "fin-001",
    description: "Compra de mercearia — Distribuidora Nordeste",
    type: "despesa",
    category: "Fornecedores",
    amount: 4820.5,
    dueDate: iso(4),
    paidAt: null,
    status: "Pendente",
    method: "Boleto",
    counterparty: "Distribuidora Nordeste",
    notes: "Pedido quinzenal.",
    createdAt: iso(-10),
  },
  {
    id: "fin-002",
    description: "Aluguel da loja",
    type: "despesa",
    category: "Aluguel",
    amount: 3200,
    dueDate: iso(-2),
    paidAt: null,
    status: "Pendente",
    method: "Transferência",
    counterparty: "Imobiliária Centro",
    notes: "",
    createdAt: iso(-20),
  },
  {
    id: "fin-003",
    description: "Energia elétrica",
    type: "despesa",
    category: "Energia",
    amount: 942.3,
    dueDate: iso(-6),
    paidAt: iso(-6),
    status: "Pago",
    method: "Pix",
    counterparty: "Enel",
    notes: "",
    createdAt: iso(-25),
  },
  {
    id: "fin-004",
    description: "Folha de pagamento",
    type: "despesa",
    category: "Salários",
    amount: 7600,
    dueDate: iso(9),
    paidAt: null,
    status: "Pendente",
    method: "Transferência",
    counterparty: "Equipe StockPilot",
    notes: "3 colaboradores.",
    createdAt: iso(-8),
  },
  {
    id: "fin-005",
    description: "Recebimento fiado — Mercadinho da Ponte",
    type: "receita",
    category: "Vendas",
    amount: 1580,
    dueDate: iso(3),
    paidAt: null,
    status: "Pendente",
    method: "Pix",
    counterparty: "Mercadinho da Ponte",
    notes: "Parcela 1 de 2.",
    createdAt: iso(-5),
  },
  {
    id: "fin-006",
    description: "Serviço de entrega terceirizada",
    type: "receita",
    category: "Serviços",
    amount: 640,
    dueDate: iso(-1),
    paidAt: iso(-1),
    status: "Pago",
    method: "Dinheiro",
    counterparty: "Padaria Bom Dia",
    notes: "",
    createdAt: iso(-12),
  },
  {
    id: "fin-007",
    description: "Impostos do mês (Simples Nacional)",
    type: "despesa",
    category: "Impostos",
    amount: 1890.75,
    dueDate: iso(12),
    paidAt: null,
    status: "Pendente",
    method: "Boleto",
    counterparty: "Receita Federal",
    notes: "",
    createdAt: iso(-3),
  },
];

export type FinanceInput = Omit<FinanceEntry, "id" | "createdAt">;

export interface FinanceSummary {
  received: number;
  paid: number;
  toReceive: number;
  toPay: number;
  balance: number;
  overdue: number;
  posRevenue: number;
}

export interface CashFlowPoint {
  label: string;
  receitas: number;
  despesas: number;
}

export interface FinanceData {
  entries: FinanceEntry[];
  summary: FinanceSummary;
  cashFlow: CashFlowPoint[];
}

function isOverdue(entry: FinanceEntry) {
  return entry.status === "Pendente" && new Date(entry.dueDate).getTime() < Date.now();
}

function buildSummary(list: FinanceEntry[]): FinanceSummary {
  const sum = (predicate: (entry: FinanceEntry) => boolean) =>
    list.filter(predicate).reduce((acc, entry) => acc + entry.amount, 0);

  const received = sum((e) => e.type === "receita" && e.status === "Pago");
  const paid = sum((e) => e.type === "despesa" && e.status === "Pago");
  const toReceive = sum((e) => e.type === "receita" && e.status === "Pendente");
  const toPay = sum((e) => e.type === "despesa" && e.status === "Pendente");
  const posRevenue = getSalesSync()
    .filter((sale) => sale.status === "Concluída")
    .reduce((acc, sale) => acc + sale.total, 0);

  return {
    received,
    paid,
    toReceive,
    toPay,
    balance: received + posRevenue - paid,
    overdue: list.filter(isOverdue).reduce((acc, entry) => acc + entry.amount, 0),
    posRevenue,
  };
}

function buildCashFlow(list: FinanceEntry[]): CashFlowPoint[] {
  const months: CashFlowPoint[] = [];
  const now = new Date();
  for (let i = 3; i >= -1; i -= 1) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = ref.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    const inMonth = list.filter((entry) => {
      const due = new Date(entry.dueDate);
      return due.getMonth() === ref.getMonth() && due.getFullYear() === ref.getFullYear();
    });
    months.push({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      receitas: inMonth
        .filter((e) => e.type === "receita")
        .reduce((acc, e) => acc + e.amount, 0),
      despesas: inMonth
        .filter((e) => e.type === "despesa")
        .reduce((acc, e) => acc + e.amount, 0),
    });
  }
  return months;
}

function sorted(list: FinanceEntry[]) {
  return [...list].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export async function getFinanceData(): Promise<FinanceData> {
  await delay();
  const list = sorted(entries);
  return { entries: list, summary: buildSummary(list), cashFlow: buildCashFlow(list) };
}

export async function createFinanceEntry(input: FinanceInput): Promise<FinanceEntry> {
  await delay(200);
  const entry: FinanceEntry = {
    ...input,
    id: `fin-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  entries = [entry, ...entries];
  return entry;
}

export async function updateFinanceEntry(id: string, input: FinanceInput): Promise<FinanceEntry> {
  await delay(200);
  let updated: FinanceEntry | undefined;
  entries = entries.map((entry) => {
    if (entry.id !== id) return entry;
    updated = { ...entry, ...input };
    return updated;
  });
  if (!updated) throw new Error("Lançamento não encontrado.");
  return updated;
}

export async function toggleFinanceStatus(id: string): Promise<FinanceEntry> {
  await delay(150);
  let updated: FinanceEntry | undefined;
  entries = entries.map((entry) => {
    if (entry.id !== id) return entry;
    const nextStatus: FinanceStatus = entry.status === "Pago" ? "Pendente" : "Pago";
    updated = {
      ...entry,
      status: nextStatus,
      paidAt: nextStatus === "Pago" ? new Date().toISOString() : null,
    };
    return updated;
  });
  if (!updated) throw new Error("Lançamento não encontrado.");
  return updated;
}

export async function deleteFinanceEntry(id: string): Promise<void> {
  await delay(200);
  entries = entries.filter((entry) => entry.id !== id);
}