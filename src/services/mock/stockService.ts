import type { Product, StockMovement, StockMovementType } from "@/types/business";
import { applyStockChange, getProductsSync } from "./productService";

function delay(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function iso(hoursAgo: number) {
  return new Date(Date.now() - hoursAgo * 3600_000).toISOString();
}

let movements: StockMovement[] = [
  { id: "m-1001", productId: "p-347", productName: "Cerveja Lata 350ml", sku: "CER-350", type: "entrada", quantity: 120, resultingStock: 240, reason: "Compra fornecedor Bebidas Sul", createdAt: iso(3) },
  { id: "m-1002", productId: "p-129", productName: "Feijão Carioca 1kg", sku: "FEI-1KG", type: "saida", quantity: 16, resultingStock: 84, reason: "Venda balcão", createdAt: iso(6) },
  { id: "m-1003", productId: "p-102", productName: "Arroz Tipo 1 5kg", sku: "ARZ-5KG", type: "saida", quantity: 12, resultingStock: 4, reason: "Venda balcão", createdAt: iso(22) },
  { id: "m-1004", productId: "p-410", productName: "Papel Higiênico 12un", sku: "PAP-12", type: "ajuste", quantity: 5, resultingStock: 5, reason: "Inventário mensal", createdAt: iso(30) },
  { id: "m-1005", productId: "p-233", productName: "Detergente Neutro", sku: "DET-NEU", type: "entrada", quantity: 24, resultingStock: 9, reason: "Reposição parcial", createdAt: iso(48) },
];

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

export async function getStockOverview(): Promise<StockOverview> {
  await delay();
  return {
    products: getProductsSync(),
    movements: [...movements].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

export async function registerMovement(input: StockMovementInput): Promise<StockMovement> {
  await delay(200);
  const product = getProductsSync().find((item) => item.id === input.productId);
  if (!product) throw new Error("Produto não encontrado.");

  let nextStock = product.stock;
  if (input.type === "entrada") nextStock = product.stock + input.quantity;
  if (input.type === "saida") nextStock = product.stock - input.quantity;
  if (input.type === "ajuste") nextStock = input.quantity;
  if (nextStock < 0) throw new Error("Estoque insuficiente para esta saída.");

  applyStockChange(product.id, nextStock);

  const movement: StockMovement = {
    id: `m-${Math.random().toString(36).slice(2, 8)}`,
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    type: input.type,
    quantity: input.quantity,
    resultingStock: nextStock,
    reason: input.reason.trim() || "Sem observação",
    createdAt: new Date().toISOString(),
  };
  movements = [movement, ...movements];
  return movement;
}
