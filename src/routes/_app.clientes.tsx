import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_app/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — StockPilot" },
      { name: "description", content: "Base de clientes, contatos e histórico de compras." },
      { property: "og:title", content: "Clientes — StockPilot" },
      { property: "og:description", content: "Base de clientes e histórico de compras." },
    ],
  }),
  component: () => (
    <PagePlaceholder
      icon={Users}
      title="Clientes"
      description="Cadastro de clientes, contatos e histórico de relacionamento."
      step="Conteúdo na etapa 7"
    />
  ),
});