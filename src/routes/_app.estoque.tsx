import { createFileRoute } from "@tanstack/react-router";
import { StockPage } from "@/pages/estoque/StockPage";

export const Route = createFileRoute("/_app/estoque")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Estoque — StockPilot" },
      { name: "description", content: "Entradas, saídas, ajustes e alertas de estoque mínimo." },
      { property: "og:title", content: "Estoque — StockPilot" },
      { property: "og:description", content: "Controle de movimentações e níveis de estoque." },
    ],
  }),
  component: StockPage,
});
