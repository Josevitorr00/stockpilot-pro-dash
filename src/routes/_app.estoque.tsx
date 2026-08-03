import { createFileRoute } from "@tanstack/react-router";
import { Boxes } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_app/estoque")({
  head: () => ({
    meta: [
      { title: "Estoque — StockPilot" },
      { name: "description", content: "Entradas, saídas e níveis de estoque em tempo real." },
      { property: "og:title", content: "Estoque — StockPilot" },
      { property: "og:description", content: "Entradas, saídas e níveis de estoque." },
    ],
  }),
  component: () => (
    <PagePlaceholder
      icon={Boxes}
      title="Estoque"
      description="Movimentações, ajustes e alertas de estoque mínimo."
      step="Conteúdo na etapa 5"
    />
  ),
});