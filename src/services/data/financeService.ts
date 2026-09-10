import { supabase } from "@/integrations/supabase/client";
import type { FinanceEntry, FinanceStatus, FinanceType } from "@/types/business";
import { currentUserId } from "./session";
import { getSales } from "./salesService";

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

interface FinanceRow {
  id: string;
  description: string;
  type: FinanceType;
  category: string;
  amount: number;
  due_date: string;
  paid_at: string | null;
  status: FinanceStatus;
  method: string;
  counterparty: string;
  notes: string;
  created_at: string;
}

const COLUMNS =
  "id,description,type,category,amount,due_date,paid_at,status,method,counterparty,notes,created_at";

function mapEntry(row: FinanceRow): FinanceEntry {
  return {
    id: row.id,
    description: row.description,
    type: row.type,
    category: row.category ?? "",
    amount: Number(row.amount),
    dueDate: row.due_date,
    paidAt: row.paid_at,
    status: row.status,
    method: row.method ?? "",
    counterparty: row.counterparty ?? "",
    notes: row.notes ?? "",
    createdAt: row.created_at,
  };
}

function toRow(input: FinanceInput) {
  return {
    description: input.description,
    type: input.type,
    category: input.category,
    amount: input.amount,
    due_date: input.dueDate,
    paid_at: input.paidAt,
    status: input.status,
    method: input.method,
    counterparty: input.counterparty,
    notes: input.notes,
  };
}

function isOverdue(entry: FinanceEntry) {
  return entry.status === "Pendente" && new Date(entry.dueDate).getTime() < Date.now();
}

function buildSummary(list: FinanceEntry[], posRevenue: number): FinanceSummary {
  const sum = (predicate: (entry: FinanceEntry) => boolean) =>
    list.filter(predicate).reduce((acc, entry) => acc + entry.amount, 0);

  const received = sum((e) => e.type === "receita" && e.status === "Pago");
  const paid = sum((e) => e.type === "despesa" && e.status === "Pago");

  return {
    received,
    paid,
    toReceive: sum((e) => e.type === "receita" && e.status === "Pendente"),
    toPay: sum((e) => e.type === "despesa" && e.status === "Pendente"),
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
      receitas: inMonth.filter((e) => e.type === "receita").reduce((acc, e) => acc + e.amount, 0),
      despesas: inMonth.filter((e) => e.type === "despesa").reduce((acc, e) => acc + e.amount, 0),
    });
  }
  return months;
}

export async function getFinanceData(): Promise<FinanceData> {
  const userId = await currentUserId();
  const [{ data, error }, sales] = await Promise.all([
    supabase
      .from("finance_entries")
      .select(COLUMNS)
      .eq("user_id", userId)
      .order("due_date", { ascending: true }),
    getSales(),
  ]);
  if (error) throw new Error(error.message);

  const entries = (data ?? []).map((row) => mapEntry(row as FinanceRow));
  const posRevenue = sales
    .filter((sale) => sale.status === "Concluída")
    .reduce((acc, sale) => acc + sale.total, 0);

  return {
    entries,
    summary: buildSummary(entries, posRevenue),
    cashFlow: buildCashFlow(entries),
  };
}

export async function createFinanceEntry(input: FinanceInput): Promise<FinanceEntry> {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("finance_entries")
    .insert({ user_id: userId, ...toRow(input) })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapEntry(data as FinanceRow);
}

export async function updateFinanceEntry(id: string, input: FinanceInput): Promise<FinanceEntry> {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("finance_entries")
    .update(toRow(input))
    .eq("id", id)
    .eq("user_id", userId)
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapEntry(data as FinanceRow);
}

export async function toggleFinanceStatus(id: string): Promise<FinanceEntry> {
  const userId = await currentUserId();
  const { data: current, error: findError } = await supabase
    .from("finance_entries")
    .select(COLUMNS)
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (findError || !current) throw new Error("Lançamento não encontrado.");
  const entry = mapEntry(current as FinanceRow);
  const nextStatus: FinanceStatus = entry.status === "Pago" ? "Pendente" : "Pago";

  const { data, error } = await supabase
    .from("finance_entries")
    .update({
      status: nextStatus,
      paid_at: nextStatus === "Pago" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapEntry(data as FinanceRow);
}

export async function deleteFinanceEntry(id: string): Promise<void> {
  const userId = await currentUserId();
  const { error } = await supabase
    .from("finance_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}
