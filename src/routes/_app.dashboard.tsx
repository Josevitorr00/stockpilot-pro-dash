import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — StockPilot" },
      { name: "description", content: "Indicadores, vendas e resumo do seu comércio no StockPilot." },
      { property: "og:title", content: "Dashboard — StockPilot" },
      { property: "og:description", content: "Indicadores, vendas e resumo do seu comércio." },
    ],
  }),
  component: () => (
    <PagePlaceholder
      icon={LayoutDashboard}
      title="Dashboard"
      description="Cards de indicadores, gráficos de vendas e alertas de estoque aparecem aqui."
      step="Conteúdo na etapa 3"
    />
  ),
});