import type { DashboardData, Product, RecentSale, SalePoint } from "@/types/business";

const WEEK_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const salesSeries: SalePoint[] = [
  { date: "2026-07-27", label: WEEK_LABELS[0], revenue: 4280.5, orders: 38 },
  { date: "2026-07-28", label: WEEK_LABELS[1], revenue: 3915.9, orders: 34 },
  { date: "2026-07-29", label: WEEK_LABELS[2], revenue: 5120.4, orders: 46 },
  { date: "2026-07-30", label: WEEK_LABELS[3], revenue: 4680.2, orders: 41 },
  { date: "2026-07-31", label: WEEK_LABELS[4], revenue: 6890.75, orders: 58 },
  { date: "2026-08-01", label: WEEK_LABELS[5], revenue: 7940.3, orders: 66 },
  { date: "2026-08-02", label: WEEK_LABELS[6], revenue: 5210.6, orders: 44 },
];

const lowStock: Product[] = [
  { id: "p-102", name: "Arroz Tipo 1 5kg", sku: "ARZ-5KG", category: "Mercearia", price: 28.9, cost: 21.4, stock: 4, minStock: 20 },
  { id: "p-118", name: "Café Torrado 500g", sku: "CAF-500", category: "Mercearia", price: 19.5, cost: 13.2, stock: 6, minStock: 25 },
  { id: "p-233", name: "Detergente Neutro", sku: "DET-NEU", category: "Limpeza", price: 3.29, cost: 1.85, stock: 9, minStock: 40 },
  { id: "p-341", name: "Refrigerante 2L", sku: "REF-2L", category: "Bebidas", price: 9.99, cost: 6.4, stock: 12, minStock: 30 },
  { id: "p-410", name: "Papel Higiênico 12un", sku: "PAP-12", category: "Higiene", price: 24.9, cost: 17.1, stock: 5, minStock: 18 },
];

const recentSales: RecentSale[] = [
  { id: "V-10432", customer: "Maria Souza", total: 189.4, items: 12, method: "Pix", status: "Concluída", createdAt: "2026-08-03T12:41:00Z" },
  { id: "V-10431", customer: "Consumidor final", total: 42.9, items: 3, method: "Dinheiro", status: "Concluída", createdAt: "2026-08-03T12:15:00Z" },
  { id: "V-10430", customer: "Padaria Bom Pão", total: 1274.0, items: 48, method: "Cartão", status: "Pendente", createdAt: "2026-08-03T11:52:00Z" },
  { id: "V-10429", customer: "João Pereira", total: 96.3, items: 7, method: "Fiado", status: "Pendente", createdAt: "2026-08-03T11:20:00Z" },
  { id: "V-10428", customer: "Ana Lima", total: 318.75, items: 19, method: "Cartão", status: "Concluída", createdAt: "2026-08-03T10:48:00Z" },
  { id: "V-10427", customer: "Mercadinho Central", total: 58.2, items: 4, method: "Pix", status: "Cancelada", createdAt: "2026-08-03T10:05:00Z" },
];

const dashboardData: DashboardData = {
  metrics: {
    revenueToday: 5210.6,
    revenueTrend: -12.4,
    ordersToday: 44,
    ordersTrend: -8.2,
    averageTicket: 118.42,
    averageTicketTrend: 4.6,
    stockValue: 184320.75,
    stockTrend: 2.1,
  },
  salesSeries,
  categoryShare: [
    { category: "Mercearia", revenue: 18240 },
    { category: "Bebidas", revenue: 12480 },
    { category: "Limpeza", revenue: 7360 },
    { category: "Higiene", revenue: 5210 },
    { category: "Hortifruti", revenue: 4180 },
  ],
  lowStock,
  recentSales,
};

export async function getDashboardData(): Promise<DashboardData> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return dashboardData;
}