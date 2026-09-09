import { supabase } from "@/integrations/supabase/client";
import type { Product, StockMovement, StockMovementType } from "@/types/business";
import { currentUserId } from "./session";
import { getProducts, mapProduct, type ProductRow } from "./productService";

export interface StockMovementInput {
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
}

export interface StockOverview {
  products: Product[];
  movements: StockMovement[];
}

interface MovementRow {
  id: string;
  product_id: string | null;
  product_name: string;
  sku: string;
  type: StockMovementType;
  quantity: number;
  resulting_stock: number;
  reason: string;
  created_at: string;
}

function mapMovement(row: MovementRow): StockMovement {
  return {
    id: row.id,
    productId: row.product_id ?? "",
    productName: row.product_name,
    sku: row.sku,
    type: row.type,
    quantity: Number(row.quantity),
    resultingStock: Number(row.resulting_stock),
    reason: row.reason,
    createdAt: row.created_at,
  };
}

export async function getStockOverview(): Promise<StockOverview> {
  const userId = await currentUserId();
  const [products, movements] = await Promise.all([
    getProducts(),
    supabase
      .from("stock_movements")
      .select("id,product_id,product_name,sku,type,quantity,resulting_stock,reason,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);
  if (movements.error) throw new Error(movements.error.message);
  return {
    products,
    movements: (movements.data ?? []).map((row) => mapMovement(row as MovementRow)),
  };
}

export async function registerMovement(input: StockMovementInput): Promise<StockMovement> {
  const userId = await currentUserId();
  const { data: productRow, error: productError } = await supabase
    .from("products")
    .select("id,name,sku,category,price,cost,stock,min_stock")
    .eq("id", input.productId)
    .eq("user_id", userId)
    .single();
  if (productError || !productRow) throw new Error("Produto não encontrado.");
  const product = mapProduct(productRow as ProductRow);

  let nextStock = product.stock;
  if (input.type === "entrada") nextStock = product.stock + input.quantity;
  if (input.type === "saida") nextStock = product.stock - input.quantity;
  if (input.type === "ajuste") nextStock = input.quantity;
  if (nextStock < 0) throw new Error("Estoque insuficiente para esta saída.");

  const { error: updateError } = await supabase
    .from("products")
    .update({ stock: nextStock })
    .eq("id", product.id)
    .eq("user_id", userId);
  if (updateError) throw new Error(updateError.message);

  const { data, error } = await supabase
    .from("stock_movements")
    .insert({
      user_id: userId,
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,
      type: input.type,
      quantity: input.quantity,
      resulting_stock: nextStock,
      reason: input.reason.trim() || "Sem observação",
    })
    .select("id,product_id,product_name,sku,type,quantity,resulting_stock,reason,created_at")
    .single();
  if (error) throw new Error(error.message);
  return mapMovement(data as MovementRow);
}
