import { createFileRoute } from "@tanstack/react-router";
import { ProductsPage } from "@/pages/produtos/ProductsPage";

export const Route = createFileRoute("/_app/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — StockPilot" },
      { name: "description", content: "Cadastro, catálogo e preços dos produtos do seu comércio." },
      { property: "og:title", content: "Produtos — StockPilot" },
      { property: "og:description", content: "Cadastro, catálogo e preços dos seus produtos." },
    ],
  }),
  component: ProductsPage,
});