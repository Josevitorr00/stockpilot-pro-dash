import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { DollarSign, Package, Receipt, ShoppingCart } from "lucide-react";
import { getDashboardData } from "@/services/mock/dashboardService";
import { StatCard } from "@/components/dashboard/StatCard";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { LowStockList } from "@/components/dashboard/LowStockList";
import { RecentSalesTable } from "@/components/dashboard/RecentSalesTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/format";

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const { metrics, salesSeries, categoryShare, lowStock, recentSales } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Resumo do seu comércio
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe vendas, estoque e resultados dos últimos 7 dias.
          </p>
        </div>
        <Button asChild>
          <Link to="/vendas">
            <ShoppingCart className="mr-2 size-4" /> Nova venda
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          title="Faturamento hoje"
          value={formatCurrency(metrics.revenueToday)}
          trend={metrics.revenueTrend}
          hint="vs. ontem"
          icon={DollarSign}
        />
        <StatCard
          index={1}
          title="Vendas hoje"
          value={formatNumber(metrics.ordersToday)}
          trend={metrics.ordersTrend}
          hint="vs. ontem"
          icon={ShoppingCart}
        />
        <StatCard
          index={2}
          title="Ticket médio"
          value={formatCurrency(metrics.averageTicket)}
          trend={metrics.averageTicketTrend}
          hint="últimos 7 dias"
          icon={Receipt}
        />
        <StatCard
          index={3}
          title="Valor em estoque"
          value={formatCurrency(metrics.stockValue)}
          trend={metrics.stockTrend}
          hint="vs. mês anterior"
          icon={Package}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Faturamento na semana"
          description="Evolução diária das vendas concluídas."
        >
          <SalesChart data={salesSeries} />
        </SectionCard>
        <SectionCard
          title="Estoque baixo"
          description="Produtos abaixo do mínimo definido."
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/estoque">Ver tudo</Link>
            </Button>
          }
        >
          <LowStockList items={lowStock} />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Faturamento por categoria"
          description="Participação no mês atual."
        >
          <CategoryChart data={categoryShare} />
        </SectionCard>
        <SectionCard
          className="lg:col-span-2"
          title="Vendas recentes"
          description="Últimas movimentações do PDV."
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/vendas">Ver vendas</Link>
            </Button>
          }
        >
          <RecentSalesTable sales={recentSales} />
        </SectionCard>
      </div>
    </div>
  );
}