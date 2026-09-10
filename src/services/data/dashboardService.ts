import type {
  CategoryShare,
  DashboardData,
  RecentSale,
  Sale,
  SalePoint,
} from "@/types/business";
import { getProducts } from "./productService";
import { getSales } from "./salesService";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function trend(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function dayLabel(date: Date) {
  const label = date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export async function getDashboardData(): Promise<DashboardData> {
  const [products, sales] = await Promise.all([getProducts(), getSales()]);
  const completed = sales.filter((sale) => sale.status === "Concluída");

  const today = startOfDay(new Date());
  const yesterday = today - 86_400_000;

  const salesOn = (dayStart: number) =>
    completed.filter((sale) => {
      const time = startOfDay(new Date(sale.createdAt));
      return time === dayStart;
    });

  const todaySales = salesOn(today);
  const yesterdaySales = salesOn(yesterday);

  const revenueToday = todaySales.reduce((acc, sale) => acc + sale.total, 0);
  const revenueYesterday = yesterdaySales.reduce((acc, sale) => acc + sale.total, 0);

  const lastSevenDays: SalePoint[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const ref = new Date(today - i * 86_400_000);
    const daySales = salesOn(startOfDay(ref));
    lastSevenDays.push({
      date: ref.toISOString().slice(0, 10),
      label: dayLabel(ref),
      revenue: daySales.reduce((acc, sale) => acc + sale.total, 0),
      orders: daySales.length,
    });
  }

  const weekSales = completed.filter(
    (sale) => new Date(sale.createdAt).getTime() >= today - 6 * 86_400_000,
  );
  const weekRevenue = weekSales.reduce((acc, sale) => acc + sale.total, 0);
  const previousWeekSales = completed.filter((sale) => {
    const time = new Date(sale.createdAt).getTime();
    return time >= today - 13 * 86_400_000 && time < today - 6 * 86_400_000;
  });
  const previousWeekRevenue = previousWeekSales.reduce((acc, sale) => acc + sale.total, 0);

  const averageTicket = weekSales.length ? weekRevenue / weekSales.length : 0;
  const previousAverageTicket = previousWeekSales.length
    ? previousWeekRevenue / previousWeekSales.length
    : 0;

  const priceByProduct = new Map(products.map((product) => [product.id, product]));
  const categoryMap = new Map<string, number>();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  for (const sale of completed) {
    if (new Date(sale.createdAt).getTime() < monthStart) continue;
    for (const item of sale.items) {
      const category = priceByProduct.get(item.productId)?.category ?? "Sem categoria";
      categoryMap.set(category, (categoryMap.get(category) ?? 0) + item.price * item.quantity);
    }
  }
  const categoryShare: CategoryShare[] = [...categoryMap.entries()]
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const recentSales: RecentSale[] = sales.slice(0, 6).map((sale: Sale) => ({
    id: sale.id,
    customer: sale.customer,
    total: sale.total,
    items: sale.items.reduce((acc, item) => acc + item.quantity, 0),
    method: sale.method,
    status: sale.status,
    createdAt: sale.createdAt,
  }));

  const stockValue = products.reduce((acc, product) => acc + product.cost * product.stock, 0);

  return {
    metrics: {
      revenueToday,
      revenueTrend: trend(revenueToday, revenueYesterday),
      ordersToday: todaySales.length,
      ordersTrend: trend(todaySales.length, yesterdaySales.length),
      averageTicket,
      averageTicketTrend: trend(averageTicket, previousAverageTicket),
      stockValue,
      stockTrend: 0,
    },
    salesSeries: lastSevenDays,
    categoryShare,
    lowStock: products
      .filter((product) => product.stock <= product.minStock)
      .sort((a, b) => a.stock / Math.max(a.minStock, 1) - b.stock / Math.max(b.minStock, 1))
      .slice(0, 5),
    recentSales,
  };
}
