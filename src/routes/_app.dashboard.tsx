import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Dashboard — StockPilot" },
      { name: "description", content: "Indicadores, vendas e resumo do seu comércio no StockPilot." },
      { property: "og:title", content: "Dashboard — StockPilot" },
      { property: "og:description", content: "Indicadores, vendas e resumo do seu comércio." },
    ],
  }),
  component: DashboardPage,
});