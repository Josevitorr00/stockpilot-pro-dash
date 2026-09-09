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

export interface ProductRow {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
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
  };
}

export async function getProducts(): Promise<Product[]> {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("products")
    .select("id,name,sku,category,price,cost,stock,min_stock")
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
    })
    .select("id,name,sku,category,price,cost,stock,min_stock")
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
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id,name,sku,category,price,cost,stock,min_stock")
    .single();
  if (error) throw new Error(error.message);
  return mapProduct(data as ProductRow);
}

export async function deleteProduct(id: string): Promise<void> {
  const userId = await currentUserId();
  const { error } = await supabase.from("products").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
