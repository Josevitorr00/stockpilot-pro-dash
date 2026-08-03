import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_app/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — StockPilot" },
      { name: "description", content: "Preferências da empresa, usuários e do sistema." },
      { property: "og:title", content: "Configurações — StockPilot" },
      { property: "og:description", content: "Preferências da empresa e do sistema." },
    ],
  }),
  component: () => (
    <PagePlaceholder
      icon={Settings}
      title="Configurações"
      description="Dados da empresa, usuários, permissões e preferências do sistema."
      step="Conteúdo na etapa 11"
    />
  ),
});