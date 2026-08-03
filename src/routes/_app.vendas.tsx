import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_app/vendas")({
  head: () => ({
    meta: [
      { title: "Vendas e PDV — StockPilot" },
      { name: "description", content: "Frente de caixa, carrinho e histórico de vendas." },
      { property: "og:title", content: "Vendas e PDV — StockPilot" },
      { property: "og:description", content: "Frente de caixa e histórico de vendas." },
    ],
  }),
  component: () => (
    <PagePlaceholder
      icon={ShoppingCart}
      title="Vendas / PDV"
      description="Ponto de venda com busca de produtos, carrinho e finalização."
      step="Conteúdo na etapa 6"
    />
  ),
});