import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/pages/configuracoes/SettingsPage";

export const Route = createFileRoute("/_app/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — StockPilot" },
      { name: "description", content: "Perfil, dados da empresa e preferências do sistema." },
      { property: "og:title", content: "Configurações — StockPilot" },
      { property: "og:description", content: "Perfil, dados da empresa e preferências do sistema." },
    ],
  }),
  component: SettingsPage,
});
