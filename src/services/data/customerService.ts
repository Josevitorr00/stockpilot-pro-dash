import { supabase } from "@/integrations/supabase/client";
import type { Customer, CustomerStats, Sale } from "@/types/business";
import { currentUserId } from "./session";
import { getSales } from "./salesService";

export type CustomerInput = Omit<Customer, "id" | "createdAt">;

export const customerTypes: Customer["type"][] = ["Pessoa física", "Pessoa jurídica"];

export interface CustomerWithStats extends Customer {
  stats: CustomerStats;
}

interface CustomerRow {
  id: string;
  name: string;
  type: Customer["type"];
  document: string;
  phone: string;
  email: string;
  city: string;
  notes: string;
  created_at: string;
}

const COLUMNS = "id,name,type,document,phone,email,city,notes,created_at";

function mapCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    document: row.document ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    city: row.city ?? "",
    notes: row.notes ?? "",
    createdAt: row.created_at,
  };
}

export function statsForCustomer(name: string, sales: Sale[]): CustomerStats {
  const matched = sales.filter(
    (sale) => sale.status === "Concluída" && sale.customer.toLowerCase() === name.toLowerCase(),
  );
  const revenue = matched.reduce((acc, sale) => acc + sale.total, 0);
  const lastPurchase = matched
    .map((sale) => sale.createdAt)
    .sort()
    .pop();
  return {
    orders: matched.length,
    revenue,
    averageTicket: matched.length ? revenue / matched.length : 0,
    lastPurchase: lastPurchase ?? null,
  };
}

export async function getCustomers(): Promise<CustomerWithStats[]> {
  const userId = await currentUserId();
  const [{ data, error }, sales] = await Promise.all([
    supabase
      .from("customers")
      .select(COLUMNS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    getSales(),
  ]);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const customer = mapCustomer(row as CustomerRow);
    return { ...customer, stats: statsForCustomer(customer.name, sales) };
  });
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("customers")
    .insert({ user_id: userId, ...input })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapCustomer(data as CustomerRow);
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<Customer> {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("customers")
    .update({ ...input })
    .eq("id", id)
    .eq("user_id", userId)
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapCustomer(data as CustomerRow);
}

export async function deleteCustomer(id: string): Promise<void> {
  const userId = await currentUserId();
  const { error } = await supabase.from("customers").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
