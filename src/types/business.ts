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

export type StockMovementType = "entrada" | "saida" | "ajuste";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: StockMovementType;
  quantity: number;
  resultingStock: number;
  reason: string;
  createdAt: string;
}

export interface CategoryShare {
  category: string;
  revenue: number;
}

export type PaymentMethod = "Dinheiro" | "Pix" | "Cartão" | "Fiado";

export interface SaleItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  customer: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  method: PaymentMethod;
  status: "Concluída" | "Cancelada";
  createdAt: string;
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

export type CustomerType = "Pessoa física" | "Pessoa jurídica";

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  document: string;
  phone: string;
  email: string;
  city: string;
  notes: string;
  createdAt: string;
}

export interface CustomerStats {
  orders: number;
  revenue: number;
  averageTicket: number;
  lastPurchase: string | null;
}

export type SupplierStatus = "Ativo" | "Inativo";

export interface Supplier {
  id: string;
  name: string;
  document: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  categories: string[];
  paymentTerms: string;
  leadTimeDays: number;
  status: SupplierStatus;
  notes: string;
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