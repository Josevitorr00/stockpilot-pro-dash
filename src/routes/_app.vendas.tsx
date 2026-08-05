import { createFileRoute } from "@tanstack/react-router";
import { SalesPage } from "@/pages/vendas/SalesPage";

export const Route = createFileRoute("/_app/vendas")({
  head: () => ({
    meta: [
      { title: "Vendas e PDV — StockPilot" },
      {
        name: "description",
        content:
          "Frente de caixa com busca de produtos, carrinho, formas de pagamento e histórico de vendas.",
      },
      { property: "og:title", content: "Vendas e PDV — StockPilot" },
      {
        property: "og:description",
        content: "Registre vendas no balcão e acompanhe o histórico do caixa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SalesPage,
});
