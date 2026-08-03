import { createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_app/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — StockPilot" },
      { name: "description", content: "Cadastro, catálogo e preços dos produtos do seu comércio." },
      { property: "og:title", content: "Produtos — StockPilot" },
      { property: "og:description", content: "Cadastro, catálogo e preços dos seus produtos." },
    ],
  }),
  component: () => (
    <PagePlaceholder
      icon={Package}
      title="Produtos"
      description="Listagem, cadastro, edição e categorias de produtos."
      step="Conteúdo na etapa 4"
    />
  ),
});