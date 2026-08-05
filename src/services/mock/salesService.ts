import type { PaymentMethod, Sale, SaleItem } from "@/types/business";
import { getProductsSync } from "./productService";
import { registerMovement } from "./stockService";

function delay(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function iso(hoursAgo: number) {
  return new Date(Date.now() - hoursAgo * 3600_000).toISOString();
}

export const paymentMethods: PaymentMethod[] = ["Dinheiro", "Pix", "Cartão", "Fiado"];

let sales: Sale[] = [
  {
    id: "v-2041",
    customer: "Consumidor final",
    items: [
      { productId: "p-129", name: "Feijão Carioca 1kg", sku: "FEI-1KG", price: 8.75, quantity: 4 },
      { productId: "p-341", name: "Refrigerante 2L", sku: "REF-2L", price: 9.99, quantity: 2 },
    ],
    subtotal: 54.98,
    discount: 0,
    total: 54.98,
    method: "Pix",
    status: "Concluída",
    createdAt: iso(2),
  },
  {
    id: "v-2040",
    customer: "Mercearia do Zé",
    items: [
      { productId: "p-347", name: "Cerveja Lata 350ml", sku: "CER-350", price: 4.49, quantity: 24 },
    ],
    subtotal: 107.76,
    discount: 7.76,
    total: 100,
    method: "Cartão",
    status: "Concluída",
    createdAt: iso(5),
  },
  {
    id: "v-2039",
    customer: "Ana Paula",
    items: [
      { productId: "p-410", name: "Papel Higiênico 12un", sku: "PAP-12", price: 24.9, quantity: 1 },
      { productId: "p-418", name: "Sabonete 90g", sku: "SAB-90", price: 2.79, quantity: 6 },
    ],
    subtotal: 41.64,
    discount: 0,
    total: 41.64,
    method: "Dinheiro",
    status: "Concluída",
    createdAt: iso(9),
  },
  {
    id: "v-2038",
    customer: "Bar do Chico",
    items: [
      { productId: "p-352", name: "Suco de Uva 1L", sku: "SUC-UVA", price: 12.4, quantity: 5 },
    ],
    subtotal: 62,
    discount: 0,
    total: 62,
    method: "Fiado",
    status: "Cancelada",
    createdAt: iso(26),
  },
];

export interface SaleInput {
  customer: string;
  method: PaymentMethod;
  discount: number;
  items: SaleItem[];
}

export interface PosData {
  products: ReturnType<typeof getProductsSync>;
  sales: Sale[];
}

export async function getPosData(): Promise<PosData> {
  await delay();
  return {
    products: getProductsSync(),
    sales: [...sales].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

export async function createSale(input: SaleInput): Promise<Sale> {
  if (input.items.length === 0) throw new Error("Adicione ao menos um item ao carrinho.");

  const stock = getProductsSync();
  for (const item of input.items) {
    const product = stock.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Produto ${item.name} não encontrado.`);
    if (product.stock < item.quantity) {
      throw new Error(`Estoque insuficiente para ${product.name} (${product.stock} un.).`);
    }
  }

  const subtotal = input.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = Math.min(Math.max(input.discount, 0), subtotal);

  for (const item of input.items) {
    await registerMovement({
      productId: item.productId,
      type: "saida",
      quantity: item.quantity,
      reason: "Venda PDV",
    });
  }

  const sale: Sale = {
    id: `v-${Math.floor(2042 + Math.random() * 900)}`,
    customer: input.customer.trim() || "Consumidor final",
    items: input.items,
    subtotal,
    discount,
    total: subtotal - discount,
    method: input.method,
    status: "Concluída",
    createdAt: new Date().toISOString(),
  };
  sales = [sale, ...sales];
  return sale;
}

export async function cancelSale(id: string): Promise<Sale> {
  await delay(200);
  let cancelled: Sale | undefined;
  sales = sales.map((sale) => {
    if (sale.id !== id || sale.status === "Cancelada") return sale;
    cancelled = { ...sale, status: "Cancelada" };
    return cancelled;
  });
  if (!cancelled) throw new Error("Venda não encontrada ou já cancelada.");

  for (const item of cancelled.items) {
    await registerMovement({
      productId: item.productId,
      type: "entrada",
      quantity: item.quantity,
      reason: `Estorno da venda ${cancelled.id}`,
    });
  }
  return cancelled;
}
