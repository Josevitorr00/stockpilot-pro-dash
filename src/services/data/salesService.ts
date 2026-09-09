import { supabase } from "@/integrations/supabase/client";
import type { PaymentMethod, Product, Sale, SaleItem } from "@/types/business";
import { currentUserId } from "./session";
import { getProducts } from "./productService";
import { registerMovement } from "./stockService";

export const paymentMethods: PaymentMethod[] = ["Dinheiro", "Pix", "Cartão", "Fiado"];

export interface SaleInput {
  customer: string;
  method: PaymentMethod;
  discount: number;
  items: SaleItem[];
}

export interface PosData {
  products: Product[];
  sales: Sale[];
}

interface SaleRow {
  id: string;
  code: string;
  customer: string;
  items: SaleItem[] | null;
  subtotal: number;
  discount: number;
  total: number;
  method: PaymentMethod;
  status: Sale["status"];
  created_at: string;
}

const SALE_COLUMNS = "id,code,customer,items,subtotal,discount,total,method,status,created_at";

function mapSale(row: SaleRow): Sale {
  return {
    id: row.code,
    customer: row.customer,
    items: (row.items ?? []) as SaleItem[],
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    total: Number(row.total),
    method: row.method,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function getSales(): Promise<Sale[]> {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("sales")
    .select(SALE_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapSale(row as unknown as SaleRow));
}

export async function getPosData(): Promise<PosData> {
  const [products, sales] = await Promise.all([getProducts(), getSales()]);
  return { products, sales };
}

async function nextSaleCode(userId: string): Promise<string> {
  const { count, error } = await supabase
    .from("sales")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return `V-${1001 + (count ?? 0)}`;
}

export async function createSale(input: SaleInput): Promise<Sale> {
  if (input.items.length === 0) throw new Error("Adicione ao menos um item ao carrinho.");
  const userId = await currentUserId();

  const products = await getProducts();
  for (const item of input.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Produto ${item.name} não encontrado.`);
    if (product.stock < item.quantity) {
      throw new Error(`Estoque insuficiente para ${product.name} (${product.stock} un.).`);
    }
  }

  const subtotal = input.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = Math.min(Math.max(input.discount, 0), subtotal);
  const code = await nextSaleCode(userId);

  for (const item of input.items) {
    await registerMovement({
      productId: item.productId,
      type: "saida",
      quantity: item.quantity,
      reason: `Venda ${code}`,
    });
  }

  const { data, error } = await supabase
    .from("sales")
    .insert({
      user_id: userId,
      code,
      customer: input.customer.trim() || "Consumidor final",
      items: input.items,
      subtotal,
      discount,
      total: subtotal - discount,
      method: input.method,
      status: "Concluída",
    })
    .select(SALE_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapSale(data as unknown as SaleRow);
}

export async function cancelSale(code: string): Promise<Sale> {
  const userId = await currentUserId();
  const { data: current, error: findError } = await supabase
    .from("sales")
    .select(SALE_COLUMNS)
    .eq("user_id", userId)
    .eq("code", code)
    .single();
  if (findError || !current) throw new Error("Venda não encontrada.");
  const sale = mapSale(current as unknown as SaleRow);
  if (sale.status === "Cancelada") throw new Error("Venda já cancelada.");

  const { data, error } = await supabase
    .from("sales")
    .update({ status: "Cancelada" })
    .eq("user_id", userId)
    .eq("code", code)
    .select(SALE_COLUMNS)
    .single();
  if (error) throw new Error(error.message);

  for (const item of sale.items) {
    if (!item.productId) continue;
    await registerMovement({
      productId: item.productId,
      type: "entrada",
      quantity: item.quantity,
      reason: `Estorno da venda ${code}`,
    }).catch(() => undefined);
  }

  return mapSale(data as unknown as SaleRow);
}
