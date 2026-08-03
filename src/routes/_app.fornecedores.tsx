import { createFileRoute } from "@tanstack/react-router";
import { Truck } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_app/fornecedores")({
  head: () => ({
    meta: [
      { title: "Fornecedores — StockPilot" },
      { name: "description", content: "Parceiros, contatos e condições de compra." },
      { property: "og:title", content: "Fornecedores — StockPilot" },
      { property: "og:description", content: "Parceiros e condições de compra." },
    ],
  }),
  component: () => (
    <PagePlaceholder
      icon={Truck}
      title="Fornecedores"
      description="Cadastro de fornecedores, produtos fornecidos e contatos."
      step="Conteúdo na etapa 8"
    />
  ),
});