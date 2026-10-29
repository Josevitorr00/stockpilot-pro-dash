import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/business";
import { currentUserId } from "./session";

export const productCategories = [
  "Mercearia",
  "Bebidas",
  "Limpeza",
  "Higiene",
  "Hortifruti",
  "Padaria",
] as const;

export type ProductInput = Omit<Product, "id">;

export const PRODUCT_COLUMNS = "id,name,sku,category,price,cost,stock,min_stock,cost_per_bale,units_per_bale,stock_tracked";

export interface ProductRow {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  cost_per_bale: number;
  units_per_bale: number;
  stock_tracked: boolean;
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku ?? "",
    category: row.category ?? "",
    price: Number(row.price),
    cost: Number(row.cost),
    stock: Number(row.stock),
    minStock: Number(row.min_stock),
    costPerBale: Number(row.cost_per_bale),
    unitsPerBale: Number(row.units_per_bale),
    stockTracked: row.stock_tracked,
  };
}

export async function getProducts(): Promise<Product[]> {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("user_id", userId)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapProduct(row as ProductRow));
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: userId,
      name: input.name,
      sku: input.sku,
      category: input.category,
      price: input.price,
      cost: input.cost,
      stock: input.stock,
      min_stock: input.minStock,
      cost_per_bale: input.costPerBale,
      units_per_bale: input.unitsPerBale,
      stock_tracked: input.stockTracked,
    })
    .select(PRODUCT_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapProduct(data as ProductRow);
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("products")
    .update({
      name: input.name,
      sku: input.sku,
      category: input.category,
      price: input.price,
      cost: input.cost,
      stock: input.stock,
      min_stock: input.minStock,
      cost_per_bale: input.costPerBale,
      units_per_bale: input.unitsPerBale,
      stock_tracked: input.stockTracked,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select(PRODUCT_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapProduct(data as ProductRow);
}

export async function deleteProduct(id: string): Promise<void> {
  const userId = await currentUserId();
  const { error } = await supabase.from("products").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
