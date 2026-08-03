export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
}

export interface SalePoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface CategoryShare {
  category: string;
  revenue: number;
}

export interface RecentSale {
  id: string;
  customer: string;
  total: number;
  items: number;
  method: "Dinheiro" | "Pix" | "Cartão" | "Fiado";
  status: "Concluída" | "Pendente" | "Cancelada";
  createdAt: string;
}

export interface DashboardMetrics {
  revenueToday: number;
  revenueTrend: number;
  ordersToday: number;
  ordersTrend: number;
  averageTicket: number;
  averageTicketTrend: number;
  stockValue: number;
  stockTrend: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  salesSeries: SalePoint[];
  categoryShare: CategoryShare[];
  lowStock: Product[];
  recentSales: RecentSale[];
}