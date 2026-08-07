import { createFileRoute } from "@tanstack/react-router";
import { SuppliersPage } from "@/pages/fornecedores/SuppliersPage";

export const Route = createFileRoute("/_app/fornecedores")({
  head: () => ({
    meta: [
      { title: "Fornecedores — StockPilot" },
      {
        name: "description",
        content:
          "Cadastro de fornecedores com contatos, categorias fornecidas, prazos de entrega e sugestões de compra.",
      },
      { property: "og:title", content: "Fornecedores — StockPilot" },
      { property: "og:description", content: "Parceiros e condições de compra." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SuppliersPage,
});