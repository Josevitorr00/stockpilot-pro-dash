import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_app/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — StockPilot" },
      { name: "description", content: "Análises de vendas, estoque e resultados do comércio." },
      { property: "og:title", content: "Relatórios — StockPilot" },
      { property: "og:description", content: "Análises de vendas, estoque e resultados." },
    ],
  }),
  component: () => (
    <PagePlaceholder
      icon={BarChart3}
      title="Relatórios"
      description="Relatórios de vendas, estoque, clientes e desempenho financeiro."
      step="Conteúdo na etapa 10"
    />
  ),
});