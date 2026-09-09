import { supabase } from "@/integrations/supabase/client";
import type { Supplier, SupplierStatus } from "@/types/business";
import { currentUserId } from "./session";
import { getProducts, productCategories } from "./productService";

export const supplierStatuses: SupplierStatus[] = ["Ativo", "Inativo"];
export const supplierCategories = [...productCategories];
export const paymentTermsOptions = [
  "À vista",
  "7 dias",
  "14 dias",
  "21 dias",
  "28 dias",
  "30/60 dias",
];

export type SupplierInput = Omit<Supplier, "id" | "createdAt">;

export interface SupplierWithStats extends Supplier {
  stats: {
    products: number;
    lowStock: number;
    stockCost: number;
  };
}

interface SupplierRow {
  id: string;
  name: string;
  document: string;
  contact_name: string;
  phone: string;
  email: string;
  city: string;
  categories: string[] | null;
  payment_terms: string;
  lead_time_days: number;
  status: SupplierStatus;
  notes: string;
  created_at: string;
}

const COLUMNS =
  "id,name,document,contact_name,phone,email,city,categories,payment_terms,lead_time_days,status,notes,created_at";

function mapSupplier(row: SupplierRow): Supplier {
  return {
    id: row.id,
    name: row.name,
    document: row.document ?? "",
    contactName: row.contact_name ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    city: row.city ?? "",
    categories: row.categories ?? [],
    paymentTerms: row.payment_terms ?? "",
    leadTimeDays: Number(row.lead_time_days ?? 0),
    status: row.status,
    notes: row.notes ?? "",
    createdAt: row.created_at,
  };
}

function toRow(input: SupplierInput) {
  return {
    name: input.name,
    document: input.document,
    contact_name: input.contactName,
    phone: input.phone,
    email: input.email,
    city: input.city,
    categories: input.categories,
    payment_terms: input.paymentTerms,
    lead_time_days: input.leadTimeDays,
    status: input.status,
    notes: input.notes,
  };
}

export async function getSuppliers(): Promise<SupplierWithStats[]> {
  const userId = await currentUserId();
  const [{ data, error }, products] = await Promise.all([
    supabase
      .from("suppliers")
      .select(COLUMNS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    getProducts(),
  ]);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const supplier = mapSupplier(row as SupplierRow);
    const related = products.filter((product) => supplier.categories.includes(product.category));
    return {
      ...supplier,
      stats: {
        products: related.length,
        lowStock: related.filter((product) => product.stock <= product.minStock).length,
        stockCost: related.reduce((acc, product) => acc + product.cost * product.stock, 0),
      },
    };
  });
}

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("suppliers")
    .insert({ user_id: userId, ...toRow(input) })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapSupplier(data as SupplierRow);
}

export async function updateSupplier(id: string, input: SupplierInput): Promise<Supplier> {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("suppliers")
    .update(toRow(input))
    .eq("id", id)
    .eq("user_id", userId)
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapSupplier(data as SupplierRow);
}

export async function deleteSupplier(id: string): Promise<void> {
  const userId = await currentUserId();
  const { error } = await supabase.from("suppliers").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
