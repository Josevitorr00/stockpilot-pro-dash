import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — StockPilot" },
      { name: "description", content: "Indicadores, vendas e resumo do seu comércio no StockPilot." },
      { property: "og:title", content: "Dashboard — StockPilot" },
      { property: "og:description", content: "Indicadores, vendas e resumo do seu comércio." },
    ],
  }),
  component: DashboardPage,
});